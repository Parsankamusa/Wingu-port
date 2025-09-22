from rest_framework import generics
from core.versioning.mixins import APIVersionMixin


class VersionedAPIView(APIVersionMixin, generics.GenericAPIView):
    """Base class for all versioned API views."""
    pass
