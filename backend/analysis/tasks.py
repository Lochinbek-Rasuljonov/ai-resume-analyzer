import json
import logging
from celery import shared_task
from google import genai
from google.genai import types
from django.conf import settings
from resumes.models import Resume
from .models import AnalysisResult

logger = logging.getLogger(__name__)

def parse_gemini_json(response_text: str) -> dict:
    try:
        # Sometimes the model wraps JSON in markdown blocks
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        return json.loads(clean_text)
    except json.JSONDecodeError as e:
        logger.error(f"JSON Parsing Error: {e}\nResponse: {response_text}")
        return {}

@shared_task
def analyze_resume_task(resume_id: int):
    try:
        resume = Resume.objects.get(id=resume_id)
        resume.status = Resume.Status.PROCESSING
        resume.save()

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        lang_map = {
            'uz': 'Uzbek',
            'kk': 'Karakalpak',
            'ru': 'Russian',
            'en': 'English'
        }
        ai_lang = lang_map.get(resume.language, 'Uzbek')

        prompt = f"""
        You are an expert HR and ATS software analyzer.
        CRITICAL REQUIREMENT: YOU MUST GENERATE ALL TEXTUAL CONTENT IN THIS JSON IN THE {ai_lang} LANGUAGE.
        DO NOT USE ENGLISH UNLESS IT'S A TECHNICAL TERM. EVERYTHING MUST BE IN {ai_lang}.
        
        Analyze the following resume text and provide a comprehensive evaluation in strictly valid JSON format.
        
        Resume Text:
        {resume.extracted_text}
        
        The JSON must follow this exact structure:
        {{
            "ats_score": (int, 0-100),
            "missing_skills": (list of strings),
            "grammar_score": (int, 0-100),
            "readability_score": (int, 0-100),
            "professionalism_score": (int, 0-100),
            "experience_analysis": (string, detailed evaluation of work experience),
            "education_analysis": (string, detailed evaluation of education),
            "keyword_matching": (dict, e.g., {{"Leadership": "Strong", "Python": "Moderate"}}),
            "suggested_improvements": (list of strings)
        }}
        Do not include any text outside the JSON object.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        analysis_data = parse_gemini_json(response.text)

        if not analysis_data:
            resume.status = Resume.Status.FAILED
            resume.save()
            return

        # Generate Improvements and Extra Docs
        improvement_prompt = f"""
        Based on the previous analysis of this resume, generate the following improvements in strictly valid JSON format.
        CRITICAL REQUIREMENT: YOU MUST GENERATE ALL TEXTUAL CONTENT IN THIS JSON IN THE {ai_lang} LANGUAGE.
        DO NOT USE ENGLISH UNLESS IT'S A TECHNICAL TERM. EVERYTHING MUST BE IN {ai_lang}.
        
        Resume Text: {resume.extracted_text}
        
        JSON Structure:
        {{
            "improved_resume_text": (string, a rewritten, more professional version of the resume text),
            "interview_tips": (list of strings, tailored to the resume's weaknesses and strengths),
            "cover_letter": (string, a generic but highly professional cover letter based on the resume),
            "linkedin_summary": (string, an engaging LinkedIn summary)
        }}
        """
        
        improvement_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=improvement_prompt
        )
        improvement_data = parse_gemini_json(improvement_response.text)

        AnalysisResult.objects.update_or_create(
            resume=resume,
            defaults={
                'ats_score': analysis_data.get('ats_score', 0),
                'missing_skills': analysis_data.get('missing_skills', []),
                'grammar_score': analysis_data.get('grammar_score', 0),
                'readability_score': analysis_data.get('readability_score', 0),
                'professionalism_score': analysis_data.get('professionalism_score', 0),
                'experience_analysis': analysis_data.get('experience_analysis', ''),
                'education_analysis': analysis_data.get('education_analysis', ''),
                'keyword_matching': analysis_data.get('keyword_matching', {}),
                'suggested_improvements': analysis_data.get('suggested_improvements', []),
                'improved_resume_text': improvement_data.get('improved_resume_text', ''),
                'interview_tips': improvement_data.get('interview_tips', []),
                'cover_letter': improvement_data.get('cover_letter', ''),
                'linkedin_summary': improvement_data.get('linkedin_summary', '')
            }
        )

        resume.status = Resume.Status.COMPLETED
        resume.save()

    except Exception as e:
        logger.error(f"Task Failed: {e}")
        try:
            resume = Resume.objects.get(id=resume_id)
            resume.status = Resume.Status.FAILED
            resume.save()
        except:
            pass
