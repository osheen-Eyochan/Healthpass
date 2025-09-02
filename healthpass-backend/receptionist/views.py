from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers
import json
from .models import Receptionist, Appointment
from .serializers import AppointmentSerializer

# -----------------------------
# Receptionist Login
# -----------------------------
@csrf_exempt
def receptionist_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(username=username, password=password)

            if user is not None and isinstance(user, Receptionist):
                return JsonResponse({
                    "success": True,
                    "message": "Login successful",
                    "username": user.username,
                    "full_name": user.full_name,
                    "email": user.email
                })
            else:
                return JsonResponse({"success": False, "error": "Invalid credentials"})

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method"})


# -----------------------------
# Dashboard Stats API
# -----------------------------
class DashboardStatsSerializer(serializers.Serializer):
    totalAppointments = serializers.IntegerField()
    checkedIn = serializers.IntegerField()
    pendingArrivals = serializers.IntegerField()


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
# Appointment Details
# -----------------------------
@api_view(['GET'])
def appointment_details(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        serializer = AppointmentSerializer(appointment)
        return Response({"success": True, "appointment": serializer.data})
    except Appointment.DoesNotExist:
        return Response({"success": False, "message": "Appointment not found"}, status=404)


# -----------------------------
# Check-in Patient
# -----------------------------
@csrf_exempt
@api_view(['POST'])
def checkin_patient(request, appointment_id):
    """
    Mark patient as checked-in.
    """
    appointment = get_object_or_404(Appointment, id=appointment_id)

    if appointment.checked_in:  # use boolean field
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


# -----------------------------
# Extra: Get Appointment by ID (for debugging)
# -----------------------------
@api_view(['GET'])
def get_appointment(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        serializer = AppointmentSerializer(appointment)
        return Response({"success": True, "appointment": serializer.data})
    except Appointment.DoesNotExist:
        return Response({"success": False, "message": "Appointment not found"}, status=404)