from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError

from apps.users.serializers import UserProfileSerializer
from apps.jobs_postings.serializers import JobPostingSerializer
from .models import JobApplication, JobApplicationDocument, JobApplicationActivity


class Base64DocumentField(serializers.Field):
    """
    Custom field for handling base64-encoded documents
    """
    def to_representation(self, value):
        return None  # We don't return the base64 data when serializing
    
    def to_internal_value(self, data):
        # Check if it's a list (for many=True) or a single item
        if isinstance(data, list):
            # Process each document in the list
            return [self._validate_document(item) for item in data]
        else:
            # Process a single document
            return self._validate_document(data)
            
    def _validate_document(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Invalid format. Expected a dictionary with document data.")
        
        required_keys = ['name', 'document_data', 'document_type']
        for key in required_keys:
            if key not in data:
                raise serializers.ValidationError(f"Missing required field: {key}")
        
        allowed_types = [choice[0] for choice in JobApplicationDocument.DOCUMENT_TYPES]
        if data['document_type'] not in allowed_types:
            raise serializers.ValidationError(
                f"Invalid document type. Must be one of: {', '.join(allowed_types)}"
            )
        
        return data


class JobApplicationDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for job application documents
    """
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplicationDocument
        fields = ['id', 'document_type', 'name', 'size', 'uploaded_at', 'download_url']
        read_only_fields = ['id', 'size', 'uploaded_at']
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class JobApplicationActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for job application activities (audit log)
    """
    performed_by = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplicationActivity
        fields = [
            'id', 'activity_type', 'description', 
            'previous_status', 'new_status', 
            'performed_by', 'timestamp'
        ]
        read_only_fields = fields
    
    def get_performed_by(self, obj):
        if obj.performed_by:
            return {
                'id': obj.performed_by.id,
                'email': obj.performed_by.email,
                'name': f"{obj.performed_by.first_name} {obj.performed_by.last_name}".strip(),
                'role': obj.performed_by.role
            }
        return None


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating job applications
    """
    documents = Base64DocumentField(required=False, write_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'job', 'cover_letter', 'answers', 'documents'
        ]
    
    def validate_job(self, job):
        """Ensure the job is active and open for applications."""
        if job.status != 'active':
            raise serializers.ValidationError("This job is not actively accepting applications.")
        
        if job.expiry_date and job.expiry_date < timezone.now():
            raise serializers.ValidationError("This job posting has expired.")
        
        return job
    
    @transaction.atomic
    def create(self, validated_data):
        """Create a job application with attached documents."""
        documents_data = validated_data.pop('documents', [])
        request = self.context.get('request')
        
        # Set the applicant to the current user
        validated_data['applicant'] = request.user
        
        # Create the job application
        job_application = super().create(validated_data)
        
        # Process documents if provided
        if documents_data:
            # Ensure documents_data is a list
            if not isinstance(documents_data, list):
                documents_data = [documents_data]
                
            for doc_data in documents_data:
                try:
                    JobApplicationDocument.from_base64(
                        application=job_application,
                        base64_data=doc_data['document_data'],
                        name=doc_data['name'],
                        document_type=doc_data['document_type']
                    )
                except Exception as e:
                    # Log error but continue with other documents
                    import logging
                    logging.error(f"Error processing document: {str(e)}")
        
        # Create an activity record
        JobApplicationActivity.objects.create(
            application=job_application,
            performed_by=request.user,
            activity_type='application_submitted',
            description='Application submitted',
            new_status='submitted'
        )
        
        return job_application


class JobApplicationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving job application details
    """
    applicant = UserProfileSerializer(read_only=True)
    job = JobPostingSerializer(read_only=True)
    documents = JobApplicationDocumentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_since_submission = serializers.IntegerField(read_only=True)
    activities = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'applicant', 'cover_letter', 'answers',
            'status', 'status_display', 'created_at', 'updated_at',
            'withdrawn_at', 'days_since_submission', 'documents',
            'feedback', 'activities', 'is_active'
        ]
        read_only_fields = [
            'id', 'job', 'applicant', 'created_at', 'updated_at',
            'withdrawn_at', 'days_since_submission', 'is_active'
        ]
    
    def get_activities(self, obj):
        """Get activities if the user is authorized to see them."""
        request = self.context.get('request')
        user = request.user if request else None
        
        # Only show activities to recruiters and the applicant
        if not user or (user != obj.applicant and user != obj.job.recruiter):
            return []
        
        # For applicants, filter out internal activities
        if user == obj.applicant:
            activities = obj.activities.exclude(
                activity_type__startswith='internal_'
            )
        else:
            activities = obj.activities.all()
        
        return JobApplicationActivitySerializer(activities, many=True).data


class JobApplicationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating job application status (recruiter side)
    """
    internal_notes = serializers.CharField(required=False, allow_blank=True)
    feedback = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = JobApplication
        fields = ['status', 'internal_notes', 'feedback']
    
    def validate_status(self, status):
        """Validate the status transition."""
        current_status = self.instance.status
        
        # Prevent changing status if application is withdrawn or rejected
        if current_status in ['withdrawn', 'rejected'] and status != current_status:
            raise serializers.ValidationError(
                f"Cannot change status of an application that has been {current_status}."
            )
        
        # Prevent directly moving to 'hired' without going through 'offer_extended'
        if status == 'hired' and current_status != 'offer_extended':
            raise serializers.ValidationError(
                "An offer must be extended before marking as hired."
            )
        
        return status
    
    @transaction.atomic
    def update(self, instance, validated_data):
        """Update the job application and record the activity."""
        previous_status = instance.status
        new_status = validated_data.get('status', previous_status)
        request = self.context.get('request')
        
        # Update the instance
        updated_instance = super().update(instance, validated_data)
        
        # Record the activity if status changed
        if previous_status != new_status:
            activity_type = f'status_changed_to_{new_status}'
            description = f'Status changed from {instance.get_status_display()} to {updated_instance.get_status_display()}'
            
            JobApplicationActivity.objects.create(
                application=updated_instance,
                performed_by=request.user if request else None,
                activity_type=activity_type,
                description=description,
                previous_status=previous_status,
                new_status=new_status
            )
        
        # Record feedback activity if provided
        if 'feedback' in validated_data and validated_data['feedback']:
            JobApplicationActivity.objects.create(
                application=updated_instance,
                performed_by=request.user if request else None,
                activity_type='feedback_provided',
                description='Feedback provided to the applicant'
            )
        
        return updated_instance


class JobApplicationListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing job applications (both for applicants and recruiters)
    """
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.SerializerMethodField()
    applicant_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_since_submission = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'company_name',
            'applicant', 'applicant_name', 'status', 'status_display',
            'created_at', 'updated_at', 'days_since_submission',
            'is_active'
        ]
        read_only_fields = fields
    
    def get_company_name(self, obj):
        return obj.job.recruiter.company_name if hasattr(obj.job.recruiter, 'company_name') else "Company"
    
    def get_applicant_name(self, obj):
        if obj.applicant.first_name or obj.applicant.last_name:
            return f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()
        return obj.applicant.email


class JobApplicationWithdrawSerializer(serializers.ModelSerializer):
    """
    Serializer for withdrawing a job application
    """
    class Meta:
        model = JobApplication
        fields = ['id']
        read_only_fields = ['id']
    
    @transaction.atomic
    def update(self, instance, validated_data):
        """Withdraw the application."""
        if instance.status == 'withdrawn':
            raise serializers.ValidationError("This application has already been withdrawn.")
        
        # Call the withdraw method
        instance.withdraw()
        
        # Record the activity
        request = self.context.get('request')
        JobApplicationActivity.objects.create(
            application=instance,
            performed_by=request.user if request else None,
            activity_type='application_withdrawn',
            description='Application withdrawn by applicant',
            previous_status=instance.status,
            new_status='withdrawn'
        )
        
        return instance
