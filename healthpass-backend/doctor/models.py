from django.db import models

class Doctor(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)  # store plain or hashed later
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.full_name} ({self.specialization})"
