"""
Mock Data Seeder for CIT-Grievance Platform
Populates MongoDB with realistic sample data for all features
Run: python seed_mock_data.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'campus_platform')

# Avatar URLs (using DiceBear API)
def get_avatar(seed):
    return f"https://api.dicebear.com/7.x/avataaars/svg?seed={seed}"

# Mock Users
MOCK_USERS = [
    {
        "_id": str(uuid.uuid4()),
        "user_id": "user_alice_001",
        "email": "alice@campus.edu",
        "name": "Alice Johnson",
        "picture": get_avatar("alice_001"),
        "role": "student",
        "department": "Computer Science",
        "year": 3,
        "hostel": "Hostel A",
        "bio": "Passionate about web development and open source",
        "created_at": datetime.now(timezone.utc) - timedelta(days=90),
        "is_active": True
    },
    {
        "_id": str(uuid.uuid4()),
        "user_id": "user_bob_002",
        "email": "bob@campus.edu",
        "name": "Bob Smith",
        "picture": get_avatar("bob_002"),
        "role": "student",
        "department": "Electrical Engineering",
        "year": 2,
        "hostel": "Hostel B",
        "bio": "Electronics enthusiast, hackathon participant",
        "created_at": datetime.now(timezone.utc) - timedelta(days=60),
        "is_active": True
    },
    {
        "_id": str(uuid.uuid4()),
        "user_id": "user_carol_003",
        "email": "carol@campus.edu",
        "name": "Carol Davis",
        "picture": get_avatar("carol_003"),
        "role": "student",
        "department": "Business Administration",
        "year": 4,
        "hostel": "Hostel C",
        "bio": "Entrepreneurship and finance student",
        "created_at": datetime.now(timezone.utc) - timedelta(days=45),
        "is_active": True
    },
    {
        "_id": str(uuid.uuid4()),
        "user_id": "user_david_004",
        "email": "david@campus.edu",
        "name": "David Wilson",
        "picture": get_avatar("david_004"),
        "role": "student",
        "department": "Mechanical Engineering",
        "year": 1,
        "hostel": "Hostel D",
        "bio": "Robotics enthusiast, loves problem solving",
        "created_at": datetime.now(timezone.utc) - timedelta(days=30),
        "is_active": True
    },
    {
        "_id": str(uuid.uuid4()),
        "user_id": "user_emily_005",
        "email": "emily@campus.edu",
        "name": "Emily Brown",
        "picture": get_avatar("emily_005"),
        "role": "student",
        "department": "Computer Science",
        "year": 2,
        "hostel": "Hostel A",
        "bio": "Machine Learning and Data Science",
        "created_at": datetime.now(timezone.utc) - timedelta(days=20),
        "is_active": True
    },
    {
        "_id": str(uuid.uuid4()),
        "user_id": "admin_frank_006",
        "email": "frank@campus.edu",
        "name": "Frank Admin",
        "picture": get_avatar("frank_admin"),
        "role": "admin",
        "department": "Administration",
        "year": None,
        "hostel": None,
        "bio": "Campus Administrator",
        "created_at": datetime.now(timezone.utc) - timedelta(days=365),
        "is_active": True
    }
]

# Mock Moments (Community Posts)
MOCK_MOMENTS = [
    {
        "_id": str(uuid.uuid4()),
        "moment_id": "moment_001",
        "user_id": "user_alice_001",
        "user_name": "Alice Johnson",
        "user_picture": get_avatar("alice_001"),
        "user_department": "Computer Science",
        "moment_type": "help",
        "title": "Need Study Group for Data Structures",
        "content": "Hey everyone! I'm looking for people to form a study group for DSA. We can meet in the library or online. I'm preparing for technical interviews. Would be great to have 3-4 people. Please reach out!",
        "tags": ["dsa", "interview-prep", "study-group"],
        "reactions": 12,
        "comments_count": 5,
        "created_at": datetime.now(timezone.utc) - timedelta(days=3, hours=2),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=3, hours=2)
    },
    {
        "_id": str(uuid.uuid4()),
        "moment_id": "moment_002",
        "user_id": "user_bob_002",
        "user_name": "Bob Smith",
        "user_picture": get_avatar("bob_002"),
        "user_department": "Electrical Engineering",
        "moment_type": "campus_life",
        "title": "Amazing Sunset from the Rooftop!",
        "content": "Just captured the most beautiful sunset from the campus rooftop. The sky was painted in shades of orange and pink. Does anyone else love hanging out there? Great place to relax and unwind after classes.",
        "tags": ["campus", "sunset", "rooftop"],
        "reactions": 28,
        "comments_count": 8,
        "created_at": datetime.now(timezone.utc) - timedelta(days=2, hours=5),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=2, hours=5)
    },
    {
        "_id": str(uuid.uuid4()),
        "moment_id": "moment_003",
        "user_id": "user_carol_003",
        "user_name": "Carol Davis",
        "user_picture": get_avatar("carol_003"),
        "user_department": "Business Administration",
        "moment_type": "opportunity",
        "title": "Startup Pitch Competition Coming Up!",
        "content": "Exciting news! There's a startup pitch competition happening next month. Prize pool is ₹5 lakhs! If you have a business idea and want to pitch it, this is your chance. Registration closes on 31st Jan. Teams of 2-5 people. Who's interested?",
        "tags": ["startup", "competition", "entrepreneurship"],
        "reactions": 45,
        "comments_count": 12,
        "created_at": datetime.now(timezone.utc) - timedelta(days=1, hours=8),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=1, hours=8)
    },
    {
        "_id": str(uuid.uuid4()),
        "moment_id": "moment_004",
        "user_id": "user_david_004",
        "user_name": "David Wilson",
        "user_picture": get_avatar("david_004"),
        "user_department": "Mechanical Engineering",
        "moment_type": "issue_observation",
        "title": "Library WiFi Down Again",
        "content": "The WiFi in the library has been down since morning. This is the 3rd time this week. Makes it impossible to study or work on projects. Hope the IT team fixes it soon. Anyone else facing this issue?",
        "tags": ["wifi", "library", "infrastructure"],
        "reactions": 8,
        "comments_count": 6,
        "created_at": datetime.now(timezone.utc) - timedelta(hours=4),
        "updated_at": datetime.now(timezone.utc) - timedelta(hours=4)
    },
    {
        "_id": str(uuid.uuid4()),
        "moment_id": "moment_005",
        "user_id": "user_emily_005",
        "user_name": "Emily Brown",
        "user_picture": get_avatar("emily_005"),
        "user_department": "Computer Science",
        "moment_type": "help",
        "title": "ML Project Discussion - Computer Vision",
        "content": "Working on an image classification project using CNN. Has anyone worked with PyTorch or TensorFlow for computer vision? Would love to discuss approaches, best practices, and share code. Let's collaborate!",
        "tags": ["machine-learning", "pytorch", "project"],
        "reactions": 15,
        "comments_count": 4,
        "created_at": datetime.now(timezone.utc) - timedelta(hours=12),
        "updated_at": datetime.now(timezone.utc) - timedelta(hours=12)
    }
]

# Mock Issues
MOCK_ISSUES = [
    {
        "_id": str(uuid.uuid4()),
        "issue_id": "issue_001",
        "user_id": "user_alice_001",
        "user_name": "Alice Johnson",
        "user_picture": get_avatar("alice_001"),
        "title": "Water Leakage in Hostel A Room 201",
        "description": "There's a persistent water leak from the ceiling in room 201. It's been there for almost a week now. The water is dripping onto the study desk, making it impossible to keep things dry. Please send maintenance urgently.",
        "category": "hostel",
        "location": "Hostel A, Room 201",
        "status": "in_progress",
        "priority": "high",
        "affected_count": 4,
        "verification_count": 3,
        "comments_count": 2,
        "resolution_notes": "Maintenance team is aware. Waiting for parts to arrive.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=7),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=1)
    },
    {
        "_id": str(uuid.uuid4()),
        "issue_id": "issue_002",
        "user_id": "user_david_004",
        "user_name": "David Wilson",
        "user_picture": get_avatar("david_004"),
        "title": "Broken Water Cooler Outside Cafeteria",
        "description": "The water cooler near the main cafeteria is not dispensing water. It's been broken for 2 days. Students have to walk to the other side of campus to get drinking water. Please fix ASAP.",
        "category": "amenities",
        "location": "Cafeteria, Main Building",
        "status": "acknowledged",
        "priority": "medium",
        "affected_count": 18,
        "verification_count": 12,
        "comments_count": 3,
        "resolution_notes": None,
        "created_at": datetime.now(timezone.utc) - timedelta(days=5),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=2)
    },
    {
        "_id": str(uuid.uuid4()),
        "issue_id": "issue_003",
        "user_id": "user_bob_002",
        "user_name": "Bob Smith",
        "user_picture": get_avatar("bob_002"),
        "title": "No Seating in Library Study Area",
        "description": "The library has been extremely crowded during peak hours (10 AM - 4 PM). There's no seating available for students. Some students are even studying on the floor. We need more study desks or tables.",
        "category": "academic",
        "location": "Central Library, 2nd Floor",
        "status": "reported",
        "priority": "medium",
        "affected_count": 45,
        "verification_count": 28,
        "comments_count": 7,
        "resolution_notes": None,
        "created_at": datetime.now(timezone.utc) - timedelta(days=3),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=3)
    },
    {
        "_id": str(uuid.uuid4()),
        "issue_id": "issue_004",
        "user_id": "user_emily_005",
        "user_name": "Emily Brown",
        "user_picture": get_avatar("emily_005"),
        "title": "Lab Equipment Not Working",
        "description": "The oscilloscopes in the Electronics lab are not functioning properly. We have a practical exam next week and need them for preparation. Can someone check and fix them?",
        "category": "academic",
        "location": "Electronics Lab, Engineering Block",
        "status": "resolved",
        "priority": "high",
        "affected_count": 12,
        "verification_count": 8,
        "comments_count": 1,
        "resolution_notes": "Equipment has been repaired and tested. Lab is ready for use.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=2)
    },
    {
        "_id": str(uuid.uuid4()),
        "issue_id": "issue_005",
        "user_id": "user_carol_003",
        "user_name": "Carol Davis",
        "user_picture": get_avatar("carol_003"),
        "title": "Poor Lighting in Hostel Corridors",
        "description": "The hallways in Hostel C are very dark at night. Some bulbs are burnt out and haven't been replaced. It's become a safety concern for students moving around after 8 PM. Please replace the bulbs urgently.",
        "category": "safety",
        "location": "Hostel C, All Corridors",
        "status": "acknowledged",
        "priority": "high",
        "affected_count": 22,
        "verification_count": 15,
        "comments_count": 4,
        "resolution_notes": None,
        "created_at": datetime.now(timezone.utc) - timedelta(days=6),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=2)
    }
]

# Mock Opportunities
MOCK_OPPORTUNITIES = [
    {
        "_id": str(uuid.uuid4()),
        "opp_id": "opp_001",
        "admin_id": "admin_frank_006",
        "title": "Summer Internship - Google India",
        "description": "Google is offering summer internship positions for students in Computer Science and related fields. Work on real-world projects with experienced engineers. Competitive stipend. Located in Bangalore.",
        "opp_type": "internship",
        "organization": "Google",
        "location": "Bangalore, India",
        "duration": "3 months",
        "stipend": "₹50,000 - 80,000 per month",
        "requirements": ["Data Structures", "Algorithms", "Problem Solving", "Any Programming Language"],
        "deadline": datetime.now(timezone.utc) + timedelta(days=35),
        "link": "https://careers.google.com/",
        "saved_count": 145,
        "comments_count": 8,
        "created_at": datetime.now(timezone.utc) - timedelta(days=15),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=15)
    },
    {
        "_id": str(uuid.uuid4()),
        "opp_id": "opp_002",
        "admin_id": "admin_frank_006",
        "title": "Merit Scholarship - Fully Funded",
        "description": "Merit-based scholarship covering full tuition fees and monthly stipend for academically excellent students. GPA requirement: 3.8+. Limited slots available. Application includes essay and interview.",
        "opp_type": "scholarship",
        "organization": "Campus Excellence Fund",
        "location": "On Campus",
        "duration": "1 Year",
        "stipend": "₹2,00,000 (covers tuition + monthly ₹15,000)",
        "requirements": ["GPA 3.8+", "Essay", "Interview"],
        "deadline": datetime.now(timezone.utc) + timedelta(days=20),
        "link": "https://scholarships.example.com/apply",
        "saved_count": 89,
        "comments_count": 5,
        "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=10)
    },
    {
        "_id": str(uuid.uuid4()),
        "opp_id": "opp_003",
        "admin_id": "admin_frank_006",
        "title": "Web Development Workshop - React & Node.js",
        "description": "Free workshop on modern web development. Learn React for frontend and Node.js for backend. Hands-on coding session. Limited seats - 30 students. Certificate upon completion. Register by Jan 15.",
        "opp_type": "workshop",
        "organization": "Tech Club, Campus",
        "location": "Computer Lab, Main Building",
        "duration": "2 days (Jan 20-21)",
        "stipend": "Free",
        "requirements": ["Basic JavaScript knowledge", "Laptop"],
        "deadline": datetime.now(timezone.utc) + timedelta(days=9),
        "link": "https://techclub.campus.edu/workshops",
        "saved_count": 67,
        "comments_count": 12,
        "created_at": datetime.now(timezone.utc) - timedelta(days=5),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=5)
    },
    {
        "_id": str(uuid.uuid4()),
        "opp_id": "opp_004",
        "admin_id": "admin_frank_006",
        "title": "Machine Learning Fellowship - Tech Startup",
        "description": "Paid fellowship for students interested in AI/ML. Work on real machine learning projects with a growing tech startup. Mentorship from experienced ML engineers. 6-month program starting Feb 1.",
        "opp_type": "internship",
        "organization": "TechStartup Labs",
        "location": "Bangalore, Remote Option",
        "duration": "6 months",
        "stipend": "₹40,000 per month",
        "requirements": ["Python", "Machine Learning", "Linear Algebra", "Portfolio"],
        "deadline": datetime.now(timezone.utc) + timedelta(days=25),
        "link": "https://techstartuplabs.com/careers",
        "saved_count": 102,
        "comments_count": 6,
        "created_at": datetime.now(timezone.utc) - timedelta(days=8),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=8)
    },
    {
        "_id": str(uuid.uuid4()),
        "opp_id": "opp_005",
        "admin_id": "admin_frank_006",
        "title": "Research Grant - Student Projects",
        "description": "Funding available for innovative student research projects. Up to ₹50,000 per project. Focus areas: Sustainability, Healthcare, Education. Proposal deadline: Jan 31. Quarterly milestones required.",
        "opp_type": "resource",
        "organization": "Campus Research Committee",
        "location": "On Campus",
        "duration": "6 months",
        "stipend": "Up to ₹50,000",
        "requirements": ["Research Proposal", "Faculty Mentor", "Team of 2-3"],
        "deadline": datetime.now(timezone.utc) + timedelta(days=25),
        "link": "https://research.campus.edu/apply",
        "saved_count": 45,
        "comments_count": 3,
        "created_at": datetime.now(timezone.utc) - timedelta(days=12),
        "updated_at": datetime.now(timezone.utc) - timedelta(days=12)
    }
]

# Mock Comments
MOCK_COMMENTS = [
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_001",
        "entity_type": "moment",
        "entity_id": "moment_001",
        "user_id": "user_bob_002",
        "user_name": "Bob Smith",
        "user_picture": get_avatar("bob_002"),
        "text": "I'm interested! I'm also preparing for interviews. Let's connect on WhatsApp.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=2, hours=20)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_002",
        "entity_type": "moment",
        "entity_id": "moment_001",
        "user_id": "user_emily_005",
        "user_name": "Emily Brown",
        "user_picture": get_avatar("emily_005"),
        "text": "Great initiative! Count me in. We can meet in the library tomorrow at 3 PM?",
        "created_at": datetime.now(timezone.utc) - timedelta(days=2, hours=18)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_003",
        "entity_type": "moment",
        "entity_id": "moment_002",
        "user_id": "user_carol_003",
        "user_name": "Carol Davis",
        "user_picture": get_avatar("carol_003"),
        "text": "Stunning! The campus has such beautiful views. Nature is healing.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=1, hours=22)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_004",
        "entity_type": "moment",
        "entity_id": "moment_003",
        "user_id": "user_alice_001",
        "user_name": "Alice Johnson",
        "user_picture": get_avatar("alice_001"),
        "text": "This sounds amazing! My team is working on an EdTech solution. We should definitely pitch it!",
        "created_at": datetime.now(timezone.utc) - timedelta(hours=16)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_005",
        "entity_type": "moment",
        "entity_id": "moment_004",
        "user_id": "user_carol_003",
        "user_name": "Carol Davis",
        "user_picture": get_avatar("carol_003"),
        "text": "Yes! It's affecting the entire library. I had to move to the cafe just to get WiFi today.",
        "created_at": datetime.now(timezone.utc) - timedelta(hours=2)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_006",
        "entity_type": "issue",
        "entity_id": "issue_001",
        "user_id": "user_bob_002",
        "user_name": "Bob Smith",
        "user_picture": get_avatar("bob_002"),
        "text": "I'm in room 203 and experiencing the same issue! Please escalate this to the hostel warden.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=6)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_007",
        "entity_type": "issue",
        "entity_id": "issue_002",
        "user_id": "user_emily_005",
        "user_name": "Emily Brown",
        "user_picture": get_avatar("emily_005"),
        "text": "This is affecting my work-outs too. I rely on that cooler after gym sessions.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=4)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_008",
        "entity_type": "issue",
        "entity_id": "issue_001",
        "user_id": "user_carol_003",
        "user_name": "Carol Davis",
        "user_picture": get_avatar("carol_003"),
        "text": "We need this fixed ASAP. The maintenance team promised to look into it last week.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=5)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_009",
        "entity_type": "issue",
        "entity_id": "issue_003",
        "user_id": "user_david_004",
        "user_name": "David Wilson",
        "user_picture": get_avatar("david_004"),
        "text": "Yes, during evening hours it's impossible to find a table. Maybe they can add more desks?",
        "created_at": datetime.now(timezone.utc) - timedelta(days=2)
    },
    {
        "_id": str(uuid.uuid4()),
        "comment_id": "comment_010",
        "entity_type": "issue",
        "entity_id": "issue_005",
        "user_id": "user_bob_002",
        "user_name": "Bob Smith",
        "user_picture": get_avatar("bob_002"),
        "text": "Safety should be the priority. I've reported this to the hostel office.",
        "created_at": datetime.now(timezone.utc) - timedelta(days=4)
    }
]

# Mock Affected Records (Issue Upvotes/Verification)
MOCK_ISSUE_AFFECTED = [
    {"issue_id": "issue_001", "user_id": "user_bob_002", "created_at": datetime.now(timezone.utc) - timedelta(days=5)},
    {"issue_id": "issue_001", "user_id": "user_carol_003", "created_at": datetime.now(timezone.utc) - timedelta(days=4)},
    {"issue_id": "issue_001", "user_id": "user_david_004", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
    {"issue_id": "issue_002", "user_id": "user_alice_001", "created_at": datetime.now(timezone.utc) - timedelta(days=5)},
    {"issue_id": "issue_002", "user_id": "user_bob_002", "created_at": datetime.now(timezone.utc) - timedelta(days=5)},
    {"issue_id": "issue_002", "user_id": "user_carol_003", "created_at": datetime.now(timezone.utc) - timedelta(days=4)},
    {"issue_id": "issue_002", "user_id": "user_david_004", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
    {"issue_id": "issue_002", "user_id": "user_emily_005", "created_at": datetime.now(timezone.utc) - timedelta(days=2)},
    {"issue_id": "issue_003", "user_id": "user_alice_001", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
    {"issue_id": "issue_003", "user_id": "user_bob_002", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
    {"issue_id": "issue_003", "user_id": "user_carol_003", "created_at": datetime.now(timezone.utc) - timedelta(days=2)},
    {"issue_id": "issue_005", "user_id": "user_alice_001", "created_at": datetime.now(timezone.utc) - timedelta(days=5)},
    {"issue_id": "issue_005", "user_id": "user_bob_002", "created_at": datetime.now(timezone.utc) - timedelta(days=4)},
    {"issue_id": "issue_005", "user_id": "user_emily_005", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
]

# Mock Opportunity Saves
MOCK_OPPORTUNITY_SAVES = [
    {"opp_id": "opp_001", "user_id": "user_alice_001", "created_at": datetime.now(timezone.utc) - timedelta(days=14)},
    {"opp_id": "opp_001", "user_id": "user_bob_002", "created_at": datetime.now(timezone.utc) - timedelta(days=12)},
    {"opp_id": "opp_001", "user_id": "user_emily_005", "created_at": datetime.now(timezone.utc) - timedelta(days=10)},
    {"opp_id": "opp_002", "user_id": "user_carol_003", "created_at": datetime.now(timezone.utc) - timedelta(days=9)},
    {"opp_id": "opp_002", "user_id": "user_alice_001", "created_at": datetime.now(timezone.utc) - timedelta(days=8)},
    {"opp_id": "opp_003", "user_id": "user_david_004", "created_at": datetime.now(timezone.utc) - timedelta(days=4)},
    {"opp_id": "opp_003", "user_id": "user_emily_005", "created_at": datetime.now(timezone.utc) - timedelta(days=3)},
    {"opp_id": "opp_004", "user_id": "user_emily_005", "created_at": datetime.now(timezone.utc) - timedelta(days=7)},
    {"opp_id": "opp_004", "user_id": "user_alice_001", "created_at": datetime.now(timezone.utc) - timedelta(days=6)},
    {"opp_id": "opp_005", "user_id": "user_carol_003", "created_at": datetime.now(timezone.utc) - timedelta(days=11)},
]

async def seed_database():
    """Seed MongoDB with mock data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        print(f"🔗 Connecting to MongoDB: {MONGO_URL}")
        print(f"📊 Database: {DB_NAME}")
        
        # Clear existing collections
        collections = await db.list_collection_names()
        for collection in collections:
            await db[collection].delete_many({})
            print(f"✅ Cleared collection: {collection}")
        
        # Seed users
        await db.users.insert_many(MOCK_USERS)
        print(f"✅ Inserted {len(MOCK_USERS)} users")
        
        # Seed moments
        await db.moments.insert_many(MOCK_MOMENTS)
        print(f"✅ Inserted {len(MOCK_MOMENTS)} moments (community posts)")
        
        # Seed issues
        await db.issues.insert_many(MOCK_ISSUES)
        print(f"✅ Inserted {len(MOCK_ISSUES)} issues")
        
        # Seed opportunities
        await db.opportunities.insert_many(MOCK_OPPORTUNITIES)
        print(f"✅ Inserted {len(MOCK_OPPORTUNITIES)} opportunities")
        
        # Seed comments
        await db.comments.insert_many(MOCK_COMMENTS)
        print(f"✅ Inserted {len(MOCK_COMMENTS)} comments")
        
        # Seed issue affected records
        await db.issue_affected.insert_many(MOCK_ISSUE_AFFECTED)
        print(f"✅ Inserted {len(MOCK_ISSUE_AFFECTED)} issue affected records")
        
        # Seed opportunity saves
        await db.opportunity_saves.insert_many(MOCK_OPPORTUNITY_SAVES)
        print(f"✅ Inserted {len(MOCK_OPPORTUNITY_SAVES)} opportunity saves")
        
        print("\n✨ Mock data seeding completed successfully!")
        print("\n📊 Database Summary:")
        print(f"   • Users: {len(MOCK_USERS)}")
        print(f"   • Community Posts: {len(MOCK_MOMENTS)}")
        print(f"   • Issues: {len(MOCK_ISSUES)}")
        print(f"   • Opportunities: {len(MOCK_OPPORTUNITIES)}")
        print(f"   • Comments: {len(MOCK_COMMENTS)}")
        print(f"   • Issue Upvotes: {len(MOCK_ISSUE_AFFECTED)}")
        print(f"   • Saved Opportunities: {len(MOCK_OPPORTUNITY_SAVES)}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
