from rest_framework import serializers
from .models import Doctor, Appointment

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization']

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)  # nested doctor details

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'appointment_date', 'appointment_time']
