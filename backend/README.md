# QuizKi Backend API

This is the backend API for QuizKi, a quiz application built with FastAPI and SQLite.

## Features

- User authentication and authorization with JWT tokens
- Role-based access control (User and Admin)
- Quiz questions with multiple choices
- Answer submission and scoring
- Leaderboard functionality
- Quiz management system
- Quiz retake functionality
- Admin statistics dashboard

## Installation

1. Install dependencies:
   pip install -r requirements.txt

2. Run the application:
   python main.py

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

### Before (Pre 2025-06-20)

Users Table:
- id: Primary key
- username: Unique username
- email: Unique email
- password: Hashed password
- total_score: User's total score
- role: "user" or "admin"
- created_at: Timestamp

Questions Table:
- id: Primary key
- question_text: The question text
- score: Points awarded for correct answer
- creator_id: Foreign key to users table
- created_at: Timestamp

Choices Table:
- id: Primary key
- choice_text: The choice text
- question_id: Foreign key to questions table
- is_correct: Boolean indicating if this is the correct answer

Answers Table:
- id: Primary key
- user_id: Foreign key to users table
- question_id: Foreign key to questions table
- choice_id: Foreign key to choices table
- score: Score earned for this answer
- created_at: Timestamp

### After (2025-06-20)

Users Table: (unchanged)
- id: Primary key
- username: Unique username
- email: Unique email
- password: Hashed password
- total_score: User's total score
- role: "user" or "admin"
- created_at: Timestamp

Questions Table: (unchanged)
- id: Primary key
- question_text: The question text
- score: Points awarded for correct answer
- creator_id: Foreign key to users table
- created_at: Timestamp

Choices Table: (unchanged)
- id: Primary key
- choice_text: The choice text
- question_id: Foreign key to questions table
- is_correct: Boolean indicating if this is the correct answer

Answers Table: (unchanged)
- id: Primary key
- user_id: Foreign key to users table
- question_id: Foreign key to questions table
- choice_id: Foreign key to choices table
- score: Score earned for this answer
- created_at: Timestamp

Quizzes Table: (NEW)
- id: Primary key
- title: Quiz title
- description: Quiz description
- category: Quiz category
- difficulty: Quiz difficulty level
- time_limit: Time limit in minutes
- creator_id: Foreign key to users table
- created_at: Timestamp

QuizScores Table: (NEW)
- id: Primary key
- user_id: Foreign key to users table
- quiz_id: Foreign key to quizzes table
- score: Total score for the quiz
- total_questions: Number of questions in the quiz
- correct_answers: Number of correctly answered questions
- completed_at: Timestamp

## API Endpoints

### Before (Pre 2025-06-20)

Authentication:
- POST /register - Register a new user
- POST /login - Login and get JWT token

Users:
- GET /users - Get all users (leaderboard)
- GET /users/{id} - Get specific user details
- GET /me - Get current user info

Questions:
- GET /questions - Get all questions
- GET /questions/{id} - Get specific question
- POST /questions - Create new question (Admin only)
- PUT /questions/{id} - Update question (Admin only)
- DELETE /questions/{id} - Delete question (Admin only)

Answers:
- POST /answers - Submit an answer
- GET /my-answers - Get current user's answers

### After (2025-06-20)

Health Check:
- GET /health-check - Check if the API is running (NEW)

Authentication:
- POST /register - Register a new user
- POST /login - Login and get JWT token

Users:
- GET /users - Get all users (leaderboard)
- GET /users/{user_id} - Get specific user details (id → user_id)
- GET /me - Get current user info

Questions:
- GET /questions - Get all questions
- GET /questions/{question_id} - Get specific question (id → question_id)
- POST /questions - Create new question (Admin only)
- PUT /questions/{question_id} - Update question (Admin only)
- DELETE /questions/{question_id} - Delete question (Admin only)

Answers:
- POST /answers - Submit an answer
- GET /my-answers - Get current user's answers
- DELETE /my-answers/{question_id} - Reset answer for a specific question (NEW)

Quizzes: (NEW)
- GET /quizzes - Get all quizzes
- GET /quizzes/{quiz_id} - Get a specific quiz with questions
- POST /quizzes - Create a new quiz (Admin only)
- PUT /quizzes/{quiz_id} - Update quiz (Admin only)
- DELETE /quizzes/{quiz_id} - Delete quiz (Admin only)
- DELETE /quizzes/{quiz_id}/reset-answers - Reset all user's answers for a specific quiz

Quiz Scores: (NEW)
- POST /quiz-scores - Submit/update a quiz completion score
- GET /my-quiz-scores - Get all quiz scores for the current user
- GET /quiz-scores/{quiz_id} - Get leaderboard for a specific quiz
- GET /my-quiz-score/{quiz_id} - Get user's score for a specific quiz
- DELETE /my-quiz-score/{quiz_id} - Reset user's quiz score for complete retake

Admin: (NEW)
- GET /admin/statistics - Get statistics for admin dashboard (Admin only)

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
Authorization: Bearer <your_jwt_token>

## Roles

- Guest: Can view questions (without correct answers) and leaderboard (public info only)
- User: Can submit answers, view their own profile and answers, take quizzes
- Admin: Full access to all endpoints, can manage questions and view all user data