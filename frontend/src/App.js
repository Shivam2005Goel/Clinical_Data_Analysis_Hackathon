import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiteAnalysisPage from './pages/SiteAnalysisPage';
import PatientAnalysisPage from './pages/PatientAnalysisPage';
import RiskManagementPage from './pages/RiskManagementPage';
import AIAssistantPage from './pages/AIAssistantPage';
import DataQualityPage from './pages/DataQualityPage';
import ReportsPage from './pages/ReportsPage';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sites" element={<SiteAnalysisPage />} />
            <Route path="patients" element={<PatientAnalysisPage />} />
            <Route path="risk" element={<RiskManagementPage />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="data-quality" element={<DataQualityPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
