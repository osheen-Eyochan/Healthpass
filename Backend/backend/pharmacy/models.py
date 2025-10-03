# pharmacy/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class PharmacyUserManager(BaseUserManager):
    def create_user(self, username, password=None, full_name="", email=None):
        if not username:
            raise ValueError("Users must have a username")
        user = self.model(username=username, full_name=full_name, email=email)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, full_name="", email=None):
        user = self.create_user(username=username, password=password, full_name=full_name, email=email)
        user.is_admin = True
        user.save(using=self._db)
        return user

class PharmacyUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    # override the M2M fields with unique related_name
    groups = models.ManyToManyField(
        "auth.Group",
        blank=True,
        related_name="pharmacy_users"  # unique name
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        blank=True,
        related_name="pharmacy_users_permissions"  # unique name
    )

    objects = PharmacyUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["full_name", "email"]

    def __str__(self):
        return self.username

    @property
    def is_staff(self):
        return self.is_admin
    
    
class PharmacyMedicine(models.Model):
    name = models.CharField(max_length=200, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
   

    def __str__(self):
        return f"{self.name} - ₹{self.price}"