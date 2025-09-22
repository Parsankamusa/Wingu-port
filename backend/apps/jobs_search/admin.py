from django.contrib import admin
from .models import JobSearchQuery, SavedSearch

@admin.register(JobSearchQuery)
class JobSearchQueryAdmin(admin.ModelAdmin):
    list_display = ('query_text', 'user', 'timestamp', 'results_count', 'ip_address')
    list_filter = ('timestamp',)
    search_fields = ('query_text', 'user__email')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'


@admin.register(SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'query', 'location', 'notify_frequency', 'created_at')
    list_filter = ('notify_frequency', 'created_at')
    search_fields = ('name', 'query', 'user__email')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
