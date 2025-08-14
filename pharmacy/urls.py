from django.urls import path
from . import views

urlpatterns = [
    path('verify/', views.verify_qr, name='verify_qr'),
    path('update-token/', views.update_token, name='update_token'),
]
