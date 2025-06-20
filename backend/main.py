from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import timedelta
import logging

import schemas
import crud
import auth
from database import get_db, User, QuizScore

app = FastAPI(title="QuizKi API", description="Quiz Application API", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

security = HTTPBearer(auto_error=False)

# Health check endpoint
@app.get("/health-check")
async def health_check():
    return {"status": "healthy", "message": "QuizKi API is running"}

# Auth endpoints
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)

@app.post("/login", response_model=schemas.Token)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.get("/users", response_model=List[schemas.UserResponse] | List[schemas.UserPublic])
def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    credentials = Depends(security)
):
    current_user = None
    if credentials:
        try:
            current_user = auth.get_current_user(credentials, db)
        except HTTPException:
            pass
    
    users = crud.get_users(db, skip=skip, limit=limit)
    
    if current_user and current_user.role == "admin":
        return users
    else:
        return [schemas.UserPublic(username=user.username, total_score=user.total_score) for user in users]

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(auth.get_current_user)
):
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return user

@app.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: User = Depends(auth.get_current_user)):
    return current_user

# Question endpoints  
@app.get("/questions/{question_id}", response_model=schemas.QuestionResponse)
def get_question(
    question_id: int, 
    db: Session = Depends(get_db),
    credentials = Depends(security)
):
    current_user = None
    if credentials:
        try:
            current_user = auth.get_current_user(credentials, db)
        except HTTPException:
            pass
    
    question = crud.get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Use model_validate instead of from_orm (Pydantic V2)
    question_data = schemas.QuestionResponse.model_validate(question)
    
    # Hide is_correct for non-admin users
    if not current_user or current_user.role != "admin":
        for choice in question_data.choices:
            choice.is_correct = None
    
    return question_data

@app.get("/questions", response_model=List[schemas.QuestionResponse])
def get_questions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    credentials = Depends(security)
):
    current_user = None
    if credentials:
        try:
            current_user = auth.get_current_user(credentials, db)
        except HTTPException:
            pass
    
    questions = crud.get_questions(db, skip=skip, limit=limit)
    
    result = []
    for question in questions:
        question_data = schemas.QuestionResponse.model_validate(question)
        if not current_user or current_user.role != "admin":
            for choice in question_data.choices:
                choice.is_correct = None
        result.append(question_data)
    
    return result

@app.post("/questions", response_model=schemas.QuestionResponse)
def create_question(
    question: schemas.QuestionCreateWithChoices, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(auth.require_admin)
):
    return crud.create_question(db=db, question=question, creator_id=current_user.id)

@app.put("/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question(
    question_id: int,
    question: schemas.QuestionCreateWithChoices,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.require_admin)
):
    db_question = crud.update_question(db, question_id=question_id, question=question)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.require_admin)
):
    try:
        db_question = crud.delete_question(db, question_id=question_id)
        if db_question is None:
            raise HTTPException(status_code=404, detail="Question not found")
        return {"message": "Question deleted successfully", "id": question_id}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error deleting question {question_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting question")

@app.post("/answers", response_model=schemas.AnswerResponse)
def submit_answer(
    answer: schemas.AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    logger.info(f"Received answer submission: question_id={answer.question_id}, choice_id={answer.choice_id}")
    logger.info(f"User ID: {current_user.id}")
    
    # Check if user already answered this question
    existing_answer = crud.get_user_answer_for_question(db, user_id=current_user.id, question_id=answer.question_id)
    if existing_answer:
        logger.info(f"User {current_user.id} already answered question {answer.question_id}")
        
        # Delete the previous answer instead of rejecting it
        crud.delete_user_answer(db, user_id=current_user.id, question_id=answer.question_id)
        logger.info(f"Deleted previous answer for question {answer.question_id}")
    
    # Verify that the choice belongs to the question
    choice = crud.get_choice(db, choice_id=answer.choice_id)
    if not choice or choice.question_id != answer.question_id:
        raise HTTPException(status_code=400, detail="Invalid choice for this question")
    
    # Fixed function parameters
    db_answer = crud.create_answer(
        db=db,
        user_id=current_user.id,
        question_id=answer.question_id, 
        choice_id=answer.choice_id
    )
    
    if db_answer is None:
        raise HTTPException(status_code=500, detail="Failed to create answer")
    
    return db_answer

@app.get("/my-answers", response_model=List[schemas.AnswerResponse])
def get_my_answers(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    return crud.get_user_answers(db, user_id=current_user.id)

# NEW: Reset answer endpoint for re-take functionality
@app.delete("/my-answers/{question_id}")
def reset_answer(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """Reset user's answer for a specific question (for re-take quiz functionality)"""
    result = crud.delete_user_answer(db, user_id=current_user.id, question_id=question_id)
    if not result:
        raise HTTPException(status_code=404, detail="No answer found for this question")
    return {"message": f"Answer for question {question_id} has been reset"}

# NEW: Reset all answers for a quiz
@app.delete("/quizzes/{quiz_id}/reset-answers")
def reset_quiz_answers(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """Reset all user's answers for a specific quiz (for re-take functionality)"""
    try:
        # Get quiz questions
        quiz_questions = crud.get_quiz_question_ids(db, quiz_id=quiz_id)
        if not quiz_questions:
            raise HTTPException(status_code=404, detail="Quiz not found or has no questions")
        
        # Reset all answers for these questions
        reset_count = 0
        total_score_deducted = 0.0
        
        for question_id in quiz_questions:
            result = crud.delete_user_answer(db, user_id=current_user.id, question_id=question_id)
            if result:
                reset_count += 1
        
        logger.info(f"Reset {reset_count} answers for user {current_user.id} in quiz {quiz_id}")
        
        return {
            "message": f"Reset {reset_count} answers for quiz {quiz_id}",
            "quiz_id": quiz_id,
            "reset_count": reset_count,
            "total_questions": len(quiz_questions)
        }
    except Exception as e:
        logger.error(f"Error resetting quiz answers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset quiz answers")

# Quiz endpoints with proper serialization
@app.post("/quizzes")
def create_quiz(
    quiz: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.require_admin)
):
    return crud.create_quiz(db=db, quiz=quiz, creator_id=current_user.id)

@app.get("/quizzes")
def read_quizzes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_quizzes(db, skip=skip, limit=limit)

@app.get("/quizzes/{quiz_id}")
def read_quiz(
    quiz_id: int,
    db: Session = Depends(get_db)
):
    """Get quiz with properly serialized questions"""
    quiz = crud.get_quiz_with_questions(db, quiz_id=quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return quiz

@app.put("/quizzes/{quiz_id}")
def update_quiz(
    quiz_id: int,
    quiz: schemas.QuizUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.require_admin)
):
    db_quiz = crud.update_quiz(db, quiz_id=quiz_id, quiz=quiz)
    if db_quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return db_quiz

@app.delete("/quizzes/{quiz_id}")
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.require_admin)
):
    db_quiz = crud.delete_quiz(db, quiz_id=quiz_id)
    if db_quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"message": "Quiz deleted successfully"}

# NEW: QuizScore Endpoints
@app.post("/quiz-scores", response_model=schemas.QuizScoreResponse)
def submit_quiz_score(
    quiz_score: schemas.QuizScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """Submit/Update a quiz completion score"""
    logger.info(f"Quiz score submission: user={current_user.id}, quiz={quiz_score.quiz_id}")
    
    result = crud.create_quiz_score(
        db=db, 
        user_id=current_user.id,
        quiz_id=quiz_score.quiz_id,
        score=quiz_score.score,
        total_questions=quiz_score.total_questions,
        correct_answers=quiz_score.correct_answers
    )
    
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create quiz score")
    
    return result

@app.get("/my-quiz-scores", response_model=List[schemas.QuizScoreResponse])
def get_my_quiz_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """Get all quiz scores for the current user"""
    return crud.get_user_quiz_scores(db, user_id=current_user.id)

@app.get("/quiz-scores/{quiz_id}", response_model=List[schemas.QuizScoreResponse])
def get_quiz_leaderboard(
    quiz_id: int,
    db: Session = Depends(get_db)
):
    """Get leaderboard for a specific quiz"""
    return crud.get_quiz_scores(db, quiz_id=quiz_id)

@app.get("/my-quiz-score/{quiz_id}", response_model=schemas.QuizScoreResponse)
def get_my_quiz_score(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """Get user's score for a specific quiz"""
    score = crud.get_user_quiz_score(db, user_id=current_user.id, quiz_id=quiz_id)
    if not score:
        raise HTTPException(status_code=404, detail="Quiz score not found")
    return score

@app.delete("/my-quiz-score/{quiz_id}")
def reset_my_quiz_score(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    """Reset user's quiz score (for complete retake)"""
    result = crud.delete_quiz_score(db, user_id=current_user.id, quiz_id=quiz_id)
    if not result:
        raise HTTPException(status_code=404, detail="Quiz score not found")
    return {"message": f"Quiz score for quiz {quiz_id} has been reset"}

# OPTIONS endpoints
@app.options("/quizzes", include_in_schema=False)
async def options_quiz():
    return {}

@app.options("/questions", include_in_schema=False)
async def options_question():
    return {}

@app.options("/answers", include_in_schema=False)
async def options_answers():
    return {}

@app.options("/login", include_in_schema=False)
async def options_login():
    return {}

@app.options("/me", include_in_schema=False)
async def options_me():
    return {}

@app.options("/my-answers", include_in_schema=False)
async def options_my_answers():
    return {}

@app.options("/users", include_in_schema=False)
async def options_users():
    return {}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)