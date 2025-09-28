from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to HealthPass API")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('patientapp.urls')),
    path("api/doctor/", include("doctor.urls")),  
    path('api/receptionist/', include('receptionist.urls')),
    path('api/pharmacy/', include('pharmacy.urls')),

]
