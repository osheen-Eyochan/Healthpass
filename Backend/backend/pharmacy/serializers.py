from rest_framework import serializers
from .models import PharmacyUser, PharmacyMedicine
from doctor.models import Prescription

# --------------------------
# Pharmacy User Serializer
# --------------------------
class PharmacyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyUser
        fields = ["id", "username", "full_name", "email"]


# --------------------------
# Pharmacy Medicine Serializer
# --------------------------
class PharmacyMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyMedicine
        fields = ["id", "name", "price"]


# --------------------------
# Prescription Serializer with Price
# --------------------------
class PrescriptionWithPriceSerializer(serializers.ModelSerializer):
    medicine_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            "id",
            "custom_medicine",
            "medicine_name",
            "dosage",
            "frequency",
            "duration",
            "price",
            "symptom",
        ]

    def get_medicine_name(self, obj):
        if obj.medicine_id:
            return obj.medicine.name
        return obj.custom_medicine