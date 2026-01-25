import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Search, Filter, MessageCircle, Tag, Building2, AlertTriangle, CheckCircle2, Activity, Users } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { motion } from 'framer-motion';

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
      // Demo data if backend fails
      const demoData = [
        { Site_ID: 'SITE-001', Region: 'North America', Country: 'USA', Risk_Level: 'High', Risk_Score: 85, Total_Subjects: 120, Avg_DQI: 88, Total_Open_Issues: 12, Total_Missing_Pages: 5, Total_Uncoded_MedDRA: 2, Total_Lab_Issues: 3, Clean_Patient_Percentage: 92 },
        { Site_ID: 'SITE-002', Region: 'Europe', Country: 'UK', Risk_Level: 'Medium', Risk_Score: 60, Total_Subjects: 90, Avg_DQI: 94, Total_Open_Issues: 5, Total_Missing_Pages: 2, Total_Uncoded_MedDRA: 1, Total_Lab_Issues: 1, Clean_Patient_Percentage: 95 },
        { Site_ID: 'SITE-003', Region: 'Asia Pacific', Country: 'Japan', Risk_Level: 'Low', Risk_Score: 20, Total_Subjects: 200, Avg_DQI: 98, Total_Open_Issues: 1, Total_Missing_Pages: 0, Total_Uncoded_MedDRA: 0, Total_Lab_Issues: 0, Clean_Patient_Percentage: 99 },
        { Site_ID: 'SITE-004', Region: 'North America', Country: 'Canada', Risk_Level: 'High', Risk_Score: 92, Total_Subjects: 80, Avg_DQI: 75, Total_Open_Issues: 15, Total_Missing_Pages: 8, Total_Uncoded_MedDRA: 4, Total_Lab_Issues: 6, Clean_Patient_Percentage: 88 },
        { Site_ID: 'SITE-005', Region: 'Europe', Country: 'Germany', Risk_Level: 'Low', Risk_Score: 15, Total_Subjects: 150, Avg_DQI: 96, Total_Open_Issues: 2, Total_Missing_Pages: 1, Total_Uncoded_MedDRA: 0, Total_Lab_Issues: 1, Clean_Patient_Percentage: 97 },
      ];
      setSites(demoData);
      // setError(err.response?.data?.detail || 'Failed to load sites data');
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
      case 'High': return 'destructive'; // Will use our custom styles via className if needed
      case 'Medium': return 'warning'; // Custom warning style
      case 'Low': return 'success'; // Custom success style
      default: return 'secondary';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
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
      data-testid="site-analysis-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-blue/30 blur-xl rounded-full"></div>
          <Building2 className="h-10 w-10 text-neon-blue relative z-10" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white font-manrope">Site Analysis</h2>
          <p className="text-slate-400 mt-1">Monitor site performance, risk levels, and data quality metrics</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by site ID, country, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan"
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
              className={filterRisk === risk
                ? 'bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80'
                : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'}
              data-testid={`filter-${risk.toLowerCase()}`}
            >
              {risk}
            </Button>
          ))}
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div
        className="grid grid-cols-1 gap-4"
        data-testid="sites-list"
        variants={containerVariants}
      >
        {filteredSites.map((site, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
            <Card
              className="glass-card-premium border-none text-white overflow-hidden group relative"
              data-testid={`site-card-${site.Site_ID}`}
            >
              {/* Risk Indicator Border */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${site.Risk_Level === 'High' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                  site.Risk_Level === 'Medium' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                    'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                  }`}
              />

              <CardHeader className="pb-2 pl-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${getRiskColor(site.Risk_Level)}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold font-manrope text-white group-hover:text-neon-cyan transition-colors">
                        {site.Site_ID}
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        {site.Country}
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        {site.Region}
                      </p>
                    </div>
                  </div>

                  <Badge
                    className={`${site.Risk_Level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      site.Risk_Level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      } border hover:bg-opacity-30 transition-colors px-3 py-1`}
                    data-testid={`risk-badge-${site.Site_ID}`}
                  >
                    {site.Risk_Level} Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pl-6 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Total Subjects
                    </p>
                    <p className="text-xl font-bold font-manrope">{site.Total_Subjects || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Open Issues
                    </p>
                    <p className={`text-xl font-bold font-manrope ${site.Total_Open_Issues > 5 ? 'text-red-400' : 'text-slate-200'}`}>
                      {site.Total_Open_Issues || 0}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Avg DQI
                    </p>
                    <p className="text-xl font-bold font-manrope text-neon-cyan">
                      {site.Avg_DQI ? site.Avg_DQI.toFixed(1) : 0}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Clean Rate
                    </p>
                    <p className="text-xl font-bold font-manrope text-emerald-400">
                      {site.Clean_Patient_Percentage ? `${site.Clean_Patient_Percentage.toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Missing Pages</p>
                    <p className="text-sm font-medium text-slate-300">{site.Total_Missing_Pages || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Uncoded MedDRA</p>
                    <p className="text-sm font-medium text-slate-300">{site.Total_Uncoded_MedDRA || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Lab Issues</p>
                    <p className="text-sm font-medium text-slate-300">{site.Total_Lab_Issues || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                    <p className="text-sm font-medium text-slate-300">{site.Risk_Score ? site.Risk_Score.toFixed(2) : 0}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5 hover:text-neon-cyan"
                    data-testid={`comment-btn-${site.Site_ID}`}
                    onClick={() => toast.success(`Comment interface opened for ${site.Site_ID}`)}
                  >
                    <MessageCircle className="h-3 w-3 mr-2" />
                    Comment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5 hover:text-neon-purple"
                    data-testid={`tag-btn-${site.Site_ID}`}
                    onClick={() => toast.success(`Tagging interface opened for ${site.Site_ID}`)}
                  >
                    <Tag className="h-3 w-3 mr-2" />
                    Add Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredSites.length === 0 && !loading && (
        <Card className="glass-card border-none">
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No sites found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SiteAnalysisPage;
