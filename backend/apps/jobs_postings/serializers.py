from rest_framework import serializers
from .models import JobPosting, JobAttachment, JobTrack
from apps.users.models import User
import base64
from django.core.files.base import ContentFile


class Base64FileField(serializers.Field):
    """
    Custom serializer field for handling base64-encoded files
    """
    def to_representation(self, value):
        return value.url if value else None
    
    def to_internal_value(self, data):
        # This is used when uploading a file (POST/PUT requests)
        if not isinstance(data, dict):
            raise serializers.ValidationError("Wrong format. Expected a dictionary with file data.")
        
        required_keys = ['file_name', 'file_data', 'content_type']
        for key in required_keys:
            if key not in data:
                raise serializers.ValidationError(f"Missing required field: {key}")
        return data

class JobTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTrack
        fields = ['id', 'job', 'user', 'viewed_at']
        read_only_fields = ['id', 'viewed_at']

class JobAttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for job attachments
    """
    file = serializers.FileField(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JobAttachment
        fields = ['id', 'file', 'file_url', 'file_name', 'file_size', 'content_type', 'created_at']
        read_only_fields = ['file_size', 'created_at']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class RecruiterSerializer(serializers.ModelSerializer):
    """Serializer for the recruiter's basic information in a job posting."""
    company_name = serializers.CharField()
    company_website = serializers.CharField(source='recruiter_profile.company_website', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'company_name', 'company_website']


class JobPostingSerializer(serializers.ModelSerializer):
    """Serializer for job posting CRUD operations."""
    recruiter_details = RecruiterSerializer(source='recruiter', read_only=True)
    attachments = JobAttachmentSerializer(many=True, read_only=True)
    attachment_uploads = serializers.ListField(
        child=Base64FileField(),
        required=False,
        write_only=True
    )
    num_applicants = serializers.SerializerMethodField()
    num_views = serializers.SerializerMethodField()
    shortlisted_applicants = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'aircraft_type', 'description', 'responsibilities',
            'qualifications', 'department', 'experience_level', 'location',
            'is_remote', 'job_type', 'salary_min', 'salary_max', 'benefits',
            'contact_email', 'application_url', 'status', 'visibility',
            'is_urgent', 'created_at', 'updated_at', 'expiry_date',
            'expected_start_date', 'license_requirements',
            'total_flying_hours_required', 'specific_aircraft_hours_required',
            'medical_certification_required', 'recruiter', 'recruiter_details',
            'attachments', 'attachment_uploads',
            'num_applicants', 'num_views', 'shortlisted_applicants'
        ]
        read_only_fields = ['recruiter', 'created_at', 'updated_at']
    def get_num_applicants(self, obj):
        return obj.applications.count()

    def get_num_views(self, obj):
        return obj.views.count() if hasattr(obj, 'views') else 0

    def get_shortlisted_applicants(self, obj):
        # Get applications with status 'shortlisted', order by a score (if available)
        applications = obj.applications.filter(status='shortlisted')
        # Example: sort by a 'profile_score' field if it exists, else by created_at
        if applications and hasattr(applications.first(), 'profile_score'):
            applications = applications.order_by('-profile_score')
        else:
            applications = applications.order_by('-created_at')
        # Return top 5 shortlisted applicants (customize as needed)
        return [
            {
                'id': app.applicant.id,
                'name': f"{app.applicant.first_name} {app.applicant.last_name}".strip(),
                'email': app.applicant.email,
                'profile_score': getattr(app, 'profile_score', None),
                'status': app.status
            }
            for app in applications[:5]
        ]
    
    def create(self, validated_data):
        """Set the recruiter from the authenticated user and handle file attachments."""
        attachment_uploads = validated_data.pop('attachment_uploads', [])
        
        # Set the recruiter
        validated_data['recruiter'] = self.context['request'].user
        
        # Create the job posting
        job_posting = super().create(validated_data)
        
        # Process attachments
        for attachment_data in attachment_uploads:
            try:
                JobAttachment.from_base64(
                    job_posting=job_posting,
                    base64_data=attachment_data['file_data'],
                    file_name=attachment_data['file_name'],
                    content_type=attachment_data['content_type']
                )
            except Exception as e:
                # Log error but continue with other files
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error processing attachment: {str(e)}")
        
        return job_posting
        
    def update(self, instance, validated_data):
        """Handle file attachments during update."""
        attachment_uploads = validated_data.pop('attachment_uploads', [])
        
        # Update the job posting
        job_posting = super().update(instance, validated_data)
        
        # Process new attachments
        for attachment_data in attachment_uploads:
            try:
                JobAttachment.from_base64(
                    job_posting=job_posting,
                    base64_data=attachment_data['file_data'],
                    file_name=attachment_data['file_name'],
                    content_type=attachment_data['content_type']
                )
            except Exception as e:
                # Log error but continue with other files
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error processing attachment: {str(e)}")
        
        return job_posting


class Base64FileField(serializers.Field):
    """Custom field for handling base64-encoded file uploads."""
    
    def to_representation(self, value):
        return None  # We don't convert files back to base64 in responses
    
    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Invalid format for file upload")
        
        required_keys = ['file_data', 'file_name', 'content_type']
        for key in required_keys:
            if key not in data:
                raise serializers.ValidationError(f"Missing required field: {key}")
        
        return {
            'file_data': data['file_data'],
            'file_name': data['file_name'],
            'content_type': data['content_type']
        }


class JobAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for job attachments."""
    
    class Meta:
        model = JobAttachment
        fields = ['id', 'file', 'file_name', 'file_size', 'content_type', 'created_at']
        read_only_fields = ['id', 'file_size', 'created_at']


class JobAttachmentCreateSerializer(serializers.Serializer):
    """Serializer for creating job attachments from base64 data."""
    file_data = serializers.CharField(required=True)
    file_name = serializers.CharField(required=True)
    content_type = serializers.CharField(required=True)


class JobPostingListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for job posting list endpoints
    to reduce payload size when listing multiple jobs.
    """
    recruiter_name = serializers.CharField(source='recruiter.company_name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'aircraft_type', 'location', 'is_remote',
            'job_type', 'department', 'experience_level', 'is_urgent',
            'created_at', 'expiry_date', 'expected_start_date', 'status',
            'recruiter_name', 'is_active', 'visibility'
        ]
