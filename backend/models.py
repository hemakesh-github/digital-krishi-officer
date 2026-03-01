from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, TIMESTAMP, Text, text, Boolean, BigInteger, Float, Index
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid


Base = declarative_base()

class UserOTPReq(BaseModel):
    mobileNo: str
    userType: Optional[str] = None

class UserReq(BaseModel):
    mobileNo: str 
    otp: Optional[str] = None
    userType: Optional[str] = None

class CropData(BaseModel):
    crop: Optional[str] = None
    location: str
    query: str

class ExpertData(BaseModel):
    mobileNo: str
    name: str


class MessageData(BaseModel):
    sessionId: uuid.UUID
    content: str
    role: str

class LocationData(BaseModel):
    lat: float
    lon: float



#Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mobileNo = Column(String(13), unique=True, index=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    role = Column(String(10), server_default="farmer")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (
        # Indexes for expert dashboard performance
        Index('idx_chat_sessions_created_at', 'created_at'),
        Index('idx_chat_sessions_user_escalated', 'user_id', 'escalated'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cropdata = Column(JSONB, nullable=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    # Denormalized field for faster dashboard queries (avoids JOIN with users table)
    farmer_mobile = Column(String(13), nullable=True, index=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    escalated = Column(Boolean, default=False)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(UUID, ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    session = relationship("ChatSession", back_populates="messages")

class Expert(Base):
    __tablename__ = "experts"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(20), nullable=False)
    is_available = Column(Boolean, default=True)

class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    mobileNo = Column(String(13), nullable=False)
    otp_hash = Column(Text, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False, server_default=text("CURRENT_TIMESTAMP + INTERVAL '15 minutes'"))
    is_used = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

class ExpertRequests(Base):
    __tablename__ = "expert_requests"
    __table_args__ = (
        # Composite index for expert dashboard queries (most common filter pattern)
        Index('idx_expert_requests_expert_status', 'expert_id', 'status'),
        Index('idx_expert_requests_created_at', 'created_at'),
    )

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True)
    expert_id = Column(Integer, ForeignKey("experts.user_id", ondelete="CASCADE"), index=True)
    status = Column(String(20), default="pending", index=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
    responded_at = Column(TIMESTAMP, nullable=True)

# Define the CropAdvice model
class CropAdvice(Base):
    __tablename__ = 'crop_advice'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    district = Column(String(255), nullable=False)
    crop = Column(String(255), nullable=False)
    stage = Column(String(255), nullable=False)
    problem_disease = Column(String(255), nullable=False)
    advice = Column(String(500), nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    
    def __repr__(self):
        return f"<CropAdvice(district='{self.district}', crop='{self.crop}', problem_disease='{self.problem_disease}')>"

class Locations(Base):
    __tablename__ = "locations"
    __table_args__ = {'extend_existing': True}

    pincode  = Column(String(6), primary_key=True)
    city     = Column(String(50), primary_key=True)
    district = Column(String(50), nullable=False)
    state    = Column(String(50), nullable=False)
    country  = Column(String(50), nullable=False)


class DiseaseDetection(Base):
    __tablename__ = "disease_detection"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    image = Column(String(255), nullable=False)
    disease = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

