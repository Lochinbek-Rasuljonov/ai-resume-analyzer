import os

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import F
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from analysis.tasks import analyze_resume_task

from .models import Resume
from .serializers import ResumeSerializer, ResumeUploadSerializer
from .utils import extract_text

User = get_user_model()


class ResumeListCreateView(generics.ListCreateAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        return ResumeUploadSerializer if self.request.method == 'POST' else ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).select_related('analysis').order_by('-uploaded_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        upload = serializer.validated_data['file']
        extension = os.path.splitext(upload.name)[1].lower()

        # Read the text before saving anything, so an unreadable file leaves nothing behind
        text = extract_text(upload.read(), extension)
        if not text:
            return Response({'error': 'Could not read any text from this file'}, status=status.HTTP_400_BAD_REQUEST)
        upload.seek(0)

        user = request.user
        with transaction.atomic():
            charged = False
            if not user.is_premium:
                # One UPDATE that only succeeds while credits remain, so parallel uploads can't overspend
                charged = User.objects.filter(pk=user.pk, credits__gt=0).update(credits=F('credits') - 1) == 1
                if not charged:
                    return Response({'error': 'Insufficient credits'}, status=status.HTTP_403_FORBIDDEN)
            resume = Resume.objects.create(
                user=user,
                file=upload,
                original_filename=upload.name,
                extracted_text=text,
                language=serializer.validated_data['language'],
                charged=charged,
            )
            transaction.on_commit(lambda: analyze_resume_task.delay(resume.id))

        return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        instance.file.delete(save=False)
        instance.delete()
