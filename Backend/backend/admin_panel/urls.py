from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.admin_login, name='admin_login'),
    path('dashboard/', views.dashboard, name='admin-dashboard'),

    # Doctors
    path('doctors/', views.doctor_list_create, name='doctor-list-create'),
    path('doctors/<int:doctor_id>/', views.doctor_detail, name='doctor-detail'),

    # Patients
    path('patients/', views.patient_list_create, name='patient-list-create'),
    path('patients/<int:patient_id>/', views.patient_detail, name='patient-detail'),

    # Appointments
    path('appointments/', views.appointment_list, name='appointment-list'),

    # Medicines
    path('medicines/', views.medicine_list_create, name='medicine-list-create'),
]
