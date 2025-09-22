from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class ProfessionalPersonalInfo(models.Model):
    """Model for professional user's personal information."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='personal_info')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True, help_text=_('General location description'))
    date_of_birth = models.DateField(blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    national_id = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    willing_to_relocate = models.BooleanField(default=False, help_text=_('Whether the professional is willing to relocate for work'))
    professional_bio = models.TextField(blank=True, null=True)

    REGION_CHOICES = [
        ('africa', _('Africa')),
        ('middle_east', _('Middle East')),
        ('europe', _('Europe')),
        ('asia', _('Asia')),
        ('north_america', _('North America')),
        ('south_america', _('South America')),
        ('australia_oceania', _('Australia/Oceania')),
        ('global', _('Global')),
    ]
    preferred_work_regions = models.CharField(
        max_length=255,
        blank=True, 
        null=True,
        help_text=_('Preferred regions for work opportunities (comma-separated)')
    )

    LANGUAGE_CHOICES = [
        ('english', _('English')),
        ('french', _('French')),
        ('german', _('German')),
        ('spanish', _('Spanish')),
        ('chinese', _('Chinese')),
        ('arabic', _('Arabic')),
        ('russian', _('Russian')),
        ('portuguese', _('Portuguese')),
        ('swahili', _('Swahili')),
        ('japanese', _('Japanese')),
        ('hindi', _('Hindi')),
        ('italian', _('Italian')),
    ]
    language = models.CharField(
        max_length=100, 
        choices=LANGUAGE_CHOICES,
        blank=True, 
        null=True,
        help_text=_('Preferred language')
    )
    AVAILABILITY_CHOICES = [
        ('immediately', _('Immediately available')),
        ('within_1_month', _('Available within 1 month')),
        ('within_3_months', _('Available within 3 months')),
        ('contract_bound', _('Contract-bound')),
        ('other', _('Other')),
    ]
    availability = models.CharField(
        max_length=20, 
        choices=AVAILABILITY_CHOICES,
        blank=True, 
        null=True,
        help_text=_('Current availability status')
    )
    
    
    def __str__(self):
        return f"{self.user.email} - Personal Info"
    
    class Meta:
        verbose_name = _('Professional Personal Info')
        verbose_name_plural = _('Professional Personal Info')


class ProfessionalExperience(models.Model):
    """Model for professional user's experience."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='experience')
    current_job_title = models.CharField(max_length=200, blank=True, null=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    aviation_specialization = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.email} - Experience"
    
    class Meta:
        verbose_name = _('Professional Experience')
        verbose_name_plural = _('Professional Experiences')


class ProfessionalDocument(models.Model):
    """Model for professional user's documents."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='documents')
    cv = models.FileField(upload_to='professional_documents/cvs/', blank=True, null=True)
    aviation_licenses = models.FileField(upload_to='professional_documents/licenses/', blank=True, null=True)
    passport = models.FileField(upload_to='professional_documents/passports/', blank=True, null=True)
    reference_letters = models.FileField(upload_to='professional_documents/references/', blank=True, null=True)


    def __str__(self):
        return f"{self.user.email} - Documents"
    
    class Meta:
        verbose_name = _('Professional Document')
        verbose_name_plural = _('Professional Documents')


class ProfessionalRoles(models.Model):
    """Model for professional aviation roles and qualifications."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='professional_roles')
    
    AVIATION_CATEGORY_CHOICES = [
        ('pilot', _('Pilot')),
        ('flight_attendant', _('Flight Attendant')),
        ('engineer', _('Engineer')),
        ('technician', _('Technician')),
        ('atc', _('Air Traffic Controller')),
        ('ground_ops', _('Ground Operations')),
        ('dispatcher', _('Dispatcher')),
        ('other', _('Other')),
    ]
    aviation_category = models.CharField(
        max_length=50,
        choices=AVIATION_CATEGORY_CHOICES,
        verbose_name=_('Aviation Category')
    )
    
    title = models.CharField(
        max_length=100,
        verbose_name=_('Rank/Title'),
        help_text=_('E.g., Captain, First Officer, A&P Technician, etc.')
    )
    
    # Aircraft type experiences as a many-to-many relationship
    AIRCRAFT_TYPE_CHOICES = [
        ('b737', _('Boeing 737')),
        ('a320', _('Airbus A320')),
        ('e190', _('Embraer 190')),
        ('caravan', _('Cessna Caravan')),
        ('atr72', _('ATR 72')),
        ('other', _('Other')),
    ]
    aircraft_type_experience = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('Aircraft types separated by commas')
    )
    
    icao_type_ratings = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text=_('ICAO Type Ratings separated by commas')
    )
    icao_ratings_expiry = models.DateField(
        blank=True,
        null=True,
        help_text=_('Expiry date for ICAO Type Ratings')
    )
    
    REGULATORY_BODY_CHOICES = [
        ('kcaa', _('KCAA')),
        ('faa', _('FAA')),
        ('easa', _('EASA')),
        ('icao', _('ICAO')),
        ('other', _('Other')),
    ]
    regulatory_body = models.CharField(
        max_length=50,
        choices=REGULATORY_BODY_CHOICES,
        blank=True,
        null=True,
        help_text=_('Regulatory body registered with')
    )
    
    def __str__(self):
        return f"{self.user.email} - {self.get_aviation_category_display()} - {self.title}"
    
    class Meta:
        verbose_name = _('Professional Role')
        verbose_name_plural = _('Professional Roles')


class Qualifications(models.Model):
    """Model for professional qualifications and education."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='qualifications')
    
    EDUCATION_LEVEL_CHOICES = [
        ('certificate', _('Certificate')),
        ('diploma', _('Diploma')),
        ('degree', _('Degree')),
        ('masters', _('Masters')),
        ('phd', _('PhD')),
        ('other', _('Other')),
    ]
    highest_education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        verbose_name=_('Highest Education Level')
    )
    
    course_of_study = models.CharField(
        max_length=200, 
        verbose_name=_('Course of Study')
    )
    
    institution = models.CharField(
        max_length=200,
        verbose_name=_('Institution')
    )
    
    expected_graduation_year = models.CharField(
        max_length=10,
        verbose_name=_('Expected Graduation Year')
    )
    
    aviation_certifications = models.TextField(
        blank=True,
        null=True,
        help_text=_('Aviation-specific certifications separated by commas')
    )

    certificate_upload = models.FileField(
        upload_to='certificates/',
        blank=True,
        null=True,
        verbose_name=_('Certificate Upload')
    )
    
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('GPA Attained')
    )
    
    def __str__(self):
        return f"{self.user.email} - {self.highest_education_level} in {self.course_of_study}"

    class Meta:
        verbose_name = _('Qualification')
        verbose_name_plural = _('Qualifications')

class LicensesRatings(models.Model):
    """Model for professional licenses."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='licenses')
    LICENSE_TYPE_CHOICES = [
        ('cpl', _('Commercial Pilot License (CPL)')),
        ('atpl', _('Airline Transport Pilot License (ATPL)')),
        ('ame', _('Aircraft Maintenance Engineer (AME)')),
        ('ppl', _('Private Pilot License (PPL)')),
        ('ir', _('Instrument Rating (IR)')),
        ('me', _('Multi-Engine Rating')),
        ('fi', _('Flight Instructor Rating')),
        ('dispatcher', _('Flight Dispatcher License')),
        ('atc', _('Air Traffic Controller License')),
        ('cabin_crew', _('Cabin Crew License')),
        ('other', _('Other')),
    ]
    license_type = models.CharField(
        max_length=255,
        verbose_name=_('License Type'),
        help_text=_('Multiple license types can be selected (comma-separated)'),
    )
    issue_authority = models.CharField(max_length=100, verbose_name=_('Issue Authority'))
    license_number = models.CharField(max_length=100, verbose_name=_('License Number'))
    issue_date = models.DateField(verbose_name=_('Issue Date'))
    RATING_CHOICES = [
        ('instrument', _('Instrument Rating')),
        ('type', _('Type Rating')),
        ('multi_engine', _('Multi-Engine Rating')),
        ('instructor', _('Instructor Rating')),
        ('night', _('Night Rating')),
        ('ifr', _('IFR Rating')),
        ('vfr', _('VFR Rating')),
        ('other', _('Other')),
    ]
    license_rating = models.CharField(
        max_length=255,
        verbose_name=_('License Rating'),
        help_text=_('Multiple ratings can be selected (comma-separated)'),
    )
    expiry_date = models.DateField(verbose_name=_('Expiry Date'))
    LICENSE_STATUS_CHOICES = [
        ('active', _('Active')),
        ('suspended', _('Suspended')),
        ('expired', _('Expired')),
        ('pending', _('Pending')),
        ('revoked', _('Revoked')),
    ]
    license_status = models.CharField(
        max_length=50,
        choices=LICENSE_STATUS_CHOICES,
        default='active',
        verbose_name=_('Current Status')
    )
    renewal_date = models.DateField(verbose_name=_('Renewal Date'), blank=True, null=True)
    license_upload = models.FileField(upload_to='licenses/', blank=True, null=True, verbose_name=_('License Upload'))

    def __str__(self):
        return f"{self.user.email} - {self.license_type}"

    class Meta:
        verbose_name = _('License')
        verbose_name_plural = _('Licenses')
    
    def parse_license_info(self):
        """
        Parse uploaded license file to extract information if possible.
        This method will attempt to extract information from the uploaded license file
        
        
        This is a stub method that should be implemented with actual OCR functionality.
        """
        if not self.license_upload:
            return False
        
        try:
            return True
        except Exception as e:
            # Log the error
            print(f"Error parsing license: {str(e)}")
            return False

class EmploymentHistory(models.Model):
    """Model for user's employment history."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employment_history')
    company_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    start_date = models.DateField(help_text=_("Employment start date"))
    end_date = models.DateField(null=True, blank=True, help_text=_("Employment end date (leave blank if current)"))
    is_current = models.BooleanField(default=False, help_text=_("Check if this is your current employment"))
    responsibilities = models.TextField()
    reason_leaving = models.TextField()

    def __str__(self):
        return f"{self.user.email} - {self.job_title} at {self.company_name}"

# class OrganizationProfile(models.Model):
#     """Model for recruiter's organization profile."""
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organization_profile')
#     organization_name = models.CharField(max_length=200)
#     country = models.CharField(max_length=100)
#     organization_address = models.CharField(max_length=300)
#     organization_email = models.EmailField(max_length=255)
#     organization_phone = models.CharField(max_length=15)
#     organization_website = models.URLField(max_length=200)
#     organization_logo = models.ImageField(upload_to='organization_logos/', blank=True, null=True)
#     organization_registration_number = models.CharField(max_length=100, blank=True, null=True)
#     ORGANIZATION_TYPE_CHOICES = [
#         ('airline', _('Airline')),
#         ('mro', _('MRO')),
#         ('training institute', _('Training Institute')),
#         ('airfield operators', _('Airfield Operators')),
#         ('advocacy groups', _('Advocacy Groups'))
#     ]
#     organization_type = models.CharField(
#         max_length=50,
#         choices=ORGANIZATION_TYPE_CHOICES,
#         default='airline',
#         verbose_name=_('Organization Type')
#     )


class RecruiterDocument(models.Model):
    """Model for recruiter's documents."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_documents')
    company_documents = models.FileField(upload_to='recruiter_documents/', blank=True, null=True)
    company_logo = models.ImageField(upload_to='recruiter_logos/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.email} - Recruiter Documents"
    
    class Meta:
        verbose_name = _('Recruiter Document')
        verbose_name_plural = _('Recruiter Documents')

class VerificationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    VERIFIED = 'verified', 'Verified'
    REJECTED = 'rejected', 'Rejected'
    NEEDS_RESUBMISSION = 'needs_resubmission', 'Needs Resubmission'

class UploadedFile(models.Model):
    """
    Model for storing uploaded files.
    """
    DOCUMENT_CATEGORIES = [
        ('cv', 'Curriculum Vitae'),
        ('aviation_licenses', 'Aviation Licenses'),
         ('passport', 'Passport'),
        ('reference_letters', 'Reference Letters'),
        ('certificate_upload ', 'Certificate Upload'),
        ('other', 'Other Documents')
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_files'
    )
    professional_document = models.ForeignKey(
        'ProfessionalDocument',  
        on_delete=models.CASCADE,
        related_name='uploaded_files',
        null=True,  
        blank=True
    )
    category = models.CharField(
        max_length=50, 
        choices=DOCUMENT_CATEGORIES,
        default='other',
        verbose_name=_('Document Category')
    )
    verification_status = models.CharField(
        max_length=20, 
        choices=VerificationStatus.choices, 
        default=VerificationStatus.PENDING
    )
    file = models.FileField(upload_to='uploaded_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='uploaded_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.file.name}"

class DocumentVerification(models.Model):
    document = models.ForeignKey('UploadedFile', on_delete=models.CASCADE, related_name='verifications')
    status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    verified_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verification_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    verification_notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.document} - {self.status}"

class UserVerificationStatus(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='verification_status')
    is_verified = models.BooleanField(default=False)
    education_verified = models.BooleanField(default=False)
    employment_verified = models.BooleanField(default=False) 
    identity_verified = models.BooleanField(default=False)
    licenses_verified = models.BooleanField(default=False)
    last_verification_date = models.DateTimeField(null=True, blank=True)
    
    @property
    def verification_percentage(self):
        """Calculate percentage of profile that's verified."""
        fields = [self.education_verified, self.employment_verified, 
                  self.identity_verified, self.licenses_verified]
        verified_count = sum(1 for field in fields if field)
        return (verified_count / len(fields)) * 100 if fields else 0