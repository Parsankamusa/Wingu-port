from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import action
from django.db.models import Count, Q
import os
import re
from datetime import datetime
from .verification_checks import check_job_eligibility, update_user_verification_status
from .cv_extract_views import CVProcessingAPIView

from .serializers import (
    ProfessionalProfileSerializer,
    RecruiterProfileSerializer,
    ProfessionalRolesSerializer,
    QualificationsSerializer,
    LicensesRatingsSerializer,
    EmploymentHistorySerializer,
    CVUploadSerializer,
    # OrganizationProfileSerializer,
    MultiUploadSerializer,
    UploadedFileSerializer
)
from .models import (
    ProfessionalRoles, 
    Qualifications, 
    LicensesRatings, 
    EmploymentHistory,
    ProfessionalPersonalInfo,
    ProfessionalExperience,
    ProfessionalDocument,
    # OrganizationProfile,
    DocumentVerification, 
    VerificationStatus,
    UploadedFile
)
# --- Organization Profile Views ---
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# class OrganizationProfileAPIView(viewsets.ModelViewSet):
#     """Retrieve, update (full/partial), or delete an organization profile by id."""
#     queryset = OrganizationProfile.objects.all()
#     serializer_class = OrganizationProfileSerializer
#     permission_classes = [IsAuthenticated]
#     lookup_field = 'id'
#     http_method_names = ['get', 'put', 'patch', 'delete']

   
#     def retrieve(self, request, *args, **kwargs):
#         """Retrieve organization profile by id."""
#         return super().retrieve(request, *args, **kwargs)

#     def update(self, request, *args, **kwargs):
#         """Fully update organization profile."""
#         return super().update(request, *args, **kwargs)

#     def partial_update(self, request, *args, **kwargs):
#         """Partially update organization profile."""
#         return super().partial_update(request, *args, **kwargs)

  
#     def destroy(self, request, *args, **kwargs):
#         """Delete organization profile."""
#         return super().destroy(request, *args, **kwargs)

User = get_user_model()


class ProfessionalProfileViewSet(viewsets.ViewSet):
    """ViewSet for managing professional user profile."""
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
        
    def check_professional_role(self, request):
        """Check if the user has professional role."""
        if request.user.role != request.user.Role.PROFESSIONAL:
            return Response(
                {"error": "This endpoint is only for professional users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return None
    
   
    def list(self, request):
        """Retrieve professional profile with uploaded documents."""
        error_response = self.check_professional_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        profile_serializer = ProfessionalProfileSerializer(user)
        profile_data = profile_serializer.data
        
        # Add uploaded documents to the response
        documents = UploadedFile.objects.filter(user=user)
        documents_by_category = {}
        
        for doc in documents:
            category = doc.category
            if category not in documents_by_category:
                documents_by_category[category] = []
            
            documents_by_category[category].append(
                UploadedFileSerializer(doc, context={'request': request}).data
            )
        
        profile_data['documents'] = documents_by_category
        return Response(profile_data)
        
    
    def update(self, request):
        """Update professional profile."""
        error_response = self.check_professional_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        serializer = ProfessionalProfileSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    
    def partial_update(self, request):
        """Partially update professional profile."""
        error_response = self.check_professional_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        serializer = ProfessionalProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
    @swagger_auto_schema(
        operation_description="Get verification status for the current user",
        responses={
            200: "Verification status retrieved successfully",
            403: "Permission denied"
        }
    )
    @action(detail=False, methods=['get'])
    def verification_status(self, request):
        """
        Get the verification status for the current user.
        Creates a verification status if it doesn't exist.
        """
        error_response = self.check_professional_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        verification_status, created = UserVerificationStatus.objects.get_or_create(
            user=user,
            defaults={
                'is_verified': False,
                'education_verified': False,
                'employment_verified': False,
                'identity_verified': False,
                'licenses_verified': False
            }
        )
        
        # Get document counts by status
        from django.db.models import Count
        
        verified_docs = UploadedFile.objects.filter(
            user=user,
            verification_status=VerificationStatus.VERIFIED
        ).values_list('category', flat=True).distinct()
        
        pending_docs = UploadedFile.objects.filter(
            user=user,
            verification_status=VerificationStatus.PENDING
        ).values_list('category', flat=True).distinct()
        
        rejected_docs = UploadedFile.objects.filter(
            user=user,
            verification_status__in=[VerificationStatus.REJECTED, VerificationStatus.NEEDS_RESUBMISSION]
        ).values_list('category', flat=True).distinct()
        
        return Response({
            'is_verified': verification_status.is_verified,
            'education_verified': verification_status.education_verified,
            'employment_verified': verification_status.employment_verified,
            'identity_verified': verification_status.identity_verified,
            'licenses_verified': verification_status.licenses_verified,
            'last_verification_date': verification_status.last_verification_date,
            'verification_percentage': verification_status.verification_percentage,
            'verified_documents': list(verified_docs),
            'pending_documents': list(pending_docs),
            'rejected_documents': list(rejected_docs)
        })
        
    @swagger_auto_schema(
        method='put',
        operation_description="Update a specific resource by type and ID (full update)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                # Generic schema since it varies by resource type
                'data': openapi.Schema(type=openapi.TYPE_OBJECT, description='Resource data')
            }
        ),
        responses={
            200: "Resource updated successfully",
            400: "Invalid data or resource type",
            403: "Permission denied",
            404: "Resource not found"
        }
    )
    @action(detail=False, methods=['put', 'patch'], url_path='edit/(?P<resource_type>[^/.]+)/(?P<resource_id>[^/.]+)')
    def update_resource(self, request, resource_type=None, resource_id=None):
        """
        Update a specific resource by type and ID.
        resource_type can be:
        - professional-role
        - qualification
        """
        error_response = self.check_professional_role(request)
        if error_response:
            return error_response
            
        # Map resource types to their models and serializers
        resource_map = {
            'professional-role': (ProfessionalRoles, ProfessionalRolesSerializer),
            'qualification': (Qualifications, QualificationsSerializer),
            'license': (LicensesRatings, LicensesRatingsSerializer),
            'employment-history': (EmploymentHistory, EmploymentHistorySerializer),
            'personal-info': (ProfessionalPersonalInfo, None),  # No specific serializer yet
            'document': (UploadedFile, UploadedFileSerializer),
        }
        
        # Validate resource type
        if resource_type not in resource_map:
            valid_types = list(resource_map.keys())
            return Response(
                {"error": f"Invalid resource type. Choose from: {', '.join(valid_types)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        model_class, serializer_class = resource_map[resource_type]
        
        # Handle special case for personal-info (no specific serializer yet)
        if resource_type == 'personal-info':
            try:
                instance = ProfessionalPersonalInfo.objects.get(id=resource_id)
                if hasattr(instance, 'user') and instance.user != request.user:
                    return Response(
                        {"error": "You don't have permission to update this resource"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Update fields directly
                for key, value in request.data.items():
                    if hasattr(instance, key):
                        setattr(instance, key, value)
                
                instance.save()
                return Response({"message": "Personal info updated successfully"})
                
            except ProfessionalPersonalInfo.DoesNotExist:
                return Response(
                    {"error": f"Personal info with id {resource_id} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        try:
            # Get resource and verify ownership
            instance = model_class.objects.get(id=resource_id)
            
            # Check ownership based on model structure
            owner_field = 'user'  # Default owner field
            if resource_type == 'document':
                owner_field = 'user'
            elif hasattr(instance, 'professional') and instance.professional:
                # Some models may use 'professional' instead of 'user'
                owner_field = 'professional'
                
            # Check if user owns this resource
            owner = getattr(instance, owner_field, None)
            if owner and owner.id != request.user.id:
                return Response(
                    {"error": "You don't have permission to update this resource"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update the resource with the appropriate serializer
            serializer = serializer_class(
                instance, 
                data=request.data, 
                partial=request.method == 'PATCH'
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except model_class.DoesNotExist:
            return Response(
                {"error": f"{resource_type} with id {resource_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # @action(detail=False, methods=['delete'], url_path='delete/(?P<resource_type>[^/.]+)/(?P<resource_id>[^/.]+)')
    # def delete_resource(self, request, resource_type=None, resource_id=None):
    #     """
    #     Delete a specific resource by type and ID.
        
    #     resource_type can be:
    #     - professional-role
    #     - qualification
    #     - license
    #     - employment-history
    #     - document
        
    #     Note: Personal info cannot be deleted, only updated.
    #     """
    #     error_response = self.check_professional_role(request)
    #     if error_response:
    #         return error_response
            
    #     # Map resource types to their models
    #     resource_map = {
    #         'professional-role': ProfessionalRoles,
    #         'qualification': Qualifications,
    #         'license': LicensesRatings,
    #         'employment-history': EmploymentHistory,
    #         'document': UploadedFile,
    #     }
        
    #     # Validate resource type
    #     if resource_type not in resource_map:
    #         valid_types = list(resource_map.keys())
    #         return Response(
    #             {"error": f"Invalid resource type. Choose from: {', '.join(valid_types)}"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
        
    #     model_class = resource_map[resource_type]
        
    #     # Personal info should not be deletable
    #     if resource_type == 'personal-info':
    #         return Response(
    #             {"error": "Personal information cannot be deleted, only updated."},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
        
    #     try:
    #         # Get resource and verify ownership
    #         instance = model_class.objects.get(id=resource_id)
            
    #         # Check ownership based on model structure
    #         owner_field = 'user'  # Default owner field
    #         if resource_type == 'document':
    #             owner_field = 'user'
    #         elif hasattr(instance, 'professional') and instance.professional:
    #             # Some models may use 'professional' instead of 'user'
    #             owner_field = 'professional'
                
    #         # Check if user owns this resource
    #         owner = getattr(instance, owner_field, None)
    #         if owner and owner.id != request.user.id:
    #             return Response(
    #                 {"error": "You don't have permission to delete this resource"},
    #                 status=status.HTTP_403_FORBIDDEN
    #             )
            
    #         # Special handling for document deletion (remove file from storage)
    #         if resource_type == 'document' and instance.file and hasattr(instance.file, 'path'):
    #             if os.path.isfile(instance.file.path):
    #                 os.remove(instance.file.path)
            
    #         # Delete the resource
    #         instance.delete()
    #         return Response(status=status.HTTP_204_NO_CONTENT)
            
    #     except model_class.DoesNotExist:
    #         return Response(
    #             {"error": f"{resource_type} with id {resource_id} not found"},
    #             status=status.HTTP_404_NOT_FOUND
    #         )
    @action(detail=False, methods=['get'], url_path='job-eligibility/(?P<job_id>[^/.]+)')
    def check_job_eligibility(self, request, job_id=None):
        """
        Check if the user is eligible to apply for a specific job.
        Returns required documents that need verification if not eligible.
        """
        error_response = self.check_professional_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        
        # Get the job posting
        from apps.jobs_postings.models import JobPosting
        
        try:
            job = JobPosting.objects.get(id=job_id, status='active')
        except JobPosting.DoesNotExist:
            return Response(
                {"error": "Job not found or no longer active"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check eligibility using our utility function
        eligibility = check_job_eligibility(user, job)
        
        return Response(eligibility)


class RecruiterProfileViewSet(viewsets.ViewSet):
    """ViewSet for managing recruiter user profile."""
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
        
    def check_recruiter_role(self, request):
        """Check if the user has recruiter role."""
        if request.user.role != request.user.Role.RECRUITER:
            return Response(
                {"error": "This endpoint is only for recruiter users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return None
    
    
    def list(self, request):
        """Retrieve recruiter profile."""
        error_response = self.check_recruiter_role(request)
        if error_response:
            return error_response
            
        serializer = RecruiterProfileSerializer(self.get_object())
        return Response(serializer.data)
        
   
    def update(self, request):
        """Update recruiter profile."""
        error_response = self.check_recruiter_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        serializer = RecruiterProfileSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    
    def partial_update(self, request):
        """Partially update recruiter profile."""
        error_response = self.check_recruiter_role(request)
        if error_response:
            return error_response
            
        user = self.get_object()
        serializer = RecruiterProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for document upload, listing and deletion."""
    serializer_class = UploadedFileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']
    
    def get_queryset(self):
        """Get documents for the authenticated user with optional category filter."""
        user = self.request.user
        category = self.request.query_params.get('category', None)
        
        queryset = UploadedFile.objects.filter(user=user)
        if category:
            queryset = queryset.filter(category=category)
        return queryset
    
    
    def create(self, request, *args, **kwargs):
        """Upload multiple documents with a category."""
        serializer = MultiUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            data = serializer.save()
            return Response(
                UploadedFileSerializer(
                    data['uploaded_files'], 
                    many=True, 
                    context={'request': request}
                ).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_destroy(self, instance):
        """Remove file from storage when deleting document record."""
        if instance.file and os.path.isfile(instance.file.path):
            os.remove(instance.file.path)
        instance.delete()

class DocumentVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet for document verification by admins/moderators."""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only allow staff members to access document verifications
        if not self.request.user.is_staff:
            return DocumentVerification.objects.none()
        
        status = self.request.query_params.get('status', None)
        query = DocumentVerification.objects.all()
        
        if status:
            query = query.filter(status=status)
            
        return query.select_related('document', 'document__user')
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark a document as verified."""
        verification = self.get_object()
        verification.status = VerificationStatus.VERIFIED
        verification.verified_by = request.user
        verification.verification_date = timezone.now()
        verification.save()
        
        # Update the document status as well
        verification.document.verification_status = VerificationStatus.VERIFIED
        verification.document.save()
        
        return Response({'status': 'document verified'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a document with reason."""
        verification = self.get_object()
        verification.status = VerificationStatus.REJECTED
        verification.verified_by = request.user
        verification.verification_date = timezone.now()
        verification.rejection_reason = request.data.get('reason', '')
        verification.save()
        
        # Update the document status as well
        verification.document.verification_status = VerificationStatus.REJECTED
        verification.document.save()
        
        return Response({'status': 'document rejected'})