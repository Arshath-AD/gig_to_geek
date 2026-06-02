import os
import sys
from sqlalchemy import text
from database import engine

def add_column():
    print("Altering users table...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN constant_expenses JSON;"))
            conn.commit()
            print("Successfully added constant_expenses column.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
