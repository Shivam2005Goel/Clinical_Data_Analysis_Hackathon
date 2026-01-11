from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from supabase import create_client, Client
from openai import AsyncOpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Supabase connection
supabase_url = os.getenv('SUPABASE_URL', '')
supabase_key = os.getenv('SUPABASE_KEY', '')

supabase: Optional[Client] = None
if supabase_url and supabase_key and supabase_url != 'YOUR_SUPABASE_PROJECT_URL_HERE':
    supabase = create_client(supabase_url, supabase_key)

# JWT Config
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_MINUTES = int(os.getenv('JWT_EXPIRATION_MINUTES', '1440'))

# OpenAI Config
EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY') # Keeping for backward compatibility
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or EMERGENT_LLM_KEY

client_openai = None
if OPENAI_API_KEY:
    client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Create the main app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "CRA"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class AlertCreate(BaseModel):
    title: str
    description: str
    priority: str
    site_id: Optional[str] = None
    patient_id: Optional[str] = None
    alert_type: str

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    priority: str
    site_id: Optional[str] = None
    patient_id: Optional[str] = None
    alert_type: str
    status: str = "open"
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    entity_type: str
    entity_id: str
    comment_text: str

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entity_type: str
    entity_id: str
    comment_text: str
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TagCreate(BaseModel):
    entity_type: str
    entity_id: str
    tag_name: str

class Tag(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entity_type: str
    entity_id: str
    tag_name: str
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIQueryRequest(BaseModel):
    query: str

class AIReportRequest(BaseModel):
    report_type: str
    site_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

# ==================== SUPABASE HELPER ====================

async def fetch_all_supabase_data(table_name: str, batch_size: int = 1000):
    all_data = []
    start = 0
    while True:
        try:
            # Fetch a batch
            response = supabase.table(table_name).select('*').range(start, start + batch_size - 1).execute()
            batch_data = response.data
            
            if not batch_data:
                break
                
            all_data.extend(batch_data)
            
            # If we got less than batch_size, we've reached the end
            if len(batch_data) < batch_size:
                break
                
            start += batch_size
        except Exception as e:
            logger.error(f"Error fetching batch from {table_name}: {str(e)}")
            break
            
    return all_data

# ==================== DATA STORE FALLBACK ====================
# In-memory store for when MongoDB is not available (Hackathon mode)
IN_MEMORY_USERS = {}

async def get_user_by_email(email: str):
    try:
        # Try MongoDB first
        return await db.users.find_one({"email": email}, {"_id": 0})
    except Exception as e:
        logger.warning(f"MongoDB unavailable, checking in-memory store: {e}")
        # Fallback to in-memory
        for user in IN_MEMORY_USERS.values():
            if user.get("email") == email:
                return user
        return None

async def get_user_by_id(user_id: str):
    try:
        return await db.users.find_one({"id": user_id}, {"_id": 0})
    except Exception as e:
        logger.warning(f"MongoDB unavailable, checking in-memory store: {e}")
        return IN_MEMORY_USERS.get(user_id)

async def get_user_by_firebase_uid(firebase_uid: str):
    try:
        return await db.users.find_one({"firebase_uid": firebase_uid}, {"_id": 0})
    except Exception as e:
        logger.warning(f"MongoDB unavailable, checking in-memory store: {e}")
        for user in IN_MEMORY_USERS.values():
            if user.get("firebase_uid") == firebase_uid:
                return user
        return None

async def save_user(user_doc: dict):
    try:
        await db.users.insert_one(user_doc)
    except Exception as e:
        logger.warning(f"MongoDB unavailable, saving to in-memory store: {e}")
        IN_MEMORY_USERS[user_doc["id"]] = user_doc

# ==================== AUTH UTILITIES ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ==================== FIREBASE INITIALIZATION ====================

firebase_admin_initialized = False

def init_firebase_admin():
    global firebase_admin_initialized
    if firebase_admin_initialized:
        return
    
    firebase_config_path = os.getenv('FIREBASE_ADMIN_CONFIG_PATH', '')
    if firebase_config_path and os.path.exists(firebase_config_path):
        try:
            import firebase_admin
            from firebase_admin import credentials
            cred = credentials.Certificate(firebase_config_path)
            firebase_admin.initialize_app(cred)
            firebase_admin_initialized = True
            logger.info("Firebase Admin SDK initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize Firebase Admin: {str(e)}")

init_firebase_admin()

async def get_current_user_hybrid(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    
    # Try Firebase authentication first
    if firebase_admin_initialized:
        try:
            import firebase_admin
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(token)
            firebase_uid = decoded_token.get('uid')
            user = await get_user_by_firebase_uid(firebase_uid)
            if user:
                return user
        except Exception as e:
            logger.debug(f"Firebase token verification failed: {str(e)}")
    
    # For Firebase tokens without Admin SDK, try to extract user from token payload
    # Firebase tokens are JWTs, we can decode them to get the user ID
    try:
        # Try to decode as Firebase token (without verification since we don't have Admin SDK)
        import base64
        import json
        
        # Firebase ID tokens have 3 parts separated by dots
        parts = token.split('.')
        if len(parts) == 3:
            # Decode the payload (second part)
            payload_bytes = parts[1] + '=' * (4 - len(parts[1]) % 4)  # Add padding
            payload_json = base64.urlsafe_b64decode(payload_bytes).decode('utf-8')
            payload = json.loads(payload_json)
            
            # Check if it's a Firebase token
            if 'user_id' in payload or 'firebase' in payload.get('iss', ''):
                firebase_uid = payload.get('user_id') or payload.get('sub')
                user = await get_user_by_firebase_uid(firebase_uid)
                if user:
                    return user
    except Exception as e:
        logger.debug(f"Firebase token decode attempt failed: {str(e)}")
    
    # Fall back to JWT authentication
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = await get_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    logger.info(f"Register attempt for email: {user_data.email}")
    existing = await get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    doc = user.model_dump()
    doc['password'] = hash_password(user_data.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await save_user(doc)
    
    access_token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    logger.info(f"Login attempt for email: {credentials.email}")
    user_doc = await get_user_by_email(credentials.email)
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    access_token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user_hybrid)):
    return User(**current_user)

# ==================== SUPABASE DATA ENDPOINTS ====================

@api_router.get("/data/high-risk-sites")
async def get_high_risk_sites(current_user: dict = Depends(get_current_user_hybrid)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to environment variables.")
    try:
        data = await fetch_all_supabase_data('High Risk Sites')
        return {"data": data, "count": len(data)}
    except Exception as e:
        logger.error(f"Error fetching high risk sites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@api_router.get("/data/patient-level")
async def get_patient_level_data(current_user: dict = Depends(get_current_user_hybrid)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to environment variables.")
    try:
        data = await fetch_all_supabase_data('Patient Data')
        return {"data": data, "count": len(data)}
    except Exception as e:
        logger.error(f"Error fetching patient data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@api_router.get("/data/site-level")
async def get_site_level_data(current_user: dict = Depends(get_current_user_hybrid)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to environment variables.")
    try:
        data = await fetch_all_supabase_data('Sites Data')
        return {"data": data, "count": len(data)}
    except Exception as e:
        logger.error(f"Error fetching site data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@api_router.get("/data/dashboard-stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user_hybrid)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        sites = await fetch_all_supabase_data('Sites Data')
        patients = await fetch_all_supabase_data('Patient Data')
        
        high_risk_count = len([s for s in sites if s.get('Risk_Level') == 'High'])
        total_sites = len(sites)
        total_patients = len(patients)
        avg_dqi = sum([s.get('Avg_DQI', 0) for s in sites]) / total_sites if total_sites > 0 else 0
        clean_patients = len([p for p in patients if p.get('Clean_Patient_Status') == 'Clean'])
        clean_patient_percentage = (clean_patients / total_patients * 100) if total_patients > 0 else 0
        
        return {
            "total_sites": total_sites,
            "total_patients": total_patients,
            "high_risk_sites": high_risk_count,
            "avg_dqi": round(avg_dqi, 2),
            "clean_patient_percentage": round(clean_patient_percentage, 2),
            "clean_patients": clean_patients
        }
    except Exception as e:
        logger.error(f"Error calculating dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ALERTS ENDPOINTS ====================

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert_data: AlertCreate, current_user: dict = Depends(get_current_user_hybrid)):
    alert = Alert(**alert_data.model_dump(), created_by=current_user['id'])
    doc = alert.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.alerts.insert_one(doc)
    return alert

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(status: Optional[str] = None, current_user: dict = Depends(get_current_user_hybrid)):
    query = {}
    if status:
        query['status'] = status
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for alert in alerts:
        if isinstance(alert['created_at'], str):
            alert['created_at'] = datetime.fromisoformat(alert['created_at'])
    return alerts

@api_router.patch("/alerts/{alert_id}/status")
async def update_alert_status(alert_id: str, status: str, current_user: dict = Depends(get_current_user_hybrid)):
    result = await db.alerts.update_one({"id": alert_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert status updated"}

# ==================== COMMENTS ENDPOINTS ====================

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate, current_user: dict = Depends(get_current_user_hybrid)):
    comment = Comment(**comment_data.model_dump(), created_by=current_user['id'])
    doc = comment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.comments.insert_one(doc)
    return comment

@api_router.get("/comments/{entity_type}/{entity_id}", response_model=List[Comment])
async def get_comments(entity_type: str, entity_id: str, current_user: dict = Depends(get_current_user_hybrid)):
    comments = await db.comments.find({"entity_type": entity_type, "entity_id": entity_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for comment in comments:
        if isinstance(comment['created_at'], str):
            comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    return comments

# ==================== TAGS ENDPOINTS ====================

@api_router.post("/tags", response_model=Tag)
async def create_tag(tag_data: TagCreate, current_user: dict = Depends(get_current_user_hybrid)):
    tag = Tag(**tag_data.model_dump(), created_by=current_user['id'])
    doc = tag.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tags.insert_one(doc)
    return tag

@api_router.get("/tags/{entity_type}/{entity_id}", response_model=List[Tag])
async def get_tags(entity_type: str, entity_id: str, current_user: dict = Depends(get_current_user_hybrid)):
    tags = await db.tags.find({"entity_type": entity_type, "entity_id": entity_id}, {"_id": 0}).to_list(100)
    for tag in tags:
        if isinstance(tag['created_at'], str):
            tag['created_at'] = datetime.fromisoformat(tag['created_at'])
    return tags

# ==================== AI ENDPOINTS ====================

@api_router.post("/ai/query")
async def ai_natural_language_query(request: AIQueryRequest, current_user: dict = Depends(get_current_user_hybrid)):
    if not client_openai:
        raise HTTPException(status_code=503, detail="AI service not configured (OPENAI_API_KEY missing)")
    
    try:
        # Get context data from Supabase
        context = "You are an AI assistant for a Clinical Data Monitoring System. "
        
        if not supabase:
             context += "\n\nCRITICAL SYSTEM STATUS: Supabase database is NOT configured. You have NO access to any clinical data. If the user asks about data, sites, patients, or risks, explicitly inform them that Supabase must be configured and data imported first."
        else:
            try:
                # Attempt to get site summary data if available
                # Note: This table name assumes the standard setup
                sites = supabase.table('site_level_summary').select('*').limit(20).execute()
                if sites.data:
                    context += f"\n\nHere is a sample of site data (Json format): {str(sites.data)}. "
                else:
                    context += "\n\nSYSTEM STATUS: Supabase is connected but returned NO data from 'site_level_summary'. The tables might be empty."
            except Exception as e:
                context += f"\n\nSYSTEM STATUS: Supabase is connected but a read error occurred: {str(e)}. Tables might be missing."
        
        response = await client_openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": context + "Answer questions about clinical trial data, site performance, patient data quality, and provide actionable insights. If data is missing, guide the user to setup."} ,
                {"role": "user", "content": request.query}
            ]
        )
        
        return {"response": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"AI query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI query failed: {str(e)}")

@api_router.post("/ai/generate-report")
async def ai_generate_report(request: AIReportRequest, current_user: dict = Depends(get_current_user_hybrid)):
    if not client_openai:
        raise HTTPException(status_code=503, detail="AI service not configured (OPENAI_API_KEY missing)")
    
    try:
        system_context = "You are an expert clinical data analyst. Generate detailed, professional reports with clear sections, metrics, and actionable recommendations."
        
        if not supabase:
            system_context += " CRITICAL: Supabase is NOT configured. You cannot generate a real report based on data. Inform the user that they need to configure the database first."
        
        prompt = ""
        if request.report_type == "site_performance":
            prompt = f"Generate a comprehensive site performance report for Site {request.site_id if request.site_id else 'All Sites'}. Include data quality metrics, risk assessment, open issues, and actionable recommendations."
        elif request.report_type == "cra_report":
            prompt = "Generate a CRA (Clinical Research Associate) monitoring report summarizing site visits, follow-up actions, deviation counts, and query resolution status."
        elif request.report_type == "risk_analysis":
            prompt = "Generate a risk analysis report identifying high-risk sites, common patterns in data quality issues, and recommended interventions."
        else:
            prompt = f"Generate a report on: {request.report_type}"
        
        if request.context:
            prompt += f"\n\nContext data: {request.context}"
        
        response = await client_openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_context},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {"report": response.choices[0].message.content, "report_type": request.report_type}
    except Exception as e:
        logger.error(f"AI report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@api_router.post("/ai/recommend-actions")
async def ai_recommend_actions(site_id: Optional[str] = None, current_user: dict = Depends(get_current_user_hybrid)):
    if not client_openai:
        raise HTTPException(status_code=503, detail="AI service not configured (OPENAI_API_KEY missing)")
    
    try:
        system_context = "You are an AI agent specialized in clinical trial operations. Provide specific, prioritized action recommendations based on risk signals and data quality metrics."
        
        if not supabase:
            system_context += " CRITICAL: Supabase is NOT configured. You cannot provide data-driven recommendations. Inform the user that they need to configure the database first."

        prompt = f"Based on the clinical trial data, recommend specific actions for {'site ' + site_id if site_id else 'all sites'}. Focus on: 1) Reducing open queries, 2) Improving data quality, 3) Addressing high-risk indicators, 4) Optimizing CRA monitoring activities."
        
        response = await client_openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_context},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {"recommendations": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"AI recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

# ==================== FIREBASE AUTH ENDPOINTS ====================

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth
        
        if not firebase_admin_initialized:
            raise HTTPException(status_code=503, detail="Firebase not configured")
        
        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except ImportError:
        raise HTTPException(status_code=503, detail="Firebase Admin SDK not installed")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")

@api_router.post("/auth/firebase-register")
async def firebase_register(request: dict):
    """Register a new user with Firebase authentication.
    The Firebase token is verified client-side, and we store user profile in MongoDB."""
    
    firebase_uid = request.get('firebase_uid')
    email = request.get('email')
    full_name = request.get('full_name')
    role = request.get('role', 'CRA')
    
    if not firebase_uid or not email or not full_name:
        raise HTTPException(status_code=400, detail="Missing required fields: firebase_uid, email, full_name")
    
    existing = await db.users.find_one({"firebase_uid": firebase_uid}, {"_id": 0})
    if existing:
        return {"message": "User already registered", "user": User(**{k: v for k, v in existing.items() if k not in ['firebase_uid']})}
    
    user = User(
        id=firebase_uid,
        email=email,
        full_name=full_name,
        role=role
    )
    
    doc = user.model_dump()
    doc['firebase_uid'] = firebase_uid
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    return {"message": "User registered successfully", "user": user}

@api_router.post("/auth/firebase-login")
async def firebase_login(request: dict):
    """Login with Firebase authentication."""
    
    firebase_uid = request.get('firebase_uid')
    
    if not firebase_uid:
        raise HTTPException(status_code=400, detail="Missing firebase_uid")
    
    user_doc = await db.users.find_one({"firebase_uid": firebase_uid}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    user = User(**{k: v for k, v in user_doc.items() if k not in ['firebase_uid', 'password']})
    return {"message": "Login successful", "user": user}

# ==================== ROOT ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Clinical Data Monitoring System API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    supabase_status = "connected" if supabase else "not_configured"
    return {
        "status": "healthy",
        "database": "connected",
        "supabase": supabase_status,
        "ai_service": "configured" if client_openai else "not_configured"
    }

# Include router
app.include_router(api_router)



@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()