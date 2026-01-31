# 🚀 Deployment Guide - Clinical Data Monitoring System

This guide outlines the steps to deploy the application to production environments.

## Architecture Overview
- **Frontend**: React (SPA) -> Deploy to **Vercel** or **Netlify**
- **Backend**: FastAPI (Python) -> Deploy to **Render**, **Railway**, or **Fly.io**
- **Databases**: 
  - **MongoDB**: Use **MongoDB Atlas** (Cloud)
  - **Relational Data**: Use **Supabase** (Already configured)

---

## 1. Backend Deployment (FastAPI)

### Recommended Platform: [Render](https://render.com/) or [Railway](https://railway.app/)

1. **Prepare Code**:
   - Ensure `backend/requirements.txt` is up to date.
   - The entry point is `server.py`, and the command to start is `uvicorn server:app --host 0.0.0.0 --port $PORT`.

2. **Configuration**:
   Add the following Environment Variables in your hosting provider's dashboard:
   - `MONGO_URL`: Your MongoDB Atlas connection string.
   - `DB_NAME`: `clinical_trials`
   - `SUPABASE_URL`: Your Supabase URL.
   - `SUPABASE_KEY`: Your Supabase API key.
   - `JWT_SECRET`: A long random string for security.
   - `CORS_ORIGINS`: Set to your frontend URL (e.g., `https://your-app.vercel.app`) or `*` for testing.

3. **Deploy**:
   - Connect your GitHub repository.
   - Set the root directory to `backend`.
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn server:app --host 0.0.0.0 --port $PORT`

---

## 2. Frontend Deployment (React)

### Recommended Platform: [Vercel](https://vercel.com/) (Best for React/Next.js)

1. **Configuration**:
   In the Vercel/Netlify project settings, add these Environment Variables:
   - `REACT_APP_BACKEND_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com/api`).
   - `REACT_APP_SUPABASE_URL`: Same as backend.
   - `REACT_APP_SUPABASE_KEY`: Same as backend.
   - Firebase Keys: `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_PROJECT_ID`, etc.

2. **Deploy**:
   - Connect your GitHub repository.
   - Set the root directory to `frontend`.
   - Vercel will automatically detect the build settings (Build Command: `npm run build`, Output Directory: `build`).

---

## 3. Database Setup (Cloud)

### MongoDB Atlas
1. Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas).
2. Create a user and allow access from all IP addresses (`0.0.0.0/0`) during the hackathon.
3. Copy the Connection String and put it in the backend's `MONGO_URL`.

### Supabase
- Your clinical data is already in Supabase. Ensure the `SUPABASE_URL` and `SUPABASE_KEY` are consistent across frontend and backend.

---

## 🛠️ Common Deployment Issues

### CORS Errors
If you see CORS errors in the browser console, ensure the backend's `CORS_ORIGINS` environment variable includes your frontend's production URL.

### Mixed Content (HTTP vs HTTPS)
Ensure both frontend and backend are using `https`. Modern browsers block `http` requests from `https` sites.

### Port Configuration
Render and Railway provide a `$PORT` environment variable. Ensure your backend start command uses it: `--port $PORT`.
