from django.urls import path
from .views import (
    PatientRegisterView,
    PatientLoginView,
    DoctorListView,
    BookAppointmentView,
    AppointmentListView  # ✅ Import added
)

urlpatterns = [
    path('api/patient/register/', PatientRegisterView.as_view(), name='patient-register'),
    path('api/patient/login/', PatientLoginView.as_view(), name='patient-login'),
    path('api/patient/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('api/patient/book-appointment/', BookAppointmentView.as_view(), name='book-appointment'),
    path('api/patient/appointments/', AppointmentListView.as_view(), name='patient-appointments'),
]
