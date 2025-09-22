"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="WinguPort API",
        default_version='v1',
        description="API documentation for WinguPort recruitment platform",
        terms_of_service="https://www.winguport.com/terms/",
        contact=openapi.Contact(email="support@winguport.com"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    patterns=[
        path('api/v1/auth/', include('apps.urls.auth_urls')),
        path('api/v1/users/', include('apps.urls.users_urls')),
        path('api/v1/', include('apps.urls.job_posting_urls')),
        path('api/v1/', include('apps.urls.job_search_urls')),
        path('api/v1/', include('apps.urls.job_application_urls')),
        
    ],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1 endpoints
    path('api/v1/auth/', include('apps.urls.auth_urls')),
    path('api/v1/users/', include('apps.urls.users_urls')),
    path('api/v1/', include('apps.urls.job_posting_urls')),
    path('api/v1/', include('apps.urls.job_search_urls')),
    path('api/v1/', include('apps.urls.job_application_urls')),

    # Silk profiling URLs 
    path('silk/', include('silk.urls', namespace='silk')),
    
    # Swagger documentation
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
