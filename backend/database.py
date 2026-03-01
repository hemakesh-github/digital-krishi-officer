from sqlmodel import create_engine, Session
from dotenv import load_dotenv
import os

from models import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
print("Database engine created")

def init_db():
    Base.metadata.create_all(engine)
    print("Database tables created successfully")

def get_session():
    with Session(engine) as session:
        yield session