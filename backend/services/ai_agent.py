import os
import requests
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from models.schema import User, Transaction, TransactionType

# Initialize credentials securely from the environment
API_KEY = os.environ.get("COMET_API_KEY", "")
BASE_URL = os.environ.get("COMET_API_BASE_URL", "https://api.cometapi.com/v1") 
MODEL_NAME = os.environ.get("COMET_MODEL", "gpt-4o-mini") 

def get_financial_context(user: User, db: Session) -> str:
    """
    Queries the user's recent transactions, recurring bills, and AI savings 
    metrics to build a factual, accurate financial profile for the AI agent.
    """
    # 1. Fetch the 10 most recent transactions to give the AI context of current cash flow
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user.id
    ).order_by(Transaction.transaction_date.desc()).limit(10).all()
    
    # 2. Extract constant expenses from user model (JSON list)
    constant_expenses = user.constant_expenses or []

    # Compile the fetched data into a structured system profile
    context = f"--- USER {user.full_name} FINANCIAL PROFILE ---\n"
    
    context += f"Target Monthly Savings Goal: ₹{user.monthly_saving_goal or 0}\n"
    context += f"Target Weekly Savings Goal: ₹{user.weekly_saving_goal or 0}\n"
    context += f"Current Saved Balance: ₹{user.current_balance or 0}\n"
    context += f"Total Monthly Income Estimate: ₹{user.total_monthly_income or 0}\n\n"

    context += "Fixed Needs / Constant Expenses:\n"
    if constant_expenses:
        for exp in constant_expenses:
            if isinstance(exp, dict):
                context += f"- {exp.get('name', 'Unknown')}: ₹{exp.get('amount', 0)}\n"
    else:
        context += "- No fixed constant expenses found.\n"

    context += "\nRecent Ledger Transactions:\n"
    if transactions:
        for t in transactions:
            type_str = "Income" if str(t.transaction_type).upper() in ("INCOME", "TransactionType.INCOME") else "Expense"
            context += f"- [{type_str}] ₹{t.amount} in Category: {t.category or 'Other'} on {t.transaction_date.strftime('%Y-%m-%d')}\n"
    else:
        context += "- No transaction history found.\n"
        
    return context


def ask_financial_coach(user: User, user_message: str, db: Session) -> str:
    """
    Combines the user's question with their real-time database context, 
    prepares a standardized payload structure, and sends a POST request 
    directly to the Comet API chat completions gateway.
    """
    if not API_KEY:
        return "System configuration error: COMET_API_KEY environment variable is missing on the backend."

    # Retrieve live context from the database tables
    financial_data_profile = get_financial_context(user, db)

    # Establish the system instructions defining the persona's directives and constraints
    system_instruction = (
        "You are an expert, proactive personal financial coach assistant called 'AI Advisor'. "
        "You are given direct access to the user's live database tracking tables, including their transactions, "
        "constant expenses, and calculated saving goals in Indian Rupees (₹). "
        "Analyze the provided numbers mathematically before giving advice. Be encouraging, realistic, and highly practical. "
        "Keep your advice actionable and avoid generic definitions. Refer to specific upcoming bills or limits if relevant."
    )

    # Combine the data payload with the user's current question
    full_prompt = (
        f"{financial_data_profile}\n"
        f"User Question: '{user_message}'\n"
    )

    # Set up HTTP Authorization headers for the Comet API bearer token
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # Construct the standard completions payload structure
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": full_prompt}
        ],
        "temperature": 0.4
    }

    try:
        # Route the request to the configured Comet API completions gateway
        url = f"{BASE_URL.rstrip('/')}/chat/completions"
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        # Parse output based on response validity
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Failed to reach the AI core. Status Code: {response.status_code}, Error: {response.text}"
            
    except Exception as e:
        return f"Failed to reach the AI analytics core. Exception: {str(e)}"
