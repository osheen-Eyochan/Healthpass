from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Receptionist, Appointment
from .serializers import AppointmentSerializer
from django.contrib.auth import authenticate
import json

# -----------------------------
# Receptionist Login
# -----------------------------
@csrf_exempt
@api_view(['POST'])
def receptionist_login(request):
    """
    POST: { "username": "", "password": "" }
    """
    try:
        data = request.data  # DRF parses JSON automatically
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return Response({"success": False, "error": "Username and password required"}, status=400)

        user = authenticate(username=username, password=password)

        if user is not None and hasattr(user, 'full_name'):
            # Successful login
            return Response({
                "success": True,
                "message": "Login successful",
                "username": user.username,
                "full_name": getattr(user, 'full_name', ''),
                "email": getattr(user, 'email', '')
            })
        else:
            return Response({"success": False, "error": "Invalid credentials"}, status=401)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"success": False, "error": str(e)}, status=500)

# -----------------------------
# Dashboard Stats API
# -----------------------------
@api_view(['GET'])
def dashboard_stats(request):
    total_appointments = Appointment.objects.count()
    checked_in = Appointment.objects.filter(status='checked_in').count()
    pending_arrivals = Appointment.objects.filter(status='scheduled').count()

    data = {
        "totalAppointments": total_appointments,
        "checkedIn": checked_in,
        "pendingArrivals": pending_arrivals,
    }
    return Response(data)

# -----------------------------
# Appointment Details (by ID)
# -----------------------------
@api_view(['GET'])
def get_appointment(request, appointment_id):
    try:
        appointment = get_object_or_404(Appointment, id=appointment_id)
        serializer = AppointmentSerializer(appointment)
        return Response({"success": True, "appointment": serializer.data})
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"success": False, "error": str(e)}, status=500)

# -----------------------------
# Check-in Patient
# -----------------------------
@csrf_exempt
@api_view(['POST'])
def checkin_patient(request, appointment_id=None):
    """
    POST to check-in patient.
    Accepts appointment_id in URL or in POST body (QR code scan)
    """
    try:
        # Get appointment_id from URL or POST body
        if not appointment_id:
            appointment_id = request.data.get("appointment_id")
            if not appointment_id:
                return Response({"success": False, "message": "No appointment ID provided"}, status=400)

        appointment_id = int(str(appointment_id).strip())

        # Fetch appointment
        appointment = get_object_or_404(Appointment, id=appointment_id)

        # Already checked-in?
        if appointment.checked_in:
            return Response({"success": False, "message": "Patient already checked in"})

        # Mark checked-in
        appointment.checked_in = True
        appointment.status = "checked_in"
        appointment.save()

        serializer = AppointmentSerializer(appointment)
        return Response({
            "success": True,
            "message": "Patient checked in successfully",
            "appointment": serializer.data
        })

    except ValueError:
        return Response({"success": False, "message": "Invalid appointment ID"}, status=400)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"success": False, "error": str(e)}, status=500)
