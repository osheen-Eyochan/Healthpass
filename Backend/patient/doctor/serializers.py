from rest_framework import serializers
from receptionist.models import Appointment, Patient
from .models import Consultation, MedicineMaster, Prescription
from datetime import date

# -------------------------
# Medicine Master Serializer
# -------------------------
class MedicineMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineMaster
        fields = ["id", "name", "default_dosage", "default_frequency", "default_duration"]


# -------------------------
# Prescription Serializer
# -------------------------
class PrescriptionSerializer(serializers.ModelSerializer):
    resolved_medicine_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            "id",
            "symptom",
            "medicine",            # ForeignKey to MedicineMaster
            "custom_medicine",
            "resolved_medicine_name",
            "dosage",
            "frequency",
            "duration",
        ]

    def get_resolved_medicine_name(self, obj):
        return obj.medicine.name if obj.medicine else obj.custom_medicine


# -------------------------
# Patient Serializer
# -------------------------
class PatientSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    token = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ["id", "name", "age", "token", "email"]

    def get_age(self, obj):
        if hasattr(obj, "dob") and obj.dob:
            today = date.today()
            return today.year - obj.dob.year - ((today.month, today.day) < (obj.dob.month, obj.dob.day))
        return None

    def get_token(self, obj):
        latest_appt = Appointment.objects.filter(
            patient_id=obj.id,
            status__in=['checked_in', 'scheduled']
        ).order_by('-date', '-time').first()
        return latest_appt.token if latest_appt else None


# -------------------------
# Appointment Serializer
# -------------------------
class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    token = serializers.IntegerField(read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "patient", "date", "time", "status", "token", "doctor_name"]


# -------------------------
# Consultation Serializer
# -------------------------
class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.full_name", read_only=True)
    prescriptions = PrescriptionSerializer(many=True, required=False)
    patient_info = PatientSerializer(source="patient", read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), source="patient", write_only=True
    )

    # Optional follow-up fields
    follow_up = serializers.BooleanField(required=False)
    follow_up_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Consultation
        fields = [
            "id",
            "patient_name",
            "patient_id",   # maps to `patient` ForeignKey
            "doctor",
            "doctor_name",
            "patient_info",
            "notes",
            "created_at",
            "prescriptions",
            "follow_up",
            "follow_up_date",
            "token",
        ]

    def create(self, validated_data):
        prescriptions_data = validated_data.pop("prescriptions", [])
        consultation = Consultation.objects.create(**validated_data)
        for pres_data in prescriptions_data:
            Prescription.objects.create(consultation=consultation, **pres_data)
        return consultation
