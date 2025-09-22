from django.contrib.auth import get_user_model
from rest_framework import serializers
import base64
import uuid
from django.utils.translation import gettext_lazy as _

from apps.users.profile_management.serializers import Base64FileField

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


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    profile_picture = Base64FileField(required=False)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_email_verified', 
                  'profile_picture', 'date_joined', 'full_name', 'specialization', 'company_address', 'company_email', 'company_phone', 'company_logo', 'company_registration_number', 'company_type',
                  'company_name', 'company_website')
        read_only_fields = ('id', 'email', 'role', 'is_email_verified', 'date_joined')


class ProfessionalProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating professional user profiles."""
    profile_picture = Base64FileField(required=False)
    class Meta:
        model = User
        fields = ('full_name', 'specialization', 'profile_picture', 'email', 'first_name', 'last_name')
        read_only_fields = ('email', 'first_name', 'last_name')
        
    def validate(self, attrs):
        user = self.context['request'].user
        if user.role != User.Role.PROFESSIONAL:
            raise serializers.ValidationError({"role": "This endpoint is only for professional users."})
        return attrs
    
    def update(self, instance, validated_data):
        if 'full_name' in validated_data:
            full_name = validated_data.get('full_name')
            # Split full_name into first_name and last_name
            name_parts = full_name.split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ''
            instance.full_name = full_name
        
        # Update other fields
        instance.specialization = validated_data.get('specialization', instance.specialization)
        
        # Update profile picture if provided
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data.get('profile_picture')
            
        instance.save()
        return instance
        

class RecruiterProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating recruiter user profiles."""
    class Meta:
        model = User
        fields = ('company_name', 'company_website', 'email', 'country', 'company_address', 'company_email', 'company_phone',  'company_logo', 'company_registration_number', 'company_type')
        read_only_fields = ('email',)
        
    def validate(self, attrs):
        user = self.context['request'].user
        if user.role != User.Role.RECRUITER:
            raise serializers.ValidationError({"role": "This endpoint is only for recruiter users."})
        return attrs
