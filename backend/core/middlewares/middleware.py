"""
Custom middleware classes for the Wingu-port application.

This module contains middleware classes that can be used throughout the application
for common tasks like request logging, security headers, response time tracking,
and more.
"""

import re
import time
import json
import logging
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

logger = logging.getLogger(__name__)

class RequestResponseTimeMiddleware:
    """
    Middleware to log the time taken for each request/response cycle.
    Useful for performance monitoring and debugging slow endpoints.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Record the start time
        start_time = time.time()
        
        # Process the request
        response = self.get_response(request)
        
        # Calculate and log the request processing time
        duration = time.time() - start_time
        
        # Only log if it takes more than a threshold (e.g., 1 second)
        if duration > 1.0:
            logger.warning(
                f"Slow request: {request.method} {request.path} took {duration:.2f}s"
            )
        
        # Add the processing time to the response headers
        response["X-Request-Processing-Time"] = f"{duration:.3f}s"
        
        return response

class SecurityHeadersMiddleware:
    """
    Middleware to add security headers to HTTP responses.
    Helps protect against common web vulnerabilities.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Only add HSTS header in production
        if not settings.DEBUG:
            response["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

class APIRequestLoggingMiddleware:
    """
    Middleware to log API requests with their payload (for debugging).
    In production, sensitive data should be masked.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # URLs where we don't want to log the payload (e.g., login endpoints)
        self.sensitive_urls = [
            r'^/api/v1/auth/login/$',
            r'^/api/v1/auth/register/$',
            r'^/api/v1/auth/password-reset/$',
        ]
        
    def is_sensitive_url(self, path):
        """Check if the URL is in our sensitive list"""
        return any(re.match(pattern, path) for pattern in self.sensitive_urls)
    
    def __call__(self, request):
        # Only log API requests
        if request.path.startswith('/api/'):
            method = request.method
            path = request.path
            
            # Log the request with masked data if it's sensitive
            if self.is_sensitive_url(path):
                logger.info(f"API Request: {method} {path} [SENSITIVE DATA]")
            else:
                try:
                    # Log request body for POST/PUT/PATCH
                    if method in ('POST', 'PUT', 'PATCH') and request.body:
                        body = json.loads(request.body)
                        # Mask any potentially sensitive fields
                        if 'password' in body:
                            body['password'] = '[MASKED]'
                        if 'token' in body:
                            body['token'] = '[MASKED]'
                        logger.info(f"API Request: {method} {path}, Body: {body}")
                    else:
                        logger.info(f"API Request: {method} {path}")
                except json.JSONDecodeError:
                    logger.info(f"API Request: {method} {path} [Non-JSON body]")
        
        response = self.get_response(request)
        return response

class MaintenanceModeMiddleware:
    """
    Middleware to enable maintenance mode for the application.
    When enabled, all requests will receive a maintenance message.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Check if maintenance mode is enabled
        # This can be controlled via an environment variable or database setting
        maintenance_mode = getattr(settings, 'MAINTENANCE_MODE', False)
        
        # Admin IPs that can bypass maintenance mode
        admin_ips = getattr(settings, 'MAINTENANCE_BYPASS_IPS', [])
        
        if maintenance_mode and request.META.get('REMOTE_ADDR') not in admin_ips:
            # Return a maintenance mode response
            status = 503  # Service Unavailable
            content = {
                'error': 'Maintenance in progress',
                'message': 'The system is currently undergoing scheduled maintenance. '
                          'Please try again later.'
            }
            return JsonResponse(content, status=status)
        
        response = self.get_response(request)
        return response

class JWTHeadersMiddleware:
    """
    Middleware to handle JWT authentication headers for API requests.
    Particularly useful for handling Authorization header from various clients.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Handle the Authorization header for JWT tokens
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        # If no Authorization header but token in query params, add it to the headers
        if not auth_header and request.GET.get('token'):
            token = request.GET.get('token')
            request.META['HTTP_AUTHORIZATION'] = f"Bearer {token}"
            
        # Process the request
        response = self.get_response(request)
        return response

class CORSMiddleware(MiddlewareMixin):
    """
    Custom CORS middleware with more granular control.
    This can be used if django-cors-headers doesn't meet your needs.
    """
    
    def process_response(self, request, response):
        # Add CORS headers for API requests
        if request.path.startswith('/api/'):
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response["Access-Control-Allow-Credentials"] = "true"
            
        return response
