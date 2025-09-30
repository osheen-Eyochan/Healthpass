from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# -------------------------
# Receptionist Model
# -------------------------
class ReceptionistManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Receptionist must have a username")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class Receptionist(AbstractBaseUser):
    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    objects = ReceptionistManager()
    USERNAME_FIELD = "username"

    def __str__(self):
        return self.username


# -------------------------
# Patient Model
# -------------------------
class Patient(models.Model):
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    email = models.EmailField(unique=True)
    token = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


# -------------------------
# Appointment Model
# -------------------------
STATUS_CHOICES = [
    ('scheduled', 'Scheduled'),
    ('checked_in', 'Checked-In'),
    ('in_consultation', 'In Consultation'),
    ('completed', 'Completed'),
]

PAYMENT_CHOICES = [
    ('pending', 'Pending'),
    ('paid', 'Paid'),
]

class Appointment(models.Model):
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey('doctor.Doctor', on_delete=models.CASCADE, null=True, blank=True)
    patient_name = models.CharField(max_length=255, blank=True)
    doctor_name = models.CharField(max_length=255, blank=True)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='pending')
    checked_in = models.BooleanField(default=False)
    token = models.PositiveIntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Sync patient_name and doctor_name
        if self.patient:
            self.patient_name = self.patient.name
        if self.doctor:
            self.doctor_name = self.doctor.full_name

        super().save(*args, **kwargs)  # Save first to get ID

        # Reassign tokens for all appointments of this doctor on this date
        if self.doctor and self.date:
            appointments = Appointment.objects.filter(
                doctor=self.doctor,
                date=self.date
            ).order_by('time', 'id')

            for idx, appt in enumerate(appointments, start=1):
                if appt.token != idx:
                    appt.token = idx
                    super(Appointment, appt).save(update_fields=['token'])

    def delete(self, *args, **kwargs):
        doctor = self.doctor
        date = self.date
        super().delete(*args, **kwargs)

        # Reorder tokens after deletion
        if doctor and date:
            appointments = Appointment.objects.filter(
                doctor=doctor,
                date=date
            ).order_by('time', 'id')

            for idx, appt in enumerate(appointments, start=1):
                if appt.token != idx:
                    appt.token = idx
                    super(Appointment, appt).save(update_fields=['token'])

    def __str__(self):
        return f"{self.patient_name or 'Unknown'} with {self.doctor_name or 'Unknown'} on {self.date or 'N/A'} at {self.time or 'N/A'}"
