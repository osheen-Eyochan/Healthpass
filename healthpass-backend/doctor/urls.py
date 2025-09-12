from django.urls import path
from . import views

urlpatterns = [
    # Doctor login
    path("login/", views.doctor_login, name="doctor-login"),

    # Dashboard stats
    path("<int:doctor_id>/dashboard-stats/", views.doctor_dashboard_stats, name="doctor-dashboard-stats"),

    # Upcoming appointments
    path("<int:doctor_id>/upcoming-appointments/", views.doctor_upcoming_appointments, name="doctor-upcoming-appointments"),
]
