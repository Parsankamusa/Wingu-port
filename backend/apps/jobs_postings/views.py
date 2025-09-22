import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.core.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import JobPosting, JobAttachment, JobTrack
from .serializers import (
    JobPostingSerializer, JobPostingListSerializer, 
    JobAttachmentSerializer, JobAttachmentCreateSerializer, JobTrackSerializer
)
from core.permissions.permissions import IsRecruiter, IsOwnerOrAdmin

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Custom pagination class for job listings."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class JobPostingListView(APIView):
    """
    View for listing job postings.
    GET: List all active job postings (paginated) at /job-postings/list/
    """

    pagination_class = StandardResultsSetPagination

    def get(self, request, *args, **kwargs):
        """List all active job postings with pagination."""
        try:
            # Get query parameters
            status_filter = request.query_params.get("status", "all")
            search_query = request.query_params.get("search", "")

            # Build queryset based on filters
            queryset = JobPosting.objects.all()

            # Filter by status (default to active)
            if status_filter != "all":
                queryset = queryset.filter(status=status_filter)

                # For active jobs, ensure they are not expired
                if status_filter == "active":
                    queryset = queryset.filter(
                        Q(expiry_date__gt=timezone.now()) | Q(expiry_date__isnull=True)
                    )

            # Apply search filters if provided
            if search_query:
                queryset = queryset.filter(
                    Q(title__icontains=search_query)
                    | Q(aircraft_type__icontains=search_query)
                    | Q(description__icontains=search_query)
                    | Q(location__icontains=search_query)
                )

            # Apply pagination
            paginator = self.pagination_class()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
            serializer = JobPostingListSerializer(paginated_queryset, many=True)

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            logger.error(f"Error retrieving job postings: {str(e)}")
            return Response(
                {"error": "Failed to retrieve job postings", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobPostingCreateView(APIView):
    """
    View for creating job postings.
    POST: Create a new job posting at /job-postings/add/

    Note: This endpoint only accepts POST requests.
    """

    permission_classes = [IsAuthenticated, IsRecruiter]

    
    def post(self, request, *args, **kwargs):
        """Create a new job posting (recruiters only)."""
        # Double check that the user is authenticated and is a recruiter
        if not request.user.is_authenticated:
            return Response(
                {
                    "error": "Authentication is required. Please provide a valid Bearer token."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if request.user.role != "recruiter":
            return Response(
                {
                    "error": f"Only recruiters can post jobs. Your current role is: {request.user.role}"
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            serializer = JobPostingSerializer(
                data=request.data, context={"request": request}
            )

            if serializer.is_valid():
                # Set the recruiter to the current user
                job_posting = serializer.save(recruiter=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except ValidationError as ve:
            logger.error(f"Validation error creating job posting: {str(ve)}")
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating job posting: {str(e)}")
            return Response(
                {"error": "Failed to create job posting", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class JobViewTrackAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        try:
            job = JobPosting.objects.get(pk=job_id)
            user = request.user
            # Only one view per user per job (update timestamp if exists)
            job_view, created = JobTrack.objects.get_or_create(job=job, user=user)
            if not created:
                job_view.viewed_at = timezone.now()
                job_view.save()
            serializer = JobTrackSerializer(job_view)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

class JobViewStatsAPIView(APIView):
    """
    Returns stats and records for job views.
    GET /api/v1/job-postings/<job_id>/view-stats/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = JobPosting.objects.get(pk=job_id)
            views_qs = JobTrack.objects.filter(job=job)
            total_views = views_qs.count()
            serializer = JobTrackSerializer(views_qs, many=True)
            return Response({
                "job_id": job_id,
                "total_views": total_views,
                "view_records": serializer.data
            })
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)
class JobPostingDetailView(APIView):
    """
    View for retrieving job posting details.
    GET: Retrieve job posting details at /job-postings/<id>/
    """

    def get(self, request, pk, *args, **kwargs):
        """Retrieve detailed information for a specific job posting."""
        try:
            job_posting = self._get_job_posting(pk)
            if not job_posting:
                return Response(
                    {"error": "Job posting not found"}, status=status.HTTP_404_NOT_FOUND
                )

            serializer = JobPostingSerializer(job_posting)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error retrieving job posting {pk}: {str(e)}")
            return Response(
                {
                    "error": f"Failed to retrieve job posting with ID {pk}",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_job_posting(self, pk):
        """Helper method to retrieve job posting by ID."""
        try:
            return JobPosting.objects.get(pk=pk)
        except JobPosting.DoesNotExist:
            return None


class JobPostingUpdateView(APIView):
    """
    View for updating job postings.
    PUT/PATCH: Update job posting (owner or admin only) at /job-postings/update/<id>/
    """

    permission_classes = [IsAuthenticated, IsRecruiter]

    def put(self, request, pk, *args, **kwargs):
        """Update a job posting (full update)."""
        return self._update_job_posting(request, pk, partial=False)

    def patch(self, request, pk, *args, **kwargs):
        """Update a job posting (partial update)."""
        return self._update_job_posting(request, pk, partial=True)

    def _get_job_posting(self, pk):
        """Helper method to retrieve job posting by ID."""
        try:
            return JobPosting.objects.get(pk=pk)
        except JobPosting.DoesNotExist:
            return None

    def _update_job_posting(self, request, pk, partial=False):
        """Helper method to update job posting."""
        try:
            job_posting = self._get_job_posting(pk)
            if not job_posting:
                return Response(
                    {"error": "Job posting not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Check if user is the recruiter who created the job posting
            if job_posting.recruiter != request.user and not request.user.is_staff:
                return Response(
                    {"error": "You do not have permission to update this job posting"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = JobPostingSerializer(
                job_posting,
                data=request.data,
                partial=partial,
                context={"request": request},
            )

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error updating job posting {pk}: {str(e)}")
            return Response(
                {
                    "error": f"Failed to update job posting with ID {pk}",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobPostingDeleteView(APIView):
    """
    View for deleting job postings.
    DELETE: Delete job posting (owner or admin only) at /job-postings/delete/<id>/
    """

    permission_classes = [IsAuthenticated, IsRecruiter]

    def delete(self, request, pk, *args, **kwargs):
        """Delete a job posting."""
        try:
            job_posting = self._get_job_posting(pk)
            if not job_posting:
                return Response(
                    {"error": "Job posting not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Check if user is the recruiter who created the job posting
            if job_posting.recruiter != request.user and not request.user.is_staff:
                return Response(
                    {"error": "You do not have permission to delete this job posting"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            job_posting.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.error(f"Error deleting job posting {pk}: {str(e)}")
            return Response(
                {
                    "error": f"Failed to delete job posting with ID {pk}",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_job_posting(self, pk):
        """Helper method to retrieve job posting by ID."""
        try:
            return JobPosting.objects.get(pk=pk)
        except JobPosting.DoesNotExist:
            return None


class RecruiterJobPostingsView(APIView):
    """
    View for recruiters to manage their job postings.
    GET: List all job postings created by the authenticated recruiter at /recruiter/job-postings/list
    """

    permission_classes = [IsAuthenticated, IsRecruiter]
    pagination_class = StandardResultsSetPagination

    def get(self, request, *args, **kwargs):
        """List all job postings created by the authenticated recruiter."""
        try:
            # Get query parameters
            status_filter = request.query_params.get("status", "all")

            # Build queryset - only show jobs posted by this recruiter
            queryset = JobPosting.objects.filter(recruiter=request.user)

            # Apply status filter if provided and not 'all'
            if status_filter != "all":
                queryset = queryset.filter(status=status_filter)

            # Apply pagination
            paginator = self.pagination_class()
            paginated_queryset = paginator.paginate_queryset(queryset, request)
            serializer = JobPostingSerializer(paginated_queryset, many=True)

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            logger.error(f"Error retrieving recruiter job postings: {str(e)}")
            return Response(
                {"error": "Failed to retrieve your job postings", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
