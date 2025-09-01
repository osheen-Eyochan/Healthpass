from django.contrib import admin
from .models import Patient, Medicine, Token


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')  # Removed phone_number
    search_fields = ('name',)


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')  # Removed description
    search_fields = ('name',)


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'medicine', 'qr_code', 'is_completed')
    list_filter = ('is_completed',)
    search_fields = ('patient__name', 'medicine__name')
