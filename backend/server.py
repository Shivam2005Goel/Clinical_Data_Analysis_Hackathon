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
import boto3
from botocore.exceptions import ClientError
# Logging Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
# CRITICAL: Use override=True to ensure .env values replace any cached variables in terminal sessions
load_dotenv(ROOT_DIR / '.env', override=True)

# MongoDB connection with optimized settings for Atlas
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=50,  # Connection pool size
    minPoolSize=10,  # Minimum connections to keep open
    maxIdleTimeMS=45000,  # Close idle connections after 45s
    connectTimeoutMS=10000,  # Connection timeout
    serverSelectionTimeoutMS=10000,  # Server selection timeout
    retryWrites=True,
    w='majority'
)
db = client[os.environ['DB_NAME']]

# Supabase connection
supabase_url = os.getenv('SUPABASE_URL', '')
supabase_key = os.getenv('SUPABASE_KEY', '')

supabase: Optional[Client] = None
if supabase_url and supabase_key and supabase_url != 'YOUR_SUPABASE_PROJECT_URL_HERE':
    supabase = create_client(supabase_url, supabase_key)

# ==================== CACHING ====================
# Simple in-memory cache for frequently accessed data
from functools import lru_cache
import time

# Cache store with TTL
_cache_store = {}
_cache_ttl = {}  # Store expiry times
CACHE_TTL_SECONDS = 60  # Cache for 60 seconds

def get_cached(key: str):
    """Get value from cache if not expired"""
    if key in _cache_store:
        if time.time() < _cache_ttl.get(key, 0):
            return _cache_store[key]
        else:
            # Expired, remove from cache
            del _cache_store[key]
            del _cache_ttl[key]
    return None

def set_cached(key: str, value, ttl: int = CACHE_TTL_SECONDS):
    """Store value in cache with TTL"""
    _cache_store[key] = value
    _cache_ttl[key] = time.time() + ttl

# JWT Config
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_MINUTES = int(os.getenv('JWT_EXPIRATION_MINUTES', '1440'))

# AI Model Config
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

# Initialize OpenAI Client
if OPENAI_API_KEY and len(OPENAI_API_KEY) > 20:
    logger.info("Initializing OpenAI Client")
    client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY)
else:
    logger.warning("OPENAI_API_KEY is missing or invalid.")
    client_openai = None

# Initialize OpenRouter Client
if OPENROUTER_API_KEY and len(OPENROUTER_API_KEY) > 20 and OPENROUTER_API_KEY != 'your_openrouter_api_key_here':
    logger.info(f"Initializing OpenRouter Client (Key ending in ...{OPENROUTER_API_KEY[-4:]})")
    client_openrouter = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )
else:
    logger.warning("OPENROUTER_API_KEY is missing or still the placeholder. Check backend/.env")
    client_openrouter = None

# AWS SES Config
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
SENDER_EMAIL = os.getenv('SENDER_EMAIL')

ses_client = None
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    try:
        ses_client = boto3.client(
            'ses',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
    except Exception as e:
        logger.warning(f"Failed to initialize AWS SES client: {e}")

# Create the main app
app = FastAPI()

# Enable CORS for frontend
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

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
    history: Optional[List[Dict[str, str]]] = None

class AIReportRequest(BaseModel):
    report_type: str
    site_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class EmailReportRequest(BaseModel):
    recipient_email: EmailStr
    report_type: str
    report_content: str
    subject: Optional[str] = None

# ==================== SUPABASE HELPER ====================

async def fetch_all_supabase_data(table_name: str, batch_size: int = 1000, use_cache: bool = True):
    """Fetch data from Supabase with caching support"""
    cache_key = f"supabase_{table_name}"
    
    # Check cache first
    if use_cache:
        cached = get_cached(cache_key)
        if cached is not None:
            logger.info(f"Cache hit for {table_name}")
            return cached
    
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
    
    # Store in cache
    if use_cache and all_data:
        set_cached(cache_key, all_data)
        logger.info(f"Cached {len(all_data)} records from {table_name}")
            
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

def send_email_notification(to_email: str, alert_data: dict):
    """
    Sends an email notification about a new alert using Amazon SES.
    If SES is not configured, logs a mock email to the console.
    """
    if not ses_client or not SENDER_EMAIL:
        logger.info(f"========== MOCK EMAIL SENT (SES Not Configured) ==========")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: New Clinical Alert: {alert_data.get('title')}")
        logger.info(f"Body: Priority: {alert_data.get('priority')}, Type: {alert_data.get('alert_type')}")
        logger.info(f"==========================================================")
        return

    try:
        # Create the email body
        body_html = f"""
        <html>
          <body>
            <h2>New Alert Created</h2>
            <p><strong>Title:</strong> {alert_data.get('title')}</p>
            <p><strong>Priority:</strong> {alert_data.get('priority')}</p>
            <p><strong>Type:</strong> {alert_data.get('alert_type')}</p>
            <p><strong>Description:</strong><br>{alert_data.get('description')}</p>
            <p><strong>Site ID:</strong> {alert_data.get('site_id', 'N/A')}</p>
            <p><strong>Patient ID:</strong> {alert_data.get('patient_id', 'N/A')}</p>
            <br>
            <p>Please log in to the Clinical Data Monitoring System to view more details.</p>
          </body>
        </html>
        """
        
        body_text = f"New Alert Created\nTitle: {alert_data.get('title')}\nPriority: {alert_data.get('priority')}\nType: {alert_data.get('alert_type')}\nDescription: {alert_data.get('description')}"

        response = ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={
                'ToAddresses': [to_email],
            },
            Message={
                'Subject': {
                    'Data': f"New Clinical Alert: {alert_data.get('title')}",
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': body_text,
                        'Charset': 'UTF-8'
                    },
                    'Html': {
                        'Data': body_html,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )
        logger.info(f"Email notification sent to {to_email} via SES. MessageId: {response['MessageId']}")
    except ClientError as e:
        logger.error(f"Failed to send email notification via SES: {e.response['Error']['Message']}")
    except Exception as e:
        logger.error(f"Unexpected error sending email: {str(e)}")

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

async def get_current_user_hybrid(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not credentials or not credentials.credentials:
        logger.warning("No token provided in request header")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    
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
                logger.info(f"Authenticated via Firebase: {user.get('email')}")
                return user
        except Exception as e:
            logger.debug(f"Firebase token verification failed: {str(e)}")
    
    # For Firebase tokens without Admin SDK, try to extract user from token payload
    try:
        import base64
        import json
        parts = token.split('.')
        if len(parts) == 3:
            payload_bytes = parts[1] + '=' * (4 - len(parts[1]) % 4)
            payload_json = base64.urlsafe_b64decode(payload_bytes).decode('utf-8')
            payload = json.loads(payload_json)
            
            if 'user_id' in payload or 'firebase' in payload.get('iss', ''):
                firebase_uid = payload.get('user_id') or payload.get('sub')
                user = await get_user_by_firebase_uid(firebase_uid)
                if user:
                    logger.info(f"Authenticated via Firebase Payload: {user.get('email')}")
                    return user
    except Exception as e:
        logger.debug(f"Firebase token decode attempt failed: {str(e)}")
    
    # Fall back to JWT authentication
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("JWT payload missing sub")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = await get_user_by_id(user_id)
        if user is None:
            logger.warning(f"User not found for ID: {user_id}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        logger.info(f"Authenticated via JWT: {user.get('email')}")
        return user
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT token invalid: {str(e)}")
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
    if not user_doc or 'password' not in user_doc or not verify_password(credentials.password, user_doc['password']):
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
    
    # Send email notification to the creator (current user)
    # Background task would be better for production, but direct call is fine for now
    try:
        current_user_email = current_user.get('email')
        logger.info(f"Attempting to send email to: {current_user_email}")
        
        if current_user_email:
            send_email_notification(current_user_email, doc)
        else:
            logger.warning("Could not send email: User email not found in current_user object")
            logger.warning(f"Current User Object: {current_user}")
    except Exception as e:
        logger.error(f"Error in email notification flow: {str(e)}")

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

from fastapi.responses import StreamingResponse
import json

@api_router.post("/ai/query")
async def ai_natural_language_query(request: AIQueryRequest, current_user: dict = Depends(get_current_user_hybrid)):
    if not client_openai and not client_openrouter:
        raise HTTPException(status_code=503, detail="AI service not configured (API Keys missing)")
    
    try:
        # Prepare Comprehensive AI Context
        current_date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        full_context = (
            f"Current Data Snapshot: {current_date}\n\n"
            "You are the Neural Core AI Assistant for a Clinical Data Monitoring System. "
            "Your primary role is to analyze the provided clinical trial data and give expert insights. "
            "STRICT PRIVACY RULE: You must base your answers ONLY on the provided dataset context. "
            "HELPFULNESS RULE: Be proactive and analytical. If the user asks for 'trends', 'risk', or 'status', "
            "synthesize the current data to provide your best expert assessment. Do NOT simply say you lack 'historical data' "
            "unless the question specifically requires a date-to-date comparison that is truly missing."
        )
        
        # 0. Recent Activity (MongoDB)
        try:
            recent_alerts = await db.alerts.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
            if recent_alerts:
                full_context += f"\n\n[RECENT TIMELINE/ALERTS]: {json.dumps(recent_alerts)}"
        except Exception: pass

        if not supabase:
             full_context += "\n\nCRITICAL: Supabase is NOT configured. Advise user to check their environment variables."
        else:
            try:
                # 1. Fetch Global Snapshot
                sites_all = await fetch_all_supabase_data('Sites Data', use_cache=True)
                patients_all = await fetch_all_supabase_data('Patient Data', use_cache=True)
                
                total_sites = len(sites_all)
                total_patients = len(patients_all)
                avg_dqi = sum([s.get('Avg_DQI', 0) for s in sites_all]) / total_sites if total_sites > 0 else 0
                high_risk_sites = [s for s in sites_all if s.get('Risk_Level') == 'High']
                
                stats = {
                    "total_sites": total_sites,
                    "total_patients": total_patients,
                    "high_risk_sites_count": len(high_risk_sites),
                    "average_dqi": round(avg_dqi, 2),
                    "monitoring_status": "ACTIVE_LIVE"
                }
                full_context += f"\n\n[GLOBAL STUDY STATS]: {json.dumps(stats)}"
                
                # 2. Risk Profile
                risk_dist = {}
                for s in sites_all:
                    l = s.get('Risk_Level', 'Unknown')
                    risk_dist[l] = risk_dist.get(l, 0) + 1
                full_context += f"\n\n[STUDY RISK PROFILE]: {json.dumps(risk_dist)}"

                # 3. Comprehensive Site Manifest
                site_manifest = []
                for s in sites_all:
                    # Provide enough fields for identification but keep it compact
                    site_manifest.append({
                        "id": s.get('Site_ID'), 
                        "risk": s.get('Risk_Level'), 
                        "dqi": s.get('Avg_DQI'), 
                        "country": s.get('Country'),
                        "subjects": s.get('Total_Subjects')
                    })
                full_context += f"\n\n[SITE MASTER LIST]: {json.dumps(site_manifest)}"
                
                # 4. Patient Samples
                full_context += f"\n\n[PATIENT QUALITY SAMPLES]: {json.dumps(patients_all[:15])}"
                
                logger.info(f"Neural Context Ready: {total_sites} sites, {total_patients} patients analyzed.")
                
            except Exception as e:
                logger.error(f"Context fetch error: {str(e)}")
                full_context += "\n\n(System Alert: Data access issues. Insights may be limited.)"
        
        async def stream_generator():
            try:
                # Prepare messages with history
                messages = [{"role": "system", "content": full_context}]
                if request.history:
                    # Filter and format history
                    for msg in request.history:
                        if msg.get('role') and msg.get('content'):
                            role = 'assistant' if msg['role'] == 'ai' else msg['role']
                            messages.append({"role": role, "content": msg['content']})
                
                messages.append({"role": "user", "content": request.query})

                if client_openrouter:
                    logger.info(f"Neural Core: Calling OpenRouter with streaming (Context: {len(messages)} msgs)...")
                    response = await client_openrouter.chat.completions.create(
                        model="arcee-ai/trinity-large-preview:free",
                        messages=messages,
                        stream=True
                    )
                elif client_openai:
                    logger.warning("Neural Core Fallback: OpenRouter not available. Calling OpenAI (Limited Quota)...")
                    response = await client_openai.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages,
                        stream=True
                    )
                else:
                    logger.error("Neural Core Error: No AI providers configured (Check backend/.env)")
                    yield f"data: {json.dumps({'error': 'AI services not configured. Please check backend API keys.'})}\n\n"
                    return

                async for chunk in response:
                    if hasattr(chunk, 'choices') and chunk.choices:
                        content = getattr(chunk.choices[0].delta, 'content', None)
                        if content:
                            yield f"data: {json.dumps({'content': content})}\n\n"
                
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Streaming error: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    except Exception as e:
        logger.error(f"AI query entry error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI query initialization failed: {str(e)}")

@api_router.post("/ai/generate-report")
async def ai_generate_report(request: AIReportRequest, current_user: dict = Depends(get_current_user_hybrid)):
    if not client_openai and not client_openrouter:
        raise HTTPException(status_code=503, detail="AI service not configured (API Keys missing)")
    
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
        
        if client_openrouter:
            logger.info("Generating report with OpenRouter...")
            response = await client_openrouter.chat.completions.create(
                model="arcee-ai/trinity-large-preview:free",
                messages=[
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": prompt}
                ]
            )
        elif client_openai:
            logger.warning("Generating report with OpenAI (Fallback)...")
            response = await client_openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": prompt}
                ]
            )
        else:
            logger.error("No valid AI providers configured for report generation")
            raise HTTPException(status_code=503, detail="AI service not configured. Check backend API keys.")
        
        return {"report": response.choices[0].message.content, "report_type": request.report_type}
    except Exception as e:
        logger.error(f"AI report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@api_router.post("/ai/recommend-actions")
async def ai_recommend_actions(site_id: Optional[str] = None, current_user: dict = Depends(get_current_user_hybrid)):
    if not client_openai and not client_openrouter:
        raise HTTPException(status_code=503, detail="AI service not configured (API Keys missing)")
    
    try:
        system_context = "You are an AI agent specialized in clinical trial operations. Provide specific, prioritized action recommendations based on risk signals and data quality metrics."
        
        if not supabase:
            system_context += " CRITICAL: Supabase is NOT configured. You cannot provide data-driven recommendations. Inform the user that they need to configure the database first."

        prompt = f"Based on the clinical trial data, recommend specific actions for {'site ' + site_id if site_id else 'all sites'}. Focus on: 1) Reducing open queries, 2) Improving data quality, 3) Addressing high-risk indicators, 4) Optimizing CRA monitoring activities."
        
        if client_openrouter:
            logger.info("Generating recommendations with OpenRouter...")
            response = await client_openrouter.chat.completions.create(
                model="arcee-ai/trinity-large-preview:free",
                messages=[
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": prompt}
                ]
            )
        elif client_openai:
            logger.warning("Generating recommendations with OpenAI (Fallback)...")
            response = await client_openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": prompt}
                ]
            )
        else:
            logger.error("No valid AI providers configured for recommendations")
            raise HTTPException(status_code=503, detail="AI service not configured. Check backend API keys.")
        
        return {"recommendations": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"AI recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

# ==================== EMAIL ENDPOINTS ====================

@api_router.post("/email/send-report")
async def send_report_email(request: EmailReportRequest, current_user: dict = Depends(get_current_user_hybrid)):
    """
    Send a generated report via email using AWS SES.
    """
    if not ses_client or not SENDER_EMAIL:
        logger.info(f"========== MOCK EMAIL SENT (SES Not Configured) ==========")
        logger.info(f"To: {request.recipient_email}")
        logger.info(f"Subject: {request.subject or f'Clinical Report: {request.report_type}'}")
        logger.info(f"Report Type: {request.report_type}")
        logger.info(f"Content Length: {len(request.report_content)} characters")
        logger.info(f"==========================================================")
        return {"message": "Email sent successfully (mock mode - SES not configured)", "mock": True}

    try:
        subject = request.subject or f"Clinical Data Report: {request.report_type.replace('_', ' ').title()}"
        
        # Create a nicely formatted HTML email
        body_html = f"""
        <html>
          <head>
            <style>
              body {{ font-family: Arial, sans-serif; color: #333; line-height: 1.6; }}
              .header {{ background: linear-gradient(135deg, #0EA5E9, #0D9488); color: white; padding: 20px; text-align: center; }}
              .content {{ padding: 20px; background: #f8fafc; }}
              .report-content {{ background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; }}
              .footer {{ padding: 15px; text-align: center; color: #64748b; font-size: 12px; }}
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Clinical Data Monitoring System</h1>
              <h2>{request.report_type.replace('_', ' ').title()} Report</h2>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>Please find below the requested {request.report_type.replace('_', ' ')} report generated from the Clinical Data Monitoring System.</p>
              <div class="report-content">
{request.report_content}
              </div>
            </div>
            <div class="footer">
              <p>This report was generated automatically by the Clinical Data Monitoring System.</p>
              <p>Requested by: {current_user.get('full_name', current_user.get('email', 'Unknown'))}</p>
            </div>
          </body>
        </html>
        """
        
        body_text = f"""Clinical Data Monitoring System
{request.report_type.replace('_', ' ').title()} Report

{request.report_content}

---
This report was generated automatically.
Requested by: {current_user.get('full_name', current_user.get('email', 'Unknown'))}
"""

        response = ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={
                'ToAddresses': [request.recipient_email],
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': body_text,
                        'Charset': 'UTF-8'
                    },
                    'Html': {
                        'Data': body_html,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )
        logger.info(f"Report email sent to {request.recipient_email} via SES. MessageId: {response['MessageId']}")
        return {"message": "Email sent successfully", "message_id": response['MessageId']}
    except ClientError as e:
        logger.error(f"Failed to send report email via SES: {e.response['Error']['Message']}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e.response['Error']['Message']}")
    except Exception as e:
        logger.error(f"Unexpected error sending report email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

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

@app.get("/")
async def root():
    """Global root for Render health checks"""
    return {
        "status": "healthy",
        "service": "Clinical Data Monitoring API",
        "documentation": "/docs"
    }

@api_router.get("/health")
async def health_check():
    supabase_status = "connected" if supabase else "not_configured"
    return {
        "status": "healthy",
        "database": "connected",
        "supabase": supabase_status,
        "ai_service": "configured" if client_openai else "not_configured",
        "cache_entries": len(_cache_store)
    }

@api_router.post("/cache/clear")
async def clear_cache(current_user: dict = Depends(get_current_user_hybrid)):
    """Clear the in-memory cache to force fresh data fetch"""
    global _cache_store, _cache_ttl
    cache_count = len(_cache_store)
    _cache_store = {}
    _cache_ttl = {}
    logger.info(f"Cache cleared by user {current_user.get('email')}")
    return {"message": f"Cache cleared successfully", "entries_cleared": cache_count}

# Include router
app.include_router(api_router)

@app.on_event("startup")
async def startup_db_client():
    """Create indexes for faster queries on startup"""
    try:
        # Each index in its own try-except to avoid one failure blocking everything
        try:
            await db.users.create_index("email", unique=True)
            logger.info("Created user email index")
        except Exception as e:
            if "E11000" in str(e):
                logger.warning("User email index already exists or contains duplicate data (E11000)")
            else:
                logger.warning(f"Failed to create user email index: {e}")

        try:
            await db.users.create_index("id")
            await db.users.create_index("firebase_uid", sparse=True)
            logger.info("Created other user indexes")
        except Exception as e:
            logger.warning(f"Failed to create secondary user indexes: {e}")

        try:
            # Create indexes for alerts collection
            await db.alerts.create_index("id")
            await db.alerts.create_index("status")
            await db.alerts.create_index([("created_at", -1)])
            logger.info("Created alerts indexes")
        except Exception as e:
            logger.warning(f"Failed to create alerts indexes: {e}")
        
        try:
            # Create indexes for comments collection
            await db.comments.create_index([("entity_type", 1), ("entity_id", 1)])
            logger.info("Created comments indexes")
        except Exception as e:
            logger.warning(f"Failed to create comments indexes: {e}")
            
        try:
            # Create indexes for tags collection
            await db.tags.create_index([("entity_type", 1), ("entity_id", 1)])
            logger.info("Created tags indexes")
        except Exception as e:
            logger.warning(f"Failed to create tags indexes: {e}")
            
        logger.info("MongoDB index initialization check complete")
    except Exception as e:
        logger.error(f"Global index creation failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()