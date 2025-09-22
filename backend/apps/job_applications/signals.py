from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from apps.users.models import User
from .models import JobApplication, JobApplicationActivity


@receiver(post_save, sender=JobApplication)
def create_initial_activity(sender, instance, created, **kwargs):
    """Create an initial activity record when a job application is created."""
    if created:
        # Add activity for the application creation
        JobApplicationActivity.objects.create(
            application=instance,
            performed_by=instance.applicant,
            activity_type='application_created',
            description='Application submitted',
            new_status='submitted'
        )


@receiver(pre_save, sender=JobApplication)
def track_status_changes(sender, instance, **kwargs):
    """Track changes in application status."""
    if instance.pk:
        try:
            old_instance = JobApplication.objects.get(pk=instance.pk)
            
            # If status changed, record the timestamp
            if old_instance.status != instance.status:
                if instance.status == 'withdrawn':
                    instance.withdrawn_at = timezone.now()
                    
        except JobApplication.DoesNotExist:
            pass  


@receiver(post_save, sender=JobApplication)
def notify_status_change(sender, instance, created, **kwargs):
    """Send notifications when application status changes."""
    # Don't send on creation, as that's handled separately
    if created:
        # Notify recruiter about new application
        try:
            send_application_notification_to_recruiter(instance)
        except Exception as e:
            import logging
            logging.error(f"Error sending new application notification: {str(e)}")
        return
    
    # For status updates, check if status has actually changed
    try:
        old_status = JobApplication.objects.get(pk=instance.pk).status
        if old_status != instance.status:
            # Notify applicant about status change
            try:
                send_status_change_notification(instance, old_status)
            except Exception as e:
                import logging
                logging.error(f"Error sending status change notification: {str(e)}")
    except JobApplication.DoesNotExist:
        pass


def send_application_notification_to_recruiter(application):
    """Send notification to the recruiter about a new application."""
    recruiter = application.job.recruiter
    
    if not recruiter.email:
        return
    
    # Skip notification if disabled in settings
    if hasattr(settings, 'ENABLE_EMAIL_NOTIFICATIONS') and not settings.ENABLE_EMAIL_NOTIFICATIONS:
        return
    
    subject = f"New application: {application.job.title}"
    
    context = {
        'recruiter_name': f"{recruiter.first_name} {recruiter.last_name}".strip() or recruiter.email,
        'job_title': application.job.title,
        'applicant_name': f"{application.applicant.first_name} {application.applicant.last_name}".strip() or application.applicant.email,
        'application_date': application.created_at,
        'application_id': application.id,
    }
    
    # an HTML template
    html_message = f"""
    <h2>New Job Application</h2>
    <p>Dear {context['recruiter_name']},</p>
    <p>You've received a new application for the position: <strong>{context['job_title']}</strong></p>
    <p>From: {context['applicant_name']}</p>
    <p>Date: {context['application_date'].strftime('%Y-%m-%d %H:%M')}</p>
    <p><a href="{settings.FRONTEND_URL}/dashboard/applications/{context['application_id']}">View Application</a></p>
    """
    
    send_mail(
        subject=subject,
        message="",  
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recruiter.email],
        html_message=html_message
    )


def send_status_change_notification(application, old_status):
    """Send notification to the applicant about a status change."""
    applicant = application.applicant
    
    if not applicant.email:
        return
    
    # Skip notification if disabled in settings
    if hasattr(settings, 'ENABLE_EMAIL_NOTIFICATIONS') and not settings.ENABLE_EMAIL_NOTIFICATIONS:
        return
    
    subject = f"Update on your application for {application.job.title}"
    
    context = {
        'applicant_name': f"{applicant.first_name} {applicant.last_name}".strip() or applicant.email,
        'job_title': application.job.title,
        'company_name': application.job.recruiter.company_name if hasattr(application.job.recruiter, 'company_name') else "the company",
        'old_status': dict(JobApplication.STATUS_CHOICES).get(old_status, old_status),
        'new_status': dict(JobApplication.STATUS_CHOICES).get(application.status, application.status),
        'application_id': application.id,
    }
    
    # An HTML template
    html_message = f"""
    <h2>Application Status Update</h2>
    <p>Dear {context['applicant_name']},</p>
    <p>Your application for <strong>{context['job_title']}</strong> at {context['company_name']} has been updated.</p>
    <p>Status changed from <strong>{context['old_status']}</strong> to <strong>{context['new_status']}</strong>.</p>
    <p><a href="{settings.FRONTEND_URL}/dashboard/my-applications/{context['application_id']}">View Application</a></p>
    """
    
    # Include feedback if available
    if application.feedback:
        html_message += f"<h3>Feedback:</h3><p>{application.feedback}</p>"
    
    send_mail(
        subject=subject,
        message="",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[applicant.email],
        html_message=html_message
    )
