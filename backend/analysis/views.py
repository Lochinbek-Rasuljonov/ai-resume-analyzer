from rest_framework import generics
from .models import AnalysisResult
from .serializers import AnalysisResultSerializer
from resumes.models import Resume
from django.shortcuts import get_object_or_404

class AnalysisResultDetailView(generics.RetrieveAPIView):
    serializer_class = AnalysisResultSerializer
    
    def get_object(self):
        resume_id = self.kwargs['resume_id']
        resume = get_object_or_404(Resume, id=resume_id, user=self.request.user)
        return get_object_or_404(AnalysisResult, resume=resume)
