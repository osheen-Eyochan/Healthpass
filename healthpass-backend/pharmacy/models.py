from django.db import models
from django.utils import timezone
from io import BytesIO
from django.core.files import File
import qrcode


class Patient(models.Model):
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.name


from django.db import models

class Medicine(models.Model):
    name = models.CharField(max_length=200)       # Medicine name
    mg = models.CharField(max_length=20)          # Strength (e.g., 500mg)
    days = models.IntegerField(default=1)         # Number of days to take
    rate = models.DecimalField(max_digits=10, decimal_places=2)  # Rate per unit
    frequency = models.CharField(max_length=100, null=True, blank=True)  # e.g., Twice daily
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'medicines'  # Use the existing table name in MySQL

    def __str__(self):
        return self.name


class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.CharField(max_length=100, default="Unknown Doctor")
    created_at = models.DateTimeField(default=timezone.now)

    def total_amount(self):
        # Total amount of all prescription items
        return sum(item.total_price() for item in self.items.all())

    def __str__(self):
        return f"Prescription for {self.patient.name} by {self.doctor} ({self.created_at.date()})"


class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, related_name="items", on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    mg_per_day = models.CharField(max_length=50, blank=True, null=True)  # e.g., "500mg"
    days = models.PositiveIntegerField(default=1)

    def total_price(self):
        return self.medicine.rate * self.quantity

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"


class Token(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    token_number = models.CharField(max_length=50)
    qr_code = models.CharField(max_length=100, null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Save instance first to get ID
        if not self.id:
            super().save(*args, **kwargs)

        # Generate token number if not set
        if not self.token_number or self.token_number == "TEMP_TOKEN":
            self.token_number = f"TOKEN{self.id}"

        # Generate QR code if not already created
        if not self.qr_code:
            qr_data = f"Token: {self.token_number} | Patient: {self.patient.name}"
            qr_img = qrcode.make(qr_data).convert("RGB")
            buffer = BytesIO()
            qr_img.save(buffer, format="PNG")
            file_name = f"token_{self.token_number}.png"
            self.qr_code.save(file_name, File(buffer), save=False)

        super().save(*args, **kwargs)

# ----------------- NEW METHOD -----------------
    def get_medicines(self):
        """
        Returns a list of medicines linked to this token's prescription.
        Each item is a dictionary with name, quantity, and rate.
        """
        if not self.prescription:
            return []

        meds = []
        for item in self.prescription.items.all():
            meds.append({
                "name": item.medicine.name,
                "quantity": item.quantity,
                "price": float(item.medicine.rate),
                "mg_per_day": item.mg_per_day,
                "days": item.days,
                "total": float(item.total_price())
            })
        return meds