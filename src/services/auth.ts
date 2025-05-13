import api from './api';
import { User } from '../types';
import { mockLogin } from '../utils/mockData';

export const login = async (email: string, password: string) => {
  try {
    // In a real app, this would call your API
    // return api.post('/auth/login', { email, password });
    
    // For demo purposes, using mock data
    return await mockLogin(email, password);
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (name: string, email: string, password: string, role: 'developer' | 'manager') => {
  return api.post('/auth/register', { name, email, password, role });
};

export const logout = () => {
  // Clear any server-side session if needed
  return api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData: Partial<User>) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};