from rest_framework import serializers
from doctor.models import Doctor, MedicineMaster
from receptionist.models import Patient, Appointment

# -----------------------------
# Doctor Serializer
# -----------------------------
class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'


# -----------------------------
# Patient Serializer
# -----------------------------
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


# -----------------------------
# Appointment Serializer
# -----------------------------
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'


# -----------------------------
# Medicine Serializer
# -----------------------------
class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineMaster
        fields = '__all__'
