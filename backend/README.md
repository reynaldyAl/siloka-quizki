# QuizKi Backend API

This is the backend API for QuizKi, a quiz application built with FastAPI and SQLite.

## Features

- User authentication and authorization with JWT tokens
- Role-based access control (User and Admin)
- Quiz questions with multiple choices
- Answer submission and scoring
- Leaderboard functionality

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Schema

### Users Table
- id: Primary key
- username: Unique username
- email: Unique email
- password: Hashed password
- total_score: User's total score
- role: "user" or "admin"
- created_at: Timestamp

### Questions Table
- id: Primary key
- question_text: The question text
- score: Points awarded for correct answer
- creator_id: Foreign key to users table
- created_at: Timestamp

### Choices Table
- id: Primary key
- choice_text: The choice text
- question_id: Foreign key to questions table
- is_correct: Boolean indicating if this is the correct answer

### Answers Table
- id: Primary key
- user_id: Foreign key to users table
- question_id: Foreign key to questions table
- choice_id: Foreign key to choices table
- score: Score earned for this answer
- created_at: Timestamp

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login and get JWT token

### Users
- `GET /users` - Get all users (leaderboard)
- `GET /users/{id}` - Get specific user details
- `GET /me` - Get current user info

### Questions
- `GET /questions` - Get all questions
- `GET /questions/{id}` - Get specific question
- `POST /questions` - Create new question (Admin only)
- `PUT /questions/{id}` - Update question (Admin only)
- `DELETE /questions/{id}` - Delete question (Admin only)

### Answers
- `POST /answers` - Submit an answer
- `GET /my-answers` - Get current user's answers

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Roles

- **Guest**: Can view questions (without correct answers) and leaderboard (public info only)
- **User**: Can submit answers, view their own profile and answers
- **Admin**: Full access to all endpoints, can manage questions and view all user data
