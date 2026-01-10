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
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI()
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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
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
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
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
    
    await db.users.insert_one(doc)
    
    access_token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    access_token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# ==================== SUPABASE DATA ENDPOINTS ====================

@api_router.get("/data/high-risk-sites")
async def get_high_risk_sites(current_user: dict = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to environment variables.")
    try:
        response = supabase.table('High Risk Sites').select('*').execute()
        return {"data": response.data, "count": len(response.data)}
    except Exception as e:
        logger.error(f"Error fetching high risk sites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@api_router.get("/data/patient-level")
async def get_patient_level_data(current_user: dict = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to environment variables.")
    try:
        response = supabase.table('Patient Data').select('*').execute()
        return {"data": response.data, "count": len(response.data)}
    except Exception as e:
        logger.error(f"Error fetching patient data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@api_router.get("/data/site-level")
async def get_site_level_data(current_user: dict = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to environment variables.")
    try:
        response = supabase.table('Sites Data').select('*').execute()
        return {"data": response.data, "count": len(response.data)}
    except Exception as e:
        logger.error(f"Error fetching site data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@api_router.get("/data/dashboard-stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        sites_response = supabase.table('Sites Data').select('*').execute()
        patients_response = supabase.table('Patient Data').select('*').execute()
        
        sites = sites_response.data
        patients = patients_response.data
        
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
async def create_alert(alert_data: AlertCreate, current_user: dict = Depends(get_current_user)):
    alert = Alert(**alert_data.model_dump(), created_by=current_user['id'])
    doc = alert.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.alerts.insert_one(doc)
    return alert

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if status:
        query['status'] = status
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for alert in alerts:
        if isinstance(alert['created_at'], str):
            alert['created_at'] = datetime.fromisoformat(alert['created_at'])
    return alerts

@api_router.patch("/alerts/{alert_id}/status")
async def update_alert_status(alert_id: str, status: str, current_user: dict = Depends(get_current_user)):
    result = await db.alerts.update_one({"id": alert_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert status updated"}

# ==================== COMMENTS ENDPOINTS ====================

@api_router.post("/comments", response_model=Comment)
async def create_comment(comment_data: CommentCreate, current_user: dict = Depends(get_current_user)):
    comment = Comment(**comment_data.model_dump(), created_by=current_user['id'])
    doc = comment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.comments.insert_one(doc)
    return comment

@api_router.get("/comments/{entity_type}/{entity_id}", response_model=List[Comment])
async def get_comments(entity_type: str, entity_id: str, current_user: dict = Depends(get_current_user)):
    comments = await db.comments.find({"entity_type": entity_type, "entity_id": entity_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for comment in comments:
        if isinstance(comment['created_at'], str):
            comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    return comments

# ==================== TAGS ENDPOINTS ====================

@api_router.post("/tags", response_model=Tag)
async def create_tag(tag_data: TagCreate, current_user: dict = Depends(get_current_user)):
    tag = Tag(**tag_data.model_dump(), created_by=current_user['id'])
    doc = tag.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tags.insert_one(doc)
    return tag

@api_router.get("/tags/{entity_type}/{entity_id}", response_model=List[Tag])
async def get_tags(entity_type: str, entity_id: str, current_user: dict = Depends(get_current_user)):
    tags = await db.tags.find({"entity_type": entity_type, "entity_id": entity_id}, {"_id": 0}).to_list(100)
    for tag in tags:
        if isinstance(tag['created_at'], str):
            tag['created_at'] = datetime.fromisoformat(tag['created_at'])
    return tags

# ==================== AI ENDPOINTS ====================

@api_router.post("/ai/query")
async def ai_natural_language_query(request: AIQueryRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        # Get context data from Supabase
        context = "You are an AI assistant for a Clinical Data Monitoring System. "
        if supabase:
            sites = supabase.table('site_level_summary').select('*').limit(50).execute()
            context += f"\n\nAvailable site data summary: {len(sites.data)} sites. "
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"query-{current_user['id']}-{datetime.now(timezone.utc).isoformat()}",
            system_message=context + "Answer questions about clinical trial data, site performance, patient data quality, and provide actionable insights."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.query)
        response = await chat.send_message(user_message)
        
        return {"response": response}
    except Exception as e:
        logger.error(f"AI query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI query failed: {str(e)}")

@api_router.post("/ai/generate-report")
async def ai_generate_report(request: AIReportRequest, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
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
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"report-{current_user['id']}-{datetime.now(timezone.utc).isoformat()}",
            system_message="You are an expert clinical data analyst. Generate detailed, professional reports with clear sections, metrics, and actionable recommendations."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"report": response, "report_type": request.report_type}
    except Exception as e:
        logger.error(f"AI report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@api_router.post("/ai/recommend-actions")
async def ai_recommend_actions(site_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        prompt = f"Based on the clinical trial data, recommend specific actions for {'site ' + site_id if site_id else 'all sites'}. Focus on: 1) Reducing open queries, 2) Improving data quality, 3) Addressing high-risk indicators, 4) Optimizing CRA monitoring activities."
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"actions-{current_user['id']}-{datetime.now(timezone.utc).isoformat()}",
            system_message="You are an AI agent specialized in clinical trial operations. Provide specific, prioritized action recommendations based on risk signals and data quality metrics."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"recommendations": response}
    except Exception as e:
        logger.error(f"AI recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

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
        "ai_service": "configured" if EMERGENT_LLM_KEY else "not_configured"
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()