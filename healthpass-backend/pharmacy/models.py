from django.db import models
from django.utils import timezone
from io import BytesIO
from django.core.files import File
import qrcode

# ------------------ Patient ------------------
class Patient(models.Model):
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.name

# ------------------ Doctor ------------------
class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    available_from = models.TimeField()
    available_to = models.TimeField()

    def __str__(self):
        return f"{self.name} - {self.specialization}"

# ------------------ Medicine ------------------
class Medicine(models.Model):
    name = models.CharField(max_length=200)
    mg = models.CharField(max_length=20)
    days = models.IntegerField(default=1) 
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'medicines'

    def __str__(self):
        return self.name

# ------------------ Prescription ------------------
class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    def total_amount(self):
        return sum(item.total_price() for item in self.items.all())

    def __str__(self):
        return f"Prescription {self.id} for {self.patient.name}"

class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, related_name="items", on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    mg_per_day = models.CharField(max_length=50, blank=True, null=True)
    days = models.PositiveIntegerField(default=1)

    def total_price(self):
        return self.medicine.rate * self.quantity * self.days

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"

# ------------------ Token ------------------
class Token(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    prescription = models.OneToOneField(Prescription, on_delete=models.SET_NULL, null=True, blank=True)
    token_number = models.CharField(max_length=50, unique=True, blank=True)
    qr_code = models.ImageField(upload_to="tokens/", null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    # created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Save first to generate ID
        if not self.id:
            super().save(*args, **kwargs)

        # Generate token_number if blank
        if not self.token_number:
            self.token_number = f"TOKEN{self.id}"

        # Generate QR code if not created
        if not self.qr_code:
            qr_data = f"Token: {self.token_number} | Patient: {self.patient.name}"
            if self.prescription:
                qr_data += f" | Doctor: {self.prescription.doctor.name}"
            qr_img = qrcode.make(qr_data).convert("RGB")
            buffer = BytesIO()
            qr_img.save(buffer, format="PNG")
            file_name = f"token_{self.token_number}.png"
            self.qr_code.save(file_name, File(buffer), save=False)

        super().save(*args, **kwargs)

    def get_medicines(self):
        """Return medicines from linked prescription"""
        if not self.prescription:
            return []

        meds = []
        for item in self.prescription.items.all():
            meds.append({
                "name": item.medicine.name,
                "quantity": item.quantity,
                "rate": float(item.medicine.rate),
                "mg_per_day": item.mg_per_day,
                "days": item.days,
                "total": float(item.total_price())
            })
        return meds

    def __str__(self):
        return f"{self.token_number} - {self.patient.name}"

