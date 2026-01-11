"""
Seed SQLite Database with Sample Data
Run this script to populate the database with test data
"""

import database as db
from datetime import datetime, timezone, timedelta
import uuid

def seed_database():
    """Seed the database with sample data"""
    
    print("🌱 Seeding SQLite database...")
    
    # Create sample users
    users = [
        {
            "user_id": "user_student1",
            "email": "student1@cit.edu",
            "name": "Rahul Kumar",
            "role": "student",
            "department": "Computer Science",
            "year": 3,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": "user_student2",
            "email": "student2@cit.edu",
            "name": "Priya Sharma",
            "role": "student",
            "department": "Electronics",
            "year": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": "user_teacher1",
            "email": "teacher1@cit.edu",
            "name": "Dr. Anand Verma",
            "role": "teacher",
            "department": "Computer Science",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": "user_admin1",
            "email": "admin@cit.edu",
            "name": "Admin User",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for user in users:
        try:
            existing = db.find_user_by_email(user["email"])
            if not existing:
                db.create_user(user)
                print(f"  ✅ Created user: {user['name']}")
            else:
                print(f"  ⏭️ User exists: {user['name']}")
        except Exception as e:
            print(f"  ❌ Error creating user {user['name']}: {e}")
    
    # Create sample moments
    moments = [
        {
            "moment_id": f"moment_{uuid.uuid4().hex[:12]}",
            "user_id": "user_student1",
            "user_name": "Rahul Kumar",
            "user_department": "Computer Science",
            "moment_type": "help",
            "title": "Need help with Data Structures Assignment",
            "content": "Can anyone help me understand the implementation of AVL trees? I'm stuck on the rotation logic.",
            "tags": ["dsa", "help", "assignment"],
            "reactions": 5,
            "comments_count": 2,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
        },
        {
            "moment_id": f"moment_{uuid.uuid4().hex[:12]}",
            "user_id": "user_student2",
            "user_name": "Priya Sharma",
            "user_department": "Electronics",
            "moment_type": "campus_life",
            "title": "Amazing Cultural Fest! 🎉",
            "content": "The annual cultural fest was incredible this year! Great performances by all departments.",
            "tags": ["culturalfest", "campus", "fun"],
            "reactions": 15,
            "comments_count": 8,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()
        },
        {
            "moment_id": f"moment_{uuid.uuid4().hex[:12]}",
            "user_id": "user_student1",
            "user_name": "Rahul Kumar",
            "user_department": "Computer Science",
            "moment_type": "issue_observation",
            "title": "Water Cooler Not Working in Block A",
            "content": "The water cooler on the 2nd floor of Block A has been out of order for 3 days now. Please fix it.",
            "tags": ["infrastructure", "water", "urgent"],
            "reactions": 12,
            "comments_count": 4,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat()
        }
    ]
    
    for moment in moments:
        try:
            existing = db.find_moment(moment["moment_id"])
            if not existing:
                db.create_moment(moment)
                print(f"  ✅ Created moment: {moment['title'][:30]}...")
        except Exception as e:
            print(f"  ❌ Error creating moment: {e}")
    
    # Create sample issues
    issues = [
        {
            "issue_id": f"issue_{uuid.uuid4().hex[:12]}",
            "user_id": "user_student1",
            "user_name": "Rahul Kumar",
            "title": "Broken Bench in Library",
            "description": "The bench near the computer section in the library has a broken leg and is unsafe to sit on.",
            "category": "infrastructure",
            "location": "Central Library, Computer Section",
            "status": "reported",
            "affected_count": 8,
            "affected_users": ["user_student1", "user_student2"],
            "images": [],
            "timeline": [{
                "status": "reported",
                "message": "Issue reported",
                "user_name": "Rahul Kumar",
                "created_at": datetime.now(timezone.utc).isoformat()
            }],
            "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        },
        {
            "issue_id": f"issue_{uuid.uuid4().hex[:12]}",
            "user_id": "user_student2",
            "user_name": "Priya Sharma",
            "title": "AC Not Working in Classroom 301",
            "description": "The air conditioning in classroom 301 has not been working for a week. It's very uncomfortable during afternoon classes.",
            "category": "electrical",
            "location": "Block B, Room 301",
            "status": "in_progress",
            "affected_count": 45,
            "affected_users": ["user_student2"],
            "images": [],
            "timeline": [
                {
                    "status": "reported",
                    "message": "Issue reported",
                    "user_name": "Priya Sharma",
                    "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
                },
                {
                    "status": "in_progress",
                    "message": "Maintenance team has been notified",
                    "user_name": "Admin User",
                    "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
                }
            ],
            "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        }
    ]
    
    for issue in issues:
        try:
            db.create_issue(issue)
            print(f"  ✅ Created issue: {issue['title'][:30]}...")
        except Exception as e:
            print(f"  ❌ Error creating issue: {e}")
    
    # Create sample opportunities
    opportunities = [
        {
            "opp_id": f"opp_{uuid.uuid4().hex[:12]}",
            "user_id": "user_teacher1",
            "user_name": "Dr. Anand Verma",
            "title": "Google Summer Internship 2026",
            "description": "Google is hiring summer interns for their Bangalore office. Great opportunity for CS students!",
            "opp_type": "internship",
            "department": ["Computer Science", "Information Technology"],
            "year": [3, 4],
            "deadline": "2026-02-15",
            "link": "https://careers.google.com",
            "saved_count": 25,
            "saved_by": ["user_student1"],
            "verified": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        },
        {
            "opp_id": f"opp_{uuid.uuid4().hex[:12]}",
            "user_id": "user_student1",
            "user_name": "Rahul Kumar",
            "title": "Hackathon - Code for Change",
            "description": "24-hour hackathon focused on social impact projects. Prizes worth ₹50,000!",
            "opp_type": "event",
            "department": [],
            "year": [],
            "deadline": "2026-01-20",
            "link": "https://codeforchange.in",
            "saved_count": 18,
            "saved_by": [],
            "verified": False,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        }
    ]
    
    for opp in opportunities:
        try:
            db.create_opportunity(opp)
            print(f"  ✅ Created opportunity: {opp['title'][:30]}...")
        except Exception as e:
            print(f"  ❌ Error creating opportunity: {e}")
    
    print("\n✅ Database seeding complete!")
    print("\nYou can now login with:")
    print("  - Student: student1@cit.edu or student2@cit.edu")
    print("  - Teacher: teacher1@cit.edu")
    print("  - Admin: admin@cit.edu")


def seed_class_management():
    """Seed class management data for teacher dashboard"""
    import class_management as cm
    
    print("\n🎓 Seeding class management data...")
    
    # Initialize tables
    cm.init_class_management_tables()
    
    # Create demo classes
    classes_to_create = [
        ('CSE', 2023, 'A'),
        ('CSE', 2023, 'B'),
        ('CSE', 2024, 'A'),
        ('AIML', 2023, 'A'),
        ('AIML', 2024, 'A'),
        ('ECE', 2023, 'A'),
    ]
    
    created_classes = []
    for dept, year, section in classes_to_create:
        c = cm.get_or_create_class(dept, year, section)
        created_classes.append(c)
        print(f"  ✅ Created class: {c['class_name']}")
    
    # Assign teacher to classes
    teacher_id = "user_teacher1"
    
    # Assign to CSE 2023 A and AIML 2023 A
    for c in created_classes:
        if c['department'] in ['CSE', 'AIML'] and c['joining_year'] == 2023 and c['section'] == 'A':
            cm.assign_teacher_to_class(teacher_id, c['class_id'], is_class_teacher=True)
            print(f"  ✅ Assigned teacher to: {c['class_name']}")
    
    # Create sample students with proper email format
    sample_students = [
        ("user_cse_student1", "priya.cse2023@citchennai.net", "Priya Sharma", "A"),
        ("user_cse_student2", "rahul.cse2023@citchennai.net", "Rahul Kumar", "A"),
        ("user_cse_student3", "ananya.cse2023@citchennai.net", "Ananya Reddy", "A"),
        ("user_cse_student4", "vikram.cse2023@citchennai.net", "Vikram Singh", "A"),
        ("user_cse_student5", "sneha.cse2023@citchennai.net", "Sneha Patel", "A"),
        ("user_aiml_student1", "arjun.aiml2023@citchennai.net", "Arjun Nair", "A"),
        ("user_aiml_student2", "kavya.aiml2023@citchennai.net", "Kavya Menon", "A"),
        ("user_aiml_student3", "aditya.aiml2023@citchennai.net", "Aditya Rao", "A"),
    ]
    
    for student_id, email, name, section in sample_students:
        # Create user if not exists
        existing = db.find_user_by_email(email)
        if not existing:
            db.create_user({
                "user_id": student_id,
                "email": email,
                "name": name,
                "role": "student",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            print(f"  ✅ Created student: {name}")
        
        # Auto-classify and assign to class
        result = cm.classify_and_assign_student(student_id, email, section)
        if result:
            print(f"  ✅ Assigned {name} to {result['class']['class_name']} (Roll: {result['roll_number']})")
    
    # Create sample announcements
    cse_class = cm.get_class('CSE', 2023, 'A')
    if cse_class:
        announcements = [
            ("Mid-semester exam schedule released", "The mid-semester exams will be held from January 15-20. Please check the detailed schedule.", "high"),
            ("Project submission deadline extended", "Due to multiple requests, the project submission deadline has been extended to January 25th.", "normal"),
            ("Guest lecture on AI/ML tomorrow", "We have a guest lecture by Dr. Ramesh from IIT Madras on 'Future of AI' at 2 PM.", "important"),
        ]
        
        for title, content, priority in announcements:
            cm.create_announcement(
                class_id=cse_class['class_id'],
                teacher_id=teacher_id,
                teacher_name="Dr. Anand Verma",
                title=title,
                content=content,
                priority=priority
            )
            print(f"  ✅ Created announcement: {title[:30]}...")
    
    # Create sample polls
    if cse_class:
        polls = [
            ("Preferred time for extra class?", ["Morning (8-9 AM)", "Afternoon (2-3 PM)", "Evening (4-5 PM)"]),
            ("Topic for next workshop", ["Web Development", "Machine Learning", "Mobile App Dev"]),
        ]
        
        for question, options in polls:
            cm.create_poll(
                class_id=cse_class['class_id'],
                teacher_id=teacher_id,
                teacher_name="Dr. Anand Verma",
                question=question,
                options=options
            )
            print(f"  ✅ Created poll: {question[:30]}...")
    
    print("\n✅ Class management seeding complete!")
    print("\nTeacher Dashboard ready:")
    print("  - Login as: teacher1@cit.edu")
    print("  - Assigned classes: CSE - Year 3 - Section A, AIML - Year 3 - Section A")
    print("  - Sample students, announcements, and polls created")


if __name__ == "__main__":
    seed_database()
    seed_class_management()
