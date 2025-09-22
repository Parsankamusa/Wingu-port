from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import logging

from apps.jobs_postings.models import JobPosting
from apps.jobs_postings.serializers import JobPostingSerializer
from apps.jobs_search.Job_matching.job_matching_service import JobMatchingService

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matching_jobs(request):
    """Get jobs that match the current user's profile."""
    try:
        user = request.user
        
        # Check if user is a professional
        if user.role != 'professional':
            return Response({
                'error': 'Only professional users can access job matches'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get active jobs
        jobs = JobPosting.objects.filter(status='active')
        
        # include profile completeness information in the response
        profile_status = check_user_profile_completeness(user)
        
        # Get job matches
        matches = JobMatchingService.find_matching_jobs(user, jobs)
        
        # Transform matches for API response
        job_matches = []
        for match in matches:
            job_data = JobPostingSerializer(match['job']).data
            job_matches.append({
                'job': job_data,
                'match_score': match['score'],
                'is_match': match['score'] >= 70,  # Consider scores >= 70 as matches
                'match_reasons': match['reasons']
            })
        
        # Return both job matches and profile status
        return Response({
            'matches_count': len(job_matches),
            'matches': job_matches,
            'profile_status': profile_status
        })
    except Exception as e:
        logger.error(f"Error in job matching: {str(e)}")
        return Response({
            'error': 'Failed to get matching jobs',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_match_details(request, job_id):
    """Get match details for a specific job."""
    try:
        user = request.user
        
        # Check if user is a professional
        if user.role != 'professional':
            return Response({
                'error': 'Only professional users can access job matches'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
            return Response({
                'error': 'Job not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get profile status
        profile_status = check_user_profile_completeness(user)
        
        # Get match details (will work with partial profile data)
        match_result = JobMatchingService.match_candidate_to_job(user, job)
        
        # Include profile completeness in the response
        return Response({
            'job': JobPostingSerializer(job).data,
            'match_score': match_result['score'],
            'is_match': match_result['is_match'],
            'match_reasons': match_result['reasons'],
            'profile_status': profile_status
        })
    except Exception as e:
        logger.error(f"Error in job match details: {str(e)}")
        return Response({
            'error': 'Failed to get job match details',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def check_user_profile_completeness(user):
    """Check user profile completeness and return status details."""
    # Get missing fields
    missing_fields = []
    
    # Check personal info
    try:
        if not hasattr(user, 'personal_info'):
            missing_fields.append('personal_info')
        elif not getattr(user.personal_info, 'location', None):
            missing_fields.append('location')
    except:
        missing_fields.append('personal_info')
    
    # Check experience
    try:
        if not hasattr(user, 'experience'):
            missing_fields.append('experience')
    except:
        missing_fields.append('experience')
    
    # Check qualifications
    try:
        if not user.qualifications.exists():
            missing_fields.append('qualifications')
    except:
        missing_fields.append('qualifications')
    
    # Determine profile completion percentage
    total_fields = 3  # personal_info, experience, qualifications
    completed_fields = total_fields - len(missing_fields)
    completion_percentage = int((completed_fields / total_fields) * 100) if total_fields > 0 else 0
    
    return {
        'is_complete': len(missing_fields) == 0,
        'completion_percentage': completion_percentage,
        'missing_fields': missing_fields,
        'profile_enhancement_tips': generate_profile_tips(missing_fields)
    }

def generate_profile_tips(missing_fields):
    """Generate helpful tips for completing the profile based on missing fields."""
    tips = []
    
    if 'personal_info' in missing_fields or 'location' in missing_fields or 'phone_number' in missing_fields:
        tips.append("Adding your location and contact information will help match you with local job opportunities.")
    
    if 'experience' in missing_fields:
        tips.append("Adding your work experience will significantly improve your job matches, especially for positions requiring specific experience.")
    
    if 'qualifications' in missing_fields:
        tips.append("Adding your qualifications, certifications, and education will help match you with jobs requiring specific credentials.")
    
    # Add a general tip if the list is not empty
    if tips:
        tips.append("Complete your profile to get more accurate job matches and improve your visibility to recruiters.")
    
    return tips