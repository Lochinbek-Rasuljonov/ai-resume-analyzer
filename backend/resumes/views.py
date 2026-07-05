from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resume
from .serializers import ResumeSerializer, ResumeUploadSerializer
from .utils import extract_text
from analysis.tasks import analyze_resume_task

class ResumeListCreateView(generics.ListCreateAPIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ResumeUploadSerializer
        return ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def create(self, request, *args, **kwargs):
        # Check credits/premium status
        user = request.user
        if not user.is_premium and user.credits <= 0:
            return Response({"error": "Insufficient credits"}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        original_filename = file.name
        language = request.data.get('language', 'uz')
        
        resume = Resume.objects.create(
            user=user,
            file=file,
            original_filename=original_filename,
            language=language
        )
        
        # Extract text
        extracted_text = extract_text(resume.file.path, resume.file_extension)
        if not extracted_text:
            resume.status = Resume.Status.FAILED
            resume.save()
            return Response({"error": "Could not extract text from file"}, status=status.HTTP_400_BAD_REQUEST)
            
        resume.extracted_text = extracted_text
        resume.save()

        # Deduct credit
        if not user.is_premium:
            user.credits -= 1
            user.save()

        # Trigger Celery Task
        analyze_resume_task.delay(resume.id)

        response_serializer = ResumeSerializer(resume)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
