# GigToGeek 💸

> **AI-driven behavioral micro-savings platform for gig-economy workers and students**  
> *Team: Sudo Apt Build — Hackathon 2026*

---

## Overview

GigToGeek helps freelancers, delivery drivers, tutors, and students with volatile income streams build sustainable saving habits through:

- **Behavioural Nudges** — AI-generated insights based on spending patterns
- **Income Volatility Tracking** — Automatic detection of irregular income streams
- **Micro-Savings Goals** — Small, achievable saving targets tied to real milestones
- **Cross-Platform** — React web app + React Native mobile app sharing one backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI · SQLAlchemy (async) · Pydantic V2 |
| Database | PostgreSQL (via `postgres:alpine`) |
| Web App | React (Vite) · Tailwind CSS · Recharts |
| Mobile App | React Native (Expo) |
| Infrastructure | Docker · Docker Compose |

---

## Project Structure

```
gig_to_geek/
├── docker-compose.yml
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py            ← FastAPI app, CORS, health check
│   ├── database.py        ← Async engine, session, Base
│   ├── models/
│   │   └── schema.py      ← SQLAlchemy ORM models
│   ├── schemas/
│   │   └── pydantic_models.py ← Request/response schemas
│   ├── routers/
│   │   ├── auth.py        ← Register, login, /me
│   │   └── transactions.py← CRUD for financial events
│   └── services/
│       └── ai_engine.py   ← Behavioural AI analyser
├── web_app/               ← React + Vite (scaffold separately)
└── mobile_app/            ← Expo (scaffold separately)
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- (Optional) Python 3.11+ for local backend dev without Docker

### 1. Clone and configure

```bash
git clone <repo-url> gig_to_geek
cd gig_to_geek
cp .env.example .env        # edit secrets if needed
```

### 2. Start all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| FastAPI (docs) | http://localhost:8000/api/docs |
| Health check | http://localhost:8000/api/health |
| PostgreSQL | localhost:5432 |

### 3. Run backend locally (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Environment Variables

Create a `.env` file in the project root (copied from `.env.example`):

```env
POSTGRES_USER=gigtogeek_user
POSTGRES_PASSWORD=gigtogeek_secret
POSTGRES_DB=gigtogeek_db
SECRET_KEY=change_me_in_production_supersecretkey
ENVIRONMENT=development
```

---

## API Reference

Full interactive docs available at **http://localhost:8000/api/docs** (Swagger UI) and **http://localhost:8000/api/redoc**.

### Key Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness probe |
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Obtain JWT token |
| `GET` | `/api/v1/auth/me` | Current user profile |
| `POST` | `/api/v1/transactions/` | Log transaction |
| `GET` | `/api/v1/transactions/` | List transactions |

---

## Frontend Setup

### Web App (React + Vite)

```bash
cd web_app
npm install
npm run dev        # http://localhost:5173
```

### Mobile App (Expo)

```bash
cd mobile_app
npm install
npx expo start     # Scan QR with Expo Go
```

---

## Roadmap

- [ ] Alembic database migrations
- [ ] AI engine — LLM integration (Gemini / OpenAI)
- [ ] Push notifications for savings nudges
- [ ] Income forecasting model
- [ ] OAuth2 social login (Google)

---

## License

MIT © 2026 Sudo Apt Build
