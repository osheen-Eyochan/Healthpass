from django.http import JsonResponse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
import json
from .models import MedicineMaster, Prescription
from .serializers import PatientSerializer

from receptionist.models import Appointment  # receptionist_appointment model
from .models import Doctor, Consultation
from .serializers import ConsultationSerializer
from .serializers import PrescriptionSerializer

# DRF imports
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# -------------------------
# List all medicines
# -------------------------
@api_view(["GET"])
def medicine_list(request):
    medicines = MedicineMaster.objects.all().values(
        "id", "name", "default_dosage", "default_frequency", "default_duration"
    )
    return Response(list(medicines))

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

    # Total appointments for this doctor from start of month
    total_appointments = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month
    ).count()

    # Patients who have checked-in this month
    checked_in_appointments = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month, status="checked_in"
    )
    patients_checked_in = checked_in_appointments.count()

    # Completed consultations this month
    completed_consultations = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month, status="completed"
    ).count()

    # List of patient names who checked in this month
    checked_in_patient_names = list(checked_in_appointments.values_list("patient_name", flat=True))

    return JsonResponse({
        "success": True,
        "total_appointments": total_appointments,
        "patients_checked_in": patients_checked_in,
        "completed_consultations": completed_consultations,
        "checked_in_patient_names": checked_in_patient_names
    })


# -------------------------
# Upcoming Appointments
# -------------------------
def doctor_upcoming_appointments(request, doctor_id):
    today = now().date()

    # Fetch checked-in or scheduled future appointments for this doctor
    appointments = Appointment.objects.filter(
        doctor_id=doctor_id,
        status__in=["checked_in", "scheduled"],
        date__gte=today
    ).order_by("date", "time")

    appt_list = []
    for appt in appointments:
        # Use patient_name and doctor_name directly from table
        appt_list.append({
            "id": appt.id,
            "date": appt.date.strftime("%Y-%m-%d") if appt.date else "",
            "time": appt.time.strftime("%H:%M") if appt.time else "",
            "status": appt.status,
            "payment_status": appt.payment_status,
            "checked_in": bool(appt.checked_in),
            "patient_name": appt.patient_name or "Unknown Patient",
            "doctor_name": appt.doctor_name or "Unknown Doctor",
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

# -------------------------
# Add prescriptions to a consultation
# -------------------------
@api_view(["POST"])
def add_prescription(request, consultation_id):
    try:
        consultation = Consultation.objects.get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=status.HTTP_404_NOT_FOUND)

    prescriptions_data = request.data.get("prescriptions", [])

    created_prescriptions = []
    for pres_data in prescriptions_data:
        pres_data["consultation"] = consultation.id
        serializer = PrescriptionSerializer(data=pres_data)
        if serializer.is_valid():
            serializer.save()
            created_prescriptions.append(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response({"success": True, "prescriptions": created_prescriptions}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
def patient_detail(request, patient_id):
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = PatientSerializer(patient)
    return Response(serializer.data)