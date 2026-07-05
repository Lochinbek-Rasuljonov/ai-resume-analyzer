from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    photo_url = models.URLField(max_length=500, blank=True, null=True)
    language_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Subscription tracking for Mini App
    is_premium = models.BooleanField(default=False)
    credits = models.IntegerField(default=3) # Allow 3 free analysis

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username or str(self.telegram_id)
