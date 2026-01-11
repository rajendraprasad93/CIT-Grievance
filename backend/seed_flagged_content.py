"""
Seed script to add mock flagged content for testing admin moderation features
Run this to populate the flagged_content table with test data
"""

import database as db
from datetime import datetime, timezone, timedelta
import uuid

def seed_flagged_content():
    """Add mock flagged content for testing"""
    
    print("🌱 Seeding flagged content for moderation testing...")
    
    # Sample flagged posts
    flagged_posts = [
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "moment_abc123",
            "post_type": "moment",
            "content": "This professor is absolutely useless and should be fired immediately. Worst teaching ever seen in this college. Complete waste of time attending these lectures.",
            "author_id": "user_123",
            "author_name": "Anonymous Student",
            "author_role": "student",
            "classroom": "CSE - Section A",
            "department": "CSE",
            "risk_category": "harassment",
            "risk_severity": "high",
            "confidence_score": 0.89,
            "ai_reasoning": "Content contains personal attacks and derogatory language targeting faculty. High confidence of harassment based on aggressive tone and calls for termination.",
            "status": "pending",
            "flagged_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            "interactions_likes": 12,
            "interactions_comments": 8
        },
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "moment_def456",
            "post_type": "moment",
            "content": "Feeling so overwhelmed with everything. Sometimes I wonder if it's even worth continuing. The pressure is just too much to handle anymore.",
            "author_id": "user_456",
            "author_name": "Priya Sharma",
            "author_role": "student",
            "classroom": "ECE - Section B",
            "department": "ECE",
            "risk_category": "self_harm",
            "risk_severity": "critical",
            "confidence_score": 0.76,
            "ai_reasoning": "Content indicates potential mental health concerns with phrases suggesting hopelessness. Flagged for immediate review due to self-harm indicators.",
            "status": "pending",
            "flagged_at": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat(),
            "interactions_likes": 3,
            "interactions_comments": 15
        },
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "comment_ghi789",
            "post_type": "comment",
            "content": "Students from that state are always like this. They don't belong here and should go back where they came from.",
            "author_id": "user_789",
            "author_name": "Rahul V",
            "author_role": "student",
            "classroom": "Mechanical - Section A",
            "department": "Mechanical",
            "risk_category": "hate_speech",
            "risk_severity": "critical",
            "confidence_score": 0.94,
            "ai_reasoning": "Content contains discriminatory language targeting regional identity. Clear violation of community guidelines regarding hate speech.",
            "status": "pending",
            "flagged_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat(),
            "interactions_likes": 2,
            "interactions_comments": 4
        },
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "moment_jkl012",
            "post_type": "moment",
            "content": "Heard from a friend that the exam paper was leaked. Everyone in Section B already has the questions. This is so unfair!",
            "author_id": "user_012",
            "author_name": "Vikram Singh",
            "author_role": "student",
            "classroom": "CSE - Section C",
            "department": "CSE",
            "risk_category": "misinformation",
            "risk_severity": "medium",
            "confidence_score": 0.71,
            "ai_reasoning": "Unverified claim about exam paper leak spreading rapidly. Could cause panic and unfair accusations. Flagged as potential misinformation.",
            "status": "reviewed",
            "reviewed_by": "Admin User",
            "reviewed_at": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
            "flagged_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            "interactions_likes": 45,
            "interactions_comments": 32
        },
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "moment_mno345",
            "post_type": "moment",
            "content": "That guy in our class is such a loser. Nobody should talk to him. Let's make sure he knows he's not welcome in our group.",
            "author_id": "user_345",
            "author_name": "Sneha P",
            "author_role": "student",
            "classroom": "IT - Section A",
            "department": "IT",
            "risk_category": "bullying",
            "risk_severity": "high",
            "confidence_score": 0.88,
            "ai_reasoning": "Content promotes social exclusion and contains derogatory language targeting an individual. Clear indicators of bullying behavior.",
            "status": "pending",
            "flagged_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat(),
            "interactions_likes": 8,
            "interactions_comments": 6
        },
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "announcement_pqr678",
            "post_type": "announcement",
            "content": "Important: All students must pay Rs. 5000 to my personal account for lab equipment. This is mandatory and must be done by tomorrow.",
            "author_id": "user_678",
            "author_name": "Dr. Kumar (Unverified)",
            "author_role": "teacher",
            "classroom": "Civil - Section B",
            "department": "Civil",
            "risk_category": "policy_violation",
            "risk_severity": "high",
            "confidence_score": 0.92,
            "ai_reasoning": "Suspicious financial request to personal account. Potential impersonation or policy violation. Requires immediate verification.",
            "status": "removed",
            "reviewed_by": "Admin User",
            "reviewed_at": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
            "flagged_at": (datetime.now(timezone.utc) - timedelta(days=1, hours=6)).isoformat(),
            "interactions_likes": 1,
            "interactions_comments": 12
        },
        {
            "flag_id": f"flag_{uuid.uuid4().hex[:12]}",
            "post_id": "moment_stu901",
            "post_type": "moment",
            "content": "Check out this amazing offer! Get free iPhone by clicking this link: bit.ly/totally-not-scam. Limited time only!",
            "author_id": "user_901",
            "author_name": "Spam Bot",
            "author_role": "student",
            "classroom": None,
            "department": "CSE",
            "risk_category": "spam",
            "risk_severity": "low",
            "confidence_score": 0.98,
            "ai_reasoning": "Clear spam content with suspicious link and typical scam language patterns. High confidence spam detection.",
            "status": "approved",
            "reviewed_by": "Admin User",
            "reviewed_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            "flagged_at": (datetime.now(timezone.utc) - timedelta(hours=10)).isoformat(),
            "interactions_likes": 0,
            "interactions_comments": 1
        }
    ]
    
    # Insert flagged content
    for post in flagged_posts:
        try:
            db.create_flagged_content(post)
            print(f"✅ Created flagged content: {post['flag_id']} ({post['risk_category']} - {post['risk_severity']})")
        except Exception as e:
            print(f"❌ Error creating flagged content {post['flag_id']}: {e}")
    
    # Create some moderation log entries for the reviewed/removed posts
    moderation_logs = [
        {
            "log_id": f"modlog_{uuid.uuid4().hex[:12]}",
            "flag_id": [p['flag_id'] for p in flagged_posts if p['post_id'] == 'moment_jkl012'][0],
            "post_id": "moment_jkl012",
            "action": "reviewed",
            "admin_id": "admin_001",
            "admin_name": "Admin User",
            "reason": "Marked for monitoring - investigating claim",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        },
        {
            "log_id": f"modlog_{uuid.uuid4().hex[:12]}",
            "flag_id": [p['flag_id'] for p in flagged_posts if p['post_id'] == 'announcement_pqr678'][0],
            "post_id": "announcement_pqr678",
            "action": "removed",
            "admin_id": "admin_001",
            "admin_name": "Admin User",
            "reason": "Fraudulent financial request - potential impersonation",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat()
        },
        {
            "log_id": f"modlog_{uuid.uuid4().hex[:12]}",
            "flag_id": [p['flag_id'] for p in flagged_posts if p['post_id'] == 'moment_stu901'][0],
            "post_id": "moment_stu901",
            "action": "approved",
            "admin_id": "admin_001",
            "admin_name": "Admin User",
            "reason": "False positive - legitimate post",
            "timestamp": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
        }
    ]
    
    # Insert moderation logs
    for log in moderation_logs:
        try:
            db.create_moderation_log(log)
            print(f"✅ Created moderation log: {log['log_id']} ({log['action']})")
        except Exception as e:
            print(f"❌ Error creating moderation log {log['log_id']}: {e}")
    
    print("\n✨ Flagged content seeding complete!")
    print(f"📊 Created {len(flagged_posts)} flagged posts")
    print(f"📝 Created {len(moderation_logs)} moderation log entries")
    print("\n🧪 You can now test the admin moderation features!")
    print("   Go to: http://localhost:3000/admin → AI Moderation tab")

if __name__ == "__main__":
    seed_flagged_content()
