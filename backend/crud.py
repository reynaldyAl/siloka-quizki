from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from database import User, Question, Choice, Answer, Quiz, QuizQuestion, QuizScore
from auth import get_password_hash
import schemas
import logging

logger = logging.getLogger(__name__)

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

# Enhanced answer functions for re-take functionality
def get_user_answer_for_question(db: Session, user_id: int, question_id: int):
    """Get user's existing answer for a specific question"""
    return db.query(Answer).filter(
        Answer.user_id == user_id,
        Answer.question_id == question_id,
        Answer.question_id.isnot(None),  # Ensure question_id is not NULL
        Answer.choice_id.isnot(None)     # Ensure choice_id is not NULL
    ).first()

def delete_user_answer(db: Session, user_id: int, question_id: int):
    """Delete user's answer for a specific question (for re-take functionality)"""
    existing_answer = get_user_answer_for_question(db, user_id, question_id)
    if existing_answer:
        # Also subtract score from user's total
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.total_score = max(0, user.total_score - existing_answer.score)
            logger.info(f"Deducted {existing_answer.score} points from user {user_id}, new total: {user.total_score}")
        
        db.delete(existing_answer)
        db.commit()
        return True
    return False

# FIXED: Enhanced the create_answer function to always set is_correct explicitly
def create_answer(db: Session, user_id: int, question_id: int, choice_id: int):
    """Create a new answer record - ENHANCED with better validation and logging"""
    logger.info(f"🔍 CREATE_ANSWER: Starting creation - user_id={user_id}, question_id={question_id}, choice_id={choice_id}")
    
    # Get the choice and verify it exists
    choice = db.query(Choice).filter(Choice.id == choice_id).first()
    if not choice:
        logger.error(f"❌ CREATE_ANSWER: Choice {choice_id} not found")
        return None
    
    # Get the question and verify it exists  
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        logger.error(f"❌ CREATE_ANSWER: Question {question_id} not found")
        return None
        
    # Verify choice belongs to question
    if choice.question_id != question_id:
        logger.error(f"❌ CREATE_ANSWER: Choice {choice_id} doesn't belong to question {question_id}")
        return None
    
    logger.info(f"✅ CREATE_ANSWER: Found choice={choice_id} and question={question_id}")
    
    # Calculate score based on is_correct
    is_correct = choice.is_correct  # Get the actual correctness from database
    score = question.score if is_correct else 0.0
    
    logger.info(f"💰 CREATE_ANSWER: Calculated score={score} (is_correct={is_correct})")
    
    # Create answer with explicit field values
    db_answer = Answer(
        user_id=user_id,
        question_id=question_id,
        choice_id=choice_id,
        score=score
    )
    
    logger.info(f"📝 CREATE_ANSWER: Created Answer object - user_id={user_id}, question_id={question_id}, choice_id={choice_id}, score={score}")
    
    db.add(db_answer)
    
    # Update user's total score
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        old_score = user.total_score
        user.total_score += score
        logger.info(f"📊 CREATE_ANSWER: Updated user total score from {old_score} to {user.total_score}")
    
    try:
        db.commit()
        db.refresh(db_answer)
        
        logger.info(f"✅ CREATE_ANSWER: COMMITTED - ID={db_answer.id}, user_id={user_id}, question_id={question_id}, choice_id={choice_id}, score={score}")
        
        # CRITICAL: Explicitly set is_correct on the response object
        db_answer.is_correct = is_correct
        logger.info(f"🔍 CREATE_ANSWER: Set is_correct={is_correct} on response")
        
        return db_answer
    except Exception as e:
        logger.error(f"💥 CREATE_ANSWER: Failed to commit: {str(e)}")
        db.rollback()
        return None

# FIXED: Enhanced the get_user_answers function to always include is_correct
def get_user_answers(db: Session, user_id: int):
    """Get all answers for a specific user with is_correct information"""
    logger.info(f"🔍 GET_USER_ANSWERS: Starting fetch for user {user_id}")
    
    # Get all answers for this user
    all_answers = db.query(Answer).filter(Answer.user_id == user_id).all()
    logger.info(f"📊 GET_USER_ANSWERS: Found {len(all_answers)} total answer records")
    
    # Filter out any records with NULL question_id or choice_id
    valid_records = [a for a in all_answers if a.question_id is not None and a.choice_id is not None]
    null_records = len(all_answers) - len(valid_records)
    
    logger.info(f"📊 GET_USER_ANSWERS: {null_records} NULL records, {len(valid_records)} valid records")
    
    # Transform to response format with explicit is_correct field
    result = []
    for answer in valid_records:
        # Get the choice to determine correctness
        choice = db.query(Choice).filter(Choice.id == answer.choice_id).first()
        is_correct = choice.is_correct if choice else False
        
        # Create response object with is_correct explicitly set
        answer_dict = {
            "id": answer.id,
            "user_id": answer.user_id,
            "question_id": answer.question_id,
            "choice_id": answer.choice_id,
            "score": answer.score,
            "is_correct": is_correct,  # Always include is_correct
            "created_at": answer.created_at
        }
        result.append(answer_dict)
    
    logger.info(f"✅ GET_USER_ANSWERS: Returning {len(result)} valid answers for user {user_id}")
    return result

# Remaining functions (unchanged)
def create_score_record(db: Session, user_id: int, score: float, quiz_id: int = None):
    """Create a score-only record (for quiz completion tracking)"""
    logger.info(f"📊 CREATE_SCORE_RECORD: Creating score record - user_id={user_id}, score={score}, quiz_id={quiz_id}")
    
    # Create a score-only answer record (question_id and choice_id will be NULL)
    db_answer = Answer(
        user_id=user_id,
        # question_id and choice_id remain NULL
        score=score
    )
    
    db.add(db_answer)
    
    # Update user's total score
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.total_score += score
        logger.info(f"📊 CREATE_SCORE_RECORD: Updated user total score to {user.total_score}")
    
    try:
        db.commit()
        db.refresh(db_answer)
        logger.info(f"✅ CREATE_SCORE_RECORD: Created score record with ID {db_answer.id}")
        return db_answer
    except Exception as e:
        logger.error(f"💥 CREATE_SCORE_RECORD: Failed to create score record - {str(e)}")
        db.rollback()
        return None

# Quiz CRUD Operations (unchanged)
def get_quiz(db: Session, quiz_id: int):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        return None
        
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
    quizzes = db.query(Quiz).offset(skip).limit(limit).all()
    result = []
    
    for quiz in quizzes:
        question_ids = [q.question_id for q in db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz.id).all()]
        
        quiz_dict = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "category": quiz.category,
            "difficulty": quiz.difficulty,
            "time_limit": quiz.time_limit,
            "creator_id": quiz.creator_id,
            "created_at": quiz.created_at,
            "questions": question_ids
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
    
    quiz_dict = {
        "id": db_quiz.id,
        "title": db_quiz.title,
        "description": db_quiz.description,
        "category": quiz.category,
        "difficulty": db_quiz.difficulty,
        "time_limit": db_quiz.time_limit,
        "creator_id": db_quiz.creator_id,
        "created_at": db_quiz.created_at,
        "questions": [int(qid) for qid in quiz.questions]
    }
    
    return quiz_dict

def update_quiz(db: Session, quiz_id: int, quiz: schemas.QuizUpdate):
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if db_quiz:
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
        
        quiz_dict = {
            "id": db_quiz.id,
            "title": db_quiz.title,
            "description": db_quiz.description,
            "category": db_quiz.category,
            "difficulty": db_quiz.difficulty,
            "time_limit": db_quiz.time_limit,
            "creator_id": db_quiz.creator_id,
            "created_at": db_quiz.created_at,
            "questions": [int(qid) for qid in quiz.questions]
        }
        
        return quiz_dict
    return None

def delete_quiz(db: Session, quiz_id: int):
    # First, delete related quiz scores
    db.query(QuizScore).filter(QuizScore.quiz_id == quiz_id).delete()
    
    # Next, delete quiz questions relationship records
    db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).delete()
    
    # Finally, delete the quiz itself
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if db_quiz:
        db.delete(db_quiz)
        
    db.commit()
    return db_quiz

def get_quiz_with_questions(db: Session, quiz_id: int):
    """Get quiz with properly serialized questions"""
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not db_quiz:
        return None
    
    quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    question_ids = [qq.question_id for qq in quiz_questions]
    
    questions = []
    for q_id in question_ids:
        question = db.query(Question).filter(Question.id == q_id).first()
        if question:
            question_dict = {
                "id": question.id,
                "question_text": question.question_text,
                "score": question.score,
                "creator_id": question.creator_id,
                "created_at": question.created_at,
                "choices": [
                    {
                        "id": choice.id,
                        "choice_text": choice.choice_text,
                        "is_correct": choice.is_correct
                    } for choice in question.choices
                ]
            }
            questions.append(question_dict)
    
    quiz_dict = {
        "id": db_quiz.id,
        "title": db_quiz.title,
        "description": db_quiz.description,
        "category": db_quiz.category,
        "difficulty": db_quiz.difficulty,
        "time_limit": db_quiz.time_limit,
        "creator_id": db_quiz.creator_id,
        "created_at": db_quiz.created_at,
        "questions": questions
    }
    
    return quiz_dict

def get_quiz_question_ids(db: Session, quiz_id: int):
    """Get all question IDs for a specific quiz"""
    quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    return [qq.question_id for qq in quiz_questions]

# QuizScore functions (unchanged)
def create_quiz_score(db: Session, user_id: int, quiz_id: int, score: float, total_questions: int, correct_answers: int):
    """Create or update a quiz completion score record"""
    logger.info(f"📊 CREATE_QUIZ_SCORE: user_id={user_id}, quiz_id={quiz_id}, score={score}, correct={correct_answers}/{total_questions}")
    
    # Check if user already has a score for this quiz
    existing_score = db.query(QuizScore).filter(
        QuizScore.user_id == user_id,
        QuizScore.quiz_id == quiz_id
    ).first()
    
    if existing_score:
        # Update existing score (for retakes)
        logger.info(f"📊 Updating existing quiz score for user {user_id}, quiz {quiz_id}")
        old_score = existing_score.score
        
        existing_score.score = score
        existing_score.total_questions = total_questions
        existing_score.correct_answers = correct_answers
        existing_score.completed_at = datetime.utcnow()
        
        # Update user's total score (remove old, add new)
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.total_score = user.total_score - old_score + score
            logger.info(f"📊 Updated user total score: {user.total_score}")
        
        try:
            db.commit()
            db.refresh(existing_score)
            logger.info(f"✅ Updated quiz score ID {existing_score.id}")
            return existing_score
        except Exception as e:
            logger.error(f"💥 Failed to update quiz score: {str(e)}")
            db.rollback()
            return None
    else:
        # Create new score record
        db_quiz_score = QuizScore(
            user_id=user_id,
            quiz_id=quiz_id,
            score=score,
            total_questions=total_questions,
            correct_answers=correct_answers
        )
        
        db.add(db_quiz_score)
        
        # Update user's total score
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.total_score += score
            logger.info(f"📊 Updated user total score to {user.total_score}")
        
        try:
            db.commit()
            db.refresh(db_quiz_score)
            logger.info(f"✅ Created new quiz score with ID {db_quiz_score.id}")
            return db_quiz_score
        except Exception as e:
            logger.error(f"💥 Failed to create quiz score: {str(e)}")
            db.rollback()
            return None

def get_user_quiz_scores(db: Session, user_id: int):
    """Get all quiz scores for a user"""
    return db.query(QuizScore).filter(QuizScore.user_id == user_id).all()

def get_quiz_scores(db: Session, quiz_id: int):
    """Get all scores for a specific quiz (leaderboard)"""
    return db.query(QuizScore).filter(QuizScore.quiz_id == quiz_id).order_by(desc(QuizScore.score)).all()

def get_user_quiz_score(db: Session, user_id: int, quiz_id: int):
    """Get user's score for a specific quiz"""
    return db.query(QuizScore).filter(
        QuizScore.user_id == user_id,
        QuizScore.quiz_id == quiz_id
    ).first()

def delete_quiz_score(db: Session, user_id: int, quiz_id: int):
    """Delete user's quiz score (for complete reset)"""
    quiz_score = get_user_quiz_score(db, user_id, quiz_id)
    if quiz_score:
        # Subtract from user's total score
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.total_score = max(0, user.total_score - quiz_score.score)
        
        db.delete(quiz_score)
        db.commit()
        return True
    return False