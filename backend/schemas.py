from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
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
    is_correct: bool  # Add this field
    created_at: datetime
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: str = "medium"
    time_limit: int = 15
    questions: List[int] = []

class QuizCreate(QuizBase):
    pass

class QuizUpdate(QuizBase):
    pass

class QuizResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: str
    time_limit: int
    creator_id: int
    created_at: datetime
    questions: List[Any] = []  # Allow any type of list content
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class QuizDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: str
    time_limit: int
    creator_id: int
    created_at: datetime
    questions: List[Any] = []  # Allow any type of question data
    
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# NEW: QuizScore Schemas
class QuizScoreBase(BaseModel):
    quiz_id: int
    score: float
    total_questions: int
    correct_answers: int

class QuizScoreCreate(QuizScoreBase):
    pass

class QuizScoreResponse(QuizScoreBase):
    id: int
    user_id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True
