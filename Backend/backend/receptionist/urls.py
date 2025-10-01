from django.urls import path
from . import views

urlpatterns = [
    # Get appointment details
    path('appointment/<int:appointment_id>/', views.get_appointment, name='get-appointment'),

    # Check-in patient
    path('appointment/<int:appointment_id>/checkin/', views.checkin_patient, name='checkin_patient'),

    # Receptionist login
    path('login/', views.receptionist_login, name='receptionist_login'),

    # Dashboard stats
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),

    path('appointments/', views.all_appointments, name='all_appointments'),

     path('scan/<int:qr_value>/', views.scan_appointment, name='scan_appointment'),

]
