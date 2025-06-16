from sqlalchemy.orm import Session
from database import SessionLocal, User, Question, Choice
from auth import get_password_hash

def create_sample_data():
    db = SessionLocal()
    
    try:
        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@quizki.com",
            password=get_password_hash("admin123"),
            role="admin",
            total_score=0.0
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("Admin user created: username=admin, password=admin123")
        
        # Create regular user
        regular_user = User(
            username="user1",
            email="user1@example.com",
            password=get_password_hash("user123"),
            role="user",
            total_score=0.0
        )
        db.add(regular_user)
        db.commit()
        db.refresh(regular_user)
        print("Regular user created: username=user1, password=user123")
        
        # Create sample questions
        question1 = Question(
            question_text="What is the capital of Indonesia?",
            score=10.0,
            creator_id=admin_user.id
        )
        db.add(question1)
        db.commit()
        db.refresh(question1)
        
        # Add choices for question 1
        choices1 = [
            Choice(choice_text="Jakarta", is_correct=True, question_id=question1.id),
            Choice(choice_text="Bandung", is_correct=False, question_id=question1.id),
            Choice(choice_text="Surabaya", is_correct=False, question_id=question1.id),
            Choice(choice_text="Medan", is_correct=False, question_id=question1.id)
        ]
        for choice in choices1:
            db.add(choice)
        
        question2 = Question(
            question_text="Which programming language is FastAPI built with?",
            score=15.0,
            creator_id=admin_user.id
        )
        db.add(question2)
        db.commit()
        db.refresh(question2)
        
        # Add choices for question 2
        choices2 = [
            Choice(choice_text="JavaScript", is_correct=False, question_id=question2.id),
            Choice(choice_text="Python", is_correct=True, question_id=question2.id),
            Choice(choice_text="Java", is_correct=False, question_id=question2.id),
            Choice(choice_text="C++", is_correct=False, question_id=question2.id)
        ]
        for choice in choices2:
            db.add(choice)
        
        question3 = Question(
            question_text="What does SQL stand for?",
            score=8.0,
            creator_id=admin_user.id
        )
        db.add(question3)
        db.commit()
        db.refresh(question3)
        
        # Add choices for question 3
        choices3 = [
            Choice(choice_text="Structured Query Language", is_correct=True, question_id=question3.id),
            Choice(choice_text="Simple Query Language", is_correct=False, question_id=question3.id),
            Choice(choice_text="Standard Query Language", is_correct=False, question_id=question3.id),
            Choice(choice_text="System Query Language", is_correct=False, question_id=question3.id)
        ]
        for choice in choices3:
            db.add(choice)
        
        db.commit()
        print("Sample questions created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
