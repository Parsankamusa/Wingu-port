from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from core.versioning.views import VersionedAPIView

from apps.authentication.serializers.auth_serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    ProfessionalRegistrationSerializer,
    RecruiterRegistrationSerializer,
    OTPVerificationSerializer,
    ResendOTPSerializer,
    RequestPasswordResetSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)


class LoginSerializer(serializers.Serializer):
    """Specialized login serializer that takes email and password."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom view for obtaining JWT tokens."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Login user and obtain JWT token",
        operation_description="Login with email and password to obtain JWT access and refresh tokens",
        request_body=LoginSerializer,
        responses={
            200: openapi.Response(
                description="Login successful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'access': openapi.Schema(type=openapi.TYPE_STRING, description='Access token'),
                        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
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
        # Validate using login serializer first
        login_serializer = LoginSerializer(data=request.data)
        if not login_serializer.is_valid():
            return Response(login_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # Now prepare the data for JWT authentication
        email = login_serializer.validated_data['email']
        password = login_serializer.validated_data['password']
        
        # Create a new request with username field set to email for JWT auth
        data = {'username': email, 'password': password}
        request._full_data = data
        
        return super().post(request, *args, **kwargs)

# class RegisterUserView(generics.CreateAPIView):
    """View for user registration."""
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer  # Default serializer, will be overridden
    
    def get_serializer_class(self):
        """
        Return the class to use for the serializer based on the role parameter.
        """
        role = self.request.data.get('user_type')
        if self.request.method == 'POST':
            if role == 'professional':
                return ProfessionalRegistrationSerializer
            elif role == 'recruiter':
                return RecruiterRegistrationSerializer
        return UserRegistrationSerializer
    
    @swagger_auto_schema(
        operation_summary="Register a new user",
        operation_description="Register a new user (professional or recruiter) and send verification email",
        manual_parameters=[
            openapi.Parameter(
                'user_type', 
                openapi.IN_QUERY, 
                description="Type of user to register ('professional' or 'recruiter')",
                type=openapi.TYPE_STRING,
                required=True,
                enum=['professional', 'recruiter']
            )
        ],
        responses={
            201: openapi.Response(
                description="User registered successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'data': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'email': openapi.Schema(type=openapi.TYPE_STRING),
                                'role': openapi.Schema(type=openapi.TYPE_STRING),
                            }
                        )
                    }
                )
            ),
            400: "Invalid input data"
        }
    )
    def create(self, request, *args, **kwargs):
        # Get serializer class based on user_type
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Prepare response data based on user role
        response_data = {
            "email": user.email,
            "role": user.role,
        }
        
        if user.role == user.Role.PROFESSIONAL:
            response_data["full_name"] = user.full_name
        elif user.role == user.Role.RECRUITER:
            response_data["company_name"] = user.company_name
            if user.company_website:
                response_data["company_website"] = user.company_website
        
        return Response({
            "status": "success",
            "message": f"{user.get_role_display()} account registered successfully. Please check your email for verification code.",
            "data": response_data
        }, status=status.HTTP_201_CREATED)

class VerifyOTPView(generics.GenericAPIView):
    """View for OTP verification."""
    permission_classes = [AllowAny]
    serializer_class = OTPVerificationSerializer
    
    @swagger_auto_schema(
        operation_summary="Verify email with OTP code",
        operation_description="Verify user's email address with the OTP code sent during registration",
        request_body=OTPVerificationSerializer,
        responses={
            200: openapi.Response(
                description="Email verified successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Invalid OTP or email"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        otp_obj = serializer.validated_data['otp_obj']
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        
        # Mark user as verified
        user.is_email_verified = True
        user.save()
        
        return Response({
            "status": "success",
            "message": "Email verified successfully. You can now log in."
        }, status=status.HTTP_200_OK)

class ResendOTPView(generics.GenericAPIView):
    """View for resending OTP."""
    permission_classes = [AllowAny]
    serializer_class = ResendOTPSerializer
    
    @swagger_auto_schema(
        operation_summary="Resend OTP verification code",
        operation_description="Request a new OTP code to be sent to the user's email",
        request_body=ResendOTPSerializer,
        responses={
            200: openapi.Response(
                description="OTP sent successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Invalid email"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Invalidate any existing unused OTPs for this user
        from apps.authentication.models import OTP
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate new OTP
        otp = OTP.generate_for_user(user)
        from apps.authentication.utils import send_otp_email
        send_otp_email(user, otp.code)
        
        return Response({
            "status": "success",
            "message": "Verification code sent to your email."
        }, status=status.HTTP_200_OK)

class RequestPasswordResetView(generics.GenericAPIView):
    """View for requesting password reset."""
    permission_classes = [AllowAny]
    serializer_class = RequestPasswordResetSerializer
    
    @swagger_auto_schema(
        operation_summary="Request password reset",
        operation_description="Request a password reset link to be sent to the user's email",
        request_body=RequestPasswordResetSerializer,
        responses={
            200: openapi.Response(
                description="Password reset email sent",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Invalid email"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            "status": "success",
            "message": "Password reset link sent to your email."
        }, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    """View for confirming password reset."""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    @swagger_auto_schema(
        operation_summary="Confirm password reset",
        operation_description="Set a new password using the reset token received by email",
        request_body=PasswordResetConfirmSerializer,
        responses={
            200: openapi.Response(
                description="Password reset successful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Invalid token or password"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            "status": "success",
            "message": "Password reset successful. You can now log in with your new password."
        }, status=status.HTTP_200_OK)
        
        
class ChangePasswordView(generics.GenericAPIView):
    """View for changing password."""
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    @swagger_auto_schema(
        operation_summary="Change user password",
        operation_description="Change the logged-in user's password",
        request_body=ChangePasswordSerializer,
        responses={
            200: openapi.Response(
                description="Password changed successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Invalid password",
            401: "Authentication failed"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            "status": "success",
            "message": "Password changed successfully."
        }, status=status.HTTP_200_OK)
