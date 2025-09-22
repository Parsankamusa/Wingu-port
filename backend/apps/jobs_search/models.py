from django.db import models
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.contrib.postgres.indexes import GinIndex
from django.db.models import F, Q
from apps.jobs_postings.models import JobPosting

class JobSearchQuery(models.Model):
    """
    Model to track and store user search queries
    This can be used for analytics and to improve search results
    """
    query_text = models.CharField(max_length=255)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='search_queries')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    results_count = models.PositiveIntegerField(default=0)
    filters_used = models.JSONField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Job Search Query"
        verbose_name_plural = "Job Search Queries"
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.query_text} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"


class SavedSearch(models.Model):
    """
    Model for users to save their job searches and receive alerts
    """
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='saved_searches')
    name = models.CharField(max_length=100)
    query = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Search filters
    department = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=50, blank=True)
    experience_level = models.CharField(max_length=20, blank=True)
    aircraft_type = models.CharField(max_length=100, blank=True)
    is_remote = models.BooleanField(null=True, blank=True)
    min_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Notification settings
    notify_by_email = models.BooleanField(default=True)
    notify_frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('instant', 'Instant'),
        ],
        default='weekly'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_notification_sent = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Saved Search"
        verbose_name_plural = "Saved Searches"
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.user.email}"



class JobSearchManager(models.Manager):
    """
    Custom manager for JobSearch model to provide enhanced search capabilities
    """
    def search(self, query=None, location=None, department=None, job_type=None, 
               experience_level=None, aircraft_type=None, is_remote=None, 
               min_salary=None, max_salary=None, ordering=None):
        """
        Advanced search method with multiple filters
        """
        qs = JobPosting.objects.filter(status='active')
        
        # Apply text search if query is provided
        if query:
          try:
            search_vector = SearchVector('title', weight='A') + \
                           SearchVector('description', weight='B') + \
                           SearchVector('responsibilities', weight='C') + \
                           SearchVector('qualifications', weight='C')
            search_query = SearchQuery(query)
            qs = qs.annotate(
                search=search_vector,
                rank=SearchRank(search_vector, search_query)
            ).filter(search=search_query).order_by('-rank')
          except Exception as e:
                # Fallback to simple icontains search if full-text search fails
                qs = qs.filter(
                    Q(title__icontains=query) | 
                    Q(description__icontains=query) | 
                    Q(responsibilities__icontains=query) | 
                    Q(qualifications__icontains=query)
                ).order_by('-created_at')
        else:
            qs = qs.order_by('-created_at')


        
        # Apply filters
        if location:
            qs = qs.filter(location__icontains=location)
        
        if department:
            qs = qs.filter(department__icontains=department)
            
        if job_type:
            qs = qs.filter(job_type=job_type)
            
        if experience_level:
            qs = qs.filter(experience_level=experience_level)
            
        if aircraft_type:
            qs = qs.filter(aircraft_type__icontains=aircraft_type)
            
        if is_remote is not None:
            qs = qs.filter(is_remote=is_remote)
            
        if min_salary:
            qs = qs.filter(salary_min__gte=min_salary)
            
        if max_salary:
            qs = qs.filter(salary_max__lte=max_salary)
        
        # Apply ordering
        if ordering:
            if ordering == 'newest':
                qs = qs.order_by('-created_at')
            elif ordering == 'oldest':
                qs = qs.order_by('created_at')
            elif ordering == 'salary_high':
                qs = qs.order_by('-salary_max', '-salary_min')
            elif ordering == 'salary_low':
                qs = qs.order_by('salary_min', 'salary_max')
        else:
            # Default ordering
            if not query:  # If no text query, order by date
                qs = qs.order_by('-created_at')
        
        return qs


# Add a proxy model for job search to use our custom manager
class JobSearch(JobPosting):
    """
    Proxy model for JobPosting to add enhanced search capabilities
    """
    objects = JobSearchManager()
    
    class Meta:
        proxy = True
