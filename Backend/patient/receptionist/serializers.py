# receptionist/serializers.py
from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    patient_name = serializers.CharField(read_only=True)
    token = serializers.IntegerField(read_only=True)
    time = serializers.TimeField(format="%H:%M:%S", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'date',
            'time',
            'status',
            'payment_status',
            'checked_in',
            'doctor_id',
            'doctor_name',
            'specialization',
            'patient_name',
            'token',
        ]
