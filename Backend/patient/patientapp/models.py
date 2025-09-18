from django.db import models
from django.contrib.auth.models import User
from datetime import time

# -------------------------
# Choices
# -------------------------
PAYMENT_STATUS_CHOICES = [
    ('Pending', 'Pending'),
    ('Paid', 'Paid'),
    ('Failed', 'Failed'),
]

# -------------------------
# Patient Model
# -------------------------
class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return self.user.username

# -------------------------
# Doctor Model
# -------------------------
class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    available_days = models.CharField(max_length=100)  # e.g., "Monday, Wednesday, Friday"
    start_time = models.TimeField(default=time(9, 0))   # start of available time
    end_time = models.TimeField(default=time(17, 0))    # end of available time
    max_tokens_per_slot = models.PositiveIntegerField(default=1)  # patients per slot

    def __str__(self):
        return self.name

# -------------------------
# Appointment Model
# -------------------------
# -------------------------
# Appointment Model
# -------------------------
class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(default=time(9, 0))
    token_number = models.PositiveIntegerField(default=1)  # token for patient
    status = models.CharField(
        max_length=20,
        choices=[('Booked', 'Booked'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')],
        default='Booked'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='Pending'
    )
    payment_id = models.CharField(max_length=100, blank=True, null=True)  # <--- add this
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('doctor', 'appointment_date', 'appointment_time', 'token_number')

    def __str__(self):
        return f"{self.patient.user.username} - {self.doctor.name} on {self.appointment_date} at {self.appointment_time} (Token {self.token_number})"
