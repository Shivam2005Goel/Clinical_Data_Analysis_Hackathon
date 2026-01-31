import React, { createContext, useState, useContext, useEffect } from 'react';
import { firebaseAuthStateListener } from '../utils/authFirebase';
import { isFirebaseConfigured } from '../utils/firebase';
import { getCurrentUser, isAuthenticated as checkAuth } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState(false);

  useEffect(() => {
    // AUTH BYPASS FOR HACKATHON
    const mockUser = {
      id: "admin-id",
      full_name: "Hackathon Admin",
      email: "admin@example.com",
      role: "Manager"
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading, useFirebase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};