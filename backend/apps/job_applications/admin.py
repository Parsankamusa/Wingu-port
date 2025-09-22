from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse

from .models import JobApplication, JobApplicationDocument, JobApplicationActivity


class JobApplicationDocumentInline(admin.TabularInline):
    model = JobApplicationDocument
    extra = 0
    readonly_fields = ('file', 'document_type', 'name', 'size', 'uploaded_at')
    can_delete = False
    max_num = 0  # Don't allow adding via admin


class JobApplicationActivityInline(admin.TabularInline):
    model = JobApplicationActivity
    extra = 0
    readonly_fields = ('performed_by', 'activity_type', 'description', 
                       'previous_status', 'new_status', 'timestamp')
    can_delete = False
    max_num = 0  # Don't allow adding via admin
    ordering = ('-timestamp',)


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant_name', 'job_title', 'company_name', 'status', 
                    'created_at', 'days_since_applied', 'has_documents')
    list_filter = ('status', 'created_at', 'job__recruiter')
    search_fields = ('applicant__email', 'applicant__first_name', 'applicant__last_name',
                     'job__title', 'job__recruiter__company_name')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at', 'withdrawn_at', 'applicant_link', 'job_link')
    inlines = [JobApplicationDocumentInline, JobApplicationActivityInline]
    
    fieldsets = (
        ('Application Overview', {
            'fields': ('applicant_link', 'job_link', 'status', 'created_at', 
                       'updated_at', 'withdrawn_at')
        }),
        ('Application Content', {
            'fields': ('cover_letter', 'answers')
        }),
        ('Feedback & Notes', {
            'fields': ('internal_notes', 'feedback')
        }),
    )
    
    def applicant_name(self, obj):
        if obj.applicant.first_name or obj.applicant.last_name:
            return f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()
        return obj.applicant.email
    applicant_name.short_description = 'Applicant'
    
    def job_title(self, obj):
        return obj.job.title
    job_title.short_description = 'Job Position'
    
    def company_name(self, obj):
        return obj.job.recruiter.company_name if hasattr(obj.job.recruiter, 'company_name') else "Company"
    company_name.short_description = 'Company Name'
    
    def days_since_applied(self, obj):
        from django.utils import timezone
        days = (timezone.now() - obj.created_at).days
        return f"{days} day{'s' if days != 1 else ''}"
    days_since_applied.short_description = 'Age'
    
    def has_documents(self, obj):
        count = obj.documents.count()
        return format_html(
            '<span style="color: {};">{} document{}</span>',
            'green' if count > 0 else 'red',
            count,
            's' if count != 1 else ''
        )
    has_documents.short_description = 'Documents'
    
    def applicant_link(self, obj):
        url = reverse('admin:users_user_change', args=[obj.applicant.id])
        return format_html('<a href="{}">{}</a>', url, self.applicant_name(obj))
    applicant_link.short_description = 'Applicant'
    
    def job_link(self, obj):
        url = reverse('admin:jobs_postings_jobposting_change', args=[obj.job.id])
        return format_html('<a href="{}">{}</a>', url, obj.job.title)
    job_link.short_description = 'Job Position'


@admin.register(JobApplicationDocument)
class JobApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'document_type', 'application_link', 'size_display', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')
    search_fields = ('name', 'application__applicant__email', 'application__job__title')
    date_hierarchy = 'uploaded_at'
    readonly_fields = ('file', 'size', 'uploaded_at', 'application_link')
    
    def size_display(self, obj):
        # Convert bytes to KB or MB for display
        if obj.size < 1024:
            return f"{obj.size} B"
        elif obj.size < 1024 * 1024:
            return f"{obj.size / 1024:.1f} KB"
        else:
            return f"{obj.size / (1024 * 1024):.1f} MB"
    size_display.short_description = 'Size'
    
    def application_link(self, obj):
        url = reverse('admin:job_applications_jobapplication_change', args=[obj.application.id])
        return format_html('<a href="{}">{} - {}</a>', 
                         url, 
                         obj.application.applicant.email,
                         obj.application.job.title)
    application_link.short_description = 'Application'


@admin.register(JobApplicationActivity)
class JobApplicationActivityAdmin(admin.ModelAdmin):
    list_display = ('activity_type', 'application_link', 'performed_by_display', 'timestamp')
    list_filter = ('activity_type', 'timestamp')
    search_fields = ('description', 'application__applicant__email', 'application__job__title')
    date_hierarchy = 'timestamp'
    readonly_fields = ('application_link', 'performed_by', 'timestamp')
    
    def performed_by_display(self, obj):
        if not obj.performed_by:
            return 'System'
        if obj.performed_by.first_name or obj.performed_by.last_name:
            return f"{obj.performed_by.first_name} {obj.performed_by.last_name}".strip()
        return obj.performed_by.email
    performed_by_display.short_description = 'Performed By'
    
    def application_link(self, obj):
        url = reverse('admin:job_applications_jobapplication_change', args=[obj.application.id])
        return format_html('<a href="{}">{} - {}</a>', 
                         url, 
                         obj.application.applicant.email,
                         obj.application.job.title)
    application_link.short_description = 'Application'
