from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import TelegramAuthSerializer, UserSerializer
from .utils import validate_telegram_data

User = get_user_model()

class TelegramAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TelegramAuthSerializer(data=request.data)
        if serializer.is_valid():
            init_data = serializer.validated_data['initData']
            user_data = validate_telegram_data(init_data)
            
            if not user_data:
                return Response({"error": "Invalid Telegram data"}, status=status.HTTP_401_UNAUTHORIZED)
                
            telegram_id = user_data.get('id')
            if not telegram_id:
                return Response({"error": "Missing user ID"}, status=status.HTTP_400_BAD_REQUEST)
                
            user, _ = User.objects.update_or_create(
                telegram_id=telegram_id,
                defaults={
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    # Not every Telegram account has a username, and the field must be unique
                    'username': user_data.get('username') or f"tg_{telegram_id}",
                    'photo_url': user_data.get('photo_url', ''),
                    'language_code': user_data.get('language_code', ''),
                }
            )

            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
