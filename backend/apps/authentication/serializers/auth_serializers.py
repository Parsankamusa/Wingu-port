from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import uuid

from apps.authentication.models import OTP, PasswordReset
from apps.authentication.utils import send_otp_email, send_password_reset_email

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user data."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['is_email_verified'] = user.is_email_verified
        
        return token
    
    def validate(self, attrs):
        # Handle either username or email field
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Handle the case where email is provided but username is expected
        if email and not username:
            # Use the email as username for authentication
            attrs['username'] = email
        
        # Ensure we have password
        if not password:
            raise serializers.ValidationError(
                {"non_field_errors": ["Password is required."]}
            )
        
        # Try standard validation from parent class
        try:
            data = super().validate(attrs)
            
            # Check if user exists but email is not verified                
        except Exception as e:
            # If standard validation fails, provide clearer error messages
            
            raise serializers.ValidationError(
                {"non_field_errors": ["Unable to log in with provided credentials."]}
            )
        
        # Add user info to response
        user_data = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_email_verified': self.user.is_email_verified
        }
        
        # Add role-specific fields
        if self.user.role == self.user.Role.PROFESSIONAL and self.user.full_name:
            user_data['full_name'] = self.user.full_name
        elif self.user.role == self.user.Role.RECRUITER:
            if self.user.company_name:
                user_data['company_name'] = self.user.company_name
            if self.user.company_website:
                user_data['company_website'] = self.user.company_website
                
        data['user'] = user_data
        
        return data

class BaseRegistrationSerializer(serializers.ModelSerializer):
    """Base serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
            
        # Check if email is already in use
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
            
        return attrs
    
    def _create_user(self, validated_data):
        """Common user creation logic"""
        validated_data.pop('password_confirm')
        
        # Extract role-specific fields to add after user creation
        role_specific_fields = {}
        if 'full_name' in validated_data:
            role_specific_fields['full_name'] = validated_data.pop('full_name')
        if 'company_name' in validated_data:
            role_specific_fields['company_name'] = validated_data.pop('company_name')
        if 'company_website' in validated_data:
            role_specific_fields['company_website'] = validated_data.pop('company_website')
        
        # Create the user with base fields
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            **{k: v for k, v in validated_data.items() if k not in ['email', 'password']}
        )
        
        # Update user with role-specific fields
        for field, value in role_specific_fields.items():
            setattr(user, field, value)
        user.save()
        
        # Generate OTP for email verification
        otp = OTP.generate_for_user(user)
        send_otp_email(user, otp.code)
        
        return user
        

class ProfessionalRegistrationSerializer(BaseRegistrationSerializer):
    """Serializer for professional user registration."""
    full_name = serializers.CharField(max_length=150, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'full_name', 'role')
        extra_kwargs = {
            'role': {'read_only': True}
        }
        
    def create(self, validated_data):
        validated_data['role'] = User.Role.PROFESSIONAL
        # Split full_name into first_name and last_name
        full_name = validated_data.get('full_name', '')
        name_parts = full_name.split(' ', 1)
        validated_data['first_name'] = name_parts[0]
        validated_data['last_name'] = name_parts[1] if len(name_parts) > 1 else ''
        
        return self._create_user(validated_data)


class RecruiterRegistrationSerializer(BaseRegistrationSerializer):
    """Serializer for recruiter user registration."""
    company_name = serializers.CharField(max_length=200, required=True)
    company_website = serializers.URLField(max_length=200, required=False)
    company_type = serializers.ChoiceField(choices=[('company', 'Company'), ('ngo', 'NGO'), ('government', 'Government'), ('airline', 'Airline'), ('mro', 'MRO'), ('training institute', 'Training Institute'), ('airfield operators', 'Airfield Operators'), ('advocacy groups', 'Advocacy Groups'), ('ngos', 'NGOs'), ('government agencies', 'Government Agencies'), ('other', 'Other')], required=True)
    

    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'company_name', 'company_website', 'role', 'company_type')
        extra_kwargs = {
            'role': {'read_only': True}
        }
        
    def create(self, validated_data):
        validated_data['role'] = User.Role.RECRUITER
        # Remove first_name and last_name if present
        validated_data.pop('first_name', None)
        validated_data.pop('last_name', None)
        return self._create_user(validated_data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Legacy serializer for user registration - kept for compatibility."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True}
        }
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
        
        # Check if role is valid
        role = attrs.get('role')
        if role not in [User.Role.PROFESSIONAL, User.Role.RECRUITER]:
            raise serializers.ValidationError({"role": "Invalid role selected."})
            
        # Check if email is already in use
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
            
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role']
        )
        
        # Generate OTP for email verification
        otp = OTP.generate_for_user(user)
        send_otp_email(user, otp.code)
        
        return user

class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification."""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        email = attrs.get('email')
        otp_code = attrs.get('otp')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        
        # Check if user is already verified
        if user.is_email_verified:
            raise serializers.ValidationError({"email": "This email is already verified."})
        
        # Check if OTP exists and is valid
        from apps.authentication.utils import is_otp_expired
        
        latest_otp = OTP.objects.filter(user=user, is_used=False).order_by('-created_at').first()
        if not latest_otp:
            raise serializers.ValidationError({"otp": "No OTP found. Please request a new one."})
            
        if latest_otp.code != otp_code:
            raise serializers.ValidationError({"otp": "Invalid OTP."})
            
        if is_otp_expired(latest_otp.created_at):
            raise serializers.ValidationError({"otp": "OTP has expired. Please request a new one."})
            
        attrs['user'] = user
        attrs['otp_obj'] = latest_otp
        
        return attrs

class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""
    email = serializers.EmailField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        
        try:
            user = User.objects.get(email=email)
            attrs['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
            
        return attrs

class RequestPasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        
        try:
            user = User.objects.get(email=email)
            attrs['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
            
        return attrs
    
    def save(self):
        user = self.validated_data['user']
        
        # Invalidate any existing unused password reset tokens
        PasswordReset.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Create new password reset token
        reset_obj = PasswordReset.objects.create(user=user)
        
        # Send email with reset link
        send_password_reset_email(user, reset_obj.token)

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
        
        token = attrs.get('token')
        
        try:
            reset_obj = PasswordReset.objects.get(token=token, is_used=False)
            
            # Check if token is expired (24 hours)
            from apps.authentication.utils import is_token_expired
            if is_token_expired(reset_obj.created_at):
                raise serializers.ValidationError({"token": "This password reset link has expired."})
                
            attrs['reset_obj'] = reset_obj
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid or expired token."})
            
        return attrs
    
    def save(self):
        reset_obj = self.validated_data['reset_obj']
        user = reset_obj.user
        
        # Set new password
        user.set_password(self.validated_data['password'])
        user.save()
        
        # Mark token as used
        reset_obj.is_used = True
        reset_obj.save()
        
        
class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields don't match."})
            
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the current password."})
            
        return attrs
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
