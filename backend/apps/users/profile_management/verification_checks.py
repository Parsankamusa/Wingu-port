from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import UploadedFile, VerificationStatus, DocumentVerification, UserVerificationStatus

User = get_user_model()

# Document verification utility functions
def check_job_eligibility(user, job):
    """
    Check if a user is eligible to apply for a specific job based on verified documents.
    
    Args:
        user: The user to check
        job: The job posting to check eligibility for
        
    Returns:
        dict: A dictionary containing eligibility information
    """
    # Get or create verification status for the user
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
    
    # Define required document categories based on job requirements
    required_docs = ['education', 'identity']
    
    # Add license/certification requirement if job requires it
    if hasattr(job, 'requires_license') and job.requires_license:
        required_docs.append('license')
    
    # Get user's verified documents

    verified_docs = UploadedFile.objects.filter(
        user=user,
        verification_status=VerificationStatus.VERIFIED,
        category__in=required_docs
    ).values_list('category', flat=True)
    
    # Find missing document categories
    missing_docs = set(required_docs) - set(verified_docs)
    min_experience = getattr(job, 'min_experience', 0)
    if min_experience > 0 and not verification_status.employment_verified:
        missing_docs.add('employment_history')
    
    # Determine if user can apply
    can_apply = len(missing_docs) == 0
    
    return {
        'can_apply': can_apply,
        'missing_documents': list(missing_docs),
        'verification_percentage': verification_status.verification_percentage
    }

def update_user_verification_status(document):
    """
    Update the user's verification status based on verified documents.
    
    Args:
        document: The document that was verified
    """
    user = document.user
    
    # Get or create user verification status
    user_status, created = UserVerificationStatus.objects.get_or_create(
        user=user,
        defaults={
            'is_verified': False,
            'education_verified': False,
            'employment_verified': False, 
            'identity_verified': False,
            'licenses_verified': False
        }
    )
    
    # Update verification flags based on document category
    category = document.category.lower()
    
    if 'education' in category:
        user_status.education_verified = True
    
    if 'passport' in category or 'identity' in category or 'id' in category:
        user_status.identity_verified = True
        
    if 'license' in category or 'certification' in category:
        user_status.licenses_verified = True
        
    if 'employment' in category or 'experience' in category or 'work' in category:
        user_status.employment_verified = True
    
    # Check if all required fields are verified
    required_fields = [
        user_status.education_verified,
        user_status.identity_verified
    ]
    
    # Mark as verified if all required documents are verified
    user_status.is_verified = all(required_fields)
    user_status.last_verification_date = timezone.now()
    user_status.save()
