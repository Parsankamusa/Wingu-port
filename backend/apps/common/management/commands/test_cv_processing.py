from django.core.management.base import BaseCommand
import os
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.users.profile_management.cv_processing_logic import (
    extract_cv_information,
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_personal_info,
    extract_experience,
    extract_employment_history,
    extract_qualifications
)

class Command(BaseCommand):
    help = 'Test CV processing functionality with sample CV files'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to a specific CV file to test')
        parser.add_argument('--verbose', action='store_true', help='Show detailed extraction results')
        parser.add_argument('--extract', type=str, choices=['all', 'personal', 'experience', 'employment', 'qualifications'], 
                            default='all', help='Specify which extraction to test')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting CV processing test...'))
        
        file_path = options.get('file')
        verbose = options.get('verbose', False)
        extract_type = options.get('extract', 'all')
        
        if file_path:
            # Test a specific file
            self.test_file(file_path, verbose=verbose, extract_type=extract_type)
        else:
            # Test sample files from a directory
            sample_dir = os.path.join(settings.BASE_DIR, 'test_files', 'cv_samples')
            if not os.path.exists(sample_dir):
                self.stdout.write(self.style.WARNING(
                    f"Sample directory not found: {sample_dir}\n"
                    f"Please create this directory and add sample CV files, or specify a file with --file"
                ))
                return
            
            # Process all files in the sample directory
            for filename in os.listdir(sample_dir):
                file_path = os.path.join(sample_dir, filename)
                if os.path.isfile(file_path) and (file_path.endswith('.pdf') or file_path.endswith('.docx')):
                    self.test_file(file_path, verbose=verbose, extract_type=extract_type)
    
    def test_file(self, file_path, verbose=False, extract_type='all'):
        """Test CV processing on a single file."""
        try:
            self.stdout.write(f"\nTesting file: {os.path.basename(file_path)}")
            
            # Read the file into a SimpleUploadedFile object
            with open(file_path, 'rb') as file:
                file_content = file.read()
                file_name = os.path.basename(file_path)
                uploaded_file = SimpleUploadedFile(file_name, file_content)
            
            if extract_type == 'all':
                # Test the full extraction process
                extracted_data = extract_cv_information(uploaded_file)
                self.display_results(extracted_data, verbose)
            else:
                # Test specific extraction function
                if file_path.endswith('.pdf'):
                    text = extract_text_from_pdf(file_path)
                elif file_path.endswith('.docx'):
                    text = extract_text_from_docx(file_path)
                else:
                    self.stdout.write(self.style.ERROR(f"Unsupported file format: {file_path}"))
                    return
                
                if verbose:
                    self.stdout.write(f"\nExtracted Text (first 500 chars):\n{text[:500]}...")
                
                # Test the specific extraction function
                if extract_type == 'personal':
                    result = extract_personal_info(text)
                    self.stdout.write(self.style.SUCCESS("Personal Information:"))
                    self.print_dict(result)
                    
                elif extract_type == 'experience':
                    result = extract_experience(text)
                    self.stdout.write(self.style.SUCCESS("Experience Information:"))
                    self.print_dict(result)
                    
                elif extract_type == 'employment':
                    result = extract_employment_history(text)
                    self.stdout.write(self.style.SUCCESS("Employment History:"))
                    for i, entry in enumerate(result, 1):
                        self.stdout.write(f"Job {i}:")
                        self.print_dict(entry, indent=2)
                    
                elif extract_type == 'qualifications':
                    result = extract_qualifications(text)
                    self.stdout.write(self.style.SUCCESS("Qualifications:"))
                    for i, qual in enumerate(result, 1):
                        self.stdout.write(f"Qualification {i}:")
                        self.print_dict(qual, indent=2)
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error processing file {os.path.basename(file_path)}: {str(e)}"))
    
    def display_results(self, extracted_data, verbose=False):
        """Display the extracted data in a readable format."""
        # Personal Info
        self.stdout.write(self.style.SUCCESS("\nPersonal Information:"))
        self.print_dict(extracted_data['personal_info'])
        
        # Experience
        self.stdout.write(self.style.SUCCESS("\nExperience:"))
        self.print_dict(extracted_data['experience'])
        
        # Employment History
        self.stdout.write(self.style.SUCCESS("\nEmployment History:"))
        if extracted_data['employment_history']:
            for i, entry in enumerate(extracted_data['employment_history'], 1):
                self.stdout.write(f"Job {i}:")
                self.print_dict(entry, indent=2)
        else:
            self.stdout.write("  No employment history extracted")
        
        # Qualifications
        self.stdout.write(self.style.SUCCESS("\nQualifications:"))
        if extracted_data['qualifications']:
            for i, qual in enumerate(extracted_data['qualifications'], 1):
                self.stdout.write(f"Qualification {i}:")
                self.print_dict(qual, indent=2)
        else:
            self.stdout.write("  No qualifications extracted")
    
    def print_dict(self, data, indent=0):
        """Print dictionary contents in a readable format."""
        if not data:
            self.stdout.write(" " * indent + "None")
            return
        
        for key, value in data.items():
            if isinstance(value, dict):
                self.stdout.write(" " * indent + f"{key}:")
                self.print_dict(value, indent + 2)
            elif isinstance(value, list):
                self.stdout.write(" " * indent + f"{key}: [{len(value)} items]")
                for item in value:
                    if isinstance(item, dict):
                        self.print_dict(item, indent + 2)
                    else:
                        self.stdout.write(" " * (indent + 2) + str(item))
            else:
                self.stdout.write(" " * indent + f"{key}: {value}")