import os
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')  # public HTTPS address of the frontend

if not BOT_TOKEN or not WEBAPP_URL:
    raise SystemExit("Set TELEGRAM_BOT_TOKEN and WEBAPP_URL in backend/.env")

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "Open AI Resume Analyzer 🚀", 
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    
    bot.send_message(
        message.chat.id,
        f"🇺🇿 Assalomu alaykum, {message.from_user.first_name}!\n"
        f"🇰🇰 Assalawma áleykum, {message.from_user.first_name}!\n"
        f"🇷🇺 Здравствуйте, {message.from_user.first_name}!\n"
        f"🇬🇧 Hello, {message.from_user.first_name}!\n\n"
        "AI Resume Analyzer botiga xush kelibsiz! 📄✨\n"
        "Quyidagi tugmani bosib, ilovani oching / Откройте приложение ниже / Click below to open the app",
        reply_markup=markup
    )

@bot.message_handler(commands=['help'])
def send_help(message):
    help_text = (
        "🇺🇿 Ushbu bot orqali siz rezyumengizni AI yordamida tahlil qilib, ATS balingizni bilishingiz va kerakli maslahatlarni olishingiz mumkin. Ilovani ochish uchun tugmani bosing.\n\n"
        "🇰🇰 Bul bot arqalı siz rezyumeńizdi AI járdeminde analiz etip, ATS balıńızdı biliwińiz hám kerekli keńesler alıwıńız múmkin. Qosımshanı ashiw ushin túymeni basıń.\n\n"
        "🇷🇺 С помощью этого бота вы можете проанализировать свое резюме с помощью ИИ, узнать свой балл ATS и получить полезные советы. Нажмите кнопку ниже, чтобы открыть приложение.\n\n"
        "🇬🇧 With this bot, you can analyze your resume using AI, find out your ATS score, and get useful tips. Click the button below to open the app."
    )
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "Open AI Resume Analyzer 🚀", 
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    bot.send_message(message.chat.id, help_text, reply_markup=markup)

print("Telegram Bot is running...")
bot.infinity_polling()
