"""
GigToGeek — Pydantic V2 Request / Response Models

Mirrors the ORM layer but stays decoupled for clean API contracts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ── Auth / User ───────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    """Payload for POST /auth/register."""

    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    occupation: Optional[str] = Field(None, max_length=120)
    monthly_income_estimate: Optional[float] = Field(None, ge=0)


class UserRead(BaseModel):
    """Public-safe user representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    is_verified: bool
    is_superuser: bool
    occupation: Optional[str]
    monthly_income_estimate: Optional[float]
    current_balance: Optional[float]
    weekly_saving_goal: Optional[float]
    monthly_saving_goal: Optional[float]
    daily_saving_goal: Optional[float]
    profile_completed: bool
    has_ai_access: bool
    occupations: Optional[list] = None
    custom_occupation: Optional[str] = None
    income_per_occupation: Optional[list] = None
    constant_expenses: Optional[list] = None
    total_monthly_income: Optional[float] = None
    created_at: datetime


class AdminUserRead(UserRead):
    """Extended user read schema for admin dashboard including calculated metrics."""
    logged_expenses_mtd: float = 0.0
    fixed_expenses_total: float = 0.0


class UserUpdate(BaseModel):
    """Payload for PATCH /auth/me — all fields optional."""

    occupation: Optional[str] = Field(None, max_length=120)
    occupations: Optional[list] = None
    custom_occupation: Optional[str] = Field(None, max_length=255)
    income_per_occupation: Optional[list] = None
    constant_expenses: Optional[list] = None
    monthly_income_estimate: Optional[float] = Field(None, ge=0)
    total_monthly_income: Optional[float] = Field(None, ge=0)
    current_balance: Optional[float] = Field(None, ge=0)
    weekly_saving_goal: Optional[float] = Field(None, ge=0)
    monthly_saving_goal: Optional[float] = Field(None, ge=0)
    daily_saving_goal: Optional[float] = Field(None, ge=0)


class Token(BaseModel):
    """JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded JWT payload claims."""

    sub: Optional[str] = None   # user email
    user_id: Optional[int] = None


# ── Transactions ──────────────────────────────────────────────

class TransactionCreate(BaseModel):
    """Payload for POST /transactions."""

    transaction_type: str = Field(..., pattern="^(income|expense|savings)$")
    amount: float = Field(..., gt=0)
    category: str = Field(default="Uncategorized", max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    source: Optional[str] = Field(None, max_length=120)
    transaction_date: Optional[datetime] = None


class TransactionRead(BaseModel):
    """Transaction representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    transaction_type: str
    amount: float
    category: str
    description: Optional[str]
    source: Optional[str]
    transaction_date: datetime
    created_at: datetime


# ── Savings Goals ─────────────────────────────────────────────

class SavingsGoalCreate(BaseModel):
    """Payload for POST /savings-goals."""

    title: str = Field(..., min_length=2, max_length=200)
    target_amount: float = Field(..., gt=0)
    deadline: Optional[datetime] = None


class SavingsGoalRead(BaseModel):
    """Savings goal representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime]
    status: str
    created_at: datetime
    updated_at: datetime


# ── AI Insights ───────────────────────────────────────────────

class AIInsightRead(BaseModel):
    """AI-generated insight / nudge returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    insight_type: str
    title: str
    body: str
    confidence_score: Optional[float]
    is_read: bool
    generated_at: datetime
