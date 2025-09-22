"""
Database Population Script using Factory Boy and Faker

This script creates realistic sample data for the WinguPort application, including:
- Users (professionals, recruiters, admins)
- Job Postings with various fields and requirements
- Job Applications with documents and activity history

Usage:
    python manage.py shell
    exec(open('tools/factory.py').read())
"""

import os
import sys
import django
import random
import base64
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction

# Django is already set up when running as a management command

# Import required modules
import factory
from factory.django import DjangoModelFactory
from factory import fuzzy
from faker import Faker

# Import your models
from apps.users.models import User
from apps.jobs_postings.models import JobPosting, JobAttachment
from apps.job_applications.models import JobApplication, JobApplicationDocument, JobApplicationActivity

# Initialize faker
fake = Faker()

# Define sample data for choices
JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'temporary']
EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'executive']
EDUCATION_LEVELS = ['high_school', 'associate', 'bachelor', 'master', 'doctorate']
JOB_CATEGORIES = [
    'software_development', 'data_science', 'design', 'marketing', 
    'sales', 'customer_service', 'finance', 'healthcare', 'education',
    'engineering', 'human_resources', 'legal', 'operations'
]
SKILLS = [
    'Python', 'JavaScript', 'React', 'Django', 'SQL', 'AWS', 'Docker',
    'Java', 'C#', 'Ruby', 'Go', 'Kubernetes', 'Azure', 'GCP',
    'Data Analysis', 'Machine Learning', 'UI/UX Design', 'Project Management',
    'Digital Marketing', 'SEO', 'Content Writing', 'Accounting', 'Leadership',
    'Customer Support', 'Sales', 'Communication', 'Problem Solving'
]
LOCATIONS = [
    'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA',
    'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Los Angeles, CA',
    'Washington DC', 'Atlanta, GA', 'Miami, FL', 'Remote'
]
COMPANIES = [
    'TechInnovate', 'DataCraft', 'WebSolutions Inc.', 'Future Systems',
    'Global Analytics', 'Smart Technologies', 'Cloud Services Ltd.',
    'Creative Minds', 'Innovative Software', 'Enterprise Solutions'
]
APPLICATION_STATUS = [
    'submitted', 'under_review', 'shortlisted', 'interview', 
    'offer_extended', 'hired', 'rejected'
]
DOCUMENT_TYPES = [
    'cv', 'cover_letter', 'certificate', 'license', 'reference', 'portfolio'
]


# Create factory for User model
class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    email = factory.LazyAttribute(lambda _: fake.email())
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
    password = factory.PostGenerationMethodCall('set_password', 'password123')
    is_active = True
    
    # Default role attribute - will be overridden in subclasses
    role = 'professional'
    

class ProfessionalFactory(UserFactory):
    role = 'professional'
    
    @factory.post_generation
    def add_professional_details(self, create, extracted, **kwargs):
        if not create:
            return
            
        # Add professional profile details if needed
        if hasattr(self, 'profile'):
            self.profile.headline = fake.job_title()
            self.profile.bio = fake.paragraph(nb_sentences=5)
            self.profile.skills = random.sample(SKILLS, k=random.randint(3, 8))
            self.profile.years_of_experience = random.randint(0, 15)
            self.profile.education_level = random.choice(EDUCATION_LEVELS)
            self.profile.current_location = fake.city()
            self.profile.save()


class RecruiterFactory(UserFactory):
    role = 'recruiter'
    
    @factory.post_generation
    def add_recruiter_details(self, create, extracted, **kwargs):
        if not create:
            return
            
        # Add recruiter profile details if needed
        if hasattr(self, 'profile'):
            self.profile.company_name = random.choice(COMPANIES)
            self.profile.company_website = f"https://www.{self.profile.company_name.lower().replace(' ', '')}.com"
            self.profile.company_industry = random.choice(JOB_CATEGORIES)
            self.profile.company_size = random.choice(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
            self.profile.save()


class AdminFactory(UserFactory):
    role = 'admin'
    is_staff = True
    is_superuser = True


# Create factory for Job Posting model
class JobPostingFactory(DjangoModelFactory):
    class Meta:
        model = JobPosting
    
    title = factory.LazyAttribute(lambda _: fake.job())
    recruiter = factory.SubFactory(RecruiterFactory)
    description = factory.LazyAttribute(lambda _: '\n\n'.join([
        f"# {fake.catch_phrase()}\n\n",
        f"## About the Role\n\n{fake.paragraph(nb_sentences=5)}\n\n",
        f"## Responsibilities\n\n" + '\n'.join([f"- {fake.sentence()}" for _ in range(5)]) + "\n\n",
        f"## Qualifications\n\n" + '\n'.join([f"- {fake.sentence()}" for _ in range(5)])
    ]))
    
    job_type = factory.fuzzy.FuzzyChoice(['full-time', 'part-time', 'contract', 'temporary'])
    experience_level = factory.fuzzy.FuzzyChoice(['entry', 'mid', 'senior', 'executive'])
    location = factory.fuzzy.FuzzyChoice(LOCATIONS)
    
    # Aviation specific fields
    aircraft_type = factory.LazyAttribute(lambda _: random.choice(['Boeing 737', 'Airbus A320', 'Boeing 747', 'Cessna 172', 'Bombardier CRJ']))
    department = factory.LazyAttribute(lambda _: random.choice(['Pilots', 'Cabin Crew', 'Maintenance', 'Ground Operations', 'Administration']))
    
    # Salary
    salary_min = factory.LazyAttribute(lambda _: random.randint(30, 80) * 1000)
    salary_max = factory.LazyAttribute(lambda obj: obj.salary_min + random.randint(10, 50) * 1000)
    
    is_remote = factory.LazyAttribute(lambda _: random.choice([True, False]))
    status = 'active'
    
    # Date fields
    created_at = factory.LazyAttribute(lambda _: timezone.now() - timedelta(days=random.randint(1, 30)))
    updated_at = factory.LazyAttribute(lambda obj: obj.created_at + timedelta(days=random.randint(0, 5)))
    expiry_date = factory.LazyAttribute(lambda obj: obj.created_at + timedelta(days=random.randint(30, 90)))
    
    # Generate qualifications directly in the model
    qualifications = factory.LazyAttribute(lambda _: '\n'.join([
        f"- {random.choice(['Bachelor', 'Master', 'PhD'])} degree in {fake.job()}",
        f"- {random.randint(2, 10)}+ years experience in {fake.job()}",
        f"- Proficient in {', '.join(random.sample(SKILLS, 3))}",
        f"- Certification in {random.choice(['Project Management', 'Quality Assurance', 'Leadership', 'Agile Methodologies'])}",
        f"- {fake.sentence()}"
    ]))
    
    # Generate responsibilities
    responsibilities = factory.LazyAttribute(lambda _: '\n'.join([
        f"- {fake.sentence()}" for _ in range(5)
    ]))
    
    @factory.post_generation
    def attachments(self, create, extracted, **kwargs):
        if not create:
            return
            
        # Randomly decide if job should have attachments
        if random.choice([True, False]):
            # Create a simple PDF-like content
            file_content = b"Sample job attachment PDF content"
            file_name = f"job_description_{self.id}.pdf"
            
            # Create the attachment
            attachment = JobAttachment(
                job_posting=self,
                file_name=file_name,
                file_size=len(file_content),
                content_type='application/pdf'
            )
            
            # Save the file content
            attachment.file.save(file_name, ContentFile(file_content))
            attachment.save()


# Create factory for Job Application model
class JobApplicationFactory(DjangoModelFactory):
    class Meta:
        model = JobApplication
    
    applicant = factory.SubFactory(ProfessionalFactory)
    job = factory.SubFactory(JobPostingFactory)
    
    cover_letter = factory.LazyAttribute(
        lambda _: '\n\n'.join([
            fake.paragraph(nb_sentences=3),
            fake.paragraph(nb_sentences=4),
            fake.paragraph(nb_sentences=3)
        ])
    )
    
    # Random application status weighted toward earlier stages
    status = factory.LazyAttribute(
        lambda _: random.choices(
            APPLICATION_STATUS, 
            weights=[40, 25, 15, 10, 5, 3, 2], 
            k=1
        )[0]
    )
    
    # JSON field for answers to job questions
    answers = factory.LazyAttribute(
        lambda _: {
            f"question_{i}": fake.paragraph(nb_sentences=2)
            for i in range(1, random.randint(0, 5))
        } if random.choice([True, False]) else None
    )
    
    created_at = factory.LazyAttribute(
        lambda obj: obj.job.created_at + timedelta(days=random.randint(1, 20))
    )
    
    updated_at = factory.LazyAttribute(
        lambda obj: obj.created_at + timedelta(days=random.randint(0, 10))
    )
    
    @factory.post_generation
    def add_documents(self, create, extracted, **kwargs):
        if not create:
            return
            
        # Function to create document within this post_generation context
        def create_document(doc_type, name):
            # Create dummy file content
            file_content = f"Sample {doc_type} content for {self.applicant.email}".encode()
            
            # Create the document
            document = JobApplicationDocument(
                application=self,
                document_type=doc_type,
                name=name,
                size=len(file_content)
            )
            
            # Save the file
            file_name = f"{doc_type}_{self.id}_{name}"
            document.file.save(file_name, ContentFile(file_content))
            document.save()
            
        # Always add a CV
        create_document('cv', 'Resume.pdf')
        
        # Maybe add other documents
        if random.random() > 0.5:
            create_document('cover_letter', 'Cover_Letter.pdf')
            
        if random.random() > 0.7:
            create_document('certificate', 'Certificate.pdf')
            
        if random.random() > 0.8:
            create_document('reference', 'Reference_Letter.pdf')
    
    @factory.post_generation
    def add_activities(self, create, extracted, **kwargs):
        if not create:
            return
            
        # Always create the initial submission activity
        JobApplicationActivity.objects.create(
            application=self,
            performed_by=self.applicant,
            activity_type='application_submitted',
            description='Application submitted',
            new_status='submitted',
            timestamp=self.created_at
        )
        
        # Add activities based on the current status
        statuses = ['submitted', 'under_review', 'shortlisted', 'interview', 
                   'offer_extended', 'hired', 'rejected']
        current_status_idx = statuses.index(self.status)
        
        # Create activity history up to the current status
        last_date = self.created_at
        last_status = 'submitted'
        
        for i in range(1, current_status_idx + 1):
            new_status = statuses[i]
            activity_date = last_date + timedelta(days=random.randint(1, 5))
            
            # Determine who performed the action
            if new_status == 'withdrawn':
                actor = self.applicant
                activity_type = 'application_withdrawn'
                description = 'Application withdrawn by candidate'
            else:
                actor = self.job.recruiter
                activity_type = f'status_changed_to_{new_status}'
                description = f'Application status changed from {last_status} to {new_status}'
            
            JobApplicationActivity.objects.create(
                application=self,
                performed_by=actor,
                activity_type=activity_type,
                description=description,
                previous_status=last_status,
                new_status=new_status,
                timestamp=activity_date
            )
            
            last_date = activity_date
            last_status = new_status


@transaction.atomic
def create_sample_data(num_professionals=20, num_recruiters=5, num_admins=2, 
                      num_job_postings=30, num_applications=50):
    """
    Create sample data for the WinguPort application.
    
    Args:
        num_professionals: Number of professional users to create
        num_recruiters: Number of recruiter users to create
        num_admins: Number of admin users to create
        num_job_postings: Number of job postings to create
        num_applications: Number of job applications to create
    """
    print("Creating sample data for WinguPort...")
    
    # Create users
    print(f"Creating {num_professionals} professionals...")
    professionals = [ProfessionalFactory() for _ in range(num_professionals)]
    
    print(f"Creating {num_recruiters} recruiters...")
    recruiters = [RecruiterFactory() for _ in range(num_recruiters)]
    
    print(f"Creating {num_admins} admins...")
    admins = [AdminFactory() for _ in range(num_admins)]
    
    # Create job postings
    print(f"Creating {num_job_postings} job postings...")
    job_postings = []
    for _ in range(num_job_postings):
        job = JobPostingFactory(recruiter=random.choice(recruiters))
        job_postings.append(job)
    
    # Create job applications
    print(f"Creating {num_applications} job applications...")
    for _ in range(num_applications):
        # Ensure unique job-applicant pairs
        while True:
            job = random.choice(job_postings)
            applicant = random.choice(professionals)
            
            # Check if this applicant already applied to this job
            if not JobApplication.objects.filter(job=job, applicant=applicant).exists():
                break
        
        JobApplicationFactory(job=job, applicant=applicant)
    
    print("\nSample data creation complete!")
    print(f"- {num_professionals} professional users created")
    print(f"- {num_recruiters} recruiter users created")
    print(f"- {num_admins} admin users created")
    print(f"- {num_job_postings} job postings created")
    print(f"- {num_applications} job applications created")
    print("\nYou can log in as any user with the password: password123")


if __name__ == "__main__":
    # This block will execute if the script is run directly
    create_sample_data()
else:
    # This allows for importing and calling create_sample_data from elsewhere
    print("Factory module loaded. Run create_sample_data() to generate sample data.")
