from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from .models import PharmacyUser
from rest_framework.permissions import IsAuthenticated
from .models import PharmacyMedicine
from doctor.models import Consultation, Prescription
from .serializers import PrescriptionWithPriceSerializer,PharmacyMedicineSerializer




# --------------------------
# Pharmacy Login
# --------------------------
@api_view(["POST"])
@permission_classes([AllowAny])  
def pharmacy_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    try:
        user = PharmacyUser.objects.get(username=username)
        if user.check_password(password):
            return Response({
                "success": True,
                "user": {"username": user.username, "full_name": user.full_name},
                "token": f"TOKEN-{user.id}"
            })
        else:
            return Response({"success": False, "message": "Invalid credentials"}, status=400)
    except PharmacyUser.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pharmacy_medicine_list(request):
    medicines = PharmacyMedicine.objects.all()
    serializer = PharmacyMedicineSerializer(medicines, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_prescription_by_consultation(request, consultation_id):
    """
    Fetch consultation + prescription details for a given consultation_id
    """
    try:
        # Get the consultation
        consultation = Consultation.objects.get(id=consultation_id)

        # Get all prescriptions linked to this consultation
        prescriptions = Prescription.objects.filter(consultation_id=consultation_id)
        if not prescriptions.exists():
            return Response({
                "success": False,
                "message": "No prescriptions found"
            }, status=404)

        # Serialize prescriptions (includes price, dosage, frequency, etc.)
        serializer = PrescriptionWithPriceSerializer(prescriptions, many=True)

        # Build consultation data
        consultation_data = {
            "id": consultation.id,
            "patient_name": consultation.patient_name,  # from table
            "doctor_id": consultation.doctor_id,
            "notes": consultation.notes,
            "created_at": consultation.created_at,
            "token": consultation.token,
        }

        return Response({
            "success": True,
            "consultation": consultation_data,
            "prescriptions": serializer.data,
        })

    except Consultation.DoesNotExist:
        return Response({
            "success": False,
            "message": "Consultation not found"
        }, status=404)