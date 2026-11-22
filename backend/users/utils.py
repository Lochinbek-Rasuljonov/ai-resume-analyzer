import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl

from django.conf import settings


def sign_init_data(fields: dict, bot_token: str) -> str:
    """Build initData signed the way Telegram signs it. Used by tests and the dev login command."""
    from urllib.parse import urlencode

    fields = {k: (json.dumps(v) if isinstance(v, dict) else str(v)) for k, v in fields.items()}
    check_string = '\n'.join(f'{k}={v}' for k, v in sorted(fields.items()))
    secret = hmac.new(b'WebAppData', bot_token.encode(), hashlib.sha256).digest()
    fields['hash'] = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode(fields)


def validate_telegram_data(init_data: str) -> dict | None:
    """Check the initData a Telegram Mini App sends and return its user, or None.

    See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN
    if not bot_token:
        return None

    fields = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = fields.pop('hash', '')
    check_string = '\n'.join(f'{k}={v}' for k, v in sorted(fields.items()))
    secret = hmac.new(b'WebAppData', bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_hash, received_hash):
        return None

    # Old initData could have been copied from someone's device, so it expires
    try:
        auth_date = int(fields.get('auth_date', '0'))
    except ValueError:
        return None
    if time.time() - auth_date > settings.TELEGRAM_AUTH_MAX_AGE:
        return None

    try:
        user = json.loads(fields['user'])
    except (KeyError, ValueError):
        return None
    return user if isinstance(user, dict) else None
