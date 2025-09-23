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
        choices=REGION_CHOICES,
        blank=True, 
        null=True,
        help_text=_('Preferred regions for work opportunities')
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
    aircraft_type = models.CharField(max_length=100, blank=True, null=True, help_text=_('Type of aircraft flown'))
    total_hours = models.PositiveIntegerField(blank=True, null=True, help_text=_('Total flight hours on this aircraft type'))
    pilot_in_command_hours = models.PositiveIntegerField(blank=True, null=True, help_text=_('Pilot-in-command hours on this aircraft type'))
    first_officer_hours = models.PositiveIntegerField(blank=True, null=True, help_text=_('First officer hours on this aircraft type'))
    last_flight_date = models.DateField(blank=True, null=True, help_text=_('Date of last flight on this aircraft type'))
    additional_details = models.TextField(blank=True, null=True, help_text=_('Any additional details about this flight experience'))
    
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
    medical_certificate = models.FileField(upload_to='professional_documents/medical_certificates/', blank=True, null=True)
    licenses_ratings = models.FileField(upload_to='professional_documents/licenses_ratings/', blank=True, null=True)
    logbook = models.FileField(upload_to='professional_documents/logbooks/', blank=True, null=True)

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
    
    # REGULATORY_BODY_CHOICES = [
    #     ('kcaa', _('KCAA')),
    #     ('faa', _('FAA')),
    #     ('easa', _('EASA')),
    #     ('icao', _('ICAO')),
    #     ('other', _('Other')),
    # ]
    # regulatory_body = models.CharField(
    #     max_length=50,
    #     choices=REGULATORY_BODY_CHOICES,
    #     blank=True,
    #     null=True,
    #     help_text=_('Regulatory body registered with')
    # )
    
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

    AVIATION_SPECIFICATION_CHOICES = [
        ('cabin_crew', _('Cabin Crew')),
        ('flight_ops', _('Flight Operations')),
        ('maintenance', _('Maintenance')),
        ('pilot', _('Pilot')),
        ('atc', _('Air Traffic Control')),
        ('other', _('Other')),
    ]
    aviation_specification = models.CharField(
        max_length=50,
        choices=AVIATION_SPECIFICATION_CHOICES,
        blank=True,
        null=True,
        help_text=_('Aviation specification related to the qualification')
    )

    DEVELOPMENT_COURSE_CHOICES = [
        ('safety_management', _('Safety Management')),
        ('aviation_security', _('Aviation Security')),
        ('airport_operations', _('Airport Operations')),
        ('aviatio_english_proficiency', _('Aviation English Proficiency')),
        ('human_factors', _('Human Factors')),
        ('other', _('Other')),
    ]
    professional_development_courses = models.CharField(
        max_length=255,
        choices=DEVELOPMENT_COURSE_CHOICES,
        blank=True,
        null=True,
        help_text=_('Professional development courses completed')
    )

    WORKSHOPS_ATTENDED_CHOICES = [
        ('safety_drills', _('Safety Drills')),
        ('emergency_response', _('Emergency Response')),
        ('customer_service', _('Customer Service')),
        ('leadership', _('Leadership')),
        ('other', _('Other')),
    ]
    workshops_attended = models.CharField(
        max_length=255,
        choices=WORKSHOPS_ATTENDED_CHOICES,
        blank=True,
        null=True,
        help_text=_('Workshops attended')
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
        max_length=255,
        verbose_name=_('License Type'),
        help_text=_('Multiple license types can be selected (comma-separated)'),
    )
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
    nature_of_employer_choice = [
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
        choices=nature_of_employer_choice,
        blank=True,
        null=True,
        help_text=_("Select the nature of the employer")
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
    reference_contact = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text=_("Reference person and contact (e.g. Chief Pilot – captain@airline.com)")
    )
    types_of_missions_choices = [
        ('Domestic', 'Domestic'),
        ('International', 'International'),
        ('Long Haul', 'Long Haul'),
        ('Short Haul', 'Short Haul'),
        ('Cargo', 'Cargo'),
        ('VIP', 'VIP'),
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
    supporting_documents = models.FileField(
        upload_to="employment_references/",
        null=True,
        blank=True,
        help_text=_("Upload work references or employment letters (PDF, JPG)")
    )
    reason_leaving = models.TextField()


    def __str__(self):
        return f"{self.user.email} - {self.job_title} at {self.company_name}"
class AviationCategory(models.Model):
    """
    Model for Aviation Categories grouped into fields with dropdowns.
    Each group is represented by a separate field with its own choices.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aviation_categories')

    # ---------------- Flight Crew ----------------
    FLIGHT_CREW_CHOICES = [
        ('airline_pilot', _('Airline Pilot (Airplane)')),
        ('business_jet_pilot', _('Corporate/Business Jet Pilot')),
        ('cargo_pilot', _('Cargo Pilot')),
        ('charter_pilot', _('Charter/Bush Pilot')),
        ('helicopter_pilot', _('Helicopter Pilot')),
        ('seaplane_pilot', _('Seaplane/Floatplane Pilot')),
        ('flight_instructor_airplane', _('Flight Instructor (Airplane)')),
        ('flight_instructor_helicopter', _('Flight Instructor (Helicopter)')),
        ('test_pilot', _('Test Pilot')),
        ('glider_pilot', _('Glider/Sailplane Pilot')),
        ('balloon_pilot', _('Balloon Pilot')),
        ('airship_pilot', _('Airship Pilot')),
        ('drone_pilot', _('Drone/UAS Remote Pilot')),
    ]

    # ---------------- Cabin / Inflight ----------------
    CABIN_INFLIGHT_CHOICES = [
        ('cabin_crew', _('Cabin Crew / Flight Attendant')),
        ('senior_cabin_crew', _('Senior Cabin Crew')),
        ('purser', _('Purser / Lead')),
        ('inflight_supervisor', _('Inflight Supervisor / Manager')),
        ('cabin_instructor', _('Cabin Crew Instructor')),
    ]

    # ---------------- Flight Ops & Dispatch ----------------
    FLIGHT_OPS_DISPATCH_CHOICES = [
        ('dispatcher', _('Flight Operations Officer / Dispatcher')),
        ('flight_follower', _('Flight Follower (Part 135)')),
        ('occ_controller', _('OCC Controller')),
        ('crew_scheduler', _('Crew Controller / Scheduler')),
    ]

    # ---------------- Air Traffic Services ----------------
    AIR_TRAFFIC_SERVICES_CHOICES = [
        ('atco', _('Air Traffic Controller (ATCO)')),
        ('fiso', _('Flight Information Service Officer (FISO / AFIS)')),
        ('atc_instructor', _('ATC Instructor / Examiner')),
    ]

    # ---------------- Medical ----------------
    MEDICAL_CHOICES = [
        ('ame', _('Aeromedical Examiner (AME)')),
        ('flight_nurse', _('Flight Nurse')),
        ('flight_paramedic', _('Flight Paramedic')),
    ]

    # ---------------- Management / Regulatory ----------------
    MANAGEMENT_REGULATORY_CHOICES = [
        ('director_flight_ops', _('Director of Flight Ops')),
        ('chief_pilot', _('Chief Pilot')),
        ('fleet_captain', _('Fleet Captain')),
        ('maintenance_manager', _('Maintenance Manager (Line/Base)')),
        ('accountable_manager', _('Postholder / Accountable Manager')),
        ('regulatory_affairs', _('Regulatory Affairs')),
    ]

    # ---------------- Fields ----------------
    flight_crew = models.CharField(
        max_length=50,
        choices=FLIGHT_CREW_CHOICES,
        blank=True,
        null=True,
        help_text=_('Select a Flight Crew category (if applicable)')
    )

    cabin_inflight = models.CharField(
        max_length=50,
        choices=CABIN_INFLIGHT_CHOICES,
        blank=True,
        null=True,
        help_text=_('Select a Cabin / Inflight category (if applicable)')
    )

    flight_ops_dispatch = models.CharField(
        max_length=50,
        choices=FLIGHT_OPS_DISPATCH_CHOICES,
        blank=True,
        null=True,
        help_text=_('Select a Flight Ops & Dispatch category (if applicable)')
    )

    air_traffic_services = models.CharField(
        max_length=50,
        choices=AIR_TRAFFIC_SERVICES_CHOICES,
        blank=True,
        null=True,
        help_text=_('Select an Air Traffic Services category (if applicable)')
    )

    medical = models.CharField(
        max_length=50,
        choices=MEDICAL_CHOICES,
        blank=True,
        null=True,
        help_text=_('Select a Medical category (if applicable)')
    )

    management_regulatory = models.CharField(
        max_length=50,
        choices=MANAGEMENT_REGULATORY_CHOICES,
        blank=True,
        null=True,
        help_text=_('Select a Management / Regulatory category (if applicable)')
    )

    # ---------------- Meta & Display ----------------
    def __str__(self):
        """
        Display whichever category is filled in, falling back to 'Unspecified'.
        """
        return (
            self.get_flight_crew_display()
            or self.get_cabin_inflight_display()
            or self.get_flight_ops_dispatch_display()
            or self.get_air_traffic_services_display()
            or self.get_medical_display()
            or self.get_management_regulatory_display()
            or "Unspecified"
        )

    class Meta:
        verbose_name = _('Aviation Category')
        verbose_name_plural = _('Aviation Categories')
class RegulatoryBody(models.Model):
    """
    Model for Regulatory Bodies (Civil Aviation Authorities) by Region.
    Stores country, region, and authority details.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='regulatory_bodies')
    # ---------------- Region Choices ----------------
    REGION_CHOICES = [
        ('africa', _('Africa')),
        ('europe', _('Europe')),
        ('middle_east', _('Middle East')),
        ('asia', _('Asia')),
        ('north_america', _('North America')),
        ('south_america', _('South America')),
        ('australia_oceania', _('Australia/Oceania')),
        ('global', _('Global / Regional Agencies (EASA, Eurocontrol, ICAO)')),
    ]

    country = models.CharField(
        max_length=100,
        help_text=_('Country name (ISO-3166 standard)')
    )

    abbreviation = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text=_('Short code or abbreviation (e.g., KCAA, EASA, CAA)')
    )

    authority_name = models.CharField(
        max_length=255,
        help_text=_('Full Civil Aviation Authority name (e.g., Kenya Civil Aviation Authority)')
    )

    region = models.CharField(
        max_length=50,
        choices=REGION_CHOICES,
        help_text=_('Geographic region of the authority')
    )

    # ---------------- Meta & Display ----------------
    def __str__(self):
        return f"{self.country} — {self.authority_name} ({self.abbreviation or 'N/A'})"

    class Meta:
        verbose_name = _('Regulatory Body')
        verbose_name_plural = _('Regulatory Bodies')
        ordering = ['region', 'country']
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
        ('logbook', 'Logbook'),
        ('medical_certificate', 'Medical Certificate'),
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
