from django.urls import path
from . import views
from .views import pharmacy_login, pharmacy_medicine_list

urlpatterns = [
    path("login/", pharmacy_login, name="pharmacy-login"),
    path("medicines/", views.pharmacy_medicine_list, name="pharmacy-medicine-list"),

    path("prescription/<int:consultation_id>/", views.get_prescription_by_consultation, name="get_prescription"),
]
