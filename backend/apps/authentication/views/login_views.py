from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    """Serializer for the login endpoint."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                {"non_field_errors": ["Both email and password are required."]}
            )
        
        # Try to authenticate the user
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError(
                {"non_field_errors": ["Unable to log in with provided credentials. Please check the credentials and try again."]}
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                {"non_field_errors": ["User account is disabled."]}
            )
            
    # Check if email is verified
        if not user.is_email_verified:
            raise serializers.ValidationError(
                {"non_field_errors": ["Email not verified. Please verify your email before logging in."]}
            )
        
        attrs['user'] = user
        return attrs

class LoginView(APIView):
    """View for user login."""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    @swagger_auto_schema(
        operation_summary="Login user",
        operation_description=(
            "Login with email and password to obtain JWT access and refresh tokens.\n\n"
            "**IMPORTANT**: For authenticated endpoints, use the returned access token in the Authorization header:\n"
            "- Add header: `Authorization: Bearer your_access_token_here`\n\n"
            "Example usage:\n"
            "1. Login to get the token\n"
            "2. Copy the access token value\n"
            "3. Click the 'Authorize' button at the top of the page\n"
            "4. In the value field, enter: `Bearer your_access_token_here`\n"
            "5. Click 'Authorize' and close the modal\n"
            "6. Now you can access protected endpoints"
        ),
        request_body=LoginSerializer,
        responses={
            200: openapi.Response(
                description="Login successful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'access': openapi.Schema(type=openapi.TYPE_STRING, description='Access token for authenticated requests. Use in Authorization header as: Bearer {token}'),
                        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token to obtain a new access token when expired'),
                        'user': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'email': openapi.Schema(type=openapi.TYPE_STRING),
                                'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'role': openapi.Schema(type=openapi.TYPE_STRING),
                                'is_email_verified': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                            }
                        )
                    }
                )
            ),
            400: "Bad request - Missing email or password",
            401: "Invalid credentials"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Prepare user data
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_email_verified': user.is_email_verified
        }
        
        # Add role-specific fields
        if user.role == user.Role.PROFESSIONAL and hasattr(user, 'full_name') and user.full_name:
            user_data['full_name'] = user.full_name
        elif user.role == user.Role.RECRUITER:
            if hasattr(user, 'company_name') and user.company_name:
                user_data['company_name'] = user.company_name
            if hasattr(user, 'company_website') and user.company_website:
                user_data['company_website'] = user.company_website
        
        # Return tokens and user data
        return Response({
            'refresh': str(refresh),
            'access': access_token,
            'user': user_data
        }, status=status.HTTP_200_OK)
