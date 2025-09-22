from django.contrib import admin
from .models import JobPosting, JobAttachment, JobTrack


class JobAttachmentInline(admin.TabularInline):
    model = JobAttachment
    extra = 1
    fields = ('file', 'file_name', 'content_type', 'file_size')
    readonly_fields = ('file_size', 'content_type', 'created_at')
    can_delete = True
    max_num = 10
    min_num = 0



@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'aircraft_type', 'recruiter', 'department', 'location', 
                    'is_remote', 'job_type', 'experience_level', 'is_urgent', 
                    'visibility', 'status', 'created_at')
    list_filter = ('status', 'job_type', 'aircraft_type', 'experience_level', 
                   'is_remote', 'is_urgent', 'visibility', 'department')
    search_fields = ('title', 'description', 'responsibilities', 'aircraft_type', 
                     'location', 'department', 'contact_email')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    inlines = [JobAttachmentInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('recruiter', 'title', 'aircraft_type', 'department', 
                      'experience_level', 'contact_email')
        }),
        ('Job Details', {
            'fields': ('description', 'responsibilities', 'qualifications')
        }),
        ('Location & Type', {
            'fields': ('location', 'is_remote', 'job_type')
        }),
        ('Compensation & Benefits', {
            'fields': ('salary_min', 'salary_max', 'benefits')
        }),
        ('Aviation Requirements', {
            'fields': ('license_requirements', 'total_flying_hours_required', 
                      'specific_aircraft_hours_required', 'medical_certification_required')
        }),
        ('Dates', {
            'fields': ('expiry_date', 'expected_start_date', 'created_at', 'updated_at')
        }),
        ('Status & Visibility', {
            'fields': ('status', 'visibility', 'is_urgent', 'application_url')
        }),
    )


@admin.register(JobAttachment)
class JobAttachmentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'content_type', 'file_size', 'job_posting', 'created_at')
    list_filter = ('content_type', 'created_at')
    search_fields = ('file_name', 'job_posting__title')
    date_hierarchy = 'created_at'
    readonly_fields = ('file_size', 'created_at')
    raw_id_fields = ('job_posting',)


# @admin.register(JobTrack)
# class JobTrackAdmin(admin.ModelAdmin):
#     list_display = ('job_posting', 'user', 'viewed_at', 'ip_address', 'user_agent')
#     list_filter = ('viewed_at',)
#     search_fields = ('job_posting__title', 'user__email', 'ip_address', 'user_agent')
#     date_hierarchy = 'viewed_at'
#     readonly_fields = ('job_posting', 'user', 'viewed_at', 'ip_address', 'user_agent')
#     raw_id_fields = ('job_posting', 'user')