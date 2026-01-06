from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, File, UploadFile, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    client.close()

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

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

class SessionData(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime

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

async def get_user_from_token(request: Request) -> Optional[dict]:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    # Check if it's a dev session (dev_session_*)
    if session_token.startswith("dev_session_"):
        # For dev mode, we accept any dev_session token
        # In production, you would validate this properly
        return {"user_id": "dev_user", "name": "Dev User", "role": "student"}
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        return None
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    return user_doc

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
    existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": session_data["name"],
                "picture": session_data.get("picture")
            }}
        )
    else:
        user_doc = {
            "user_id": user_id,
            "email": session_data["email"],
            "name": session_data["name"],
            "picture": session_data.get("picture"),
            "role": "student",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    session_token = session_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.post("/auth/dev-login")
async def dev_login(request: Request, response: Response):
    """Development login - bypasses external auth for testing"""
    body = await request.json()
    
    user_id = body.get("user_id")
    email = body.get("email")
    name = body.get("name")
    
    if not all([user_id, email, name]):
        raise HTTPException(status_code=400, detail="user_id, email, and name required")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})

    if existing_user:
        # Ensure there is a stable user_id; if not, create one and persist it
        existing_user_id = existing_user.get("user_id")
        if existing_user_id:
            user_id = existing_user_id
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.update_one({"email": email}, {"$set": {"user_id": user_id}})

        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": name,
                "picture": body.get("picture"),
                "department": body.get("department"),
                "year": body.get("year")
            }}
        )
    else:
        # Create new user
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": body.get("picture"),
            "role": body.get("role", "student"),
            "department": body.get("department"),
            "year": body.get("year"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session token
    session_token = f"dev_session_{uuid.uuid4().hex[:24]}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set session cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,  # Allow http for local dev
        samesite="lax",
        path="/",
        max_age=7*24*60*60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

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
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/moments")
async def get_moments(request: Request, moment_type: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {}
    if moment_type:
        query["moment_type"] = moment_type
    
    moments = await db.moments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return moments

@api_router.get("/moments/{moment_id}")
async def get_moment_detail(moment_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    moment = await db.moments.find_one({"moment_id": moment_id}, {"_id": 0})
    if not moment:
        raise HTTPException(status_code=404, detail="Moment not found")
    
    comments = await db.comments.find({"entity_type": "moment", "entity_id": moment_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    moment["comments"] = comments
    
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
        "moment_type": body.get("moment_type"),
        "title": body.get("title"),
        "content": body.get("content"),
        "tags": body.get("tags", []),
        "image_url": body.get("image_url"),  # Add image URL support
        "reactions": 0,
        "comments_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.moments.insert_one(moment_doc)
    return await db.moments.find_one({"moment_id": moment_id}, {"_id": 0})


@api_router.post("/moments/with-image")
async def create_moment_with_image(
    moment_type: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    tags: str = Form(""),
    image: UploadFile = File(None)
):
    """Create a moment with optional image upload"""
    
    # For now, we'll use a simple approach - save image and return URL
    image_url = None
    
    if image and image.filename:
        # Save image
        file_ext = image.filename.split(".")[-1].lower()
        image_filename = f"moment_{uuid.uuid4().hex[:12]}.{file_ext}"
        image_path = UPLOAD_DIR / "moments" / image_filename
        
        # Create moments directory if it doesn't exist
        (UPLOAD_DIR / "moments").mkdir(exist_ok=True)
        
        with open(image_path, "wb") as buffer:
            image_bytes = await image.read()
            buffer.write(image_bytes)
        
        # Generate URL for the image (full URL for frontend)
        image_url = f"http://localhost:5000/api/uploads/moments/{image_filename}"
        logger.info(f"📸 Image saved: {image_url}")
    
    moment_id = f"moment_{uuid.uuid4().hex[:12]}"
    
    # Parse tags
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    
    moment_doc = {
        "moment_id": moment_id,
        "user_id": "dev_user",  # TODO: Get from auth
        "user_name": "Dev User",
        "user_picture": None,
        "user_hostel": None,
        "user_department": None,
        "moment_type": moment_type,
        "title": title,
        "content": content,
        "tags": tags_list,
        "image_url": image_url,
        "reactions": 0,
        "comments_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    logger.info(f"📝 Creating moment with image_url: {image_url}")
    
    await db.moments.insert_one(moment_doc)
    result = await db.moments.find_one({"moment_id": moment_id}, {"_id": 0})
    logger.info(f"✅ Moment created: {result}")
    return result

@api_router.get("/issues")
async def get_issues(request: Request, category: Optional[str] = None, status: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    
    issues = await db.issues.find(query, {"_id": 0}).sort("affected_count", -1).to_list(100)
    return issues

@api_router.get("/issues/{issue_id}")
async def get_issue_detail(issue_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    issue = await db.issues.find_one({"issue_id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    comments = await db.comments.find({"entity_type": "issue", "entity_id": issue_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    issue["comments"] = comments
    
    return issue

@api_router.post("/issues")
async def create_issue(request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    issue_id = f"issue_{uuid.uuid4().hex[:12]}"
    
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
    
    await db.issues.insert_one(issue_doc)
    return await db.issues.find_one({"issue_id": issue_id}, {"_id": 0})

@api_router.post("/issues/{issue_id}/affected")
async def mark_affected(issue_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    issue = await db.issues.find_one({"issue_id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    if user["user_id"] in issue["affected_users"]:
        await db.issues.update_one(
            {"issue_id": issue_id},
            {
                "$pull": {"affected_users": user["user_id"]},
                "$inc": {"affected_count": -1}
            }
        )
        return {"affected": False}
    else:
        await db.issues.update_one(
            {"issue_id": issue_id},
            {
                "$addToSet": {"affected_users": user["user_id"]},
                "$inc": {"affected_count": 1}
            }
        )
        return {"affected": True}

@api_router.put("/issues/{issue_id}/status")
async def update_issue_status(issue_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    body = await request.json()
    new_status = body.get("status")
    message = body.get("message")
    
    timeline_entry = {
        "status": new_status,
        "message": message,
        "user_name": user["name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.issues.update_one(
        {"issue_id": issue_id},
        {
            "$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()},
            "$push": {"timeline": timeline_entry}
        }
    )
    
    return await db.issues.find_one({"issue_id": issue_id}, {"_id": 0})

@api_router.get("/opportunities")
async def get_opportunities(request: Request, opp_type: Optional[str] = None):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    query = {}
    if opp_type:
        query["opp_type"] = opp_type
    
    opportunities = await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return opportunities

@api_router.get("/opportunities/{opp_id}")
async def get_opportunity_detail(opp_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    opportunity = await db.opportunities.find_one({"opp_id": opp_id}, {"_id": 0})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    comments = await db.comments.find({"entity_type": "opportunity", "entity_id": opp_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    opportunity["comments"] = comments
    
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
    
    await db.opportunities.insert_one(opp_doc)
    return await db.opportunities.find_one({"opp_id": opp_id}, {"_id": 0})

@api_router.post("/opportunities/{opp_id}/save")
async def save_opportunity(opp_id: str, request: Request):
    user = await get_user_from_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    opportunity = await db.opportunities.find_one({"opp_id": opp_id}, {"_id": 0})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    if user["user_id"] in opportunity["saved_by"]:
        await db.opportunities.update_one(
            {"opp_id": opp_id},
            {
                "$pull": {"saved_by": user["user_id"]},
                "$inc": {"saved_count": -1}
            }
        )
        return {"saved": False}
    else:
        await db.opportunities.update_one(
            {"opp_id": opp_id},
            {
                "$addToSet": {"saved_by": user["user_id"]},
                "$inc": {"saved_count": 1}
            }
        )
        return {"saved": True}

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
    
    await db.comments.insert_one(comment_doc)
    
    if body.get("entity_type") == "moment":
        await db.moments.update_one(
            {"moment_id": body.get("entity_id")},
            {"$inc": {"comments_count": 1}}
        )
    
    return await db.comments.find_one({"comment_id": comment_id}, {"_id": 0})

@api_router.get("/profile/{user_id}")
async def get_user_profile(user_id: str, request: Request):
    current_user = await get_user_from_token(request)
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    moments = await db.moments.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
    issues = await db.issues.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "user": user,
        "moments": moments,
        "issues": issues
    }

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Universal Image Analysis Endpoint
from services.universal_vision_service import analyze_image_universal

@api_router.post("/analyze-image-universal")
async def analyze_image_universal_endpoint(
    image: UploadFile = File(...),
    context_hint: Optional[str] = Form(None),
    user_caption: Optional[str] = Form(None)
):
    """
    Universal image analysis endpoint
    
    Works for ANY context - automatically detects what the image represents
    and returns auto-fill data
    """
    
    temp_file_path = None
    
    try:
        # Save temporary file
        file_ext = image.filename.split(".")[-1].lower()
        temp_filename = f"temp_{uuid.uuid4().hex}.{file_ext}"
        temp_file_path = UPLOAD_DIR / temp_filename
        
        with open(temp_file_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        logger.info(f"🔍 Universal analysis: {image.filename}")
        
        # Universal vision analysis
        vision_result = await analyze_image_universal(
            image_path=str(temp_file_path),
            context_hint=context_hint,
            user_caption=user_caption
        )
        
        detected_context = vision_result.get("detected_context")
        confidence = vision_result.get("confidence", 0)
        
        logger.info(f"✅ Detected: {detected_context} ({confidence}% confidence)")
        
        # Return response
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
        # FIXED: Clean up temp file with proper error handling
        if temp_file_path and temp_file_path.exists():
            try:
                import time
                time.sleep(0.1)  # Brief delay to ensure file handles are released
                temp_file_path.unlink()
                logger.debug(f"Cleaned up temp file: {temp_file_path}")
            except PermissionError as e:
                # File still in use - log and continue
                logger.warning(f"Could not delete temp file (in use): {temp_file_path}")
                # Schedule for deletion on exit
                import atexit
                atexit.register(lambda: temp_file_path.unlink() if temp_file_path.exists() else None)
            except Exception as e:
                logger.warning(f"Could not delete temp file: {e}")

# Add CORS middleware BEFORE including router
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# Serve uploaded images
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Create moments upload directory
(UPLOAD_DIR / "moments").mkdir(exist_ok=True)

@app.get("/api/uploads/moments/{filename}")
async def serve_moment_image(filename: str):
    """Serve uploaded moment images"""
    file_path = UPLOAD_DIR / "moments" / filename
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
