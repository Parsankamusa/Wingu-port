from django.apps import AppConfig


class JobApplicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.job_applications'
    verbose_name = 'Job Applications'

    def ready(self):
        # Import signal handlers
        import apps.job_applications.signals
