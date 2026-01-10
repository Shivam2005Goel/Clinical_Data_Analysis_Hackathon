import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sitesData, setSitesData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, sitesRes, patientsRes] = await Promise.all([
        api.get('/data/dashboard-stats'),
        api.get('/data/site-level'),
        api.get('/data/patient-level')
      ]);

      setStats(statsRes.data);
      setSitesData(sitesRes.data.data || []);
      setPatientsData(patientsRes.data.data || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 503) {
        setError('Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to your environment variables.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskDistribution = () => {
    if (!sitesData.length) return [];
    const riskCounts = sitesData.reduce((acc, site) => {
      const level = site.Risk_Level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(riskCounts).map(([name, value]) => ({ name, value }));
  };

  const getTopRiskySites = () => {
    return sitesData
      .filter((site) => site.Risk_Level === 'High')
      .sort((a, b) => (b.Risk_Score || 0) - (a.Risk_Score || 0))
      .slice(0, 5)
      .map((site) => ({
        name: site.Site_ID || 'Unknown',
        riskScore: site.Risk_Score || 0,
        openIssues: site.Total_Open_Issues || 0
      }));
  };

  const getRegionStats = () => {
    if (!sitesData.length) return [];
    const regionData = sitesData.reduce((acc, site) => {
      const region = site.Region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { region, sites: 0, patients: 0, avgDQI: [] };
      }
      acc[region].sites += 1;
      acc[region].patients += site.Total_Subjects || 0;
      if (site.Avg_DQI) acc[region].avgDQI.push(site.Avg_DQI);
      return acc;
    }, {});

    return Object.values(regionData).map((r) => ({
      region: r.region,
      sites: r.sites,
      patients: r.patients,
      avgDQI: r.avgDQI.length ? (r.avgDQI.reduce((a, b) => a + b, 0) / r.avgDQI.length).toFixed(2) : 0
    }));
  };

  const COLORS = {
    High: '#EF4444',
    Medium: '#F59E0B',
    Low: '#10B981',
    Unknown: '#94A3B8'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-total-sites">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sites</CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {stats?.total_sites || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-total-patients">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {stats?.total_patients || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-high-risk">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">High Risk Sites</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {stats?.high_risk_sites || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow" data-testid="kpi-clean-patients">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Clean Patients</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {stats?.clean_patient_percentage?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.clean_patients || 0} of {stats?.total_patients || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card data-testid="risk-distribution-chart">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getRiskDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getRiskDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Unknown} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Risky Sites */}
        <Card data-testid="top-risky-sites-chart">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Top 5 High-Risk Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getTopRiskySites()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="riskScore" fill="#EF4444" name="Risk Score" />
                <Bar dataKey="openIssues" fill="#F59E0B" name="Open Issues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Analysis */}
      <Card data-testid="regional-analysis-chart">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Regional Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getRegionStats()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="region" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sites" fill="#0EA5E9" name="Sites" />
              <Bar yAxisId="left" dataKey="patients" fill="#0D9488" name="Patients" />
              <Bar yAxisId="right" dataKey="avgDQI" fill="#10B981" name="Avg DQI" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Quality Index Summary */}
      <Card data-testid="dqi-summary">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Data Quality Index (DQI)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {stats?.avg_dqi || 0}
              </div>
              <p className="text-sm text-slate-500 mt-1">Average across all sites</p>
            </div>
            <div className="text-right">
              {stats?.avg_dqi >= 90 ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-lg font-semibold">Excellent</span>
                </div>
              ) : stats?.avg_dqi >= 70 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-lg font-semibold">Good</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-6 w-6" />
                  <span className="text-lg font-semibold">Needs Attention</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;