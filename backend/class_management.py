"""
Class Management System
Handles multi-class management, student classification, and class-scoped features
"""

import sqlite3
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pathlib import Path

# Database file path
DB_PATH = Path(__file__).parent / "campus.db"

def get_connection():
    """Get a database connection with row factory"""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def get_current_academic_year():
    """Calculate current academic year based on date"""
    now = datetime.now()
    # Academic year starts in June/July
    if now.month >= 6:
        return now.year
    return now.year - 1

def calculate_student_year(joining_year: int) -> int:
    """Calculate current year of study based on joining year"""
    current_academic_year = get_current_academic_year()
    year = current_academic_year - joining_year + 1
    return min(max(year, 1), 4)  # Clamp between 1-4


def parse_student_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Parse student email to extract department and joining year
    Example: rajendraprasadm.aiml2023@citchennai.net
    Returns: {'department': 'AIML', 'joining_year': 2023, 'current_year': 3}
    """
    if not email:
        return None
    
    # Pattern: name.department+year@domain
    # Examples: 
    # - rajendraprasadm.aiml2023@citchennai.net
    # - john.cse2024@citchennai.net
    # - student.ece2022@citchennai.net
    
    patterns = [
        r'\.([a-zA-Z]+)(\d{4})@',  # name.dept2023@
        r'([a-zA-Z]+)(\d{4})@',     # dept2023@
    ]
    
    for pattern in patterns:
        match = re.search(pattern, email.lower())
        if match:
            dept = match.group(1).upper()
            year = int(match.group(2))
            
            # Validate department
            valid_depts = ['AIML', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'CSBS']
            if dept not in valid_depts:
                continue
            
            # Validate year (reasonable range)
            if 2015 <= year <= datetime.now().year:
                return {
                    'department': dept,
                    'joining_year': year,
                    'current_year': calculate_student_year(year)
                }
    
    return None


def init_class_management_tables():
    """Initialize class management database tables"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Classes table - represents a class/section
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS classes (
                class_id TEXT PRIMARY KEY,
                department TEXT NOT NULL,
                joining_year INTEGER NOT NULL,
                section TEXT NOT NULL DEFAULT 'A',
                class_name TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(department, joining_year, section)
            )
        ''')

        # Teacher-Class mapping
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS teacher_classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_id TEXT NOT NULL,
                class_id TEXT NOT NULL,
                is_class_teacher INTEGER DEFAULT 0,
                assigned_at TEXT NOT NULL,
                FOREIGN KEY (teacher_id) REFERENCES users(user_id),
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                UNIQUE(teacher_id, class_id)
            )
        ''')
        
        # Student-Class mapping
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS student_classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                class_id TEXT NOT NULL,
                roll_number TEXT,
                attendance_percentage REAL DEFAULT 0,
                status TEXT DEFAULT 'active',
                joined_at TEXT NOT NULL,
                FOREIGN KEY (student_id) REFERENCES users(user_id),
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                UNIQUE(student_id, class_id)
            )
        ''')
        
        # Class Announcements
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS class_announcements (
                announcement_id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                teacher_id TEXT NOT NULL,
                teacher_name TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                priority TEXT DEFAULT 'normal',
                views_count INTEGER DEFAULT 0,
                viewed_by TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (teacher_id) REFERENCES users(user_id)
            )
        ''')

        # Class Polls
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS class_polls (
                poll_id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                teacher_id TEXT NOT NULL,
                teacher_name TEXT NOT NULL,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                ends_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (teacher_id) REFERENCES users(user_id)
            )
        ''')
        
        # Poll Votes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS poll_votes (
                vote_id TEXT PRIMARY KEY,
                poll_id TEXT NOT NULL,
                student_id TEXT NOT NULL,
                option_index INTEGER NOT NULL,
                voted_at TEXT NOT NULL,
                FOREIGN KEY (poll_id) REFERENCES class_polls(poll_id),
                FOREIGN KEY (student_id) REFERENCES users(user_id),
                UNIQUE(poll_id, student_id)
            )
        ''')
        
        # Class Forum Posts
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS class_forum_posts (
                post_id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                user_role TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                is_pinned INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (class_id) REFERENCES classes(class_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')

        # Class Forum Comments
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS class_forum_comments (
                comment_id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                user_role TEXT NOT NULL,
                content TEXT NOT NULL,
                parent_comment_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (post_id) REFERENCES class_forum_posts(post_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Teacher active class session
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS teacher_active_class (
                teacher_id TEXT PRIMARY KEY,
                class_id TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (teacher_id) REFERENCES users(user_id),
                FOREIGN KEY (class_id) REFERENCES classes(class_id)
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON teacher_classes(teacher_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_teacher_classes_class ON teacher_classes(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_student_classes_student ON student_classes(student_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_student_classes_class ON student_classes(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_announcements_class ON class_announcements(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_polls_class ON class_polls(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_forum_posts_class ON class_forum_posts(class_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id)')
        
        conn.commit()
        print("[OK] Class management tables initialized")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Failed to initialize class management tables: {e}")
        raise e
    finally:
        conn.close()


# ============ HELPER FUNCTIONS ============

def row_to_dict(row) -> Optional[Dict]:
    """Convert sqlite3.Row to dictionary with JSON parsing"""
    if row is None:
        return None
    d = dict(row)
    json_fields = ['options', 'viewed_by']
    for field in json_fields:
        if field in d and d[field]:
            try:
                d[field] = json.loads(d[field])
            except (json.JSONDecodeError, TypeError):
                pass
    return d

def rows_to_list(rows) -> List[Dict]:
    """Convert list of sqlite3.Row to list of dictionaries"""
    return [row_to_dict(row) for row in rows]


# ============ CLASS OPERATIONS ============

def create_class(department: str, joining_year: int, section: str = 'A') -> Dict:
    """Create a new class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        class_id = f"class_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        current_year = calculate_student_year(joining_year)
        class_name = f"{department} - Year {current_year} - Section {section}"
        
        cursor.execute('''
            INSERT INTO classes (class_id, department, joining_year, section, class_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (class_id, department.upper(), joining_year, section.upper(), class_name, now, now))
        conn.commit()
        return get_class_by_id(class_id)
    except sqlite3.IntegrityError:
        # Class already exists, return existing
        return get_class(department, joining_year, section)
    finally:
        conn.close()


def get_class_by_id(class_id: str) -> Optional[Dict]:
    """Get class by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM classes WHERE class_id = ?', (class_id,))
        row = cursor.fetchone()
        if row:
            d = row_to_dict(row)
            d['current_year'] = calculate_student_year(d['joining_year'])
            d['class_name'] = f"{d['department']} - Year {d['current_year']} - Section {d['section']}"
            return d
        return None
    finally:
        conn.close()


def get_class(department: str, joining_year: int, section: str = 'A') -> Optional[Dict]:
    """Get class by department, joining year, and section"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT * FROM classes 
            WHERE department = ? AND joining_year = ? AND section = ?
        ''', (department.upper(), joining_year, section.upper()))
        row = cursor.fetchone()
        if row:
            d = row_to_dict(row)
            d['current_year'] = calculate_student_year(d['joining_year'])
            d['class_name'] = f"{d['department']} - Year {d['current_year']} - Section {d['section']}"
            return d
        return None
    finally:
        conn.close()


def get_or_create_class(department: str, joining_year: int, section: str = 'A') -> Dict:
    """Get existing class or create new one"""
    existing = get_class(department, joining_year, section)
    if existing:
        return existing
    return create_class(department, joining_year, section)


def get_all_classes() -> List[Dict]:
    """Get all classes"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM classes ORDER BY department, joining_year DESC, section')
        classes = rows_to_list(cursor.fetchall())
        for c in classes:
            c['current_year'] = calculate_student_year(c['joining_year'])
            c['class_name'] = f"{c['department']} - Year {c['current_year']} - Section {c['section']}"
        return classes
    finally:
        conn.close()


# ============ TEACHER-CLASS OPERATIONS ============

def assign_teacher_to_class(teacher_id: str, class_id: str, is_class_teacher: bool = False) -> bool:
    """Assign a teacher to a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute('''
            INSERT OR REPLACE INTO teacher_classes (teacher_id, class_id, is_class_teacher, assigned_at)
            VALUES (?, ?, ?, ?)
        ''', (teacher_id, class_id, 1 if is_class_teacher else 0, now))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error assigning teacher to class: {e}")
        return False
    finally:
        conn.close()


def get_teacher_classes(teacher_id: str) -> List[Dict]:
    """Get all classes assigned to a teacher"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT c.*, tc.is_class_teacher, tc.assigned_at,
                   (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.class_id) as student_count
            FROM classes c
            JOIN teacher_classes tc ON c.class_id = tc.class_id
            WHERE tc.teacher_id = ?
            ORDER BY c.department, c.joining_year DESC, c.section
        ''', (teacher_id,))
        classes = rows_to_list(cursor.fetchall())
        for c in classes:
            c['current_year'] = calculate_student_year(c['joining_year'])
            c['class_name'] = f"{c['department']} - Year {c['current_year']} - Section {c['section']}"
        return classes
    finally:
        conn.close()


def is_teacher_of_class(teacher_id: str, class_id: str) -> bool:
    """Check if teacher is assigned to a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT 1 FROM teacher_classes WHERE teacher_id = ? AND class_id = ?
        ''', (teacher_id, class_id))
        return cursor.fetchone() is not None
    finally:
        conn.close()


def get_teacher_active_class(teacher_id: str) -> Optional[str]:
    """Get teacher's currently active class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT class_id FROM teacher_active_class WHERE teacher_id = ?', (teacher_id,))
        row = cursor.fetchone()
        if row:
            return row['class_id']
        # Return first assigned class as default
        classes = get_teacher_classes(teacher_id)
        if classes:
            set_teacher_active_class(teacher_id, classes[0]['class_id'])
            return classes[0]['class_id']
        return None
    finally:
        conn.close()


def set_teacher_active_class(teacher_id: str, class_id: str) -> bool:
    """Set teacher's active class"""
    # Verify teacher has access to this class
    if not is_teacher_of_class(teacher_id, class_id):
        return False
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute('''
            INSERT OR REPLACE INTO teacher_active_class (teacher_id, class_id, updated_at)
            VALUES (?, ?, ?)
        ''', (teacher_id, class_id, now))
        conn.commit()
        return True
    finally:
        conn.close()


# ============ STUDENT-CLASS OPERATIONS ============

def assign_student_to_class(student_id: str, class_id: str, roll_number: str = None) -> bool:
    """Assign a student to a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute('''
            INSERT OR REPLACE INTO student_classes (student_id, class_id, roll_number, joined_at)
            VALUES (?, ?, ?, ?)
        ''', (student_id, class_id, roll_number, now))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error assigning student to class: {e}")
        return False
    finally:
        conn.close()


def classify_and_assign_student(student_id: str, email: str, section: str = 'A') -> Optional[Dict]:
    """
    Automatically classify student from email and assign to appropriate class
    Returns the class info if successful
    """
    parsed = parse_student_email(email)
    if not parsed:
        return None
    
    # Get or create the class
    class_info = get_or_create_class(parsed['department'], parsed['joining_year'], section)
    if not class_info:
        return None
    
    # Generate roll number
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT COUNT(*) as count FROM student_classes WHERE class_id = ?
        ''', (class_info['class_id'],))
        count = cursor.fetchone()['count']
        roll_number = f"{parsed['department']}{parsed['joining_year']}{str(count + 1).zfill(3)}"
    finally:
        conn.close()
    
    # Assign student to class
    if assign_student_to_class(student_id, class_info['class_id'], roll_number):
        return {
            'class': class_info,
            'roll_number': roll_number,
            'department': parsed['department'],
            'joining_year': parsed['joining_year'],
            'current_year': parsed['current_year']
        }
    return None


def get_class_students(class_id: str, search: str = None, status: str = None) -> List[Dict]:
    """Get all students in a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = '''
            SELECT u.user_id, u.name, u.email, u.picture,
                   sc.roll_number, sc.attendance_percentage, sc.status, sc.joined_at
            FROM users u
            JOIN student_classes sc ON u.user_id = sc.student_id
            WHERE sc.class_id = ?
        '''
        params = [class_id]
        
        if search:
            query += ' AND (u.name LIKE ? OR sc.roll_number LIKE ? OR u.email LIKE ?)'
            search_term = f'%{search}%'
            params.extend([search_term, search_term, search_term])
        
        if status and status != 'all':
            query += ' AND sc.status = ?'
            params.append(status)
        
        query += ' ORDER BY sc.roll_number'
        
        cursor.execute(query, params)
        return rows_to_list(cursor.fetchall())
    finally:
        conn.close()


def get_student_class(student_id: str) -> Optional[Dict]:
    """Get the class a student belongs to"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT c.*, sc.roll_number, sc.attendance_percentage, sc.status
            FROM classes c
            JOIN student_classes sc ON c.class_id = sc.class_id
            WHERE sc.student_id = ?
        ''', (student_id,))
        row = cursor.fetchone()
        if row:
            d = row_to_dict(row)
            d['current_year'] = calculate_student_year(d['joining_year'])
            d['class_name'] = f"{d['department']} - Year {d['current_year']} - Section {d['section']}"
            return d
        return None
    finally:
        conn.close()


def is_student_in_class(student_id: str, class_id: str) -> bool:
    """Check if student belongs to a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT 1 FROM student_classes WHERE student_id = ? AND class_id = ?
        ''', (student_id, class_id))
        return cursor.fetchone() is not None
    finally:
        conn.close()


def update_student_attendance(student_id: str, class_id: str, attendance: float) -> bool:
    """Update student attendance percentage"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE student_classes SET attendance_percentage = ?
            WHERE student_id = ? AND class_id = ?
        ''', (attendance, student_id, class_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def update_student_status(student_id: str, class_id: str, status: str) -> bool:
    """Update student status (active/inactive)"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE student_classes SET status = ?
            WHERE student_id = ? AND class_id = ?
        ''', (status, student_id, class_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ============ ANNOUNCEMENT OPERATIONS ============

def create_announcement(class_id: str, teacher_id: str, teacher_name: str, 
                       title: str, content: str, priority: str = 'normal') -> Dict:
    """Create a class announcement"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        announcement_id = f"ann_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute('''
            INSERT INTO class_announcements 
            (announcement_id, class_id, teacher_id, teacher_name, title, content, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (announcement_id, class_id, teacher_id, teacher_name, title, content, priority, now, now))
        conn.commit()
        return get_announcement_by_id(announcement_id)
    finally:
        conn.close()


def get_announcement_by_id(announcement_id: str) -> Optional[Dict]:
    """Get announcement by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM class_announcements WHERE announcement_id = ?', (announcement_id,))
        return row_to_dict(cursor.fetchone())
    finally:
        conn.close()


def get_class_announcements(class_id: str, limit: int = 50) -> List[Dict]:
    """Get all announcements for a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT * FROM class_announcements 
            WHERE class_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ''', (class_id, limit))
        return rows_to_list(cursor.fetchall())
    finally:
        conn.close()


def update_announcement(announcement_id: str, title: str = None, content: str = None, 
                       priority: str = None) -> Optional[Dict]:
    """Update an announcement"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        updates = []
        params = []
        if title:
            updates.append('title = ?')
            params.append(title)
        if content:
            updates.append('content = ?')
            params.append(content)
        if priority:
            updates.append('priority = ?')
            params.append(priority)
        
        if not updates:
            return get_announcement_by_id(announcement_id)
        
        updates.append('updated_at = ?')
        params.append(datetime.now(timezone.utc).isoformat())
        params.append(announcement_id)
        
        cursor.execute(f'''
            UPDATE class_announcements SET {', '.join(updates)}
            WHERE announcement_id = ?
        ''', params)
        conn.commit()
        return get_announcement_by_id(announcement_id)
    finally:
        conn.close()


def delete_announcement(announcement_id: str) -> bool:
    """Delete an announcement"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM class_announcements WHERE announcement_id = ?', (announcement_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def mark_announcement_viewed(announcement_id: str, user_id: str) -> bool:
    """Mark announcement as viewed by user"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT viewed_by FROM class_announcements WHERE announcement_id = ?', (announcement_id,))
        row = cursor.fetchone()
        if not row:
            return False
        
        viewed_by = json.loads(row['viewed_by'] or '[]')
        if user_id not in viewed_by:
            viewed_by.append(user_id)
            cursor.execute('''
                UPDATE class_announcements 
                SET viewed_by = ?, views_count = views_count + 1
                WHERE announcement_id = ?
            ''', (json.dumps(viewed_by), announcement_id))
            conn.commit()
        return True
    finally:
        conn.close()


# ============ POLL OPERATIONS ============

def create_poll(class_id: str, teacher_id: str, teacher_name: str,
               question: str, options: List[str], ends_at: str = None) -> Dict:
    """Create a class poll"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        poll_id = f"poll_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        # Format options with vote counts
        formatted_options = [{'text': opt, 'votes': 0} for opt in options]
        
        cursor.execute('''
            INSERT INTO class_polls 
            (poll_id, class_id, teacher_id, teacher_name, question, options, ends_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (poll_id, class_id, teacher_id, teacher_name, question, 
              json.dumps(formatted_options), ends_at, now))
        conn.commit()
        return get_poll_by_id(poll_id)
    finally:
        conn.close()


def get_poll_by_id(poll_id: str) -> Optional[Dict]:
    """Get poll by ID with vote counts"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM class_polls WHERE poll_id = ?', (poll_id,))
        poll = row_to_dict(cursor.fetchone())
        if poll:
            # Get total votes
            cursor.execute('SELECT COUNT(*) as total FROM poll_votes WHERE poll_id = ?', (poll_id,))
            poll['total_votes'] = cursor.fetchone()['total']
        return poll
    finally:
        conn.close()


def get_class_polls(class_id: str, status: str = None) -> List[Dict]:
    """Get all polls for a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = 'SELECT * FROM class_polls WHERE class_id = ?'
        params = [class_id]
        
        if status:
            query += ' AND status = ?'
            params.append(status)
        
        query += ' ORDER BY created_at DESC'
        
        cursor.execute(query, params)
        polls = rows_to_list(cursor.fetchall())
        
        # Add vote counts
        for poll in polls:
            cursor.execute('SELECT COUNT(*) as total FROM poll_votes WHERE poll_id = ?', (poll['poll_id'],))
            poll['total_votes'] = cursor.fetchone()['total']
            
            # Update options with actual vote counts
            cursor.execute('''
                SELECT option_index, COUNT(*) as votes 
                FROM poll_votes WHERE poll_id = ? 
                GROUP BY option_index
            ''', (poll['poll_id'],))
            vote_counts = {row['option_index']: row['votes'] for row in cursor.fetchall()}
            
            if isinstance(poll['options'], list):
                for i, opt in enumerate(poll['options']):
                    opt['votes'] = vote_counts.get(i, 0)
        
        return polls
    finally:
        conn.close()


def vote_poll(poll_id: str, student_id: str, option_index: int) -> Dict:
    """Vote on a poll"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Check if poll exists and is active
        poll = get_poll_by_id(poll_id)
        if not poll:
            raise ValueError("Poll not found")
        if poll['status'] != 'active':
            raise ValueError("Poll is closed")
        
        # Check if already voted
        cursor.execute('SELECT 1 FROM poll_votes WHERE poll_id = ? AND student_id = ?', (poll_id, student_id))
        if cursor.fetchone():
            raise ValueError("Already voted")
        
        # Record vote
        vote_id = f"vote_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute('''
            INSERT INTO poll_votes (vote_id, poll_id, student_id, option_index, voted_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (vote_id, poll_id, student_id, option_index, now))
        conn.commit()
        
        return get_poll_by_id(poll_id)
    finally:
        conn.close()


def close_poll(poll_id: str) -> bool:
    """Close a poll"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE class_polls SET status = ? WHERE poll_id = ?', ('closed', poll_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def has_voted(poll_id: str, student_id: str) -> bool:
    """Check if student has voted on a poll"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT 1 FROM poll_votes WHERE poll_id = ? AND student_id = ?', (poll_id, student_id))
        return cursor.fetchone() is not None
    finally:
        conn.close()


def get_poll_participation(poll_id: str) -> Dict:
    """Get detailed poll participation - who voted and who hasn't"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Get poll info
        poll = get_poll_by_id(poll_id)
        if not poll:
            return None
        
        class_id = poll['class_id']
        
        # Get all students in the class
        cursor.execute('''
            SELECT u.user_id, u.name, u.email, sc.roll_number
            FROM users u
            JOIN student_classes sc ON u.user_id = sc.student_id
            WHERE sc.class_id = ? AND sc.status = 'active'
        ''', (class_id,))
        all_students = [dict(row) for row in cursor.fetchall()]
        
        # Get students who voted
        cursor.execute('''
            SELECT pv.student_id, pv.option_index, pv.voted_at, u.name, u.email
            FROM poll_votes pv
            JOIN users u ON pv.student_id = u.user_id
            WHERE pv.poll_id = ?
        ''', (poll_id,))
        voters = [dict(row) for row in cursor.fetchall()]
        voter_ids = {v['student_id'] for v in voters}
        
        # Get students who haven't voted
        non_voters = [s for s in all_students if s['user_id'] not in voter_ids]
        
        return {
            'poll': poll,
            'total_students': len(all_students),
            'voted_count': len(voters),
            'not_voted_count': len(non_voters),
            'voters': voters,
            'non_voters': non_voters,
            'participation_rate': round((len(voters) / len(all_students) * 100), 1) if all_students else 0
        }
    finally:
        conn.close()


# ============ FORUM OPERATIONS ============

def create_forum_post(class_id: str, user_id: str, user_name: str, user_role: str,
                     title: str, content: str) -> Dict:
    """Create a forum post"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        post_id = f"fpost_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute('''
            INSERT INTO class_forum_posts 
            (post_id, class_id, user_id, user_name, user_role, title, content, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (post_id, class_id, user_id, user_name, user_role, title, content, now, now))
        conn.commit()
        return get_forum_post_by_id(post_id)
    finally:
        conn.close()


def get_forum_post_by_id(post_id: str) -> Optional[Dict]:
    """Get forum post by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM class_forum_posts WHERE post_id = ?', (post_id,))
        return row_to_dict(cursor.fetchone())
    finally:
        conn.close()


def get_class_forum_posts(class_id: str, limit: int = 50) -> List[Dict]:
    """Get all forum posts for a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT * FROM class_forum_posts 
            WHERE class_id = ?
            ORDER BY is_pinned DESC, created_at DESC
            LIMIT ?
        ''', (class_id, limit))
        posts = rows_to_list(cursor.fetchall())
        
        # Get comment counts
        for post in posts:
            cursor.execute('SELECT COUNT(*) as count FROM class_forum_comments WHERE post_id = ?', 
                          (post['post_id'],))
            post['comments_count'] = cursor.fetchone()['count']
        
        return posts
    finally:
        conn.close()


def update_forum_post(post_id: str, title: str = None, content: str = None) -> Optional[Dict]:
    """Update a forum post"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        updates = []
        params = []
        if title:
            updates.append('title = ?')
            params.append(title)
        if content:
            updates.append('content = ?')
            params.append(content)
        
        if not updates:
            return get_forum_post_by_id(post_id)
        
        updates.append('updated_at = ?')
        params.append(datetime.now(timezone.utc).isoformat())
        params.append(post_id)
        
        cursor.execute(f'''
            UPDATE class_forum_posts SET {', '.join(updates)}
            WHERE post_id = ?
        ''', params)
        conn.commit()
        return get_forum_post_by_id(post_id)
    finally:
        conn.close()


def delete_forum_post(post_id: str) -> bool:
    """Delete a forum post and its comments"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Delete comments first
        cursor.execute('DELETE FROM class_forum_comments WHERE post_id = ?', (post_id,))
        # Delete post
        cursor.execute('DELETE FROM class_forum_posts WHERE post_id = ?', (post_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def pin_forum_post(post_id: str, pinned: bool = True) -> bool:
    """Pin/unpin a forum post"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE class_forum_posts SET is_pinned = ? WHERE post_id = ?', 
                      (1 if pinned else 0, post_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def create_forum_comment(post_id: str, user_id: str, user_name: str, user_role: str,
                        content: str, parent_comment_id: str = None) -> Dict:
    """Create a forum comment"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        comment_id = f"fcomm_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute('''
            INSERT INTO class_forum_comments 
            (comment_id, post_id, user_id, user_name, user_role, content, parent_comment_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (comment_id, post_id, user_id, user_name, user_role, content, parent_comment_id, now))
        
        # Update comment count
        cursor.execute('UPDATE class_forum_posts SET comments_count = comments_count + 1 WHERE post_id = ?',
                      (post_id,))
        conn.commit()
        
        cursor.execute('SELECT * FROM class_forum_comments WHERE comment_id = ?', (comment_id,))
        return row_to_dict(cursor.fetchone())
    finally:
        conn.close()


def get_forum_comments(post_id: str) -> List[Dict]:
    """Get all comments for a forum post"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT * FROM class_forum_comments 
            WHERE post_id = ?
            ORDER BY created_at ASC
        ''', (post_id,))
        return rows_to_list(cursor.fetchall())
    finally:
        conn.close()


def delete_forum_comment(comment_id: str, post_id: str) -> bool:
    """Delete a forum comment"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM class_forum_comments WHERE comment_id = ?', (comment_id,))
        if cursor.rowcount > 0:
            cursor.execute('UPDATE class_forum_posts SET comments_count = comments_count - 1 WHERE post_id = ?',
                          (post_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ============ DASHBOARD STATS ============

def get_class_stats(class_id: str) -> Dict:
    """Get statistics for a class"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        stats = {}
        
        # Student count
        cursor.execute('SELECT COUNT(*) as count FROM student_classes WHERE class_id = ?', (class_id,))
        stats['total_students'] = cursor.fetchone()['count']
        
        # Active students
        cursor.execute('SELECT COUNT(*) as count FROM student_classes WHERE class_id = ? AND status = ?', 
                      (class_id, 'active'))
        stats['active_students'] = cursor.fetchone()['count']
        
        # Average attendance
        cursor.execute('SELECT AVG(attendance_percentage) as avg FROM student_classes WHERE class_id = ?', 
                      (class_id,))
        avg = cursor.fetchone()['avg']
        stats['avg_attendance'] = round(avg, 1) if avg else 0
        
        # Announcement count
        cursor.execute('SELECT COUNT(*) as count FROM class_announcements WHERE class_id = ?', (class_id,))
        stats['total_announcements'] = cursor.fetchone()['count']
        
        # Active polls
        cursor.execute('SELECT COUNT(*) as count FROM class_polls WHERE class_id = ? AND status = ?', 
                      (class_id, 'active'))
        stats['active_polls'] = cursor.fetchone()['count']
        
        # Total polls
        cursor.execute('SELECT COUNT(*) as count FROM class_polls WHERE class_id = ?', (class_id,))
        stats['total_polls'] = cursor.fetchone()['count']
        
        # Forum posts
        cursor.execute('SELECT COUNT(*) as count FROM class_forum_posts WHERE class_id = ?', (class_id,))
        stats['total_forum_posts'] = cursor.fetchone()['count']
        
        return stats
    finally:
        conn.close()


def get_student_dashboard_data(student_id: str) -> Optional[Dict]:
    """Get dashboard data for a student"""
    student_class = get_student_class(student_id)
    if not student_class:
        return None
    
    class_id = student_class['class_id']
    
    return {
        'class': student_class,
        'announcements': get_class_announcements(class_id, limit=10),
        'polls': [p for p in get_class_polls(class_id, status='active') 
                  if not has_voted(p['poll_id'], student_id)],
        'forum_posts': get_class_forum_posts(class_id, limit=10)
    }


# ============ SEED DATA ============

def seed_demo_classes():
    """Seed demo classes and assignments for testing"""
    init_class_management_tables()
    
    # Create demo classes
    classes_to_create = [
        ('CSE', 2023, 'A'),
        ('CSE', 2023, 'B'),
        ('CSE', 2024, 'A'),
        ('AIML', 2023, 'A'),
        ('AIML', 2024, 'A'),
        ('ECE', 2023, 'A'),
        ('ECE', 2024, 'A'),
    ]
    
    created_classes = []
    for dept, year, section in classes_to_create:
        c = get_or_create_class(dept, year, section)
        created_classes.append(c)
        print(f"  Created/Found class: {c['class_name']}")
    
    return created_classes


if __name__ == "__main__":
    print("Initializing class management system...")
    init_class_management_tables()
    print("Seeding demo classes...")
    seed_demo_classes()
    print("Done!")
