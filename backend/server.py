from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, File, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from functools import wraps

# Import SQLite database module
import database as db

# Import class management module
import class_management as cm

# Import services
from services.audit_service import AuditService
from services.ai_clustering_service import run_ai_analysis
from services.gemini_ai_service import generate_insights_with_gemini, moderate_content_with_gemini, get_gemini_service
from services.ai_moderation_service import moderate_moment_content, moderate_comment_content
from services.ai_integration_service import moderate_moment_with_integrated_ai, moderate_comment_with_integrated_ai, generate_insights_with_fallback
import threading
import time
import logging

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# Global variable to store last analysis time
last_analysis_time = None

def run_automated_ai_analysis():
    """Run automated AI analysis periodically"""
    global last_analysis_time
    try:
        logger.info("Running automated AI analysis...")
        
        # Get fresh issues and moments from database
        all_issues = db.get_issues(limit=1000)
        all_moments = db.get_moments(limit=1000)
        
        # Use integrated AI service for analysis
        aggregated_issues = generate_insights_with_fallback(all_issues, all_moments)
        clusters_found = len(aggregated_issues)
        total_processed = len(all_issues) + len(all_moments)
        
        last_analysis_time = datetime.now(timezone.utc)
        logger.info(f"Automated AI analysis completed: {clusters_found} clusters found")
        
        return {
            "success": True,
            "clusters_found": clusters_found,
            "aggregated_issues": aggregated_issues,
            "analysis_time": last_analysis_time.isoformat(),
            "total_issues_processed": total_processed
        }
    except Exception as e:
        logger.error(f"Error running automated AI analysis: {e}")
        return {
            "success": False,
            "error": str(e),
            "clusters_found": 0,
            "aggregated_issues": [],
            "analysis_time": datetime.now(timezone.utc).isoformat()
        }

def automated_analysis_worker():
    """Background worker to run automated analysis periodically"""
    while True:
        try:
            # Run analysis every hour
            run_automated_ai_analysis()
            # Sleep for 1 hour (3600 seconds)
            time.sleep(3600)
        except Exception as e:
            logger.error(f"Error in automated analysis worker: {e}")
            # If there's an error, sleep for 5 minutes before retrying
            time.sleep(300)


# Start the automated analysis worker in a background thread
analysis_thread = threading.Thread(target=automated_analysis_worker, daemon=True)
analysis_thread.start()
logger.info("Automated AI analysis worker started")

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "moments").mkdir(exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize class management tables
try:
    cm.init_class_management_tables()
except Exception as e:
    logger.warning(f"Class management tables initialization: {e}")

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ============ PYDANTIC MODELS ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    hostel: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    created_at: datetime

class Moment(BaseModel):
    moment_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    user_hostel: Optional[str] = None
    user_department: Optional[str] = None
    moment_type: str
    title: str
    content: str
    tags: List[str] = []
    reactions: int = 0
    comments_count: int = 0
    created_at: datetime

class Issue(BaseModel):
    issue_id: str
    user_id: str
    user_name: str
    title: str
    description: str
    category: str
    location: str
    status: str = "reported"
    affected_count: int = 1
    affected_users: List[str] = []
    images: List[str] = []
    timeline: List[dict] = []
    created_at: datetime
    updated_at: datetime

class Opportunity(BaseModel):
    opp_id: str
    user_id: str
    user_name: str
    title: str
    description: str
    opp_type: str
    department: List[str] = []
    year: List[int] = []
    deadline: Optional[str] = None
    link: Optional[str] = None
    saved_count: int = 0
    saved_by: List[str] = []
    verified: bool = False
    created_at: datetime

class Comment(BaseModel):
    comment_id: str
    entity_type: str
    entity_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    text: str
    created_at: datetime


# ============ AUTH HELPERS ============

async def get_user_from_token(request: Request) -> Optional[dict]:
    session_token = request.cookies.get("session_token")
    logger.info(f"Cookie session_token: {session_token[:30] if session_token else 'None'}...")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
            logger.info(f"Header session_token: {session_token[:30] if session_token else 'None'}...")
    
    if not session_token:
        logger.info("No session token found")
        return None
    
    # Look up session in database
    session_doc = db.find_session(session_token)
    logger.info(f"Session doc found: {session_doc is not None}")
    
    if not session_doc:
        logger.info(f"Session not found for token: {session_token[:30]}...")
        return None
    
    logger.info(f"Session user_id: {session_doc.get('user_id')}")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        logger.info("Session expired")
        return None
    
    user_doc = db.find_user_by_id(session_doc["user_id"])
    logger.info(f"User found: {user_doc.get('user_id') if user_doc else 'None'}")
    return user_doc


# ============ ADMIN MIDDLEWARE ============

def require_admin(func):
    """
    Decorator to require admin role for endpoint access.
    Automatically checks authentication and admin role.
    Makes current_admin available via request.state.current_admin
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Get request from kwargs or args
        request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        
        if not request:
            raise HTTPException(status_code=500, detail="Request object not found")
        
        # Check authentication
        user = await get_user_from_token(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Check admin role
        if user.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required. This action requires administrator privileges."
            )
        
        # Store admin user in request state instead of injecting as parameter
        request.state.current_admin = user
        return await func(*args, **kwargs)
    
    return wrapper


# ============ AUTHENTICATION ============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        session_data = resp.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = db.find_user_by_email(session_data["email"])
    
    if existing_user:
        user_id = existing_user["user_id"]
        db.update_user(user_id, {
            "name": session_data["name"],
            "picture": session_data.get("picture")
        })
    else:
        db.create_user({
            "user_id": user_id,
            "email": session_data["email"],
            "name": session_data["name"],
            "picture": session_data.get("picture"),
            "role": "student",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    session_token = session_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    db.create_session({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return db.find_user_by_id(user_id)

@api_router.post("/auth/dev-login")
async def dev_login(request: Request, response: Response):
    """Development login - bypasses external auth for testing"""
    body = await request.json()
    
    user_id = body.get("user_id")
    email = body.get("email")
    name = body.get("name")
    
    if not all([user_id, email, name]):
        raise HTTPException(status_code=400, detail="user_id, email, and name required")
    
    existing_user = db.find_user_by_email(email)

    if existing_user:
        # Use existing user_id
        user_id = existing_user.get("user_id")
        
        # Update user with new data (including role if provided)
        update_data = {
            "name": name,
            "picture": body.get("picture"),
            "department": body.get("department"),
            "section": body.get("section"),
            "year": body.get("year"),
            "class_info": body.get("class_info"),
            "is_active": body.get("is_active", True)
        }
        
        # Only update role if explicitly provided
        if body.get("role"):
            update_data["role"] = body.get("role")
        
        # Handle role-specific fields
        if body.get("role") == "teacher":
            # Teachers might have class_info instead of year/section
            update_data["class_info"] = body.get("class_info") or update_data.get("class_info")
            update_data["department"] = body.get("department") or update_data.get("department")
        elif body.get("role") == "admin":
            # Admins have minimal data
            update_data["department"] = body.get("department") or update_data.get("department")
        else:  # student
            update_data["section"] = body.get("section") or update_data.get("section")
            update_data["year"] = body.get("year") or update_data.get("year")
        
        db.update_user(user_id, update_data)
    else:
        # Prepare user data with new fields
        user_data = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": body.get("picture"),
            "role": body.get("role", "student"),
            "department": body.get("department"),
            "section": body.get("section"),
            "year": body.get("year"),
            "class_info": body.get("class_info"),
            "is_active": body.get("is_active", True),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Handle role-specific fields
        if body.get("role") == "teacher":
            # Teachers might have class_info instead of year/section
            user_data["class_info"] = body.get("class_info") or f"{user_data['department']} Faculty"
            user_data["department"] = body.get("department") or user_data["department"]
        elif body.get("role") == "admin":
            # Admins have minimal data
            user_data["department"] = body.get("department") or "Administration"
        else:  # student
            user_data["section"] = body.get("section") or "A"
            user_data["year"] = body.get("year") or 1
        
        db.create_user(user_data)
    
    session_token = f"dev_session_{uuid.uuid4().hex[:24]}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    db.create_session({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=7*24*60*60
    )
    
    # Return user data with session token for frontend storage
    user_data = db.find_user_by_id(user_id)
    user_data["session_token"] = session_token
    return user_data

@api_router.get("/auth/me")
async def get_current_user(request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        db.delete_session(session_token)
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}


# ============ MOMENTS ENDPOINTS ============

@api_router.get("/moments")
async def get_moments(request: Request, moment_type: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return db.get_moments(moment_type)

@api_router.get("/moments/{moment_id}")
async def get_moment_detail(moment_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    moment = db.find_moment(moment_id)
    if not moment:
        raise HTTPException(status_code=404, detail="Moment not found")
    
    moment["comments"] = db.get_comments("moment", moment_id)
    return moment

@api_router.post("/moments")
async def create_moment(request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    moment_id = f"moment_{uuid.uuid4().hex[:12]}"
    
    moment_doc = {
        "moment_id": moment_id,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_picture": user.get("picture"),
        "user_hostel": user.get("hostel"),
        "user_department": user.get("department"),
        "user_role": user.get("role", "student"),  # Add role for moderation
        "moment_type": body.get("moment_type"),
        "title": body.get("title"),
        "content": body.get("content"),
        "tags": body.get("tags", []),
        "image_url": body.get("image_url"),
        "reactions": 0,
        "comments_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "approved"  # Default to approved, only change if flagged
    }
    
    logger.info(f"Creating moment {moment_id}: '{moment_doc.get('title', 'No title')}'")
    
    # Run integrated AI content moderation BEFORE creating the moment
    try:
        flag_id = moderate_moment_with_integrated_ai(moment_doc)
        if flag_id:
            logger.info(f"Moment {moment_id} flagged for moderation: {flag_id}")
            # Set status to pending_review for flagged content
            moment_doc["status"] = "pending_review"
            moment_doc["moderation_flag_id"] = flag_id
        else:
            logger.info(f"Moment {moment_id} passed content moderation - auto-approved")
            # Keep status as approved for clean content
            moment_doc["status"] = "approved"
    except Exception as e:
        logger.error(f"Error during content moderation for moment {moment_id}: {e}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # If moderation fails, default to pending review for safety
        moment_doc["status"] = "pending_review"
        logger.warning(f"Moment {moment_id} defaulted to pending_review due to moderation error")
    
    # Create the moment with appropriate status
    created_moment = db.create_moment(moment_doc)
    logger.info(f"Moment {moment_id} created with status: {created_moment.get('status')}")
    
    # Auto-create issue if moment is issue-related
    issue_types = ['issue', 'issue_observation', 'complaint', 'problem', 'report']
    tags = body.get("tags", [])
    issue_tags = ['issue', 'problem', 'broken', 'maintenance', 'repair', 'fix', 'complaint', 'drainage', 'trash', 'garbage', 'water', 'electricity', 'wifi', 'food', 'hostel', 'infrastructure', 'safety']
    
    is_issue_moment = (
        body.get("moment_type") in issue_types or
        any(tag.lower() in issue_tags for tag in tags) or
        'issue' in body.get("title", "").lower() or
        'problem' in body.get("title", "").lower() or
        'broken' in body.get("title", "").lower()
    )
    
    if is_issue_moment:
        try:
            # Create corresponding issue
            issue_id = f"issue_{uuid.uuid4().hex[:12]}"
            now = datetime.now(timezone.utc)
            
            # Map tags to category
            category = "other"
            if any(t in ['hostel', 'mess', 'food', 'water'] for t in [t.lower() for t in tags]):
                category = "hostel"
            elif any(t in ['infrastructure', 'drainage', 'trash', 'garbage', 'building'] for t in [t.lower() for t in tags]):
                category = "infrastructure"
            elif any(t in ['safety', 'security', 'emergency'] for t in [t.lower() for t in tags]):
                category = "safety"
            elif any(t in ['academic', 'exam', 'class', 'lecture'] for t in [t.lower() for t in tags]):
                category = "academic"
            
            issue_doc = {
                "issue_id": issue_id,
                "user_id": user["user_id"],
                "user_name": user["name"],
                "title": body.get("title"),
                "description": body.get("content"),
                "category": category,
                "location": user.get("department", "Campus"),
                "status": "reported",
                "affected_count": 1,
                "affected_users": [user["user_id"]],
                "images": [body.get("image_url")] if body.get("image_url") else [],
                "timeline": [{
                    "status": "reported",
                    "message": f"Issue reported via community moment",
                    "user_name": user["name"],
                    "created_at": now.isoformat()
                }],
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "linked_moment_id": moment_id
            }
            
            created_issue = db.create_issue(issue_doc)
            logger.info(f"Auto-created issue {issue_id} from moment {moment_id}")
            
            # Add issue_id to the response
            created_moment["linked_issue_id"] = issue_id
        except Exception as e:
            logger.error(f"Failed to auto-create issue from moment: {e}")
            # Don't fail the moment creation if issue creation fails
    
    return created_moment

@api_router.post("/moments/with-image")
async def create_moment_with_image(
    request: Request,
    moment_type: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    tags: str = Form(""),
    image: UploadFile = File(None)
):
    """Create a moment with optional image upload"""
    user = await get_user_from_token(request)
    
    image_url = None
    
    if image and image.filename:
        file_ext = image.filename.split(".")[-1].lower()
        image_filename = f"moment_{uuid.uuid4().hex[:12]}.{file_ext}"
        image_path = UPLOAD_DIR / "moments" / image_filename
        
        with open(image_path, "wb") as buffer:
            image_bytes = await image.read()
            buffer.write(image_bytes)
        
        image_url = f"http://localhost:5000/api/uploads/moments/{image_filename}"
        logger.info(f"📸 Image saved: {image_url}")
    
    moment_id = f"moment_{uuid.uuid4().hex[:12]}"
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    
    moment_doc = {
        "moment_id": moment_id,
        "user_id": user["user_id"] if user else "dev_user",
        "user_name": user["name"] if user else "Dev User",
        "user_picture": user.get("picture") if user else None,
        "user_hostel": user.get("hostel") if user else None,
        "user_department": user.get("department") if user else None,
        "user_role": user.get("role", "student") if user else "student",  # Add role for moderation
        "moment_type": moment_type,
        "title": title,
        "content": content,
        "tags": tags_list,
        "image_url": image_url,
        "reactions": 0,
        "comments_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "approved"  # Default to approved, only change if flagged
    }
    
    logger.info(f"📝 Creating moment with image_url: {image_url}")
    logger.info(f"📝 Moment title: '{title}'")
    logger.info(f"📝 Moment type: '{moment_type}'")
    logger.info(f"📝 Tags: {tags_list}")
    
    # Run integrated AI content moderation BEFORE creating the moment
    try:
        flag_id = moderate_moment_with_integrated_ai(moment_doc)
        if flag_id:
            logger.info(f"Moment {moment_id} flagged for moderation: {flag_id}")
            moment_doc["status"] = "pending_review"
            moment_doc["moderation_flag_id"] = flag_id
        else:
            logger.info(f"Moment {moment_id} passed content moderation - auto-approved")
            moment_doc["status"] = "approved"
    except Exception as e:
        logger.error(f"Error during content moderation for moment {moment_id}: {e}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # If moderation fails, default to pending review for safety
        moment_doc["status"] = "pending_review"
        logger.warning(f"Moment {moment_id} defaulted to pending_review due to moderation error")
    
    # Create the moment with appropriate status
    created_moment = db.create_moment(moment_doc)
    logger.info(f"Moment {moment_id} created with status: {created_moment.get('status')}")
    
    # Auto-create issue if moment is issue-related
    issue_types = ['issue', 'issue_observation', 'complaint', 'problem', 'report']
    issue_tags = ['issue', 'problem', 'broken', 'maintenance', 'repair', 'fix', 'complaint', 'drainage', 'trash', 'garbage', 'water', 'electricity', 'wifi', 'food', 'hostel', 'infrastructure', 'safety', 'campus']
    
    is_issue_moment = (
        moment_type in issue_types or
        any(tag.lower() in issue_tags for tag in tags_list) or
        'issue' in title.lower() or
        'problem' in title.lower() or
        'broken' in title.lower() or
        'overflow' in title.lower() or
        'trash' in title.lower() or
        'drainage' in title.lower()
    )
    
    logger.info(f"📝 Is issue moment: {is_issue_moment}")
    
    if is_issue_moment and user:
        try:
            # Create corresponding issue
            issue_id = f"issue_{uuid.uuid4().hex[:12]}"
            now = datetime.now(timezone.utc)
            
            # Map tags to category
            category = "other"
            tags_lower = [t.lower() for t in tags_list]
            if any(t in ['hostel', 'mess', 'food', 'water'] for t in tags_lower):
                category = "hostel"
            elif any(t in ['infrastructure', 'drainage', 'trash', 'garbage', 'building', 'campus'] for t in tags_lower):
                category = "infrastructure"
            elif any(t in ['safety', 'security', 'emergency'] for t in tags_lower):
                category = "safety"
            elif any(t in ['academic', 'exam', 'class', 'lecture'] for t in tags_lower):
                category = "academic"
            
            issue_doc = {
                "issue_id": issue_id,
                "user_id": user["user_id"],
                "user_name": user["name"],
                "title": title,
                "description": content,
                "category": category,
                "location": user.get("department", "Campus"),
                "status": "reported",
                "affected_count": 1,
                "affected_users": [user["user_id"]],
                "images": [image_url] if image_url else [],
                "timeline": [{
                    "status": "reported",
                    "message": f"Issue reported via community moment",
                    "user_name": user["name"],
                    "created_at": now.isoformat()
                }],
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
            
            created_issue = db.create_issue(issue_doc)
            logger.info(f"✅ Auto-created issue {issue_id} from moment {moment_id}")
            
            # Add issue_id to the response
            created_moment["linked_issue_id"] = issue_id
        except Exception as e:
            logger.error(f"❌ Failed to auto-create issue from moment: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Don't fail the moment creation if issue creation fails
    
    return created_moment


# ============ ISSUES ENDPOINTS ============

@api_router.get("/issues")
async def get_issues(request: Request, category: Optional[str] = None, status: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return db.get_issues(category, status)

@api_router.get("/issues/{issue_id}")
async def get_issue_detail(issue_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    issue = db.find_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    issue["comments"] = db.get_comments("issue", issue_id)
    return issue

@api_router.post("/issues")
async def create_issue(request: Request):
    user = await get_user_from_token(request)
    if not user:
        logger.warning("Issue creation failed: Not authenticated")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        body = await request.json()
        logger.info(f"Issue creation request received from {user['name']} ({user['user_id']})")
        logger.info(f"Request body: {body}")
    except Exception as e:
        logger.error(f"Failed to parse request body: {e}")
        raise HTTPException(status_code=400, detail="Invalid request body")
    
    issue_id = f"issue_{uuid.uuid4().hex[:12]}"
    
    logger.info(f"Creating issue: {issue_id} by user {user['user_id']}")
    
    now = datetime.now(timezone.utc)
    timeline = [{
        "status": "reported",
        "message": "Issue reported",
        "user_name": user["name"],
        "created_at": now.isoformat()
    }]
    
    issue_doc = {
        "issue_id": issue_id,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "title": body.get("title"),
        "description": body.get("description"),
        "category": body.get("category"),
        "location": body.get("location"),
        "status": "reported",
        "affected_count": 1,
        "affected_users": [user["user_id"]],
        "images": body.get("images", []),
        "timeline": timeline,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    logger.info(f"Issue document prepared: {issue_doc}")
    
    try:
        created_issue = db.create_issue(issue_doc)
        if not created_issue:
            logger.error(f"Failed to create issue {issue_id} - database returned None")
            raise HTTPException(status_code=500, detail="Failed to create issue in database")
        
        logger.info(f"Issue created successfully: {issue_id}")
        logger.info(f"Created issue data: {created_issue}")
        return created_issue
    except Exception as e:
        logger.error(f"Error creating issue: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error creating issue: {str(e)}")

@api_router.post("/issues/{issue_id}/affected")
async def mark_affected(issue_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    issue = db.find_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    is_affected = user["user_id"] in issue.get("affected_users", [])
    
    if is_affected:
        db.update_issue_affected(issue_id, user["user_id"], add=False)
        return {"affected": False}
    else:
        db.update_issue_affected(issue_id, user["user_id"], add=True)
        return {"affected": True}

@api_router.put("/issues/{issue_id}/status")
@require_admin
async def update_issue_status_endpoint(issue_id: str, request: Request):
    """Update issue status (admin only) - now with audit logging"""
    current_admin = request.state.current_admin
    body = await request.json()
    new_status = body.get("status")
    message = body.get("message")
    
    # Get issue before update to notify affected users and for audit
    issue = db.find_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    old_status = issue.get("status")
    
    # Update status
    result = db.update_issue_status(issue_id, new_status, message, current_admin["name"])
    
    # Log the admin action
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="update_issue_status",
        entity_type="issue",
        entity_id=issue_id,
        old_value=old_status,
        new_value=new_status,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    # Notify issue reporter and affected users
    affected_users = issue.get("affected_users", [])
    notified_users = set()
    
    # Notify issue reporter
    if issue["user_id"] not in notified_users:
        notification_id = f"notif_{uuid.uuid4().hex[:12]}"
        db.create_notification({
            "notification_id": notification_id,
            "user_id": issue["user_id"],
            "type": "issue_update",
            "title": f"Issue status updated to {new_status.replace('_', ' ')}",
            "message": f'"{issue["title"]}" - {message}' if message else f'"{issue["title"]}"',
            "link": f"/issues/{issue_id}",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        notified_users.add(issue["user_id"])
    
    # Notify affected users (limit to first 10 to avoid spam)
    for affected_user_id in affected_users[:10]:
        if affected_user_id not in notified_users:
            notification_id = f"notif_{uuid.uuid4().hex[:12]}"
            db.create_notification({
                "notification_id": notification_id,
                "user_id": affected_user_id,
                "type": "issue_update",
                "title": f"Issue you're affected by: {new_status.replace('_', ' ')}",
                "message": f'"{issue["title"]}"',
                "link": f"/issues/{issue_id}",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            notified_users.add(affected_user_id)
    
    return result


# ============ OPPORTUNITIES ENDPOINTS ============

@api_router.get("/opportunities")
async def get_opportunities(request: Request, opp_type: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return db.get_opportunities(opp_type)

@api_router.get("/opportunities/{opp_id}")
async def get_opportunity_detail(opp_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    opportunity = db.find_opportunity(opp_id)
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    opportunity["comments"] = db.get_comments("opportunity", opp_id)
    return opportunity

@api_router.post("/opportunities")
async def create_opportunity(request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    opp_id = f"opp_{uuid.uuid4().hex[:12]}"
    
    opp_doc = {
        "opp_id": opp_id,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "title": body.get("title"),
        "description": body.get("description"),
        "opp_type": body.get("opp_type"),
        "department": body.get("department", []),
        "year": body.get("year", []),
        "deadline": body.get("deadline"),
        "link": body.get("link"),
        "saved_count": 0,
        "saved_by": [],
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    return db.create_opportunity(opp_doc)

@api_router.post("/opportunities/{opp_id}/save")
async def save_opportunity(opp_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    opportunity = db.find_opportunity(opp_id)
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    is_saved = user["user_id"] in opportunity.get("saved_by", [])
    
    if is_saved:
        db.update_opportunity_saved(opp_id, user["user_id"], save=False)
        return {"saved": False}
    else:
        db.update_opportunity_saved(opp_id, user["user_id"], save=True)
        return {"saved": True}


# ============ COMMENTS ENDPOINTS ============

@api_router.post("/comments")
async def create_comment(request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    comment_id = f"comment_{uuid.uuid4().hex[:12]}"
    
    comment_doc = {
        "comment_id": comment_id,
        "entity_type": body.get("entity_type"),
        "entity_id": body.get("entity_id"),
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_picture": user.get("picture"),
        "text": body.get("text"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = db.create_comment(comment_doc)
    
    entity_type = body.get("entity_type")
    entity_id = body.get("entity_id")
    
    if entity_type == "moment":
        db.update_moment_comments_count(entity_id)
        # Create notification for moment owner
        moment = db.find_moment(entity_id)
        if moment and moment["user_id"] != user["user_id"]:
            notification_id = f"notif_{uuid.uuid4().hex[:12]}"
            db.create_notification({
                "notification_id": notification_id,
                "user_id": moment["user_id"],
                "type": "comment",
                "title": f"{user['name']} commented on your moment",
                "message": body.get("text")[:100] + "..." if len(body.get("text", "")) > 100 else body.get("text"),
                "link": f"/community/{entity_id}",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    elif entity_type == "issue":
        # Create notification for issue owner
        issue = db.find_issue(entity_id)
        if issue and issue["user_id"] != user["user_id"]:
            notification_id = f"notif_{uuid.uuid4().hex[:12]}"
            db.create_notification({
                "notification_id": notification_id,
                "user_id": issue["user_id"],
                "type": "comment",
                "title": f"{user['name']} commented on your issue",
                "message": body.get("text")[:100] + "..." if len(body.get("text", "")) > 100 else body.get("text"),
                "link": f"/issues/{entity_id}",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    
    return result


# ============ PROFILE ENDPOINTS ============

@api_router.get("/profile/{user_id}")
async def get_user_profile(user_id: str, request: Request):
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.find_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Record profile view (if viewing someone else's profile)
    if current_user["user_id"] != user_id:
        db.record_profile_view(user_id, current_user["user_id"])
    
    moments = db.get_user_moments(user_id)
    issues = db.get_user_issues(user_id)
    stats = db.get_user_stats(user_id)
    badges = db.get_user_badges(user_id)
    
    # Check if current user is following this user
    is_following = db.is_following(current_user["user_id"], user_id) if current_user["user_id"] != user_id else False
    
    # Check and award any new badges
    if current_user["user_id"] == user_id:
        db.check_and_award_badges(user_id)
        badges = db.get_user_badges(user_id)  # Refresh badges
    
    # Get average rating
    average_rating = db.get_user_average_rating(user_id)
    
    return {
        "user": user,
        "moments": moments,
        "issues": issues,
        "stats": stats,
        "badges": badges,
        "average_rating": average_rating,
        "is_following": is_following
    }

@api_router.put("/profile/{user_id}")
async def update_user_profile(user_id: str, request: Request):
    """Update user profile"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Users can only update their own profile
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot update another user's profile")
    
    body = await request.json()
    
    # Filter allowed fields
    allowed_updates = {}
    for field in ['name', 'bio', 'skills', 'interests', 'hostel', 'department', 'year']:
        if field in body:
            allowed_updates[field] = body[field]
    
    if not allowed_updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    updated_user = db.update_user_profile(user_id, allowed_updates)
    return updated_user


@api_router.post("/profile/{user_id}/upload-picture")
async def upload_profile_picture(user_id: str, request: Request, image: UploadFile = File(...)):
    """Upload profile picture"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Users can only update their own profile picture
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot update another user's profile")
    
    # Create profiles directory if it doesn't exist
    profiles_dir = UPLOAD_DIR / "profiles"
    profiles_dir.mkdir(exist_ok=True)
    
    # Save the image
    file_ext = image.filename.split(".")[-1].lower()
    if file_ext not in ["jpg", "jpeg", "png", "gif", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Allowed: jpg, jpeg, png, gif, webp")
    
    image_filename = f"profile_{user_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    image_path = profiles_dir / image_filename
    
    with open(image_path, "wb") as buffer:
        image_bytes = await image.read()
        buffer.write(image_bytes)
    
    image_url = f"http://localhost:5000/api/uploads/profiles/{image_filename}"
    logger.info(f"📸 Profile picture saved: {image_url}")
    
    # Update user profile with new picture URL
    updated_user = db.update_user_profile(user_id, {"picture": image_url})
    
    return {"picture_url": image_url, "user": updated_user}


# ============ FOLLOW ENDPOINTS ============

@api_router.post("/users/{user_id}/follow")
async def follow_user(user_id: str, request: Request):
    """Follow a user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user["user_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if target user exists
    target_user = db.find_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already following
    if db.is_following(current_user["user_id"], user_id):
        raise HTTPException(status_code=400, detail="Already following this user")
    
    result = db.follow_user(current_user["user_id"], user_id)
    
    if result:
        # Create notification for followed user
        notification_id = f"notif_{uuid.uuid4().hex[:12]}"
        db.create_notification({
            "notification_id": notification_id,
            "user_id": user_id,
            "type": "follow",
            "title": f"{current_user['name']} started following you",
            "message": None,
            "link": f"/profile/{current_user['user_id']}",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "following": True,
        "followers_count": db.get_follower_count(user_id)
    }

@api_router.delete("/users/{user_id}/follow")
async def unfollow_user(user_id: str, request: Request):
    """Unfollow a user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user["user_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")
    
    success = db.unfollow_user(current_user["user_id"], user_id)
    
    return {
        "following": False,
        "followers_count": db.get_follower_count(user_id)
    }

@api_router.get("/users/{user_id}/followers")
async def get_user_followers(user_id: str, request: Request):
    """Get list of users following this user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    followers = db.get_followers(user_id)
    return {
        "followers": followers,
        "count": len(followers)
    }

@api_router.get("/users/{user_id}/following")
async def get_user_following(user_id: str, request: Request):
    """Get list of users this user is following"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    following = db.get_following(user_id)
    return {
        "following": following,
        "count": len(following)
    }


# ============ PROFILE VISITORS ENDPOINTS ============

@api_router.get("/profile/{user_id}/visitors")
async def get_profile_visitors(user_id: str, request: Request):
    """Get recent profile visitors"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Only profile owner can see visitors
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Can only view your own profile visitors")
    
    visitors = db.get_profile_visitors(user_id)
    view_count = db.get_profile_view_count(user_id)
    
    return {
        "visitors": visitors,
        "total_views": view_count
    }


# ============ PEER REVIEWS ENDPOINTS ============

@api_router.post("/users/{user_id}/reviews")
async def create_peer_review(user_id: str, request: Request):
    """Create a peer review for a user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user["user_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot review yourself")
    
    # Check if target user exists
    target_user = db.find_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already reviewed
    if db.has_reviewed_user(current_user["user_id"], user_id):
        raise HTTPException(status_code=400, detail="You have already reviewed this user")
    
    body = await request.json()
    rating = body.get("rating")
    
    if not rating or rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review = db.create_peer_review({
        "reviewer_id": current_user["user_id"],
        "reviewed_user_id": user_id,
        "rating": rating,
        "review_text": body.get("review_text")
    })
    
    # Create notification for reviewed user
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    db.create_notification({
        "notification_id": notification_id,
        "user_id": user_id,
        "type": "review",
        "title": f"{current_user['name']} left you a review",
        "message": f"Rating: {'⭐' * rating}",
        "link": f"/profile/{user_id}",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return review

@api_router.get("/users/{user_id}/reviews")
async def get_user_reviews(user_id: str, request: Request):
    """Get reviews for a user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    reviews = db.get_user_reviews(user_id)
    average_rating = db.get_user_average_rating(user_id)
    
    return {
        "reviews": reviews,
        "average_rating": average_rating,
        "review_count": len(reviews)
    }


# ============ BADGES ENDPOINTS ============

@api_router.get("/users/{user_id}/badges")
async def get_user_badges(user_id: str, request: Request):
    """Get badges for a user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    badges = db.get_user_badges(user_id)
    return {"badges": badges}

@api_router.post("/users/{user_id}/badges/check")
async def check_badges(user_id: str, request: Request):
    """Check and award any earned badges"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Only check own badges
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Can only check your own badges")
    
    awarded = db.check_and_award_badges(user_id)
    all_badges = db.get_user_badges(user_id)
    
    return {
        "newly_awarded": awarded,
        "all_badges": all_badges
    }


# ============ ACTIVITY ENDPOINTS ============

@api_router.get("/users/{user_id}/activity")
async def get_user_activity(user_id: str, request: Request):
    """Get activity history for a user"""
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    activity = db.get_user_activity(user_id)
    return {"activity": activity}


# ============ IMAGE ANALYSIS ENDPOINT ============

from services.universal_vision_service import analyze_image_universal

@api_router.post("/analyze-image-universal")
async def analyze_image_universal_endpoint(
    image: UploadFile = File(...),
    context_hint: Optional[str] = Form(None),
    user_caption: Optional[str] = Form(None)
):
    """Universal image analysis endpoint"""
    
    temp_file_path = None
    
    try:
        file_ext = image.filename.split(".")[-1].lower()
        temp_filename = f"temp_{uuid.uuid4().hex}.{file_ext}"
        temp_file_path = UPLOAD_DIR / temp_filename
        
        with open(temp_file_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        logger.info(f"🔍 Universal analysis: {image.filename}")
        
        vision_result = await analyze_image_universal(
            image_path=str(temp_file_path),
            context_hint=context_hint,
            user_caption=user_caption
        )
        
        detected_context = vision_result.get("detected_context")
        confidence = vision_result.get("confidence", 0)
        
        logger.info(f"✅ Detected: {detected_context} ({confidence}% confidence)")
        
        return {
            "success": True,
            "detected_context": detected_context,
            "confidence": confidence,
            "reasoning": vision_result.get("reasoning"),
            "auto_fill_data": vision_result.get("auto_fill_preview", {}),
            "extracted_data": vision_result.get("extracted_data", {}),
            "validation": {
                "is_authentic": True,
                "ai_probability": 0
            }
        }
        
    except Exception as e:
        logger.error(f"Universal analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        if temp_file_path and temp_file_path.exists():
            try:
                import time
                time.sleep(0.1)
                temp_file_path.unlink()
            except Exception as e:
                logger.warning(f"Could not delete temp file: {e}")


# ============ NOTIFICATIONS ENDPOINTS ============

@api_router.get("/notifications")
async def get_notifications(request: Request, unread_only: bool = False):
    """Get notifications for the current user"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    notifications = db.get_notifications(user["user_id"], unread_only=unread_only)
    unread_count = db.get_unread_notification_count(user["user_id"])
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, request: Request):
    """Mark a single notification as read"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    success = db.mark_notification_read(notification_id, user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}

@api_router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(request: Request):
    """Mark all notifications as read for the current user"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    count = db.mark_all_notifications_read(user["user_id"])
    return {"success": True, "marked_count": count}


# ============ REACTIONS ENDPOINTS ============

@api_router.post("/moments/{moment_id}/react")
async def react_to_moment(moment_id: str, request: Request):
    """Add or remove a reaction to a moment (toggle)"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    moment = db.find_moment(moment_id)
    if not moment:
        raise HTTPException(status_code=404, detail="Moment not found")
    
    # Check if user already reacted
    existing_reaction = db.get_reaction(user["user_id"], "moment", moment_id)
    
    if existing_reaction:
        # Remove reaction
        db.delete_reaction(user["user_id"], "moment", moment_id)
        db.update_moment_reactions_count(moment_id)
        return {"reacted": False, "reactions_count": db.get_reaction_count("moment", moment_id)}
    else:
        # Add reaction
        reaction_id = f"reaction_{uuid.uuid4().hex[:12]}"
        db.create_reaction({
            "reaction_id": reaction_id,
            "user_id": user["user_id"],
            "entity_type": "moment",
            "entity_id": moment_id,
            "reaction_type": "like",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        db.update_moment_reactions_count(moment_id)
        
        # Create notification for moment owner (if not self)
        if moment["user_id"] != user["user_id"]:
            notification_id = f"notif_{uuid.uuid4().hex[:12]}"
            db.create_notification({
                "notification_id": notification_id,
                "user_id": moment["user_id"],
                "type": "reaction",
                "title": f"{user['name']} liked your moment",
                "message": f'"{moment["title"][:50]}..."' if len(moment["title"]) > 50 else f'"{moment["title"]}"',
                "link": f"/community/{moment_id}",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        return {"reacted": True, "reactions_count": db.get_reaction_count("moment", moment_id)}

@api_router.get("/moments/{moment_id}/reactions")
async def get_moment_reactions(moment_id: str, request: Request):
    """Get reaction status for a moment"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    moment = db.find_moment(moment_id)
    if not moment:
        raise HTTPException(status_code=404, detail="Moment not found")
    
    user_reacted = db.get_reaction(user["user_id"], "moment", moment_id) is not None
    reactions_count = db.get_reaction_count("moment", moment_id)
    
    return {
        "user_reacted": user_reacted,
        "reactions_count": reactions_count
    }

@api_router.get("/user/reactions")
async def get_user_reactions(request: Request, entity_type: Optional[str] = None):
    """Get all reactions by the current user"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    reactions = db.get_user_reactions(user["user_id"], entity_type)
    return {"reactions": reactions}


# ============ SEARCH ENDPOINTS ============

@api_router.get("/search")
async def global_search(request: Request, q: str, type: Optional[str] = None):
    """Global search across moments, users, and opportunities"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not q or len(q) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    results = {}
    
    if type is None or type == "moments":
        results["moments"] = db.search_moments(q, limit=10)
    
    if type is None or type == "people":
        results["people"] = db.search_users(q, limit=10)
    
    if type is None or type == "opportunities":
        results["opportunities"] = db.search_opportunities(q, limit=10)
    
    if type is None or type == "issues":
        results["issues"] = db.search_issues(q, limit=10)
    
    return results


# ============ ADMIN ENDPOINTS ============

@api_router.get("/admin/audit-logs")
@require_admin
async def get_audit_logs_endpoint(
    request: Request,
    admin_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """
    Get audit logs for admin actions (admin only)
    
    Query Parameters:
    - admin_id: Filter by specific admin user
    - entity_type: Filter by entity type (e.g., 'issue', 'flagged_content')
    - entity_id: Filter by specific entity ID
    - limit: Maximum number of logs to return (default: 100)
    - offset: Number of logs to skip for pagination (default: 0)
    """
    logs = db.get_audit_logs(
        admin_id=admin_id,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
        offset=offset
    )
    
    total_count = db.get_audit_log_count(
        admin_id=admin_id,
        entity_type=entity_type
    )
    
    return {
        "logs": logs,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + len(logs)) < total_count
    }


@api_router.get("/admin/moderation/flagged")
@require_admin
async def get_flagged_content_endpoint(
    request: Request,
    status: Optional[str] = None,
    risk_category: Optional[str] = None,
    risk_severity: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Get flagged content for moderation (admin only)"""
    flagged_items = db.get_flagged_content(
        status=status,
        risk_category=risk_category,
        risk_severity=risk_severity,
        limit=limit,
        offset=offset
    )
    
    return {
        "flagged_content": flagged_items,
        "count": len(flagged_items),
        "limit": limit,
        "offset": offset
    }


@api_router.post("/admin/moderation/{flag_id}/approve")
@require_admin
async def approve_flagged_content(flag_id: str, request: Request):
    """Approve flagged content (admin only)"""
    current_admin = request.state.current_admin
    body = await request.json()
    reason = body.get("reason")
    
    # Get the flagged content
    flagged = db.get_flagged_content_by_id(flag_id)
    if not flagged:
        raise HTTPException(status_code=404, detail="Flagged content not found")
    
    # Update status to approved
    updated = db.update_flagged_content_status(
        flag_id=flag_id,
        status="approved",
        reviewed_by=current_admin["user_id"]
    )
    
    # Update the original post status to approved
    if flagged["post_type"] == "moment":
        db.update_moment_status(flagged["post_id"], "approved")
    
    # Create moderation log entry
    log_id = f"modlog_{uuid.uuid4().hex[:12]}"
    db.create_moderation_log({
        "log_id": log_id,
        "flag_id": flag_id,
        "post_id": flagged["post_id"],
        "action": "approved",
        "admin_id": current_admin["user_id"],
        "admin_name": current_admin["name"],
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="approve_content",
        entity_type="flagged_content",
        entity_id=flag_id,
        old_value=flagged["status"],
        new_value="approved",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"success": True, "flagged_content": updated}


@api_router.post("/admin/moderation/{flag_id}/remove")
@require_admin
async def remove_flagged_content(flag_id: str, request: Request):
    """Remove flagged content (admin only)"""
    current_admin = request.state.current_admin
    body = await request.json()
    reason = body.get("reason")
    
    # Get the flagged content
    flagged = db.get_flagged_content_by_id(flag_id)
    if not flagged:
        raise HTTPException(status_code=404, detail="Flagged content not found")
    
    # Update status to removed
    updated = db.update_flagged_content_status(
        flag_id=flag_id,
        status="removed",
        reviewed_by=current_admin["user_id"]
    )
    
    # Update the original post status to removed
    if flagged["post_type"] == "moment":
        db.update_moment_status(flagged["post_id"], "removed")
    
    # Create moderation log entry
    log_id = f"modlog_{uuid.uuid4().hex[:12]}"
    db.create_moderation_log({
        "log_id": log_id,
        "flag_id": flag_id,
        "post_id": flagged["post_id"],
        "action": "removed",
        "admin_id": current_admin["user_id"],
        "admin_name": current_admin["name"],
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="remove_content",
        entity_type="flagged_content",
        entity_id=flag_id,
        old_value=flagged["status"],
        new_value="removed",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"success": True, "flagged_content": updated}


@api_router.post("/admin/moderation/{flag_id}/review")
@require_admin
async def mark_reviewed(flag_id: str, request: Request):
    """Mark flagged content as reviewed (admin only)"""
    current_admin = request.state.current_admin
    body = await request.json()
    reason = body.get("reason")
    
    # Get the flagged content
    flagged = db.get_flagged_content_by_id(flag_id)
    if not flagged:
        raise HTTPException(status_code=404, detail="Flagged content not found")
    
    # Update status to reviewed
    updated = db.update_flagged_content_status(
        flag_id=flag_id,
        status="reviewed",
        reviewed_by=current_admin["user_id"]
    )
    
    # Create moderation log entry
    log_id = f"modlog_{uuid.uuid4().hex[:12]}"
    db.create_moderation_log({
        "log_id": log_id,
        "flag_id": flag_id,
        "post_id": flagged["post_id"],
        "action": "reviewed",
        "admin_id": current_admin["user_id"],
        "admin_name": current_admin["name"],
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="review_content",
        entity_type="flagged_content",
        entity_id=flag_id,
        old_value=flagged["status"],
        new_value="reviewed",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"success": True, "flagged_content": updated}


@api_router.get("/admin/moderation/log")
@require_admin
async def get_moderation_log_endpoint(
    request: Request,
    flag_id: Optional[str] = None,
    admin_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Get moderation action log (admin only)"""
    logs = db.get_moderation_logs(
        flag_id=flag_id,
        admin_id=admin_id,
        limit=limit,
        offset=offset
    )
    
    return {
        "logs": logs,
        "count": len(logs),
        "limit": limit,
        "offset": offset
    }


@api_router.get("/admin/moderation/stats")
@require_admin
async def get_moderation_stats_endpoint(request: Request):
    """Get moderation statistics (admin only)"""
    stats = db.get_moderation_stats()
    return stats


# ============ ADMIN USER MANAGEMENT ENDPOINTS ============

@api_router.get("/admin/users")
@require_admin
async def get_all_users_endpoint(
    request: Request,
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """Get all users with optional filtering (admin only)"""
    users = db.get_all_users(role=role, search=search, limit=limit, offset=offset)
    total = db.get_user_count(role=role)
    
    # Remove password hashes from response
    for user in users:
        if 'password_hash' in user:
            del user['password_hash']
    
    return {
        "users": users,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@api_router.get("/admin/users/{user_id}")
@require_admin
async def get_user_by_id_endpoint(
    request: Request,
    user_id: str
):
    """Get detailed user information by ID (admin only)"""
    user = db.find_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove password hash from response
    if 'password_hash' in user:
        del user['password_hash']
    
    return {"user": user}


@api_router.put("/admin/users/{user_id}/role")
@require_admin
async def update_user_role_endpoint(
    request: Request,
    user_id: str,
    role: str = Form(...)
):
    """Update user role (admin only)"""
    current_admin = request.state.current_admin
    # Validate role
    valid_roles = ['student', 'faculty', 'admin']
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")
    
    # Get current user to get old role
    user = db.find_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = user.get('role')
    
    # Update role
    updated_user = db.update_user_role(user_id, role)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Failed to update user role")
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="update_user_role",
        entity_type="user",
        entity_id=user_id,
        old_value=old_role,
        new_value=role,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    # Remove password hash from response
    if 'password_hash' in updated_user:
        del updated_user['password_hash']
    
    return {"success": True, "user": updated_user}


@api_router.put("/admin/users/{user_id}/status")
@require_admin
async def update_user_status_endpoint(
    request: Request,
    user_id: str,
    is_active: bool = Form(...)
):
    """Update user active status (admin only)"""
    current_admin = request.state.current_admin
    # Get current user
    user = db.find_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Note: The current database schema doesn't have an is_active field
    # This endpoint is implemented for future compatibility
    # For now, we just log the action and return success
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="update_user_status",
        entity_type="user",
        entity_id=user_id,
        old_value="active" if user.get("is_active", True) else "inactive",
        new_value="active" if is_active else "inactive",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    # Remove password hash from response
    if 'password_hash' in user:
        del user['password_hash']
    
    return {
        "success": True,
        "user": user,
        "note": "User status field not yet implemented in database schema"
    }


@api_router.get("/admin/users/stats")
@require_admin
async def get_user_stats_endpoint(request: Request):
    """Get user statistics for admin dashboard (admin only)"""
    stats = db.get_admin_user_stats()
    return stats


# ============ ANALYTICS & STATISTICS ENDPOINTS ============

@api_router.get("/admin/stats")
async def get_admin_stats_endpoint(request: Request):
    """
    Get comprehensive platform statistics (admin only)
    """
    try:
        # Check if user is admin
        user = await get_user_from_token(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        logger.info(f"Admin stats requested by: {user['name']} ({user['user_id']})")
        
        stats = db.get_platform_stats()
        logger.info(f"Admin stats fetched successfully")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        # Return basic stats as fallback
        return {
            "platform": {
                "total_users": db.get_user_count(),
                "total_issues": len(db.get_issues()),
                "total_moments": len(db.get_moments()),
                "total_opportunities": len(db.get_opportunities()),
            },
            "error": str(e)
        }


@api_router.get("/admin/stats/users")
@require_admin
async def get_user_statistics_endpoint(request: Request):
    """
    Get detailed user statistics (admin only)
    
    Returns:
    - Total users count
    - User counts by role (student, faculty, admin)
    - Recent user signups (7 days, 30 days)
    - User growth metrics
    """
    # This endpoint already exists, just reuse it
    stats = db.get_user_stats()
    return stats


@api_router.get("/admin/stats/content")
@require_admin
async def get_content_statistics_endpoint(request: Request):
    """
    Get content statistics by type (admin only)
    
    Returns detailed breakdown of:
    - Issues by status and category
    - Moments by category
    - Opportunities by type
    - Engagement metrics (comments, reactions, averages)
    """
    stats = db.get_content_stats()
    return stats


@api_router.get("/admin/analytics/trends")
@require_admin
async def get_trends_endpoint(
    request: Request,
    days: int = 7
):
    """
    Get activity trends over time (admin only)
    
    Query Parameters:
    - days: Number of days to analyze (default: 7, max: 90)
    
    Returns:
    - Daily activity counts for users, issues, moments, opportunities, comments
    - Total counts for the period
    - Average daily activity metrics
    """
    # Limit days parameter
    days = max(1, min(days, 90))
    trends = db.get_activity_trends(days=days)
    return trends


# ============ SYSTEM CONFIGURATION ENDPOINTS ============

@api_router.get("/admin/config")
@require_admin
async def get_system_config_endpoint(request: Request):
    """Get all system configuration settings (admin only)"""
    config = db.get_all_config()
    return {"config": config}


@api_router.get("/admin/config/{key}")
@require_admin
async def get_config_value_endpoint(request: Request, key: str):
    """Get specific configuration value (admin only)"""
    config = db.get_config(key)
    if not config:
        raise HTTPException(status_code=404, detail=f"Configuration key '{key}' not found")
    return config


@api_router.put("/admin/config/{key}")
@require_admin
async def update_config_value_endpoint(
    request: Request,
    key: str,
    value: str = Form(...),
    config_type: str = Form("string"),
    description: str = Form("")
):
    """Update configuration value (admin only)"""
    current_admin = request.state.current_admin
    # Get old value for audit log
    old_config = db.get_config(key)
    old_value = old_config.get("config_value") if old_config else None
    
    # Update config
    updated = db.set_config(
        key=key,
        value=value,
        config_type=config_type,
        description=description,
        updated_by=current_admin["user_id"]
    )
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="update_config",
        entity_type="system_config",
        entity_id=key,
        old_value=old_value,
        new_value=value,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"success": True, "config": updated}


# ============ DATA EXPORT ENDPOINTS ============

@api_router.get("/admin/export/issues")
@require_admin
async def export_issues_endpoint(
    request: Request,
    format: str = "csv",
    status: Optional[str] = None,
    category: Optional[str] = None
):
    """Export issues to CSV or JSON (admin only)"""
    from datetime import datetime
    import io
    import csv
    import json
    from fastapi.responses import StreamingResponse
    
    # Get issues with optional filtering
    issues = db.get_all_issues(status=status, category=category, limit=10000)
    
    if format.lower() == "csv":
        # Create CSV
        output = io.StringIO()
        if issues:
            fieldnames = ["issue_id", "title", "category", "status", "location", "created_at", "affected_count", "user_id"]
            writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            for issue in issues:
                writer.writerow(issue)
        
        # Create response
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"issues_export_{timestamp}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        # Return JSON
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"issues_export_{timestamp}.json"
        
        return Response(
            content=json.dumps({"issues": issues, "count": len(issues)}, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )


@api_router.get("/admin/export/users")
@require_admin
async def export_users_endpoint(
    request: Request,
    format: str = "csv",
    role: Optional[str] = None
):
    """Export users to CSV or JSON (admin only)"""
    from datetime import datetime
    import io
    import csv
    import json
    from fastapi.responses import StreamingResponse
    
    # Get users with optional filtering
    users = db.get_all_users(role=role, limit=10000)
    
    # Remove password hashes
    for user in users:
        if 'password_hash' in user:
            del user['password_hash']
    
    if format.lower() == "csv":
        # Create CSV
        output = io.StringIO()
        if users:
            fieldnames = ["user_id", "name", "email", "role", "department", "year", "created_at"]
            writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            for user in users:
                writer.writerow(user)
        
        # Create response
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"users_export_{timestamp}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        # Return JSON
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"users_export_{timestamp}.json"
        
        return Response(
            content=json.dumps({"users": users, "count": len(users)}, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )


# ============ BULK OPERATIONS ENDPOINTS ============

@api_router.post("/admin/issues/bulk-update")
@require_admin
async def bulk_update_issues_endpoint(
    request: Request
):
    """Update multiple issues at once (admin only)"""
    current_admin = request.state.current_admin
    from datetime import datetime, timezone
    
    # Parse request body
    body = await request.json()
    issue_ids = body.get("issue_ids", [])
    new_status = body.get("status")
    
    if not issue_ids:
        raise HTTPException(status_code=400, detail="issue_ids required")
    
    if not new_status:
        raise HTTPException(status_code=400, detail="status required")
    
    # Validate status
    valid_statuses = ['reported', 'acknowledged', 'in_progress', 'resolved']
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    # Process each issue
    results = []
    updated_count = 0
    failed_count = 0
    
    for issue_id in issue_ids:
        try:
            # Get issue
            issue = db.get_issue_by_id(issue_id)
            if not issue:
                results.append({
                    "issue_id": issue_id,
                    "status": "failed",
                    "error": "Issue not found"
                })
                failed_count += 1
                continue
            
            old_status = issue.get("status")
            
            # Update status
            db.update_issue_status(issue_id, new_status)
            
            # Log to audit trail
            AuditService.log_action(
                admin_id=current_admin["user_id"],
                admin_name=current_admin["name"],
                action_type="bulk_update_issue_status",
                entity_type="issue",
                entity_id=issue_id,
                old_value=old_status,
                new_value=new_status,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
            
            results.append({
                "issue_id": issue_id,
                "status": "success",
                "old_status": old_status,
                "new_status": new_status
            })
            updated_count += 1
            
        except Exception as e:
            results.append({
                "issue_id": issue_id,
                "status": "failed",
                "error": str(e)
            })
            failed_count += 1
    
    return {
        "success": True,
        "updated_count": updated_count,
        "failed_count": failed_count,
        "results": results
    }


# ============ STATIC FILES ============

@app.get("/api/uploads/moments/{filename}")
async def serve_moment_image(filename: str):
    """Serve uploaded moment images"""
    file_path = UPLOAD_DIR / "moments" / filename
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")


@app.get("/api/uploads/profiles/{filename}")
async def serve_profile_image(filename: str):
    """Serve uploaded profile pictures"""
    file_path = UPLOAD_DIR / "profiles" / filename
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")


# ============ MIDDLEWARE & ROUTER ============

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ ADMIN ISSUES ENDPOINTS ============

@api_router.get("/admin/issues")
@require_admin
async def get_all_issues_admin(request: Request, 
                              category: Optional[str] = None, 
                              status: Optional[str] = None,
                              limit: int = 100,
                              offset: int = 0):
    """Get all issues for admin dashboard (admin only)"""
    current_admin = request.state.current_admin
    
    # Get all issues without filtering (admin can see everything)
    issues = db.get_issues(category=category, status=status, limit=limit, offset=offset)
    
    # Get total count for pagination
    total_count = db.get_issues_count(category=category, status=status)
    
    return {
        "issues": issues,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": offset + len(issues) < total_count
    }

@api_router.get("/admin/issues/stats")
@require_admin
async def get_issues_stats_admin(request: Request):
    """Get issue statistics for admin dashboard (admin only)"""
    current_admin = request.state.current_admin
    
    stats = db.get_issues_stats()
    return stats

@api_router.post("/admin/issues/run-analysis")
async def run_ai_analysis_endpoint(request: Request):
    """Run AI analysis to cluster similar issues (admin only)"""
    try:
        # Check if user is admin
        user = await get_user_from_token(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        logger.info(f"AI analysis requested by: {user['name']} ({user['user_id']})")
        
        # Get fresh issues and moments from database
        all_issues = db.get_issues(limit=1000)
        all_moments = db.get_moments(limit=1000)
        
        # Use integrated AI service for analysis
        aggregated_issues = generate_insights_with_fallback(all_issues, all_moments)
        clusters_found = len(aggregated_issues)
        total_processed = len(all_issues) + len(all_moments)
        
        analysis_result = {
            "success": True,
            "clusters_found": clusters_found,
            "aggregated_issues": aggregated_issues,
            "analysis_time": datetime.now(timezone.utc).isoformat(),
            "total_issues_processed": total_processed
        }
        
        if analysis_result["success"]:
            logger.info(f"AI analysis completed: {analysis_result['clusters_found']} clusters found")
            
            # Log to audit trail
            AuditService.log_action(
                admin_id=user["user_id"],
                admin_name=user["name"],
                action_type="run_ai_analysis",
                entity_type="issues",
                entity_id="all",
                new_value=f"{analysis_result['clusters_found']} clusters found",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
        else:
            logger.error(f"AI analysis failed: {analysis_result.get('error')}")
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running AI analysis: {e}")
        return {
            "success": False,
            "error": str(e),
            "clusters_found": 0,
            "aggregated_issues": []
        }


@api_router.get("/admin/issues/aggregated")
async def get_aggregated_issues_endpoint(request: Request):
    """Get AI-aggregated issue clusters (admin only)"""
    try:
        # Check if user is admin
        user = await get_user_from_token(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get fresh issues and moments from database
        all_issues = db.get_issues(limit=1000)
        all_moments = db.get_moments(limit=1000)
        
        # Use integrated AI service for analysis
        aggregated_issues = generate_insights_with_fallback(all_issues, all_moments)
        clusters_found = len(aggregated_issues)
        
        return {
            "aggregated_issues": aggregated_issues,
            "total_clusters": clusters_found,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching aggregated issues: {e}")
        return {
            "aggregated_issues": [],
            "total_clusters": 0,
            "error": str(e)
        }


# ============ ADMIN OPPORTUNITY MANAGEMENT ============

def require_admin_or_teacher(func):
    """
    Decorator to require admin or teacher role for endpoint access.
    Makes current_user available via request.state.current_user
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        
        if not request:
            raise HTTPException(status_code=500, detail="Request object not found")
        
        user = await get_user_from_token(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.get("role") not in ["admin", "teacher", "faculty"]:
            raise HTTPException(
                status_code=403,
                detail="Admin or Teacher access required."
            )
        
        request.state.current_user = user
        return await func(*args, **kwargs)
    
    return wrapper


@api_router.post("/admin/opportunities")
@require_admin
async def create_admin_opportunity(request: Request):
    """Create a verified opportunity (admin only)"""
    current_admin = request.state.current_admin
    body = await request.json()
    
    opp_id = f"opp_{uuid.uuid4().hex[:12]}"
    
    opp_doc = {
        "opp_id": opp_id,
        "user_id": current_admin["user_id"],
        "user_name": current_admin["name"],
        "title": body.get("title"),
        "description": body.get("description"),
        "opp_type": body.get("opp_type"),
        "organization": body.get("organization", ""),
        "location": body.get("location", ""),
        "duration": body.get("duration", ""),
        "stipend": body.get("stipend", ""),
        "eligibility": body.get("eligibility", ""),
        "department": body.get("department", []),
        "year": body.get("year", []),
        "deadline": body.get("deadline"),
        "link": body.get("link"),
        "saved_count": 0,
        "saved_by": [],
        "verified": True,  # Admin-created opportunities are auto-verified
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    created_opp = db.create_opportunity(opp_doc)
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="create_opportunity",
        entity_type="opportunity",
        entity_id=opp_id,
        new_value=body.get("title"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    logger.info(f"Admin {current_admin['name']} created opportunity: {opp_id}")
    
    return created_opp


@api_router.post("/teacher/opportunities")
@require_admin_or_teacher
async def create_teacher_opportunity(request: Request):
    """Create a verified opportunity (teacher/faculty)"""
    current_user = request.state.current_user
    body = await request.json()
    
    opp_id = f"opp_{uuid.uuid4().hex[:12]}"
    
    opp_doc = {
        "opp_id": opp_id,
        "user_id": current_user["user_id"],
        "user_name": current_user["name"],
        "title": body.get("title"),
        "description": body.get("description"),
        "opp_type": body.get("opp_type"),
        "organization": body.get("organization", ""),
        "location": body.get("location", ""),
        "duration": body.get("duration", ""),
        "stipend": body.get("stipend", ""),
        "eligibility": body.get("eligibility", ""),
        "department": body.get("department", []),
        "year": body.get("year", []),
        "deadline": body.get("deadline"),
        "link": body.get("link"),
        "saved_count": 0,
        "saved_by": [],
        "verified": True,  # Teacher-created opportunities are also verified
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    created_opp = db.create_opportunity(opp_doc)
    
    logger.info(f"Teacher {current_user['name']} created opportunity: {opp_id}")
    
    return created_opp


@api_router.get("/admin/opportunities")
@require_admin
async def get_admin_opportunities(request: Request, limit: int = 100, offset: int = 0):
    """Get all opportunities for admin management (admin only)"""
    current_admin = request.state.current_admin
    
    opportunities = db.get_opportunities(limit=limit)
    
    return {
        "opportunities": opportunities,
        "total": len(opportunities),
        "limit": limit,
        "offset": offset
    }


@api_router.put("/admin/opportunities/{opp_id}")
@require_admin
async def update_admin_opportunity(opp_id: str, request: Request):
    """Update an opportunity (admin only)"""
    current_admin = request.state.current_admin
    body = await request.json()
    
    # Get existing opportunity
    existing = db.find_opportunity(opp_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Update opportunity
    updated = db.update_opportunity(opp_id, body)
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="update_opportunity",
        entity_type="opportunity",
        entity_id=opp_id,
        old_value=existing.get("title"),
        new_value=body.get("title", existing.get("title")),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return updated


@api_router.delete("/admin/opportunities/{opp_id}")
@require_admin
async def delete_admin_opportunity(opp_id: str, request: Request):
    """Delete an opportunity (admin only)"""
    current_admin = request.state.current_admin
    
    # Get existing opportunity
    existing = db.find_opportunity(opp_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Delete opportunity
    success = db.delete_opportunity(opp_id)
    
    if success:
        # Log to audit trail
        AuditService.log_action(
            admin_id=current_admin["user_id"],
            admin_name=current_admin["name"],
            action_type="delete_opportunity",
            entity_type="opportunity",
            entity_id=opp_id,
            old_value=existing.get("title"),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        return {"success": True, "message": "Opportunity deleted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete opportunity")


@api_router.put("/admin/opportunities/{opp_id}/verify")
@require_admin
async def verify_opportunity(opp_id: str, request: Request):
    """Verify/unverify an opportunity (admin only)"""
    current_admin = request.state.current_admin
    body = await request.json()
    verified = body.get("verified", True)
    
    # Get existing opportunity
    existing = db.find_opportunity(opp_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Update verification status
    updated = db.update_opportunity(opp_id, {"verified": verified})
    
    # Log to audit trail
    AuditService.log_action(
        admin_id=current_admin["user_id"],
        admin_name=current_admin["name"],
        action_type="verify_opportunity" if verified else "unverify_opportunity",
        entity_type="opportunity",
        entity_id=opp_id,
        old_value=str(existing.get("verified")),
        new_value=str(verified),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return updated


# ============ TEACHER CLASS MANAGEMENT ENDPOINTS ============

def require_teacher(func):
    """Decorator to require teacher/faculty role"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        
        if not request:
            raise HTTPException(status_code=500, detail="Request object not found")
        
        user = await get_user_from_token(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.get("role") not in ["teacher", "faculty"]:
            raise HTTPException(status_code=403, detail="Teacher access required")
        
        request.state.current_teacher = user
        return await func(*args, **kwargs)
    
    return wrapper


@api_router.get("/teacher/classes")
@require_teacher
async def get_teacher_classes_endpoint(request: Request):
    """Get all classes assigned to the teacher"""
    teacher = request.state.current_teacher
    classes = cm.get_teacher_classes(teacher["user_id"])
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    return {
        "classes": classes,
        "active_class_id": active_class_id,
        "total": len(classes)
    }


@api_router.post("/teacher/classes/switch")
@require_teacher
async def switch_teacher_class(request: Request):
    """Switch teacher's active class"""
    teacher = request.state.current_teacher
    body = await request.json()
    class_id = body.get("class_id")
    
    if not class_id:
        raise HTTPException(status_code=400, detail="class_id required")
    
    success = cm.set_teacher_active_class(teacher["user_id"], class_id)
    if not success:
        raise HTTPException(status_code=403, detail="Not authorized for this class")
    
    # Get updated class info
    class_info = cm.get_class_by_id(class_id)
    stats = cm.get_class_stats(class_id)
    
    return {
        "success": True,
        "active_class": class_info,
        "stats": stats
    }


@api_router.get("/teacher/dashboard")
@require_teacher
async def get_teacher_dashboard(request: Request):
    """Get teacher dashboard data for active class"""
    teacher = request.state.current_teacher
    
    # Get active class
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    if not active_class_id:
        # No classes assigned
        return {
            "has_classes": False,
            "classes": [],
            "active_class": None,
            "stats": None,
            "recent_announcements": [],
            "active_polls": []
        }
    
    classes = cm.get_teacher_classes(teacher["user_id"])
    active_class = cm.get_class_by_id(active_class_id)
    stats = cm.get_class_stats(active_class_id)
    announcements = cm.get_class_announcements(active_class_id, limit=5)
    polls = cm.get_class_polls(active_class_id)
    
    return {
        "has_classes": True,
        "classes": classes,
        "active_class": active_class,
        "stats": stats,
        "recent_announcements": announcements,
        "active_polls": [p for p in polls if p['status'] == 'active'][:5],
        "all_polls": polls[:5]
    }


@api_router.get("/teacher/students")
@require_teacher
async def get_class_students_endpoint(request: Request, search: str = None, status: str = None):
    """Get students in teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    students = cm.get_class_students(active_class_id, search=search, status=status)
    class_info = cm.get_class_by_id(active_class_id)
    
    return {
        "students": students,
        "class": class_info,
        "total": len(students)
    }


# ============ TEACHER ANNOUNCEMENTS ============

@api_router.get("/teacher/announcements")
@require_teacher
async def get_teacher_announcements(request: Request):
    """Get announcements for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    announcements = cm.get_class_announcements(active_class_id)
    return {"announcements": announcements}


@api_router.post("/teacher/announcements")
@require_teacher
async def create_teacher_announcement(request: Request):
    """Create announcement for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    body = await request.json()
    title = body.get("title")
    content = body.get("content")
    priority = body.get("priority", "normal")
    
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content required")
    
    announcement = cm.create_announcement(
        class_id=active_class_id,
        teacher_id=teacher["user_id"],
        teacher_name=teacher["name"],
        title=title,
        content=content,
        priority=priority
    )
    
    return announcement


@api_router.put("/teacher/announcements/{announcement_id}")
@require_teacher
async def update_teacher_announcement(announcement_id: str, request: Request):
    """Update an announcement"""
    teacher = request.state.current_teacher
    body = await request.json()
    
    # Verify ownership
    existing = cm.get_announcement_by_id(announcement_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if existing["teacher_id"] != teacher["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated = cm.update_announcement(
        announcement_id=announcement_id,
        title=body.get("title"),
        content=body.get("content"),
        priority=body.get("priority")
    )
    
    return updated


@api_router.delete("/teacher/announcements/{announcement_id}")
@require_teacher
async def delete_teacher_announcement(announcement_id: str, request: Request):
    """Delete an announcement"""
    teacher = request.state.current_teacher
    
    # Verify ownership
    existing = cm.get_announcement_by_id(announcement_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if existing["teacher_id"] != teacher["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = cm.delete_announcement(announcement_id)
    return {"success": success}


# ============ TEACHER POLLS ============

@api_router.get("/teacher/polls")
@require_teacher
async def get_teacher_polls(request: Request, status: str = None):
    """Get polls for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    polls = cm.get_class_polls(active_class_id, status=status)
    return {"polls": polls}


@api_router.post("/teacher/polls")
@require_teacher
async def create_teacher_poll(request: Request):
    """Create poll for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    body = await request.json()
    question = body.get("question")
    options = body.get("options", [])
    ends_at = body.get("ends_at")
    
    if not question or len(options) < 2:
        raise HTTPException(status_code=400, detail="Question and at least 2 options required")
    
    poll = cm.create_poll(
        class_id=active_class_id,
        teacher_id=teacher["user_id"],
        teacher_name=teacher["name"],
        question=question,
        options=options,
        ends_at=ends_at
    )
    
    return poll


@api_router.post("/teacher/polls/{poll_id}/close")
@require_teacher
async def close_teacher_poll(poll_id: str, request: Request):
    """Close a poll"""
    teacher = request.state.current_teacher
    
    # Verify ownership
    poll = cm.get_poll_by_id(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if poll["teacher_id"] != teacher["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = cm.close_poll(poll_id)
    return {"success": success}


@api_router.get("/teacher/polls/{poll_id}/results")
@require_teacher
async def get_poll_results(poll_id: str, request: Request):
    """Get detailed poll results"""
    teacher = request.state.current_teacher
    
    poll = cm.get_poll_by_id(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Verify teacher has access to this poll's class
    if not cm.is_teacher_of_class(teacher["user_id"], poll["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return poll


@api_router.get("/teacher/polls/{poll_id}/participation")
@require_teacher
async def get_poll_participation(poll_id: str, request: Request):
    """Get detailed poll participation - who voted and who hasn't"""
    teacher = request.state.current_teacher
    
    poll = cm.get_poll_by_id(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Verify teacher has access to this poll's class
    if not cm.is_teacher_of_class(teacher["user_id"], poll["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    participation = cm.get_poll_participation(poll_id)
    return participation


# ============ TEACHER FORUM ============

@api_router.get("/teacher/forum")
@require_teacher
async def get_teacher_forum(request: Request):
    """Get forum posts for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    posts = cm.get_class_forum_posts(active_class_id)
    return {"posts": posts}


@api_router.post("/teacher/forum")
@require_teacher
async def create_teacher_forum_post(request: Request):
    """Create forum post in teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    body = await request.json()
    title = body.get("title")
    content = body.get("content")
    
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content required")
    
    post = cm.create_forum_post(
        class_id=active_class_id,
        user_id=teacher["user_id"],
        user_name=teacher["name"],
        user_role="teacher",
        title=title,
        content=content
    )
    
    return post


@api_router.get("/teacher/forum/{post_id}")
@require_teacher
async def get_teacher_forum_post(post_id: str, request: Request):
    """Get a forum post with comments"""
    teacher = request.state.current_teacher
    
    post = cm.get_forum_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify teacher has access to this post's class
    if not cm.is_teacher_of_class(teacher["user_id"], post["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    post["comments"] = cm.get_forum_comments(post_id)
    return post


@api_router.post("/teacher/forum/{post_id}/comments")
@require_teacher
async def create_teacher_forum_comment(post_id: str, request: Request):
    """Add comment to a forum post"""
    teacher = request.state.current_teacher
    
    post = cm.get_forum_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify teacher has access
    if not cm.is_teacher_of_class(teacher["user_id"], post["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    body = await request.json()
    content = body.get("content")
    parent_comment_id = body.get("parent_comment_id")
    
    if not content:
        raise HTTPException(status_code=400, detail="Content required")
    
    comment = cm.create_forum_comment(
        post_id=post_id,
        user_id=teacher["user_id"],
        user_name=teacher["name"],
        user_role="teacher",
        content=content,
        parent_comment_id=parent_comment_id
    )
    
    return comment


@api_router.delete("/teacher/forum/{post_id}")
@require_teacher
async def delete_teacher_forum_post(post_id: str, request: Request):
    """Delete a forum post (teacher can delete any post in their class)"""
    teacher = request.state.current_teacher
    
    post = cm.get_forum_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify teacher has access
    if not cm.is_teacher_of_class(teacher["user_id"], post["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = cm.delete_forum_post(post_id)
    return {"success": success}


@api_router.post("/teacher/forum/{post_id}/pin")
@require_teacher
async def pin_teacher_forum_post(post_id: str, request: Request):
    """Pin/unpin a forum post"""
    teacher = request.state.current_teacher
    
    post = cm.get_forum_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify teacher has access
    if not cm.is_teacher_of_class(teacher["user_id"], post["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    body = await request.json()
    pinned = body.get("pinned", True)
    
    success = cm.pin_forum_post(post_id, pinned)
    return {"success": success, "pinned": pinned}


# ============ STUDENT CLASS ENDPOINTS ============

@api_router.get("/student/class")
async def get_student_class_info(request: Request):
    """Get student's class information"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if user.get("role") not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Student access required")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        return {"has_class": False, "message": "Not assigned to any class"}
    
    return {"has_class": True, "class": class_info}


@api_router.get("/student/dashboard")
async def get_student_class_dashboard(request: Request):
    """Get student's class dashboard data"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if user.get("role") not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Student access required")
    
    dashboard = cm.get_student_dashboard_data(user["user_id"])
    if not dashboard:
        return {"has_class": False, "message": "Not assigned to any class"}
    
    return {"has_class": True, **dashboard}


@api_router.get("/student/announcements")
async def get_student_announcements(request: Request):
    """Get announcements for student's class"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        return {"announcements": [], "message": "Not assigned to any class"}
    
    announcements = cm.get_class_announcements(class_info["class_id"])
    return {"announcements": announcements, "class": class_info}


@api_router.post("/student/announcements/{announcement_id}/view")
async def mark_announcement_viewed(announcement_id: str, request: Request):
    """Mark announcement as viewed by student"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    success = cm.mark_announcement_viewed(announcement_id, user["user_id"])
    return {"success": success}


@api_router.get("/student/polls")
async def get_student_polls(request: Request):
    """Get polls for student's class"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        return {"polls": [], "message": "Not assigned to any class"}
    
    polls = cm.get_class_polls(class_info["class_id"], status="active")
    
    # Add voted status for each poll
    for poll in polls:
        poll["has_voted"] = cm.has_voted(poll["poll_id"], user["user_id"])
    
    return {"polls": polls, "class": class_info}


@api_router.post("/student/polls/{poll_id}/vote")
async def vote_student_poll(poll_id: str, request: Request):
    """Vote on a poll"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify student is in the poll's class
    poll = cm.get_poll_by_id(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if not cm.is_student_in_class(user["user_id"], poll["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to vote in this poll")
    
    body = await request.json()
    option_index = body.get("option_index")
    
    if option_index is None:
        raise HTTPException(status_code=400, detail="option_index required")
    
    try:
        result = cm.vote_poll(poll_id, user["user_id"], option_index)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/student/forum")
async def get_student_forum(request: Request):
    """Get forum posts for student's class"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        return {"posts": [], "message": "Not assigned to any class"}
    
    posts = cm.get_class_forum_posts(class_info["class_id"])
    return {"posts": posts, "class": class_info}


@api_router.get("/student/forum/{post_id}")
async def get_student_forum_post(post_id: str, request: Request):
    """Get a forum post with comments"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    post = cm.get_forum_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify student is in the post's class
    if not cm.is_student_in_class(user["user_id"], post["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    post["comments"] = cm.get_forum_comments(post_id)
    return post


@api_router.post("/student/forum")
async def create_student_forum_post(request: Request):
    """Create forum post in student's class"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        raise HTTPException(status_code=400, detail="Not assigned to any class")
    
    body = await request.json()
    title = body.get("title")
    content = body.get("content")
    
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content required")
    
    post = cm.create_forum_post(
        class_id=class_info["class_id"],
        user_id=user["user_id"],
        user_name=user["name"],
        user_role="student",
        title=title,
        content=content
    )
    
    return post


@api_router.post("/student/forum/{post_id}/comments")
async def create_student_forum_comment(post_id: str, request: Request):
    """Add comment to a forum post"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    post = cm.get_forum_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Verify student is in the post's class
    if not cm.is_student_in_class(user["user_id"], post["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    body = await request.json()
    content = body.get("content")
    parent_comment_id = body.get("parent_comment_id")
    
    if not content:
        raise HTTPException(status_code=400, detail="Content required")
    
    comment = cm.create_forum_comment(
        post_id=post_id,
        user_id=user["user_id"],
        user_name=user["name"],
        user_role="student",
        content=content,
        parent_comment_id=parent_comment_id
    )
    
    return comment


# ============ ADMIN CLASS MANAGEMENT ============

@api_router.get("/admin/classes")
@require_admin
async def get_all_classes(request: Request):
    """Get all classes (admin only)"""
    classes = cm.get_all_classes()
    return {"classes": classes}


@api_router.post("/admin/classes")
@require_admin
async def create_class_endpoint(request: Request):
    """Create a new class (admin only)"""
    body = await request.json()
    department = body.get("department")
    joining_year = body.get("joining_year")
    section = body.get("section", "A")
    
    if not department or not joining_year:
        raise HTTPException(status_code=400, detail="Department and joining_year required")
    
    class_info = cm.create_class(department, joining_year, section)
    return class_info


@api_router.post("/admin/classes/{class_id}/assign-teacher")
@require_admin
async def assign_teacher_to_class_endpoint(class_id: str, request: Request):
    """Assign a teacher to a class (admin only)"""
    body = await request.json()
    teacher_id = body.get("teacher_id")
    is_class_teacher = body.get("is_class_teacher", False)
    
    if not teacher_id:
        raise HTTPException(status_code=400, detail="teacher_id required")
    
    # Verify teacher exists and has teacher role
    teacher = db.find_user_by_id(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    if teacher.get("role") not in ["teacher", "faculty", "admin"]:
        raise HTTPException(status_code=400, detail="User is not a teacher")
    
    success = cm.assign_teacher_to_class(teacher_id, class_id, is_class_teacher)
    return {"success": success}


@api_router.post("/admin/classes/{class_id}/assign-student")
@require_admin
async def assign_student_to_class_endpoint(class_id: str, request: Request):
    """Assign a student to a class (admin only)"""
    body = await request.json()
    student_id = body.get("student_id")
    roll_number = body.get("roll_number")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="student_id required")
    
    success = cm.assign_student_to_class(student_id, class_id, roll_number)
    return {"success": success}


@api_router.post("/admin/students/auto-classify")
@require_admin
async def auto_classify_student(request: Request):
    """Auto-classify a student based on email (admin only)"""
    body = await request.json()
    student_id = body.get("student_id")
    email = body.get("email")
    section = body.get("section", "A")
    
    if not student_id or not email:
        raise HTTPException(status_code=400, detail="student_id and email required")
    
    result = cm.classify_and_assign_student(student_id, email, section)
    if not result:
        raise HTTPException(status_code=400, detail="Could not classify student from email")
    
    return result


# ============ TEACHER ASSIGNMENTS ============

@api_router.get("/teacher/assignments")
@require_teacher
async def get_teacher_assignments(request: Request, status: str = None):
    """Get assignments for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    assignments = cm.get_class_assignments(active_class_id, status=status)
    return {"assignments": assignments}


@api_router.post("/teacher/assignments")
@require_teacher
async def create_teacher_assignment(request: Request):
    """Create assignment for teacher's active class"""
    teacher = request.state.current_teacher
    active_class_id = cm.get_teacher_active_class(teacher["user_id"])
    
    if not active_class_id:
        raise HTTPException(status_code=400, detail="No active class selected")
    
    body = await request.json()
    title = body.get("title")
    description = body.get("description")
    subject = body.get("subject")
    due_date = body.get("due_date")
    total_marks = body.get("total_marks")
    
    if not title or not description or not due_date:
        raise HTTPException(status_code=400, detail="Title, description, and due_date required")
    
    assignment = cm.create_assignment(
        class_id=active_class_id,
        teacher_id=teacher["user_id"],
        teacher_name=teacher["name"],
        title=title,
        description=description,
        subject=subject,
        due_date=due_date,
        total_marks=total_marks
    )
    
    return assignment


@api_router.put("/teacher/assignments/{assignment_id}")
@require_teacher
async def update_teacher_assignment(assignment_id: str, request: Request):
    """Update an assignment"""
    teacher = request.state.current_teacher
    body = await request.json()
    
    # Verify ownership
    existing = cm.get_assignment_by_id(assignment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if existing["teacher_id"] != teacher["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated = cm.update_assignment(
        assignment_id=assignment_id,
        title=body.get("title"),
        description=body.get("description"),
        subject=body.get("subject"),
        due_date=body.get("due_date"),
        total_marks=body.get("total_marks"),
        status=body.get("status")
    )
    
    return updated


@api_router.delete("/teacher/assignments/{assignment_id}")
@require_teacher
async def delete_teacher_assignment(assignment_id: str, request: Request):
    """Delete an assignment"""
    teacher = request.state.current_teacher
    
    # Verify ownership
    existing = cm.get_assignment_by_id(assignment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if existing["teacher_id"] != teacher["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = cm.delete_assignment(assignment_id)
    return {"success": success}


@api_router.get("/teacher/assignments/{assignment_id}/submissions")
@require_teacher
async def get_assignment_submissions(assignment_id: str, request: Request):
    """Get all submissions for an assignment"""
    teacher = request.state.current_teacher
    
    assignment = cm.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Verify teacher has access to this assignment's class
    if not cm.is_teacher_of_class(teacher["user_id"], assignment["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    submissions = cm.get_assignment_submissions(assignment_id)
    return {"submissions": submissions}


@api_router.post("/teacher/assignments/{assignment_id}/grade-submission")
@require_teacher
async def grade_student_submission(assignment_id: str, request: Request):
    """Grade a student's assignment submission"""
    teacher = request.state.current_teacher
    
    assignment = cm.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Verify teacher has access to this assignment's class
    if not cm.is_teacher_of_class(teacher["user_id"], assignment["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    body = await request.json()
    submission_id = body.get("submission_id")
    marks_obtained = body.get("marks_obtained")
    feedback = body.get("feedback")
    
    if not submission_id or marks_obtained is None:
        raise HTTPException(status_code=400, detail="Submission ID and marks obtained required")
    
    graded_submission = cm.grade_submission(submission_id, marks_obtained, feedback)
    return graded_submission


# ============ STUDENT ASSIGNMENTS ============

@api_router.get("/student/assignments")
async def get_student_assignments(request: Request):
    """Get assignments for student's class"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        return {"assignments": [], "message": "Not assigned to any class"}
    
    assignments = cm.get_class_assignments(class_info["class_id"])
    return {"assignments": assignments, "class": class_info}


@api_router.post("/student/assignments/{assignment_id}/submit")
async def submit_assignment(assignment_id: str, request: Request):
    """Submit an assignment"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    assignment = cm.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Verify student is in the assignment's class
    if not cm.is_student_in_class(user["user_id"], assignment["class_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to submit to this assignment")
    
    body = await request.json()
    file_path = body.get("file_path")
    
    # Check if assignment is overdue
    from datetime import datetime
    due_date = datetime.fromisoformat(assignment["due_date"].replace('Z', '+00:00'))
    if datetime.now(due_date.tzinfo) > due_date:
        raise HTTPException(status_code=400, detail="Assignment is overdue")
    
    submission = cm.submit_assignment(
        assignment_id=assignment_id,
        student_id=user["user_id"],
        student_name=user["name"],
        file_path=file_path
    )
    
    return submission


@api_router.get("/student/assignment-submissions")
async def get_student_submissions(request: Request):
    """Get all submissions by the student"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    submissions = cm.get_student_submissions(user["user_id"])
    return {"submissions": submissions}


# ============ STUDENT CLASS MEMBERS ============

@api_router.get("/student/class-members")
async def get_student_class_members(request: Request):
    """Get all members of the student's class: advisors, sub handlers, and students"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    class_info = cm.get_student_class(user["user_id"])
    if not class_info:
        raise HTTPException(status_code=404, detail="Not assigned to any class")
    
    members = cm.get_class_members(class_info["class_id"])
    return members


# ============ CLASS MEMBERS ============

@api_router.get("/class/{class_id}/members")
async def get_class_members(class_id: str, request: Request):
    """Get all members of a class: advisors, sub handlers, and students"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify user has access to this class
    is_teacher = cm.is_teacher_of_class(user["user_id"], class_id)
    is_student = cm.is_student_in_class(user["user_id"], class_id)
    
    if not (is_teacher or is_student or user.get("role") == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view class members")
    
    members = cm.get_class_members(class_id)
    return {"members": members}


@api_router.get("/class/{class_id}/advisors")
async def get_class_advisors(class_id: str, request: Request):
    """Get class advisors (class teachers)"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify user has access to this class
    is_teacher = cm.is_teacher_of_class(user["user_id"], class_id)
    is_student = cm.is_student_in_class(user["user_id"], class_id)
    
    if not (is_teacher or is_student or user.get("role") == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view class advisors")
    
    advisors = cm.get_class_advisors(class_id)
    return {"advisors": advisors}


@api_router.get("/class/{class_id}/sub-handlers")
async def get_class_sub_handlers(class_id: str, request: Request):
    """Get class sub handlers (assistants)"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify user has access to this class
    is_teacher = cm.is_teacher_of_class(user["user_id"], class_id)
    is_student = cm.is_student_in_class(user["user_id"], class_id)
    
    if not (is_teacher or is_student or user.get("role") == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view class sub handlers")
    
    sub_handlers = cm.get_class_sub_handlers(class_id)
    return {"sub_handlers": sub_handlers}


@api_router.get("/class/{class_id}/students")
async def get_class_students(class_id: str, request: Request):
    """Get students in a class with detailed information"""
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify user has access to this class
    is_teacher = cm.is_teacher_of_class(user["user_id"], class_id)
    is_student = cm.is_student_in_class(user["user_id"], class_id)
    
    if not (is_teacher or is_student or user.get("role") == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view class students")
    
    students = cm.get_class_students_with_details(class_id)
    return {"students": students}


# ============ CORS AND STATIC FILES ============

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)

# Serve uploaded files
@app.get("/api/uploads/{folder}/{filename}")
async def serve_upload(folder: str, filename: str):
    file_path = UPLOAD_DIR / folder / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
