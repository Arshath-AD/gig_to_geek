"""
GigToGeek — Database Seeds
===========================
Creates an initial superuser account and sample data so the dev
environment is immediately usable after running migrations.

Usage (from the `backend/` directory):
    python seeds.py

Environment variables are loaded from ../.env (project root).
"""

import os
import sys
from pathlib import Path

# ── Load .env from project root ─────────────────────────────
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
    print(f"✔  Loaded environment from {env_path}")
except ImportError:
    print("⚠  python-dotenv not installed — relying on shell environment.")

# ── SQLAlchemy / App imports ─────────────────────────────────
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError

from database import Base, engine, SessionLocal
from models.schema import (
    AIInsight,
    GoalStatus,
    SavingsGoal,
    Transaction,
    TransactionType,
    User,
)

# ── Helpers ──────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _hash(plain: str) -> str:
    return pwd_context.hash(plain)


# ── Seed Configuration ───────────────────────────────────────

SUPERUSER = {
    "email":                  "admin@gigtogeek.dev",
    "full_name":              "GigToGeek Admin",
    "password":               "Admin@1234",       # change after first login!
    "occupation":             "Platform Administrator",
    "monthly_income_estimate": 0.0,
    "is_active":              True,
    "is_verified":            True,
    "is_superuser":           True,
}

DEMO_USER = {
    "email":                  "demo@gigtogeek.dev",
    "full_name":              "Demo Gig Worker",
    "password":               "Demo@1234",
    "occupation":             "Freelancer",
    "monthly_income_estimate": 45000.0,
    "is_active":              True,
    "is_verified":            True,
    "is_superuser":           False,
}


# ── Seed Functions ───────────────────────────────────────────

def seed_users(db) -> dict[str, User]:
    """Create superuser + demo user. Returns {email: User}."""
    created: dict[str, User] = {}

    for spec in [SUPERUSER, DEMO_USER]:
        existing = db.query(User).filter(User.email == spec["email"]).first()
        if existing:
            print(f"  ↩  User already exists: {spec['email']}")
            created[spec["email"]] = existing
            continue

        user = User(
            email=spec["email"],
            full_name=spec["full_name"],
            hashed_password=_hash(spec["password"]),
            occupation=spec["occupation"],
            monthly_income_estimate=spec["monthly_income_estimate"],
            is_active=spec["is_active"],
            is_verified=spec["is_verified"],
            is_superuser=spec["is_superuser"],
        )
        db.add(user)
        db.flush()
        created[spec["email"]] = user
        tag = "⚡ SUPERUSER" if spec["is_superuser"] else "  USER"
        print(f"  ✔  Created [{tag}]  {spec['email']}")

    return created


def seed_savings_goals(db, user: User) -> None:
    """Attach sample savings goals to the demo user."""
    if db.query(SavingsGoal).filter(SavingsGoal.user_id == user.id).count():
        print(f"  ↩  Savings goals already exist for {user.email}")
        return

    goals = [
        SavingsGoal(
            user_id=user.id,
            title="Emergency Fund",
            target_amount=100_000,
            current_amount=32_500,
            status=GoalStatus.ACTIVE,
        ),
        SavingsGoal(
            user_id=user.id,
            title="New Laptop",
            target_amount=80_000,
            current_amount=80_000,
            status=GoalStatus.COMPLETED,
        ),
        SavingsGoal(
            user_id=user.id,
            title="Vacation — Goa 2025",
            target_amount=35_000,
            current_amount=8_200,
            status=GoalStatus.PAUSED,
        ),
    ]
    db.bulk_save_objects(goals)
    print(f"  ✔  Created {len(goals)} savings goals for {user.email}")


def seed_transactions(db, user: User) -> None:
    """Attach sample transactions to the demo user."""
    if db.query(Transaction).filter(Transaction.user_id == user.id).count():
        print(f"  ↩  Transactions already exist for {user.email}")
        return

    txns = [
        Transaction(user_id=user.id, transaction_type=TransactionType.INCOME,  amount=15_000, category="Gig Work",    source="Fiverr",   description="Logo design project"),
        Transaction(user_id=user.id, transaction_type=TransactionType.INCOME,  amount=12_500, category="Gig Work",    source="Upwork",   description="React dashboard"),
        Transaction(user_id=user.id, transaction_type=TransactionType.EXPENSE, amount=2_200,  category="Food",        source=None,       description="Zomato orders"),
        Transaction(user_id=user.id, transaction_type=TransactionType.EXPENSE, amount=5_000,  category="Rent",        source=None,       description="Monthly room rent"),
        Transaction(user_id=user.id, transaction_type=TransactionType.SAVINGS, amount=3_000,  category="Emergency Fund", source=None,    description="Monthly contribution"),
    ]
    db.bulk_save_objects(txns)
    print(f"  ✔  Created {len(txns)} transactions for {user.email}")


def seed_ai_insights(db, user: User) -> None:
    """Attach sample AI insights to the demo user."""
    if db.query(AIInsight).filter(AIInsight.user_id == user.id).count():
        print(f"  ↩  AI insights already exist for {user.email}")
        return

    insights = [
        AIInsight(
            user_id=user.id,
            insight_type="nudge",
            title="Great savings streak! 🎉",
            body="You've saved consistently for 3 weeks. Keep it up — at this rate you'll hit your Emergency Fund goal 2 months early.",
            confidence_score=0.92,
            is_read=False,
        ),
        AIInsight(
            user_id=user.id,
            insight_type="alert",
            title="Food spend is 18% above average",
            body="Your food delivery spend this month is ₹2,200 vs a ₹1,860 average. Consider cooking at home twice a week to save ~₹700/month.",
            confidence_score=0.85,
            is_read=False,
        ),
        AIInsight(
            user_id=user.id,
            insight_type="nudge",
            title="Micro-save on every Fiverr order",
            body="You received 3 Fiverr orders last month. Automatically saving 5% of each order would have added ₹2,250 to your emergency fund.",
            confidence_score=0.78,
            is_read=True,
        ),
    ]
    db.bulk_save_objects(insights)
    print(f"  ✔  Created {len(insights)} AI insights for {user.email}")


# ── Main ─────────────────────────────────────────────────────

def run():
    print("\n🌱  GigToGeek — Running Seeds\n" + "─" * 44)

    # Create all tables (idempotent)
    print("\n[1/2] Ensuring tables exist…")
    Base.metadata.create_all(bind=engine)
    print("  ✔  Tables ready")

    # Seed data
    print("\n[2/2] Seeding data…")
    db = SessionLocal()
    try:
        users = seed_users(db)
        demo = users.get(DEMO_USER["email"])
        if demo:
            seed_savings_goals(db, demo)
            seed_transactions(db, demo)
            seed_ai_insights(db, demo)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        print(f"\n✗  IntegrityError: {exc.orig}")
        sys.exit(1)
    except Exception as exc:
        db.rollback()
        print(f"\n✗  Unexpected error: {exc}")
        raise
    finally:
        db.close()

    print("\n" + "─" * 44)
    print("✅  Seeds complete!\n")
    print("  Superuser credentials:")
    print(f"    Email    : {SUPERUSER['email']}")
    print(f"    Password : {SUPERUSER['password']}")
    print("\n  Demo user credentials:")
    print(f"    Email    : {DEMO_USER['email']}")
    print(f"    Password : {DEMO_USER['password']}")
    print("\n  ⚠  Change the superuser password after first login!\n")


if __name__ == "__main__":
    run()
