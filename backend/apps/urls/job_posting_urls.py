from django.urls import path
from apps.jobs_postings.views import (
    JobPostingListView,
    JobPostingCreateView,
    JobPostingDetailView,
    JobPostingUpdateView,
    JobPostingDeleteView,
    RecruiterJobPostingsView,
    JobViewTrackAPIView,
    JobViewStatsAPIView
)

app_name = 'job_postings'

urlpatterns = [
    # Job Posting Endpoints
    path('job-postings/active/list/', JobPostingListView.as_view(), name='job-list'),
    path('job-postings/add/', JobPostingCreateView.as_view(), name='job-create'),
    path('job-postings/<int:pk>/', JobPostingDetailView.as_view(), name='job-detail'),
    path('job-postings/update/<int:pk>/', JobPostingUpdateView.as_view(), name='job-update'),
    path('job-postings/delete/<int:pk>/', JobPostingDeleteView.as_view(), name='job-delete'),
    path('recruiter/job-postings/list/', RecruiterJobPostingsView.as_view(), name='recruiter-jobs'),
    # Job view tracking endpoint
    path('job-postings/<int:job_id>/track-view/', JobViewTrackAPIView.as_view(), name='job-track-view'),
    path('job-postings/<int:job_id>/views/stats/', JobViewStatsAPIView.as_view(), name='job-views'),
]
