import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

const PatientAnalysisPage = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterStatus]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/data/patient-level');
      setPatients(response.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.Subject_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.Site_ID?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter((patient) => patient.Clean_Patient_Status === filterStatus);
    }

    setFilteredPatients(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="patient-analysis-page">
      <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
        Patient Analysis
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Total Patients</p>
              <Search className="h-5 w-5 text-primary opacity-70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{patients.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Clean Patients</p>
              <Badge variant="success" className="h-2 w-2 rounded-full p-0" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {patients.filter((p) => p.Clean_Patient_Status === 'Clean').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Patients with Issues</p>
              <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {patients.filter((p) => p.total_open_issues > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Avg DQI</p>
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {patients.length > 0
                ? (
                  patients.reduce((sum, p) => sum + (p.Data_Quality_Index || 0), 0) / patients.length
                ).toFixed(1)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient ID or site ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="patient-search-input"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Clean', 'Not Clean'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              data-testid={`filter-${status.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm" data-testid="patients-table">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="h-12 px-4 text-left align-middle font-medium">Subject ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Site</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Region</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium">DQI</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Open Issues</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Missing Pages</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr
                key={index}
                className="border-b transition-colors hover:bg-slate-50"
                data-testid={`patient-row-${patient.Subject_ID}`}
              >
                <td className="p-4 align-middle font-medium">{patient.Subject_ID}</td>
                <td className="p-4 align-middle">{patient.Site_ID}</td>
                <td className="p-4 align-middle">{patient.Region}</td>
                <td className="p-4 align-middle">
                  <Badge
                    variant={patient.Clean_Patient_Status === 'Clean' ? 'success' : 'destructive'}
                    data-testid={`status-badge-${patient.Subject_ID}`}
                  >
                    {patient.Clean_Patient_Status}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <span
                    className={`font-semibold ${patient.Data_Quality_Index >= 90
                        ? 'text-emerald-600'
                        : patient.Data_Quality_Index >= 70
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                  >
                    {patient.Data_Quality_Index || 0}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <span className="text-red-600 font-medium">{patient.total_open_issues || 0}</span>
                </td>
                <td className="p-4 align-middle">{patient.missing_pages_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPatients.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No patients found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default PatientAnalysisPage;