from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'telegram_id', 'first_name', 'last_name', 'is_premium', 'credits', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Telegram Info', {'fields': ('telegram_id', 'photo_url', 'language_code')}),
        ('Subscription', {'fields': ('is_premium', 'credits')}),
    )

admin.site.register(User, CustomUserAdmin)
