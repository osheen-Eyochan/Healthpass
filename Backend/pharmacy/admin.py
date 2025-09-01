from django.contrib import admin
from .models import Patient, Medicine, Prescription, PrescriptionItem, Token

# ===================== Patient Admin =====================
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone_number')
    search_fields = ('name', 'phone_number')


# ===================== Medicine Admin =====================
@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'rate')
    search_fields = ('name',)


# ===================== Prescription Item Inline =====================
class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 1
    readonly_fields = ('total_price_display',)
    fields = ('medicine', 'quantity', 'total_price_display')

    def total_price_display(self, obj):
        if obj.medicine and obj.quantity:
            return obj.medicine.rate * obj.quantity
        return 0
    total_price_display.short_description = "Total Price"


# ===================== Prescription Admin =====================
@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'created_at', 'total_amount_display')
    inlines = [PrescriptionItemInline]
    search_fields = ('patient__name', 'doctor')
    list_filter = ('created_at',)

    def total_amount_display(self, obj):
        return obj.total_amount()
    total_amount_display.short_description = "Total Amount"


# ===================== Token Admin =====================
@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'token_number', 'patient', 'prescription', 'is_completed')
    search_fields = ('token_number', 'patient__name')
    list_filter = ('is_completed',)
