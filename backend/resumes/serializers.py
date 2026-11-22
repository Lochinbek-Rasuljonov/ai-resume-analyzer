import os

from django.conf import settings
from rest_framework import serializers

from .models import Resume
from .utils import SUPPORTED_EXTENSIONS


class ResumeSerializer(serializers.ModelSerializer):
    # The dashboard shows each finished resume's ATS score
    analysis = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'original_filename', 'language', 'status', 'uploaded_at', 'analysis']
        read_only_fields = fields

    def get_analysis(self, resume):
        result = getattr(resume, 'analysis', None)
        return {'ats_score': result.ats_score} if result else None


class ResumeUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    language = serializers.ChoiceField(choices=['uz', 'kk', 'ru', 'en'], default='uz')

    def validate_file(self, file):
        if os.path.splitext(file.name)[1].lower() not in SUPPORTED_EXTENSIONS:
            raise serializers.ValidationError('Only PDF and DOCX files are accepted.')
        if file.size > settings.MAX_RESUME_SIZE:
            raise serializers.ValidationError('The file is larger than 10 MB.')
        return file
