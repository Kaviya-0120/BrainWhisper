# BrainWhisper (MVP)

BrainWhisper is a full-stack MVP for an AI-powered early-stage dementia pre-screening tool.

## What’s included

- **Auth**: Register + login (JWT)
- **Speech module**: Record in-browser or upload audio; backend stores file + extracts basic features (mock ASR/text features)
- **Cognitive micro-tests**: Simple timed questions (frontend) + backend scoring
- **Mock AI risk pipeline**: Combines speech + cognitive score into **Low / Medium / High** risk with explanation + recommendation
- **History**: Stores and displays previous test sessions

## Project structure

- `backend/`: FastAPI app, SQLite DB, mock analysis pipeline
- `frontend/`: React app (Vite) dashboard UI

## Local dev (recommended)

### Backend

1. Create a virtualenv and install deps:

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend docs at `http://localhost:8000/docs`.

### Frontend

1. Install deps:

```bash
cd frontend
npm install
```

2. Run:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Environment

Backend reads:

- `BRAINWHISPER_JWT_SECRET` (optional; defaults to `dev-secret-change-me`)
- `BRAINWHISPER_DB_URL` (optional; defaults to `sqlite:///./data/brainwhisper.db`)
- `BRAINWHISPER_CORS_ORIGINS` (optional; defaults to `http://localhost:5173`)

## Deployment

See `docker-compose.yml` for a simple containerized setup (SQLite persisted via volume).

