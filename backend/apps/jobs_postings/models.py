from django.db import models
from django.utils import timezone
from django.core.files.base import ContentFile
import base64
import uuid
import os
from apps.users.models import User


class JobPosting(models.Model):
    """
    Model for job postings created by recruiters.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('expired', 'Expired'),
    ]
    
    EXPERIENCE_LEVEL_CHOICES = [
        ('entry', '0-2 years: Entry Level'),
        ('mid', '3-5 years: Mid Level'),
        ('senior', '6-10 years: Senior Level'),
        ('executive', '10+ years: Executive Level'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Public - Visible to everyone'),
        ('verified', 'Verified Professionals Only'),
        ('private', 'Private - By invitation only'),
    ]
    
    SCREENING_QUESTION_CHOICES = [
        ('yes_no', 'Yes/No Question'),
        ('upload_certs', 'Upload Certificates'),
        ('availability', 'Availability Check'),
    ]
    
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=255)
    aircraft_type = models.CharField(max_length=100)
    description = models.TextField()
    responsibilities = models.TextField(default="Key responsibilities for this position", help_text="Key responsibilities for this position")
    qualifications = models.TextField()
    
    # Department and Experience
    department = models.CharField(max_length=100, blank=True, null=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='entry')
    
    # Location and work type
    location = models.CharField(max_length=255)
    is_remote = models.BooleanField(default=False, help_text="Is this position remote?")
    
    job_type = models.CharField(max_length=50, choices=[
        ('full-time', 'Full-Time'),
        ('part-time', 'Part-Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary')
    ])
    
    # Salary and benefits
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    benefits = models.TextField(blank=True, null=True, help_text="Benefits offered with this position")
    
    # Contact and application details
    contact_email = models.EmailField(default='contact@company.com', help_text="Email for inquiries about this position")
    application_url = models.URLField(blank=True, null=True, help_text="External URL for applications if applicable")
    
    # Posting status and visibility
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    is_urgent = models.BooleanField(default=False, help_text="Mark as an urgent position to fill")
    

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    expected_start_date = models.DateField(null=True, blank=True, help_text="Expected start date for this position")
    
    # Additional fields specific to aviation industry 
    license_requirements = models.CharField(max_length=255, blank=True)
    required_license_types = models.JSONField(default=list, blank=True, help_text="List of required license types (multi-select)")
    required_licenses = models.JSONField(default=list, blank=True, help_text="List of specific licenses required (multi-select)")
    total_flying_hours_required = models.IntegerField(null=True, blank=True)
    specific_aircraft_hours_required = models.IntegerField(null=True, blank=True)
    medical_certification_required = models.CharField(max_length=100, blank=True)
    
    # New screening questions and admin notes
    screening_questions = models.JSONField(default=list, blank=True, help_text="Optional screening questions for applicants")
    screening_question_types = models.CharField(
        max_length=20, 
        choices=SCREENING_QUESTION_CHOICES, 
        null=True, 
        blank=True, 
        help_text="Type of screening question if applicable"
    )
    internal_notes = models.TextField(blank=True, null=True, help_text="Optional notes visible only to admins")
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.aircraft_type}"
    
    def is_active(self):
        """Check if job posting is active."""
        return self.status == 'active' and (self.expiry_date is None or self.expiry_date > timezone.now())
    
    def save(self, *args, **kwargs):
        """Override save to ensure only recruiters can create job postings."""
        if self.recruiter.role != 'recruiter':
            raise ValueError("Only recruiters can create job postings.")
        super().save(*args, **kwargs)


def job_attachment_upload_path(instance, filename):
    """Generate a unique path for job posting attachments."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('job_attachments', str(instance.job_posting.id), filename)


class JobAttachment(models.Model):
    """Model for file attachments associated with job postings."""
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=job_attachment_upload_path)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    content_type = models.CharField(max_length=100, help_text="MIME type of the file")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.file_name} - {self.job_posting.title}"
        
    @classmethod
    def from_base64(cls, job_posting, base64_data, file_name, content_type):
        """Create a JobAttachment instance from base64 encoded data."""
        try:
            # Strip base64 header if present (e.g., "data:application/pdf;base64,")
            if ',' in base64_data:
                header, base64_data = base64_data.split(',', 1)
            
            # Decode base64 data
            file_data = base64.b64decode(base64_data)
            file_size = len(file_data)
            
            # Create the attachment instance
            attachment = cls(
                job_posting=job_posting,
                file_name=file_name,
                file_size=file_size,
                content_type=content_type
            )
            
            # Save the file content
            attachment.file.save(file_name, ContentFile(file_data), save=False)
            attachment.save()
            
            return attachment
        except Exception as e:
            raise ValueError(f"Failed to process base64 file: {str(e)}")


class JobTrack(models.Model):
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'user')
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user} viewed {self.job} at {self.viewed_at}"
