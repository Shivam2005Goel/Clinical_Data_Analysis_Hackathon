import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, FileText, Filter, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { motion } from 'framer-motion';
import {
  generateSitesReportPDF,
  generatePatientsReportPDF,
  generateSummaryReportPDF
} from '../utils/pdfGenerator';

const ReportsPage = () => {
  const [sitesData, setSitesData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesRes, patientsRes] = await Promise.all([
        api.get('/data/site-level'),
        api.get('/data/patient-level')
      ]);
      setSitesData(sitesRes.data.data || []);
      setPatientsData(patientsRes.data.data || []);
      setError('');
    } catch (err) {
      // Use demo data for UI showcase
      setSitesData([
        { Site_ID: 'SITE-001', Region: 'North America', Country: 'USA', Risk_Level: 'High', Risk_Score: 85, Total_Subjects: 120, Avg_DQI: 88 },
        { Site_ID: 'SITE-002', Region: 'Europe', Country: 'UK', Risk_Level: 'Medium', Risk_Score: 60, Total_Subjects: 90, Avg_DQI: 94 },
        { Site_ID: 'SITE-003', Region: 'Asia Pacific', Country: 'Japan', Risk_Level: 'Low', Risk_Score: 20, Total_Subjects: 200, Avg_DQI: 98 },
        { Site_ID: 'SITE-004', Region: 'North America', Country: 'Canada', Risk_Level: 'High', Risk_Score: 92, Total_Subjects: 80, Avg_DQI: 75 },
        { Site_ID: 'SITE-005', Region: 'Europe', Country: 'Germany', Risk_Level: 'Low', Risk_Score: 15, Total_Subjects: 150, Avg_DQI: 96 },
      ]);
      setPatientsData([
        { Subject_ID: 'PAT-001', Site_ID: 'SITE-001', Region: 'North America', Clean_Patient_Status: 'Clean', Data_Quality_Index: 95, total_open_issues: 0 },
        { Subject_ID: 'PAT-002', Site_ID: 'SITE-001', Region: 'North America', Clean_Patient_Status: 'Not Clean', Data_Quality_Index: 72, total_open_issues: 3 },
        { Subject_ID: 'PAT-003', Site_ID: 'SITE-002', Region: 'Europe', Clean_Patient_Status: 'Clean', Data_Quality_Index: 98, total_open_issues: 0 },
        { Subject_ID: 'PAT-004', Site_ID: 'SITE-003', Region: 'Asia Pacific', Clean_Patient_Status: 'Clean', Data_Quality_Index: 99, total_open_issues: 0 },
        { Subject_ID: 'PAT-005', Site_ID: 'SITE-004', Region: 'North America', Clean_Patient_Status: 'Not Clean', Data_Quality_Index: 65, total_open_issues: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent =
      headers.join(',') +
      '\n' +
      data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export functions
  const exportSitesCSV = () => downloadCSV(sitesData, 'sites_report.csv');
  const exportPatientsCSV = () => downloadCSV(patientsData, 'patients_report.csv');
  const exportHighRiskCSV = () => downloadCSV(sitesData.filter(s => s.Risk_Level === 'High'), 'high_risk_sites.csv');
  const exportCleanPatientsCSV = () => downloadCSV(patientsData.filter(p => p.Clean_Patient_Status === 'Clean'), 'clean_patients.csv');

  // PDF Export functions with loading states
  const exportSitesPDF = async () => {
    setGenerating('sites');
    setTimeout(() => {
      generateSitesReportPDF(sitesData);
      setGenerating('');
    }, 500);
  };

  const exportPatientsPDF = async () => {
    setGenerating('patients');
    setTimeout(() => {
      generatePatientsReportPDF(patientsData);
      setGenerating('');
    }, 500);
  };

  const exportSummaryPDF = async () => {
    setGenerating('summary');
    setTimeout(() => {
      generateSummaryReportPDF(sitesData, patientsData);
      setGenerating('');
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-neon-cyan"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-neon-cyan opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      data-testid="reports-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-purple/30 blur-xl rounded-full"></div>
          <FileText className="h-10 w-10 text-neon-purple relative z-10" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white font-manrope">Reports & Export</h2>
          <p className="text-slate-400 mt-1">Generate beautiful PDF reports or export raw data as CSV</p>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Site-Level Report */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white h-full group" data-testid="export-sites-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-blue/20 rounded-xl group-hover:bg-neon-blue/30 transition-colors">
                  <FileText className="h-6 w-6 text-neon-blue" />
                </div>
                <CardTitle className="text-lg">Site-Level Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Complete site-level data including risk scores, DQI metrics, and issue counts.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={exportSitesPDF}
                  disabled={generating === 'sites'}
                  className="flex-1 bg-gradient-to-r from-neon-blue to-neon-cyan hover:opacity-90 text-black font-semibold shadow-neon-cyan"
                >
                  {generating === 'sites' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button
                  onClick={exportSitesCSV}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-neon-cyan" />
                {sitesData.length} sites available
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient-Level Report */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white h-full group" data-testid="export-patients-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-purple/20 rounded-xl group-hover:bg-neon-purple/30 transition-colors">
                  <FileText className="h-6 w-6 text-neon-purple" />
                </div>
                <CardTitle className="text-lg">Patient-Level Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Patient data including DQI, clean status, and open issue tracking.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={exportPatientsPDF}
                  disabled={generating === 'patients'}
                  className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink hover:opacity-90 text-white font-semibold"
                >
                  {generating === 'patients' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button
                  onClick={exportPatientsCSV}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-neon-purple" />
                {patientsData.length} patients available
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High Risk Sites Report */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white h-full group" data-testid="export-high-risk-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
                  <Filter className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle className="text-lg">High Risk Sites</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Sites flagged as high risk requiring immediate attention.
              </p>
              <Button
                onClick={exportHighRiskCSV}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({sitesData.filter(s => s.Risk_Level === 'High').length})
              </Button>
              <div className="text-xs text-red-400/70 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Immediate action required
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clean Patients Report */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white h-full group" data-testid="export-clean-patients-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                  <Filter className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-lg">Clean Patients</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Patients with verified clean data status for submission.
              </p>
              <Button
                onClick={exportCleanPatientsCSV}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({patientsData.filter(p => p.Clean_Patient_Status === 'Clean').length})
              </Button>
              <div className="text-xs text-emerald-400/70 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Submission ready
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Executive Summary - Full Width */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="glass-card-premium border-gradient border-none text-white group overflow-hidden" data-testid="export-summary-card">
            <div className="absolute inset-0 bg-aurora-gradient opacity-5 animate-aurora bg-[length:400%_400%]"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 rounded-xl">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Executive Summary Report</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Comprehensive overview with KPIs and risk distribution</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex gap-4">
                <Button
                  onClick={exportSummaryPDF}
                  disabled={generating === 'summary'}
                  className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple hover:opacity-90 text-black font-bold px-8 shadow-lg"
                  size="lg"
                >
                  {generating === 'summary' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2" />
                  ) : (
                    <Download className="h-5 w-5 mr-2" />
                  )}
                  Generate Executive PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Data Preview */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-none text-white">
          <CardHeader>
            <CardTitle className="text-xl font-manrope flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-cyan" />
              Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-white/5">
                <p className="text-sm text-slate-400 mb-2">Total Sites</p>
                <p className="text-4xl font-bold text-gradient">{sitesData.length}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <p className="text-sm text-slate-400 mb-2">Total Patients</p>
                <p className="text-4xl font-bold text-gradient">{patientsData.length}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <p className="text-sm text-slate-400 mb-2">High Risk Sites</p>
                <p className="text-4xl font-bold text-red-400">
                  {sitesData.filter((s) => s.Risk_Level === 'High').length}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <p className="text-sm text-slate-400 mb-2">Clean Patients</p>
                <p className="text-4xl font-bold text-emerald-400">
                  {patientsData.filter((p) => p.Clean_Patient_Status === 'Clean').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReportsPage;