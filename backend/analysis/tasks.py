import json
import logging

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import F
from google import genai
from google.genai import types

from resumes.models import Resume

from .models import AnalysisResult

logger = logging.getLogger(__name__)

LANGUAGES = {'uz': 'Uzbek', 'kk': 'Karakalpak', 'ru': 'Russian', 'en': 'English'}

ANALYSIS_PROMPT = """You are an HR specialist who knows how Applicant Tracking Systems read resumes.
Write every text value in {language}; keep technical terms as they are.

Evaluate the resume below and answer with one JSON object with these keys:
- "ats_score", "grammar_score", "readability_score", "professionalism_score": integers from 0 to 100
- "missing_skills": list of strings
- "experience_analysis", "education_analysis": strings
- "keyword_matching": object mapping a keyword to "Strong", "Moderate" or "Weak"
- "suggested_improvements": list of strings

Resume:
{text}
"""

DOCUMENTS_PROMPT = """Using the resume below, write in {language} and answer with one JSON object with these keys:
- "improved_resume_text": the resume rewritten to be clearer and more professional, without inventing facts
- "interview_tips": list of strings tailored to this resume
- "cover_letter": a cover letter based on the resume
- "linkedin_summary": a LinkedIn "About" section

Resume:
{text}
"""


def ask_gemini(client, prompt: str) -> dict:
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type='application/json'),
    )
    data = json.loads(response.text)
    if not isinstance(data, dict):
        raise ValueError('Gemini did not return a JSON object')
    return data


def score(value) -> int:
    try:
        return max(0, min(100, int(value)))
    except (TypeError, ValueError):
        return 0


def refund(resume: Resume) -> None:
    if resume.charged:
        get_user_model().objects.filter(pk=resume.user_id).update(credits=F('credits') + 1)
        resume.charged = False


@shared_task
def analyze_resume_task(resume_id: int) -> None:
    resume = Resume.objects.filter(id=resume_id).first()
    if resume is None:
        return
    resume.status = Resume.Status.PROCESSING
    resume.save(update_fields=['status'])

    try:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError('GEMINI_API_KEY is not set')
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        language = LANGUAGES.get(resume.language, 'Uzbek')
        analysis = ask_gemini(client, ANALYSIS_PROMPT.format(language=language, text=resume.extracted_text))
        documents = ask_gemini(client, DOCUMENTS_PROMPT.format(language=language, text=resume.extracted_text))

        AnalysisResult.objects.update_or_create(
            resume=resume,
            defaults={
                'ats_score': score(analysis.get('ats_score')),
                'grammar_score': score(analysis.get('grammar_score')),
                'readability_score': score(analysis.get('readability_score')),
                'professionalism_score': score(analysis.get('professionalism_score')),
                'missing_skills': analysis.get('missing_skills') or [],
                'experience_analysis': analysis.get('experience_analysis') or '',
                'education_analysis': analysis.get('education_analysis') or '',
                'keyword_matching': analysis.get('keyword_matching') or {},
                'suggested_improvements': analysis.get('suggested_improvements') or [],
                'improved_resume_text': documents.get('improved_resume_text') or '',
                'interview_tips': documents.get('interview_tips') or [],
                'cover_letter': documents.get('cover_letter') or '',
                'linkedin_summary': documents.get('linkedin_summary') or '',
            },
        )
        resume.status = Resume.Status.COMPLETED
    except Exception:
        logger.exception('Analysis of resume %s failed', resume_id)
        resume.status = Resume.Status.FAILED
        refund(resume)
    resume.save(update_fields=['status', 'charged'])
