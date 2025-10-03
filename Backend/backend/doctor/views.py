from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import json
from datetime import date


from .models import Doctor, Consultation, Prescription, MedicineMaster
from .serializers import ConsultationSerializer, PrescriptionSerializer
from receptionist.models import Appointment, Patient


# -------------------------
# Doctor Login
# -------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def doctor_login(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        username = data.get("username")
        password = data.get("password")
    except:
        username = request.POST.get("username")
        password = request.POST.get("password")

    if not username or not password:
        return Response(
            {"success": False, "error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        doctor = Doctor.objects.get(username=username, password=password)
        return Response(
            {
                "success": True,
                "doctor_id": doctor.id,
                "full_name": doctor.full_name,
                "email": doctor.email,
                "specialization": doctor.specialization,
            }
        )
    except Doctor.DoesNotExist:
        return Response(
            {"success": False, "error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


# -------------------------
# List Medicines
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def medicine_list(request):
    medicines = MedicineMaster.objects.all().values(
        "id", "name", "default_dosage", "default_frequency", "default_duration"
    )
    return Response(list(medicines))


# -------------------------
# Patient Detail with History
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def patient_detail(request, patient_id):
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)

    # Latest token for checked-in or scheduled appointments
    latest_appointment = Appointment.objects.filter(
        patient=patient, status__in=["checked_in", "scheduled"]
    ).order_by("-date", "-time").first()

    token = latest_appointment.token if latest_appointment and latest_appointment.token else "-"

    # Consultation history
    consultations = Consultation.objects.filter(patient=patient).order_by("-created_at")
    history = [
        {
            "id": c.id,
            "created_at": c.created_at.strftime("%Y-%m-%d"),
            "notes": c.notes or ""
        }
        for c in consultations
    ]

    return Response({
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "email": patient.email,
        "token": token,
        "history": history
    })


# -------------------------
# Dashboard Stats
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def doctor_dashboard_stats(request, doctor_id):
    today = now().date()
    start_month = today.replace(day=1)

    total_appointments = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month
    ).count()

    patients_checked_in = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month, status="checked_in"
    ).count()

    completed_consultations = Appointment.objects.filter(
        doctor_id=doctor_id, date__gte=start_month, status="completed"
    ).count()

    return Response(
        {
            "success": True,
            "total_appointments": total_appointments,
            "patients_checked_in": patients_checked_in,
            "completed_consultations": completed_consultations,
        }
    )


# -------------------------
# Upcoming Appointments
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def doctor_upcoming_appointments(request, doctor_id):
    today = now().date()
    appointments = (
        Appointment.objects.filter(
            doctor_id=doctor_id, status__in=["checked_in", "scheduled"], date__gte=today
        ).order_by("date", "time")
    )

    appt_list = []
    for appt in appointments:
        appt_list.append(
            {
                "id": appt.id,
                "date": appt.date.strftime("%Y-%m-%d") if appt.date else "",
                "time": appt.time.strftime("%H:%M") if appt.time else "",
                "status": appt.status,
                "patient_name": appt.patient_name,
                "patient_id": appt.patient.id if appt.patient else None,
                "doctor_name": appt.doctor_name,
                "token": appt.token,
            }
        )
    return Response({"success": True, "appointments": appt_list})


# -------------------------
# Consultations List/Create
# -------------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def consultation_list_create(request):
    if request.method == "GET":
        consultations = Consultation.objects.all().order_by("-created_at")
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

    serializer = ConsultationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Consultation Detail
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def consultation_detail(request, consultation_id):
    try:
        consultation = Consultation.objects.get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)

    serializer = ConsultationSerializer(consultation)
    return Response(serializer.data)


# -------------------------
# Add Prescriptions
# -------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def add_prescription(request, consultation_id):
    try:
        consultation = Consultation.objects.get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)

    prescriptions_data = request.data.get("prescriptions", [])
    created_prescriptions = []

    for pres_data in prescriptions_data:
        pres_data["consultation"] = consultation.id
        serializer = PrescriptionSerializer(data=pres_data)
        if serializer.is_valid():
            serializer.save()
            created_prescriptions.append(serializer.data)
        else:
            return Response(serializer.errors, status=400)

    return Response(
        {"success": True, "prescriptions": created_prescriptions}, status=201
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_prescription(request, consultation_id):
    try:
        consultation = Consultation.objects.get(id=consultation_id)
        prescriptions = Prescription.objects.filter(consultation=consultation)
        serializer = PrescriptionSerializer(prescriptions, many=True)

        return Response({
            "success": True,
            "consultation": {
                "id": consultation.id,
                "patient_name": consultation.patient_name,
                "patient_id": consultation.patient.id if consultation.patient else None,
                "doctor_id": consultation.doctor.id,
                "notes": consultation.notes
            },
            "prescriptions": serializer.data
        })
    except Consultation.DoesNotExist:
        return Response({"success": False, "message": "Consultation not found"})