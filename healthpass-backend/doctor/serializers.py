
# doctor/serializers.py
from rest_framework import serializers
from receptionist.models import Appointment, Patient
from .models import Consultation


# -------------------------
# Patient Serializer
# -------------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "full_name", "email", "phone"]  # adjust fields if needed


# -------------------------
# Appointment Serializer
# -------------------------
class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer()  # nested serializer

    class Meta:
        model = Appointment
        fields = ["id", "patient", "date", "time", "status"]


# -------------------------
# Consultation Serializer
# -------------------------
class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.full_name", read_only=True)

    class Meta:
        model = Consultation
        fields = [
            "id",
            "patient_name",
            "patient_id",
            "doctor",
            "doctor_name",
            "notes",
            "created_at",
        ]
