from django.urls import path
from . import views
from .views import generate_qr

urlpatterns = [
    path('', views.api_home, name='api_home'),  # <-- root path added
    path("verify-qr/", views.verify_qr, name="verify_qr"),
    path("update-token/", views.update_token, name="update_token"),
    path('generate_qr/<str:token_number>/', generate_qr, name='generate_qr'),
]
