from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Patient  # your Patient model
import qrcode
from django.http import HttpResponse, JsonResponse

# API Home
def api_home(request):
    return JsonResponse({"message": "Welcome to Pharmacy API"})


# Generate QR code for a token
def generate_qr(request, token_number):
    qr_img = qrcode.make(token_number)
    response = HttpResponse(content_type="image/png")
    qr_img.save(response, "PNG")
    return response


# Verify QR dynamically for multiple patients
@api_view(["POST"])
def verify_qr(request):
    qr_data = request.data.get("qr_data", "")
    if not qr_data:
        return Response({"error": "No QR code provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = Patient.objects.get(token_id=qr_data)
        return Response({
            "token_id": patient.token_id,
            "name": patient.name
        })
    except Patient.DoesNotExist:
        return Response({"error": "QR code not recognized"}, status=status.HTTP_404_NOT_FOUND)


# Update token status (optional)
@api_view(["POST"])
def update_token(request):
    token_number = request.data.get("token_number", "")
    new_status = request.data.get("status", "")

    if not token_number:
        return Response({"error": "Token number is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not new_status:
        return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

    # You can update DB here
    return Response({
        "message": "Token updated successfully",
        "token_number": token_number,
        "new_status": new_status
    })
