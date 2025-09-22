from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with email as username and role-based support."""
    
    class Role(models.TextChoices):
        PROFESSIONAL = 'professional', _('Professional')
        RECRUITER = 'recruiter', _('Recruiter')
        ADMIN = 'admin', _('Admin')
    
    username = None  # Remove username field
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PROFESSIONAL,
    )
    is_email_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    # Fields for professionals
    full_name = models.CharField(_('full name'), max_length=150, blank=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    
    # Fields for recruiters/employers
    company_name = models.CharField(max_length=200, blank=True, null=True)
    company_website = models.URLField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    company_address = models.CharField(max_length=300, blank=True, null=True)
    company_email = models.EmailField(max_length=255, blank=True, null=True)
    company_phone = models.CharField(max_length=15, blank=True, null=True)
    company_website = models.URLField(max_length=200, blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    company_registration_number = models.CharField(max_length=100, blank=True, null=True)
    COMPANY_TYPE_CHOICES = [
        ('airline', _('Airline')),
        ('mro', _('MRO')),
        ('training institute', _('Training Institute')),
        ('airfield operators', _('Airfield Operators')),
        ('advocacy groups', _('Advocacy Groups')),
        ('ngos', _('NGOs')),
        ('government agencies', _('Government Agencies')),
        ('other', _('Other')),
    ]
    company_type = models.CharField(
        max_length=50,
        choices=COMPANY_TYPE_CHOICES,
        default='airline',
        verbose_name=_('Company Type')
    )

    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    def __str__(self):
        if self.role == self.Role.PROFESSIONAL:
            return f"{self.full_name} ({self.email})"
        elif self.role == self.Role.RECRUITER:
            return f"{self.company_name} - {self.email}"
        return self.email
        
    def clean(self):
        super().clean()
        if self.role == self.Role.PROFESSIONAL and self.full_name and not (self.first_name and self.last_name):
            name_parts = self.full_name.split(' ', 1)
            self.first_name = name_parts[0]
            self.last_name = name_parts[1] if len(name_parts) > 1 else ''
            
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
