from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import (
    ProfessionalProfileUpdateSerializer, 
    RecruiterProfileUpdateSerializer,
    UserProfileSerializer
)


class UserProfileAPIView(generics.RetrieveAPIView):
    """View for retrieving user profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    @swagger_auto_schema(
        operation_summary="Get current user profile",
        operation_description="Retrieve the profile of the currently authenticated user",
        responses={
            200: UserProfileSerializer,
            401: "Not authenticated"
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ProfessionalProfileUpdateAPIView(generics.UpdateAPIView):
    """View for updating professional user profile."""
    serializer_class = ProfessionalProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    

    def put(self, request, *args, **kwargs):
        if request.user.role != request.user.Role.PROFESSIONAL:
            return Response(
                {"error": "This endpoint is only for professional users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        if request.user.role != request.user.Role.PROFESSIONAL:
            return Response(
                {"error": "This endpoint is only for professional users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().patch(request, *args, **kwargs)


class RecruiterProfileUpdateAPIView(generics.UpdateAPIView):
    """View for updating recruiter user profile."""
    serializer_class = RecruiterProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    
    def put(self, request, *args, **kwargs):
        if request.user.role != request.user.Role.RECRUITER:
            return Response(
                {"error": "This endpoint is only for recruiter users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().put(request, *args, **kwargs)
    
    def patch(self, request, *args, **kwargs):
        if request.user.role != request.user.Role.RECRUITER:
            return Response(
                {"error": "This endpoint is only for recruiter users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().patch(request, *args, **kwargs)
