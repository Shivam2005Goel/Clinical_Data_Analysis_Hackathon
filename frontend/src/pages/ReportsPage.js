import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, FileText, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const ReportsPage = () => {
  const [sitesData, setSitesData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.detail || 'Failed to load data');
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

  const exportSitesReport = () => {
    downloadCSV(sitesData, 'sites_report.csv');
  };

  const exportPatientsReport = () => {
    downloadCSV(patientsData, 'patients_report.csv');
  };

  const exportHighRiskSites = () => {
    const highRiskSites = sitesData.filter((site) => site.Risk_Level === 'High');
    downloadCSV(highRiskSites, 'high_risk_sites.csv');
  };

  const exportCleanPatients = () => {
    const cleanPatients = patientsData.filter((p) => p.Clean_Patient_Status === 'Clean');
    downloadCSV(cleanPatients, 'clean_patients.csv');
  };

  const exportSummary = () => {
    const summary = [
      {
        Metric: 'Total Sites',
        Value: sitesData.length
      },
      {
        Metric: 'Total Patients',
        Value: patientsData.length
      },
      {
        Metric: 'High Risk Sites',
        Value: sitesData.filter((s) => s.Risk_Level === 'High').length
      },
      {
        Metric: 'Clean Patients',
        Value: patientsData.filter((p) => p.Clean_Patient_Status === 'Clean').length
      },
      {
        Metric: 'Avg DQI',
        Value:
          sitesData.length > 0
            ? (sitesData.reduce((sum, s) => sum + (s.Avg_DQI || 0), 0) / sitesData.length).toFixed(2)
            : 0
      }
    ];
    downloadCSV(summary, 'summary_report.csv');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
        Reports & Export
      </h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-testid="export-sites-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Site-Level Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Export complete site-level data including risk scores, DQI, and issue counts.
            </p>
            <Button onClick={exportSitesReport} data-testid="export-sites-button">
              <Download className="h-4 w-4 mr-2" />
              Export All Sites ({sitesData.length})
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="export-patients-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Patient-Level Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Export complete patient-level data including DQI, clean status, and open issues.
            </p>
            <Button onClick={exportPatientsReport} data-testid="export-patients-button">
              <Download className="h-4 w-4 mr-2" />
              Export All Patients ({patientsData.length})
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="export-high-risk-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-red-500" />
              High Risk Sites Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Export only sites flagged as high risk for immediate attention.
            </p>
            <Button onClick={exportHighRiskSites} variant="destructive" data-testid="export-high-risk-button">
              <Download className="h-4 w-4 mr-2" />
              Export High Risk Sites ({sitesData.filter((s) => s.Risk_Level === 'High').length})
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="export-clean-patients-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-500" />
              Clean Patients Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Export patients with clean data status for submission readiness.
            </p>
            <Button onClick={exportCleanPatients} className="bg-emerald-600 hover:bg-emerald-700" data-testid="export-clean-patients-button">
              <Download className="h-4 w-4 mr-2" />
              Export Clean Patients ({patientsData.filter((p) => p.Clean_Patient_Status === 'Clean').length})
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" data-testid="export-summary-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Executive Summary Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Export a high-level summary with key metrics and KPIs.
            </p>
            <Button onClick={exportSummary} variant="outline" data-testid="export-summary-button">
              <Download className="h-4 w-4 mr-2" />
              Export Summary Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500">Total Sites</p>
              <p className="text-3xl font-bold">{sitesData.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Patients</p>
              <p className="text-3xl font-bold">{patientsData.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">High Risk Sites</p>
              <p className="text-3xl font-bold text-red-600">
                {sitesData.filter((s) => s.Risk_Level === 'High').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Clean Patients</p>
              <p className="text-3xl font-bold text-emerald-600">
                {patientsData.filter((p) => p.Clean_Patient_Status === 'Clean').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;