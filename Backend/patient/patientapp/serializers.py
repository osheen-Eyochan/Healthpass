from rest_framework import serializers
from django.urls import reverse
from .models import Doctor, Appointment

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization']

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source="doctor", write_only=True
    )
    payment_id = serializers.CharField(required=False, allow_blank=True)  
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    doctor_specialization = serializers.CharField(source="doctor.specialization", read_only=True)
    status = serializers.CharField(read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id", "doctor_id", "doctor_name", "doctor_specialization",
            "appointment_date", "appointment_time", "payment_status",
            "status", "payment_id", "qr_code_url"
        ]

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return request.build_absolute_uri(
            reverse('appointment-qrcode', args=[obj.id])
        )
