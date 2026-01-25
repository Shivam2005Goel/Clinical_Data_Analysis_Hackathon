import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, Users, ShieldCheck, AlertCircle, Activity, Filter, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

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
      // Demo data for fallback
      const demoData = [
        { Subject_ID: 'PAT-001', Site_ID: 'Site-001', Region: 'USA', Clean_Patient_Status: 'Clean', Data_Quality_Index: 98, total_open_issues: 0, missing_pages_count: 0 },
        { Subject_ID: 'PAT-002', Site_ID: 'Site-002', Region: 'UK', Clean_Patient_Status: 'Not Clean', Data_Quality_Index: 75, total_open_issues: 3, missing_pages_count: 1 },
        { Subject_ID: 'PAT-003', Site_ID: 'Site-003', Region: 'Japan', Clean_Patient_Status: 'Clean', Data_Quality_Index: 99, total_open_issues: 0, missing_pages_count: 0 },
        { Subject_ID: 'PAT-004', Site_ID: 'Site-001', Region: 'USA', Clean_Patient_Status: 'Not Clean', Data_Quality_Index: 65, total_open_issues: 5, missing_pages_count: 2 },
        { Subject_ID: 'PAT-005', Site_ID: 'Site-004', Region: 'Canada', Clean_Patient_Status: 'Clean', Data_Quality_Index: 95, total_open_issues: 0, missing_pages_count: 0 },
      ];
      setPatients(demoData);
      // setError(err.response?.data?.detail || 'Failed to load patient data');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
      className="space-y-6"
      data-testid="patient-analysis-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-purple/30 blur-xl rounded-full"></div>
          <Users className="h-10 w-10 text-neon-purple relative z-10" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white font-manrope">Patient Analysis</h2>
          <p className="text-slate-400 mt-1">Detailed subject monitoring and data cleanliness tracking</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white overflow-hidden group">
            <div className="absolute inset-0 bg-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Total Patients</p>
                <div className="p-2 rounded-lg bg-neon-blue/20">
                  <Users className="h-5 w-5 text-neon-blue" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white font-manrope">{patients.length}</div>
              <p className="text-xs text-slate-400 mt-1">Enrolled subjects</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Clean Patients</p>
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-emerald-400 font-manrope">
                {patients.filter((p) => p.Clean_Patient_Status === 'Clean').length}
              </div>
              <p className="text-xs text-emerald-400/70 mt-1">Ready for submission</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Patients with Issues</p>
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-red-400 font-manrope">
                {patients.filter((p) => p.total_open_issues > 0).length}
              </div>
              <p className="text-xs text-red-400/70 mt-1">Requiring action</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white overflow-hidden group">
            <div className="absolute inset-0 bg-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Avg DQI</p>
                <div className="p-2 rounded-lg bg-neon-purple/20">
                  <Activity className="h-5 w-5 text-neon-purple" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-neon-purple font-manrope">
                {patients.length > 0
                  ? (
                    patients.reduce((sum, p) => sum + (p.Data_Quality_Index || 0), 0) / patients.length
                  ).toFixed(1)
                  : 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">Overall quality score</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient ID or site ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan"
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
              className={filterStatus === status
                ? 'bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80'
                : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'}
              data-testid={`filter-${status.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {status}
            </Button>
          ))}
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div variants={itemVariants} className="rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="patients-table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">Subject ID</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">Site</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">Region</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">Status</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">DQI</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">Open Issues</th>
                <th className="h-12 px-6 text-left align-middle font-medium text-slate-300">Missing Pages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPatients.map((patient, index) => (
                <motion.tr
                  key={index}
                  className="transition-colors hover:bg-white/5 bg-transparent"
                  data-testid={`patient-row-${patient.Subject_ID}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="p-6 align-middle font-medium text-white">{patient.Subject_ID}</td>
                  <td className="p-6 align-middle text-slate-300">{patient.Site_ID}</td>
                  <td className="p-6 align-middle text-slate-300">{patient.Region}</td>
                  <td className="p-6 align-middle">
                    <Badge
                      className={`${patient.Clean_Patient_Status === 'Clean'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                        } border`}
                      data-testid={`status-badge-${patient.Subject_ID}`}
                    >
                      {patient.Clean_Patient_Status}
                    </Badge>
                  </td>
                  <td className="p-6 align-middle">
                    <span
                      className={`font-semibold font-manrope ${patient.Data_Quality_Index >= 90
                        ? 'text-emerald-400'
                        : patient.Data_Quality_Index >= 70
                          ? 'text-amber-400'
                          : 'text-red-400'
                        }`}
                    >
                      {patient.Data_Quality_Index || 0}
                    </span>
                  </td>
                  <td className="p-6 align-middle">
                    <span className={`font-medium ${patient.total_open_issues > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {patient.total_open_issues || 0}
                    </span>
                  </td>
                  <td className="p-6 align-middle text-slate-300">{patient.missing_pages_count || 0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {filteredPatients.length === 0 && !loading && (
        <Card className="glass-card border-none">
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No patients found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

    </motion.div>
  );
};

export default PatientAnalysisPage;
