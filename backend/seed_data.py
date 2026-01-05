import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta
import random

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def seed_data():
    print("Seeding mock data...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.moments.delete_many({})
    await db.issues.delete_many({})
    await db.opportunities.delete_many({})
    await db.comments.delete_many({})
    
    # Create mock users
    users = [
        {
            "user_id": f"user_mock{i}",
            "email": f"student{i}@campus.edu",
            "name": name,
            "picture": f"https://i.pravatar.cc/150?u={i}",
            "role": "admin" if i == 1 else "student",
            "hostel": random.choice(["Hostel A", "Hostel B", "Hostel C", "Hostel D"]),
            "department": random.choice(["CSE", "ECE", "ME", "EEE", "Civil"]),
            "year": random.choice([1, 2, 3, 4]),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        for i, name in enumerate([
            "Admin User", "Priya Sharma", "Rohit Kumar", "Ananya Singh", "Arjun Patel",
            "Meera Reddy", "Ali Khan", "Neha Gupta", "Vikram Rao", "Shreya Iyer"
        ], 1)
    ]
    
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    # Create mock moments
    moment_types = ["help", "campus_life", "opportunity", "issue_observation"]
    moments = []
    
    moment_data = [
        {
            "type": "help",
            "title": "DBMS Revision Tonight",
            "content": "Anyone up for DBMS revision tonight in E-Block reading room? Have notes to share!",
            "tags": ["Study", "DBMS", "Hostel B"]
        },
        {
            "type": "campus_life",
            "title": "Open Mic Tonight",
            "content": "Open mic at central canteen, 6 PM. All branches welcome. Come showcase your talent!",
            "tags": ["Event", "Canteen", "Entertainment"]
        },
        {
            "type": "opportunity",
            "title": "Google STEP Internship 2026",
            "content": "Stipend internship for 2nd-year students across CS/IT. Applications close Feb 12.",
            "tags": ["Internship", "CS", "IT"]
        },
        {
            "type": "issue_observation",
            "title": "WiFi Down in Library",
            "content": "Library WiFi has been down since morning. Anyone else facing this?",
            "tags": ["Infrastructure", "Library", "WiFi"]
        },
        {
            "type": "help",
            "title": "CAD Software Tutorial Needed",
            "content": "Looking for someone to help with AutoCAD basics. Happy to exchange programming help!",
            "tags": ["Help", "CAD", "Tutorial"]
        },
        {
            "type": "campus_life",
            "title": "Basketball Match Tomorrow",
            "content": "Inter-hostel basketball finals tomorrow 4 PM at main court. Come cheer!",
            "tags": ["Sports", "Basketball", "Event"]
        }
    ]
    
    for i, data in enumerate(moment_data):
        user = random.choice(users[1:])  # Exclude admin
        moments.append({
            "moment_id": f"moment_mock{i+1}",
            "user_id": user["user_id"],
            "user_name": user["name"],
            "user_picture": user["picture"],
            "user_hostel": user["hostel"],
            "user_department": user["department"],
            "moment_type": data["type"],
            "title": data["title"],
            "content": data["content"],
            "tags": data["tags"],
            "reactions": random.randint(5, 30),
            "comments_count": random.randint(2, 10),
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 24))).isoformat()
        })
    
    await db.moments.insert_many(moments)
    print(f"Created {len(moments)} moments")
    
    # Create mock issues
    issue_data = [
        {
            "title": "No hot water in Hostel A",
            "description": "Hot water supply has been cold since morning in A-Block. All floors affected.",
            "category": "hostel",
            "location": "Hostel A - A Block",
            "status": "in_progress",
            "affected": 18
        },
        {
            "title": "Broken lights in Mess Hall",
            "description": "Three ceiling lights not working in the main mess area. Dark during evening.",
            "category": "infrastructure",
            "location": "Central Mess",
            "status": "reported",
            "affected": 12
        },
        {
            "title": "Water leakage in Room 304",
            "description": "Ceiling leaking in Hostel B Room 304 when it rains. Happened last 2 times.",
            "category": "hostel",
            "location": "Hostel B - 3rd Floor",
            "status": "acknowledged",
            "affected": 3
        },
        {
            "title": "Library AC not cooling",
            "description": "AC in library reference section barely working. Too hot to study in afternoons.",
            "category": "infrastructure",
            "location": "Library - Reference Section",
            "status": "resolved",
            "affected": 25
        },
        {
            "title": "Potholes near Gate 2",
            "description": "Large potholes formed near main Gate 2 after rain. Dangerous for two-wheelers.",
            "category": "safety",
            "location": "Near Gate 2",
            "status": "reported",
            "affected": 15
        }
    ]
    
    issues = []
    for i, data in enumerate(issue_data):
        user = random.choice(users[1:])
        issue_id = f"issue_mock{i+1}"
        
        status_messages = {
            "reported": "Issue reported",
            "acknowledged": "Issue received and assigned to maintenance team",
            "in_progress": "Maintenance team is working on it",
            "resolved": "Issue has been fixed"
        }
        
        timeline = [
            {
                "status": "reported",
                "message": "Issue reported",
                "user_name": user["name"],
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(6, 48))).isoformat()
            }
        ]
        
        if data["status"] in ["acknowledged", "in_progress", "resolved"]:
            timeline.append({
                "status": "acknowledged",
                "message": "Issue received. Maintenance team alerted.",
                "user_name": "Hostel Office",
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(3, 24))).isoformat()
            })
        
        if data["status"] in ["in_progress", "resolved"]:
            timeline.append({
                "status": "in_progress",
                "message": "Maintenance team is working on it. ETA: 6 hours.",
                "user_name": "Maintenance",
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 12))).isoformat()
            })
        
        if data["status"] == "resolved":
            timeline.append({
                "status": "resolved",
                "message": "Issue fixed and verified.",
                "user_name": "Hostel Office",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        issues.append({
            "issue_id": issue_id,
            "user_id": user["user_id"],
            "user_name": user["name"],
            "title": data["title"],
            "description": data["description"],
            "category": data["category"],
            "location": data["location"],
            "status": data["status"],
            "affected_count": data["affected"],
            "affected_users": [f"user_mock{j}" for j in range(2, 2 + data["affected"])],
            "images": [],
            "timeline": timeline,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(6, 72))).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    await db.issues.insert_many(issues)
    print(f"Created {len(issues)} issues")
    
    # Create mock opportunities
    opp_data = [
        {
            "title": "Google STEP Internship 2026",
            "description": "Software engineering internship for 2nd-year CS/IT students. Paid stipend, online assessment + 2 rounds of interviews.",
            "type": "internship",
            "department": ["CSE", "IT"],
            "year": [2],
            "deadline": "2026-02-12",
            "link": "https://careers.google.com/step",
            "verified": True
        },
        {
            "title": "National Merit Scholarship",
            "description": "Merit-based scholarship for students with CGPA > 8.5. Covers full tuition for one semester.",
            "type": "scholarship",
            "department": ["CSE", "ECE", "EEE", "ME", "Civil"],
            "year": [2, 3, 4],
            "deadline": "2026-02-28",
            "link": "https://scholarships.gov.in/nms",
            "verified": True
        },
        {
            "title": "Amazon ML Summer School",
            "description": "Free 4-week machine learning program. For 3rd/4th year students. Remote sessions with AWS credits.",
            "type": "workshop",
            "department": ["CSE", "ECE", "IT"],
            "year": [3, 4],
            "deadline": "2026-03-15",
            "link": "https://amazon.science/mlss",
            "verified": False
        },
        {
            "title": "Startup Internship - TechVenture",
            "description": "Full-stack development role at local startup. Flexible hours, learn fast-paced environment.",
            "type": "internship",
            "department": ["CSE", "IT"],
            "year": [2, 3],
            "deadline": "2026-02-20",
            "link": "https://techventure.io/careers",
            "verified": False
        }
    ]
    
    opportunities = []
    for i, data in enumerate(opp_data):
        user = random.choice(users[1:])
        opportunities.append({
            "opp_id": f"opp_mock{i+1}",
            "user_id": user["user_id"],
            "user_name": user["name"],
            "title": data["title"],
            "description": data["description"],
            "opp_type": data["type"],
            "department": data["department"],
            "year": data["year"],
            "deadline": data["deadline"],
            "link": data["link"],
            "saved_count": random.randint(10, 50),
            "saved_by": [f"user_mock{j}" for j in range(2, 2 + random.randint(10, 30))],
            "verified": data["verified"],
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7))).isoformat()
        })
    
    await db.opportunities.insert_many(opportunities)
    print(f"Created {len(opportunities)} opportunities")
    
    print("\nMock data seeding completed!")
    print(f"\nTest user credentials:")
    print(f"Admin: admin@campus.edu (user_mock1)")
    print(f"Students: student2@campus.edu to student9@campus.edu")

if __name__ == "__main__":
    asyncio.run(seed_data())
