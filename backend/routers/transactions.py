"""
GigToGeek — Transactions Router

Endpoints:
  POST   /api/v1/transactions          → Log a new income/expense/savings event
  GET    /api/v1/transactions          → List all transactions for current user
  GET    /api/v1/transactions/{id}     → Fetch a single transaction
  DELETE /api/v1/transactions/{id}     → Delete a transaction
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models.schema import Transaction, User
from routers.auth import _get_current_user
from schemas.pydantic_models import TransactionCreate, TransactionRead

router = APIRouter()


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Transaction:
    """Log a new financial transaction for the authenticated user."""
    transaction = Transaction(
        user_id=current_user.id,
        transaction_type=payload.transaction_type,
        amount=payload.amount,
        category=payload.category,
        description=payload.description,
        source=payload.source,
        transaction_date=payload.transaction_date,
    )
    db.add(transaction)
    db.flush()
    return transaction


@router.get("/", response_model=list[TransactionRead])
def list_transactions(
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
) -> list[Transaction]:
    """Return paginated transactions for the authenticated user."""
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: int,
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Transaction:
    """Fetch a single transaction by ID (must belong to current user)."""
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {transaction_id} not found.",
        )
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete a transaction by ID (must belong to current user)."""
    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {transaction_id} not found.",
        )
    db.delete(transaction)
