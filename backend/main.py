"""
GigToGeek — FastAPI Application Entry Point
Team: Sudo Apt Build
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth, transactions, chat

# ── App Factory ──────────────────────────────────────────────
app = FastAPI(
    title="GigToGeek API",
    description=(
        "AI-driven behavioral micro-savings platform for gig-economy "
        "workers and students with volatile income streams."
    ),
    version="0.1.0",
    contact={
        "name": "Sudo Apt Build",
        "email": "team@sudoaptbuild.dev",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ─────────────────────────────────────────────────────
# Allows the React web app (Vite default: 5173) and the Expo
# Metro bundler / dev server to communicate with this API.
ALLOWED_ORIGINS = [
    # Web App (Vite dev server)
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Expo / React Native Metro bundler
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    # Expo Go client on device/emulator
    "exp://localhost:8081",
    # Additional common ports
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database Initialisation ───────────────────────────────────
@app.on_event("startup")
def on_startup() -> None:
    """Create all tables on startup (development convenience).
    In production, use Alembic migrations instead."""
    Base.metadata.create_all(bind=engine)


# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(
    transactions.router,
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)

app.include_router(
    chat.router,
    prefix="/api/v1",
    tags=["Chat"],
)


# ── Health Check ─────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check() -> dict:
    """Liveness probe — returns platform metadata."""
    return {
        "status": "healthy",
        "application": "GigToGeek",
        "team": "Sudo Apt Build",
        "version": "0.1.0",
        "description": (
            "AI-driven behavioral micro-savings platform "
            "for gig-economy workers and students."
        ),
    }
