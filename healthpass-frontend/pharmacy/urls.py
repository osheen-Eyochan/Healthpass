from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_home, name='api_home'),
    path('verify-qr/', views.verify_qr, name='verify_qr'),
    path('update-token/', views.update_token, name='update_token'),
    path('generate-qr/<str:token_number>/', views.generate_qr, name='generate_qr'),
]
