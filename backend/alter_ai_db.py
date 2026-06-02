import asyncio
from sqlalchemy import text
from database import engine

def run():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS has_ai_access BOOLEAN DEFAULT FALSE;"))
        conn.commit()
    print("Added has_ai_access column to users table.")

if __name__ == "__main__":
    run()
