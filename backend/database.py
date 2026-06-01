"""
GigToGeek — Database Engine & Session Factory (Sync)

Uses psycopg2-binary (already in requirements.txt) via SQLAlchemy's
standard sync engine. Wrapped in FastAPI's run_in_threadpool for
non-blocking request handling.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ── Connection URL ────────────────────────────────────────────
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://gigtogeek_user:gigtogeek_secret@localhost:5432/gigtogeek_db",
)

# ── Sync Engine ───────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("ENVIRONMENT", "development") == "development",
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# ── Session Factory ───────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ── Declarative Base ─────────────────────────────────────────
class Base(DeclarativeBase):
    """Shared base class for all SQLAlchemy ORM models."""
    pass


# ── Dependency ───────────────────────────────────────────────
def get_db():
    """FastAPI dependency that yields a database session per request."""
    db: Session = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
