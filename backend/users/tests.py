import time

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import User
from .utils import sign_init_data

TOKEN = '123456:test-token'


def init_data(user_id=42, first_name='Ali', username=None, auth_date=None, token=TOKEN):
    user = {'id': user_id, 'first_name': first_name}
    if username:
        user['username'] = username
    return sign_init_data({'user': user, 'auth_date': auth_date or int(time.time())}, token)


@override_settings(TELEGRAM_BOT_TOKEN=TOKEN)
class TelegramAuthTests(TestCase):
    url = '/api/users/auth/telegram/'

    def setUp(self):
        self.client = APIClient()

    def login(self, data):
        return self.client.post(self.url, {'initData': data}, format='json')

    def test_valid_init_data_logs_in_and_creates_user(self):
        response = self.login(init_data(username='ali'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertEqual(User.objects.get(telegram_id=42).username, 'ali')

    def test_users_without_username_get_one(self):
        self.assertEqual(self.login(init_data(user_id=1)).status_code, 200)
        self.assertEqual(self.login(init_data(user_id=2)).status_code, 200)
        self.assertEqual(User.objects.get(telegram_id=2).username, 'tg_2')

    def test_mock_hash_is_rejected(self):
        data = init_data().rsplit('hash=', 1)[0] + 'hash=mock_hash'
        self.assertEqual(self.login(data).status_code, 401)

    def test_tampered_user_is_rejected(self):
        data = init_data(user_id=42).replace('42', '43')
        self.assertEqual(self.login(data).status_code, 401)

    def test_data_signed_with_another_bot_is_rejected(self):
        self.assertEqual(self.login(init_data(token='999:other')).status_code, 401)

    def test_old_init_data_is_rejected(self):
        self.assertEqual(self.login(init_data(auth_date=int(time.time()) - 2 * 24 * 3600)).status_code, 401)

    def test_me_needs_a_token(self):
        self.assertEqual(self.client.get('/api/users/me/').status_code, 401)
