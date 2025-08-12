from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import PharmacyToken

def get_token_details(request, token_id):
    token = get_object_or_404(PharmacyToken, token_id=token_id)
    data = {
        "token_id": token.token_id,
        "patient_name": token.patient_name,
        "medicines": token.medicines,
        "payment_verified": token.payment_verified,
        "dispensed": token.dispensed
    }
    return JsonResponse(data)
