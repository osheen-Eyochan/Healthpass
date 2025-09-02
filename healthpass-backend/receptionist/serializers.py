from rest_framework import serializers
from .models import Appointment

class DashboardStatsSerializer(serializers.Serializer):
    totalAppointments = serializers.IntegerField()
    checkedIn = serializers.IntegerField()
    pendingArrivals = serializers.IntegerField()


class AppointmentSerializer(serializers.ModelSerializer):
    # Assuming Appointment has ForeignKey relations to Patient and Doctor models
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    age = serializers.IntegerField(source='patient.age', read_only=True)
    gender = serializers.CharField(source='patient.gender', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    specialization = serializers.CharField(source="doctor.specialization", read_only=True)

    time = serializers.TimeField(format="%H:%M:%S", read_only=True)
    

    class Meta:
        model = Appointment
        fields = '__all__'