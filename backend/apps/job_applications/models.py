from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator, MinLengthValidator
import uuid
import os

from apps.jobs_postings.models import JobPosting
from apps.users.models import User


def application_document_path(instance, filename):
    """
    Generate a unique path for job application documents.
    Organizes files by user_id/job_id/document_type/unique_filename
    """
    ext = filename.split('.')[-1]
    # Generate a unique filename with uuid
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    # Organize files by user/job/document_type
    return os.path.join(
        'job_applications',
        str(instance.application.applicant.id),
        str(instance.application.job.id),
        instance.document_type,
        unique_filename
    )


class JobApplication(models.Model):
    """
    Model for job applications submitted by professionals.
    """
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview Stage'),
        ('offer_extended', 'Offer Extended'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn by Applicant'),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        JobPosting, 
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='job_applications',
        limit_choices_to={'role': 'professional'}
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    profile_score = models.FloatField(default=0)
    # Application content
    cover_letter = models.TextField(
        validators=[MinLengthValidator(100)],
        help_text="Explain why you're interested in this position and why you're a good fit."
    )
    answers = models.JSONField(
        blank=True,
        null=True,
        help_text="Answers to job-specific questions in JSON format."
    )
    
    # Status and tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='submitted'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    withdrawn_at = models.DateTimeField(null=True, blank=True)
    
    # Feedback and notes (visible to recruiters only)
    internal_notes = models.TextField(
        blank=True,
        help_text="Notes visible only to recruiters/hiring managers."
    )
    feedback = models.TextField(
        blank=True,
        help_text="Feedback provided to the applicant."
    )
    
    class Meta:
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"
        ordering = ['-created_at']
        # Ensure a user can't apply to the same job multiple times
        unique_together = ['job', 'applicant']

        indexes = [
            models.Index(fields=["status"]),                 
            models.Index(fields=["created_at"]),             
            models.Index(fields=["job", "status"]),          
            models.Index(fields=["applicant", "created_at"]) 
        ]
        
    def __str__(self):
        return f"{self.applicant.email} - {self.job.title} ({self.get_status_display()})"
    
    def withdraw(self):
        """Withdraw application and record timestamp."""
        self.status = 'withdrawn'
        self.withdrawn_at = timezone.now()
        self.save()
    
    @property
    def is_active(self):
        """Check if application is still active (not rejected or withdrawn)."""
        return self.status not in ['rejected', 'withdrawn']
    
    @property
    def days_since_submission(self):
        """Calculate days since application was submitted."""
        return (timezone.now() - self.created_at).days


class JobApplicationDocument(models.Model):
    """
    Model for documents attached to job applications (CV, certificates, etc).
    """
    DOCUMENT_TYPES = [
        ('cv', 'Curriculum Vitae'),
        ('cover_letter', 'Cover Letter'),
        ('certificate', 'Certificate'),
        ('license', 'License'),
        ('reference', 'Reference Letter'),
        ('portfolio', 'Portfolio'),
        ('other', 'Other Document'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(
        JobApplication, 
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES
    )
    file = models.FileField(
        upload_to=application_document_path,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
            )
        ]
    )
    name = models.CharField(max_length=255)
    size = models.PositiveIntegerField(help_text="File size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Application Document"
        verbose_name_plural = "Application Documents"
        ordering = ['document_type', '-uploaded_at']
        
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.application}"
    
    @classmethod
    def from_base64(cls, application, base64_data, name, document_type):
        """Create document from base64 encoded file."""
        from django.core.files.base import ContentFile
        import base64
        
        # Strip base64 header if present
        if ',' in base64_data:
            header, base64_data = base64_data.split(',', 1)
        
        # Decode base64 data
        file_data = base64.b64decode(base64_data)
        file_size = len(file_data)
        
        # Create the document
        document = cls(
            application=application,
            document_type=document_type,
            name=name,
            size=file_size
        )
        
        # Save the file
        document.file.save(name, ContentFile(file_data), save=False)
        document.save()
        
        return document


class JobApplicationActivity(models.Model):
    """
    Model for tracking activities related to job applications.
    This provides an audit log of application status changes and interactions.
    """
    application = models.ForeignKey(
        JobApplication, 
        on_delete=models.CASCADE,
        related_name='activities'
    )
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='application_activities'
    )
    activity_type = models.CharField(max_length=50)
    description = models.TextField()
    previous_status = models.CharField(max_length=20, null=True, blank=True)
    new_status = models.CharField(max_length=20, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Application Activity"
        verbose_name_plural = "Application Activities"
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.activity_type} - {self.application} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
