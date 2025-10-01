from django.urls import path
from .views import (
    PatientRegisterView,
    PatientLoginView,
    DoctorListView,
    BookAppointmentView,
    AppointmentListView,
    AppointmentQRCodeView,
    CreateRazorpayOrderView,
)

urlpatterns = [
    # =========================
    # Patient Authentication
    # =========================
    path("api/patient/register/", PatientRegisterView.as_view(), name="patient-register"),
    path("api/patient/login/", PatientLoginView.as_view(), name="patient-login"),

    # =========================
    # Doctor & Appointments
    # =========================
    path("api/patient/doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("api/patient/book-appointment/", BookAppointmentView.as_view(), name="book-appointment"),
    path("api/patient/appointments/", AppointmentListView.as_view(), name="patient-appointments"),
    path("api/patient/appointments/<int:pk>/qrcode/", AppointmentQRCodeView.as_view(), name="appointment-qrcode"),
    
    # =========================
    # Razorpay Payment
    # =========================
    path("api/patient/create-razorpay-order/", CreateRazorpayOrderView.as_view(), name="create-razorpay-order"),
]
