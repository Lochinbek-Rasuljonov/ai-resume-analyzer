import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/resumes/user_<id>/<filename>
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'resumes/user_{instance.user.id}/{filename}'

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to=user_directory_path)
    original_filename = models.CharField(max_length=255)
    extracted_text = models.TextField(blank=True, null=True)
    language = models.CharField(max_length=10, default='uz')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Status tracking for Celery task
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    # True when a credit was taken for this analysis, so it can be given back if the analysis fails
    charged = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.original_filename} ({self.user.username})"

    @property
    def file_extension(self):
        name, extension = os.path.splitext(self.file.name)
        return extension.lower()
