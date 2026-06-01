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

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models.schema import User
from schemas.pydantic_models import Token, TokenData, UserCreate, UserRead, UserUpdate

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
