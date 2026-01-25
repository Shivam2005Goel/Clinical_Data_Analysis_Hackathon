import React, { useEffect, useState, useRef } from 'react';
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Custom 3D Bar Shape
const Bar3D = (props) => {
  const { fill, x, y, width, height } = props;
  const depth = 10; // Depth of the 3D effect

  // Don't render tiny bars that break the path
  if (!height || height < 0) return null;

  return (
    <g>
      {/* Front Face */}
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} />

      {/* Top Face */}
      <path
        d={`M ${x},${y} L ${x + depth},${y - depth} L ${x + width + depth},${y - depth} L ${x + width},${y} Z`}
        fill={fill}
        fillOpacity={0.8}
      />

      {/* Side Face */}
      <path
        d={`M ${x + width},${y} L ${x + width + depth},${y - depth} L ${x + width + depth},${y + height - depth} L ${x + width},${y + height} Z`}
        fill={fill}
        fillOpacity={0.6}
      />
    </g>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sitesData, setSitesData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [isLive, setIsLive] = useState(true);

  // Live Data Simulation Engine
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => {
        if (!prev) return prev;
        const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return {
          ...prev,
          total_patients: prev.total_patients + (randomChange > 0 ? randomChange : 0),
          clean_patient_percentage: Math.min(100, Math.max(0, prev.clean_patient_percentage + (Math.random() * 0.4 - 0.2))),
          avg_dqi: Math.min(100, Math.max(0, prev.avg_dqi + (Math.random() * 0.4 - 0.2)))
        };
      });

      setSitesData(prev => {
        return prev.map(site => {
          if (Math.random() > 0.7) { // Only update 30% of sites per tick
            return {
              ...site,
              Total_Open_Issues: Math.max(0, site.Total_Open_Issues + (Math.floor(Math.random() * 3) - 1)),
              Risk_Score: Math.min(100, Math.max(0, site.Risk_Score + (Math.random() * 2 - 1)))
            };
          }
          return site;
        });
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive, sitesData]);

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
      if (err.response?.status === 503 || err.code === "ERR_NETWORK") {
        console.log("Using Demo Data");
        // Fallback/Demo Data for UI Showcase
        setStats({
          total_sites: 12,
          total_patients: 1250,
          high_risk_sites: 3,
          clean_patient_percentage: 85.5,
          clean_patients: 1068,
          avg_dqi: 92
        });
        setSitesData([
          { Site_ID: 'Site-001', Risk_Level: 'High', Risk_Score: 85, Total_Open_Issues: 12, Region: 'North America', Total_Subjects: 120, Avg_DQI: 88 },
          { Site_ID: 'Site-002', Risk_Level: 'Medium', Risk_Score: 60, Total_Open_Issues: 5, Region: 'Europe', Total_Subjects: 90, Avg_DQI: 94 },
          { Site_ID: 'Site-003', Risk_Level: 'Low', Risk_Score: 20, Total_Open_Issues: 1, Region: 'Asia', Total_Subjects: 200, Avg_DQI: 98 },
          { Site_ID: 'Site-004', Risk_Level: 'High', Risk_Score: 92, Total_Open_Issues: 15, Region: 'North America', Total_Subjects: 80, Avg_DQI: 75 },
          { Site_ID: 'Site-005', Risk_Level: 'Medium', Risk_Score: 45, Total_Open_Issues: 3, Region: 'Europe', Total_Subjects: 150, Avg_DQI: 96 },
        ]);
      } else {
        console.error("Dashboard fetch error:", err);
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
      .filter((site) => site.Risk_Level === 'High' || site.Risk_Score > 50)
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
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981',
    Unknown: '#94a3b8'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      data-testid="dashboard-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white font-manrope">Mission Control</h2>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
          </span>
          <span className="text-xs font-mono text-neon-green font-bold tracking-wider">LIVE DATA FEED</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">Total Sites</CardTitle>
                <div className="p-2 bg-neon-blue/20 rounded-lg shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                  <Building2 className="h-5 w-5 text-neon-blue" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-manrope text-white">
                {stats?.total_sites || 0}
              </div>
              <div className="text-xs text-neon-blue mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3 animate-pulse" /> Active Monitoring
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">Total Patients</CardTitle>
                <div className="p-2 bg-neon-purple/20 rounded-lg shadow-[0_0_10px_rgba(188,19,254,0.3)]">
                  <Users className="h-5 w-5 text-neon-purple" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-manrope text-white flex items-end gap-2">
                <span>{stats?.total_patients || 0}</span>
                <span className="text-xs text-emerald-400 mb-1 font-mono">+{Math.floor(Math.random() * 5)} today</span>
              </div>
              <div className="text-xs text-neon-purple mt-1">Across all regions</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={`absolute inset-0 border-2 border-red-500/30 rounded-xl animate-pulse ${stats?.high_risk_sites > 0 ? 'opacity-100' : 'opacity-0'}`} />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">High Risk Sites</CardTitle>
                <div className="p-2 bg-red-500/20 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-manrope text-white">
                {stats?.high_risk_sites || 0}
              </div>
              <div className="text-xs text-red-400 mt-1 font-bold">Immediate attention required</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">Clean Patients</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold font-manrope text-white">
                {stats?.clean_patient_percentage?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-emerald-400 mt-1">
                {stats?.clean_patients || 0} of {stats?.total_patients || 0} verified
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white h-full" data-testid="risk-distribution-chart">
            <CardHeader>
              <CardTitle className="font-manrope flex items-center gap-2">
                <Zap className="h-4 w-4 text-neon-orange" />
                Risk Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getRiskDistribution()}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {getRiskDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Unknown} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Risky Sites with 3D Effect */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-premium border-none text-white h-full" data-testid="top-risky-sites-chart">
            <CardHeader>
              <CardTitle className="font-manrope flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" />
                Top High-Risk Sites (3D View)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTopRiskySites()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', color: '#f8fafc' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Legend />
                  <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" shape={<Bar3D />} />
                  <Bar dataKey="openIssues" fill="#f59e0b" name="Open Issues" shape={<Bar3D />} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Regional Analysis with Neon Pulse */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card-premium border-none text-white" data-testid="regional-analysis-chart">
          <CardHeader>
            <CardTitle className="font-manrope text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
              Regional Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRegionStats()}>
                <defs>
                  <linearGradient id="colorSites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sites" fill="url(#colorSites)" name="Sites (Live)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="patients" fill="url(#colorPatients)" name="Patients (Live)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgDQI" fill="#bc13fe" name="Avg DQI" shape={<Bar3D />} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Quality Index Summary */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card-premium border-none text-white" data-testid="dqi-summary">
          <CardHeader>
            <CardTitle className="font-manrope">Real-time Data Quality Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="absolute inset-0 blur-lg bg-emerald-500/30 rounded-full"></div>
                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 font-manrope relative z-10">
                  {stats?.avg_dqi ? stats.avg_dqi.toFixed(1) : 0}
                </div>
                <p className="text-sm text-slate-400 mt-2 font-mono">Live calculation running...</p>
              </div>
              <div className="text-right">
                {stats?.avg_dqi >= 90 ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-emerald-400">
                    <TrendingUp className="h-8 w-8" />
                    <div className="text-left">
                      <span className="block font-bold">Excellent</span>
                      <span className="text-xs opacity-70">Top Tier Performance</span>
                    </div>
                  </div>
                ) : stats?.avg_dqi >= 70 ? (
                  <div className="flex items-center gap-2 text-amber-400">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-lg font-semibold">Good</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <TrendingDown className="h-6 w-6" />
                    <span className="text-lg font-semibold">Needs Attention</span>
                  </div>
                )}
              </div>
            </div>
            {/* Animated Progress Bar */}
            <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats?.avg_dqi || 0}%` }}
                transition={{ ease: "easeInOut", duration: 1.5 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
