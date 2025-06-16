from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import User, Question, Choice, Answer
from auth import get_password_hash
import schemas

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).order_by(desc(User.total_score)).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_question(db: Session, question_id: int):
    return db.query(Question).filter(Question.id == question_id).first()

def get_questions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Question).offset(skip).limit(limit).all()

def create_question(db: Session, question: schemas.QuestionCreateWithChoices, creator_id: int):
    db_question = Question(
        question_text=question.question_text,
        score=question.score,
        creator_id=creator_id
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Add choices
    for choice in question.choices:
        db_choice = Choice(
            choice_text=choice.choice_text,
            is_correct=choice.is_correct,
            question_id=db_question.id
        )
        db.add(db_choice)
    
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, question_id: int, question: schemas.QuestionCreateWithChoices):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if db_question:
        db_question.question_text = question.question_text
        db_question.score = question.score
        
        # Delete existing choices
        db.query(Choice).filter(Choice.question_id == question_id).delete()
        
        # Add new choices
        for choice in question.choices:
            db_choice = Choice(
                choice_text=choice.choice_text,
                is_correct=choice.is_correct,
                question_id=question_id
            )
            db.add(db_choice)
        
        db.commit()
        db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: int):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if db_question:
        db.delete(db_question)
        db.commit()
    return db_question

def get_choice(db: Session, choice_id: int):
    return db.query(Choice).filter(Choice.id == choice_id).first()

def create_answer(db: Session, answer: schemas.AnswerCreate, user_id: int):
    # Check if user already answered this question
    existing_answer = db.query(Answer).filter(
        Answer.user_id == user_id,
        Answer.question_id == answer.question_id
    ).first()
    
    if existing_answer:
        return None  # User already answered this question
    
    # Get the choice and question
    choice = db.query(Choice).filter(Choice.id == answer.choice_id).first()
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    
    if not choice or not question:
        return None
    
    # Calculate score
    score = question.score if choice.is_correct else 0.0
    
    # Create answer
    db_answer = Answer(
        user_id=user_id,
        question_id=answer.question_id,
        choice_id=answer.choice_id,
        score=score
    )
    db.add(db_answer)
    
    # Update user's total score
    user = db.query(User).filter(User.id == user_id).first()
    user.total_score += score
    
    db.commit()
    db.refresh(db_answer)
    return db_answer

def get_user_answers(db: Session, user_id: int):
    return db.query(Answer).filter(Answer.user_id == user_id).all()
