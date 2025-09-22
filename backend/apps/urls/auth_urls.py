from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.authentication.views.auth_views import (
    VerifyOTPView,
    ResendOTPView,
    RequestPasswordResetView,
    PasswordResetConfirmView,
    ChangePasswordView,
)
from apps.authentication.views.register_views import (
    ProfessionalRegistrationView,
    RecruiterRegistrationView,
)
from apps.authentication.views.login_views import LoginView

urlpatterns = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/professional/', ProfessionalRegistrationView.as_view(), name='register-professional'),
    path('register/recruiter/', RecruiterRegistrationView.as_view(), name='register-recruiter'),
    path('verify-email/', VerifyOTPView.as_view(), name='verify-email'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('password/reset/', RequestPasswordResetView.as_view(), name='password-reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),
]
