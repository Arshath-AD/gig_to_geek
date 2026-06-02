"""
GigToGeek — Authentication Router

Endpoints:
  POST /api/v1/auth/register  → Create a new user account
  POST /api/v1/auth/login     → Obtain a JWT access token
  GET  /api/v1/auth/me        → Return the current authenticated user
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models.schema import User, Transaction, TransactionType
from schemas.pydantic_models import Token, TokenData, UserCreate, UserRead, UserUpdate, AdminUserRead

router = APIRouter()

# ── Security Primitives ───────────────────────────────────────
SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_in_production_supersecretkey")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Helpers ───────────────────────────────────────────────────

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def _create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exc
        token_data = TokenData(sub=email)
    except JWTError:
        raise credentials_exc

    user = db.query(User).filter(User.email == token_data.sub).first()
    if user is None:
        raise credentials_exc
    return user


# ── Routes ────────────────────────────────────────────────────

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Register a new GigToGeek user."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=_hash_password(payload.password),
        occupation=payload.occupation,
        monthly_income_estimate=payload.monthly_income_estimate,
    )
    db.add(user)
    db.flush()
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    """Authenticate and return a JWT bearer token."""
    # OAuth2PasswordRequestForm uses "username"
    # field, but we treat it as the user's email.
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not _verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = _create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
def get_me(
    current_user: Annotated[User, Depends(_get_current_user)],
) -> User:
    """Return the currently authenticated user's profile."""
    return current_user

@router.post("/me/seed")
def seed_me(
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """Seed the current user's profile with mock transactions for demo purposes."""
    try:
        from models.schema import Transaction, TransactionType
        from datetime import datetime, timedelta
        
        # Delete existing transactions for the user
        db.query(Transaction).filter(Transaction.user_id == current_user.id).delete()
        db.flush()

        now = datetime.now()
        mock_data = [
            {"name": "Swiggy Payout", "category": "Food & Drinks", "amount": 850, "type": "income", "source": "online", "delta_h": 1},
            {"name": "Fuel (HP)", "category": "Fuel", "amount": 300, "type": "expense", "source": "cash", "delta_h": 26},
            {"name": "Freelance Design", "category": "Other", "amount": 4500, "type": "income", "source": "online", "delta_h": 72},
            {"name": "Zomato Dinner", "category": "Food & Drinks", "amount": 620, "type": "expense", "source": "online", "delta_h": 96},
            {"name": "Netflix", "category": "Entertainment", "amount": 499, "type": "expense", "source": "online", "delta_h": 120},
            {"name": "Uber Ride", "category": "Transport", "amount": 180, "type": "expense", "source": "online", "delta_h": 144},
            {"name": "Medical Checkup", "category": "Health", "amount": 750, "type": "expense", "source": "cash", "delta_h": 168},
            {"name": "Electricity Bill", "category": "Bills & Utilities", "amount": 1200, "type": "expense", "source": "online", "delta_h": 192},
            {"name": "Grocery (D-Mart)", "category": "Shopping", "amount": 2340, "type": "expense", "source": "cash", "delta_h": 216},
            {"name": "Ola Payout", "category": "Other", "amount": 3200, "type": "income", "source": "online", "delta_h": 240},
            {"name": "Gym Membership", "category": "Health", "amount": 1500, "type": "expense", "source": "online", "delta_h": 264},
            {"name": "House Rent", "category": "Rent", "amount": 12000, "type": "expense", "source": "online", "delta_h": 288},
            {"name": "Udemy Course", "category": "Education", "amount": 699, "type": "expense", "source": "online", "delta_h": 312},
            {"name": "Coffee (Starbucks)", "category": "Food & Drinks", "amount": 350, "type": "expense", "source": "cash", "delta_h": 336},
            {"name": "Rapido Payout", "category": "Other", "amount": 1800, "type": "income", "source": "online", "delta_h": 360},
            {"name": "New Headphones", "category": "Shopping", "amount": 4999, "type": "expense", "source": "online", "delta_h": 384},
            {"name": "Auto (Local)", "category": "Transport", "amount": 60, "type": "expense", "source": "cash", "delta_h": 408},
            {"name": "Fiverr Payout", "category": "Other", "amount": 6500, "type": "income", "source": "online", "delta_h": 432},
            {"name": "Ola Driver Bonus - Weekend surge bonus", "category": "Bonus", "amount": 500, "type": "income", "source": "online", "delta_h": 2},
            {"name": "Referral — Ravi", "category": "Referral", "amount": 300, "type": "income", "source": "online", "delta_h": 24},
            {"name": "Logo Design (Freelance) - Paid via Razorpay", "category": "Freelance Gig", "amount": 2500, "type": "income", "source": "online", "delta_h": 48},
            {"name": "Swiggy Tip", "category": "Tip", "amount": 50, "type": "income", "source": "cash", "delta_h": 72},
            {"name": "Petty Cash — Office - Reimbursed by manager", "category": "Petty Cash", "amount": 200, "type": "income", "source": "cash", "delta_h": 96},
            {"name": "Amazon Cashback", "category": "Cashback", "amount": 120, "type": "income", "source": "online", "delta_h": 120},
            {"name": "Birthday Gift — Mom", "category": "Gift", "amount": 1000, "type": "income", "source": "cash", "delta_h": 144},
            {"name": "Rapido Performance Pay - Monthly incentive", "category": "Bonus", "amount": 800, "type": "income", "source": "online", "delta_h": 168},
            {"name": "Zepto Tip", "category": "Tip", "amount": 30, "type": "income", "source": "cash", "delta_h": 192},
            {"name": "Content Writing (Fiverr) - 5-star review!", "category": "Freelance Gig", "amount": 1800, "type": "income", "source": "online", "delta_h": 216},
            {"name": "Google Pay Cashback", "category": "Cashback", "amount": 75, "type": "income", "source": "online", "delta_h": 240},
            {"name": "House Rent Share - Flatmate payment", "category": "Rental", "amount": 3000, "type": "income", "source": "online", "delta_h": 264},
        ]

        txns = []
        for d in mock_data:
            tx_type = TransactionType.INCOME if d["type"] == "income" else TransactionType.EXPENSE
            txns.append(
                Transaction(
                    user_id=current_user.id,
                    transaction_type=tx_type,
                    amount=d["amount"],
                    category=d["category"],
                    description=d["name"],
                    source=d["source"],
                    transaction_date=now - timedelta(hours=d["delta_h"])
                )
            )

        db.bulk_save_objects(txns)
        db.commit()
        return {"message": f"Successfully seeded {len(txns)} mock transactions!"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed data: {str(e)}")

@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Update the current user's profile details."""
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    # Mark profile as completed once the user submits it
    current_user.profile_completed = True
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/admin/users", response_model=list[AdminUserRead])
def list_admin_users(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Admin only: List all users with calculated financial metrics."""
    # (Authorization is intentionally skipped for now based on requirements)
    users = db.query(User).offset(skip).limit(limit).all()
    
    admin_users = []
    now = datetime.now(timezone.utc)
    
    for user in users:
        # Calculate logged expenses month-to-date
        mtd_expenses = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.transaction_type == TransactionType.EXPENSE,
            Transaction.transaction_date >= datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        ).all()
        
        total_mtd = sum(t.amount for t in mtd_expenses)
        
        # Calculate fixed expenses total
        total_fixed = 0.0
        if user.constant_expenses:
            total_fixed = sum(float(exp.get('amount', 0.0)) for exp in user.constant_expenses if isinstance(exp, dict))
            
        admin_user_data = AdminUserRead.model_validate(user)
        admin_user_data.logged_expenses_mtd = total_mtd
        admin_user_data.fixed_expenses_total = total_fixed
        
        admin_users.append(admin_user_data)
        
    return admin_users

class AIAccessUpdate(BaseModel):
    has_ai_access: bool

@router.patch("/admin/users/{user_id}/ai-access", response_model=AdminUserRead)
def update_user_ai_access(
    user_id: int,
    payload: AIAccessUpdate,
    db: Annotated[Session, Depends(get_db)]
):
    """Admin only: Grant or revoke AI Assistant access for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.has_ai_access = payload.has_ai_access
    db.commit()
    db.refresh(user)
    
    admin_user_data = AdminUserRead.model_validate(user)
    admin_user_data.logged_expenses_mtd = 0.0
    admin_user_data.fixed_expenses_total = 0.0
    return admin_user_data
