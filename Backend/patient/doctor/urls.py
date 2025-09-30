# doctor/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Public
    path("login/", views.doctor_login, name="doctor_login"),
    path("medicines/", views.medicine_list, name="medicine_list"),
    path("patient/<int:patient_id>/", views.patient_detail, name="patient_detail"),

    # Protected (require doctor_id)
    path("<int:doctor_id>/dashboard/", views.doctor_dashboard_stats, name="doctor_dashboard_stats"),
    path("<int:doctor_id>/appointments/", views.doctor_upcoming_appointments, name="doctor_upcoming_appointments"),

    # Consultations
    path("consultations/", views.consultation_list_create, name="consultation_list_create"),
    path("consultations/<int:consultation_id>/", views.consultation_detail, name="consultation_detail"),

    # Prescriptions
    path("consultations/<int:consultation_id>/prescriptions/", views.add_prescription, name="add_prescription"),
]
