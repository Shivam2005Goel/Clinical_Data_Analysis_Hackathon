# Local Setup Guide for Windows

This guide will help you set up and run the Clinical Data Monitoring System locally on your Windows machine.

## Prerequisites

Ensure you have the following installed:
1.  **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2.  **Python** (v3.10 or higher) - [Download](https://python.org/)
3.  **MongoDB Community Server** - [Download](https://www.mongodb.com/try/download/community)

## Step 1: Start MongoDB

1.  Open a terminal (PowerShell or Command Prompt).
2.  Create a directory for your data if you haven't already:
    ```powershell
    md c:\data\db
    ```
3.  Start the MongoDB server:
    ```powershell
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="c:\data\db"
    ```
    *(Note: Your path to mongod.exe may vary depending on the version you installed. You might need to add it to your System PATH or locate it in Program Files.)*

    **Keep this terminal open.** MongoDB must be running for the backend to work.

## Step 2: Backend Setup

1.  Open a **new** terminal window.
2.  Navigate to the backend directory:
    ```powershell
    cd backend
    ```
3.  Create a virtual environment (optional but recommended):
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```
4.  Install dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
5.  Create a `.env` file in the `backend` directory. You can use Notepad or VS Code:
    ```powershell
    notepad .env
    ```
    Add the following content (replace placeholders with your actual keys):
    ```env
    MONGO_URL="mongodb://localhost:27017"
    DB_NAME="clinical_trials"
    CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
    
    # Supabase (Get these from your Supabase Project Settings -> API)
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_KEY=your-supabase-anon-key
    
    # AI Config (Emergent Key)
    EMERGENT_LLM_KEY=your-emergent-key
    
    # Security
    JWT_SECRET=development_secret_key
    JWT_ALGORITHM=HS256
    JWT_EXPIRATION_MINUTES=1440
    ```
6.  Start the backend server:
    ```powershell
    uvicorn server:app --reload
    ```
    You should see output indicating the server is running on `http://127.0.0.1:8000`.

## Step 3: Frontend Setup

1.  Open a **new** terminal window.
2.  Navigate to the frontend directory:
    ```powershell
    cd frontend
    ```
3.  Install Node dependencies:
    ```powershell
    npm install
    # If you encounter legacy peer dep issues, try:
    # npm install --legacy-peer-deps
    ```
4.  Create a `.env` file in the `frontend` directory:
    ```powershell
    notepad .env
    ```
    Add the following content:
    ```env
    REACT_APP_BACKEND_URL=http://localhost:8000
    
    # Supabase (Must match backend params)
    REACT_APP_SUPABASE_URL=https://your-project.supabase.co
    REACT_APP_SUPABASE_KEY=your-supabase-anon-key
    
    # Firebase (Optional: For Dashboard Auth)
    REACT_APP_FIREBASE_API_KEY=your-api-key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    REACT_APP_FIREBASE_PROJECT_ID=your-project-id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    REACT_APP_FIREBASE_APP_ID=your-app-id
    ```
5.  Start the frontend application:
    ```powershell
    npm start
    ```
    This will open your browser to `http://localhost:3000`.

## Step 4: Verification

1.  Open `http://localhost:3000` in your browser.
2.  If asked to login, use the Register tab to create an account (this uses the local MongoDB/Firebase setup).
3.  If dashboard data is missing, ensure your Supabase keys are correct and you have imported the CSV data as described in `SETUP_INSTRUCTIONS.md`.

## Troubleshooting

-   **Backend Fails to Start**: Ensure MongoDB is running. Check error messages for missing env vars.
-   **Frontend Connection Error**: Ensure backend is running on port 8000. Check console logs (F12) in browser.
-   **Dependencies**: If `pip install` fails on Windows, you might need to install "C++ Build Tools" or check specific package compatibilities.
