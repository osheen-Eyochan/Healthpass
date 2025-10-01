from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from .models import Prescription, PrescriptionItem, Medicine, Token
from .serializers import TokenSerializer
from .serializers import MedicineSerializer
from .models import Medicine

# ===================== API Home =====================
@api_view(["GET"])
def api_home(request):
    return Response({
        "message": "Welcome to Pharmacy API",
        "endpoints": {
            "scan QR": "/api/pharmacy/scan-qr/",
            "calculate total": "/api/pharmacy/calculate-total/",
            "token detail": "/api/tokens/<token_number>/"
        }
    })


# ===================== Scan QR =====================
@api_view(["POST"])
def scan_qr(request):
    qr_data = request.data.get("qr_data")
    try:
        prescription = Prescription.objects.get(id=qr_data)
        items = PrescriptionItem.objects.filter(prescription=prescription)

        medicines = []
        for item in items:
            medicines.append({
                "id": item.medicine.id,
                "name": item.medicine.name,
                "rate": float(item.medicine.rate),
                "quantity": item.quantity
            })
        return Response({
            "success": True,
            "patient": prescription.patient.name,
            "doctor": prescription.doctor,
            "prescription_id": prescription.id,
            "medicines": medicines
        })
    except Prescription.DoesNotExist:
        return Response({"success": False, "message": "Invalid QR Code"}, status=400)


# ===================== Calculate Total =====================
@api_view(["POST"])
def calculate_total(request):
    medicines = request.data.get("medicines", [])  # list of {id, quantity}
    total = 0
    for med in medicines:
        try:
            medicine = Medicine.objects.get(id=med["id"])
            qty = int(med.get("quantity", 1))
            total += float(medicine.rate) * qty
        except Medicine.DoesNotExist:
            continue
    return Response({"success": True, "total": total})


# ===================== Token Detail View =====================
class TokenDetailView(RetrieveAPIView):
    queryset = Token.objects.all()
    serializer_class = TokenSerializer
    lookup_field = 'token_number'

# Add new medicine API
@api_view(["POST"])
def get_medicines(request):
    serializer = MedicineSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success": True, "medicine": serializer.data})
    return Response({"success": False, "errors": serializer.errors}, status=400)

# ===================== Get All Medicines =====================
@api_view(["GET"])
def get_medicines(request):
    medicines = Medicine.objects.all()
    serializer = MedicineSerializer(medicines, many=True)
    return Response(serializer.data)