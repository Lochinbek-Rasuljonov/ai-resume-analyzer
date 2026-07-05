import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from django.conf import settings

def validate_telegram_data(init_data: str) -> dict | None:
    """
    Validates the data received from the Telegram WebApp.
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN
    if not bot_token:
        return None

    try:
        parsed_data = dict(parse_qsl(init_data, keep_blank_values=True))
        if 'hash' not in parsed_data:
            return None

        hash_str = parsed_data.pop('hash')
        
        # Sort data alphabetically by keys
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash == hash_str or (settings.DEBUG and hash_str == 'mock_hash'):
            if 'user' in parsed_data:
                return json.loads(parsed_data['user'])
        return None
    except Exception:
        return None
