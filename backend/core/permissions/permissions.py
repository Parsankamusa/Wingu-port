from rest_framework import permissions


class IsEmailVerified(permissions.BasePermission):
    """
    Allow access only to users with verified email.
    """
    message = "Email verification is required for this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_email_verified


class IsProfessional(permissions.BasePermission):
    """
    Allow access only to professional users.
    """
    message = "Only professional users can access this resource."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'professional'


class IsRecruiter(permissions.BasePermission):
    """
    Allow access only to recruiter users.
    """
    message = "Only recruiter users can access this resource."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'recruiter'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allow access only to object owners or admin users.
    """
    message = "You don't have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        # Check if user is admin
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check if user is owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False
