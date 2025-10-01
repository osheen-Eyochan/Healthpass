from django.contrib import admin
from .models import Patient, Medicine, Prescription, PrescriptionItem, Token
from .models import Doctor
# ===================== Patient Admin =====================
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone_number')
    search_fields = ('name', 'phone_number')


# ===================== Medicine Admin =====================
@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
     # Fields to display in the list view
    list_display = ('id', 'name', 'mg', 'days', 'rate', 'frequency', 'created_at', 'updated_at')
    
    # Fields that can be edited directly from the list view
    list_editable = ('mg', 'days', 'rate', 'frequency')
    
    # Add search functionality
    search_fields = ('name', 'mg', 'frequency')
    
    # Optional: add filtering by creation date
    list_filter = ('created_at', 'updated_at')

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
    list_display = ('id', 'token_number', 'patient', 'is_completed', 'qr_code')
    search_fields = ('token_number', 'patient__name')
    list_filter = ('is_completed',)

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialization", "phone", "email", "available_from", "available_to")
    search_fields = ("name", "specialization")