from rest_framework import serializers
from apps.jobs_postings.models import JobPosting
from apps.users.models import User
from .models import SavedSearch, JobSearchQuery

class JobSearchSerializer(serializers.ModelSerializer):
    """
    Serializer for job search results
    Includes additional calculated fields like distance and relevance score
    """
    company_name = serializers.SerializerMethodField()
    is_recent = serializers.SerializerMethodField()
    days_ago = serializers.SerializerMethodField()
    salary_range = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'aircraft_type', 'location', 'job_type', 
            'experience_level', 'is_remote', 'salary_min', 'salary_max',
            'is_urgent', 'created_at', 'expiry_date', 'company_name',
            'is_recent', 'days_ago', 'salary_range', 'department',
            'total_flying_hours_required'
        ]
    
    def get_company_name(self, obj):
        return obj.recruiter.company_name if hasattr(obj.recruiter, 'company_name') else "Company"
    
    def get_is_recent(self, obj):
        from django.utils import timezone
        import datetime
        return (timezone.now() - obj.created_at).days < 3
    
    def get_days_ago(self, obj):
        from django.utils import timezone
        import datetime
        delta = timezone.now() - obj.created_at
        if delta.days == 0:
            hours = delta.seconds // 3600
            if hours == 0:
                return "Just now"
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
    
    def get_salary_range(self, obj):
        if obj.salary_min and obj.salary_max:
            return f"${int(obj.salary_min):,} - ${int(obj.salary_max):,}"
        elif obj.salary_min:
            return f"From ${int(obj.salary_min):,}"
        elif obj.salary_max:
            return f"Up to ${int(obj.salary_max):,}"
        return "Salary not specified"


class JobDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed job view
    """
    company_name = serializers.SerializerMethodField()
    company_website = serializers.SerializerMethodField()
    recruiter_name = serializers.SerializerMethodField()
    days_ago = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    salary_range = serializers.SerializerMethodField()
    
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
            'medical_certification_required', 'company_name', 'company_website',
            'recruiter_name', 'days_ago', 'days_until_expiry', 'salary_range'
        ]
    
    def get_company_name(self, obj):
        return obj.recruiter.company_name if hasattr(obj.recruiter, 'company_name') else "Company"
    
    def get_company_website(self, obj):
        return obj.recruiter.company_website if hasattr(obj.recruiter, 'company_website') else None
    
    def get_recruiter_name(self, obj):
        return f"{obj.recruiter.first_name} {obj.recruiter.last_name}" if obj.recruiter else "Recruiter"
    
    def get_days_ago(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        return delta.days
    
    def get_days_until_expiry(self, obj):
        from django.utils import timezone
        if not obj.expiry_date:
            return None
        delta = obj.expiry_date - timezone.now()
        return delta.days if delta.days > 0 else 0
    
    def get_salary_range(self, obj):
        if obj.salary_min and obj.salary_max:
            return f"${int(obj.salary_min):,} - ${int(obj.salary_max):,}"
        elif obj.salary_min:
            return f"From ${int(obj.salary_min):,}"
        elif obj.salary_max:
            return f"Up to ${int(obj.salary_max):,}"
        return "Salary not specified"


class SavedSearchSerializer(serializers.ModelSerializer):
    """
    Serializer for saved searches
    """
    class Meta:
        model = SavedSearch
        fields = [
            'id', 'name', 'query', 'location', 'department', 'job_type',
            'experience_level', 'aircraft_type', 'is_remote', 'min_salary',
            'notify_by_email', 'notify_frequency', 'created_at', 'last_notification_sent'
        ]
        read_only_fields = ['created_at', 'last_notification_sent']
    
    def create(self, validated_data):
        # Associate the search with the current user
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class SearchQuerySerializer(serializers.ModelSerializer):
    """
    Serializer for tracking search queries
    """
    class Meta:
        model = JobSearchQuery
        fields = ['id', 'query_text', 'timestamp', 'results_count', 'filters_used']
        read_only_fields = ['timestamp']
