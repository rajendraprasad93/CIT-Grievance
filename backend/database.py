"""
SQLite Database Module
Handles all database operations with SQLite instead of MongoDB
"""

import sqlite3
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any
from contextlib import contextmanager

# Database file path
DB_PATH = Path(__file__).parent / "campus.db"

def get_connection():
    """Get a database connection with row factory"""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    """Initialize database tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                picture TEXT,
                role TEXT DEFAULT 'student',
                hostel TEXT,
                department TEXT,
                section TEXT,
                year INTEGER,
                class_info TEXT,
                is_active BOOLEAN DEFAULT 1,
                bio TEXT,
                skills TEXT DEFAULT '[]',
                interests TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Add columns if they don't exist (for existing databases)
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT')
        except sqlite3.OperationalError:
            pass  # Column already exists
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN skills TEXT DEFAULT '[]'")
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN interests TEXT DEFAULT '[]'")
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN section TEXT')
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN class_info TEXT')
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1')
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP')
        except sqlite3.OperationalError:
            pass
        
        # Also ensure the CREATE TABLE includes updated_at
        # We need to update the existing records to have updated_at values
        try:
            cursor.execute('''
                UPDATE users 
                SET updated_at = CASE 
                    WHEN updated_at IS NULL THEN created_at 
                    ELSE updated_at 
                END
            ''')
        except sqlite3.Error:
            pass
        
        # Update updated_at column for existing records
        try:
            cursor.execute('UPDATE users SET updated_at = created_at WHERE updated_at IS NULL')
        except sqlite3.Error:
            pass
        
        # User sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Moments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS moments (
                moment_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                user_picture TEXT,
                user_hostel TEXT,
                user_department TEXT,
                moment_type TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT DEFAULT '[]',
                image_url TEXT,
                reactions INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'approved',
                moderation_flag_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Issues table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS issues (
                issue_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                status TEXT DEFAULT 'reported',
                affected_count INTEGER DEFAULT 1,
                affected_users TEXT DEFAULT '[]',
                images TEXT DEFAULT '[]',
                timeline TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Opportunities table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS opportunities (
                opp_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                opp_type TEXT NOT NULL,
                department TEXT DEFAULT '[]',
                year TEXT DEFAULT '[]',
                deadline TEXT,
                link TEXT,
                saved_count INTEGER DEFAULT 0,
                saved_by TEXT DEFAULT '[]',
                verified INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Add new columns to opportunities table if they don't exist
        try:
            cursor.execute('ALTER TABLE opportunities ADD COLUMN organization TEXT DEFAULT ""')
        except sqlite3.OperationalError:
            pass  # Column already exists
        try:
            cursor.execute('ALTER TABLE opportunities ADD COLUMN location TEXT DEFAULT ""')
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE opportunities ADD COLUMN duration TEXT DEFAULT ""')
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE opportunities ADD COLUMN stipend TEXT DEFAULT ""')
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute('ALTER TABLE opportunities ADD COLUMN eligibility TEXT DEFAULT ""')
        except sqlite3.OperationalError:
            pass
        
        # Comments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                comment_id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                user_picture TEXT,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                link TEXT,
                read INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Reactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reactions (
                reaction_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                reaction_type TEXT DEFAULT 'like',
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                UNIQUE(user_id, entity_type, entity_id)
            )
        ''')
        
        # Follows table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS follows (
                follow_id TEXT PRIMARY KEY,
                follower_id TEXT NOT NULL,
                following_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (follower_id) REFERENCES users(user_id),
                FOREIGN KEY (following_id) REFERENCES users(user_id),
                UNIQUE(follower_id, following_id)
            )
        ''')
        
        # Profile views table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS profile_views (
                view_id TEXT PRIMARY KEY,
                profile_user_id TEXT NOT NULL,
                viewer_user_id TEXT NOT NULL,
                viewed_at TEXT NOT NULL,
                FOREIGN KEY (profile_user_id) REFERENCES users(user_id),
                FOREIGN KEY (viewer_user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Peer reviews table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS peer_reviews (
                review_id TEXT PRIMARY KEY,
                reviewer_id TEXT NOT NULL,
                reviewed_user_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                review_text TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
                FOREIGN KEY (reviewed_user_id) REFERENCES users(user_id)
            )
        ''')
        
        # User badges table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_badges (
                badge_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                badge_type TEXT NOT NULL,
                badge_name TEXT NOT NULL,
                badge_description TEXT,
                earned_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Audit logs table (for admin action tracking)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                log_id TEXT PRIMARY KEY,
                admin_id TEXT NOT NULL,
                admin_name TEXT NOT NULL,
                action_type TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                ip_address TEXT,
                user_agent TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (admin_id) REFERENCES users(user_id)
            )
        ''')
        
        # Flagged content table (for AI content moderation)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS flagged_content (
                flag_id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                post_type TEXT NOT NULL CHECK (post_type IN ('moment', 'comment', 'announcement', 'issue')),
                content TEXT NOT NULL,
                author_id TEXT NOT NULL,
                author_name TEXT NOT NULL,
                author_role TEXT,
                classroom TEXT,
                department TEXT,
                risk_category TEXT NOT NULL CHECK (risk_category IN ('harassment', 'hate_speech', 'self_harm', 'bullying', 'misinformation', 'policy_violation', 'spam', 'other')),
                risk_severity TEXT NOT NULL CHECK (risk_severity IN ('critical', 'high', 'medium', 'low')),
                confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
                ai_reasoning TEXT,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed', 'reviewed')),
                reviewed_by TEXT,
                reviewed_at TEXT,
                flagged_at TEXT NOT NULL,
                interactions_likes INTEGER DEFAULT 0,
                interactions_comments INTEGER DEFAULT 0,
                FOREIGN KEY (author_id) REFERENCES users(user_id)
            )
        ''')
        
        # Moderation log table (tracks all moderation actions)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS moderation_log (
                log_id TEXT PRIMARY KEY,
                flag_id TEXT NOT NULL,
                post_id TEXT NOT NULL,
                action TEXT NOT NULL CHECK (action IN ('approved', 'removed', 'reviewed', 'escalated')),
                admin_id TEXT NOT NULL,
                admin_name TEXT NOT NULL,
                reason TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (flag_id) REFERENCES flagged_content(flag_id),
                FOREIGN KEY (admin_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create system_config table for platform configuration
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_config (
                config_key TEXT PRIMARY KEY,
                config_value TEXT NOT NULL,
                config_type TEXT DEFAULT 'string',
                description TEXT,
                updated_by TEXT,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (updated_by) REFERENCES users(user_id)
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_moments_user ON moments(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_moments_type ON moments(moment_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(opp_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_reactions_entity ON reactions(entity_type, entity_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_peer_reviews_user ON peer_reviews(reviewed_user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_flagged_content_status ON flagged_content(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_flagged_content_severity ON flagged_content(risk_severity)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_flagged_content_category ON flagged_content(risk_category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_flagged_content_author ON flagged_content(author_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_moderation_log_flag ON moderation_log(flag_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_moderation_log_admin ON moderation_log(admin_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_moderation_log_timestamp ON moderation_log(timestamp)')
        
        conn.commit()
        print("[OK] Database initialized successfully")

def row_to_dict(row) -> Optional[Dict]:
    """Convert sqlite3.Row to dictionary with JSON parsing"""
    if row is None:
        return None
    
    d = dict(row)
    
    # Parse JSON fields
    json_fields = ['tags', 'affected_users', 'images', 'timeline', 'saved_by', 'skills', 'interests']
    for field in json_fields:
        if field in d and d[field]:
            try:
                d[field] = json.loads(d[field])
            except (json.JSONDecodeError, TypeError):
                pass
    
    # Convert integer fields to boolean
    if 'verified' in d:
        d['verified'] = bool(d['verified'])
    if 'read' in d:
        d['read'] = bool(d['read'])
    
    return d

def rows_to_list(rows) -> List[Dict]:
    """Convert list of sqlite3.Row to list of dictionaries"""
    return [row_to_dict(row) for row in rows]


# ============ USER OPERATIONS ============

def find_user_by_email(email: str) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        return row_to_dict(cursor.fetchone())

def find_user_by_id(user_id: str) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
        return row_to_dict(cursor.fetchone())

def create_user(user_data: Dict) -> Dict:
    with get_db() as conn:
        cursor = conn.cursor()
        # Prepare values with proper boolean conversion
        is_active_value = 1 if user_data.get('is_active', True) else 0
        
        cursor.execute('''
            INSERT INTO users (user_id, email, name, picture, role, hostel, department, section, year, class_info, is_active, bio, skills, interests, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_data['user_id'],
            user_data['email'],
            user_data['name'],
            user_data.get('picture'),
            user_data.get('role', 'student'),
            user_data.get('hostel'),
            user_data.get('department'),
            user_data.get('section'),
            user_data.get('year'),
            user_data.get('class_info'),
            is_active_value,
            user_data.get('bio'),
            user_data.get('skills', '[]'),
            user_data.get('interests', '[]'),
            user_data.get('created_at', datetime.now(timezone.utc).isoformat()),
            user_data.get('updated_at', datetime.now(timezone.utc).isoformat())
        ))
        
    # Query the user after the transaction commits
    return find_user_by_id(user_data['user_id'])

def update_user(user_id: str, updates: Dict) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        set_clauses = []
        values = []
        
        for key, value in updates.items():
            if key not in ['user_id', 'created_at']:
                # Handle boolean values for is_active
                if key == 'is_active':
                    value = 1 if value else 0
                set_clauses.append(f'{key} = ?')
                values.append(value)
        
        # Always update updated_at
        set_clauses.append('updated_at = ?')
        values.append(datetime.now(timezone.utc).isoformat())
        
        if set_clauses:
            values.append(user_id)
            cursor.execute(f'''
                UPDATE users SET {', '.join(set_clauses)} WHERE user_id = ?
            ''', values)
        
    # Query the user after the transaction commits
    return find_user_by_id(user_id)


# ============ ADMIN USER MANAGEMENT ============

def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict]:
    """Get all users with optional filtering (admin only)"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = 'SELECT * FROM users WHERE 1=1'
        params = []
        
        if role:
            query += ' AND role = ?'
            params.append(role)
        
        if search:
            search_term = f'%{search}%'
            query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)'
            params.extend([search_term, search_term, search_term])
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        return rows_to_list(cursor.fetchall())


def get_user_count(role: Optional[str] = None) -> int:
    """Get total user count"""
    with get_db() as conn:
        cursor = conn.cursor()
        if role:
            cursor.execute('SELECT COUNT(*) FROM users WHERE role = ?', (role,))
        else:
            cursor.execute('SELECT COUNT(*) FROM users')
        return cursor.fetchone()[0]


def get_admin_user_stats() -> Dict:
    """Get user statistics for admin dashboard"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get counts by role
        cursor.execute('''
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
        ''')
        role_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get total count
        cursor.execute('SELECT COUNT(*) FROM users')
        total = cursor.fetchone()[0]
        
        # Get recent users (last 7 days)
        from datetime import datetime, timezone, timedelta
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        cursor.execute('SELECT COUNT(*) FROM users WHERE created_at > ?', (seven_days_ago,))
        recent = cursor.fetchone()[0]
        
        return {
            "total_users": total,
            "by_role": role_counts,
            "recent_users": recent,
            "students": role_counts.get('student', 0),
            "faculty": role_counts.get('faculty', 0),
            "admin": role_counts.get('admin', 0)
        }


def update_user_role(user_id: str, new_role: str) -> Optional[Dict]:
    """Update user role (admin only)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET role = ? WHERE user_id = ?', (new_role, user_id))
        conn.commit()
        
        if cursor.rowcount > 0:
            return find_user_by_id(user_id)
        return None


def update_user_status(user_id: str, is_active: bool) -> Optional[Dict]:
    """Update user active status (admin only)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET is_active = ? WHERE user_id = ?', (1 if is_active else 0, user_id))
        conn.commit()
        
        if cursor.rowcount > 0:
            return find_user_by_id(user_id)
        return None


# ============ ANALYTICS & STATISTICS ============

def get_platform_stats() -> Dict:
    """Get comprehensive platform statistics for admin dashboard"""
    with get_db() as conn:
        cursor = conn.cursor()
        from datetime import datetime, timezone, timedelta
        
        # Get total users
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        
        # Get total issues
        cursor.execute('SELECT COUNT(*) FROM issues')
        total_issues = cursor.fetchone()[0]
        
        # Get issues by status
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM issues
            GROUP BY status
        ''')
        issues_by_status = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get total moments
        cursor.execute('SELECT COUNT(*) FROM moments')
        total_moments = cursor.fetchone()[0]
        
        # Get total opportunities
        cursor.execute('SELECT COUNT(*) FROM opportunities')
        total_opportunities = cursor.fetchone()[0]
        
        # Get total comments
        cursor.execute('SELECT COUNT(*) FROM comments')
        total_comments = cursor.fetchone()[0]
        
        # Get total reactions
        cursor.execute('SELECT COUNT(*) FROM reactions')
        total_reactions = cursor.fetchone()[0]
        
        # Get user stats (reuse existing function)
        user_stats = get_admin_user_stats()
        
        # Get moderation stats (reuse existing function)
        moderation_stats = get_moderation_stats()
        
        # Calculate pending vs resolved issues
        pending = issues_by_status.get('reported', 0) + issues_by_status.get('acknowledged', 0) + issues_by_status.get('in_progress', 0)
        resolved = issues_by_status.get('resolved', 0)
        
        return {
            "platform": {
                "total_users": total_users,
                "total_issues": total_issues,
                "total_moments": total_moments,
                "total_opportunities": total_opportunities,
                "total_comments": total_comments,
                "total_reactions": total_reactions
            },
            "issues": {
                "total": total_issues,
                "by_status": issues_by_status,
                "pending": pending,
                "resolved": resolved
            },
            "users": user_stats,
            "moderation": moderation_stats,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }


def get_content_stats() -> Dict:
    """Get content statistics broken down by type and category"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get total issues
        cursor.execute('SELECT COUNT(*) FROM issues')
        total_issues = cursor.fetchone()[0]
        
        # Get issues by status
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM issues
            GROUP BY status
        ''')
        issues_by_status = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get issues by category
        cursor.execute('''
            SELECT category, COUNT(*) as count
            FROM issues
            GROUP BY category
        ''')
        issues_by_category = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get total moments
        cursor.execute('SELECT COUNT(*) FROM moments')
        total_moments = cursor.fetchone()[0]
        
        # Get moments by category
        cursor.execute('''
            SELECT category, COUNT(*) as count
            FROM moments
            GROUP BY category
        ''')
        moments_by_category = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get total opportunities
        cursor.execute('SELECT COUNT(*) FROM opportunities')
        total_opportunities = cursor.fetchone()[0]
        
        # Get opportunities by type
        cursor.execute('''
            SELECT opp_type, COUNT(*) as count
            FROM opportunities
            GROUP BY opp_type
        ''')
        opportunities_by_type = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get engagement metrics
        cursor.execute('SELECT COUNT(*) FROM comments')
        total_comments = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM reactions')
        total_reactions = cursor.fetchone()[0]
        
        # Calculate average comments per post
        total_posts = total_issues + total_moments + total_opportunities
        avg_comments_per_post = round(total_comments / total_posts, 2) if total_posts > 0 else 0
        
        return {
            "issues": {
                "total": total_issues,
                "by_status": issues_by_status,
                "by_category": issues_by_category
            },
            "moments": {
                "total": total_moments,
                "by_category": moments_by_category
            },
            "opportunities": {
                "total": total_opportunities,
                "by_type": opportunities_by_type
            },
            "engagement": {
                "total_comments": total_comments,
                "total_reactions": total_reactions,
                "avg_comments_per_post": avg_comments_per_post
            }
        }


def get_activity_trends(days: int = 7) -> Dict:
    """Get activity trends for the last N days"""
    with get_db() as conn:
        cursor = conn.cursor()
        from datetime import datetime, timezone, timedelta
        
        # Limit days to reasonable range
        days = max(1, min(days, 90))
        
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        start_iso = start_date.isoformat()
        
        # Get daily new users
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ''', (start_iso,))
        daily_users = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get daily new issues
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM issues
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ''', (start_iso,))
        daily_issues = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get daily new moments
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM moments
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ''', (start_iso,))
        daily_moments = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get daily new opportunities
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM opportunities
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ''', (start_iso,))
        daily_opportunities = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get daily comments
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM comments
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ''', (start_iso,))
        daily_comments = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Build daily activity array
        daily_activity = []
        current_date = start_date.date()
        total_stats = {
            "new_users": 0,
            "new_issues": 0,
            "new_moments": 0,
            "new_opportunities": 0,
            "comments": 0
        }
        
        for i in range(days):
            date_str = current_date.isoformat()
            day_data = {
                "date": date_str,
                "new_users": daily_users.get(date_str, 0),
                "new_issues": daily_issues.get(date_str, 0),
                "new_moments": daily_moments.get(date_str, 0),
                "new_opportunities": daily_opportunities.get(date_str, 0),
                "comments": daily_comments.get(date_str, 0)
            }
            daily_activity.append(day_data)
            
            # Add to totals
            total_stats["new_users"] += day_data["new_users"]
            total_stats["new_issues"] += day_data["new_issues"]
            total_stats["new_moments"] += day_data["new_moments"]
            total_stats["new_opportunities"] += day_data["new_opportunities"]
            total_stats["comments"] += day_data["comments"]
            
            current_date += timedelta(days=1)
        
        # Calculate averages
        averages = {
            "users_per_day": round(total_stats["new_users"] / days, 2),
            "issues_per_day": round(total_stats["new_issues"] / days, 2),
            "moments_per_day": round(total_stats["new_moments"] / days, 2),
            "opportunities_per_day": round(total_stats["new_opportunities"] / days, 2),
            "comments_per_day": round(total_stats["comments"] / days, 2)
        }
        
        return {
            "period": {
                "days": days,
                "start_date": start_date.date().isoformat(),
                "end_date": end_date.date().isoformat()
            },
            "daily_activity": daily_activity,
            "totals": total_stats,
            "averages": averages
        }


# ============ SYSTEM CONFIGURATION ============

def get_all_config() -> List[Dict]:
    """Get all system configuration"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM system_config ORDER BY config_key')
        return rows_to_list(cursor.fetchall())


def get_config(key: str) -> Optional[Dict]:
    """Get specific configuration value"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM system_config WHERE config_key = ?', (key,))
        return row_to_dict(cursor.fetchone())


def set_config(key: str, value: str, config_type: str = "string", description: str = "", updated_by: str = "") -> Dict:
    """Set/update configuration value"""
    with get_db() as conn:
        from datetime import datetime, timezone
        cursor = conn.cursor()
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Check if config exists
        existing = get_config(key)
        
        if existing:
            # Update existing
            cursor.execute('''
                UPDATE system_config 
                SET config_value = ?, config_type = ?, description = ?, updated_by = ?, updated_at = ?
                WHERE config_key = ?
            ''', (value, config_type, description, updated_by, timestamp, key))
        else:
            # Insert new
            cursor.execute('''
                INSERT INTO system_config (config_key, config_value, config_type, description, updated_by, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (key, value, config_type, description, updated_by, timestamp))
        
        conn.commit()
        return get_config(key)


# ============ SESSION OPERATIONS ============

def find_session(session_token: str) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user_sessions WHERE session_token = ?', (session_token,))
        return row_to_dict(cursor.fetchone())

def create_session(session_data: Dict):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_sessions (user_id, session_token, expires_at, created_at)
            VALUES (?, ?, ?, ?)
        ''', (
            session_data['user_id'],
            session_data['session_token'],
            session_data['expires_at'],
            session_data.get('created_at', datetime.now(timezone.utc).isoformat())
        ))

def delete_session(session_token: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM user_sessions WHERE session_token = ?', (session_token,))


# ============ MOMENT OPERATIONS ============

def get_moments(moment_type: Optional[str] = None, limit: int = 100, include_pending: bool = False) -> List[Dict]:
    """Get moments, by default only showing approved content unless include_pending=True"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Base query - only show approved moments by default
        base_where = "status = 'approved'" if not include_pending else "1=1"
        
        if moment_type:
            cursor.execute(f'''
                SELECT * FROM moments WHERE {base_where} AND moment_type = ? 
                ORDER BY created_at DESC LIMIT ?
            ''', (moment_type, limit))
        else:
            cursor.execute(f'SELECT * FROM moments WHERE {base_where} ORDER BY created_at DESC LIMIT ?', (limit,))
        return rows_to_list(cursor.fetchall())

def update_moment_status(moment_id: str, status: str) -> Optional[Dict]:
    """Update moment status (approved, removed, pending_review)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE moments SET status = ? WHERE moment_id = ?', (status, moment_id))
        conn.commit()
        
        if cursor.rowcount > 0:
            return find_moment(moment_id)
        return None

def find_moment(moment_id: str) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM moments WHERE moment_id = ?', (moment_id,))
        return row_to_dict(cursor.fetchone())

def create_moment(moment_data: Dict) -> Dict:
    with get_db() as conn:
        cursor = conn.cursor()
        tags = json.dumps(moment_data.get('tags', []))
        cursor.execute('''
            INSERT INTO moments (moment_id, user_id, user_name, user_picture, user_hostel, 
                user_department, moment_type, title, content, tags, image_url, reactions, 
                comments_count, status, moderation_flag_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            moment_data['moment_id'],
            moment_data['user_id'],
            moment_data['user_name'],
            moment_data.get('user_picture'),
            moment_data.get('user_hostel'),
            moment_data.get('user_department'),
            moment_data['moment_type'],
            moment_data['title'],
            moment_data['content'],
            tags,
            moment_data.get('image_url'),
            moment_data.get('reactions', 0),
            moment_data.get('comments_count', 0),
            moment_data.get('status', 'pending_review'),
            moment_data.get('moderation_flag_id'),
            moment_data.get('created_at', datetime.now(timezone.utc).isoformat())
        ))
        conn.commit()
        return find_moment(moment_data['moment_id'])

def update_moment_comments_count(moment_id: str, increment: int = 1):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE moments SET comments_count = comments_count + ? WHERE moment_id = ?
        ''', (increment, moment_id))

def get_user_moments(user_id: str, limit: int = 20) -> List[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM moments WHERE user_id = ? 
            ORDER BY created_at DESC LIMIT ?
        ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())


# ============ ISSUE OPERATIONS ============

def get_issues(category: Optional[str] = None, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = 'SELECT * FROM issues WHERE 1=1'
        params = []
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        return rows_to_list(cursor.fetchall())

def get_issues_count(category: Optional[str] = None, status: Optional[str] = None) -> int:
    """Get total count of issues matching criteria"""
    with get_db() as conn:
        cursor = conn.cursor()
        query = 'SELECT COUNT(*) FROM issues WHERE 1=1'
        params = []
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        cursor.execute(query, params)
        return cursor.fetchone()[0]

def get_issues_stats() -> Dict:
    """Get comprehensive issue statistics"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Total issues
        cursor.execute('SELECT COUNT(*) FROM issues')
        total_issues = cursor.fetchone()[0]
        
        # Issues by status
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM issues
            GROUP BY status
        ''')
        by_status = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Issues by category
        cursor.execute('''
            SELECT category, COUNT(*) as count
            FROM issues
            GROUP BY category
        ''')
        by_category = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Recent issues (last 7 days)
        from datetime import datetime, timezone, timedelta
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        cursor.execute('SELECT COUNT(*) FROM issues WHERE created_at > ?', (seven_days_ago,))
        recent_issues = cursor.fetchone()[0]
        
        # Total affected users
        cursor.execute('SELECT SUM(affected_count) FROM issues')
        total_affected = cursor.fetchone()[0] or 0
        
        return {
            "total_issues": total_issues,
            "by_status": by_status,
            "by_category": by_category,
            "recent_issues": recent_issues,
            "total_affected": total_affected,
            "pending": by_status.get('reported', 0) + by_status.get('acknowledged', 0) + by_status.get('in_progress', 0),
            "resolved": by_status.get('resolved', 0)
        }

def find_issue(issue_id: str) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM issues WHERE issue_id = ?', (issue_id,))
        return row_to_dict(cursor.fetchone())

def create_issue(issue_data: Dict) -> Dict:
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO issues (issue_id, user_id, user_name, title, description, category, 
                    location, status, affected_count, affected_users, images, timeline, 
                    created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                issue_data['issue_id'],
                issue_data['user_id'],
                issue_data['user_name'],
                issue_data['title'],
                issue_data['description'],
                issue_data['category'],
                issue_data['location'],
                issue_data.get('status', 'reported'),
                issue_data.get('affected_count', 1),
                json.dumps(issue_data.get('affected_users', [])),
                json.dumps(issue_data.get('images', [])),
                json.dumps(issue_data.get('timeline', [])),
                issue_data.get('created_at', datetime.now(timezone.utc).isoformat()),
                issue_data.get('updated_at', datetime.now(timezone.utc).isoformat())
            ))
            conn.commit()
            print(f"[DB] Issue inserted: {issue_data['issue_id']}")
            
            # Fetch the created issue
            created = find_issue(issue_data['issue_id'])
            if not created:
                print(f"[DB ERROR] Issue {issue_data['issue_id']} was inserted but cannot be found!")
            else:
                print(f"[DB] Issue found after insert: {created['issue_id']}")
            return created
        except Exception as e:
            print(f"[DB ERROR] Failed to create issue: {e}")
            raise

def update_issue_affected(issue_id: str, user_id: str, add: bool = True) -> bool:
    """Add or remove user from affected list. Returns True if user is now affected."""
    issue = find_issue(issue_id)
    if not issue:
        return False
    
    affected_users = issue.get('affected_users', [])
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        if add and user_id not in affected_users:
            affected_users.append(user_id)
            cursor.execute('''
                UPDATE issues SET affected_users = ?, affected_count = affected_count + 1 
                WHERE issue_id = ?
            ''', (json.dumps(affected_users), issue_id))
            return True
        elif not add and user_id in affected_users:
            affected_users.remove(user_id)
            cursor.execute('''
                UPDATE issues SET affected_users = ?, affected_count = affected_count - 1 
                WHERE issue_id = ?
            ''', (json.dumps(affected_users), issue_id))
            return False
    
    return user_id in affected_users

def update_issue_status(issue_id: str, new_status: str, message: str, user_name: str) -> Optional[Dict]:
    issue = find_issue(issue_id)
    if not issue:
        return None
    
    timeline = issue.get('timeline', [])
    timeline.append({
        "status": new_status,
        "message": message,
        "user_name": user_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE issues SET status = ?, timeline = ?, updated_at = ? WHERE issue_id = ?
        ''', (new_status, json.dumps(timeline), datetime.now(timezone.utc).isoformat(), issue_id))
    
    return find_issue(issue_id)

def get_user_issues(user_id: str, limit: int = 10) -> List[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM issues WHERE user_id = ? 
            ORDER BY created_at DESC LIMIT ?
        ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())

def get_all_issues(status: Optional[str] = None, category: Optional[str] = None, limit: int = 10000) -> List[Dict]:
    """Get all issues with optional filtering (for admin export)"""
    return get_issues(category=category, status=status, limit=limit)

def get_issue_by_id(issue_id: str) -> Optional[Dict]:
    """Alias for find_issue (for consistency with naming conventions)"""
    return find_issue(issue_id)


# ============ OPPORTUNITY OPERATIONS ============

def get_opportunities(opp_type: Optional[str] = None, limit: int = 100) -> List[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        if opp_type:
            cursor.execute('''
                SELECT * FROM opportunities WHERE opp_type = ? 
                ORDER BY created_at DESC LIMIT ?
            ''', (opp_type, limit))
        else:
            cursor.execute('SELECT * FROM opportunities ORDER BY created_at DESC LIMIT ?', (limit,))
        return rows_to_list(cursor.fetchall())

def find_opportunity(opp_id: str) -> Optional[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM opportunities WHERE opp_id = ?', (opp_id,))
        return row_to_dict(cursor.fetchone())

def create_opportunity(opp_data: Dict) -> Dict:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO opportunities (opp_id, user_id, user_name, title, description, opp_type,
                organization, location, duration, stipend, eligibility,
                department, year, deadline, link, saved_count, saved_by, verified, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            opp_data['opp_id'],
            opp_data['user_id'],
            opp_data['user_name'],
            opp_data['title'],
            opp_data['description'],
            opp_data['opp_type'],
            opp_data.get('organization', ''),
            opp_data.get('location', ''),
            opp_data.get('duration', ''),
            opp_data.get('stipend', ''),
            opp_data.get('eligibility', ''),
            json.dumps(opp_data.get('department', [])),
            json.dumps(opp_data.get('year', [])),
            opp_data.get('deadline'),
            opp_data.get('link'),
            opp_data.get('saved_count', 0),
            json.dumps(opp_data.get('saved_by', [])),
            1 if opp_data.get('verified') else 0,
            opp_data.get('created_at', datetime.now(timezone.utc).isoformat())
        ))
        conn.commit()
        return find_opportunity(opp_data['opp_id'])

def update_opportunity(opp_id: str, updates: Dict) -> Optional[Dict]:
    """Update an opportunity"""
    with get_db() as conn:
        cursor = conn.cursor()
        set_clauses = []
        values = []
        
        # Handle JSON fields
        json_fields = ['department', 'year', 'saved_by']
        
        for key, value in updates.items():
            if key not in ['opp_id', 'created_at']:
                set_clauses.append(f'{key} = ?')
                if key in json_fields:
                    values.append(json.dumps(value) if isinstance(value, (list, dict)) else value)
                elif key == 'verified':
                    values.append(1 if value else 0)
                else:
                    values.append(value)
        
        if set_clauses:
            values.append(opp_id)
            cursor.execute(f'''
                UPDATE opportunities SET {', '.join(set_clauses)} WHERE opp_id = ?
            ''', values)
        
        return find_opportunity(opp_id)


def delete_opportunity(opp_id: str) -> bool:
    """Delete an opportunity"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM opportunities WHERE opp_id = ?', (opp_id,))
        return cursor.rowcount > 0


def update_opportunity_saved(opp_id: str, user_id: str, save: bool = True) -> bool:
    """Add or remove user from saved list. Returns True if user has now saved."""
    opp = find_opportunity(opp_id)
    if not opp:
        return False
    
    saved_by = opp.get('saved_by', [])
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        if save and user_id not in saved_by:
            saved_by.append(user_id)
            cursor.execute('''
                UPDATE opportunities SET saved_by = ?, saved_count = saved_count + 1 
                WHERE opp_id = ?
            ''', (json.dumps(saved_by), opp_id))
            return True
        elif not save and user_id in saved_by:
            saved_by.remove(user_id)
            cursor.execute('''
                UPDATE opportunities SET saved_by = ?, saved_count = saved_count - 1 
                WHERE opp_id = ?
            ''', (json.dumps(saved_by), opp_id))
            return False
    
    return user_id in saved_by


# ============ COMMENT OPERATIONS ============

def get_comments(entity_type: str, entity_id: str) -> List[Dict]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM comments WHERE entity_type = ? AND entity_id = ? 
            ORDER BY created_at ASC
        ''', (entity_type, entity_id))
        return rows_to_list(cursor.fetchall())

def create_comment(comment_data: Dict) -> Dict:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO comments (comment_id, entity_type, entity_id, user_id, user_name, 
                user_picture, text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            comment_data['comment_id'],
            comment_data['entity_type'],
            comment_data['entity_id'],
            comment_data['user_id'],
            comment_data['user_name'],
            comment_data.get('user_picture'),
            comment_data['text'],
            comment_data.get('created_at', datetime.now(timezone.utc).isoformat())
        ))
        
        # Get the created comment
        cursor.execute('SELECT * FROM comments WHERE comment_id = ?', (comment_data['comment_id'],))
        return row_to_dict(cursor.fetchone())


# ============ NOTIFICATION OPERATIONS ============

def get_notifications(user_id: str, limit: int = 50, unread_only: bool = False) -> List[Dict]:
    """Get notifications for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        if unread_only:
            cursor.execute('''
                SELECT * FROM notifications WHERE user_id = ? AND read = 0
                ORDER BY created_at DESC LIMIT ?
            ''', (user_id, limit))
        else:
            cursor.execute('''
                SELECT * FROM notifications WHERE user_id = ?
                ORDER BY created_at DESC LIMIT ?
            ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())

def create_notification(notification_data: Dict) -> Dict:
    """Create a new notification"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO notifications (notification_id, user_id, type, title, message, link, read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            notification_data['notification_id'],
            notification_data['user_id'],
            notification_data['type'],
            notification_data['title'],
            notification_data.get('message'),
            notification_data.get('link'),
            0,
            notification_data.get('created_at', datetime.now(timezone.utc).isoformat())
        ))
        cursor.execute('SELECT * FROM notifications WHERE notification_id = ?', (notification_data['notification_id'],))
        return row_to_dict(cursor.fetchone())

def mark_notification_read(notification_id: str, user_id: str) -> bool:
    """Mark a single notification as read"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE notifications SET read = 1 WHERE notification_id = ? AND user_id = ?
        ''', (notification_id, user_id))
        return cursor.rowcount > 0

def mark_all_notifications_read(user_id: str) -> int:
    """Mark all notifications as read for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0
        ''', (user_id,))
        return cursor.rowcount

def get_unread_notification_count(user_id: str) -> int:
    """Get count of unread notifications"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read = 0', (user_id,))
        return cursor.fetchone()[0]


# ============ REACTION OPERATIONS ============

def get_reaction(user_id: str, entity_type: str, entity_id: str) -> Optional[Dict]:
    """Check if user has reacted to an entity"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM reactions WHERE user_id = ? AND entity_type = ? AND entity_id = ?
        ''', (user_id, entity_type, entity_id))
        return row_to_dict(cursor.fetchone())

def create_reaction(reaction_data: Dict) -> Dict:
    """Create a new reaction"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO reactions (reaction_id, user_id, entity_type, entity_id, reaction_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            reaction_data['reaction_id'],
            reaction_data['user_id'],
            reaction_data['entity_type'],
            reaction_data['entity_id'],
            reaction_data.get('reaction_type', 'like'),
            reaction_data.get('created_at', datetime.now(timezone.utc).isoformat())
        ))
        cursor.execute('SELECT * FROM reactions WHERE reaction_id = ?', (reaction_data['reaction_id'],))
        return row_to_dict(cursor.fetchone())

def delete_reaction(user_id: str, entity_type: str, entity_id: str) -> bool:
    """Remove a reaction"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM reactions WHERE user_id = ? AND entity_type = ? AND entity_id = ?
        ''', (user_id, entity_type, entity_id))
        return cursor.rowcount > 0

def get_reaction_count(entity_type: str, entity_id: str) -> int:
    """Get total reaction count for an entity"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(*) FROM reactions WHERE entity_type = ? AND entity_id = ?
        ''', (entity_type, entity_id))
        return cursor.fetchone()[0]

def get_user_reactions(user_id: str, entity_type: Optional[str] = None) -> List[Dict]:
    """Get all reactions by a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        if entity_type:
            cursor.execute('''
                SELECT * FROM reactions WHERE user_id = ? AND entity_type = ?
                ORDER BY created_at DESC
            ''', (user_id, entity_type))
        else:
            cursor.execute('''
                SELECT * FROM reactions WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
        return rows_to_list(cursor.fetchall())

def update_moment_reactions_count(moment_id: str):
    """Update the reactions count on a moment"""
    count = get_reaction_count('moment', moment_id)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE moments SET reactions = ? WHERE moment_id = ?', (count, moment_id))


# ============ SEARCH OPERATIONS ============

def search_moments(query: str, limit: int = 20) -> List[Dict]:
    """Search moments by title or content"""
    with get_db() as conn:
        cursor = conn.cursor()
        search_term = f'%{query}%'
        cursor.execute('''
            SELECT * FROM moments 
            WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
            ORDER BY created_at DESC LIMIT ?
        ''', (search_term, search_term, search_term, limit))
        return rows_to_list(cursor.fetchall())

def search_users(query: str, limit: int = 20) -> List[Dict]:
    """Search users by name or department"""
    with get_db() as conn:
        cursor = conn.cursor()
        search_term = f'%{query}%'
        cursor.execute('''
            SELECT user_id, name, email, picture, department, year, role FROM users 
            WHERE name LIKE ? OR department LIKE ?
            ORDER BY name ASC LIMIT ?
        ''', (search_term, search_term, limit))
        return rows_to_list(cursor.fetchall())

def search_opportunities(query: str, limit: int = 20) -> List[Dict]:
    """Search opportunities by title or description"""
    with get_db() as conn:
        cursor = conn.cursor()
        search_term = f'%{query}%'
        cursor.execute('''
            SELECT * FROM opportunities 
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY created_at DESC LIMIT ?
        ''', (search_term, search_term, limit))
        return rows_to_list(cursor.fetchall())

def search_issues(query: str, limit: int = 20) -> List[Dict]:
    """Search issues by title or description"""
    with get_db() as conn:
        cursor = conn.cursor()
        search_term = f'%{query}%'
        cursor.execute('''
            SELECT * FROM issues 
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY created_at DESC LIMIT ?
        ''', (search_term, search_term, limit))
        return rows_to_list(cursor.fetchall())


# ============ FOLLOW OPERATIONS ============

def follow_user(follower_id: str, following_id: str) -> Dict:
    """Create a follow relationship"""
    with get_db() as conn:
        cursor = conn.cursor()
        follow_id = f"follow_{uuid.uuid4().hex[:12]}" if 'uuid' in dir() else f"follow_{follower_id}_{following_id}"
        try:
            cursor.execute('''
                INSERT INTO follows (follow_id, follower_id, following_id, created_at)
                VALUES (?, ?, ?, ?)
            ''', (
                follow_id,
                follower_id,
                following_id,
                datetime.now(timezone.utc).isoformat()
            ))
            cursor.execute('SELECT * FROM follows WHERE follow_id = ?', (follow_id,))
            return row_to_dict(cursor.fetchone())
        except sqlite3.IntegrityError:
            # Already following
            return None

def unfollow_user(follower_id: str, following_id: str) -> bool:
    """Remove a follow relationship"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM follows WHERE follower_id = ? AND following_id = ?
        ''', (follower_id, following_id))
        return cursor.rowcount > 0

def is_following(follower_id: str, following_id: str) -> bool:
    """Check if user is following another user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
        ''', (follower_id, following_id))
        return cursor.fetchone() is not None

def get_followers(user_id: str, limit: int = 50) -> List[Dict]:
    """Get list of users following this user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT u.user_id, u.name, u.email, u.picture, u.department, u.year, u.role
            FROM follows f
            JOIN users u ON f.follower_id = u.user_id
            WHERE f.following_id = ?
            ORDER BY f.created_at DESC LIMIT ?
        ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())

def get_following(user_id: str, limit: int = 50) -> List[Dict]:
    """Get list of users this user is following"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT u.user_id, u.name, u.email, u.picture, u.department, u.year, u.role
            FROM follows f
            JOIN users u ON f.following_id = u.user_id
            WHERE f.follower_id = ?
            ORDER BY f.created_at DESC LIMIT ?
        ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())

def get_follower_count(user_id: str) -> int:
    """Get count of followers"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM follows WHERE following_id = ?', (user_id,))
        return cursor.fetchone()[0]

def get_following_count(user_id: str) -> int:
    """Get count of users being followed"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM follows WHERE follower_id = ?', (user_id,))
        return cursor.fetchone()[0]


# ============ PROFILE OPERATIONS ============

def update_user_profile(user_id: str, updates: Dict) -> Optional[Dict]:
    """Update user profile fields (bio, skills, interests, etc.)"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Allowed fields for profile update
        allowed_fields = ['name', 'bio', 'skills', 'interests', 'hostel', 'department', 'year', 'picture']
        
        set_clauses = []
        values = []
        
        for key, value in updates.items():
            if key in allowed_fields:
                # JSON encode lists
                if key in ['skills', 'interests'] and isinstance(value, list):
                    value = json.dumps(value)
                set_clauses.append(f'{key} = ?')
                values.append(value)
        
        if set_clauses:
            values.append(user_id)
            cursor.execute(f'''
                UPDATE users SET {', '.join(set_clauses)} WHERE user_id = ?
            ''', values)
        
        return find_user_by_id(user_id)

def get_user_stats(user_id: str) -> Dict:
    """Calculate user stats (moments count, helpful count, etc.)"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Count moments
        cursor.execute('SELECT COUNT(*) FROM moments WHERE user_id = ?', (user_id,))
        moments_count = cursor.fetchone()[0]
        
        # Count issues reported
        cursor.execute('SELECT COUNT(*) FROM issues WHERE user_id = ?', (user_id,))
        issues_count = cursor.fetchone()[0]
        
        # Count comments made
        cursor.execute('SELECT COUNT(*) FROM comments WHERE user_id = ?', (user_id,))
        comments_count = cursor.fetchone()[0]
        
        # Count reactions received on moments
        cursor.execute('''
            SELECT COUNT(*) FROM reactions r
            JOIN moments m ON r.entity_id = m.moment_id
            WHERE m.user_id = ? AND r.entity_type = 'moment'
        ''', (user_id,))
        reactions_received = cursor.fetchone()[0]
        
        # Count followers/following
        followers_count = get_follower_count(user_id)
        following_count = get_following_count(user_id)
        
        return {
            "moments_count": moments_count,
            "issues_count": issues_count,
            "comments_count": comments_count,
            "reactions_received": reactions_received,
            "followers_count": followers_count,
            "following_count": following_count,
            "helpful_count": reactions_received + comments_count  # Simple helpful metric
        }


# ============ PROFILE VIEWS OPERATIONS ============

def record_profile_view(profile_user_id: str, viewer_user_id: str) -> Optional[Dict]:
    """Record a profile view (only if viewer is different from profile owner)"""
    if profile_user_id == viewer_user_id:
        return None
    
    with get_db() as conn:
        cursor = conn.cursor()
        view_id = f"view_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{viewer_user_id[:8]}"
        
        cursor.execute('''
            INSERT INTO profile_views (view_id, profile_user_id, viewer_user_id, viewed_at)
            VALUES (?, ?, ?, ?)
        ''', (
            view_id,
            profile_user_id,
            viewer_user_id,
            datetime.now(timezone.utc).isoformat()
        ))
        
        cursor.execute('SELECT * FROM profile_views WHERE view_id = ?', (view_id,))
        return row_to_dict(cursor.fetchone())

def get_profile_visitors(user_id: str, limit: int = 20) -> List[Dict]:
    """Get recent profile visitors with user details"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT DISTINCT pv.viewer_user_id, pv.viewed_at, 
                   u.name, u.picture, u.department, u.year
            FROM profile_views pv
            JOIN users u ON pv.viewer_user_id = u.user_id
            WHERE pv.profile_user_id = ?
            ORDER BY pv.viewed_at DESC
            LIMIT ?
        ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())

def get_profile_view_count(user_id: str) -> int:
    """Get total profile view count"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM profile_views WHERE profile_user_id = ?', (user_id,))
        return cursor.fetchone()[0]


# ============ PEER REVIEWS OPERATIONS ============

def create_peer_review(review_data: Dict) -> Dict:
    """Create a peer review"""
    with get_db() as conn:
        cursor = conn.cursor()
        review_id = f"review_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{review_data['reviewer_id'][:8]}"
        
        cursor.execute('''
            INSERT INTO peer_reviews (review_id, reviewer_id, reviewed_user_id, rating, review_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            review_id,
            review_data['reviewer_id'],
            review_data['reviewed_user_id'],
            review_data['rating'],
            review_data.get('review_text'),
            datetime.now(timezone.utc).isoformat()
        ))
        
        cursor.execute('SELECT * FROM peer_reviews WHERE review_id = ?', (review_id,))
        return row_to_dict(cursor.fetchone())

def get_user_reviews(user_id: str, limit: int = 20) -> List[Dict]:
    """Get reviews for a user with reviewer details"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT pr.*, u.name as reviewer_name, u.picture as reviewer_picture
            FROM peer_reviews pr
            JOIN users u ON pr.reviewer_id = u.user_id
            WHERE pr.reviewed_user_id = ?
            ORDER BY pr.created_at DESC
            LIMIT ?
        ''', (user_id, limit))
        return rows_to_list(cursor.fetchall())

def get_user_average_rating(user_id: str) -> float:
    """Get average rating for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT AVG(rating) FROM peer_reviews WHERE reviewed_user_id = ?', (user_id,))
        result = cursor.fetchone()[0]
        return round(result, 1) if result else 0.0

def has_reviewed_user(reviewer_id: str, reviewed_user_id: str) -> bool:
    """Check if user has already reviewed another user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 1 FROM peer_reviews WHERE reviewer_id = ? AND reviewed_user_id = ?
        ''', (reviewer_id, reviewed_user_id))
        return cursor.fetchone() is not None


# ============ BADGES OPERATIONS ============

def award_badge(user_id: str, badge_type: str, badge_name: str, badge_description: str = None) -> Dict:
    """Award a badge to a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        badge_id = f"badge_{badge_type}_{user_id[:8]}"
        
        # Check if user already has this badge type
        cursor.execute('SELECT 1 FROM user_badges WHERE user_id = ? AND badge_type = ?', (user_id, badge_type))
        if cursor.fetchone():
            return None  # Already has badge
        
        cursor.execute('''
            INSERT INTO user_badges (badge_id, user_id, badge_type, badge_name, badge_description, earned_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            badge_id,
            user_id,
            badge_type,
            badge_name,
            badge_description,
            datetime.now(timezone.utc).isoformat()
        ))
        
        cursor.execute('SELECT * FROM user_badges WHERE badge_id = ?', (badge_id,))
        return row_to_dict(cursor.fetchone())

def get_user_badges(user_id: str) -> List[Dict]:
    """Get all badges for a user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM user_badges WHERE user_id = ?
            ORDER BY earned_at DESC
        ''', (user_id,))
        return rows_to_list(cursor.fetchall())

def check_and_award_badges(user_id: str) -> List[Dict]:
    """Check user stats and award any earned badges"""
    stats = get_user_stats(user_id)
    awarded = []
    
    # First Moment badge
    if stats['moments_count'] >= 1:
        badge = award_badge(user_id, 'first_moment', 'First Post', 'Posted your first moment')
        if badge:
            awarded.append(badge)
    
    # Active Contributor badge (10+ moments)
    if stats['moments_count'] >= 10:
        badge = award_badge(user_id, 'active_contributor', 'Active Contributor', 'Posted 10 or more moments')
        if badge:
            awarded.append(badge)
    
    # Issue Reporter badge
    if stats['issues_count'] >= 1:
        badge = award_badge(user_id, 'issue_reporter', 'Issue Reporter', 'Reported your first campus issue')
        if badge:
            awarded.append(badge)
    
    # Helpful badge (10+ reactions received)
    if stats['reactions_received'] >= 10:
        badge = award_badge(user_id, 'helpful', 'Helpful', 'Received 10 or more reactions')
        if badge:
            awarded.append(badge)
    
    # Popular badge (50+ followers)
    if stats['followers_count'] >= 50:
        badge = award_badge(user_id, 'popular', 'Popular', 'Gained 50 or more followers')
        if badge:
            awarded.append(badge)
    
    # Engaged badge (20+ comments)
    if stats['comments_count'] >= 20:
        badge = award_badge(user_id, 'engaged', 'Engaged', 'Made 20 or more comments')
        if badge:
            awarded.append(badge)
    
    return awarded


# ============ ACTIVITY OPERATIONS ============

def get_user_activity(user_id: str, limit: int = 30) -> List[Dict]:
    """Get aggregated activity for a user"""
    activities = []
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get recent moments
        cursor.execute('''
            SELECT moment_id as id, 'moment' as type, title, created_at
            FROM moments WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?
        ''', (user_id, limit // 3))
        for row in cursor.fetchall():
            activities.append({
                "id": row[0],
                "type": row[1],
                "title": row[2],
                "created_at": row[3],
                "action": "posted a moment"
            })
        
        # Get recent comments
        cursor.execute('''
            SELECT comment_id as id, 'comment' as type, text, entity_type, entity_id, created_at
            FROM comments WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?
        ''', (user_id, limit // 3))
        for row in cursor.fetchall():
            activities.append({
                "id": row[0],
                "type": row[1],
                "title": row[2][:50] + "..." if len(row[2]) > 50 else row[2],
                "entity_type": row[3],
                "entity_id": row[4],
                "created_at": row[5],
                "action": f"commented on a {row[3]}"
            })
        
        # Get recent issues
        cursor.execute('''
            SELECT issue_id as id, 'issue' as type, title, created_at
            FROM issues WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?
        ''', (user_id, limit // 3))
        for row in cursor.fetchall():
            activities.append({
                "id": row[0],
                "type": row[1],
                "title": row[2],
                "created_at": row[3],
                "action": "reported an issue"
            })
    
    # Sort by created_at descending
    activities.sort(key=lambda x: x['created_at'], reverse=True)
    return activities[:limit]


# ============ AUDIT LOG OPERATIONS ============

def create_audit_log(log_data: Dict) -> Dict:
    """Create an audit log entry for admin actions"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO audit_logs 
            (log_id, admin_id, admin_name, action_type, entity_type, entity_id,
             old_value, new_value, ip_address, user_agent, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_data['log_id'],
            log_data['admin_id'],
            log_data['admin_name'],
            log_data['action_type'],
            log_data['entity_type'],
            log_data['entity_id'],
            log_data.get('old_value'),
            log_data.get('new_value'),
            log_data.get('ip_address'),
            log_data.get('user_agent'),
            log_data['timestamp']
        ))
        conn.commit()
        return log_data


def get_audit_logs(
    admin_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict]:
    """Get audit logs with optional filtering"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = 'SELECT * FROM audit_logs WHERE 1=1'
        params = []
        
        if admin_id:
            query += ' AND admin_id = ?'
            params.append(admin_id)
        
        if entity_type:
            query += ' AND entity_type = ?'
            params.append(entity_type)
        
        if entity_id:
            query += ' AND entity_id = ?'
            params.append(entity_id)
        
        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        return [row_to_dict(row) for row in cursor.fetchall()]


def get_audit_log_count(
    admin_id: Optional[str] = None,
    entity_type: Optional[str] = None
) -> int:
    """Get total count of audit logs for pagination"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1'
        params = []
        
        if admin_id:
            query += ' AND admin_id = ?'
            params.append(admin_id)
        
        if entity_type:
            query += ' AND entity_type = ?'
            params.append(entity_type)
        
        cursor.execute(query, params)
        return cursor.fetchone()[0]


# ============ CONTENT MODERATION OPERATIONS ============

def create_flagged_content(flag_data: Dict) -> Dict:
    """Create a flagged content entry"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO flagged_content
            (flag_id, post_id, post_type, content, author_id, author_name, author_role,
             classroom, department, risk_category, risk_severity, confidence_score,
             ai_reasoning, status, flagged_at, interactions_likes, interactions_comments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            flag_data['flag_id'],
            flag_data['post_id'],
            flag_data['post_type'],
            flag_data['content'],
            flag_data['author_id'],
            flag_data['author_name'],
            flag_data.get('author_role'),
            flag_data.get('classroom'),
            flag_data.get('department'),
            flag_data['risk_category'],
            flag_data['risk_severity'],
            flag_data['confidence_score'],
            flag_data.get('ai_reasoning'),
            flag_data.get('status', 'pending'),
            flag_data['flagged_at'],
            flag_data.get('interactions_likes', 0),
            flag_data.get('interactions_comments', 0)
        ))
        conn.commit()
        return flag_data


def get_flagged_content(
    status: Optional[str] = None,
    risk_category: Optional[str] = None,
    risk_severity: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict]:
    """Get flagged content with optional filtering"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = 'SELECT * FROM flagged_content WHERE 1=1'
        params = []
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        if risk_category:
            query += ' AND risk_category = ?'
            params.append(risk_category)
        
        if risk_severity:
            query += ' AND risk_severity = ?'
            params.append(risk_severity)
        
        query += ' ORDER BY flagged_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        return [row_to_dict(row) for row in cursor.fetchall()]


def get_flagged_content_by_id(flag_id: str) -> Optional[Dict]:
    """Get a single flagged content entry"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM flagged_content WHERE flag_id = ?', (flag_id,))
        return row_to_dict(cursor.fetchone())


def update_flagged_content_status(
    flag_id: str,
    status: str,
    reviewed_by: Optional[str] = None
) -> Optional[Dict]:
    """Update the status of flagged content"""
    from datetime import datetime, timezone
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        reviewed_at = datetime.now(timezone.utc).isoformat() if reviewed_by else None
        
        cursor.execute('''
            UPDATE flagged_content
            SET status = ?, reviewed_by = ?, reviewed_at = ?
            WHERE flag_id = ?
        ''', (status, reviewed_by, reviewed_at, flag_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            return get_flagged_content_by_id(flag_id)
        return None


def create_moderation_log(log_data: Dict) -> Dict:
    """Create a moderation log entry"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO moderation_log
            (log_id, flag_id, post_id, action, admin_id, admin_name, reason, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_data['log_id'],
            log_data['flag_id'],
            log_data['post_id'],
            log_data['action'],
            log_data['admin_id'],
            log_data['admin_name'],
            log_data.get('reason'),
            log_data['timestamp']
        ))
        conn.commit()
        return log_data


def get_moderation_logs(
    flag_id: Optional[str] = None,
    admin_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict]:
    """Get moderation logs with optional filtering"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = 'SELECT * FROM moderation_log WHERE 1=1'
        params = []
        
        if flag_id:
            query += ' AND flag_id = ?'
            params.append(flag_id)
        
        if admin_id:
            query += ' AND admin_id = ?'
            params.append(admin_id)
        
        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        return [row_to_dict(row) for row in cursor.fetchall()]


def get_moderation_stats() -> Dict:
    """Get statistics for moderation dashboard"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get counts by status
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM flagged_content
            GROUP BY status
        ''')
        status_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get counts by severity
        cursor.execute('''
            SELECT risk_severity, COUNT(*) as count
            FROM flagged_content
            WHERE status = 'pending'
            GROUP BY risk_severity
        ''')
        severity_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Get total counts
        cursor.execute('SELECT COUNT(*) FROM flagged_content')
        total = cursor.fetchone()[0]
        
        return {
            "total_flagged": total,
            "pending": status_counts.get('pending', 0),
            "approved": status_counts.get('approved', 0),
            "removed": status_counts.get('removed', 0),
            "reviewed": status_counts.get('reviewed', 0),
            "by_severity": severity_counts
        }


# Initialize database on module import
init_database()
