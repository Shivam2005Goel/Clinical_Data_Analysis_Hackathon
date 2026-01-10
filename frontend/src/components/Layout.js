import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
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
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                CDMS
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
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
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {navigation.find((item) => item.path === location.pathname)?.name || 'Clinical Data Monitoring'}
          </h1>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;