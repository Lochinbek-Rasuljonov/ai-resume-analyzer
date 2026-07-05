from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'telegram_id', 'first_name', 'last_name', 'username', 'photo_url', 'language_code', 'is_premium', 'credits']
        read_only_fields = ['id', 'telegram_id', 'is_premium', 'credits']

class TelegramAuthSerializer(serializers.Serializer):
    initData = serializers.CharField(required=True)
