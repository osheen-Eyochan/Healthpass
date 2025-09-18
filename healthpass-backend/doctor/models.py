from django.db import models
from django.utils.timezone import now

from django.db import models

class Consultation(models.Model):
    # patient = models.ForeignKey("patient.Patient", on_delete=models.CASCADE)  # ❌ breaks if patient app missing
    patient_name = models.CharField(max_length=200)   # ✅ temp replacement
    patient_id = models.IntegerField(null=True, blank=True)  # optional link if needed
    doctor = models.ForeignKey("doctor.Doctor", on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

# -------------------------
# Existing Doctor model
# -------------------------
class Doctor(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


# -------------------------
# Medicine Master Table
# -------------------------
class MedicineMaster(models.Model):
    name = models.CharField(max_length=200, unique=True)
    default_dosage = models.CharField(max_length=100, blank=True, null=True)
    default_frequency = models.CharField(max_length=100, blank=True, null=True)
    default_duration = models.IntegerField(blank=True, null=True)  # in days
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name



# -------------------------
# Prescription Table
# -------------------------
class Prescription(models.Model):
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="prescriptions")
    symptom = models.CharField(max_length=200, blank=True, null=True)
    medicine = models.ForeignKey(MedicineMaster, on_delete=models.SET_NULL, null=True, blank=True)
    custom_medicine = models.CharField(max_length=200, blank=True, null=True)  # if doctor types manually
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.IntegerField()  # in days
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        med_name = self.medicine.name if self.medicine else self.custom_medicine
        return f"{med_name} ({self.dosage}, {self.frequency} for {self.duration} days)"
