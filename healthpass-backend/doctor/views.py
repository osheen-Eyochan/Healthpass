from django.http import JsonResponse
from django.utils.timezone import now
from receptionist.models import Appointment, Doctor  # adjust path if needed
import json
from datetime import date
from django.views.decorators.csrf import csrf_exempt


# -------------------------
# Doctor Login
# -------------------------
@csrf_exempt
def doctor_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            doctor = Doctor.objects.filter(username=username, password=password).first()

            if doctor:
                return JsonResponse({
                    "success": True,
                    "doctor_id": doctor.id,
                    "username": doctor.username,
                    "full_name": doctor.full_name,
                    "email": doctor.email,
                    "specialization": doctor.specialization,
                    "phone": doctor.phone,
                })
            else:
                return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)


# -------------------------
# Dashboard Stats
# -------------------------
def doctor_dashboard_stats(request, doctor_id):
    try:
        doctor = Doctor.objects.get(id=doctor_id)

        total_today = Appointment.objects.filter(
            doctor=doctor,
            date__exact=date.today()
        ).count()

        checked_in = Appointment.objects.filter(
            doctor=doctor,
            status="checked_in"
        ).count()

        completed = Appointment.objects.filter(
            doctor=doctor,
            status="completed"
        ).count()

        return JsonResponse({
            "success": True,
            "today_appointments": total_today,
            "patients_checked_in": checked_in,
            "completed_consultations": completed,
        })
    except Doctor.DoesNotExist:
        return JsonResponse({"success": False, "message": "Doctor not found"})


# -------------------------
# Upcoming Appointments
# -------------------------
def doctor_upcoming_appointments(request, doctor_id):
    today = now().date()
    appointments = Appointment.objects.filter(
        doctor_id=doctor_id,
        date__gte=today
    ).select_related("patient").order_by("date", "time")

    data = []
    for appt in appointments:
        data.append({
            "id": appt.id,
            "patient_name": appt.patient.name if appt.patient else "Unknown",
            "date": appt.date.strftime("%Y-%m-%d"),
            "time": appt.time.strftime("%H:%M") if appt.time else None,
            "status": appt.status,
        })

    return JsonResponse({"success": True, "appointments": data})
