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
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    # Use string reference to Doctor to avoid circular import
    doctor = models.ForeignKey('doctor.Doctor', on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='pending')
    checked_in = models.BooleanField(default=False)

    def __str__(self):
        patient_name = self.patient.name if self.patient else "Unknown Patient"
        # Use getattr to safely handle string reference
        doctor_name = getattr(self.doctor, 'full_name', 'Unknown Doctor')
        return f"{patient_name} - {doctor_name} ({self.date} {self.time})"
