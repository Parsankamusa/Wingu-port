from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import (
    ProfessionalPersonalInfo,
    ProfessionalExperience,
    ProfessionalDocument,
    RecruiterDocument,
    ProfessionalRoles,
    Qualifications,
    LicensesRatings,
    # OrganizationProfile,
    EmploymentHistory
)

User = get_user_model()

@admin.register(ProfessionalPersonalInfo)
class ProfessionalPersonalInfoAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'nationality', 'city', 'country')
    search_fields = ('user__email', 'phone_number', 'nationality', 'city', 'country')
    list_filter = ('nationality', 'country')
from .models import UploadedFile

class UploadedFileInline(admin.TabularInline):
    """
    Inline model for managing multiple file uploads.
    Automatically sets the user field based on the parent ProfessionalDocument.
    """
    model = UploadedFile
    extra = 1
    fields = ('category', 'file', 'uploaded_at')
    readonly_fields = ('uploaded_at',)
    
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        if obj:
            # Store the parent object's user for use in form_save
            formset.parent_obj_user = obj.user
        return formset

@admin.register(ProfessionalExperience)
class ProfessionalExperienceAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_job_title', 'years_of_experience', 'aviation_specialization')
    search_fields = ('user__email', 'current_job_title', 'aviation_specialization')
    list_filter = ('years_of_experience',)

# @admin.register(OrganizationProfile)
# class OrganizationProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'organization_name', 'organization_type', 'country')
#     search_fields = ('user__email', 'organization_name', 'country', 'organization_email')
#     list_filter = ('organization_type', 'country')

@admin.register(ProfessionalDocument)
class ProfessionalDocumentAdmin(admin.ModelAdmin):
    """
    Admin model for ProfessionalDocument with support for multiple file uploads.
    """
    list_display = ('user', 'has_cv', 'has_aviation_licenses')
    search_fields = ('user__email',)
    inlines = [UploadedFileInline]

    def has_cv(self, obj):
        return bool(obj.cv)
    has_cv.boolean = True
    has_cv.short_description = "Has CV"

    def has_aviation_licenses(self, obj):
        return bool(obj.aviation_licenses)
    has_aviation_licenses.boolean = True
    has_aviation_licenses.short_description = "Has Aviation Licenses"
    
    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, UploadedFile) and not instance.user_id:
                instance.user = form.instance.user
            instance.save()
        formset.save_m2m()
        
        # Also handle deleted objects
        for obj in formset.deleted_objects:
            obj.delete()

@admin.register(RecruiterDocument)
class RecruiterDocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'has_company_documents')
    search_fields = ('user__email',)
    
    def has_company_documents(self, obj):
        return bool(obj.company_documents)
    has_company_documents.boolean = True
    has_company_documents.short_description = "Has Company Documents"

@admin.register(ProfessionalRoles)
class ProfessionalRolesAdmin(admin.ModelAdmin):
    list_display = ('user', 'aviation_category', 'title', 'aircraft_type_experience', 'regulatory_body')
    search_fields = ('user__email', 'title', 'aircraft_type_experience')
    list_filter = ('aviation_category', 'regulatory_body')

@admin.register(Qualifications)
class QualificationsAdmin(admin.ModelAdmin):
    list_display = ('user', 'highest_education_level', 'course_of_study', 'institution', 'expected_graduation_year')
    search_fields = ('user__email', 'course_of_study', 'institution')
    list_filter = ('highest_education_level',)

@admin.register(LicensesRatings)
class LicensesRatingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_type', 'license_number', 'issue_authority', 'issue_date', 'expiry_date', 'license_status')
    search_fields = ('user__email', 'license_type', 'license_number', 'issue_authority')
    list_filter = ('license_type', 'license_status', 'issue_authority')
    readonly_fields = ('license_status',)

@admin.register(EmploymentHistory)
class EmploymentHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'job_title', 'start_date', 'end_date', 'is_current')
    search_fields = ('user__email', 'company_name', 'job_title')
    list_filter = ('is_current',)
    fields = ('user', 'company_name', 'job_title', 'start_date', 'end_date', 'is_current', 'responsibilities', 'reason_leaving')
    
    def get_readonly_fields(self, request, obj=None):
        # If editing an existing object, make user field readonly
        if obj:
            return ('user',)
        return ()
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            # Filter to show only users with role='professional'
            kwargs["queryset"] = User.objects.filter(role='professional')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
