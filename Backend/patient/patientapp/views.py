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
import datetime # Import datetime module

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
        Patient.objects.create(user=user) # Create Patient profile
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
            return Response({"token": token.key, "username": user.username}) # Return username as well
        return Response({"error": "Invalid credentials"}, status=400)


# ========================
# Doctor List
# ========================
class DoctorListView(APIView):
    permission_classes = [AllowAny] # Changed to AllowAny as per your original code

    def get(self, request):
        doctors = Doctor.objects.all()
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)


# ========================
# Book Appointment (UPDATED)
# ========================
class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Extract data directly from request.data
        doctor_id = request.data.get('doctor_id')
        appointment_date_str = request.data.get('appointment_date')
        appointment_time_str = request.data.get('appointment_time') # Expected HH:MM:SS
        payment_id = request.data.get('payment_id') # Crucial for post-payment booking

        # Basic validation for essential fields
        if not all([doctor_id, appointment_date_str, appointment_time_str, payment_id]):
            return Response({"error": "Missing required fields for booking: doctor_id, appointment_date, appointment_time, or payment_id."}, status=400)

        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found."}, status=404)

        # Convert date and time strings to Python date/time objects
        try:
            appointment_date = datetime.datetime.strptime(appointment_date_str, '%Y-%m-%d').date()
            appointment_time = datetime.datetime.strptime(appointment_time_str, '%H:%M:%S').time()
        except ValueError:
            return Response({"error": "Invalid date or time format. Expected YYYY-MM-DD for date and HH:MM:SS for time."}, status=400)

        # Prevent double booking for the same doctor at the same time and date
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time
        ).exists():
            return Response({"error": "This time slot is already booked. Please choose another."}, status=400)

        # Create the appointment instance
        try:
            appointment = Appointment.objects.create(
                patient=request.user.patient, # Link to the authenticated patient
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                payment_id=payment_id, # Save the Razorpay Payment ID
                status="Confirmed",     # Set status as confirmed after successful payment
                payment_status="Paid"   # Set payment status
            )
            # Use serializer to return a consistent and detailed response
            response_data = AppointmentSerializer(appointment).data
            return Response({
                "message": "Appointment booked and paid successfully!",
                "appointment": response_data,
                "id": appointment.id # Ensure ID is directly accessible for frontend check
            }, status=201)

        except Exception as e:
            # Log the full exception for server-side debugging
            import traceback
            traceback.print_exc() # Prints stack trace to console
            return Response({"error": f"An internal error occurred while creating appointment: {str(e)}"}, status=500)


# ========================
# Appointment List
# ========================
class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter appointments for the authenticated patient
        appointments = Appointment.objects.filter(patient=request.user.patient)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


# ========================
# Appointment QR Code (No change needed)
# ========================
class AppointmentQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk, patient=request.user.patient)

        # Data you want to show in QR
        qr_data = {
            "appointment_id": appointment.id,
            "patient_name": appointment.patient.user.username,
            "doctor_name": appointment.doctor.name,
            "date": str(appointment.appointment_date),
            "time": str(appointment.appointment_time)
        }

        img = qrcode.make(qr_data)
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer, content_type="image/png")


# ========================
# Razorpay Order Creation (No change needed)
# ========================
class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            amount = request.data.get("amount")  # amount in smallest currency unit (paise)
            # Razorpay expects amount in paise, so if frontend sends in rupees, convert it
            # Your frontend is sending `selectedAmount * 100`, which means it's already in paise.
            # So `int(amount)` is correct.
            order = client.order.create({
                "amount": int(amount),
                "currency": "INR",
                "payment_capture": "1"  # Auto-capture the payment
            })
            return Response(order)
        except Exception as e:
            # Log the exception for server-side debugging
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to create Razorpay order: {str(e)}"}, status=400)