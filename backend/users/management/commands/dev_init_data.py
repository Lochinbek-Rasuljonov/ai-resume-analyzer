import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from users.utils import sign_init_data


class Command(BaseCommand):
    help = 'Print signed Telegram initData for opening the frontend outside Telegram during development'

    def add_arguments(self, parser):
        parser.add_argument('--id', type=int, default=1)
        parser.add_argument('--first-name', default='Developer')

    def handle(self, *args, **opts):
        if not settings.TELEGRAM_BOT_TOKEN:
            raise CommandError('Set TELEGRAM_BOT_TOKEN first')
        user = {'id': opts['id'], 'first_name': opts['first_name']}
        self.stdout.write(sign_init_data({'user': user, 'auth_date': int(time.time())}, settings.TELEGRAM_BOT_TOKEN))
