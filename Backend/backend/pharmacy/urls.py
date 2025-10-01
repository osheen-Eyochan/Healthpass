from django.urls import path
from . import views
from .views import TokenDetailView, get_medicines   # ✅ import function correctly

urlpatterns = [
    path('', views.api_home, name='api_home'),
    path('scan-qr/', views.scan_qr, name='scan_qr'),
    path('calculate-total/', views.calculate_total, name='calculate_total'),
    path('tokens/<str:token_number>/', TokenDetailView.as_view(), name='token-detail'),
    path('medicines/', get_medicines, name='get_medicines'),
]