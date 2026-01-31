# 🧬Clinical Data Monitoring System - Complete Setup Guide 🩺

## Overview
A comprehensive Clinical Data Monitoring System with **Supabase** for clinical data storage and **Firebase Authentication** for secure user access.

## Register/Login Page
<img width="2879" height="1525" alt="image" src="https://github.com/user-attachments/assets/c3cdb7b6-5ff9-452a-ae07-e168b490fb7a" />
<img width="2863" height="1504" alt="image" src="https://github.com/user-attachments/assets/8ea5e9de-afee-440a-adec-6c44d2e565de" />
<img width="2859" height="1520" alt="image" src="https://github.com/user-attachments/assets/ed973540-5d72-4ef3-a23f-25094243dfae" />
<img width="2879" height="1514" alt="image" src="https://github.com/user-attachments/assets/ebe35c9c-49c7-4c93-85c0-827b4a0ec53b" />
<img width="2874" height="1541" alt="image" src="https://github.com/user-attachments/assets/a2474994-9f27-4500-97d5-0858b1f07bef" />
<img width="2879" height="1539" alt="image" src="https://github.com/user-attachments/assets/dd7ca3fb-b9a6-4df8-a9d7-6fd5afd3a4c9" />
<img width="2879" height="1505" alt="image" src="https://github.com/user-attachments/assets/34a2faf3-26c0-4ce1-a6d7-e02a4211b5df" />
<img width="2683" height="1543" alt="image" src="https://github.com/user-attachments/assets/fc035d97-bed5-4727-82db-f561993fde98" />
<img width="2859" height="1514" alt="image" src="https://github.com/user-attachments/assets/9a833599-2845-47af-8db8-51ec7ea9c0a3" />
<img width="2869" height="1534" alt="image" src="https://github.com/user-attachments/assets/74d1d26a-4931-4dde-bb0b-c8f76cbb87fe" />










![Alt text for the image](./Images/dashboard.png)
## Dashboard
![Alt text for the image](./Images/dashboard.png)
## Sites Risk Analysis
![Alt text for the image](./Images/Sites%20Risk%20Analysis.png)
## Patient Analysis
![Alt text for the image](./Images/Patient%20Analysis.png)
## AI Agents
![Alt text for the image](./Images/AI%20Agents.png)
## Generate Reports
![Alt text for the image](./Images/Generate%20Reports.png)

# 🏥 Clinical Data Monitoring System

<div align="center">

![Clinical Data Monitoring](https://img.shields.io/badge/Clinical-Data%20Monitoring-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)

**A comprehensive platform for clinical trial data quality monitoring and risk management**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Support](#-support)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The Clinical Data Monitoring System is an enterprise-grade platform designed to streamline clinical trial data quality management. It provides real-time insights into data quality metrics, risk assessment, and automated reporting for Clinical Research Associates (CRAs), Data Quality Teams (DQT), and site staff.

### Why This System?

- **🎯 Real-time Monitoring**: Track data quality metrics across multiple sites and patients
- **🤖 AI-Powered Insights**: Leverage GPT-5.2 for intelligent analysis and recommendations
- **📊 Comprehensive Reporting**: Generate automated reports for stakeholders
- **🔒 Secure & Compliant**: HIPAA-ready with Firebase authentication and RLS policies
- **📈 Scalable Architecture**: Built on modern cloud infrastructure (Supabase, Firebase, MongoDB)

---

## ✨ Features

### 🎛️ Dashboard & Analytics
- **Real-time KPI Monitoring**: Total sites, patients, risk scores, and clean patient percentages
- **Interactive Visualizations**: Risk distribution charts, regional analysis, and trend graphs
- **Custom Filters**: Filter by region, country, risk level, and time period

### 🏥 Site & Patient Analysis
- **Multi-level Data Quality Tracking**: Monitor missing pages, open issues, uncoded terms, and lab discrepancies
- **Risk Scoring Algorithm**: Automated risk classification (High/Medium/Low)
- **Patient-Level Insights**: Individual DQI scores and clean status tracking
- **Collaborative Features**: Comments, tags, and team annotations

### ⚠️ Risk Management
- **Automated Alert System**: Create and manage alerts for high-risk indicators
- **Priority-Based Workflow**: Organize tasks by urgency and impact
- **Issue Resolution Tracking**: Monitor resolution progress and timelines
- **Escalation Protocols**: Built-in workflows for critical issues

### 🤖 AI Assistant
- **Natural Language Queries**: Ask questions about your clinical data in plain English
- **Automated Report Generation**: 
  - Site Performance Reports
  - CRA Activity Reports
  - Risk Analysis Summaries
- **Intelligent Recommendations**: AI-powered action items and insights
- **Powered by OpenAI GPT-5.2**: Advanced language understanding and generation

### 📊 Data Quality Metrics
- **Data Quality Index (DQI)**: Composite score based on multiple quality indicators
- **Issue Categorization**: Track by type (missing pages, uncoded terms, lab issues)
- **Trend Analysis**: Monitor data quality improvements over time
- **Benchmark Comparisons**: Compare sites against study averages

### 📄 Reporting & Export
- **CSV Export**: Download filtered datasets for external analysis
- **Executive Summaries**: One-click generation of stakeholder reports
- **Custom Report Templates**: Tailor reports to specific audiences
- **Scheduled Reports**: Automated delivery to team members

### 👥 Role-Based Access Control
- **Multiple User Roles**: CRA, DQT, Site Staff, Manager
- **Granular Permissions**: Control access to sensitive data
- **Audit Trails**: Track all user actions and data changes

---

## 🖼️ Demo

### Authentication

<table>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/c3cdb7b6-5ff9-452a-ae07-e168b490fb7a" alt="Login Page" />
      <p align="center"><strong>Secure Login</strong></p>
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/8ea5e9de-afee-440a-adec-6c44d2e565de" alt="Registration" />
      <p align="center"><strong>User Registration</strong></p>
    </td>
  </tr>
</table>

### Main Dashboard

![Dashboard Overview](./Images/dashboard.png)
*Comprehensive dashboard with real-time KPIs and visualizations*

### Analytics Views

<table>
  <tr>
    <td width="50%">
      <img src="./Images/Sites%20Risk%20Analysis.png" alt="Sites Risk Analysis" />
      <p align="center"><strong>Sites Risk Analysis</strong></p>
    </td>
    <td width="50%">
      <img src="./Images/Patient%20Analysis.png" alt="Patient Analysis" />
      <p align="center"><strong>Patient-Level Analysis</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./Images/Data%20Quality%20Analysis.png" alt="Data Quality" />
      <p align="center"><strong>Data Quality Metrics</strong></p>
    </td>
    <td width="50%">
      <img src="./Images/AI%20Agents.png" alt="AI Assistant" />
      <p align="center"><strong>AI-Powered Insights</strong></p>
    </td>
  </tr>
</table>

### Report Generation

![Generate Reports](./Images/Generate%20Reports.png)
*Automated report generation with customizable templates*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React 19   │  │ Firebase SDK │  │ Supabase JS  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │            FastAPI Backend (Python)              │        │
│  │  • JWT Authentication                            │        │
│  │  • Firebase Admin Verification                   │        │
│  │  • RESTful API Endpoints                         │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│    Supabase      │ │   Firebase   │ │   MongoDB    │
│   (PostgreSQL)   │ │ Authentication│ │  (Profiles)  │
│                  │ │               │ │              │
│ • Clinical Data  │ │ • User Auth   │ │ • Alerts     │
│ • Sites          │ │ • Tokens      │ │ • Comments   │
│ • Patients       │ │ • Sessions    │ │ • Tags       │
└──────────────────┘ └──────────────┘ └──────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│         OpenAI GPT-5.2 API           │
│    (AI Assistant & Analytics)        │
└──────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19 (Hooks, Context API)
- Material-UI / Custom CSS
- Chart.js / Recharts
- Axios for API calls
- Firebase SDK

**Backend:**
- FastAPI (Python 3.9+)
- Pydantic for data validation
- PyMongo for MongoDB
- Supabase Python Client
- Firebase Admin SDK

**Databases:**
- Supabase (PostgreSQL) - Clinical data storage
- MongoDB - User profiles, comments, alerts
- Firebase - Authentication state

**AI & Analytics:**
- OpenAI GPT-5.2
- Custom risk scoring algorithms
- Natural language processing

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+ and npm/yarn
- MongoDB (local or Atlas)
- Supabase account
- Firebase account
- OpenAI API key (Emergent Universal Key configured)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clinical-data-monitoring.git
cd clinical-data-monitoring

# Backend setup
cd app/backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your credentials

# Start services
# Backend (from app/backend)
uvicorn main:app --reload --port 8000

# Frontend (from app/frontend)
npm start
```

### Using Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 🔧 Detailed Setup

### 1️⃣ Firebase Authentication Setup

#### Step 1: Create Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `clinical-data-monitoring`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

#### Step 2: Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Enable additional providers (Google, Microsoft)

#### Step 3: Get Configuration Keys

1. Go to **Project Settings** → **General**
2. Under "Your apps", click **Web** icon (`</>`)
3. Register app: `clinical-monitoring-web`
4. Copy the configuration object

#### Step 4: Configure Frontend

Update `/app/frontend/.env`:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...your-actual-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

#### Step 5: Service Account (Optional)

For backend verification:

1. **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Save as `/app/backend/firebase-admin.json`
4. Add to backend `.env`:

```env
FIREBASE_ADMIN_CONFIG_PATH=/app/backend/firebase-admin.json
```

### 2️⃣ Supabase Database Setup

#### Step 1: Create Tables

Execute the following SQL in your Supabase SQL Editor:

```sql
-- High Risk Sites Table
CREATE TABLE "High Risk Sites" (
  "Study" TEXT,
  "Region" TEXT,
  "Country" TEXT,
  "Site_ID" TEXT PRIMARY KEY,
  "Total_Subjects" INTEGER,
  "Total_Missing_Pages" INTEGER,
  "Total_Open_Issues" INTEGER,
  "Total_Uncoded_MedDRA" INTEGER,
  "Total_Uncoded_WHODD" INTEGER,
  "Total_Lab_Issues" INTEGER,
  "Avg_DQI" DOUBLE PRECISION,
  "Clean_Patients_Count" INTEGER,
  "Clean_Patient_Percentage" DOUBLE PRECISION,
  "Risk_Score" DOUBLE PRECISION,
  "Risk_Level" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Patient Data Table
CREATE TABLE "Patient Data" (
  "Study" TEXT,
  "Region" TEXT,
  "Country" TEXT,
  "Site_ID" TEXT,
  "Subject_ID" TEXT PRIMARY KEY,
  "missing_pages_count" INTEGER,
  "total_open_issues" INTEGER,
  "uncoded_meddra_terms" INTEGER,
  "uncoded_whodd_terms" INTEGER,
  "missing_lab_count" INTEGER,
  "Clean_Patient_Status" TEXT,
  "Data_Quality_Index" INTEGER,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Sites Data Table
CREATE TABLE "Sites Data" (
  "Study" TEXT,
  "Region" TEXT,
  "Country" TEXT,
  "Site_ID" TEXT PRIMARY KEY,
  "Total_Subjects" INTEGER,
  "Total_Missing_Pages" INTEGER,
  "Total_Open_Issues" INTEGER,
  "Total_Uncoded_MedDRA" INTEGER,
  "Total_Uncoded_WHODD" INTEGER,
  "Total_Lab_Issues" INTEGER,
  "Avg_DQI" DOUBLE PRECISION,
  "Clean_Patients_Count" INTEGER,
  "Clean_Patient_Percentage" DOUBLE PRECISION,
  "Risk_Score" DOUBLE PRECISION,
  "Risk_Level" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

#### Step 2: Import Data

1. Navigate to **Table Editor** in Supabase Dashboard
2. Select a table
3. Click **Insert** → **Import data from CSV**
4. Upload your CSV files:
   - `Output_High_Risk_Sites.csv` → **High Risk Sites**
   - `Output_Patient_Level_Unified_CLEAN.csv` → **Patient Data**
   - `Output_Site_Level_Summary.csv` → **Sites Data**

#### Step 3: Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE "High Risk Sites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient Data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sites Data" ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
CREATE POLICY "Allow authenticated read access" ON "High Risk Sites"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON "Patient Data"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access" ON "Sites Data"
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### Step 4: Configure Environment

Update both frontend and backend `.env` files:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_KEY=your-anon-public-key

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key
```

### 3️⃣ MongoDB Setup

#### Local MongoDB:

```bash
# Install MongoDB
# Ubuntu
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
```

#### MongoDB Atlas (Cloud):

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update backend `.env`:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=clinical_monitoring
```

### 4️⃣ Environment Variables

#### Frontend (`/app/frontend/.env`)

```env
# Backend API
REACT_APP_BACKEND_URL=http://localhost:8000

# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-anon-key

# Firebase
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_APP_ID=your-app-id
```

#### Backend (`/app/backend/.env`)

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=clinical_monitoring

# API Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
JWT_SECRET=your-super-secret-jwt-key-change-this

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Firebase (Optional)
FIREBASE_ADMIN_CONFIG_PATH=/app/backend/firebase-admin.json

# OpenAI
EMERGENT_LLM_KEY=your-openai-api-key
```

---

## 📖 Usage Guide

### First-Time User Registration

1. Navigate to `http://localhost:3000`
2. Click **"Register"** tab
3. Fill in your details:
   - **Full Name**: John Doe
   - **Email**: john.doe@example.com
   - **Password**: Minimum 6 characters
   - **Role**: Select from dropdown (CRA, DQT, Site Staff, Manager)
4. Click **"Create Account"**
5. You'll be automatically logged in

### Dashboard Navigation

#### Main Dashboard
- **KPI Cards**: View total sites, patients, high-risk sites, clean patient percentage
- **Charts**: Risk distribution pie chart, top 5 high-risk sites
- **Filters**: Filter by region, country, date range

#### Site Analysis
```
Navigation: Dashboard → Site Analysis
```
- View all sites with risk scores
- Filter by risk level (High/Medium/Low)
- Search by Site ID, Country, or Region
- Click on a site to view detailed metrics
- Add comments and tags for collaboration

#### Patient Analysis
```
Navigation: Dashboard → Patient Analysis
```
- View patient-level data quality
- Filter by clean status (Clean/Not Clean)
- Search by Patient ID or Site ID
- View individual DQI scores
- Track missing pages, open issues, uncoded terms

#### Risk Management
```
Navigation: Dashboard → Risk Management
```
- View all high-risk sites in one place
- Create alerts for specific issues
- Assign priority levels (High/Medium/Low)
- Track resolution status
- Add resolution notes

#### AI Assistant
```
Navigation: Dashboard → AI Assistant
```

**Example Queries:**
- "What are the top 5 sites with the highest risk scores?"
- "Show me patients with DQI below 70"
- "Generate a site performance report for Site 001"
- "What's the average clean patient percentage by region?"

**Generate Reports:**
1. Select report type (Site Performance, CRA Report, Risk Analysis)
2. Configure parameters (date range, site filter)
3. Click "Generate Report"
4. Download or email the report

#### Data Quality Dashboard
```
Navigation: Dashboard → Data Quality
```
- Monitor open issues across all sites
- Track missing pages trends
- View uncoded term statistics
- Analyze lab issue patterns
- DQI distribution visualization

#### Reports & Export
```
Navigation: Dashboard → Reports
```
- **Export Data**: Download filtered datasets as CSV
- **Executive Summary**: Generate high-level reports
- **Custom Reports**: Create tailored reports for stakeholders
- **Schedule Reports**: Set up automated report delivery

### User Roles & Permissions

| Feature | CRA | DQT | Site Staff | Manager |
|---------|-----|-----|------------|---------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Site Analysis | ✅ | ✅ | ✅ | ✅ |
| View Patient Data | ✅ | ✅ | ⚠️ Own site only | ✅ |
| Create Alerts | ✅ | ✅ | ❌ | ✅ |
| Resolve Issues | ✅ | ✅ | ⚠️ Own site only | ✅ |
| Generate Reports | ✅ | ✅ | ⚠️ Limited | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| AI Assistant | ✅ | ✅ | ⚠️ Limited | ✅ |

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "CRA"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "CRA"
  }
}
```

### Data Endpoints

#### Get All Sites
```http
GET /api/sites
Authorization: Bearer {token}

Query Parameters:
- risk_level: High|Medium|Low
- region: string
- country: string
```

#### Get Site Details
```http
GET /api/sites/{site_id}
Authorization: Bearer {token}
```

#### Get Patient Data
```http
GET /api/patients
Authorization: Bearer {token}

Query Parameters:
- site_id: string
- clean_status: Clean|Not Clean
- dqi_min: integer (0-100)
```

### Alert Endpoints

#### Create Alert
```http
POST /api/alerts
Authorization: Bearer {token}
Content-Type: application/json

{
  "site_id": "001",
  "issue_type": "High Missing Pages",
  "priority": "High",
  "description": "Site has 45 missing pages"
}
```

#### Update Alert Status
```http
PUT /api/alerts/{alert_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Resolved",
  "resolution_notes": "Issue addressed with site staff"
}
```

### AI Assistant Endpoints

#### Query AI
```http
POST /api/ai/query
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "What are the top 5 highest risk sites?"
}
```

#### Generate Report
```http
POST /api/ai/generate-report
Authorization: Bearer {token}
Content-Type: application/json

{
  "report_type": "site_performance",
  "site_id": "001",
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

### Interactive API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🔐 Security

### Authentication Methods

The system supports dual authentication:

1. **Firebase Authentication (Recommended)**
   - Industry-standard security
   - Automatic token refresh
   - MFA support (optional)
   - Secure session management

2. **JWT Authentication (Fallback)**
   - Works without external dependencies
   - MongoDB-backed user storage
   - Manual token management

### Security Best Practices

#### For Development:
```bash
# Use environment variables
cp .env.example .env
# Never commit .env files

# Strong passwords
# Minimum 8 characters, mix of upper/lower/numbers/symbols
```

#### For Production:

1. **Enable HTTPS/SSL**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

2. **Configure CORS Properly**
```python
# backend/main.py
CORS_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

3. **Enable Supabase RLS**
```sql
ALTER TABLE "Patient Data" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their assigned sites"
ON "Patient Data"
FOR SELECT
USING (
  "Site_ID" IN (
    SELECT site_id FROM user_site_assignments
    WHERE user_id = auth.uid()
  )
);
```

4. **Rotate Secrets Regularly**
- Firebase service account keys: Every 90 days
- JWT secrets: Every 30 days
- API keys: Every 60 days

5. **Monitor & Audit**
- Enable Firebase audit logs
- Track API access patterns
- Monitor for suspicious activity

### Data Protection

- **Encryption at Rest**: All data encrypted in Supabase/MongoDB
- **Encryption in Transit**: HTTPS/TLS for all API calls
- **PHI/PII Handling**: Follow HIPAA guidelines for patient data
- **Access Logging**: All data access logged for audit

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Firebase Authentication Not Working

**Error**: "Firebase not configured" or "API key invalid"

**Solutions**:
```bash
# Check environment variables
cat /app/frontend/.env | grep FIREBASE

# Verify no extra spaces or quotes
REACT_APP_FIREBASE_API_KEY=AIzaSy... # ✅ Correct
REACT_APP_FIREBASE_API_KEY="AIzaSy..." # ❌ Wrong

# Restart frontend
npm start
```

#### 2. Supabase Data Not Loading

**Error**: Empty dashboard or "Failed to fetch data"

**Solutions**:
```bash
# Verify table names (exact match required)
Tables must be: "High Risk Sites", "Patient Data", "Sites Data"

# Check RLS policies
# In Supabase Dashboard → Authentication → Policies
# Ensure read access is granted

# Test connection
curl -X GET "https://your-project.supabase.co/rest/v1/Sites%20Data" \
  -H "apikey: your-anon-key"
```

#### 3. Backend Not Starting

**Error**: "ModuleNotFoundError" or "Connection refused"

**Solutions**:
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check MongoDB connection
mongo --eval "db.runCommand({ ping: 1 })"

# View logs
tail -f /var/log/supervisor/backend.err.log
```

#### 4. CORS Errors

**Error**: "Access-Control-Allow-Origin" in browser console

**Solutions**:
```python
# backend/.env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# backend/main.py - verify CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 5. AI Assistant Not Responding

**Error**: "OpenAI API error" or "Rate limit exceeded"

**Solutions**:
```bash
# Check API key
echo $EMERGENT_LLM_KEY

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $EMERGENT_LLM_KEY"

# Check rate limits in OpenAI dashboard
# Implement exponential backoff in code
```

### Debugging Steps

1. **Check Service Status**
```bash
sudo supervisorctl status
# Should show: backend RUNNING, frontend RUNNING
```

2. **View Logs**
```bash
# Backend errors
tail -f /var/log/supervisor/backend.err.log

# Backend output
tail -f /var/log/supervisor/backend.out.log

# Frontend errors
tail -f /var/log/supervisor/frontend.err.log
```

3. **Restart Services**
```bash
# Restart individual services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Restart all
sudo supervisorctl restart all
```

4. **Clear Cache**
```bash
# Browser: Clear localStorage
localStorage.clear();

# Backend: Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +

# Frontend: Clear node modules
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

If you're still experiencing issues:

1. **Check Documentation**: Review the relevant section in this README
2. **Search Issues**: Look for similar issues in the GitHub Issues tab
3. **Enable Debug Mode**:
   ```env
   # backend/.env
   DEBUG=True
   LOG_LEVEL=DEBUG
   ```
4. **Create an Issue**: Include:
   - Error message and stack trace
   - Environment details (OS, Python/Node versions)
   - Steps to reproduce
   - Relevant logs

---

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Tutorials
- [Setting up Firebase Authentication](https://firebase.google.com/docs/auth/web/start)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)

### Community
- [GitHub Discussions](#) - Ask questions and share ideas
- [Stack Overflow](https://stackoverflow.com/questions/tagged/clinical-trials) - Technical questions

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React
- Write unit tests for new features
- Update documentation for API changes
- Add comments for complex logic

### Code Review Process

1. All PRs require at least one approval
2. CI/CD checks must pass
3. Code coverage should not decrease
4. Documentation must be updated

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

--
<div align="center">

**Made with ❤️ for Clinical Research Teams**

[⬆ Back to Top](#-clinical-data-monitoring-system)

</div>
