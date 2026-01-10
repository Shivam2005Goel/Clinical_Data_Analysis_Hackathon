import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, Filter, MessageCircle, Tag } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const SiteAnalysisPage = () => {
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    filterSites();
  }, [sites, searchTerm, filterRisk]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const response = await api.get('/data/site-level');
      setSites(response.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load sites data');
    } finally {
      setLoading(false);
    }
  };

  const filterSites = () => {
    let filtered = sites;

    if (searchTerm) {
      filtered = filtered.filter(
        (site) =>
          site.Site_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.Country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.Region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRisk !== 'All') {
      filtered = filtered.filter((site) => site.Risk_Level === filterRisk);
    }

    setFilteredSites(filtered);
  };

  const getRiskBadgeVariant = (level) => {
    switch (level) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="site-analysis-page">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by site ID, country, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="site-search-input"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'High', 'Medium', 'Low'].map((risk) => (
            <Button
              key={risk}
              variant={filterRisk === risk ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRisk(risk)}
              data-testid={`filter-${risk.toLowerCase()}`}
            >
              {risk}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4" data-testid="sites-list">
        {filteredSites.map((site, index) => (
          <Card
            key={index}
            className={`hover:shadow-lg transition-all ${
              site.Risk_Level === 'High'
                ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent'
                : site.Risk_Level === 'Medium'
                ? 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent'
                : 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent'
            }`}
            data-testid={`site-card-${site.Site_ID}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {site.Site_ID}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {site.Country} | {site.Region}
                  </p>
                </div>
                <Badge variant={getRiskBadgeVariant(site.Risk_Level)} data-testid={`risk-badge-${site.Site_ID}`}>
                  {site.Risk_Level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Subjects</p>
                  <p className="text-xl font-semibold">{site.Total_Subjects || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Open Issues</p>
                  <p className="text-xl font-semibold text-red-600">{site.Total_Open_Issues || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Avg DQI</p>
                  <p className="text-xl font-semibold text-emerald-600">
                    {site.Avg_DQI ? site.Avg_DQI.toFixed(1) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Clean Patients</p>
                  <p className="text-xl font-semibold">
                    {site.Clean_Patient_Percentage ? `${site.Clean_Patient_Percentage.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Missing Pages</p>
                  <p className="text-sm font-medium">{site.Total_Missing_Pages || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Uncoded MedDRA</p>
                  <p className="text-sm font-medium">{site.Total_Uncoded_MedDRA || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Lab Issues</p>
                  <p className="text-sm font-medium">{site.Total_Lab_Issues || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                  <p className="text-sm font-medium">{site.Risk_Score ? site.Risk_Score.toFixed(2) : 0}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" data-testid={`comment-btn-${site.Site_ID}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="outline" size="sm" data-testid={`tag-btn-${site.Site_ID}`}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSites.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No sites found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SiteAnalysisPage;