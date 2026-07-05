# AI Resume Analyzer - Telegram Mini App

A production-ready Telegram Mini App that analyzes resumes (PDF/DOCX) using Google Gemini AI, providing ATS scoring, grammar checks, missing skills analysis, and tailored interview tips.

## Architecture
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Telegram WebApp SDK, React Query.
- **Backend**: Django, Django REST Framework, PostgreSQL, Redis, Celery.
- **AI**: Google GenAI SDK (Gemini 2.5 Flash).
- **Deployment**: Fully containerized using Docker and Docker Compose.

## Prerequisites
- Docker and Docker Compose
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Google Gemini API Key

## Installation & Setup

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd ai_resume_analyzer
   ```

2. **Environment Variables**:
   In `backend/.env`, set your credentials:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_django_secret_key
   DATABASE_URL=postgres://postgres:postgres@db:5432/ai_resume_analyzer
   REDIS_URL=redis://redis:6379/1
   ```

3. **Build and Run with Docker**:
   ```bash
   docker-compose up --build
   ```

   This will spin up:
   - PostgreSQL (`db` on port 5432)
   - Redis (`redis` on port 6379)
   - Django Backend (`backend` on port 8000)
   - Celery Worker (`celery`)
   - React Frontend (`frontend` on port 5173 mapped to port 80 internally via Nginx)

4. **Run Migrations (if not run automatically)**:
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

## Telegram Integration
To use this as a Telegram Mini App:
1. Create a bot using BotFather.
2. Use the `/newapp` command in BotFather to link your bot to a Web App URL.
3. For local testing, use a tunneling service like [ngrok](https://ngrok.com/) to expose port `5173` to the internet via HTTPS, and provide that URL to BotFather.
4. Open the Mini App in Telegram. Authentication happens automatically via `initData` validation!

## API Documentation
The RESTful API is documented via Django REST Framework's browsable API.

**Key Endpoints**:
- `POST /api/users/auth/telegram/` - Authenticate via Telegram WebApp initData.
- `GET /api/users/me/` - Get current user profile.
- `GET /api/resumes/` - List user's uploaded resumes.
- `POST /api/resumes/` - Upload a new resume (multipart/form-data).
- `GET /api/analysis/{resume_id}/` - Fetch the AI analysis results.

## Features
- **Modern Premium UI**: Smooth animations, dark/light mode syncing with Telegram.
- **Background Processing**: Celery handles heavy PDF text extraction and AI API calls.
- **Secure Authentication**: Validates Telegram HMAC-SHA256 signatures and issues JWTs.
- **Comprehensive Analysis**: ATS Score, Missing Skills, Professionalism, etc.
