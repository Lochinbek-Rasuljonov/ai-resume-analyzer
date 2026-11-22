import tempfile
from unittest import mock

import docx
import pymupdf
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from users.models import User

from .models import Resume

MEDIA = tempfile.mkdtemp()


def pdf_bytes(text='Ali Valiyev\nPython developer'):
    doc = pymupdf.open()
    doc.new_page().insert_text((72, 72), text)
    return doc.tobytes()


def docx_bytes(text='Ali Valiyev, Python developer'):
    import io

    document = docx.Document()
    document.add_paragraph(text)
    out = io.BytesIO()
    document.save(out)
    return out.getvalue()


@override_settings(MEDIA_ROOT=MEDIA)
@mock.patch('resumes.views.analyze_resume_task.delay')
class ResumeUploadTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='ali', telegram_id=1, credits=2)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def upload(self, name, data, **extra):
        return self.client.post('/api/resumes/', {'file': SimpleUploadedFile(name, data), **extra}, format='multipart')

    def test_pdf_upload_takes_a_credit_and_starts_the_analysis(self, delay):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.upload('cv.pdf', pdf_bytes(), language='en')
        self.assertEqual(response.status_code, 201, response.data)
        resume = Resume.objects.get()
        self.assertIn('Python developer', resume.extracted_text)
        self.assertEqual((resume.language, resume.charged), ('en', True))
        self.user.refresh_from_db()
        self.assertEqual(self.user.credits, 1)
        delay.assert_called_once_with(resume.id)

    def test_docx_upload(self, delay):
        self.assertEqual(self.upload('cv.docx', docx_bytes()).status_code, 201)

    def test_other_file_types_are_refused_and_nothing_is_saved(self, delay):
        response = self.upload('virus.exe', b'MZ...')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Resume.objects.exists())

    def test_unreadable_pdf_costs_nothing(self, delay):
        self.assertEqual(self.upload('cv.pdf', b'not really a pdf').status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.credits, 2)
        self.assertFalse(Resume.objects.exists())

    @override_settings(MAX_RESUME_SIZE=10)
    def test_large_files_are_refused(self, delay):
        self.assertEqual(self.upload('cv.pdf', pdf_bytes()).status_code, 400)

    def test_no_credits_left(self, delay):
        User.objects.filter(pk=self.user.pk).update(credits=0)
        self.assertEqual(self.upload('cv.pdf', pdf_bytes()).status_code, 403)
        delay.assert_not_called()

    def test_premium_users_are_not_charged(self, delay):
        User.objects.filter(pk=self.user.pk).update(credits=0, is_premium=True)
        self.user.refresh_from_db()
        self.client.force_authenticate(self.user)
        self.assertEqual(self.upload('cv.pdf', pdf_bytes()).status_code, 201)
        self.assertFalse(Resume.objects.get().charged)

    def test_list_includes_the_ats_score(self, delay):
        from analysis.models import AnalysisResult

        resume = Resume.objects.create(user=self.user, original_filename='cv.pdf', file='cv.pdf', status='COMPLETED')
        AnalysisResult.objects.create(resume=resume, ats_score=77)
        Resume.objects.create(user=self.user, original_filename='new.pdf', file='new.pdf')
        scores = {r['original_filename']: r['analysis'] for r in self.client.get('/api/resumes/').data}
        self.assertEqual(scores, {'cv.pdf': {'ats_score': 77}, 'new.pdf': None})

    def test_users_only_see_their_own_resumes(self, delay):
        other = User.objects.create(username='vali', telegram_id=2)
        theirs = Resume.objects.create(user=other, original_filename='x.pdf', file='x.pdf')
        self.assertEqual(self.client.get('/api/resumes/').data, [])
        self.assertEqual(self.client.get(f'/api/resumes/{theirs.id}/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/analysis/{theirs.id}/').status_code, 404)
