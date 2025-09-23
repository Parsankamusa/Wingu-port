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


from django.db import models
from django.utils.translation import gettext_lazy as _

class ProfessionalRoles(models.Model):
    """Model for professional aviation roles and qualifications."""
    user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name='professional_roles'
)


    AVIATION_CATEGORY_CHOICES = [
        ('pilot', _('Pilot')),
        ('cabin_crew', _('Cabin Crew / Inflight')),
        ('atc', _('Air Traffic Services')),
        ('dispatcher', _('Flight Ops / Dispatch / OCC')),
        ('engineer', _('Maintenance & Engineering')),
        ('ground_ops', _('Airport & Ground Ops')),
        ('safety', _('Safety / Quality / Security')),
    ]
    aviation_category = models.CharField(
        max_length=50,
        choices=AVIATION_CATEGORY_CHOICES,
        verbose_name=_('Aviation Category')
    )


    PILOT_RANKS = [
        ('student_pilot', _('Student Pilot / Cadet')),
        ('second_officer', _('Second Officer')),
        ('first_officer', _('First Officer (FO)')),
        ('senior_first_officer', _('Senior First Officer')),
        ('captain', _('Captain / Pilot-in-Command')),
        ('senior_captain', _('Senior Captain')),
        ('training_captain', _('Training Captain / Line Check Captain')),
        ('tri', _('Type Rating Instructor (TRI)')),
        ('tre', _('Type Rating Examiner (TRE) / DPE')),
        ('fleet_captain', _('Fleet Captain / Chief Pilot')),
        ('director_flight_ops', _('Director of Flight Operations')),
    ]

    CABIN_CREW_RANKS = [
        ('trainee_cc', _('Trainee Cabin Crew')),
        ('cabin_crew', _('Cabin Crew / Flight Attendant')),
        ('senior_cabin_crew', _('Senior Cabin Crew')),
        ('purser', _('Purser / Lead Cabin Crew')),
        ('inflight_supervisor', _('Inflight Supervisor / Cabin Manager')),
        ('cc_instructor', _('Cabin Crew Instructor')),
    ]

    ATC_RANKS = [
        ('trainee_atc', _('ATC Trainee')),
        ('tower', _('Tower (TWR) Controller')),
        ('approach', _('Approach (APP) Controller')),
        ('area', _('Area / En-route (ACC) Controller')),
        ('oceanic', _('Oceanic Controller')),
        ('atc_supervisor', _('ATC Watch Supervisor / Unit Supervisor')),
        ('atc_instructor', _('ATC Instructor (OJTI) / Examiner')),
        ('unit_manager', _('Unit Manager / Chief ATCO')),
    ]

    DISPATCH_RANKS = [
        ('trainee_dispatcher', _('Trainee Dispatcher / Flight Follower')),
        ('dispatcher', _('Flight Operations Officer / Dispatcher')),
        ('senior_dispatcher', _('Senior Dispatcher')),
        ('occ_controller', _('OCC Controller / Duty Manager')),
        ('manager_flight_ops', _('Manager, Flight Operations Control')),
    ]

    ENGINEER_RANKS = [
        ('apprentice', _('Apprentice / Junior Technician')),
        ('technician', _('Aircraft Mechanic / Technician (Airframe/Powerplant/Avionics)')),
        ('licensed_ame', _('Licensed AME (Cat A, B1, B2, B3, C)')),
        ('lead_engineer', _('Lead / Certifying Engineer')),
        ('line_supervisor', _('Line Maintenance Supervisor')),
        ('base_supervisor', _('Base Maintenance Supervisor')),
        ('camo_engineer', _('Continuing Airworthiness Engineer / CAMO')),
        ('ars', _('Airworthiness Review Staff (ARS)')),
        ('maintenance_manager', _('Maintenance / Engineering Manager')),
        ('postholder', _('Part-145 / Part-M / Part-CAMO Postholder')),
    ]

    GROUND_OPS_RANKS = [
        ('ramp_agent', _('Ramp Agent')),
        ('load_controller', _('Load Controller')),
        ('loadmaster', _('Loadmaster')),
        ('turnaround_coordinator', _('Turnaround Coordinator')),
        ('ground_ops_supervisor', _('Ground Ops Supervisor')),
        ('station_manager', _('Station Manager')),
    ]

    SAFETY_RANKS = [
        ('sms_officer', _('SMS Officer / Manager')),
        ('quality_auditor', _('Compliance Monitoring / Quality Auditor')),
        ('safety_investigator', _('Safety Investigator')),
        ('avsec', _('AVSEC Screener / Officer / Manager')),
        ('dgr_officer', _('DGR (Cat 6) Officer')),
    ]

    RANK_CHOICES = (
        PILOT_RANKS + CABIN_CREW_RANKS + ATC_RANKS +
        DISPATCH_RANKS + ENGINEER_RANKS + GROUND_OPS_RANKS +
        SAFETY_RANKS
    )

    title = models.CharField(
        max_length=100,
        choices=RANK_CHOICES,
        verbose_name=_('Rank/Title')
    )

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
        return f"{self.user.email} - {self.get_aviation_category_display()} - {self.get_title_display()}"

    class Meta:
        verbose_name = _('Professional Role')
        verbose_name_plural = _('Professional Roles')



class Qualifications(models.Model):
    """Model for professional qualifications and education."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='qualifications')
    
    EDUCATION_LEVEL_CHOICES = [
        ('high_school', _('High_School')),
        ('primary', _('Primary')),
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
    
    country = models.CharField(
    max_length=100,
    verbose_name=_('Country of Institution'),
    blank=True,
    null=True
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
    
    aviation_certifications_expiry = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Certification Expiry Date')
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
    
    professional_development_courses = models.TextField(
        blank=True,
        null=True,
        help_text=_('Short courses or professional development programs')
    )
    
    professional_development_upload = models.FileField(
        upload_to='professional_development/',
        blank=True,
        null=True,
        verbose_name=_('Supporting Documents')
    )
    workshops_seminars = models.TextField(
        blank=True,
        null=True,
        help_text=_('Workshops and seminars attended')
    )
    workshops_upload = models.FileField(
        upload_to='workshops/',
        blank=True,
        null=True,
        verbose_name=_('Workshop Certificates')
    )
    
    continuous_training_records = models.TextField(
        blank=True,
        null=True,
        help_text=_('Recurrent/mandatory training records')
    )
    continuous_training_last_completed = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Last Training Completed')
    )
    continuous_training_expiry = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Training Expiry Date')
    )
    continuous_training_upload = models.FileField(
        upload_to='continuous_training/',
        blank=True,
        null=True,
        verbose_name=_('Training Records')
    )

    def __str__(self):
        return f"{self.user.email} - {self.highest_education_level} in {self.course_of_study}"

    class Meta:
        verbose_name = _('Qualification')
        verbose_name_plural = _('Qualifications')

#repetition of imports
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class LicensesRatings(models.Model):
    """Model for professional aviation licenses & ratings."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="licenses")

    # License Type
    LICENSE_TYPE_CHOICES = [
        ('spl', _('Student Pilot Licence (SPL)')),
        ('ppl', _('Private Pilot Licence (PPL)')),
        ('cpl', _('Commercial Pilot Licence (CPL)')),
        ('mpl', _('Multi-Crew Pilot Licence (MPL)')),
        ('atpl', _('Airline Transport Pilot Licence (ATPL)')),
        ('fi', _('Flight Instructor Licence (FI/CFI)')),
        ('rpl', _('Remote Pilot Licence (RPL – UAV/Drone)')),
        ('ame', _('Aircraft Maintenance Engineer (AME – ICAO/FAA/EASA Part-66)')),
        ('faa_ap', _('FAA A&P (Airframe & Powerplant)')),
        ('easa_part_66', _('EASA Part-66 Categories (A, B1, B2, B3, C)')),
        ('atc_student', _('Student ATCO Licence')),
        ('atc_full', _('Full ATC Licence')),
        ('dispatcher', _('Flight Dispatcher Licence (ICAO Doc 7192)')),
        ('cabin_crew', _('Cabin Crew Licence/Attestation')),
        ('aero_station', _('Aeronautical Station Operator Licence')),
        ('meteo', _('Meteorologist Certification')),
        ('ame_examiner', _('Aeromedical Examiner Licence')),
        ('other', _('Other')),
    ]
    license_type = models.CharField(
        max_length=100,
        choices=LICENSE_TYPE_CHOICES,
        verbose_name=_('License Type'),
    )

    license_number = models.CharField(max_length=100, verbose_name=_("License Number"))

    ISSUE_AUTHORITY_CHOICES = [
        ('kcaa', _('Kenya Civil Aviation Authority (KCAA)')),
        ('faa', _('Federal Aviation Administration (FAA – USA)')),
        ('easa', _('European Union Aviation Safety Agency (EASA – EU)')),
        ('uk_caa', _('Civil Aviation Authority (UK)')),
        ('dgca_india', _('DGCA India')),
        ('sacaa', _('South African CAA')),
        ('ncaa', _('Nigerian CAA')),
        ('tcaa', _('Tanzania CAA')),
        ('gcaa_uae', _('GCAA (UAE)')),
        ('caac', _('Civil Aviation Administration of China (CAAC)')),
        ('casa', _('Civil Aviation Safety Authority (Australia)')),
        ('tcca', _('Transport Canada Civil Aviation')),
        ('icao', _('ICAO-recognized Authority')),
        ('other', _('Other')),
    ]
    issue_authority = models.CharField(
        max_length=50,
        choices=ISSUE_AUTHORITY_CHOICES,
        verbose_name=_("Issuing Authority"),
    )

    issue_date = models.DateField(verbose_name=_("Issue Date"))
    expiry_date = models.DateField(verbose_name=_("Expiry Date"))

    LICENSE_STATUS_CHOICES = [
        ('active', _('Active')),
        ('suspended', _('Suspended')),
        ('expired', _('Expired')),
        ('pending', _('Pending Renewal')),
        ('revoked', _('Revoked')),
    ]
    license_status = models.CharField(
        max_length=20,
        choices=LICENSE_STATUS_CHOICES,
        default='active',
        verbose_name=_("Current Status"),
    )

    renewal_date = models.DateField(blank=True, null=True, verbose_name=_("Renewal Date"))

    RATING_CHOICES = [
        ('instrument', _('Instrument Rating (IR)')),
        ('night', _('Night Rating')),
        ('multi_engine', _('Multi-Engine Rating')),
        ('instructor', _('Instructor Rating')),
        ('type', _('Type Rating (B737, A320, ATR72, etc.)')),
        ('language', _('Language Proficiency (ICAO Level 4/5/6)')),
        ('atc', _('ATC Ratings (TWR, APP, ACC, Oceanic, Radar, Procedural)')),
        ('cabin_crew', _('Cabin Crew Ratings (SEP, DG, AVSEC, First Aid)')),
        ('dispatcher', _('Dispatcher Ratings (ETOPS, Long Haul, Route/Weather)')),
        ('drone', _('Drone/UAV Ratings (BVLOS, EVLOS, Payload)')),
        ('other', _('Other')),
    ]
    license_rating = models.CharField(
        max_length=100,
        choices=RATING_CHOICES,
        verbose_name=_("License Rating"),
    )

    MEDICAL_CLASS_CHOICES = [
        ('class_1', _('Class 1 Medical (Pilots/ATC)')),
        ('class_2', _('Class 2 Medical (Private Pilots)')),
        ('lapl', _('LAPL Medical')),
        ('cabin_crew', _('Cabin Crew Medical')),
        ('ame', _('Aeromedical Examiner')),
        ('other', _('Other')),
    ]
    medical_certificate_class = models.CharField(
        max_length=20,
        choices=MEDICAL_CLASS_CHOICES,
        blank=True,
        null=True,
        verbose_name=_("Medical Certificate Class"),
    )
    medical_certificate_expiry = models.DateField(
        blank=True,
        null=True,
        verbose_name=_("Medical Certificate Expiry"),
    )

    license_upload = models.FileField(
        upload_to="licenses/",
        blank=True,
        null=True,
        verbose_name=_("License Upload"),
    )

    VERIFICATION_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('verified', _('Verified')),
        ('flagged', _('Flagged')),
    ]
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending',
        verbose_name=_("Verification Status"),
    )

    def __str__(self):
        return f"{self.user.email} - {self.get_license_type_display()}"

    class Meta:
        verbose_name = _("License & Rating")
        verbose_name_plural = _("Licenses & Ratings")

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
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    nature_of_employer_choice =[
       ('Airline', 'Airline'),
        ('Charter Operator', 'Charter Operator'),
        ('MRO', 'MRO'),
        ('Training', 'Training'),
        ('Military', 'Military'),
        ('School', 'School'),
        ('Ground Handling', 'Ground Handling'),
        ('ATC', 'ATC'),
        ('UAV Operator', 'UAV Operator'),
        ('Regulator', 'Regulator'),
    ]
    nature_of_employer = models.CharField(
    max_length=255,
    blank=True,
    null=True,
    help_text=_("Select the nature of the employer")
)

    
    types_of_aircraft_choice =[
        ('B737-800, A320,Dash 8', 'B737-800, A320,Dash 8'),
        ('Q400, Embraer 190, Cessna 208', 'Q400, Embraer 190, Cessna 208'),
    ]
    types_of_aircraft = models.CharField(
    max_length=255,
    choices=types_of_aircraft_choice,
    null=True,
    blank=True,
    help_text=_("Types of aircraft flown/maintained")
)

    
    types_of_missions_choices =[
        ('Domestic', 'Domestic'),
        ('International', 'International'),
        ('Long Haul', 'Long Haul'),
        ('Short Haul', 'Short Haul'),
        ('Cargo', 'Cargo'),
        ('Vip', 'Vip'),
        ('Humanitarian', 'Humanitarian'),
        ('Military', 'Military'),
    ]
    types_of_mission = models.CharField(
        max_length=255,
        choices=types_of_missions_choices,
        null=True,
        blank=True,
        help_text=_("Scope of operations / type of missions")
    )
    
    major_task_performed_choices = [
        ('Line maintenance on A320 fleet', 'Line maintenance on A320 fleet'),
        ('ATC Area Control for Nairobi FIR', 'ATC Area Control for Nairobi FIR'),
        ('Cabin Crew Safety and services on B787 long haul', 'Cabin Crew Safety and services on B787 long haul'),
    ]

    major_task_performed = models.CharField(
        max_length=255,
        choices=major_task_performed_choices,
        null=True,
        blank=True,
        help_text=_("Major tasks performed")
    )

    
    supporting_documents = models.FileField(
        upload_to="employment_references/",
        null=True,
        blank=True,
        help_text=_("Upload work references or employment letters (PDF, JPG)")
    )
    

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
    ('aviation_license', 'Aviation License'),
    ('passport', 'Passport'),
    ('reference_letter', 'Reference Letter'),
    ('certificate_upload', 'Certificate Upload'),
    ('other', 'Other'), 
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

    def __str__(self):
        return f"{self.user.email} - {self.file.name}"

class DocumentVerification(models.Model):
    document = models.ForeignKey('UploadedFile', on_delete=models.CASCADE, related_name='verifications')
    status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    verified_by = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='verified_documents'
)
    verification_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    verification_notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.document} - {self.status}"

class UserVerificationStatus(models.Model):
    user = models.OneToOneField(
    User,   # ✅ Use your custom user model
    on_delete=models.CASCADE,
    related_name='verification_status'
)
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