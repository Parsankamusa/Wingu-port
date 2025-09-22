from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

# Import our profile management models
from .profile_management.models import (
    ProfessionalPersonalInfo,
    ProfessionalExperience,
    ProfessionalDocument,
    RecruiterDocument,
    EmploymentHistory
)
from .profile_management.admin import (
    ProfessionalPersonalInfoAdmin,
    ProfessionalExperienceAdmin,
    ProfessionalDocumentAdmin,
    RecruiterDocumentAdmin
)

User = get_user_model()

class EmploymentHistoryInline(admin.TabularInline):
    model = EmploymentHistory
    extra = 0
    fields = ('company_name', 'job_title', 'start_date', 'end_date', 'is_current')
    
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'role')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_email_verified')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    def get_inlines(self, request, obj=None):
        # Only show employment history inline for professional users
        if obj and obj.role == 'professional':
            return [EmploymentHistoryInline]
        return []
