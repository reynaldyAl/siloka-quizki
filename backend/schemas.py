from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"

class UserResponse(UserBase):
    id: int
    total_score: float
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    username: str
    total_score: float
    
    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    score: float

class QuestionCreate(QuestionBase):
    pass

class ChoiceBase(BaseModel):
    choice_text: str
    is_correct: bool

class ChoiceCreate(ChoiceBase):
    pass

class ChoiceResponse(BaseModel):
    id: int
    choice_text: str
    is_correct: Optional[bool] = None
    
    class Config:
        from_attributes = True

class QuestionResponse(QuestionBase):
    id: int
    creator_id: int
    created_at: datetime
    choices: List[ChoiceResponse]
    
    class Config:
        from_attributes = True

class QuestionCreateWithChoices(QuestionBase):
    choices: List[ChoiceCreate]

# Answer Schemas
class AnswerCreate(BaseModel):
    question_id: int
    choice_id: int

class AnswerResponse(BaseModel):
    id: int
    user_id: int
    question_id: int
    choice_id: int
    score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
