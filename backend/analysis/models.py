from django.db import models
from resumes.models import Resume

class AnalysisResult(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='analysis')
    ats_score = models.IntegerField(default=0)
    missing_skills = models.JSONField(default=list)
    grammar_score = models.IntegerField(default=0)
    readability_score = models.IntegerField(default=0)
    professionalism_score = models.IntegerField(default=0)
    experience_analysis = models.TextField(blank=True)
    education_analysis = models.TextField(blank=True)
    keyword_matching = models.JSONField(default=dict)
    suggested_improvements = models.JSONField(default=list)
    
    improved_resume_text = models.TextField(blank=True)
    interview_tips = models.JSONField(default=list)
    cover_letter = models.TextField(blank=True)
    linkedin_summary = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.resume}"
