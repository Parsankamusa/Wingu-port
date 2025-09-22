from django.urls import path
from apps.job_applications.views import (
    JobApplicationViewSet,
    ApplicationDocumentsView,
    ApplicationStatsView
)

# URL patterns for job applications
urlpatterns = [
    # List and Create
    path('applications/', 
         JobApplicationViewSet.as_view({
             'get': 'list', 
             'post': 'create'
         }), 
         name='job-application-list'),
    
    # Detail, Update, Delete
    path('applications/<uuid:pk>/', 
         JobApplicationViewSet.as_view({
             'get': 'retrieve',
             'put': 'update',
             'patch': 'partial_update',
             'delete': 'destroy'
         }), 
         name='job-application-detail'),
    
    # Application documents
    path('applications/<uuid:application_id>/documents/', 
         ApplicationDocumentsView.as_view(), 
         name='application-documents'),

    # Application statistics
    path('applications/stats/', 
         ApplicationStatsView.as_view(), 
         name='application-stats'),
]