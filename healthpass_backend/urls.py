from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Simple root view
def home(request):
    return HttpResponse("Welcome to HealthPass Backend!")

urlpatterns = [
    path('admin/', admin.site.urls),       # Now admin is defined
    path('api/pharmacy/', include('pharmacy.urls')),
    path('', home),                        # Root URL
]
