from rest_framework import serializers
from .models import Medicine, Prescription, PrescriptionItem, Patient, Token

# ---------------- Medicine Serializer ----------------
class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'mg', 'days', 'rate', 'quantity', 'created_at', 'updated_at']

# ---------------- Prescription Item Serializer ----------------
class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    rate = serializers.DecimalField(source='medicine.rate', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medicine_name', 'mg_per_day', 'days', 'quantity', 'rate', 'total_price']

# ---------------- Prescription Serializer ----------------
class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'patient_name', 'doctor', 'created_at', 'items']

# ---------------- Token Serializer ----------------
class TokenSerializer(serializers.ModelSerializer):
    prescription = PrescriptionSerializer(read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)

    class Meta:
        model = Token
        fields = ['id', 'token_number', 'patient', 'patient_name', 'prescription', 'is_completed', 'qr_code']
