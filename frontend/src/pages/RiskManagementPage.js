import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, AlertCircle, CheckCircle, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

const RiskManagementPage = () => {
  const [highRiskSites, setHighRiskSites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    priority: 'High',
    alert_type: 'Site Risk',
    site_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesRes, alertsRes] = await Promise.all([
        api.get('/data/high-risk-sites'),
        api.get('/alerts?status=open')
      ]);
      setHighRiskSites(sitesRes.data.data || []);
      setAlerts(alertsRes.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alerts', newAlert);
      setCreateDialogOpen(false);
      setNewAlert({
        title: '',
        description: '',
        priority: 'High',
        alert_type: 'Site Risk',
        site_id: ''
      });
      fetchData();
    } catch (err) {
      alert('Failed to create alert');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/status?status=resolved`);
      fetchData();
    } catch (err) {
      alert('Failed to resolve alert');
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
    <div className="space-y-6" data-testid="risk-management-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Risk Management Dashboard
        </h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-alert-button">
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <Label htmlFor="alert-title">Title</Label>
                <Input
                  id="alert-title"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  required
                  data-testid="alert-title-input"
                />
              </div>
              <div>
                <Label htmlFor="alert-description">Description</Label>
                <Textarea
                  id="alert-description"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  required
                  data-testid="alert-description-input"
                />
              </div>
              <div>
                <Label htmlFor="alert-priority">Priority</Label>
                <select
                  id="alert-priority"
                  value={newAlert.priority}
                  onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="alert-priority-select"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <Label htmlFor="alert-site">Site ID (Optional)</Label>
                <Input
                  id="alert-site"
                  value={newAlert.site_id}
                  onChange={(e) => setNewAlert({ ...newAlert, site_id: e.target.value })}
                  data-testid="alert-site-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-alert-button">
                Create Alert
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">High Risk Sites</p>
                <p className="text-3xl font-bold text-red-600">{highRiskSites.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Open Alerts</p>
                <p className="text-3xl font-bold text-amber-600">{alerts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Risk Score</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {highRiskSites.length > 0
                    ? (
                      highRiskSites.reduce((sum, site) => sum + (site.Risk_Score || 0), 0) /
                      highRiskSites.length
                    ).toFixed(2)
                    : 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Alerts */}
      <Card data-testid="open-alerts-section">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No active alerts</p>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors"
                  data-testid={`alert-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant={alert.priority === 'High' ? 'destructive' : 'warning'}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300">{alert.description}</p>
                    {alert.site_id && (
                      <p className="text-xs text-slate-400 mt-1">Site: {alert.site_id}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                    data-testid={`resolve-alert-${index}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* High Risk Sites */}
      <Card data-testid="high-risk-sites-section">
        <CardHeader>
          <CardTitle>High Risk Sites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highRiskSites.slice(0, 10).map((site, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-l-4 border-l-red-500 bg-red-900/10 rounded"
                data-testid={`high-risk-site-${index}`}
              >
                <div>
                  <h4 className="font-semibold">{site.Site_ID}</h4>
                  <p className="text-sm text-slate-300">
                    {site.Country} | {site.Region}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Risk Score</p>
                  <p className="text-xl font-bold text-red-600">
                    {site.Risk_Score ? site.Risk_Score.toFixed(2) : 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskManagementPage;