from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Patient, Doctor, Appointment
from .serializers import DoctorSerializer, AppointmentSerializer


# ========================
# Patient Registration
# ========================
class PatientRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")

        if not username or not password or not email:
            return Response({"error": "All fields are required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(username=username, password=password, email=email)
        token = Token.objects.create(user=user)

        # Create a linked Patient record (empty phone & address for now)
        Patient.objects.create(user=user, phone="", address="")

        return Response({"token": token.key}, status=201)


# ========================
# Patient Login
# ========================
class PatientLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # login doesn't require token

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key})
        return Response({"error": "Invalid credentials"}, status=400)


# ========================
# Doctor List
# ========================
class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]  # require token

    def get(self, request):
        doctors = Doctor.objects.all()
        return Response(DoctorSerializer(doctors, many=True).data)


# ========================
# Book Appointment
# ========================
class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]  # require token

    def post(self, request):
        # Expect: doctor_id, appointment_date (YYYY-MM-DD), appointment_time (HH:MM)
        doctor_id = request.data.get("doctor_id")
        appointment_date = request.data.get("appointment_date")
        appointment_time = request.data.get("appointment_time")

        if not (doctor_id and appointment_date and appointment_time):
            return Response({"error": "doctor_id, appointment_date, appointment_time are required"}, status=400)

        doctor = get_object_or_404(Doctor, pk=doctor_id)

        # Ensure the logged-in user has a Patient record
        patient, _ = Patient.objects.get_or_create(user=request.user, defaults={"phone": "", "address": ""})

        # Check if slot already taken
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).exists():
            return Response({"error": "This slot is already booked."}, status=400)

        appt = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        )

        return Response({
            "message": "Appointment booked successfully!",
            "appointment_id": appt.id
        }, status=201)


# ========================
# List Patient's Appointments
# ========================
class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]  # require token

    def get(self, request):
        patient = get_object_or_404(Patient, user=request.user)
        appointments = Appointment.objects.filter(patient=patient).order_by(
            '-appointment_date', '-appointment_time'
        )
        return Response(AppointmentSerializer(appointments, many=True).data)
