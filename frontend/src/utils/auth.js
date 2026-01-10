import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, user } = response.data;
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token: access_token, user };
};

export const register = async (email, password, full_name, role = 'CRA') => {
  const response = await api.post('/auth/register', { email, password, full_name, role });
  const { access_token, user } = response.data;
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token: access_token, user };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};