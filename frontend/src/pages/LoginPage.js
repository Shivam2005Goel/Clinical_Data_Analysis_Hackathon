import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginUser, register as registerUser } from '../utils/auth';
import { firebaseLogin, firebaseRegister } from '../utils/authFirebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, Activity, Shield, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Vortex } from '../components/ui/vortex';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex relative overflow-hidden text-foreground">
      {/* Vortex Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Vortex
          backgroundColor="#000000" // Pure black as requested
          rangeY={800}
          particleCount={500}
          baseHue={180} // Cyan-ish
          containerClassName="h-full w-full"
          className="hidden" // No children to render
        />
      </div>
      {/* Left Side Content - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 text-white">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/50 blur-lg rounded-full animate-pulse-glow" />
              <Activity className="h-16 w-16 text-neon-cyan relative z-10" />
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-neon-cyan" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CDMS
            </h1>
          </div>
          <h2 className="text-4xl font-semibold mb-6 leading-tight">
            Next-Gen Clinical <br /> Data Intelligence
          </h2>
          <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
            Experience real-time monitoring powered by advanced AI.
            Seamlessly connect CRAs, sites, and data teams in a unified,
            futuristic interface.
          </p>

          <div className="mt-12 flex gap-4">
            <div className="glass px-6 py-4 rounded-xl flex items-center gap-3">
              <Shield className="text-neon-cyan h-8 w-8" />
              <div>
                <div className="text-sm text-slate-400">Security</div>
                <div className="font-semibold">Enterprise Grade</div>
              </div>
            </div>
            <div className="glass px-6 py-4 rounded-xl flex items-center gap-3">
              <Activity className="text-neon-purple h-8 w-8" />
              <div>
                <div className="text-sm text-slate-400">Monitoring</div>
                <div className="font-semibold">Real-time Analytics</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl text-center mb-2 font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Join the Future'}
              </CardTitle>
              <CardDescription className="text-center text-slate-400">
                {isLogin ? 'Enter your credentials to access the nexus.' : 'Create your account to start monitoring.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 p-1 rounded-xl">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-neon-cyan data-[state=active]:text-black transition-all">Login</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-neon-cyan data-[state=active]:text-black transition-all">Register</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mb-6 bg-red-900/50 border-red-500/50 text-white">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        className="bg-black/30 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                        {/* <a href="#" className="text-xs text-neon-cyan hover:underline">Forgot?</a> */}
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="bg-black/30 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold h-11 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? 'Authenticating...' : 'Initialize Session'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name</Label>
                      <Input
                        value={registerData.full_name}
                        onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                        required
                        className="bg-black/30 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email</Label>
                      <Input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        className="bg-black/30 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        className="bg-black/30 border-white/10 text-white placeholder:text-slate-600 focus:border-neon-cyan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Role</Label>
                      <select
                        value={registerData.role}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 focus:border-neon-cyan"
                      >
                        <option value="CRA" className="bg-void-light">Clinical Research Associate</option>
                        <option value="DQT" className="bg-void-light">Data Quality Team</option>
                        <option value="Site Staff" className="bg-void-light">Site Staff</option>
                        <option value="Manager" className="bg-void-light">Clinical Trial Manager</option>
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold h-11"
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {useFirebase && (
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span>Secured by Firebase Auth</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
