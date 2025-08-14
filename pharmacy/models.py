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


class Medicine(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)

    def __str__(self):
        return self.name


class Token(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    token_number = models.CharField(max_length=50, blank=True, default="TEMP_TOKEN")
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # First save to get an ID if new
        if not self.id:
            super().save(*args, **kwargs)

        # Ensure token_number exists
        if not self.token_number or self.token_number == "TEMP_TOKEN":
            self.token_number = f"TOKEN{self.id}"

        # Generate QR code if not already present
        if not self.qr_code:
            qr_data = f"Token: {self.token_number} | Patient: {self.patient.name} | Medicine: {self.medicine.name}"
            qr_img = qrcode.make(qr_data)
            qr_img = qr_img.convert('RGB')  # ensure RGB format

            buffer = BytesIO()
            qr_img.save(buffer, format='PNG')

            file_name = f"token_{self.token_number}.png"
            self.qr_code.save(file_name, File(buffer), save=False)

        # Final save to update token_number and qr_code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.token_number} - {self.patient.name}"
