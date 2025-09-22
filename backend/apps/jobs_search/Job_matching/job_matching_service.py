import re
from django.db.models import QuerySet, F, Max
from apps.users.models import User
from apps.jobs_postings.models import JobPosting

class JobMatchingService:
    """Service for matching candidates to jobs based on location, experience, job type, and status."""
    
    @staticmethod
    def match_candidate_to_job(user, job):
        """
        Match a user (professional) to a job based on location, experience, job type, and status.
        """
        score = 0
        max_score = 100
        reasons = []
        
        # Check location match (0-30 points)
        location_score = 0
        has_location = False
        
        try:
            if hasattr(user, 'personal_info') and user.personal_info.location:
                has_location = True
                user_location = user.personal_info.location.lower()
                job_location = job.location.lower()
                
                if user_location in job_location or job_location in user_location:
                    location_score = 30
                    reasons.append(f"Your location ({user.personal_info.location}) matches the job location")
                elif hasattr(user.personal_info, 'willing_to_relocate') and user.personal_info.willing_to_relocate:
                    location_score = 20
                    reasons.append("You are willing to relocate for this position")
                else:
                    reasons.append(f"Location mismatch: Job requires {job.location}, your location is {user.personal_info.location}")
        except:
            reasons.append("Unable to compare locations: Your location information is missing")
        
        # If location information is missing, we'll reduce the maximum possible score
        if not has_location:
            max_score -= 30
        else:
            score += location_score
            
        # Check experience level match (0-25 points)
        experience_score = 0
        has_experience = False
        
        try:
            if hasattr(user, 'experience'):
                has_experience = True
                
                # Map user experience to job's required experience level
                user_experience_years = getattr(user.experience, 'years', 0)
                
                # Convert job's experience level to required years (customize based on your data)
                job_required_years = {
                    'entry_level': 0,
                    'mid_level': 3,
                    'senior': 5,
                    'executive': 8
                }.get(job.experience_level, 0)
                
                if user_experience_years >= job_required_years:
                    experience_score = 25
                    reasons.append(f"Your experience ({user_experience_years} years) matches or exceeds the job requirement ({job.experience_level})")
                else:
                    under_by = job_required_years - user_experience_years
                    reasons.append(f"You have {user_experience_years} years of experience, but the job requires {job_required_years} years ({job.experience_level})")
        except:
            reasons.append("Unable to compare experience: Your experience information is missing")
            
        # If experience information is missing, reduce the maximum score
        if not has_experience:
            max_score -= 25
        else:
            score += experience_score
            
        # Check job type match (0-15 points)
        if hasattr(user, 'preferences') and hasattr(user.preferences, 'preferred_job_types'):
            user_job_types = user.preferences.preferred_job_types
            if job.job_type in user_job_types:
                score += 15
                reasons.append(f"Job type ({job.job_type}) matches your preferences")
            else:
                reasons.append(f"Job type ({job.job_type}) does not match your preferred job types")
        else:
            max_score -= 15
            reasons.append("Job type preference not specified in your profile")
            
        # Check remote work preference match (0-10 points)
        if hasattr(user, 'preferences') and hasattr(user.preferences, 'remote_work_preference'):
            if job.is_remote == user.preferences.remote_work_preference:
                score += 10
                if job.is_remote:
                    reasons.append("This remote job matches your preference for remote work")
                else:
                    reasons.append("This in-person job matches your preference for in-person work")
            else:
                if job.is_remote:
                    reasons.append("This job is remote, but you prefer in-person work")
                else:
                    reasons.append("This job is in-person, but you prefer remote work")
        else:
            max_score -= 10
            reasons.append("Remote work preference not specified in your profile")
            
        # Check qualifications/skills match (0-20 points)
        qualification_score = 0
        has_qualifications = False
        
        try:
            if hasattr(user, 'qualifications') and user.qualifications.exists():
                has_qualifications = True
                
                # Extract user skills and job required skills
                user_skills = [q.skill.lower() for q in user.qualifications.all()]
                
                # Extract job skills from description
                job_skills = []
                if job.description:
                    # Extract words that might be skills
                    job_skills = re.findall(r'\b[A-Za-z]+\b', job.description.lower())
                
                # Count matching skills
                matching_skills = [skill for skill in user_skills if skill in job_skills]
                
                if len(matching_skills) > 0:
                    # Calculate score based on match percentage
                    qualification_score = min(20, len(matching_skills) * 5)  # Max 20 points
                    reasons.append(f"Your qualifications match {len(matching_skills)} required skills")
                else:
                    reasons.append("None of your listed qualifications match the job requirements")
        except:
            reasons.append("Unable to compare qualifications: Your qualification information is missing")
            
        # If qualification information is missing, reduce the maximum score
        if not has_qualifications:
            max_score -= 20
        else:
            score += qualification_score
            
        # Normalize the score based on available data
        if max_score > 0:
            normalized_score = min(100, round((score / max_score) * 100))
        else:
            normalized_score = 0
        
        # Add note about profile completeness if max_score < 100
        if max_score < 100:
            reasons.append(f"NOTE: Your profile is incomplete. Complete your profile to improve match accuracy.")
        
        return {
            'score': normalized_score,
            'reasons': reasons,
            'is_match': normalized_score >= 70
        }
        
    @staticmethod
    def find_matching_jobs(user, jobs):
        """
        Find all jobs that match a professional's profile.
        Works with partial profile data, with reduced match quality.
        """
        matches = []
        
        for job in jobs:
            match_result = JobMatchingService.match_candidate_to_job(user, job)
            if match_result['score'] > 0:  # Include all jobs with any match score
                matches.append({
                    'job': job,
                    'score': match_result['score'],
                    'reasons': match_result['reasons'],
                    'is_match': match_result['is_match']
                })
        
        # Sort by match score (highest first)
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches
        
    @staticmethod
    def _has_complete_profile(user):
        """Check if a user has a complete profile for job matching."""
        try:
            # Check if user has personal info with required fields
            has_personal_info = hasattr(user, 'personal_info') and \
                               user.personal_info is not None and \
                               getattr(user.personal_info, 'location', None) and \
                               getattr(user.personal_info, 'phone_number', None)
            
            # Check if user has experience info
            has_experience = hasattr(user, 'experience') and \
                            user.experience is not None
            
            # Check if user has at least one qualification
            has_qualifications = hasattr(user, 'qualifications') and \
                               user.qualifications.exists()
                               
            return has_personal_info and has_experience and has_qualifications
        except Exception as e:
            print(f"Error checking profile completeness: {str(e)}")
            return False
