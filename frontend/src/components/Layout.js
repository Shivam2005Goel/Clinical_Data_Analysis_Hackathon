import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  Bot,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import Background3D from '../components/ui/3d-background';

const Layout = () => {
  const { user, logout, useFirebase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (useFirebase) {
      const { firebaseLogout } = await import('../utils/authFirebase');
      await firebaseLogout();
    }
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Site Analysis', path: '/sites', icon: Building2 },
    { name: 'Patient Analysis', path: '/patients', icon: Users },
    { name: 'Risk Management', path: '/risk', icon: AlertTriangle },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Data Quality', path: '/data-quality', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText }
  ];

  return (
    <div className="min-h-screen relative text-foreground font-sans overflow-hidden">
      <Background3D />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-card-premium border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full bg-void/20 backdrop-blur-xl">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent opacity-50" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-neon-cyan/50 blur-lg rounded-full animate-pulse-glow" />
                <Activity className="h-6 w-6 text-neon-cyan relative z-10 transition-transform duration-500 group-hover:rotate-180" />
              </div>
              <span className="font-bold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-cyan to-neon-blue" style={{ fontFamily: 'Manrope, sans-serif' }}>
                CDMS
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                    ? 'text-white shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-cyan/10 border border-neon-cyan/30 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full shadow-[0_0_10px_#00f3ff]" />
                  )}
                  <item.icon className={`h-5 w-5 relative z-10 transition-all duration-300 ${isActive ? 'text-neon-cyan scale-110' : 'group-hover:text-neon-cyan group-hover:scale-110'}`} />
                  <span className="relative z-10">{item.name}</span>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md relative">
            <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <Avatar className="ring-2 ring-neon-cyan/30 ring-offset-2 ring-offset-black transition-all hover:ring-neon-cyan/60">
                <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-purple text-white font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-neon-cyan transition-colors">{user?.full_name}</p>
                <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {user?.role}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/10 bg-white/5 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 relative z-10"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="h-20 glass sticky top-0 z-40 px-8 flex items-center justify-between lg:justify-end border-b border-white/5 backdrop-blur-xl bg-black/20">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="lg:hidden flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-white/90">
              {navigation.find((item) => item.path === location.pathname)?.name}
            </h1>
          </div>

          <div className="hidden lg:block">
            {/* Potential Header Actions like Search or Notifications could go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
