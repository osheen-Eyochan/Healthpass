from django.http import JsonResponse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
import json

from receptionist.models import Appointment  # ✅ only Appointment for now
from .models import Doctor, Consultation
from .serializers import ConsultationSerializer

# DRF imports
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


# -------------------------
# Doctor Login
# -------------------------
@csrf_exempt
def doctor_login(request):
    if request.method == "POST":
        username = None
        password = None

        # Try JSON first
        try:
            data = json.loads(request.body.decode("utf-8"))
            username = data.get("username")
            password = data.get("password")
        except:
            # Fallback: form-data or x-www-form-urlencoded
            username = request.POST.get("username")
            password = request.POST.get("password")

        if not username or not password:
            return JsonResponse({"success": False, "error": "Username and password required"})

        try:
            doctor = Doctor.objects.get(username=username, password=password)
            return JsonResponse({
                "success": True,
                "doctor_id": doctor.id,
                "full_name": doctor.full_name,
                "email": doctor.email,
                "specialization": doctor.specialization,
            })
        except Doctor.DoesNotExist:
            return JsonResponse({"success": False, "error": "Invalid credentials"})
    
    return JsonResponse({"success": False, "error": "Only POST allowed"})


# -------------------------
# Doctor Dashboard Stats
# -------------------------
def doctor_dashboard_stats(request, doctor_id):
    today = now().date()
    start_month = today.replace(day=1)  # beginning of this month

    total_appointments = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month
    ).count()

    patients_checked_in = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month, status="checked_in"
    ).count()

    completed_consultations = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month, status="completed"
    ).count()

    return JsonResponse({
        "success": True,
        "total_appointments": total_appointments,
        "patients_checked_in": patients_checked_in,
        "completed_consultations": completed_consultations,
    })


# -------------------------
# Upcoming Appointments
# -------------------------
def doctor_upcoming_appointments(request, doctor_id):
    today = now().date()

    # Fetch only checked-in future appointments
    appointments = Appointment.objects.filter(
        doctor_id=doctor_id,
        status="checked_in",
        date__gte=today
    ).select_related('patient').order_by("date", "time")

    appt_list = []
    for appt in appointments:
        appt_list.append({
            "id": appt.id,
            "date": appt.date.strftime("%Y-%m-%d") if appt.date else "",
            "time": appt.time.strftime("%H:%M") if appt.time else "",
            "patient_name": appt.patient.full_name if appt.patient else "Unknown Patient",
            "status": appt.status,
        })

    return JsonResponse({"success": True, "appointments": appt_list})

# -------------------------
# List all consultations OR create new consultation
# -------------------------
@api_view(["GET", "POST"])
def consultation_list_create(request):
    if request.method == "GET":
        consultations = Consultation.objects.all().order_by("-created_at")
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ConsultationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Retrieve a single consultation by ID
# -------------------------
@api_view(["GET"])
def consultation_detail(request, consultation_id):
    try:
        consultation = Consultation.objects.get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ConsultationSerializer(consultation)
    return Response(serializer.data)
