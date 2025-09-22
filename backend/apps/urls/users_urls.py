from django.urls import path
from apps.users.views import UserProfileAPIView
from apps.users.profile_management.views import (
    ProfessionalProfileViewSet,
    RecruiterProfileViewSet,
    # OrganizationProfileAPIView,
    # LicensesRatingsViewSet,
    DocumentViewSet,
)
from apps.users.profile_management.cv_extract_views import CVProcessingAPIView

urlpatterns = [
    # General user profile
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
    
    # Professional profiles - using ViewSets
    path('profile/professional/list/', ProfessionalProfileViewSet.as_view({'get': 'list'}), name='professional-profile-list'),
    path('profile/professional/update/', ProfessionalProfileViewSet.as_view({'put': 'update', 'patch': 'partial_update'}), name='professional-profile-update'),
    path('profile/professional/verification-status/', ProfessionalProfileViewSet.as_view({'get': 'verification_status'}), name='verification-status'),
    path('profile/professional/job-eligibility/<int:job_id>/', ProfessionalProfileViewSet.as_view({'get': 'check_job_eligibility'}), name='job-eligibility-check'),
    
    # Consolidated resource update endpoint
    path('profile/professional/edit/<str:resource_type>/<int:resource_id>/',
         ProfessionalProfileViewSet.as_view({'put': 'update_resource', 'patch': 'update_resource'}),
         name='update-profile-resource'),
    # path('profile/professional/delete/<str:resource_type>/<int:resource_id>/',
    #  ProfessionalProfileViewSet.as_view({'delete': 'delete_resource'}),
    #  name='delete-profile-resource'),
    
    # Recruiter profiles
    path('profile/recruiter/list/', RecruiterProfileViewSet.as_view({'get': 'list'}), name='recruiter-profile-list'),
    path('profile/recruiter/update/', RecruiterProfileViewSet.as_view({'put': 'update', 'patch': 'partial_update'}), name='recruiter-profile-update'),
    
    # CV Processing
    path('profile/professional/cv/process/', CVProcessingAPIView.as_view(), name='cv-process'),
    
    # Document management
    path('documents/upload/add', DocumentViewSet.as_view({'post': 'create'}), name='document-upload'),
    path('documents/list/', DocumentViewSet.as_view({'get': 'list'}), name='document-list'),
    path('documents/delete/<int:pk>/', DocumentViewSet.as_view({'delete': 'destroy'}), name='document-delete'),
    
    # # Organization profile endpoints - separate routes for each operation
    # path('profile/organization/list/<int:id>/', OrganizationProfileAPIView.as_view({'get': 'retrieve'}), name='organization-profile-list'),
    # path('profile/organization/update/<int:id>/', OrganizationProfileAPIView.as_view({'put': 'update', 'patch': 'partial_update'}), name='organization-profile-update'),
    # path('profile/organization/delete/<int:id>/', OrganizationProfileAPIView.as_view({'delete': 'destroy'}), name='organization-profile-delete'),
]
