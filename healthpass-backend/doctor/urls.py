from django.urls import path
from . import views

urlpatterns = [
    # Doctor login & dashboard
    path("login/", views.doctor_login, name="doctor_login"),
    path("<int:doctor_id>/dashboard/", views.doctor_dashboard_stats, name="doctor_dashboard_stats"),
    path("<int:doctor_id>/appointments/", views.doctor_upcoming_appointments, name="doctor_upcoming_appointments"),

    # Consultations
    path("consultations/", views.consultation_list_create, name="consultation_list_create"),
    path("consultations/<int:consultation_id>/", views.consultation_detail, name="consultation_detail"),
]
