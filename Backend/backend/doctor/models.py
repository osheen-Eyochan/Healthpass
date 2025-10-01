from django.db import models

# -------------------------
# Doctor Model
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
# Consultation Model
# -------------------------
class Consultation(models.Model):
    patient = models.ForeignKey(
        'receptionist.Patient', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='consultations'
    )
    patient_name = models.CharField(max_length=255, blank=True)
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE,
        related_name='consultations'
    )
    notes = models.TextField(blank=True, null=True)
    token = models.IntegerField(null=True, blank=True)

    # -------------------------
    # NEW: Follow-up fields
    # -------------------------
    follow_up = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Sync patient_name with patient object
        if self.patient:
            self.patient_name = self.patient.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_name or 'Unknown'} - {self.doctor.full_name} ({self.created_at.date()})"


# -------------------------
# Medicine Master Table
# -------------------------
class MedicineMaster(models.Model):
    name = models.CharField(max_length=200, unique=True)
    default_dosage = models.CharField(max_length=100, blank=True, null=True)
    default_frequency = models.CharField(max_length=100, blank=True, null=True)
    default_duration = models.PositiveIntegerField(blank=True, null=True)  # in days
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# -------------------------
# Prescription Table
# -------------------------
class Prescription(models.Model):
    consultation = models.ForeignKey(
        Consultation, 
        on_delete=models.CASCADE, 
        related_name="prescriptions"
    )
    symptom = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        help_text="Symptom or condition this medicine is for"
    )
    medicine = models.ForeignKey(
        MedicineMaster, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Select medicine from master list"
    )
    custom_medicine = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        help_text="If the doctor types a medicine manually"
    )
    dosage = models.CharField(
        max_length=100,
        blank=True,
        help_text="Dosage, e.g., 1 tablet, 5 ml"
    )
    frequency = models.CharField(
        max_length=100,
        blank=True,
        help_text="Frequency, e.g., once a day, twice a day"
    )
    duration = models.PositiveIntegerField(
        default=1,
        help_text="Number of days to take the medicine"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        med_name = self.medicine.name if self.medicine else self.custom_medicine or "Unknown"
        return f"{med_name} ({self.dosage or 'N/A'}, {self.frequency or 'N/A'} for {self.duration} days)"
