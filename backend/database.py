from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./quizki.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    total_score = Column(Float, default=0.0)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="creator")
    answers = relationship("Answer", back_populates="user")
    quizzes = relationship("Quiz", back_populates="creator")
    quiz_scores = relationship("QuizScore", back_populates="user")  # NEW

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    score = Column(Float, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="questions")
    choices = relationship("Choice", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="question")

class Choice(Base):
    __tablename__ = "choices"

    id = Column(Integer, primary_key=True, index=True)
    choice_text = Column(Text, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"))
    is_correct = Column(Boolean, default=False)

    question = relationship("Question", back_populates="choices")
    answers = relationship("Answer", back_populates="choice")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)  # Make NOT NULL
    choice_id = Column(Integer, ForeignKey("choices.id"), nullable=False)      # Make NOT NULL
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    choice = relationship("Choice", back_populates="answers")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    difficulty = Column(String, default="medium")
    time_limit = Column(Integer, default=15)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="quizzes")
    questions = relationship("Question", secondary="quiz_questions")
    quiz_scores = relationship("QuizScore", back_populates="quiz")  # NEW

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)

# NEW: Separate table for quiz completion scores
class QuizScore(Base):
    __tablename__ = "quiz_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="quiz_scores")
    quiz = relationship("Quiz", back_populates="quiz_scores")

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()