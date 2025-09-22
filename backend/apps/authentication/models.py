from django.db import models
from django.conf import settings
import uuid
from apps.authentication.utils import generate_otp


class OTP(models.Model):
    """OTP model for email verification."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.created_at}"
    
    @classmethod
    def generate_for_user(cls, user):
        """Generate a new OTP for the user."""
        otp_code = generate_otp()
        otp = cls.objects.create(user=user, code=otp_code)
        return otp


class PasswordReset(models.Model):
    """Password reset token model."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='password_resets')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Password Reset"
        verbose_name_plural = "Password Resets"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.created_at}"
