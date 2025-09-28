# doctor/serializers.py
from rest_framework import serializers
from receptionist.models import Appointment, Patient
from .models import Consultation, MedicineMaster, Prescription
from rest_framework.decorators import api_view
from rest_framework.response import Response
# removed: from .serializers import PrescriptionSerializer

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
    medicine_name = serializers.CharField(write_only=True)  # input field
    resolved_medicine_name = serializers.SerializerMethodField(read_only=True)  # output

    class Meta:
        model = Prescription
        fields = [
            "id",
            "symptom",
            "medicine_name",        # doctor provides this
            "resolved_medicine_name",  # response will show actual medicine name
            "dosage",
            "frequency",
            "duration",
        ]

    def get_resolved_medicine_name(self, obj):
        if obj.medicine:
            return obj.medicine.name
        return obj.custom_medicine

    def create(self, validated_data):
        med_name = validated_data.pop("medicine_name", None)
        if med_name:
            try:
                medicine = MedicineMaster.objects.get(name__iexact=med_name)
                validated_data["medicine"] = medicine
            except MedicineMaster.DoesNotExist:
                validated_data["custom_medicine"] = med_name
        return super().create(validated_data)

# -------------------------
# Patient Serializer
# -------------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "full_name", "age", "token", "allergies", "conditions", "email", "phone"]

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
    prescriptions = PrescriptionSerializer(many=True, required=False)

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
            "prescriptions",   # new
        ]

    def create(self, validated_data):
        prescriptions_data = validated_data.pop("prescriptions", [])
        consultation = Consultation.objects.create(**validated_data)
        for pres in prescriptions_data:
            Prescription.objects.create(consultation=consultation, **pres)
        return consultation
    
    # -------------------------
# Add prescriptions to a consultation
# -------------------------
@api_view(["POST"])
def add_prescription(request, consultation_id):
    try:
        consultation = Consultation.objects.get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=status.HTTP_404_NOT_FOUND)

    # Expecting list of prescriptions in request.data
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