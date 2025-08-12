from django.db import models

class PharmacyToken(models.Model):
    token_id = models.CharField(max_length=50, unique=True)
    patient_name = models.CharField(max_length=100)
    medicines = models.TextField()
    payment_verified = models.BooleanField(default=False)
    dispensed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.token_id} - {self.patient_name}"
