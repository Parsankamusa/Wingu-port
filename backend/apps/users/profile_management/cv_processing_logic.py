"""CV processing module for extracting information from CV/resume files."""
import re
import os
import tempfile
from datetime import datetime

# Aviation-specific constants and keywords
AVIATION_LICENSES = [
    'ATPL', 'Airline Transport Pilot License', 'Airline Transport Pilot Licence',
    'CPL', 'Commercial Pilot License', 'Commercial Pilot Licence',
    'PPL', 'Private Pilot License', 'Private Pilot Licence',
    'EASA license', 'FAA license', 'ICAO license', 'DGCA license', 'CAA license',
    'Type Rating', 'Flight Instructor', 'FI ', 'Instrument Rating', 'IRI ',
    'Multi-Crew Cooperation', 'MCC', 'Cabin Crew Certificate',
    'Safety & Emergency Procedures', 'SEP Certificate'
]

AVIATION_EXPERIENCE_KEYWORDS = [
    'Flight Hours', 'Total flight hours', 'PIC hours', 'Pilot in Command',
    'SIC hours', 'Second in Command', 'Multi-engine hours',
    'IFR hours', 'Instrument Flight Rules', 'VFR hours', 'Visual Flight Rules',
    'Simulator training', 'Sim hours', 'Aircraft types flown'
]

AVIATION_TECHNICAL_SKILLS = [
    'Flight planning', 'Aircraft performance', 'Navigation systems', 'FMS', 'GPS', 
    'RNAV', 'ILS', 'Crew Resource Management', 'CRM', 'Safety Management System', 'SMS',
    'Human Factors', 'Emergency handling', 'Maintenance awareness', 'Ground operations'
]

AVIATION_COMPLIANCE_KEYWORDS = [
    'ICAO standards', 'EASA Part-FCL', 'FAA Part 61', 'FAA Part 141',
    'DGCA compliance', 'CAA compliance', 'Aviation security',
    'Quality assurance', 'Risk management', 'Fatigue management'
]

AVIATION_SOFT_SKILLS = [
    'Leadership', 'Decision making under pressure', 'Teamwork in multi-crew',
    'Communication skills', 'Situational awareness', 'Problem solving',
    'Passenger safety', 'Customer service'
]

AVIATION_EDUCATION_KEYWORDS = [
    'Aviation management', 'Aerospace engineering', 'Meteorology',
    'Air traffic control', 'Aviation English Proficiency', 'ICAO Level'
]

AIRCRAFT_TYPES = [
    'Boeing 737', 'Boeing 747', 'Boeing 757', 'Boeing 767', 'Boeing 777', 'Boeing 787',
    'Airbus A320', 'Airbus A330', 'Airbus A340', 'Airbus A350', 'Airbus A380',
    'Embraer', 'Bombardier', 'Cessna', 'ATR', 'Fokker', 'McDonnell Douglas',
    'Beechcraft', 'Piper', 'Dash 8', 'CRJ', 'Saab', 'Dornier', 'Learjet'
]

# Function to parse date from various string formats
def parse_date_from_string(date_str):
    """
    Parse date from various string formats.
    
    Args:
        date_str (str): Date string to parse
        
    Returns:
        datetime.date: Parsed date object or None if parsing fails
    """
    date_str = date_str.strip()
    
    # Handle "Present", "Current", "Now", "to present"
    if date_str.lower() in ['present', 'current', 'now', 'to date', 'today', 'ongoing', 'to present']:
        return None
    
    # Handle MM/YYYY format (e.g. 01/2020)
    if '/' in date_str and len(date_str.split('/')) == 2:
        try:
            month, year = date_str.split('/')
            return datetime(int(year), int(month), 1).date()
        except (ValueError, IndexError):
            pass
    
    # Handle MM-YYYY format (e.g. 01-2020)
    if '-' in date_str and len(date_str.split('-')) == 2:
        try:
            parts = date_str.split('-')
            # Check if first part is month
            if len(parts[0]) <= 2:
                month, year = parts
                return datetime(int(year), int(month), 1).date()
        except (ValueError, IndexError):
            pass
    
    # Handle YYYY format (e.g. 2020)
    if date_str.isdigit() and len(date_str) == 4:
        try:
            return datetime(int(date_str), 1, 1).date()
        except ValueError:
            pass
    
    # Try common date formats
    date_formats = [
        '%B %Y',     # January 2020
        '%b %Y',     # Jan 2020
        '%m/%Y',     # 01/2020
        '%m-%Y',     # 01-2020
        '%Y'         # 2020
    ]
    
    for date_format in date_formats:
        try:
            return datetime.strptime(date_str, date_format).date()
        except ValueError:
            continue
    
    # If all parsing attempts fail
    print(f"Could not parse date: {date_str}")
    return None

# Try to import CV processing libraries
try:
    import PyPDF2
    import docx
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize, sent_tokenize
    
    # Try to import pytesseract and PIL for image processing
    try:
        import pytesseract
        from PIL import Image
        OCR_ENABLED = True
    except ImportError:
        OCR_ENABLED = False
        print("pytesseract not available. OCR capability disabled.")
    
    # Download necessary NLTK resources
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
        
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
        
except ImportError:
    # Handle the case where one or more required libraries are not installed
    pass



def extract_cv_information(cv_file):
    """
    Extract information from a CV file with enhanced support for multiple formats.
    Handles PDFs (including image-based), DOCX, and image files through OCR.
    Includes special handling for aviation-specific data.
    """
    extracted_data = {
        'personal_info': {},
        'experience': {},
        'employment_history': [],
        'qualifications': [],
        'aviation_data': {
            'licenses': [],
            'flight_experience': {},
            'aviation_skills': {}
        }
    }
    
    file_ext = os.path.splitext(cv_file.name)[1].lower()
    
    # Save the uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
        for chunk in cv_file.chunks():
            temp_file.write(chunk)
        temp_file_path = temp_file.name
    
    try:
        extracted_text = ""
        
        # Extract text based on file type
        if file_ext == '.pdf':
            # First try normal PDF text extraction
            extracted_text = extract_text_from_pdf(temp_file_path)
            
            # If little text was extracted, the PDF might be image-based - try OCR
            if len(extracted_text.strip()) < 100 and OCR_ENABLED:
                print("PDF appears to be image-based or has little text. Attempting OCR...")
                
                # Use OCR on the PDF (treat it like an image)
                try:
                    from pdf2image import convert_from_path
                    
                    # Convert PDF to images
                    pdf_images = convert_from_path(temp_file_path, dpi=300)
                    
                    # Process each page with OCR
                    ocr_texts = []
                    for i, image in enumerate(pdf_images):
                        # Save the image temporarily
                        img_path = f"{temp_file_path}_page_{i}.png"
                        image.save(img_path, 'PNG')
                        
                        # Extract text with OCR
                        page_text = extract_text_from_image(img_path)
                        ocr_texts.append(page_text)
                        
                        # Remove the temporary image
                        try:
                            os.unlink(img_path)
                        except:
                            pass
                    
                    # Combine OCR text from all pages
                    ocr_text = "\n\n".join(ocr_texts)
                    
                    # If OCR extracted more text, use it
                    if len(ocr_text) > len(extracted_text):
                        print(f"OCR extracted {len(ocr_text)} characters, compared to {len(extracted_text)} with direct extraction")
                        extracted_text = ocr_text
                
                except ImportError:
                    print("pdf2image not installed. Cannot process image-based PDFs with OCR.")
                except Exception as e:
                    print(f"Error using OCR on PDF: {str(e)}")
        
        # Extract text from DOCX
        elif file_ext == '.docx':
            extracted_text = extract_text_from_docx(temp_file_path)
        
        # Handle image formats using OCR
        elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.bmp', '.gif']:
            if OCR_ENABLED:
                extracted_text = extract_text_from_image(temp_file_path)
            else:
                print("OCR capability is disabled. Cannot extract text from image files.")
        
        # Try plain text file
        elif file_ext in ['.txt', '.text', '.md', '.rtf']:
            try:
                with open(temp_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    extracted_text = f.read()
            except Exception as e:
                print(f"Error reading text file: {str(e)}")
        
        else:
            print(f"Unsupported file format: {file_ext}")
            extracted_text = ""
            
        # Print the extracted text for debugging
        print(f"Extracted text length: {len(extracted_text)}")
        if len(extracted_text) < 100:
            print("Warning: Very little text extracted. The file may be empty, unreadable, or incompatible.")
            if len(extracted_text) > 0:
                print(f"Preview: {extracted_text[:100]}")
        
        # Process the extracted text if we have enough content
        if extracted_text and len(extracted_text.strip()) > 50:  # Ensure we have meaningful text
            # Extract personal information
            extracted_data['personal_info'] = extract_personal_info(extracted_text)
            
            # First check if this is an aviation CV by looking for keywords
            is_aviation_cv = check_if_aviation_cv(extracted_text)
            
            # Extract general experience (this works for all CVs)
            extracted_data['experience'] = extract_experience(extracted_text)
            
            # Extract employment history
            extracted_data['employment_history'] = extract_employment_history(extracted_text)
            
            # Perform special aviation-specific extraction if it's an aviation CV
            if is_aviation_cv:
                print("Detected aviation CV, performing specialized extraction")
                
                # Extract aviation licenses
                aviation_licenses = extract_aviation_licenses(extracted_text)
                extracted_data['aviation_data']['licenses'] = aviation_licenses
                
                # Extract flight experience
                flight_experience = extract_aviation_experience(extracted_text)
                extracted_data['aviation_data']['flight_experience'] = flight_experience
                
                # Extract aviation skills
                aviation_skills = extract_aviation_skills(extracted_text)
                extracted_data['aviation_data']['aviation_skills'] = aviation_skills
                
                # Add aviation certifications to qualifications
                extracted_data['qualifications'] = extract_qualifications_excluding_licenses(extracted_text, aviation_licenses)
            else:
                # Regular qualification extraction for non-aviation CVs
                extracted_data['qualifications'] = extract_qualifications(extracted_text)
        else:
            print("Insufficient text extracted from the CV. Unable to process.")
    
    except Exception as e:
        # Log the error
        print(f"Error extracting information from CV: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up the temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass
    
    return extracted_data


def check_if_aviation_cv(text):
    """
    Determine if the CV is aviation-related based on keyword frequency.
    
    Args:
        text (str): The CV text content
        
    Returns:
        bool: True if likely an aviation CV, False otherwise
    """
    # Combine all aviation-related keywords
    aviation_keywords = (
        AVIATION_LICENSES +
        AVIATION_EXPERIENCE_KEYWORDS +
        AVIATION_TECHNICAL_SKILLS +
        AVIATION_COMPLIANCE_KEYWORDS +
        AIRCRAFT_TYPES
    )
    
    # Count occurrences of aviation keywords
    aviation_keyword_count = 0
    for keyword in aviation_keywords:
        matches = re.findall(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE)
        aviation_keyword_count += len(matches)
    
    # Check for common aviation license references
    license_matches = re.findall(r'\b(?:ATPL|CPL|PPL|Type Rating|Flight Instructor)\b', text, re.IGNORECASE)
    if len(license_matches) >= 2:
        return True
    
    # Check for flight hours
    flight_hour_matches = re.findall(r'(?:flight|flying) hours', text, re.IGNORECASE)
    if flight_hour_matches and aviation_keyword_count >= 5:
        return True
    
    # High aviation keyword frequency
    if aviation_keyword_count >= 10:
        return True
    
    # Check for specific aviation job titles
    aviation_job_titles = [
        'pilot', 'first officer', 'captain', 'flight instructor', 
        'flight attendant', 'cabin crew', 'aviation', 'aircrew'
    ]
    
    job_title_matches = 0
    for title in aviation_job_titles:
        if re.search(r'\b' + re.escape(title) + r'\b', text[:500], re.IGNORECASE):
            job_title_matches += 1
    
    if job_title_matches >= 1 and aviation_keyword_count >= 3:
        return True
        
    return False


def extract_qualifications_excluding_licenses(text, aviation_licenses):
    """
    Extract qualifications while excluding aviation licenses already extracted.
    
    Args:
        text (str): The CV text content
        aviation_licenses (list): Already extracted aviation licenses
        
    Returns:
        list: Qualifications excluding aviation licenses
    """
    # Get all qualifications first
    all_qualifications = extract_qualifications(text)
    
    # Skip qualifications that match aviation licenses
    filtered_qualifications = []
    license_texts = [license_info.get('type', '').lower() for license_info in aviation_licenses]
    
    for qualification in all_qualifications:
        course = qualification.get('course_of_study', '').lower()
        
        # Skip if this qualification appears to be an aviation license
        if any(license_text in course for license_text in license_texts):
            continue
            
        # Skip aviation certifications already captured
        if 'aviation_certification' in course or qualification.get('highest_education_level') == 'aviation_certification':
            continue
        
        filtered_qualifications.append(qualification)
    
    return filtered_qualifications


def extract_text_from_pdf(file_path):
    """
    Extract text content from a PDF file with enhanced error handling.
    Attempts multiple extraction methods for better results.
    """
    text = ""
    
    try:
        # Method 1: Use PyPDF2
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            
            # Get document info if available
            if reader.metadata:
                meta_text = []
                if reader.metadata.title:
                    meta_text.append(f"Title: {reader.metadata.title}")
                if reader.metadata.author:
                    meta_text.append(f"Author: {reader.metadata.author}")
                if reader.metadata.subject:
                    meta_text.append(f"Subject: {reader.metadata.subject}")
                
                if meta_text:
                    text += "\n".join(meta_text) + "\n\n"
            
            # Extract text from each page
            for page_num in range(len(reader.pages)):
                try:
                    page_text = reader.pages[page_num].extract_text()
                    if page_text:
                        text += page_text + "\n\n"
                except Exception as page_error:
                    print(f"Error extracting text from PDF page {page_num}: {str(page_error)}")
        
        # If PyPDF2 failed to extract meaningful text, try alternative methods
        if len(text.strip()) < 50:
            print("PyPDF2 extracted minimal text. The PDF might be image-based or have text encoding issues.")
    
    except Exception as e:
        print(f"Error extracting text from PDF with PyPDF2: {str(e)}")
    
    # Return whatever text we managed to extract
    return text


def extract_text_from_docx(file_path):
    """Extract text content from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting text from DOCX: {str(e)}")
        return ""


def extract_text_from_image(file_path, preprocess=True, lang='eng'):
    """
    Extract text content from an image file using OCR.
    
    Args:
        file_path (str): Path to the image file
        preprocess (bool): Whether to preprocess the image for better OCR results
        lang (str): OCR language, default is English ('eng')
    
    Returns:
        str: Extracted text from the image
    """
    if not OCR_ENABLED:
        print("OCR capability is disabled. Please install pytesseract and PIL.")
        return ""
    
    try:
        # Open the image
        image = Image.open(file_path)
        
        if preprocess:
            # Convert image to grayscale for better OCR results
            if image.mode != 'L':
                image = image.convert('L')
                
        
        
        # Configure OCR options
        custom_config = f'-l {lang} --psm 1'  # Page segmentation mode: 1 = Auto page segmentation with OSD
        
        # Use pytesseract to extract text
        text = pytesseract.image_to_string(image, config=custom_config)
        
        # Log the amount of text extracted
        print(f"OCR extracted {len(text)} characters from image")
        
        return text
    except Exception as e:
        print(f"Error extracting text from image using OCR: {str(e)}")
        return ""


def extract_personal_info(text):
    """Extract personal information from CV text using multiple detection approaches."""
    personal_info = {}
    
    # Break text into lines and sentences for better processing
    lines = text.split('\n')
    sentences = sent_tokenize(text)
    
    # Extract email with comprehensive pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_matches = re.findall(email_pattern, text)
    if email_matches:
        personal_info['email'] = email_matches[0]
    
    # Extract phone with enhanced pattern that covers international formats
    phone_patterns = [
        # Standard format: +123 456-7890
        r'\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        # International format with country code: +1 234 567 8901
        r'\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b',
        # Format with parentheses: (123) 456-7890
        r'\(\d{3,5}\)[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b',
        # Short formats common in CVs: 123-456-7890
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b'
    ]
    
    for pattern in phone_patterns:
        phone_matches = re.findall(pattern, text)
        if phone_matches:
            personal_info['phone_number'] = phone_matches[0]
            break
    
    # Extract name - look at the beginning of the document
    # Often the name is at the top of the CV in larger font or standalone line
    name_candidates = []
    
    # First few lines often contain the name
    for i in range(min(5, len(lines))):
        line = lines[i].strip()
        # Skip very short lines or lines with common headers
        if len(line) > 3 and len(line.split()) <= 5 and ":" not in line and "@" not in line:
            words = line.split()
            # Check if the line has 2-4 words (typical for names)
            if 1 <= len(words) <= 4 and all(len(word) > 1 for word in words):
                name_candidates.append(line)
    
    if name_candidates:
        # Use the first good candidate
        personal_info['name'] = name_candidates[0][:200]  # Limit to 200 characters
    
    # Extract location with multiple approaches
    location_extracted = False
    
    # Approach 1: Look for explicit location indicators
    location_indicators = ["Location:", "Address:", "City:", "Country:", "Based in:", "Location/Address:"]
    for sentence in sentences:
        for indicator in location_indicators:
            if indicator in sentence:
                # Get the text after the indicator
                location_info = sentence.split(indicator)[1].strip()
                
                # Try to identify city and country
                location_parts = location_info.split(',')
                if len(location_parts) >= 2:
                    personal_info['city'] = location_parts[0].strip()[:100]  # Limit to 100 characters
                    personal_info['country'] = location_parts[-1].strip()[:100]  # Limit to 100 characters
                else:
                    personal_info['location'] = location_info[:255]  # Limit to 255 characters
                location_extracted = True
                break
        if location_extracted:
            break
    
    # Approach 2: Look for address patterns in lines
    if not location_extracted:
        address_pattern = r'\b[A-Za-z\s]+,\s*[A-Za-z\s]+,?\s*[A-Za-z\s]*\b'
        for line in lines:
            match = re.search(address_pattern, line)
            if match and ',' in match.group(0) and len(match.group(0).split()) >= 3:
                location = match.group(0)
                location_parts = location.split(',')
                if len(location_parts) >= 2:
                    personal_info['city'] = location_parts[0].strip()[:100]
                    personal_info['country'] = location_parts[-1].strip()[:100]
                else:
                    personal_info['location'] = location[:255]
                location_extracted = True
                break
    
    # Extract nationality/citizenship
    nationality_indicators = ["Nationality:", "Citizenship:", "Citizen:", "Nationality/Citizenship:"]
    nationality_extracted = False
    
    for sentence in sentences:
        for indicator in nationality_indicators:
            if indicator in sentence:
                # Get text after the indicator
                nationality_text = sentence.split(indicator)[1].strip()
                # Get first word or phrase (up to comma or period)
                nationality = re.split(r'[,.]', nationality_text)[0].strip()
                if nationality:
                    personal_info['nationality'] = nationality[:100]  # Limit to 100 characters
                    nationality_extracted = True
                    break
        if nationality_extracted:
            break
    
    # Extract date of birth if available
    dob_indicators = ["Date of Birth:", "DOB:", "Born:", "Birth Date:"]
    for sentence in sentences:
        for indicator in dob_indicators:
            if indicator in sentence:
                dob_text = sentence.split(indicator)[1].strip()
                # Try to parse this as a date if needed
                personal_info['date_of_birth'] = dob_text[:100]  # Store as string for now
                break
    
    return personal_info


def extract_experience(text):
    """Extract professional experience information using multiple detection approaches."""
    experience_data = {}
    
    # Break text into lines and sentences for better processing
    lines = text.split('\n')
    sentences = sent_tokenize(text)
    
    # Find the most recent job title with enhanced patterns
    job_title_patterns = [
        # Explicit indicators
        r'(?:Current|Present) (?:Job|Position|Role|Title)[:\s]+([A-Za-z\s\(\)\-\,\.\/\&]+)',
        r'(?:Job|Position|Role|Title|Designation)[:\s]+([A-Za-z\s\(\)\-\,\.\/\&]+)',
        # Resume header patterns - "Name - Job Title" format
        r'^[A-Z][a-z]+\s+[A-Z][a-z]+(?: [A-Z][a-z]+)?\s*[-–]\s*([A-Za-z\s\(\)\-\,\.\/\&]+)$',
        # Look for "Current Position" or similar patterns
        r'(?:Current|Present|Recent) (?:Position|Role|Job)[:\s]+([A-Za-z\s\(\)\-\,\.\/\&]+)'
    ]
    
    # Try pattern-based extraction first
    job_title_found = False
    for pattern in job_title_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            job_title = match.group(1).strip()
            if job_title and len(job_title) > 2 and len(job_title.split()) <= 8:
                experience_data['current_job_title'] = job_title[:200]  # Limit to 200 characters
                job_title_found = True
                break
        if job_title_found:
            break
    
    # If no job title found with patterns, try to extract from employment history
    if not job_title_found:
        # Look for work experience section
        work_exp_headers = [
            'WORK EXPERIENCE', 'EMPLOYMENT HISTORY', 'PROFESSIONAL EXPERIENCE', 
            'CAREER HISTORY', 'WORK HISTORY', 'EXPERIENCE'
        ]
        
        experience_section = None
        for i, line in enumerate(lines):
            if any(header in line.upper() for header in work_exp_headers) and i < len(lines) - 1:
                # Found the experience section header, now look for first job entry
                for j in range(i + 1, min(i + 15, len(lines))):  # Look at next 15 lines max
                    if lines[j].strip() and len(lines[j].split()) >= 2:
                        # This might be the first job entry
                        first_job_line = lines[j].strip()
                        
                        # Check for date patterns that often indicate job entries
                        date_patterns = [
                            r'\d{4}\s*[-–]\s*(?:\d{4}|Present|Current|Now)',
                            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b'
                        ]
                        
                        for k in range(j, min(j + 5, len(lines))):
                            line_text = lines[k]
                            if any(re.search(pattern, line_text, re.IGNORECASE) for pattern in date_patterns):
                                # Found a job entry with dates, extract the job title
                                # Job title often precedes or follows dates
                                possible_title = re.sub(r'\d{4}\s*[-–]\s*(?:\d{4}|Present|Current|Now)', '', line_text)
                                possible_title = re.sub(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b', '', possible_title)
                                possible_title = possible_title.strip()
                                
                                # Clean up common extras
                                for removal in ['(', ')', ',', '|', ':', '-', '–']:
                                    possible_title = possible_title.split(removal)[0].strip()
                                    
                                if possible_title and len(possible_title) > 2 and len(possible_title.split()) <= 5:
                                    experience_data['current_job_title'] = possible_title[:200]
                                    job_title_found = True
                                    break
                                    
                                # If we didn't find a good title in the current line, try the previous one
                                if not job_title_found and k > j:
                                    prev_line = lines[k-1].strip()
                                    if prev_line and len(prev_line.split()) <= 5:
                                        experience_data['current_job_title'] = prev_line[:200]
                                        job_title_found = True
                                        break
                        
                        if job_title_found:
                            break
                break
    
    # Extract years of experience with enhanced patterns
    experience_patterns = [
        r'(\d+)[\+]? years? of experience',
        r'experience[:\s]+(\d+)[\+]? years?',
        r'worked for (\d+) years?',
        r'(\d+)[\+]? years? in',
        r'(\d+) years experience',
        r'experience of (\d+)[\+]? years?',
        r'(\d+)[\+]?[+\s-]*year',  # Matches "10+ year" or "15-year" or "20 year"
        r'career spanning (\d+)[\+]? years?',
        r'over (\d+) years?'
    ]
    
    for pattern in experience_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            try:
                years = int(match.group(1))
                if 0 < years < 100:  # Sanity check
                    experience_data['years_of_experience'] = years
                    break
            except (ValueError, IndexError):
                continue
        if 'years_of_experience' in experience_data:
            break
    
    # Look for industry specializations (not just aviation)
    industry_keywords = [
        'aviation', 'aerospace', 'airline', 'flight', 'aircraft', 
        'healthcare', 'medical', 'pharmaceutical', 'finance', 'banking',
        'technology', 'software', 'IT', 'engineering', 'construction',
        'education', 'teaching', 'hospitality', 'retail', 'manufacturing',
        'transportation', 'logistics', 'marketing', 'sales', 'consulting',
        'legal', 'insurance', 'real estate', 'telecommunications'
    ]
    
    # Find the most frequently mentioned industries
    industry_counts = {}
    for keyword in industry_keywords:
        count = len(re.findall(r'\b' + keyword + r'\b', text.lower()))
        if count > 0:
            industry_counts[keyword] = count
    
    # Get the top industry if any found
    if industry_counts:
        top_industry = max(industry_counts.items(), key=lambda x: x[1])[0]
        experience_data['industry_specialization'] = top_industry.capitalize()
        
        # For aviation specifically, try to find more detailed specialization
        if top_industry == 'aviation':
            aviation_indicators = ["Aviation Specialization:", "Aviation Focus:", "Aviation Expertise:"]
            
            for sentence in sentences:
                for indicator in aviation_indicators:
                    if indicator in sentence:
                        specialization = sentence.split(indicator)[1].strip()
                        experience_data['aviation_specialization'] = specialization[:200]  # Limit to 200 characters
            
            # If no structured indicator found, try to extract from context
            if 'aviation_specialization' not in experience_data:
                # Find sentences that mention aviation
                aviation_sentences = [s for s in sentences if 'aviation' in s.lower()]
                if aviation_sentences:
                    experience_data['aviation_specialization'] = aviation_sentences[0][:200]  # Limit to 200 characters
    
    return experience_data


def extract_employment_history(text):
    """Extract employment history entries with enhanced format detection and improved company detection."""
    employment_entries = []
    
    # Common patterns indicating work experience sections
    section_indicators = [
        r'(?:WORK|EMPLOYMENT) (?:EXPERIENCE|HISTORY)',
        r'PROFESSIONAL EXPERIENCE',
        r'CAREER HISTORY',
        r'PROFESSIONAL BACKGROUND',
        r'EXPERIENCE',
        r'WORK HISTORY',
        r'CAREER SUMMARY',
        r'EMPLOYMENT RECORD',
        r'JOB HISTORY',
        r'PROFESSIONAL SUMMARY',
        r'CAREER PROFILE'
    ]
    
    # Get text lines for structure analysis
    lines = text.split('\n')
    
    # Try to identify the work experience section
    experience_section = text
    experience_section_found = False
    experience_sections = []
    
    # Look for section headers in the text
    for indicator in section_indicators:
        matches = list(re.finditer(indicator, text, re.IGNORECASE))
        for match in matches:
            # Get text after the section header
            section_start = match.end()
            
            # Look for the next major section header
            next_section_patterns = [
                r'\n\s*[A-Z][A-Z\s]{4,}\s*(?::|$|\n)',  # All caps section header
                r'\n\s*(?:EDUCATION|QUALIFICATIONS|SKILLS|CERTIFICATIONS|TRAINING|ACHIEVEMENTS|PROJECTS|LANGUAGES|REFERENCES)',
                r'\n\s*[A-Z][a-z]+\s*&\s*[A-Z][a-z]+\s*(?::|$|\n)'  # Title case with &
            ]
            
            next_section_pos = len(text)
            for pattern in next_section_patterns:
                next_matches = list(re.finditer(pattern, text[section_start:], re.IGNORECASE))
                if next_matches:
                    pos = section_start + next_matches[0].start()
                    if pos < next_section_pos:
                        next_section_pos = pos
            
            # Extract the experience section
            if next_section_pos < len(text):
                exp_section = text[section_start:next_section_pos]
                section_end = next_section_pos
            else:
                exp_section = text[section_start:]
                section_end = len(text)
                
            experience_sections.append((section_start, section_end, exp_section))
            experience_section = exp_section
            experience_section_found = True
            
            # We'll continue looking for additional experience sections
            # as some CVs might have multiple sections (e.g., "Work Experience" and "Relevant Experience")
    
    # If no section header found, try to use the entire text but look for date patterns
    if not experience_section_found:
        date_patterns = [
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–]\s*(?:\w+\s+\d{4}|Present|Current|Now)\b',
            r'\b\d{4}\s*[-–]\s*(?:\d{4}|Present|Current|Now)\b',
            r'\b(?:0?[1-9]|1[0-2])\/\d{4}\s*[-–]\s*(?:(?:0?[1-9]|1[0-2])\/\d{4}|Present|Current|Now)\b',  # MM/YYYY - MM/YYYY
            r'\b(?:0?[1-9]|1[0-2])-\d{4}\s*[-–]\s*(?:(?:0?[1-9]|1[0-2])-\d{4}|Present|Current|Now)\b',   # MM-YYYY - MM-YYYY
        ]
        
        # Check if there are date ranges that might indicate job entries
        for pattern in date_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                # Use the entire text as we found date patterns
                experience_section = text
                break
    
    # Common company suffixes to help identify company names
    company_suffixes = [
        'Inc', 'LLC', 'Ltd', 'Limited', 'Corp', 'Corporation', 'Co', 'Company', 
        'GmbH', 'AG', 'LLP', 'Group', 'PLC', 'Holdings', 'International', 
        'Incorporated', 'Systems', 'Solutions', 'Services', 'Technologies', 'Partners'
    ]
    
    # Enhanced patterns to identify job entries in various formats
    job_entry_patterns = [
        # Company - Position (Date - Date)
        r'([\w\s&.,\'\-]+)\s*[-–]\s*([\w\s&.,\'\(\)\-]+)\s*\((\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)\)',
        
        # Position at Company (Date - Date)
        r'([\w\s&.,\'\(\)\-]+)\s*(?:at|with|for)\s*([\w\s&.,\'\-]+)\s*\((\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)\)',
        
        # Date - Date: Position at Company
        r'(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)[:\s]+?([\w\s&.,\'\(\)\-]+)\s*(?:at|with|for)\s*([\w\s&.,\'\-]+)',
        
        # Date - Date: Company - Position
        r'(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)[:\s]+?([\w\s&.,\'\-]+)\s*[-–]\s*([\w\s&.,\'\(\)\-]+)',
        
        # Date - Date
        # Position
        # Company
        r'(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)\s*\n\s*([\w\s&.,\'\(\)\-]+)\s*\n\s*([\w\s&.,\'\-]+)',
        
        # Company
        # Position
        # Date - Date
        r'([\w\s&.,\'\-]+)\s*\n\s*([\w\s&.,\'\(\)\-]+)\s*\n\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)',
        
        # Position, Company (Date - Date)
        r'([\w\s&.,\'\(\)\-]+),\s*([\w\s&.,\'\-]+)\s*\((\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)\)',
        
        # Bullet-based format:
        # • Position, Company (Date - Date)
        r'[•\*\-]\s*([\w\s&.,\'\(\)\-]+),\s*([\w\s&.,\'\-]+)\s*(?:\(|\|)(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)(?:\)|\|)',
    ]
    
    # Try to find job entries
    job_entries_found = False
    
    # Helper function to identify if a string is likely a company name
    def is_company_name(text):
        # Check for common company identifiers
        if any(suffix in text for suffix in company_suffixes):
            return True
        # Check for capitalization patterns common in company names
        words = text.split()
        if len(words) >= 2 and all(word[0].isupper() for word in words if len(word) > 1):
            return True
        return False

    # Helper function to better distinguish between company name and job title
    def classify_company_and_title(text1, text2):
        # If one has company suffix and other doesn't, the one with suffix is company
        text1_is_company = is_company_name(text1)
        text2_is_company = is_company_name(text2)
        
        if text1_is_company and not text2_is_company:
            return (text1, text2)  # text1 is company, text2 is title
        elif text2_is_company and not text1_is_company:
            return (text2, text1)  # text2 is company, text1 is title
        
        # Check for common job title words
        job_title_words = ['manager', 'director', 'engineer', 'analyst', 'assistant',
                          'pilot', 'officer', 'specialist', 'coordinator', 'developer']
        
        text1_has_title = any(word in text1.lower() for word in job_title_words)
        text2_has_title = any(word in text2.lower() for word in job_title_words)
        
        if text1_has_title and not text2_has_title:
            return (text2, text1)  # text1 is job title, text2 is company
        elif text2_has_title and not text1_has_title:
            return (text1, text2)  # text2 is job title, text1 is company
            
        # If still unsure, use the default assignment
        return (text1, text2)
    
    # Process all experience sections
    for section_start, section_end, section_text in experience_sections:
        for pattern in job_entry_patterns:
            matches = list(re.finditer(pattern, section_text, re.IGNORECASE | re.MULTILINE))
            for match in matches:
                try:
                    groups = match.groups()
                    job_entry = {}
                    
                    if len(groups) == 4:
                        # Determine the format based on the first group
                        if re.match(r'\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}', groups[0]):  # If first group is a date
                            # Format: Date - Date: Position at Company or Date - Date: Company - Position
                            if any(x in match.group(0).lower() for x in ['at', 'with', 'for']):
                                company_name = groups[3].strip()
                                job_title = groups[2].strip()
                            else:
                                # Use our classifier to determine which is company and which is title
                                company_name, job_title = classify_company_and_title(groups[2].strip(), groups[3].strip())
                                
                            start_date_str = groups[0].strip()
                            end_date_str = groups[1].strip()
                        else:
                            # Format: Company - Position (Date - Date) or Position at Company (Date - Date)
                            if any(x in match.group(0).lower() for x in ['at', 'with', 'for']):
                                company_name = groups[1].strip()
                                job_title = groups[0].strip()
                            elif ',' in match.group(0) and not any(x in match.group(0).lower() for x in ['at', 'with', 'for']):
                                # Format: Position, Company (Date - Date)
                                job_title = groups[0].strip()
                                company_name = groups[1].strip()
                            else:
                                # Use our classifier to determine which is company and which is title
                                company_name, job_title = classify_company_and_title(groups[0].strip(), groups[1].strip())
                                
                            start_date_str = groups[2].strip()
                            end_date_str = groups[3].strip()
                        
                        # Clean up company name and job title
                        job_entry['company_name'] = company_name.strip()[:255]
                        job_entry['job_title'] = job_title.strip()[:255]
                        
                        # Clean up any remaining brackets, parentheses from job title
                        job_entry['job_title'] = re.sub(r'[\(\)]', '', job_entry['job_title'])
                        
                        # Parse dates using our enhanced date parser
                        job_entry['start_date'] = parse_date_from_string(start_date_str)
                        
                        # Set is_current based on end date text
                        is_current = end_date_str.lower() in ['present', 'current', 'now', 'to date', 'today', 'ongoing', 'to present']
                        job_entry['is_current'] = is_current
                        
                        # Try to parse the end date if not current
                        if not is_current:
                            job_entry['end_date'] = parse_date_from_string(end_date_str)
                        
                        # Extract job description and responsibilities
                        # Get text between this match and the next job entry or section
                        match_end = match.end()
                        next_entry_start = len(section_text)
                        
                        # Look for the start of the next job entry
                        for next_match in matches:
                            if next_match.start() > match_end:
                                next_entry_start = next_match.start()
                                break
                        
                        # Extract responsibilities text
                        responsibilities_text = section_text[match_end:next_entry_start].strip()
                        # Clean up the text - remove bullet points, extra spaces, etc.
                        responsibilities_text = re.sub(r'^\s*[•\-\*]\s*', '', responsibilities_text, flags=re.MULTILINE)
                        
                        # responsibilities is a TextField, but let's still truncate if it's extremely large
                        job_entry['responsibilities'] = responsibilities_text[:2000] if responsibilities_text else ""
                        job_entry['reason_leaving'] = "Not specified in CV"
                        
                        # Add the entry to our results
                        employment_entries.append(job_entry)
                        job_entries_found = True
                        
                except Exception as e:
                    print(f"Error parsing job entry: {str(e)}")
    
    # If no job entries found with the patterns, try a simpler approach based on dates
    if not job_entries_found:
        # Look for date ranges that might indicate job periods
        date_range_patterns = [
            r'(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4})\s*[-–]\s*(\w+\s+\d{4}|\/?\d{1,2}\/?\d{4}|\/?\d{4}|Present|Current|Now)',
            r'(\d{2}\/\d{2,4})\s*[-–]\s*(\d{2}\/\d{2,4}|Present|Current|Now)',  # MM/YY - MM/YY format
            r'(\d{2}\.\d{2,4})\s*[-–]\s*(\d{2}\.\d{2,4}|Present|Current|Now)'   # MM.YY - MM.YY format
        ]
        
        # Use either the identified experience section or the whole text
        search_text = experience_section if experience_section_found else text
        
        for pattern in date_range_patterns:
            date_ranges = list(re.finditer(pattern, search_text, re.IGNORECASE))
            
            for i, date_match in enumerate(date_ranges):
                try:
                    # Get the date range
                    start_date_str = date_match.group(1).strip()
                    end_date_str = date_match.group(2).strip()
                    
                    # Look at text around the date range for job title and company
                    context_start = max(0, date_match.start() - 150)  # Expanded context
                    context_end = min(len(search_text), date_match.end() + 150)  # Expanded context
                    context = search_text[context_start:context_end]
                    
                    # Split into lines to find potential job title and company
                    context_lines = context.split('\n')
                    
                    # Initialize with defaults
                    job_title = "Unknown Position"
                    company_name = "Unknown Company"
                    
                    # First try to find lines with common job title or company patterns
                    for line in context_lines:
                        line = line.strip()
                        if line and date_match.group(0) not in line:
                            # Skip lines that are too long or too short
                            if 3 < len(line) < 100 and len(line.split()) <= 10:
                                pass  # Placeholder for logic
                    
                    # Create a job entry
                    job_entry = {
                        'job_title': job_title[:255],
                        'company_name': company_name[:255],
                        'start_date': parse_date_from_string(start_date_str),
                        'is_current': end_date_str.lower() in ['present', 'current', 'now', 'to date', 'today', 'ongoing'],
                        'responsibilities': "Details not extractable from CV format",
                        'reason_leaving': "Not specified in CV"
                    }
                    
                    # Parse end date if not current
                    if not job_entry['is_current']:
                        job_entry['end_date'] = parse_date_from_string(end_date_str)
                    
                    # Add to our results
                    employment_entries.append(job_entry)
                    job_entries_found = True
                    
                except Exception as e:
                    print(f"Error in fallback job parsing: {str(e)}")
    
    return employment_entries


def extract_qualifications(text):
    """Extract qualifications and education history with enhanced format detection and section isolation."""
    qualifications = []
    
    # First, identify employment sections to completely avoid
    employment_section_patterns = [
        r'(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT|PROFESSIONAL BACKGROUND|JOB HISTORY|CAREER HISTORY|WORK EXPERIENCE)(?:\s*:)?(.*?)(?:EDUCATION|SKILLS|CERTIFICATIONS|ACHIEVEMENTS|\Z)',
        r'(?:Experience|Work History|Employment|Professional Background|Job History|Career History|Work Experience)(?:\s*:)?(.*?)(?:Education|Skills|Certifications|Achievements|\Z)'
    ]
    
    employment_sections = []
    for pattern in employment_section_patterns:
        matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
        for match in matches:
            employment_sections.append((match.start(1), match.end(1), match.group(1)))
    
    # Helper function to check if a position is within an employment section
    def is_in_employment_section(start_pos, end_pos):
        for emp_start, emp_end, _ in employment_sections:
            if start_pos >= emp_start and end_pos <= emp_end:
                return True
        return False
    
    # Common patterns indicating education sections
    section_indicators = [
        r'(?:EDUCATION|QUALIFICATIONS|ACADEMIC|EDUCATIONAL) (?:BACKGROUND|HISTORY|QUALIFICATIONS)',
        r'ACADEMIC CREDENTIALS',
        r'EDUCATIONAL QUALIFICATIONS',
        r'EDUCATION',  # Simple header
        r'ACADEMIC BACKGROUND',
        r'ACADEMIC HISTORY',
        r'ACADEMIC EDUCATION',
        r'EDUCATIONAL HISTORY',
        r'QUALIFICATIONS'
    ]
    
    # Employment-related terms to filter out
    employment_terms = [
        'work experience', 'employment history', 'professional experience', 'career history', 
        'job history', 'professional background', 'work history', 'position', 'positions',
        'job title', 'job position', 'job role', 'job function'
    ]
    
    # Job titles that commonly appear in employment sections but not education sections
    job_titles = [
        'Manager', 'Director', 'Officer', 'Specialist', 'Pilot', 'Engineer', 
        'Analyst', 'Consultant', 'Representative', 'Agent', 'Assistant', 
        'Coordinator', 'Supervisor', 'Lead', 'Head of', 'Chief',
        'Developer', 'Administrator', 'Executive', 'Associate'
    ]
    
    # Try to identify the education section
    education_section = text
    education_section_found = False
    education_section_spans = []
    
    # Look for section headers in the text
    for indicator in section_indicators:
        matches = list(re.finditer(r'\b' + indicator + r'\b', text, re.IGNORECASE))
        if matches:
            for match in matches:
                # Check if this match is part of an employment section header (e.g., "Work Experience & Qualifications")
                match_context = text[max(0, match.start() - 20):min(len(text), match.end() + 20)]
                if any(term in match_context.lower() for term in employment_terms):
                    # Skip this match as it's likely part of an employment section
                    continue
                
                # Skip if this match is within an employment section
                if is_in_employment_section(match.start(), match.end()):
                    continue
                
                # Get text after the section header
                section_start = match.end()
                
                # Look for the next major section header
                next_section_patterns = [
                    r'\n\s*[A-Z][A-Z\s]{4,}\s*(?::|$|\n)',  # All caps section header
                    r'\n\s*(?:EXPERIENCE|EMPLOYMENT|SKILLS|PROFESSIONAL|CERTIFICATIONS|TRAINING|ACHIEVEMENTS|PROJECTS|LANGUAGES|REFERENCES)',
                    r'\n\s*[A-Z][a-z]+\s*&\s*[A-Z][a-z]+\s*(?::|$|\n)'  # Title case with &
                ]
                
                next_section_pos = len(text)
                for pattern in next_section_patterns:
                    next_matches = list(re.finditer(pattern, text[section_start:], re.IGNORECASE))
                    if next_matches:
                        pos = section_start + next_matches[0].start()
                        if pos < next_section_pos:
                            next_section_pos = pos
                
                # Extract the education section
                section_end = next_section_pos
                if next_section_pos < len(text):
                    education_section = text[section_start:next_section_pos]
                else:
                    education_section = text[section_start:]
                    section_end = len(text)
                
                education_section_spans.append((section_start, section_end, education_section))
                education_section_found = True
                break
            
            if education_section_found:
                break
    
    # Education-specific keywords that strongly indicate an education entry
    education_keywords = [
        'Bachelor', 'Master', 'PhD', 'Doctorate', 'BSc', 'MSc', 'BA', 'MA', 'MBA',
        'Certificate', 'Diploma', 'Associate', 'Degree', 'University', 'College',
        'School of', 'Institute of', 'Academy', 'Education', 'Graduate', 'Student'
    ]
    
    # Employment-related terms to identify and exclude job entries
    job_terms = [
        'Manager', 'Director', 'Officer', 'Specialist', 'Pilot', 'Engineer', 
        'Analyst', 'Consultant', 'Representative', 'Agent', 'Assistant', 
        'Coordinator', 'Supervisor', 'Lead', 'Head of', 'Chief', 'Developer',
        'Administrator', 'Executive', 'Associate', 'Team Lead', 'Architect'
    ]
    
    # Helper function to check if a string contains job-related terms
    def contains_job_terms(text_to_check):
        for term in job_terms:
            if re.search(r'\b' + re.escape(term) + r'\b', text_to_check, re.IGNORECASE):
                return True
        return False
    
    # Helper function to check if a string contains education-related keywords
    def contains_education_keywords(text_to_check):
        for keyword in education_keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text_to_check, re.IGNORECASE):
                return True
        return False
    
    # Enhanced patterns to identify education entries in various formats
    education_patterns = [
        # Degree, Institution, Year - strict pattern requiring degree keywords
        r'((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MA|MBA|Certificate|Diploma|Associate|Degree)[^,\n]*),\s*([^,\n]*),\s*(\d{4}(?:[-–]\d{4}|[-–]Present)?)',
        
        # Degree in Subject at Institution (Year) - strict pattern requiring degree keywords
        r'((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MA|MBA|Certificate|Diploma|Associate|Degree)[^,\n]*)\s+in\s+([^,\n]*)\s+(?:at|from)\s+([^(]*)(?:\((\d{4}(?:[-–]\d{4}|[-–]Present)?)\))?',
        
        # Year: Degree from Institution - strict pattern requiring degree keywords
        r'(\d{4}(?:[-–]\d{4}|[-–]Present)?):\s*((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MA|MBA|Certificate|Diploma|Associate|Degree)[^,\n]*)\s+from\s+([^\n]*)',
        
        # Institution
        # Degree
        # Year - strict pattern requiring degree keywords
        r'([^\n]{5,})\n\s*((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MA|MBA|Certificate|Diploma|Associate|Degree)[^\n]*)\n\s*(\d{4}(?:[-–]\d{4}|[-–]Present)?)',
        
        # Simple format: Degree from Institution - strict pattern requiring degree keywords
        r'((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MA|MBA|Certificate|Diploma|Associate|Degree)[^,\n]*)\s+from\s+([^\n,]*)',
        
        # Another format: Institution, Degree (Year) - strict pattern requiring degree keywords
        r'([^,\n]*),\s*((?:Bachelor|Master|PhD|Doctorate|BSc|MSc|BA|MA|MBA|Certificate|Diploma|Associate|Degree)[^(]*)(?:\((\d{4}(?:[-–]\d{4}|[-–]Present)?)\))',
        
        # Looser pattern only used when we're sure we're in the education section
        r'([^-\n]*)(?:\s*[-–]\s*)([^-\n]*)(?:\s*[-–]\s*)(\d{4}(?:[-–]\d{4}|[-–]Present)?)'
    ]
    
    qualifications_found = False
    
    # Process text across the whole CV, but with stronger validation
    # This ensures we catch education entries even if section detection failed
    for pattern in education_patterns[:6]:  # Only use strict patterns for whole CV search
        matches = list(re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE))
        for match in matches:
            # Skip if this match is within an employment section
            if is_in_employment_section(match.start(), match.end()):
                continue
                
            # Skip if contains job terms
            if contains_job_terms(match.group(0)):
                continue
            try:
                groups = match.groups()
                qualification = {}
                
                if len(groups) >= 2:  # We need at least degree and institution
                    # Determine which pattern matched and extract fields accordingly
                    if 'in' in match.group(0) and ('at' in match.group(0) or 'from' in match.group(0)):
                        # Pattern: Degree in Subject at Institution (Year)
                        degree = groups[0].strip()
                        subject = groups[1].strip()
                        
                        # Skip if degree contains job terms
                        if contains_job_terms(degree):
                            continue
                            
                        qualification['highest_education_level'] = determine_education_level(degree)
                        qualification['course_of_study'] = f"{degree} in {subject}"[:200]
                        qualification['institution'] = groups[2].strip()[:200]
                        if len(groups) > 3 and groups[3]:
                            # Extract year from format like "2010-2014"
                            year_match = re.search(r'\d{4}', groups[3])
                            if year_match:
                                qualification['expected_graduation_year'] = year_match.group(0)[:10]
                    
                    elif ',' in match.group(0) and re.search(r'\d{4}', match.group(0)):
                        if re.match(r'[^,]*,\s*(?:Bachelor|Master|PhD)', match.group(0), re.IGNORECASE):
                            # Format: Institution, Degree (Year)
                            qualification['institution'] = groups[0].strip()[:200]
                            degree = groups[1].strip()
                            
                            # Skip if degree contains job terms
                            if contains_job_terms(degree):
                                continue
                                
                            qualification['highest_education_level'] = determine_education_level(degree)
                            qualification['course_of_study'] = degree[:200]
                            if len(groups) > 2 and groups[2]:
                                year_match = re.search(r'\d{4}', groups[2])
                                if year_match:
                                    qualification['expected_graduation_year'] = year_match.group(0)[:10]
                        else:
                            # Pattern: Degree, Institution, Year
                            degree = groups[0].strip()
                            
                            # Skip if degree contains job terms
                            if contains_job_terms(degree):
                                continue
                                
                            qualification['highest_education_level'] = determine_education_level(degree)
                            qualification['course_of_study'] = degree[:200]
                            qualification['institution'] = groups[1].strip()[:200]
                            if len(groups) > 2 and groups[2]:
                                year_match = re.search(r'\d{4}', groups[2])
                                if year_match:
                                    qualification['expected_graduation_year'] = year_match.group(0)[:10]
                    
                    elif 'from' in match.group(0) and len(groups) == 2:
                        # Simple format: Degree from Institution
                        degree = groups[0].strip()
                        
                        # Skip if degree contains job terms
                        if contains_job_terms(degree):
                            continue
                            
                        qualification['highest_education_level'] = determine_education_level(degree)
                        qualification['course_of_study'] = degree[:200]
                        qualification['institution'] = groups[1].strip()[:200]
                    
                    elif re.match(r'\d{4}', groups[0]):
                        # Year: Degree from Institution
                        degree = groups[1].strip()
                        
                        # Skip if degree contains job terms
                        if contains_job_terms(degree):
                            continue
                            
                        qualification['highest_education_level'] = determine_education_level(degree)
                        qualification['course_of_study'] = degree[:200]
                        qualification['institution'] = groups[2].strip()[:200]
                        year_match = re.search(r'\d{4}', groups[0])
                        if year_match:
                            qualification['expected_graduation_year'] = year_match.group(0)[:10]
                    
                    elif '-' in match.group(0) or '–' in match.group(0):
                        # Pattern with hyphens: likely Institution - Degree - Year
                        # Check if the first group might be the institution (more likely)
                        if len(groups[0].strip().split()) >= 2 and not any(degree_term in groups[0].lower() for degree_term in 
                                                                       ['bachelor', 'master', 'phd', 'doctorate', 'bsc', 'msc', 'diploma']):
                            institution = groups[0].strip()
                            degree = groups[1].strip()
                            
                            # Skip if degree contains job terms
                            if contains_job_terms(degree):
                                continue
                                
                            qualification['institution'] = institution[:200]
                            qualification['highest_education_level'] = determine_education_level(degree)
                            qualification['course_of_study'] = degree[:200]
                        else:
                            degree = groups[0].strip()
                            institution = groups[1].strip()
                            
                            # Skip if degree contains job terms
                            if contains_job_terms(degree):
                                continue
                                
                            qualification['highest_education_level'] = determine_education_level(degree)
                            qualification['course_of_study'] = degree[:200]
                            qualification['institution'] = institution[:200]
                            
                        if len(groups) > 2 and groups[2]:
                            year_match = re.search(r'\d{4}', groups[2])
                            if year_match:
                                qualification['expected_graduation_year'] = year_match.group(0)[:10]
                    
                    # Add GPA if mentioned near this education entry
                    context_start = max(0, match.start() - 100)
                    context_end = min(len(text), match.end() + 100)
                    context = text[context_start:context_end]
                    
                    gpa_match = re.search(r'GPA[:\s]+(\d+\.\d+)', context, re.IGNORECASE)
                    if gpa_match:
                        try:
                            qualification['gpa'] = float(gpa_match.group(1))
                        except ValueError:
                            pass
                    
                    # Only add if we have at least an institution and course
                    if 'institution' in qualification and 'course_of_study' in qualification:
                        # Final validation: skip if it looks like a job title
                        course = qualification.get('course_of_study', '').lower()
                        if any(term.lower() in course for term in job_terms):
                            continue
                            
                        # Skip if the institution contains a job title indicator
                        institution = qualification.get('institution', '').lower()
                        if 'company' in institution or 'corporation' in institution or 'inc.' in institution:
                            continue
                        
                        # Add to our qualifications list
                        qualifications.append(qualification)
                        qualifications_found = True
                
            except Exception as e:
                print(f"Error processing education entry: {str(e)}")
    
    # Process specifically identified education sections
    for section_start, section_end, section_text in education_section_spans:
        # Apply all patterns to the education section with less strict filtering
        for pattern in education_patterns:
            matches = list(re.finditer(pattern, section_text, re.IGNORECASE | re.MULTILINE))
            for match in matches:
                try:
                    groups = match.groups()
                    qualification = {}
                    
                    if len(groups) >= 2:  # We need at least degree and institution
                        # Determine which pattern matched and extract fields accordingly
                        if 'in' in match.group(0) and ('at' in match.group(0) or 'from' in match.group(0)):
                            # Pattern: Degree in Subject at Institution (Year)
                            degree = groups[0].strip()
                            subject = groups[1].strip()
                            qualification['highest_education_level'] = determine_education_level(degree)
                            qualification['course_of_study'] = f"{degree} in {subject}"[:200]
                            qualification['institution'] = groups[2].strip()[:200]
                            if len(groups) > 3 and groups[3]:
                                year_match = re.search(r'\d{4}', groups[3])
                                if year_match:
                                    qualification['expected_graduation_year'] = year_match.group(0)[:10]
                        
                        elif ',' in match.group(0) and re.search(r'\d{4}', match.group(0)):
                            if re.match(r'[^,]*,\s*(?:Bachelor|Master|PhD)', match.group(0), re.IGNORECASE):
                                # Format: Institution, Degree (Year)
                                qualification['institution'] = groups[0].strip()[:200]
                                qualification['highest_education_level'] = determine_education_level(groups[1].strip())
                                qualification['course_of_study'] = groups[1].strip()[:200]
                                if len(groups) > 2 and groups[2]:
                                    year_match = re.search(r'\d{4}', groups[2])
                                    if year_match:
                                        qualification['expected_graduation_year'] = year_match.group(0)[:10]
                            else:
                                # Pattern: Degree, Institution, Year
                                qualification['highest_education_level'] = determine_education_level(groups[0].strip())
                                qualification['course_of_study'] = groups[0].strip()[:200]
                                qualification['institution'] = groups[1].strip()[:200]
                                if len(groups) > 2 and groups[2]:
                                    year_match = re.search(r'\d{4}', groups[2])
                                    if year_match:
                                        qualification['expected_graduation_year'] = year_match.group(0)[:10]
                        
                        elif 'from' in match.group(0) and len(groups) == 2:
                            # Simple format: Degree from Institution
                            qualification['highest_education_level'] = determine_education_level(groups[0].strip())
                            qualification['course_of_study'] = groups[0].strip()[:200]
                            qualification['institution'] = groups[1].strip()[:200]
                        
                        elif re.match(r'\d{4}', groups[0]):
                            # Year: Degree from Institution
                            qualification['highest_education_level'] = determine_education_level(groups[1].strip())
                            qualification['course_of_study'] = groups[1].strip()[:200]
                            qualification['institution'] = groups[2].strip()[:200]
                            year_match = re.search(r'\d{4}', groups[0])
                            if year_match:
                                qualification['expected_graduation_year'] = year_match.group(0)[:10]
                        
                        elif '-' in match.group(0) or '–' in match.group(0):
                            # In dedicated education section, we can be more lenient with hyphen patterns
                            if contains_education_keywords(match.group(0)):
                                # Institution - Degree - Year format
                                qualification['institution'] = groups[0].strip()[:200]
                                qualification['highest_education_level'] = determine_education_level(groups[1].strip())
                                qualification['course_of_study'] = groups[1].strip()[:200]
                                if len(groups) > 2 and groups[2]:
                                    year_match = re.search(r'\d{4}', groups[2])
                                    if year_match:
                                        qualification['expected_graduation_year'] = year_match.group(0)[:10]
                        
                        # Add GPA if mentioned near this education entry
                        context_start = max(0, match.start() - 100)
                        context_end = min(len(section_text), match.end() + 100)
                        context = section_text[context_start:context_end]
                        
                        gpa_match = re.search(r'GPA[:\s]+(\d+\.\d+)', context, re.IGNORECASE)
                        if gpa_match:
                            try:
                                qualification['gpa'] = float(gpa_match.group(1))
                            except ValueError:
                                pass
                        
                        # Add to our qualifications list if not already present
                        if 'institution' in qualification and 'course_of_study' in qualification:
                            if qualification not in qualifications:
                                qualifications.append(qualification)
                                qualifications_found = True
                    
                except Exception as e:
                    print(f"Error processing education entry from section: {str(e)}")
    
    # If no qualifications found with regular patterns, try to extract certifications separately
    if not qualifications_found:
        # Look for certifications or licenses section
        certification_indicators = [
            r'CERTIFICATIONS',
            r'LICENSES',
            r'PROFESSIONAL QUALIFICATIONS',
            r'PROFESSIONAL CERTIFICATIONS',
            r'TECHNICAL QUALIFICATIONS'
        ]
        
        for indicator in certification_indicators:
            cert_matches = list(re.finditer(indicator, text, re.IGNORECASE))
            for cert_match in cert_matches:
                # Skip if this certification section is in an employment section
                if is_in_employment_section(cert_match.start(), cert_match.end()):
                    continue
                
                # Get text after the certification header
                cert_start = cert_match.end()
                
                # Look for the next section
                next_section = re.search(r'\n\s*[A-Z\s]{5,}\s*\n', text[cert_start:])
                cert_section = text[cert_start:cert_start + next_section.start()] if next_section else text[cert_start:]
                
                # Process certification lines
                cert_lines = cert_section.split('\n')
                for line in cert_lines:
                    if line.strip() and len(line.strip()) > 5 and '•' not in line and '*' not in line:
                        # Skip job-related entries
                        if contains_job_terms(line):
                            continue
                            
                        qualification = {
                            'highest_education_level': 'certificate',
                            'course_of_study': line.strip()[:200],
                            'institution': "Not specified"
                        }
                        
                        # Try to extract year if present
                        year_match = re.search(r'\b(19|20)\d{2}\b', line)
                        if year_match:
                            qualification['expected_graduation_year'] = year_match.group(0)
                            
                        qualifications.append(qualification)
                
                if qualifications:
                    break
    
    # Extract aviation-specific certifications
    aviation_cert_patterns = [
        r'(?:Pilot|Aviation|Flight) (?:License|Licence|Certification)[:\s]+(.*?)(?:\n\n|\Z)',
        r'(?:Commercial|Private|PPL|CPL|ATPL) (?:Pilot|License|Licence)[:\s]+(.*?)(?:\n\n|\Z)',
        r'(?:FAA|EASA|CAA) (?:Certificate|License|Licence|Rating)[:\s]+(.*?)(?:\n\n|\Z)',
        r'Type Rating[:\s]+(.*?)(?:\n\n|\Z)'
    ]
    
    for pattern in aviation_cert_patterns:
        cert_matches = re.finditer(pattern, text, re.IGNORECASE)
        for cert_match in cert_matches:
            # Skip if this certification is within an employment section
            if is_in_employment_section(cert_match.start(), cert_match.end()):
                continue
                
            cert_text = cert_match.group(1).strip()
            if cert_text:
                # Create a qualification entry for the aviation certification
                qualification = {
                    'highest_education_level': 'aviation_certification',
                    'course_of_study': f"Aviation Certification: {cert_text[:180]}",  # Leave room for the prefix
                    'institution': "Aviation Authority"
                }
                
                # Try to extract year if present
                year_match = re.search(r'\b(19|20)\d{2}\b', cert_text)
                if year_match:
                    qualification['expected_graduation_year'] = year_match.group(0)
                
                # Extract specific license type if available
                license_match = re.search(r'\b(ATPL|CPL|PPL|Type Rating|Flight Instructor)\b', cert_text, re.IGNORECASE)
                if license_match:
                    qualification['course_of_study'] = f"Aviation License: {license_match.group(0)} - {cert_text[:160]}"
                    
                qualifications.append(qualification)
    
    # Deduplicate qualifications based on course of study
    unique_qualifications = []
    course_of_study_set = set()
    
    for qualification in qualifications:
        course = qualification.get('course_of_study', '').lower()
        # Generate a key for comparison, using just the first 50 chars of the course to allow for minor differences
        key = course[:50]
        if key and key not in course_of_study_set:
            course_of_study_set.add(key)
            unique_qualifications.append(qualification)
    
    return unique_qualifications


def determine_education_level(degree_text):
    """
    Determine the education level from degree text.
    
    Args:
        degree_text (str): Text describing a degree or certification
        
    Returns:
        str: Classification of the education level
    """
    degree_lower = degree_text.lower()
    
    # Check for aviation certifications separately to prevent miscategorization
    if any(cert.lower() in degree_lower for cert in ['atpl', 'cpl', 'ppl', 'type rating', 
                                                   'flight instructor', 'pilot license']):
        return 'aviation_certification'
    elif any(term in degree_lower for term in ['phd', 'doctorate', 'doctoral']):
        return 'phd'
    elif any(term in degree_lower for term in ['master', 'msc', 'ma', 'mba', 'meng']):
        return 'masters'
    elif any(term in degree_lower for term in ['bachelor', 'bsc', 'ba', 'beng', 'degree']):
        return 'degree'
    elif 'diploma' in degree_lower:
        return 'diploma'
    elif 'certificate' in degree_lower:
        return 'certificate'
    else:
        return 'other'


def extract_aviation_licenses(text):
    """
    Extract aviation licenses and certifications from CV text.
    
    Args:
        text (str): The full text content of the CV
        
    Returns:
        list: List of dictionaries containing license details
    """
    licenses = []
    
    # First, identify employment sections to completely avoid
    employment_section_patterns = [
        r'(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT|PROFESSIONAL BACKGROUND|JOB HISTORY|CAREER HISTORY|WORK EXPERIENCE)(?:\s*:)?(.*?)(?:EDUCATION|SKILLS|CERTIFICATIONS|ACHIEVEMENTS|\Z)',
        r'(?:Experience|Work History|Employment|Professional Background|Job History|Career History|Work Experience)(?:\s*:)?(.*?)(?:Education|Skills|Certifications|Achievements|\Z)'
    ]
    
    employment_sections = []
    for pattern in employment_section_patterns:
        matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
        for match in matches:
            employment_sections.append((match.start(1), match.end(1), match.group(1)))
    
    # Helper function to check if a position is within an employment section
    def is_in_employment_section(start_pos, end_pos):
        for emp_start, emp_end, _ in employment_sections:
            if start_pos >= emp_start and end_pos <= emp_end:
                return True
        return False
    
    # Look for license section headers
    license_section_headers = [
        'LICENSES', 'CERTIFICATIONS', 'LICENSES & CERTIFICATIONS',
        'PILOT LICENSES', 'AVIATION QUALIFICATIONS', 'RATINGS',
        'PILOT QUALIFICATIONS', 'AVIATION LICENSES'
    ]
    
    # Try to identify the license section
    license_sections = []
    license_section_found = False
    
    # Look for license section
    for header in license_section_headers:
        matches = list(re.finditer(r'\b' + header + r'\b', text, re.IGNORECASE))
        for match in matches:
            # Skip if this section header is within an employment section
            if is_in_employment_section(match.start(), match.end()):
                continue
                
            section_start = match.end()
            
            # Look for the next major section header
            next_section_patterns = [
                r'\n\s*[A-Z][A-Z\s]{4,}\s*(?::|$|\n)',
                r'\n\s*(?:EDUCATION|EXPERIENCE|EMPLOYMENT|SKILLS|PROFESSIONAL|TRAINING|PROJECTS|LANGUAGES|REFERENCES)',
            ]
            
            next_section_pos = len(text)
            for pattern in next_section_patterns:
                next_matches = list(re.finditer(pattern, text[section_start:], re.IGNORECASE))
                if next_matches:
                    pos = section_start + next_matches[0].start()
                    if pos < next_section_pos:
                        next_section_pos = pos
            
            # Extract the license section
            section_end = next_section_pos
            if next_section_pos < len(text):
                license_section = text[section_start:next_section_pos]
            else:
                license_section = text[section_start:]
                section_end = len(text)
                
            license_sections.append((section_start, section_end, license_section))
            license_section_found = True
    
    # Process identified license sections first
    license_patterns = [
        # License Type (Year)
        r'((?:ATPL|CPL|PPL|Type Rating|[A-Z]+\s+License).*?)(?:\((\d{4})\)|\s+(\d{4}))',
        # License Type: Details
        r'((?:ATPL|CPL|PPL|Type Rating|[A-Z]+\s+License).*?):\s*(.*?)(?:\n|$)',
        # General aviation certification pattern
        r'((?:EASA|FAA|ICAO|DGCA|CAA).*?(?:License|Rating|Certificate))(?:\s+-\s+|\s*:\s*)(.*?)(?:\n|$)',
        # Bullet point license format
        r'[•\*\-]\s*((?:ATPL|CPL|PPL|Type Rating|[A-Z]+\s+License|EASA|FAA|ICAO|DGCA|CAA).*?)(?:\((\d{4})\)|\s+(\d{4})|\n|$)'
    ]
    
    # Process each license section first
    for section_start, section_end, license_section in license_sections:
        for pattern in license_patterns:
            matches = list(re.finditer(pattern, license_section, re.IGNORECASE))
            for match in matches:
                try:
                    groups = match.groups()
                    license_info = {
                        'type': groups[0].strip(),
                        'issuing_authority': extract_authority_from_license(groups[0]),
                        'category': categorize_aviation_license(groups[0]),
                    }
                    
                    # Add issue year if available
                    if len(groups) > 1 and groups[1] and groups[1] is not None and re.match(r'\d{4}', groups[1]):
                        license_info['issue_year'] = groups[1]
                    
                    # Add details if available
                    if len(groups) > 1 and groups[1] and groups[1] is not None and not re.match(r'\d{4}$', groups[1]):
                        license_info['details'] = groups[1].strip()
                        
                    licenses.append(license_info)
                except Exception as e:
                    print(f"Error extracting license details: {str(e)}")
    
    # If no dedicated section found, or if no licenses found in sections,
    # search for license patterns in the entire text but exclude employment sections
    if not license_section_found or not licenses:
        for pattern in license_patterns:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            for match in matches:
                # Skip if this match is within an employment section
                if is_in_employment_section(match.start(), match.end()):
                    continue
                    
                try:
                    groups = match.groups()
                    license_info = {
                        'type': groups[0].strip(),
                        'issuing_authority': extract_authority_from_license(groups[0]),
                        'category': categorize_aviation_license(groups[0]),
                    }
                    
                    # Add issue year if available
                    if len(groups) > 1 and groups[1] and groups[1] is not None and re.match(r'\d{4}', groups[1]):
                        license_info['issue_year'] = groups[1]
                    
                    # Add details if available
                    if len(groups) > 1 and groups[1] and groups[1] is not None and not re.match(r'\d{4}$', groups[1]):
                        license_info['details'] = groups[1].strip()
                        
                    licenses.append(license_info)
                except Exception as e:
                    print(f"Error extracting license details: {str(e)}")
    
    # If still no structured licenses found, look for keywords throughout the text
    if not licenses:
        for license_keyword in AVIATION_LICENSES:
            # Look for mentions of licenses with some context
            license_matches = re.finditer(r'(?:^|\s)(' + re.escape(license_keyword) + r'[\s\-:]+[^\.,:;]*)', text, re.IGNORECASE | re.MULTILINE)
            
            for match in license_matches:
                # Skip if this match is within an employment section
                if is_in_employment_section(match.start(), match.end()):
                    continue
                    
                license_info = {
                    'type': license_keyword,
                    'details': match.group(1).strip(),
                    'issuing_authority': extract_authority_from_license(match.group(1)),
                    'category': categorize_aviation_license(license_keyword)
                }
                licenses.append(license_info)
    
    # Look for aircraft type ratings - but exclude those in employment sections
    for aircraft in AIRCRAFT_TYPES:
        if re.search(r'\b' + re.escape(aircraft) + r'\b', text, re.IGNORECASE):
            # First check for explicit type rating mentions
            type_rating_matches = list(re.finditer(
                r'\b' + re.escape(aircraft) + r'[^\.,:;]*(?:Type Rating|Rating|Qualified|Certified)', 
                text, re.IGNORECASE
            ))
            
            found_valid_match = False
            for type_rating_match in type_rating_matches:
                # Skip if this match is within an employment section
                if not is_in_employment_section(type_rating_match.start(), type_rating_match.end()):
                    license_info = {
                        'type': 'Type Rating',
                        'details': type_rating_match.group(0).strip(),
                        'category': 'aircraft_type_rating',
                        'aircraft': aircraft
                    }
                    licenses.append(license_info)
                    found_valid_match = True
            
            # If no explicit match found outside employment section, check license sections
            if not found_valid_match and license_sections:
                for _, _, section_text in license_sections:
                    if re.search(r'\b' + re.escape(aircraft) + r'\b', section_text, re.IGNORECASE):
                        license_info = {
                            'type': 'Type Rating',
                            'details': f"{aircraft} Type Rating",
                            'category': 'aircraft_type_rating',
                            'aircraft': aircraft
                        }
                        licenses.append(license_info)
                        found_valid_match = True
                        break
    
    # Deduplicate licenses based on type and details
    unique_licenses = []
    license_keys = set()
    
    for license_info in licenses:
        # Generate a key for comparison
        key = f"{license_info.get('type', '')}-{license_info.get('details', '')}"
        if key not in license_keys:
            license_keys.add(key)
            unique_licenses.append(license_info)
    
    return unique_licenses


def extract_authority_from_license(license_text):
    """
    Extract the issuing authority from license text.
    
    Args:
        license_text (str): Text describing a license
        
    Returns:
        str: The identified authority or "Unknown"
    """
    authority_patterns = [
        (r'\b(EASA|European Aviation Safety Agency)\b', 'EASA'),
        (r'\b(FAA|Federal Aviation Administration)\b', 'FAA'),
        (r'\b(ICAO|International Civil Aviation Organization)\b', 'ICAO'),
        (r'\b(DGCA|Directorate General of Civil Aviation)\b', 'DGCA'),
        (r'\b(CAA|Civil Aviation Authority)\b', 'CAA'),
        (r'\b(TCCA|Transport Canada Civil Aviation)\b', 'TCCA'),
        (r'\b(CASA|Civil Aviation Safety Authority)\b', 'CASA'),
    ]
    
    for pattern, authority in authority_patterns:
        if re.search(pattern, license_text, re.IGNORECASE):
            return authority
    
    return "Unknown"


def categorize_aviation_license(license_text):
    """
    Categorize the type of aviation license.
    
    Args:
        license_text (str): Text describing a license
        
    Returns:
        str: The license category
    """
    license_lower = license_text.lower()
    
    if any(term in license_lower for term in ['atpl', 'airline transport pilot']):
        return 'ATPL'
    elif any(term in license_lower for term in ['cpl', 'commercial pilot']):
        return 'CPL'
    elif any(term in license_lower for term in ['ppl', 'private pilot']):
        return 'PPL'
    elif any(term in license_lower for term in ['instructor', 'fi ', 'cfi ']):
        return 'instructor'
    elif any(term in license_lower for term in ['type rating', 'aircraft rating']):
        return 'type_rating'
    elif any(term in license_lower for term in ['instrument', 'ir ', 'iri ']):
        return 'instrument_rating'
    elif any(term in license_lower for term in ['mcc', 'multi-crew']):
        return 'MCC'
    elif any(term in license_lower for term in ['cabin crew', 'flight attendant']):
        return 'cabin_crew'
    elif any(term in license_lower for term in ['sep', 'safety & emergency', 'safety and emergency']):
        return 'SEP'
    else:
        return 'other_aviation_qualification'


def extract_aviation_experience(text):
    """
    Extract aviation-specific experience metrics like flight hours.
    
    Args:
        text (str): The full text content of the CV
        
    Returns:
        dict: Dictionary containing aviation experience data
    """
    aviation_experience = {}
    
    # Pattern for flight hours extraction
    flight_hour_patterns = [
        # Total Flight Hours
        (r'(?:total|flying|flight)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'total_flight_hours'),
        
        # PIC Hours (Pilot in Command)
        (r'(?:PIC|pilot\s+in\s+command)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'pic_hours'),
        
        # SIC Hours (Second in Command)
        (r'(?:SIC|second\s+in\s+command|co-pilot)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'sic_hours'),
        
        # IFR Hours (Instrument Flight Rules)
        (r'(?:IFR|instrument(?:\s+flight)?(?:\s+rules)?)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'ifr_hours'),
        
        # Night Hours
        (r'(?:night)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'night_hours'),
        
        # Multi-Engine Hours
        (r'(?:multi[\s-]engine|ME)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'multi_engine_hours'),
        
        # Simulator Hours
        (r'(?:sim(?:ulator)?)\s+(?:hours|hrs|time)[:\s]+(?:approx\.?|approximately|~|>|about|over)?\s*(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'simulator_hours'),
        
        # Generic format with label and hours
        (r'(\w+(?:\s+\w+)?)\s+hours[:\s]+(\d{1,6}(?:,\d{3})*(?:\.\d+)?)',
         'other_hours')
    ]
    
    # Process each flight hour pattern
    for pattern, key in flight_hour_patterns:
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        for match in matches:
            try:
                if key == 'other_hours':
                    # For the generic pattern, use the label as the key
                    custom_key = match.group(1).strip().lower().replace(' ', '_') + '_hours'
                    value_str = match.group(2).replace(',', '')
                else:
                    value_str = match.group(1).replace(',', '')
                
                # Convert to float and then to int if it's a whole number
                value = float(value_str)
                if value.is_integer():
                    value = int(value)
                
                if key == 'other_hours':
                    aviation_experience[custom_key] = value
                else:
                    aviation_experience[key] = value
            except Exception as e:
                print(f"Error extracting flight hours: {str(e)}")
    
    # Extract aircraft types flown
    aircraft_types_flown = []
    aircraft_type_patterns = [
        r'(?:aircraft\s+(?:types?|flown))[:\s]+((?:[A-Za-z0-9\-]+(?:[,\s]+|\/)){1,10})',
        r'(?:experience\s+on)[:\s]+((?:[A-Za-z0-9\-]+(?:[,\s]+|\/)){1,10})',
        r'(?:qualified\s+on)[:\s]+((?:[A-Za-z0-9\-]+(?:[,\s]+|\/)){1,10})'
    ]
    
    for pattern in aircraft_type_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            aircraft_list = match.group(1).strip()
            # Split by common separators
            types = re.split(r'[,\/\s]+', aircraft_list)
            # Filter out empty strings and common words
            types = [t.strip() for t in types if t.strip() and len(t.strip()) > 2 and t.lower() not in ['and', 'the', 'with', 'on']]
            if types:
                aircraft_types_flown.extend(types)
    
    # Check for specific aircraft types from our predefined list
    for aircraft in AIRCRAFT_TYPES:
        aircraft_regex = r'\b' + re.escape(aircraft) + r'\b'
        if re.search(aircraft_regex, text, re.IGNORECASE) and aircraft not in aircraft_types_flown:
            aircraft_types_flown.append(aircraft)
    
    if aircraft_types_flown:
        aviation_experience['aircraft_types_flown'] = list(set(aircraft_types_flown))
    
    return aviation_experience


def extract_aviation_skills(text):
    """
    Extract aviation-specific technical and operational skills.
    
    Args:
        text (str): The full text content of the CV
        
    Returns:
        dict: Dictionary containing aviation skills data
    """
    aviation_skills = {
        'technical_skills': [],
        'operational_skills': [],
        'compliance_knowledge': [],
        'soft_skills': []
    }
    
    # Look for skills section
    skills_section_headers = [
        'SKILLS', 'TECHNICAL SKILLS', 'AVIATION SKILLS', 'PROFESSIONAL SKILLS',
        'COMPETENCIES', 'CAPABILITIES', 'OPERATIONAL SKILLS'
    ]
    
    skills_section = text
    skills_section_found = False
    
    # Locate skills section
    for header in skills_section_headers:
        matches = list(re.finditer(r'\b' + header + r'\b', text, re.IGNORECASE))
        if matches:
            match = matches[0]
            section_start = match.end()
            
            # Look for the next major section header
            next_section_patterns = [
                r'\n\s*[A-Z][A-Z\s]{4,}\s*(?::|$|\n)',
                r'\n\s*(?:EDUCATION|EXPERIENCE|EMPLOYMENT|LICENSES|CERTIFICATIONS|TRAINING|PROJECTS|LANGUAGES|REFERENCES)',
            ]
            
            next_section_pos = len(text)
            for pattern in next_section_patterns:
                next_matches = list(re.finditer(pattern, text[section_start:], re.IGNORECASE))
                if next_matches:
                    pos = section_start + next_matches[0].start()
                    if pos < next_section_pos:
                        next_section_pos = pos
            
            # Extract the skills section
            if next_section_pos < len(text):
                skills_section = text[section_start:next_section_pos]
            else:
                skills_section = text[section_start:]
                
            skills_section_found = True
            break
    
    # Parse bullet points or comma-separated skills
    skill_items = []
    
    # Extract bullet points
    bullet_pattern = r'(?:^|\n)(?:\s*[•\-\*♦◦‣⁃◘◙◉○●■□▪▫]\s*|\s*\d+\.\s*)([^\n\*•\-]+)'
    bullet_matches = re.finditer(bullet_pattern, skills_section, re.MULTILINE)
    for match in bullet_matches:
        skill = match.group(1).strip()
        if skill and len(skill) > 3:
            skill_items.append(skill)
    
    # Extract skills from comma-separated lists
    if len(skill_items) < 3:  # If few bullet points found, try comma separated
        comma_lists = re.finditer(r'(?:skills|competencies|capabilities)[:\s]+((?:[^,\n]+,\s*){2,}[^,\n]+)', 
                                  skills_section, re.IGNORECASE)
        for match in comma_lists:
            skills_list = match.group(1).split(',')
            for skill in skills_list:
                skill = skill.strip()
                if skill and len(skill) > 3:
                    skill_items.append(skill)
    
    # Categorize skills
    for skill in skill_items:
        skill_lower = skill.lower()
        
        # Technical skills
        if any(tech.lower() in skill_lower for tech in AVIATION_TECHNICAL_SKILLS):
            aviation_skills['technical_skills'].append(skill)
        
        # Compliance knowledge
        elif any(comp.lower() in skill_lower for comp in AVIATION_COMPLIANCE_KEYWORDS):
            aviation_skills['compliance_knowledge'].append(skill)
        
        # Soft skills
        elif any(soft.lower() in skill_lower for soft in AVIATION_SOFT_SKILLS):
            aviation_skills['soft_skills'].append(skill)
        
        # Default to operational skills
        else:
            aviation_skills['operational_skills'].append(skill)
    
    # Also check for specific keywords in the entire CV
    for keyword in AVIATION_TECHNICAL_SKILLS:
        if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
            context = extract_keyword_context(text, keyword)
            if context and context not in aviation_skills['technical_skills']:
                aviation_skills['technical_skills'].append(context)
    
    for keyword in AVIATION_COMPLIANCE_KEYWORDS:
        if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
            context = extract_keyword_context(text, keyword)
            if context and context not in aviation_skills['compliance_knowledge']:
                aviation_skills['compliance_knowledge'].append(context)
    
    # Remove empty categories
    for key in list(aviation_skills.keys()):
        if not aviation_skills[key]:
            aviation_skills.pop(key)
    
    return aviation_skills


def extract_keyword_context(text, keyword, context_chars=50):
    """
    Extract context around a keyword.
    
    Args:
        text (str): Full text to search in
        keyword (str): Keyword to find context for
        context_chars (int): Number of characters to include on each side
    
    Returns:
        str: Context string or None if keyword not found
    """
    match = re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE)
    if match:
        start = max(0, match.start() - context_chars)
        end = min(len(text), match.end() + context_chars)
        
        # Expand to complete sentences or phrases
        context = text[start:end]
        
        # Try to start at beginning of sentence/phrase
        sentence_start = re.search(r'[.!?]\s+[A-Z]', context)
        if sentence_start and sentence_start.end() < len(context) - 10:  # Ensure we're not just getting the end
            context = context[sentence_start.end()-1:]
        
        # Try to end at end of sentence/phrase
        sentence_end = re.search(r'[.!?]\s+', context)
        if sentence_end:
            context = context[:sentence_end.end()-1]
            
        return context.strip()
    return None
