from django.core.management.base import BaseCommand
from apps.jobs_postings.models import JobPosting
from apps.jobs_search.Job_matching.job_matching_service import JobMatchingService
from apps.users.models import User

class Command(BaseCommand):
    help = 'Test job-candidate matching with existing users'

    def add_arguments(self, parser):
        parser.add_argument('--job_id', type=int, help='Specific job ID to test matching against')
        parser.add_argument('--user_id', type=int, help='Specific user ID to test')
        
    def handle(self, *args, **kwargs):
        job_id = kwargs.get('job_id')
        user_id = kwargs.get('user_id')
        
        # Get users with the professional role
        if user_id:
            users = User.objects.filter(id=user_id, role='professional')
            if not users:
                self.stdout.write(self.style.ERROR(f"Professional user with ID {user_id} not found"))
                return
        else:
            users = User.objects.filter(role='professional')[:5]  # Limit to 5 users for testing
            
        if not users:
            self.stdout.write(self.style.ERROR("No professional users found to test with"))
            return
            
        self.stdout.write(f"Found {users.count()} professional users for testing")
        
        if job_id:
            # Test against specific job
            try:
                job = JobPosting.objects.get(id=job_id)
                self.stdout.write(f"Testing against job: {job.title}")
                self.stdout.write(f"  Location: {job.location}")
                self.stdout.write(f"  Experience Level: {job.experience_level}")
                self.stdout.write(f"  Job Type: {job.job_type}")
                self.stdout.write(f"  Remote: {'Yes' if job.is_remote else 'No'}")
                
                for user in users:
                    # Get profile completeness information
                    profile_status = self.check_user_profile_completeness(user)
                    
                    self.stdout.write(self.style.SUCCESS(f"\nUser: {user.email}"))
                    self.stdout.write(f"  Profile completeness: {profile_status['completion_percentage']}%")
                    
                    if not profile_status['is_complete']:
                        self.stdout.write(self.style.WARNING("  Profile incomplete - match quality may be reduced"))
                        self.stdout.write("  Missing fields: " + ", ".join(profile_status['missing_fields']))
                    
                    # Run matching
                    result = JobMatchingService.match_candidate_to_job(user, job)
                    
                    self.stdout.write(f"  Match Score: {result['score']}/100")
                    self.stdout.write(f"  Is Match: {result['is_match']}")
                    self.stdout.write("  Reasons:")
                    for reason in result['reasons']:
                        self.stdout.write(f"    - {reason}")
                        
            except JobPosting.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Job with ID {job_id} not found"))
        else:
            # Test against all active jobs
            jobs = JobPosting.objects.filter(status='active')
            self.stdout.write(f"Testing against {jobs.count()} active jobs")
            
            for user in users:
                self.stdout.write(self.style.SUCCESS(f"\nUser: {user.email}"))
                
                # Get profile completeness information
                profile_status = self.check_user_profile_completeness(user)
                self.stdout.write(f"  Profile completeness: {profile_status['completion_percentage']}%")
                
                if not profile_status['is_complete']:
                    self.stdout.write(self.style.WARNING("  Profile incomplete - match quality may be reduced"))
                    self.stdout.write("  Missing fields: " + ", ".join(profile_status['missing_fields']))
                
                # Find matching jobs
                matches = JobMatchingService.find_matching_jobs(user, jobs)
                
                if matches:
                    self.stdout.write(f"Found {len(matches)} matching jobs")
                    for i, match in enumerate(matches[:5], 1):  # Show top 5
                        self.stdout.write(f"\n  {i}. {match['job'].title}")
                        self.stdout.write(f"     Location: {match['job'].location}")
                        self.stdout.write(f"     Job Type: {match['job'].job_type}")
                        self.stdout.write(f"     Remote: {'Yes' if match['job'].is_remote else 'No'}")
                        self.stdout.write(f"     Score: {match['score']}/100")
                        self.stdout.write("     Match Reasons:")
                        for reason in match['reasons']:
                            self.stdout.write(f"       - {reason}")
                else:
                    self.stdout.write("  No matching jobs found")
    
    def check_user_profile_completeness(self, user):
        """Check user profile completeness and return status details."""
        # Get missing fields
        missing_fields = []
        
        # Check personal info
        try:
            if not hasattr(user, 'personal_info'):
                missing_fields.append('personal_info')
            elif not getattr(user.personal_info, 'location', None):
                missing_fields.append('location')
            elif not getattr(user.personal_info, 'phone_number', None):
                missing_fields.append('phone_number')
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
            'profile_enhancement_tips': self.generate_profile_tips(missing_fields)
        }
    
    def generate_profile_tips(self, missing_fields):
        """Generate helpful tips for completing the profile based on missing fields."""
        tips = []
        
        if 'personal_info' in missing_fields or 'location' in missing_fields or 'phone_number' in missing_fields:
            tips.append("Adding your location and contact information will help match you with local job opportunities.")
        
        if 'experience' in missing_fields:
            tips.append("Adding your work experience will significantly improve your job matches.")
        
        if 'qualifications' in missing_fields:
            tips.append("Adding your qualifications will help match you with jobs requiring specific credentials.")
        
        # Add a general tip if the list is not empty
        if tips:
            tips.append("Complete your profile for better job matches and improved visibility to recruiters.")
        
        return tips
