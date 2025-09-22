from django.contrib import admin
from apps.authentication.models import OTP, PasswordReset


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'is_used', 'created_at')
    search_fields = ('user__email', 'code')
    list_filter = ('is_used', 'created_at')
    readonly_fields = ('code', 'created_at')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_short', 'is_used', 'created_at')
    search_fields = ('user__email',)
    list_filter = ('is_used', 'created_at')
    readonly_fields = ('token', 'created_at')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    def token_short(self, obj):
        """Display shortened token in admin list view."""
        return str(obj.token)[:8] + '...'
    
    token_short.short_description = 'Token'
