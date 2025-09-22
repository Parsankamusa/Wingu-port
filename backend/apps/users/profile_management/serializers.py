from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.utils.translation import gettext_lazy as _
import base64
import uuid
import os
import mimetypes
import io
from datetime import datetime

from .models import (
    ProfessionalPersonalInfo, 
    ProfessionalExperience, 
    ProfessionalDocument,
    RecruiterDocument,
    ProfessionalRoles,
    Qualifications,
    LicensesRatings,
    # OrganizationProfile,
    EmploymentHistory,
    UploadedFile
)

User = get_user_model()

# Define allowed file extensions
ALLOWED_FILE_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx']

# Define mime type mappings
ALLOWED_MIME_TYPES = {
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
}

def parse_base64_file(base64_data):
    """
    Parse and validate base64-encoded file data.
    Returns a tuple of (file_content, file_name, mime_type)
    """
    if not isinstance(base64_data, str) or not base64_data.startswith('data:'):
        raise serializers.ValidationError(_("Invalid base64 format. Expected format: data:[mime_type];base64,[data]"))
    
    try:
        # Parse the base64 file
        format_data, filestr = base64_data.split(';base64,')
        mime_type = format_data.replace('data:', '')
        
        # Validate mime type
        mime_ext = None
        for allowed_mime, ext in ALLOWED_MIME_TYPES.items():
            if mime_type.startswith(allowed_mime):
                mime_ext = ext
                break
        
        if mime_ext is None:
            raise serializers.ValidationError(
                _(f"Unsupported file type: {mime_type}. Allowed types: PDF, PNG, JPEG, JPG, DOC, DOCX")
            )
        
        # Generate file name
        file_name = f"{uuid.uuid4()}.{mime_ext}"
        
        # Decode base64 data
        try:
            file_content = base64.b64decode(filestr)
        except Exception:
            raise serializers.ValidationError(_("Invalid base64 encoded data"))
            
        return file_content, file_name, mime_type
    except Exception as e:
        if isinstance(e, serializers.ValidationError):
            raise
        raise serializers.ValidationError(_("Invalid base64 format or corrupted data"))


class Base64FileField(serializers.FileField):
    """
    Custom field for handling base64-encoded files.
    Accepts both regular file uploads and base64-encoded strings.
    """
    def to_internal_value(self, data):
        #--------- Check if this is a base64 encoded file----------
        if isinstance(data, str) and data.startswith('data:'):
            file_content, file_name, mime_type = parse_base64_file(data)
            data = ContentFile(file_content, name=file_name)
        
        # -----------Regular file upload validation------------
        elif hasattr(data, 'name'):
            ext = data.name.split('.')[-1].lower()
            if ext not in ALLOWED_FILE_EXTENSIONS:
                raise serializers.ValidationError(
                    _(f"Unsupported file extension: {ext}. Allowed extensions: {', '.join(ALLOWED_FILE_EXTENSIONS)}")
                )
        
        return super().to_internal_value(data)

class ProfessionalPersonalInfoSerializer(serializers.ModelSerializer):
    """Serializer for professional personal info."""
    class Meta:
        model = ProfessionalPersonalInfo
        exclude = ('user',)


class ProfessionalExperienceSerializer(serializers.ModelSerializer):
    """Serializer for professional experience."""
    class Meta:
        model = ProfessionalExperience
        exclude = ('user',)


class ProfessionalDocumentSerializer(serializers.ModelSerializer):
    """Serializer for professional documents."""
    cv = Base64FileField(required=False)
    aviation_licenses = Base64FileField(required=False)
    reference_letters = Base64FileField(required=False)
    passport = Base64FileField(required=False)
    class Meta:
        model = ProfessionalDocument
        exclude = ('user',)
    
    def validate(self, data):
        """Validate document files"""
        for field_name, field_value in data.items():
            if field_value and hasattr(field_value, 'content_type'):
                content_type = field_value.content_type
                if content_type not in ALLOWED_MIME_TYPES:
                    raise serializers.ValidationError({
                        field_name: _(f"Unsupported file type: {content_type}. Please upload PDF, PNG, JPEG, JPG, DOC or DOCX files.")
                    })
        return data


class RecruiterDocumentSerializer(serializers.ModelSerializer):
    """Serializer for recruiter documents."""
    company_documents = Base64FileField(required=False)
    
    class Meta:
        model = RecruiterDocument
        exclude = ('user',)
    
    def validate(self, data):
        """Validate document files"""
        for field_name, field_value in data.items():
            if field_value and hasattr(field_value, 'content_type'):
                content_type = field_value.content_type
                if content_type not in ALLOWED_MIME_TYPES:
                    raise serializers.ValidationError({
                        field_name: _(f"Unsupported file type: {content_type}. Please upload PDF, PNG, JPEG, JPG, DOC or DOCX files.")
                    })
        return data


class ProfessionalRolesSerializer(serializers.ModelSerializer):
    """Serializer for professional roles."""
    aviation_category_display = serializers.SerializerMethodField()
    regulatory_body_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfessionalRoles
        exclude = ('user',)
    
    def get_aviation_category_display(self, obj):
        return obj.get_aviation_category_display()
    
    def get_regulatory_body_display(self, obj):
        if obj.regulatory_body:
            return obj.get_regulatory_body_display()
        return None


class QualificationsSerializer(serializers.ModelSerializer):
    """Serializer for professional qualifications."""
    education_level_display = serializers.SerializerMethodField()
    certificate_upload = Base64FileField(required=False)

    class Meta:
        model = Qualifications
        exclude = ('user',)

    def get_education_level_display(self, obj):
        return obj.get_highest_education_level_display()


class LicensesRatingsSerializer(serializers.ModelSerializer):
    """Serializer for professional licenses and ratings."""
    license_status_display = serializers.SerializerMethodField()
    license_upload = Base64FileField(required=False)
    
    class Meta:
        model = LicensesRatings
        exclude = ('user',)
        read_only_fields = ('license_status',)
    
    def get_license_status_display(self, obj):
        """
        Get the display value for the license_status field.
        This uses Django's get_FOO_display() method for choice fields.
        """
        return obj.get_license_status_display()
        
class EmploymentHistorySerializer(serializers.ModelSerializer):
    """Serializer for employment history."""
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = EmploymentHistory
        exclude = ('user',)
        extra_kwargs = {
            'responsibilities': {'required': False},
            'reason_leaving': {'required': False},
            'is_current': {'required': False}
        }
    
    def get_duration(self, obj):
        """Calculate the duration of employment."""
        if obj.end_date:
            delta = obj.end_date - obj.start_date
            years = delta.days // 365
            months = (delta.days % 365) // 30
            return f"{years} years, {months} months"
        elif obj.is_current:
            from django.utils import timezone
            today = timezone.now().date()
            delta = today - obj.start_date
            years = delta.days // 365
            months = (delta.days % 365) // 30
            return f"{years} years, {months} months (Current)"
        return "Duration not available"
    
    def validate(self, data):
        """Validate employment history data."""
        if 'start_date' in data and 'end_date' in data and data['end_date']:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': _("End date cannot be earlier than start date.")
                })
        
        # If is_current is True, end_date should be None
        if data.get('is_current', False) and data.get('end_date'):
            data['end_date'] = None
        
        # If end_date is None and is_current is not provided, set is_current to True
        if 'end_date' in data and data['end_date'] is None and 'is_current' not in data:
            data['is_current'] = True
            
        return data
    
    def get_license_status_display(self, obj):
        return obj.get_license_status_display()
    
    def validate(self, data):
        """Validate document files"""
        if 'license_upload' in data and hasattr(data['license_upload'], 'content_type'):
            content_type = data['license_upload'].content_type
            if content_type not in ALLOWED_MIME_TYPES:
                raise serializers.ValidationError({
                    'license_upload': _(f"Unsupported file type: {content_type}. Please upload PDF, PNG, JPEG, JPG, DOC or DOCX files.")
                })
        
        # Check expiry date logic
        if 'issue_date' in data and 'expiry_date' in data:
            if data['issue_date'] > data['expiry_date']:
                raise serializers.ValidationError({
                    'expiry_date': _("Expiry date cannot be earlier than issue date.")
                })
        
        return data
    
    def to_internal_value(self, data):
        """
        Override to_internal_value to automatically set license_status based on expiry_date
        """
        validated_data = super().to_internal_value(data)
        
        # Automatically set license_status based on expiry_date
        if 'expiry_date' in validated_data:
            from django.utils import timezone
            today = timezone.now().date()
            
            if validated_data['expiry_date'] < today:
                validated_data['license_status'] = 'expired'
            else:
                validated_data['license_status'] = 'active'
        
        return validated_data
        
    def create(self, validated_data):
        """
        Create and return a new `LicensesRatings` instance, with automatic parsing
        of license information if a license file is uploaded.
        """
        instance = super().create(validated_data)
        
        # If a license file was uploaded, try to parse information from it
        if instance.license_upload:
            instance.parse_license_info()
            
        return instance
        
    def update(self, instance, validated_data):
        """
        Update and return an existing `LicensesRatings` instance, with automatic parsing
        of license information if a license file is uploaded.
        """
        instance = super().update(instance, validated_data)
        
        # If a new license file was uploaded, try to parse information from it
        if 'license_upload' in validated_data and instance.license_upload:
            instance.parse_license_info()
            
        return instance


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    """Serializer for the professional user profile with all related info."""
    full_name = serializers.CharField(required=False)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    personal_info = ProfessionalPersonalInfoSerializer(required=False)
    experience = ProfessionalExperienceSerializer(required=False)
    documents = ProfessionalDocumentSerializer(required=False)
    professional_roles = ProfessionalRolesSerializer(many=True, required=False)
    qualifications = QualificationsSerializer(many=True, required=False)
    licenses = LicensesRatingsSerializer(many=True, required=False)
    employment_history = EmploymentHistorySerializer(many=True, required=False)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'first_name', 'last_name', 'profile_picture',
            'specialization', 'personal_info', 'experience', 'documents', 
            'professional_roles', 'qualifications', 'licenses', 'employment_history'
        )
    
    def update(self, instance, validated_data):
        # Update User model fields
        if 'full_name' in validated_data:
            full_name = validated_data.pop('full_name')
            instance.full_name = full_name
            # Split full_name into first_name and last_name
            name_parts = full_name.split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data.pop('profile_picture')
            
        if 'specialization' in validated_data:
            instance.specialization = validated_data.pop('specialization')
            
        # Update or create related models
        personal_info_data = validated_data.pop('personal_info', None)
        if personal_info_data:
            personal_info, created = ProfessionalPersonalInfo.objects.get_or_create(user=instance)
            for attr, value in personal_info_data.items():
                setattr(personal_info, attr, value)
            personal_info.save()
            
        experience_data = validated_data.pop('experience', None)
        if experience_data:
            experience, created = ProfessionalExperience.objects.get_or_create(user=instance)
            for attr, value in experience_data.items():
                setattr(experience, attr, value)
            experience.save()
            
        documents_data = validated_data.pop('documents', None)
        if documents_data:
            documents, created = ProfessionalDocument.objects.get_or_create(user=instance)
            for attr, value in documents_data.items():
                setattr(documents, attr, value)
            documents.save()
        
        # Handle professional_roles data (many-to-many relationship)
        professional_roles_data = validated_data.pop('professional_roles', None)
        if professional_roles_data:
            # Don't delete existing roles, just add new ones or update
            for role_data in professional_roles_data:
                # If role_id is provided, try to update existing role
                role_id = role_data.pop('id', None)
                if role_id:
                    try:
                        role = ProfessionalRoles.objects.get(id=role_id, user=instance)
                        for attr, value in role_data.items():
                            setattr(role, attr, value)
                        role.save()
                    except ProfessionalRoles.DoesNotExist:
                        # If role doesn't exist, create new one
                        ProfessionalRoles.objects.create(user=instance, **role_data)
                else:
                    # Create new role
                    ProfessionalRoles.objects.create(user=instance, **role_data)
                    
        # Handle qualifications data (many-to-many relationship)
        qualifications_data = validated_data.pop('qualifications', None)
        if qualifications_data:
            for qualification_data in qualifications_data:
                qualification_id = qualification_data.pop('id', None)
                if qualification_id:
                    try:
                        qualification = Qualifications.objects.get(id=qualification_id, user=instance)
                        for attr, value in qualification_data.items():
                            setattr(qualification, attr, value)
                        qualification.save()
                    except Qualifications.DoesNotExist:
                        # If qualification doesn't exist, create new one
                        Qualifications.objects.create(user=instance, **qualification_data)
                else:
                    # Create new qualification
                    Qualifications.objects.create(user=instance, **qualification_data)
        
        # Handle licenses data (many-to-many relationship)
        licenses_data = validated_data.pop('licenses', None)
        if licenses_data:
            for license_data in licenses_data:
                # If license_id is provided, try to update existing license
                license_id = license_data.pop('id', None)
                
                # Automatically set license status based on expiry date
                if 'expiry_date' in license_data:
                    from django.utils import timezone
                    today = timezone.now().date()
                    if license_data['expiry_date'] < today:
                        license_data['license_status'] = 'expired'
                    else:
                        license_data['license_status'] = 'active'
                        
                # If license has upload, update or create
                if license_id:
                    try:
                        license_obj = LicensesRatings.objects.get(id=license_id, user=instance)
                        for attr, value in license_data.items():
                            setattr(license_obj, attr, value)
                        license_obj.save()
                    except LicensesRatings.DoesNotExist:
                        # If license doesn't exist, create new one
                        LicensesRatings.objects.create(user=instance, **license_data)
                else:
                    # Create new license
                    LicensesRatings.objects.create(user=instance, **license_data)
        
        # Handle employment history data (many-to-many relationship)
        employment_history_data = validated_data.pop('employment_history', None)
        if employment_history_data:
            for history_data in employment_history_data:
                # If history_id is provided, try to update existing history
                history_id = history_data.pop('id', None)
                
                # Handle is_current logic
                if history_data.get('is_current', False) and 'end_date' in history_data:
                    history_data['end_date'] = None
                
                if history_id:
                    try:
                        history_obj = EmploymentHistory.objects.get(id=history_id, user=instance)
                        for attr, value in history_data.items():
                            setattr(history_obj, attr, value)
                        history_obj.save()
                    except EmploymentHistory.DoesNotExist:
                        # If history doesn't exist, create new one
                        EmploymentHistory.objects.create(user=instance, **history_data)
                else:
                    # Create new history
                    EmploymentHistory.objects.create(user=instance, **history_data)
            
        instance.save()
        return instance


class CVUploadSerializer(serializers.Serializer):
    """Serializer for CV upload and processing."""
    cv = Base64FileField(help_text=_('CV file in PDF or DOCX format'))
    
    def validate_cv(self, value):
        """Validate that the uploaded file is a PDF or DOCX."""
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ['.pdf', '.docx']:
            raise serializers.ValidationError(_('Only PDF and DOCX files are supported'))
        
        
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(_('File size must not exceed 5MB'))
            
        return value


class RecruiterProfileSerializer(serializers.ModelSerializer):
    """Serializer for the recruiter user profile with all related info."""
    email = serializers.EmailField(read_only=True)
    recruiter_documents = RecruiterDocumentSerializer(required=False)
    
    class Meta:
        model = User
        fields = ('company_name', 'company_website', 'email', 'country', 'company_address',
         'company_email', 'company_phone',  'company_registration_number', 'company_type', 'recruiter_documents'
         )
    
    def update(self, instance, validated_data):
        # Update User model fields
        for attr in ['company_name', 'company_website', 'country', 'company_address',
                     'company_email', 'company_phone', 'company_registration_number', 'company_type']:
            if attr in validated_data:
                setattr(instance, attr, validated_data.pop(attr))
        recruiter_documents_data = validated_data.pop('recruiter_documents', None)
        if recruiter_documents_data:
            recruiter_documents, created = RecruiterDocument.objects.get_or_create(user=instance)
            for attr, value in recruiter_documents_data.items():
                setattr(recruiter_documents, attr, value)
            recruiter_documents.save()
        
        instance.save()
        return instance

# class OrganizationProfileSerializer(serializers.ModelSerializer):
#     """Serializer for recruiter's organization profile."""
#     organization_type_display = serializers.SerializerMethodField()
#     organization_logo = Base64FileField(required=False)
    
#     class Meta:
#         model = OrganizationProfile
#         exclude = ('user',)
        
#     def get_organization_type_display(self, obj):
#         return obj.get_organization_type_display()
        
#     def validate_organization_logo(self, value):
#         """Validate organization logo file."""
#         if value and hasattr(value, 'content_type'):
#             if not value.content_type.startswith('image/'):
#                 raise serializers.ValidationError(
#                     _("Unsupported file type. Please upload an image file.")
#                 )
#         return value

class UploadedFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedFile
        fields = ['id', 'category', 'file', 'file_url', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
        return None

class MultiUploadSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=Base64FileField(),
        write_only=True
    )
    category = serializers.ChoiceField(choices=UploadedFile.DOCUMENT_CATEGORIES)
    uploaded_files = UploadedFileSerializer(many=True, read_only=True)

    def validate(self, data):
        """
        Validate that the user has not exceeded the maximum number of documents.
        """
        user = self.context['request'].user
        category = data.get('category')
        
        existing_files_count = UploadedFile.objects.filter(
            user=user, 
            category=category
        ).count()
        
        
        new_files_count = len(data.get('files', []))
        total_files = existing_files_count + new_files_count
        
        if total_files > 5:
            raise serializers.ValidationError(
                _("You can upload a maximum of 5 documents per category. "
                  f"You already have {existing_files_count} documents in this category.")
            )
        
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        files = validated_data.pop('files')
        category = validated_data.pop('category')
        
        uploaded_files = [
            UploadedFile(
                user=user, 
                file=file, 
                category=category
            ) for file in files
        ]
        
        UploadedFile.objects.bulk_create(uploaded_files)
        return {'uploaded_files': uploaded_files}