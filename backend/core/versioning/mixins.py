from rest_framework import versioning
from rest_framework.settings import api_settings


class APIVersionMixin:
    """Mixin to include versioning functionality to API views."""
    versioning_class = api_settings.DEFAULT_VERSIONING_CLASS
    
    def get_api_version(self):
        """Get the current API version from the request."""
        return self.request.version
    
    def is_v1(self):
        """Check if the current API version is v1."""
        return self.get_api_version() == 'v1'
    
