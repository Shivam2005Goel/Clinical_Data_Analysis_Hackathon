import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, FileQuestion, FlaskConical } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const DataQualityPage = () => {
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
      setError(err.response?.data?.detail || 'Failed to load data quality metrics');
    } finally {
      setLoading(false);
    }
  };

  const getIssuesSummary = () => {
    const totalOpenIssues = sitesData.reduce((sum, site) => sum + (site.Total_Open_Issues || 0), 0);
    const totalMissingPages = sitesData.reduce((sum, site) => sum + (site.Total_Missing_Pages || 0), 0);
    const totalUncodedMedDRA = sitesData.reduce((sum, site) => sum + (site.Total_Uncoded_MedDRA || 0), 0);
    const totalLabIssues = sitesData.reduce((sum, site) => sum + (site.Total_Lab_Issues || 0), 0);

    return [
      { category: 'Open Issues', count: totalOpenIssues, color: '#EF4444' },
      { category: 'Missing Pages', count: totalMissingPages, color: '#F59E0B' },
      { category: 'Uncoded Terms', count: totalUncodedMedDRA, color: '#0EA5E9' },
      { category: 'Lab Issues', count: totalLabIssues, color: '#8B5CF6' }
    ];
  };

  const getDQIDistribution = () => {
    const ranges = {
      'Excellent (90-100)': 0,
      'Good (70-89)': 0,
      'Fair (50-69)': 0,
      'Poor (<50)': 0
    };

    patientsData.forEach((patient) => {
      const dqi = patient.Data_Quality_Index || 0;
      if (dqi >= 90) ranges['Excellent (90-100)']++;
      else if (dqi >= 70) ranges['Good (70-89)']++;
      else if (dqi >= 50) ranges['Fair (50-69)']++;
      else ranges['Poor (<50)']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="data-quality-page">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
        Data Quality Monitoring
      </h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {getIssuesSummary().map((issue, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: issue.color }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{issue.category}</p>
                  <p className="text-3xl font-bold" style={{ color: issue.color }}>
                    {issue.count}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8" style={{ color: issue.color, opacity: 0.7 }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getIssuesSummary()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* DQI Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Index Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getDQIDistribution()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="Number of Patients" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Issues by Site */}
      <Card>
        <CardHeader>
          <CardTitle>Sites Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sitesData
              .filter((site) => site.Total_Open_Issues > 0)
              .sort((a, b) => (b.Total_Open_Issues || 0) - (a.Total_Open_Issues || 0))
              .slice(0, 10)
              .map((site, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{site.Site_ID}</p>
                    <p className="text-sm text-slate-500">
                      {site.Country} | DQI: {site.Avg_DQI ? site.Avg_DQI.toFixed(1) : 0}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-red-600 font-bold">{site.Total_Open_Issues || 0}</p>
                      <p className="text-xs text-slate-500">Open Issues</p>
                    </div>
                    <div className="text-center">
                      <p className="text-amber-600 font-bold">{site.Total_Missing_Pages || 0}</p>
                      <p className="text-xs text-slate-500">Missing Pages</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataQualityPage;