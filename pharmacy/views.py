from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Token, Patient, Medicine

@api_view(['POST'])
def verify_qr(request):
    qr_code = request.data.get('qr_code')
    try:
        token = Token.objects.get(qr_code=qr_code)
        patient = token.patient
        medicine = token.medicine
        if token.is_completed:
            return Response({"success": False, "message": "Token already used"})
        return Response({
            "success": True,
            "patient": {
                "name": patient.name,
                "token": token.id,
                "medicine": medicine.name
            }
        })
    except Token.DoesNotExist:
        return Response({"success": False, "message": "Invalid QR code"})


@api_view(['POST'])
def update_token(request):
    qr_code = request.data.get('qr_code')
    try:
        token = Token.objects.get(qr_code=qr_code)
        token.is_completed = True
        token.save()
        return Response({"success": True, "message": "Token marked as completed"})
    except Token.DoesNotExist:
        return Response({"success": False, "message": "Invalid QR code"})
