from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta

import schemas
import crud
import auth
from database import get_db, User

app = FastAPI(title="QuizKi API", description="Quiz Application API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

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
    # Optional authentication
    current_user = None
    if credentials:
        try:
            current_user = auth.get_current_user(credentials, db)
        except HTTPException:
            pass  # Guest access allowed
    
    users = crud.get_users(db, skip=skip, limit=limit)
    
    # If admin, return full user data; otherwise, return public data only
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
    
    # Check if current user can access this user's data
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
    # Optional authentication
    current_user = None
    if credentials:
        try:
            current_user = auth.get_current_user(credentials, db)
        except HTTPException:
            pass  # Guest access allowed
    
    question = crud.get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Convert to response format
    question_data = schemas.QuestionResponse.from_orm(question)
    
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
    # Optional authentication
    current_user = None
    if credentials:
        try:
            current_user = auth.get_current_user(credentials, db)
        except HTTPException:
            pass  # Guest access allowed
    
    questions = crud.get_questions(db, skip=skip, limit=limit)
    
    # Convert to response format and hide is_correct for non-admin users
    result = []
    for question in questions:
        question_data = schemas.QuestionResponse.from_orm(question)
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
    db_question = crud.delete_question(db, question_id=question_id)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

# Answer endpoints
@app.post("/answers", response_model=schemas.AnswerResponse)
def submit_answer(
    answer: schemas.AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    # Verify that the choice belongs to the question
    choice = crud.get_choice(db, choice_id=answer.choice_id)
    if not choice or choice.question_id != answer.question_id:
        raise HTTPException(status_code=400, detail="Invalid choice for this question")
    
    db_answer = crud.create_answer(db=db, answer=answer, user_id=current_user.id)
    if db_answer is None:
        raise HTTPException(status_code=400, detail="You have already answered this question or invalid data")
    
    return db_answer

@app.get("/my-answers", response_model=List[schemas.AnswerResponse])
def get_my_answers(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user)
):
    return crud.get_user_answers(db, user_id=current_user.id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
