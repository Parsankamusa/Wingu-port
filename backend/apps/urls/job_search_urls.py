from django.urls import path, include
from apps.jobs_search.views import (
    JobSearchView, JobDetailView, SavedSearchListCreateView, 
    SavedSearchDetailView, JobSearchSuggestionsView
)
from apps.jobs_search.Job_matching.matching_logic import (
    get_matching_jobs, get_job_match_details
)

urlpatterns = [
    # Job search endpoints
    path('jobs/search/', JobSearchView.as_view(), name='job-search'),
    path('jobs/<int:job_id>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/suggestions/', JobSearchSuggestionsView.as_view(), name='job-search-suggestions'),
    
    # Job matching endpoint
    path('jobs/matching/', get_matching_jobs, name='job-matching'),
    path('jobs/matching/<int:job_id>/', get_job_match_details, name='job-match-details'),
   
    # Saved search endpoints (for authenticated users)
    path('saved-searches/', SavedSearchListCreateView.as_view(), name='saved-searches-list'),
    path('saved-searches/<int:pk>/', SavedSearchDetailView.as_view(), name='saved-search-detail'),
]
