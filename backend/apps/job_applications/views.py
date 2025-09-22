import logging
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from apps.users.profile_management.verification_checks import check_job_eligibility

from rest_framework.views import APIView
from rest_framework import status, generics, viewsets, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from apps.jobs_postings.models import JobPosting
from core.permissions.permissions import IsProfessional, IsRecruiter
from .models import JobApplication, JobApplicationDocument, JobApplicationActivity
from .serializers import (
    JobApplicationCreateSerializer,
    JobApplicationDetailSerializer,
    JobApplicationUpdateSerializer,
    JobApplicationListSerializer,
    JobApplicationWithdrawSerializer,
    JobApplicationDocumentSerializer
)

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for job applications."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for job applications.
    Provides different serializers and permissions based on action.
    """
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Get the appropriate queryset based on the user's role.
        - Professionals see their own applications
        - Recruiters see applications for jobs they've posted
        """
        user = self.request.user
        
        # Optimized queries with select_related and prefetch_related
        base_queryset = JobApplication.objects.select_related(
            'job',                
            'job__recruiter',     
            'applicant'           
        ).prefetch_related(
            'documents',          
            'activities',         
        )
        
        if user.role == 'professional':
            # Professionals can only see their own applications
            return base_queryset.filter(applicant=user)
        
        elif user.role == 'recruiter':
            # Recruiters can only see applications for jobs they posted
            return base_queryset.filter(job__recruiter=user)
        
        # Admins can see all applications
        elif user.role == 'admin' or user.is_staff:
            return base_queryset
        
        # Fallback (should never reach here with proper permission checks)
        return JobApplication.objects.none()
    
    def get_serializer_class(self):
        """Return different serializers based on the action."""
        if self.action == 'create':
            return JobApplicationCreateSerializer
        elif self.action == 'list':
            return JobApplicationListSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return JobApplicationUpdateSerializer
        elif self.action == 'withdraw':
            return JobApplicationWithdrawSerializer
        return JobApplicationDetailSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action:
        - create: professionals only
        - update/partial_update: recruiters only
        - list/retrieve: authenticated users (filtered in get_queryset)
        """
        if self.action == 'create':
            return [IsAuthenticated(), IsProfessional()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsRecruiter()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        """List job applications with filtering and optimized queries."""
        try:
            queryset = self.get_queryset()
            
            # Apply filters (without requerying the database unnecessarily)
            filters = Q()
            
            job_id = request.query_params.get('job')
            if job_id and request.user.role == 'recruiter':
                filters &= Q(job_id=job_id)
            
            status_filter = request.query_params.get('status')
            if status_filter:
                filters &= Q(status=status_filter)
            
            # Apply all filters at once
            if filters:
                queryset = queryset.filter(filters)
            
            # Apply sorting
            sort_order = request.query_params.get('sort', 'newest')
            queryset = queryset.order_by('-created_at' if sort_order != 'oldest' else 'created_at')
            
            # Paginate results
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error listing job applications: {str(e)}")
            return Response(
                {"error": "Failed to retrieve job applications", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    
    def post(self, request, *args, **kwargs):
        """Create a new job application with profile verification check."""
        try:
            # Check if the user already applied to this job
            job_id = request.data.get('job')
            if job_id and JobApplication.objects.filter(
                applicant=request.user,
                job_id=job_id
            ).exists():
                return Response(
                    {"error": "You have already applied to this job"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the job posting to check specific requirements
            try:
                job = JobPosting.objects.get(id=job_id, status='active')
            except JobPosting.DoesNotExist:
                return Response(
                    {"error": "Job not found or no longer active"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if the user is eligible to apply based on verification status
            eligibility = check_job_eligibility(request.user, job)
            
            if not eligibility['can_apply']:
                return Response({
                    'error': 'Profile verification incomplete',
                    'missing_documents': eligibility['missing_documents'],
                    'message': 'Please verify these documents before applying',
                    'verification_percentage': eligibility['verification_percentage']
                }, status=status.HTTP_403_FORBIDDEN)
            
            # If verification passes, proceed with application creation
            return super().create(request, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error creating job application: {str(e)}")
            return Response(
                {"error": "Failed to create job application", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
  
    def retrieve(self, request, *args, **kwargs):
        """Get detailed information about a job application."""
        try:
            return super().retrieve(request, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error retrieving job application: {str(e)}")
            return Response(
                {"error": "Failed to retrieve job application", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    
    def update(self, request, *args, **kwargs):
        """Update job application (status, notes, feedback)."""
        try:
            return super().update(request, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error updating job application: {str(e)}")
            return Response(
                {"error": "Failed to update job application", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

    def partial_update(self, request, *args, **kwargs):
        """Partially update job application (status, notes, feedback)."""
        try:
            return super().partial_update(request, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error updating job application: {str(e)}")
            return Response(
                {"error": "Failed to update job application", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
  
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProfessional])
    def withdraw(self, request, pk=None):
        """Withdraw a job application."""
        try:
            instance = self.get_object()
            
            # Ensure the user can only withdraw their own applications
            if instance.applicant != request.user:
                return Response(
                    {"error": "You can only withdraw your own applications"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(
                {"message": "Application withdrawn successfully"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error withdrawing job application: {str(e)}")
            return Response(
                {"error": "Failed to withdraw application", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        """Set the applicant to the current user when creating an application."""
        serializer.save(applicant=self.request.user)


class ApplicationDocumentsView(generics.ListCreateAPIView):
    """
    View for managing documents associated with a job application.
    """
    serializer_class = JobApplicationDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get documents for the specified application with optimized query."""
        application_id = self.kwargs.get('application_id')
        
        # Get the application with prefetched related data in a single query
        application = get_object_or_404(
            JobApplication.objects.select_related('applicant', 'job', 'job__recruiter'),
            id=application_id
        )
        
        # Ensure the user can only access documents they're authorized to see
        user = self.request.user
        if user != application.applicant and user != application.job.recruiter:
            return JobApplicationDocument.objects.none()
        
        return JobApplicationDocument.objects.filter(application_id=application_id)
    
   
    def post(self, request, *args, **kwargs):
        """Upload a new document for a job application."""
        try:
            application_id = self.kwargs.get('application_id')
            application = get_object_or_404(JobApplication, id=application_id)
            
            # Ensure only the applicant can upload documents
            if request.user != application.applicant:
                return Response(
                    {"error": "You can only upload documents to your own applications"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Process the base64 document
            document_data = request.data.get('document_data')
            name = request.data.get('name')
            document_type = request.data.get('document_type')
            
            if not document_data or not name or not document_type:
                return Response(
                    {"error": "Missing required fields"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            document = JobApplicationDocument.from_base64(
                application=application,
                base64_data=document_data,
                name=name,
                document_type=document_type
            )

            with transaction.atomic():
                document.save()

            # Record the activity
            JobApplicationActivity.objects.create(
                application=application,
                performed_by=request.user,
                activity_type='document_uploaded',
                description=f'Document uploaded: {name}'
            )
            
            serializer = self.get_serializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error uploading document: {str(e)}")
            return Response(
                {"error": "Failed to upload document", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ApplicationStatsView(APIView):
    """
    View for retrieving statistics about job applications.
    Different stats for professionals and recruiters.
    """
    permission_classes = [IsAuthenticated]
    
    
    def get(self, request, *args, **kwargs):
        """Get statistics about job applications with optimized queries."""
        try:
            user = request.user
            stats = {}
            
            if user.role == 'professional':
                # Prefetch all necessary data for professionals in one go
                applications = JobApplication.objects.filter(
                    applicant=user
                ).select_related(
                    'job', 'job__recruiter'
                ).prefetch_related(
                    'activities'
                )
                
                # Use annotation for counts where possible
                from django.db.models import Count, Q
                
                status_counts = applications.aggregate(
                    total=Count('id'),
                    active=Count('id', filter=Q(
                        status__in=['submitted', 'under_review', 'shortlisted', 'interview', 'offer_extended']
                    )),
                    interviews=Count('id', filter=Q(status='interview')),
                    offers=Count('id', filter=Q(status='offer_extended')),
                    rejected=Count('id', filter=Q(status='rejected')),
                    withdrawn=Count('id', filter=Q(status='withdrawn')),
                    hired=Count('id', filter=Q(status='hired'))
                )
                
                stats = {
                    'total_applications': status_counts['total'],
                    'active_applications': status_counts['active'],
                    'interviews': status_counts['interviews'],
                    'offers': status_counts['offers'],
                    'rejected': status_counts['rejected'],
                    'withdrawn': status_counts['withdrawn'],
                    'hired': status_counts['hired'],
                    'status_breakdown': self._get_status_breakdown(applications),
                    'recent_activity': self._get_recent_activity(applications, user),
                }
                
            elif user.role == 'recruiter':
                # Get all jobs in a single query
                jobs = JobPosting.objects.filter(recruiter=user)
                
                # Get applications with prefetched data
                applications = JobApplication.objects.filter(
                    job__in=jobs
                ).select_related(
                    'job', 'applicant'
                ).prefetch_related(
                    'activities', 'applicant__professional_profile'
                )
                
                # Use annotation for counts
                from django.db.models import Count, Q
                
                one_week_ago = timezone.now() - timezone.timedelta(days=7)
                
                status_counts = applications.aggregate(
                    total=Count('id'),
                    active=Count('id', filter=Q(
                        status__in=['submitted', 'under_review', 'shortlisted', 'interview', 'offer_extended']
                    )),
                    new=Count('id', filter=Q(status='submitted', created_at__gte=one_week_ago))
                )
                
                stats = {
                    'total_applications': status_counts['total'],
                    'active_applications': status_counts['active'],
                    'new_applications': status_counts['new'],
                    'status_breakdown': self._get_status_breakdown(applications),
                    'job_breakdown': self._get_job_breakdown(applications),
                    'recent_activity': self._get_recent_activity(applications, user),
                }
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error retrieving application statistics: {str(e)}")
            return Response(
                {"error": "Failed to retrieve application statistics", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_status_breakdown(self, applications):
        """Get counts of applications by status."""
        from django.db.models import Count
        return dict(applications.values('status').annotate(count=Count('id')).values_list('status', 'count'))
    
    def _get_job_breakdown(self, applications):
        """Get counts of applications by job (for recruiters)."""
        from django.db.models import Count
        job_stats = applications.values('job__title', 'job_id').annotate(count=Count('id'))
        return {item['job_id']: {'title': item['job__title'], 'count': item['count']} for item in job_stats}
    
    def _get_recent_activity(self, applications, user):
        """Get recent application activities with optimized query."""
        from django.db.models import Prefetch
        
        # Prefetch only the activities we need, already filtered and ordered
        activities = JobApplicationActivity.objects.filter(
            application__in=applications
        ).select_related(
            'application', 
            'application__job'  # Prefetch job details to avoid additional queries
        )
        
        # For applicants, exclude internal activities
        if user.role == 'professional':
            activities = activities.exclude(activity_type__startswith='internal_')
        
        activities = activities.order_by('-timestamp')[:5]
        
        return [{
            'application_id': activity.application_id,
            'job_title': activity.application.job.title,  # No additional query needed!
            'activity_type': activity.activity_type,
            'description': activity.description,
            'timestamp': activity.timestamp
        } for activity in activities]
