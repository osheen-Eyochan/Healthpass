from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Prescription, PrescriptionItem, Medicine


# ======================= API Home =======================
def api_home(request):
    return JsonResponse({
        "message": "Welcome to Pharmacy API",
        "endpoints": {
            "scan QR": "/api/pharmacy/scan-qr/",
            "calculate total": "/api/pharmacy/calculate-total/"
        }
    })


# ======================= Scan QR =======================
@api_view(["POST"])
def scan_qr(request):
    qr_data = request.data.get("qr_data")

    try:
        # assume qr_data = prescription_id
        prescription = Prescription.objects.get(id=qr_data)
        items = PrescriptionItem.objects.filter(prescription=prescription)

        medicine_list = []
        for item in items:
            medicine_list.append({
                "id": item.medicine.id,
                "name": item.medicine.name,
                "price": float(item.medicine.price),
            })

        return Response({"success": True, "medicines": medicine_list})
    except Prescription.DoesNotExist:
        return Response(
            {"success": False, "message": "Invalid QR Code"},
            status=400
        )


# ======================= Calculate Total =======================
@api_view(["POST"])
def calculate_total(request):
    medicines = request.data.get("medicines", [])  # [{id, mg, days, qty}]

    total = 0
    for med in medicines:
        try:
            medicine = Medicine.objects.get(id=med["id"])
            qty = int(med.get("qty", 1))
            total += float(medicine.price) * qty
        except Medicine.DoesNotExist:
            continue

    return Response({"success": True, "total": total})
