from sqlmodel import create_engine, Session
from dotenv import load_dotenv
import os

from models import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine but don't create tables yet
engine = create_engine(DATABASE_URL)
print("Database engine created")

def init_db():
    """Initialize database tables. Call this during app startup."""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        raise

def get_session():
    with Session(engine) as session:
        yield session