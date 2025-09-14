from sqlalchemy import create_database_url, Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./study_mentor.db")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    grade = Column(Integer, default=10)
    preferred_subjects = Column(JSON)
    learning_style = Column(String, default="visual")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    study_sessions = relationship("StudySession", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    gamification_profile = relationship("GamificationProfile", back_populates="user", uselist=False)
    team_memberships = relationship("TeamMembership", back_populates="user")

class StudySession(Base):
    __tablename__ = "study_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    topic = Column(String)
    duration_minutes = Column(Integer)
    focus_score = Column(Float)
    engagement_data = Column(JSON)
    notes_uploaded = Column(JSON)
    questions_asked = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="study_sessions")

class Content(Base):
    __tablename__ = "content"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    content_type = Column(String)
    subject = Column(String)
    grade = Column(Integer)
    processed_text = Column(Text)
    embeddings = Column(JSON)
    summary = Column(Text)
    key_concepts = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    grade = Column(Integer)
    topic = Column(String)
    difficulty = Column(String)
    questions = Column(JSON)
    total_points = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    attempts = relationship("QuizAttempt", back_populates="quiz")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    answers = Column(JSON)
    score = Column(Float)
    time_taken_minutes = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")

class GamificationProfile(Base):
    __tablename__ = "gamification_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    badges = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="gamification_profile")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    subject = Column(String)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    max_members = Column(Integer, default=6)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    memberships = relationship("TeamMembership", back_populates="team")
    chat_messages = relationship("TeamChatMessage", back_populates="team")

class TeamMembership(Base):
    __tablename__ = "team_memberships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    role = Column(String, default="member")  # leader, member
    joined_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="team_memberships")
    team = relationship("Team", back_populates="memberships")

class TeamChatMessage(Base):
    __tablename__ = "team_chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    message_type = Column(String, default="text")  # text, file, code, ai_response
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    team = relationship("Team", back_populates="chat_messages")

class EngagementData(Base):
    __tablename__ = "engagement_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("study_sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    attention_score = Column(Float)
    posture_score = Column(Float)
    eye_tracking_data = Column(JSON)
    facial_expression = Column(String)
    distraction_level = Column(Float)
    break_recommended = Column(Boolean, default=False)

class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    current_level = Column(String)
    completed_topics = Column(JSON, default=list)
    recommended_topics = Column(JSON, default=list)
    weak_areas = Column(JSON, default=list)
    strong_areas = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
