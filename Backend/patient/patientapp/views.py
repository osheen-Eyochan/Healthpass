import razorpay
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from io import BytesIO
import qrcode
import datetime

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

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(username=username, password=password, email=email)
        Patient.objects.create(user=user)  # Create patient profile
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"message": "Patient registered successfully", "token": token.key})

# ========================
# Patient Login
# ========================
class PatientLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "username": user.username})
        return Response({"error": "Invalid credentials"}, status=400)

# ========================
# Doctor List
# ========================
class DoctorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        doctors = Doctor.objects.all()
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)

# ========================
# Book Appointment (auto token assignment)
# ========================
class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        appointment_date_str = request.data.get('appointment_date')
        payment_id = request.data.get('payment_id')

        if not all([doctor_id, appointment_date_str, payment_id]):
            return Response({"error": "Missing required fields: doctor_id, appointment_date, payment_id."}, status=400)

        # Validate doctor
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found."}, status=404)

        # Validate date
        try:
            appointment_date = datetime.datetime.strptime(appointment_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format."}, status=400)

        # Get all booked tokens for this doctor/date
        booked_tokens = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).values_list('token_number', flat=True)

        # Auto-assign next available token
        token_number = 1
        while token_number in booked_tokens:
            token_number += 1

        if token_number > 26:  # Max 26 tokens per day
            return Response({"error": "No available tokens for this doctor on selected date."}, status=400)

        # Calculate appointment time based on token
        all_slots = []
        for h in range(8, 20):
            all_slots.append(f"{h:02}:00")
            all_slots.append(f"{h:02}:30")
        appointment_time = all_slots[token_number - 1]

        try:
            appointment = Appointment.objects.create(
                patient=request.user.patient,
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                token_number=token_number,
                payment_id=payment_id,
                status="Confirmed",
                payment_status="Paid"
            )
            serializer = AppointmentSerializer(appointment, context={'request': request})
            return Response({
                "message": "Appointment booked and paid successfully!",
                "appointment": serializer.data,
                "id": appointment.id,
                "token_number": appointment.token_number,
                "appointment_time": appointment_time
            }, status=201)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"An internal error occurred: {str(e)}"}, status=500)

# ========================
# Appointment List
# ========================
class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.filter(patient=request.user.patient)
        serializer = AppointmentSerializer(appointments, many=True, context={'request': request})
        return Response(serializer.data)

# ========================
# Appointment QR Code
# ========================
class AppointmentQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk, patient=request.user.patient)
        qr_data = {
            "appointment_id": appointment.id,
            "patient_name": appointment.patient.user.username,
            "doctor_name": appointment.doctor.name,
            "specialization": appointment.doctor.specialization,
            "date": str(appointment.appointment_date),
            "time": str(appointment.appointment_time),
            "token": appointment.token_number
        }

        img = qrcode.make(qr_data)
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer, content_type="image/png")

# ========================
# Razorpay Order Creation
# ========================
class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            amount = request.data.get("amount")  # Amount in paise
            order = client.order.create({
                "amount": int(amount),
                "currency": "INR",
                "payment_capture": "1"
            })
            return Response(order)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to create Razorpay order: {str(e)}"}, status=400)
