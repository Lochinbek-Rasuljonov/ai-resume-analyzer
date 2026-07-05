from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import TelegramAuthView, UserMeView

urlpatterns = [
    path('auth/telegram/', TelegramAuthView.as_view(), name='auth_telegram'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='user_me'),
]
