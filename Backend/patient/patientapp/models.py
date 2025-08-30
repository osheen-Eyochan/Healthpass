from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return self.user.username

class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    available_days = models.CharField(max_length=100)  # e.g., "Monday, Wednesday, Friday"
    available_time = models.CharField(max_length=50)   # e.g., "10:00 AM - 1:00 PM"

    def __str__(self):
        return self.name

class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    appointment_date = models.DateField()
    appointment_time = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    payment_status = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.patient.user.username} - {self.doctor.name} on {self.appointment_date} at {self.appointment_time}"
