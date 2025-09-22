import logging
from django.utils import timezone
from django.db.models import Q
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from apps.jobs_postings.models import JobPosting
from apps.jobs_postings.serializers import JobPostingSerializer
from .models import JobSearch, JobSearchQuery, SavedSearch
from .serializers import (
    JobSearchSerializer, JobDetailSerializer, 
    SavedSearchSerializer, SearchQuerySerializer
)

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class JobSearchView(APIView):
    """
    View for searching and filtering job postings.
    GET: Search for job postings with various filters
    """
    pagination_class = StandardResultsSetPagination
    
    def get(self, request, *args, **kwargs):
        """Search for job postings with various filters."""
        try:
            # Extract search parameters
            query = request.query_params.get('query', '')
            location = request.query_params.get('location', '')
            department = request.query_params.get('department', '')
            job_type = request.query_params.get('job_type', '')
            experience_level = request.query_params.get('experience_level', '')
            aircraft_type = request.query_params.get('aircraft_type', '')
            is_remote = request.query_params.get('is_remote')
            min_salary = request.query_params.get('min_salary')
            max_salary = request.query_params.get('max_salary')
            ordering = request.query_params.get('ordering')
            
            if is_remote is not None:
                is_remote = is_remote.lower() in ['true', '1', 't', 'y', 'yes']
            
            # Convert salary values to decimal if provided
            if min_salary:
                try:
                    min_salary = float(min_salary)
                except ValueError:
                    min_salary = None
                    
            if max_salary:
                try:
                    max_salary = float(max_salary)
                except ValueError:
                    max_salary = None
            
            # Get search results with optimized prefetching
            results = JobSearch.objects.search(
                query=query,
                location=location,
                department=department,
                job_type=job_type,
                experience_level=experience_level,
                aircraft_type=aircraft_type,
                is_remote=is_remote,
                min_salary=min_salary,
                max_salary=max_salary,
                ordering=ordering
            ).select_related(
                'recruiter'  # Fetch recruiter details in the same query
            ).prefetch_related(
                'attachments',     # Prefetch job attachments
                'applications'     # Prefetch job applications if needed
            )
            
            # Log search query if meaningful
            if query or location or department or job_type or experience_level or aircraft_type:
                # Store search query
                filters_used = {
                    'location': location,
                    'department': department,
                    'job_type': job_type,
                    'experience_level': experience_level,
                    'aircraft_type': aircraft_type,
                    'is_remote': is_remote,
                    'min_salary': min_salary,
                    'max_salary': max_salary,
                    'ordering': ordering
                }
                
                # Count results before creating log (to avoid multiple evaluations of queryset)
                results_count = results.count()
                
                search_query = JobSearchQuery(
                    query_text=query,
                    results_count=results_count,
                    filters_used=filters_used
                )
                
                # Associate with user if authenticated
                if request.user.is_authenticated:
                    search_query.user = request.user
                    
                # Get IP address
                search_query.ip_address = self.get_client_ip(request)
                search_query.save()
            
            # Use .all() to preserve prefetched data through pagination
            paginator = self.pagination_class()
            paginated_results = paginator.paginate_queryset(results.all(), request)
            
            # Serialize and return with request context for proper URL resolution
            serializer = JobSearchSerializer(paginated_results, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in job search: {str(e)}")
            return Response(
                {"error": "Failed to perform search", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class JobDetailView(APIView):
    """
    View for retrieving detailed job information.
    GET: Retrieve detailed information about a specific job posting
    """
    def get(self, request, job_id, *args, **kwargs):
        """Retrieve detailed information about a specific job posting."""
        try:
            # Get job by ID with optimized prefetching, must be active
            job = JobPosting.objects.filter(
                id=job_id,
                status='active'
            ).select_related(
                'recruiter'  # Fetch recruiter details in the same query
            ).prefetch_related(
                'attachments',     # Prefetch job attachments
                'applications'     # Prefetch job applications if needed
            ).first()
            
            if not job:
                return Response(
                    {"error": "Job posting not found or not active"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Serialize and return with request context
            serializer = JobDetailSerializer(job, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error retrieving job details: {str(e)}")
            return Response(
                {"error": "Failed to retrieve job details", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SavedSearchListCreateView(generics.ListCreateAPIView):
    """
    View for listing and creating saved searches.
    GET: List user's saved searches
    POST: Create a new saved search
    """
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return saved searches for the current user with optimized prefetching."""
        return SavedSearch.objects.filter(
            user=self.request.user
        ).select_related('user')


class SavedSearchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, or deleting a saved search.
    """
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return saved searches for the current user with optimized prefetching."""
        return SavedSearch.objects.filter(
            user=self.request.user
        ).select_related('user')


class JobSearchSuggestionsView(APIView):
    """
    View for getting search suggestions based on partial input.
    GET: Get suggestions for search autocomplete
    """
    def get(self, request, *args, **kwargs):
        """Get suggestions for search autocomplete based on partial input."""
        try:
            query = request.query_params.get('q', '')
            suggestion_type = request.query_params.get('type', 'all')
            
            if not query or len(query) < 2:
                return Response([])
            
            suggestions = []
            limit = 10
            
            # Get active job postings
            jobs = JobPosting.objects.filter(status='active')
            
            # Using a more optimized approach with lists of suggestions
            all_suggestions = []
            
            if suggestion_type == 'title' or suggestion_type == 'all':
                # Get title suggestions
                title_suggestions = jobs.filter(title__icontains=query) \
                                       .values_list('title', flat=True) \
                                       .distinct()[:limit]
                all_suggestions.extend([{'type': 'title', 'value': title} for title in title_suggestions])
            
            if suggestion_type == 'location' or suggestion_type == 'all':
                # Get location suggestions
                location_suggestions = jobs.filter(location__icontains=query) \
                                          .values_list('location', flat=True) \
                                          .distinct()[:limit]
                all_suggestions.extend([{'type': 'location', 'value': location} for location in location_suggestions])
            
            if suggestion_type == 'aircraft_type' or suggestion_type == 'all':
                # Get aircraft type suggestions
                aircraft_suggestions = jobs.filter(aircraft_type__icontains=query) \
                                          .values_list('aircraft_type', flat=True) \
                                          .distinct()[:limit]
                all_suggestions.extend([{'type': 'aircraft_type', 'value': aircraft} for aircraft in aircraft_suggestions])
            
            return Response(all_suggestions)
            
        except Exception as e:
            logger.error(f"Error getting search suggestions: {str(e)}")
            return Response(
                {"error": "Failed to get search suggestions", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


