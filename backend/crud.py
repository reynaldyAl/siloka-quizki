from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import User, Question, Choice, Answer, Quiz, QuizQuestion
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
    # Get all answers for the user
    answers = db.query(Answer).filter(Answer.user_id == user_id).all()
    
    # Transform to dictionaries with validated fields
    result = []
    for answer in answers:
        # Skip any answers with NULL values in required fields
        if answer.question_id is None or answer.choice_id is None:
            continue
            
        answer_dict = {
            "id": answer.id,
            "user_id": answer.user_id,
            "question_id": answer.question_id,
            "choice_id": answer.choice_id,
            "score": answer.score,
            "created_at": answer.created_at
        }
        result.append(answer_dict)
    
    return result

# Quiz CRUD Operations - Updated to fix validation errors
def get_quiz(db: Session, quiz_id: int):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        return None
        
    # Convert to dict for consistency
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "category": quiz.category,
        "difficulty": quiz.difficulty,
        "time_limit": quiz.time_limit,
        "creator_id": quiz.creator_id,
        "created_at": quiz.created_at,
    }

def get_quizzes(db: Session, skip: int = 0, limit: int = 100):
    # Get all quizzes
    quizzes = db.query(Quiz).offset(skip).limit(limit).all()
    
    # Create a list to hold transformed results
    result = []
    
    # Process each quiz to transform question objects to IDs
    for quiz in quizzes:
        # Get question IDs for this quiz
        question_ids = [q.question_id for q in db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz.id).all()]
        
        # Clone the quiz object attributes to a dict
        quiz_dict = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "category": quiz.category,
            "difficulty": quiz.difficulty,
            "time_limit": quiz.time_limit,
            "creator_id": quiz.creator_id,
            "created_at": quiz.created_at,
            "questions": question_ids  # Use IDs instead of objects
        }
        
        result.append(quiz_dict)
    
    return result

def create_quiz(db: Session, quiz: schemas.QuizCreate, creator_id: int):
    db_quiz = Quiz(
        title=quiz.title,
        description=quiz.description,
        category=quiz.category,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        creator_id=creator_id
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    # Add questions to the quiz
    for question_id in quiz.questions:
        quiz_question = QuizQuestion(quiz_id=db_quiz.id, question_id=question_id)
        db.add(quiz_question)
    
    db.commit()
    db.refresh(db_quiz)
    
    # Return formatted quiz with question IDs
    quiz_dict = {
        "id": db_quiz.id,
        "title": db_quiz.title,
        "description": db_quiz.description,
        "category": quiz.category,  # Use input category in case db_quiz.category is None
        "difficulty": db_quiz.difficulty,
        "time_limit": db_quiz.time_limit,
        "creator_id": db_quiz.creator_id,
        "created_at": db_quiz.created_at,
        "questions": [int(qid) for qid in quiz.questions]  # Ensure all IDs are integers
    }
    
    return quiz_dict

def update_quiz(db: Session, quiz_id: int, quiz: schemas.QuizUpdate):
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if db_quiz:
        # Update quiz attributes
        db_quiz.title = quiz.title
        db_quiz.description = quiz.description
        db_quiz.category = quiz.category
        db_quiz.difficulty = quiz.difficulty
        db_quiz.time_limit = quiz.time_limit
        
        # Remove all existing questions
        db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).delete()
        
        # Add new questions
        for question_id in quiz.questions:
            quiz_question = QuizQuestion(quiz_id=quiz_id, question_id=question_id)
            db.add(quiz_question)
        
        db.commit()
        db.refresh(db_quiz)
        
        # Return formatted quiz with question IDs
        quiz_dict = {
            "id": db_quiz.id,
            "title": db_quiz.title,
            "description": db_quiz.description,
            "category": db_quiz.category,
            "difficulty": db_quiz.difficulty,
            "time_limit": db_quiz.time_limit,
            "creator_id": db_quiz.creator_id,
            "created_at": db_quiz.created_at,
            "questions": [int(qid) for qid in quiz.questions]  # Ensure all IDs are integers
        }
        
        return quiz_dict
    return None

def delete_quiz(db: Session, quiz_id: int):
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if db_quiz:
        db.delete(db_quiz)
        db.commit()
    return db_quiz

def get_quiz_with_questions(db: Session, quiz_id: int):
    # Get the quiz
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not db_quiz:
        return None
    
    # Get all question IDs for this quiz
    quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    question_ids = [qq.question_id for qq in quiz_questions]
    
    # Get the actual questions
    questions = []
    for q_id in question_ids:
        question = db.query(Question).filter(Question.id == q_id).first()
        if question:
            questions.append(question)
    
    # Create the response object with all necessary data
    quiz_dict = {
        "id": db_quiz.id,
        "title": db_quiz.title,
        "description": db_quiz.description,
        "category": db_quiz.category,
        "difficulty": db_quiz.difficulty,
        "time_limit": db_quiz.time_limit,
        "creator_id": db_quiz.creator_id,
        "created_at": db_quiz.created_at,
        "questions": questions  # Using full question objects as expected by QuizDetailResponse
    }
    
    return quiz_dict