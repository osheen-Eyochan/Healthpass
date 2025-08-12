from django.db import models

class Appointment(models.Model):
    patient_name = models.CharField(max_length=100, null=True, blank=True)
    doctor_name = models.CharField(max_length=100, null=True, blank=True)
    appointment_date = models.DateTimeField(null=True, blank=True)
    
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')

    def __str__(self):
        return f"{self.patient_name} - {self.doctor_name} - {self.status}"
