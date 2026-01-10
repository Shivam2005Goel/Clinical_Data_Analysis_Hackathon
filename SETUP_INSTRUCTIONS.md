# Clinical Data Monitoring System - Setup Instructions

## Overview
A comprehensive Clinical Data Monitoring System for clinical trials with real-time data monitoring, AI-powered insights, and collaborative tools for CRAs, DQT, and investigational sites.

## Features Implemented ✅
- **Authentication System**: JWT-based login/registration with role-based access
- **Dashboard**: KPI cards, charts, regional analysis, risk distribution
- **Site Analysis**: Drill-down by site with risk scoring and filtering
- **Patient Analysis**: Patient-level data quality monitoring
- **Risk Management**: Alert system with create/resolve functionality
- **AI Assistant**: Natural language queries, report generation, action recommendations (powered by OpenAI GPT-5.2)
- **Data Quality**: Issue tracking, DQI distribution, quality metrics
- **Reports**: CSV export for all data sets with custom filters
- **Collaboration Tools**: Comments, tags, and alerts for team communication

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: FastAPI, Motor (async MongoDB), JWT authentication
- **Database**: MongoDB (users, alerts, comments, tags)
- **External Data**: Supabase (clinical trial data)
- **AI**: OpenAI GPT-5.2 via Emergent Universal Key

## Environment Configuration

### 1. Supabase Setup (REQUIRED for full functionality)

The application requires Supabase to store the 3 clinical data tables. Follow these steps:

#### Step 1: Create Supabase Account
1. Go to https://supabase.com and create a free account
2. Create a new project

#### Step 2: Create Tables
Create three tables in your Supabase database:

**Table 1: high_risk_sites**
```sql
CREATE TABLE high_risk_sites (
  Study TEXT,
  Region TEXT,
  Country TEXT,
  Site_ID TEXT,
  Total_Subjects INTEGER,
  Total_Missing_Pages INTEGER,
  Total_Open_Issues INTEGER,
  Total_Uncoded_MedDRA INTEGER,
  Total_Uncoded_WHODD INTEGER,
  Total_Lab_Issues INTEGER,
  Avg_DQI FLOAT,
  Clean_Patients_Count INTEGER,
  Clean_Patient_Percentage FLOAT,
  Risk_Score FLOAT,
  Risk_Level TEXT
);
```

**Table 2: patient_level_unified**
```sql
CREATE TABLE patient_level_unified (
  Study TEXT,
  Region TEXT,
  Country TEXT,
  Site_ID TEXT,
  Subject_ID TEXT,
  missing_pages_count INTEGER,
  total_open_issues INTEGER,
  uncoded_meddra_terms INTEGER,
  uncoded_whodd_terms INTEGER,
  missing_lab_count INTEGER,
  Clean_Patient_Status TEXT,
  Data_Quality_Index INTEGER
);
```

**Table 3: site_level_summary**
```sql
CREATE TABLE site_level_summary (
  Study TEXT,
  Region TEXT,
  Country TEXT,
  Site_ID TEXT,
  Total_Subjects INTEGER,
  Total_Missing_Pages INTEGER,
  Total_Open_Issues INTEGER,
  Total_Uncoded_MedDRA INTEGER,
  Total_Uncoded_WHODD INTEGER,
  Total_Lab_Issues INTEGER,
  Avg_DQI FLOAT,
  Clean_Patients_Count INTEGER,
  Clean_Patient_Percentage FLOAT,
  Risk_Score FLOAT,
  Risk_Level TEXT
);
```

#### Step 3: Import CSV Data
1. Use the Supabase Table Editor to import your 3 CSV files:
   - Output_High_Risk_Sites.csv → high_risk_sites table
   - Output_Patient_Level_Unified_CLEAN.csv → patient_level_unified table
   - Output_Site_Level_Summary.csv → site_level_summary table

#### Step 4: Get Supabase Credentials
1. Go to Project Settings → API
2. Copy your Project URL (looks like: https://xxxxx.supabase.co)
3. Copy your anon/public key

#### Step 5: Update Environment Variables

**Backend (.env):**
```bash
# In /app/backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

**Frontend (.env):**
```bash
# In /app/frontend/.env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

#### Step 6: Restart Services
```bash
sudo supervisorctl restart backend frontend
```

### 2. Current Configuration Status

✅ **Working (No Setup Required):**
- User Authentication (MongoDB)
- Risk Management & Alerts
- AI Assistant (uses Emergent Universal Key)
- Comments & Tags

⚠️ **Requires Supabase Configuration:**
- Dashboard KPIs and charts
- Site Analysis data
- Patient Analysis data
- Data Quality metrics
- Reports export

## AI Features

The AI Assistant uses OpenAI GPT-5.2 with the **Emergent Universal Key** (already configured):
- Natural language queries about clinical data
- Automated report generation (Site Performance, CRA Reports, Risk Analysis)
- AI-powered action recommendations

## User Roles
- **CRA** (Clinical Research Associate)
- **DQT** (Data Quality Team)
- **Site Staff**
- **Manager** (Clinical Trial Manager)

## Quick Start

### 1. Create Test Account
- Navigate to http://localhost:3000
- Click "Register" tab
- Fill in:
  - Name: Your Name
  - Email: your.email@example.com
  - Password: Secure123!
  - Role: Select your role
- Click "Create Account"

### 2. Configure Supabase (See Section 1 above)

### 3. Start Using the Application
Once Supabase is configured, you can:
- View dashboard with real clinical trial data
- Analyze sites and patients
- Create and manage alerts
- Use AI assistant for insights
- Export reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Data (Requires Supabase)
- `GET /api/data/high-risk-sites` - Fetch high-risk sites
- `GET /api/data/patient-level` - Fetch patient data
- `GET /api/data/site-level` - Fetch site data
- `GET /api/data/dashboard-stats` - Get dashboard statistics

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get alerts (filter by status)
- `PATCH /api/alerts/{id}/status` - Update alert status

### AI
- `POST /api/ai/query` - Natural language query
- `POST /api/ai/generate-report` - Generate reports
- `POST /api/ai/recommend-actions` - Get AI recommendations

### Comments & Tags
- `POST /api/comments` - Create comment
- `GET /api/comments/{type}/{id}` - Get comments
- `POST /api/tags` - Create tag
- `GET /api/tags/{type}/{id}` - Get tags

## Design System

### Colors
- **Primary**: Medical Sky Blue (#0EA5E9) - Trust & Clarity
- **Accent**: Teal (#0D9488) - Clinical Success
- **Destructive**: Red (#EF4444) - High Risk
- **Warning**: Amber (#F59E0B) - Medium Risk

### Typography
- **Headings**: Manrope (Bold, Professional)
- **Body**: Inter (Clean, Readable)

### Risk Level Badges
- **High**: Red background
- **Medium**: Amber background
- **Low**: Green background

## Troubleshooting

### "Supabase not configured" Error
- This is expected if you haven't set up Supabase yet
- Follow Section 1 above to configure Supabase
- Verify the URLs and keys are correct in both .env files
- Restart services after updating .env files

### AI Features Not Working
- Check that EMERGENT_LLM_KEY is present in /app/backend/.env
- Verify backend logs: `tail -f /var/log/supervisor/backend.out.log`
- The key is already configured by default

### Authentication Issues
- Clear browser localStorage
- Check MongoDB is running: `sudo supervisorctl status mongodb`
- Verify backend logs for errors

## Support

For any issues or questions:
1. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
2. Check frontend logs: `tail -f /var/log/supervisor/frontend.err.log`
3. Verify all services are running: `sudo supervisorctl status`

## Next Steps

Once Supabase is configured, you can:
1. **Import your clinical trial data** into the 3 Supabase tables
2. **Explore dashboards** with real-time KPIs and visualizations
3. **Analyze high-risk sites** and patient data quality
4. **Use AI features** for insights and recommendations
5. **Set up alerts** for critical issues
6. **Export reports** for stakeholders
