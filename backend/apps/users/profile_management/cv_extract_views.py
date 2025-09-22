from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    ProfessionalRoles, 
    Qualifications, 
    LicensesRatings, 
    EmploymentHistory,
    ProfessionalPersonalInfo,
    ProfessionalExperience,
    ProfessionalDocument,
    UploadedFile
)
from .serializers import CVUploadSerializer
from .cv_processing_logic import extract_cv_information

class CVProcessingAPIView(APIView):
    """API view for processing CV/resume files and extracting information."""
    permission_classes = [IsAuthenticated]
    
    def _update_user_profile(self, user, extracted_data):
        """Update user profile with information extracted from CV"""
        # Update personal info
        if extracted_data.get('personal_info'):
            personal_info, created = ProfessionalPersonalInfo.objects.get_or_create(user=user)
            personal_info_data = extracted_data['personal_info']
            
            # Update fields only if they're currently empty
            for field, value in personal_info_data.items():
                if hasattr(personal_info, field) and value and not getattr(personal_info, field):
                    setattr(personal_info, field, value)
            
            personal_info.save()
        
        # Update experience
        if extracted_data.get('experience'):
            experience, created = ProfessionalExperience.objects.get_or_create(user=user)
            experience_data = extracted_data['experience']
            
            for field, value in experience_data.items():
                if hasattr(experience, field) and value and not getattr(experience, field):
                    setattr(experience, field, value)
            
            experience.save()
        
        # Add qualifications
        if extracted_data.get('qualifications'):
            for qual_data in extracted_data['qualifications']:
                # Only add if qualification doesn't exist with same institution and degree
                if not Qualifications.objects.filter(
                    user=user,
                    institution=qual_data.get('institution', ''),
                    course_of_study=qual_data.get('course_of_study', '')
                ).exists():
                    qualification = Qualifications(user=user)
                    
                    for field, value in qual_data.items():
                        if hasattr(qualification, field) and value:
                            setattr(qualification, field, value)
                    
                    qualification.save()
        
        # Add employment history
        if extracted_data.get('employment_history'):
            for emp_data in extracted_data['employment_history']:
                # Only add if employment doesn't exist with same company and position
                if not EmploymentHistory.objects.filter(
                    user=user,
                    company_name=emp_data.get('company_name', ''),
                    job_title=emp_data.get('job_title', '')
                ).exists():
                    employment = EmploymentHistory(user=user)
                    
                    for field, value in emp_data.items():
                        if hasattr(employment, field) and value:
                            setattr(employment, field, value)
                    
                    employment.save()
    
    @swagger_auto_schema(
        operation_description="Process uploaded CV and extract information",
        request_body=CVUploadSerializer,
        responses={
            200: "CV processed successfully",
            400: "Invalid request data",
            403: "Permission denied"
        }
    )
    def post(self, request):
        """Process uploaded CV and extract information."""
        if request.user.role != request.user.Role.PROFESSIONAL:
            return Response(
                {"error": "This endpoint is only for professional users."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CVUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cv_file = serializer.validated_data['cv']
        
        # Save the CV to the user's document model
        doc, created = ProfessionalDocument.objects.get_or_create(user=request.user)
        doc.cv = cv_file
        doc.save()
        
        # Extract information from the CV
        extracted_data = extract_cv_information(cv_file)
        
        if extracted_data:
            # Update user's profile information with extracted data
            self._update_user_profile(request.user, extracted_data)
            
            return Response({
                'status': 'success',
                'message': 'CV processed successfully and profile updated',
                'extracted_fields': extracted_data
            })
        else:
            return Response({
                'status': 'partial_success',
                'message': 'CV uploaded but could not extract all information. Please update your profile manually.'
            }, status=status.HTTP_200_OK)
