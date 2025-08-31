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
from django.http import HttpResponse

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
        patient = Patient.objects.create(user=user)
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
            return Response({"token": token.key})
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
# Book Appointment
# ========================
class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=request.user.patient)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# ========================
# Appointment List
# ========================
class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.filter(patient=request.user.patient)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


# ========================
# Appointment QR Code
# ========================
class AppointmentQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk, patient=request.user.patient)

        # Data you want to show in QR
        qr_data = {
            "appointment_id": appointment.id,
            "patient_name": appointment.patient.user.username,
            "doctor_name": appointment.doctor.name,  # make sure Doctor model has 'name' field
            "date": str(appointment.appointment_date),
            "time": str(appointment.appointment_time)
        }

        img = qrcode.make(qr_data)  # QR will contain JSON with details
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
            amount = request.data.get("amount")  # in rupees
            order = client.order.create({
                "amount": int(amount) ,   
                "currency": "INR",
                "payment_capture": "1"
            })
            return Response(order)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
