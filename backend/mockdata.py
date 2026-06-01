import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

from sqlalchemy.exc import IntegrityError
from database import engine, SessionLocal, Base
from models.schema import Transaction, TransactionType, User

def run():
    print("\n🌱 Seeding UI Mock Data to Database")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@gigtogeek.dev").first()
        if not user:
            print("❌ Demo user not found! Run seeds.py first.")
            return

        # Clean existing transactions for the demo user to prevent duplicates
        db.query(Transaction).filter(Transaction.user_id == user.id).delete()
        db.flush()

        now = datetime.now()

        # Merged data from MOCK_TRANSACTIONS and MOCK_INCOMES
        mock_data = [
            # Transactions
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

            # Extra Incomes (with notes embedded in description if applicable)
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
                    user_id=user.id,
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
        print(f"✅ Successfully seeded {len(txns)} mock transactions to the database!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run()
