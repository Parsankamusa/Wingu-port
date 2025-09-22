import random
import string
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def generate_otp(length=6):
    """Generate a random OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(user, otp):
    """Send OTP email to user."""
    try:
        subject = 'noreply - Email Verification Code'
        
        # Create HTML content
        html_message = render_to_string('emails/email-verification.html', {
            'user': user,
            'otp': otp,
            'expiry_minutes': 10
        })
        
        # Plain text message (fallback)
        plain_message = f'Hi {user.first_name},\n\nYour email verification code is: {otp}.\n\nThis code will expire in 10 minutes.\n\nRegards,\nThe WinguPort Team'
        
        from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@winguport.com'
        recipient_list = [user.email]
        
        send_mail(
            subject, 
            plain_message if html_message is None else strip_tags(html_message), 
            from_email, 
            recipient_list, 
            html_message=html_message
        )
        
        logger.info(f"OTP email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email: {str(e)}")
        return False
    
def send_password_reset_email(user, token):
    """Send password reset email to user."""
    try:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        subject = 'WinguPort - Password Reset Request'
        
        # Create HTML content
        html_message = render_to_string('emails/password-reset.html', {
            'user': user,
            'reset_url': reset_url,
            'expiry_hours': 24
        })
        
        # Plain text message
        plain_message = f'Hi {user.first_name},\n\nClick the link below to reset your password. This link will expire in 24 hours.\n\n{reset_url}\n\nIf you did not request this password reset, please ignore this email.\n\nRegards,\nThe WinguPort Team'

        from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@winguport.com'
        recipient_list = [user.email]
        
        send_mail(
            subject, 
            plain_message if html_message is None else strip_tags(html_message), 
            from_email, 
            recipient_list, 
            html_message=html_message
        )
        
        logger.info(f"Password reset email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        return False

def is_otp_expired(created_at, expiry_minutes=10):
    """Check if OTP is expired."""
    expiry_time = created_at + timedelta(minutes=expiry_minutes)
    return timezone.now() > expiry_time

def is_token_expired(created_at, expiry_hours=24):
    """Check if token is expired."""
    expiry_time = created_at + timedelta(hours=expiry_hours)
    return timezone.now() > expiry_time
