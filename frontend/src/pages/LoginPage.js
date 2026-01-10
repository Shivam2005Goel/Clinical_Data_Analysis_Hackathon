import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginUser, register as registerUser } from '../utils/auth';
import { firebaseLogin, firebaseRegister } from '../utils/authFirebase';
import { isFirebaseConfigured } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, Activity, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, useFirebase } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'CRA'
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (useFirebase) {
        result = await firebaseLogin(loginData.email, loginData.password);
      } else {
        result = await loginUser(loginData.email, loginData.password);
      }
      login(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (useFirebase) {
        result = await firebaseRegister(
          registerData.email,
          registerData.password,
          registerData.full_name,
          registerData.role
        );
      } else {
        result = await registerUser(
          registerData.email,
          registerData.password,
          registerData.full_name,
          registerData.role
        );
      }
      login(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/7723338/pexels-photo-7723338.jpeg)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="h-12 w-12" />
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Clinical Data
            </h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Monitoring System
          </h2>
          <p className="text-lg leading-relaxed opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
            Streamline clinical trial operations with real-time data monitoring, AI-powered insights,
            and collaborative tools for CRAs, DQT, and investigational sites.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Welcome
              </CardTitle>
              {useFirebase && (
                <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
                  <Shield className="h-3 w-3" />
                  <span>Firebase Auth</span>
                </div>
              )}
            </div>
            <CardDescription style={{ fontFamily: 'Inter, sans-serif' }}>
              Sign in to access the clinical data monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    data-testid="login-submit-button"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                      required
                      data-testid="register-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      data-testid="register-email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      data-testid="register-password-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-role">Role</Label>
                    <select
                      id="register-role"
                      value={registerData.role}
                      onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      data-testid="register-role-select"
                    >
                      <option value="CRA">Clinical Research Associate</option>
                      <option value="DQT">Data Quality Team</option>
                      <option value="Site Staff">Site Staff</option>
                      <option value="Manager">Clinical Trial Manager</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    data-testid="register-submit-button"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
