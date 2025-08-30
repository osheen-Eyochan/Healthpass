from rest_framework import serializers
from django.urls import reverse
from .models import Doctor, Appointment

# -------------------------
# Doctor Serializer
# -------------------------
class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization']

# -------------------------
# Appointment Serializer
# -------------------------
class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)  # nested doctor details
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source='doctor', write_only=True
    )
    qr_code_url = serializers.SerializerMethodField()  # dynamic QR link

    class Meta:
        model = Appointment
        fields = [
            'id',
            'doctor',
            'doctor_id',
            'appointment_date',
            'appointment_time',
            'payment_status',
            'qr_code_url'
        ]

    # Generate QR code URL
    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        return request.build_absolute_uri(
            reverse('appointment-qrcode', args=[obj.id])
        )
