from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.authentication.serializers.auth_serializers import (
    ProfessionalRegistrationSerializer,
    RecruiterRegistrationSerializer,
)


class ProfessionalRegistrationView(generics.CreateAPIView):
    """View for professional user registration."""
    permission_classes = [AllowAny]
    serializer_class = ProfessionalRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "status": "success",
            "message": "Professional account registered successfully. Please check your email for verification code.",
            "data": {
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name
            }
        }, status=status.HTTP_201_CREATED)


class RecruiterRegistrationView(generics.CreateAPIView):
    """View for recruiter user registration."""
    permission_classes = [AllowAny]
    serializer_class = RecruiterRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            "status": "success",
            "message": "Recruiter account registered successfully. Please check your email for verification code.",
            "data": {
                "email": user.email,
                "role": user.role,
                "company_name": user.company_name
            }
        }, status=status.HTTP_201_CREATED)
