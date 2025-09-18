from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    # Only include existing fields from your current database
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    time = serializers.TimeField(format="%H:%M:%S", read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'date', 'time', 'status', 'payment_status', 'checked_in', 'doctor_id', 'doctor_name', 'specialization']
