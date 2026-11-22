import json
from types import SimpleNamespace
from unittest import mock

from django.test import TestCase, override_settings

from resumes.models import Resume
from users.models import User

from .models import AnalysisResult
from .tasks import analyze_resume_task

ANALYSIS = {
    'ats_score': 82, 'grammar_score': 140, 'readability_score': 'n/a', 'professionalism_score': 70,
    'missing_skills': ['Docker'], 'experience_analysis': 'Good', 'education_analysis': 'Fine',
    'keyword_matching': {'Python': 'Strong'}, 'suggested_improvements': ['Add numbers'],
}
DOCUMENTS = {'improved_resume_text': 'Better', 'interview_tips': ['Practise'], 'cover_letter': 'Dear', 'linkedin_summary': 'About'}


def fake_client(*answers):
    replies = iter(answers)
    generate = mock.Mock(side_effect=lambda **kw: SimpleNamespace(text=next(replies)))
    return mock.Mock(models=SimpleNamespace(generate_content=generate))


@override_settings(GEMINI_API_KEY='test')
class AnalyzeResumeTaskTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='ali', telegram_id=1, credits=2)
        self.resume = Resume.objects.create(user=self.user, original_filename='cv.pdf', file='cv.pdf', extracted_text='Ali, Python developer', charged=True)

    def run_task(self, client):
        with mock.patch('analysis.tasks.genai.Client', return_value=client):
            analyze_resume_task(self.resume.id)
        self.resume.refresh_from_db()
        self.user.refresh_from_db()

    def test_saves_the_analysis(self):
        self.run_task(fake_client(json.dumps(ANALYSIS), json.dumps(DOCUMENTS)))
        self.assertEqual(self.resume.status, Resume.Status.COMPLETED)
        result = AnalysisResult.objects.get(resume=self.resume)
        # Scores are kept between 0 and 100
        self.assertEqual((result.ats_score, result.grammar_score, result.readability_score), (82, 100, 0))
        self.assertEqual(result.cover_letter, 'Dear')
        self.assertEqual(self.user.credits, 2)

    def test_failure_marks_it_failed_and_gives_the_credit_back(self):
        self.run_task(fake_client('this is not json'))
        self.assertEqual(self.resume.status, Resume.Status.FAILED)
        self.assertFalse(self.resume.charged)
        self.assertEqual(self.user.credits, 3)
        self.assertFalse(AnalysisResult.objects.exists())

    @override_settings(GEMINI_API_KEY='')
    def test_missing_api_key_fails_cleanly(self):
        self.run_task(fake_client())
        self.assertEqual(self.resume.status, Resume.Status.FAILED)
        self.assertEqual(self.user.credits, 3)
