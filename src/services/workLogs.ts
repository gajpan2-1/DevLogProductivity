import api from './api';
import { WorkLog } from '../types';
import { mockGetWorkLogs, mockCreateWorkLog, mockUpdateWorkLog, mockDeleteWorkLog } from '../utils/mockData';
import { createNotification, getMockUsers } from '../utils/mockData';

const notifyManagerOnLogSubmission = (developerId: string) => {
  const users = getMockUsers();
  const developer = users.find((user) => user.id === developerId);
  const manager = users.find((user) => user.role === 'manager' && user.teamId === developer?.teamId);

  if (manager) {
    createNotification(
      manager.id,
      `Developer ${developer?.name} has submitted a new work log.`,
      'system'
    );
  }
};

export const createWorkLog = async (workLogData: Omit<WorkLog, 'id'>) => {
  try {
    const response = await mockCreateWorkLog(workLogData);
    notifyManagerOnLogSubmission(workLogData.userId); // Notify manager
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create work log');
  }
};

export const getWorkLogs = async (userId?: string, startDate?: string, endDate?: string) => {
  try {
    // In a real app, this would call your API with query params
    // return api.get('/workLogs', { params: { userId, startDate, endDate } });
    
    // For demo purposes, using mock data
    return await mockGetWorkLogs(userId, startDate, endDate);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch work logs');
  }
};

export const getWorkLogById = async (id: string): Promise<WorkLog> => {
  try {
    const response = await mockGetWorkLogs();
    const log = response.data.find(log => log.id === id);
    if (!log) throw new Error('Work log not found');
    return log;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch work log');
  }
};

export const createWorkLog = async (workLogData: Omit<WorkLog, 'id'>) => {
  try {
    // In a real app, this would call your API
    // return api.post('/workLogs', workLogData);
    
    // For demo purposes, using mock data
    return await mockCreateWorkLog(workLogData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create work log');
  }
};

export const updateWorkLog = async (id: string, workLogData: Partial<WorkLog>) => {
  try {
    // In a real app, this would call your API
    // return api.put(`/workLogs/${id}`, workLogData);
    
    // For demo purposes, using mock data
    return await mockUpdateWorkLog(id, workLogData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update work log');
  }
};

export const deleteWorkLog = async (id: string) => {
  try {
    // In a real app, this would call your API
    // return api.delete(`/workLogs/${id}`);
    
    // For demo purposes, using mock data
    return await mockDeleteWorkLog(id);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete work log');
  }
};

export const reviewWorkLog = async (id: string, reviewed: boolean, reviewNotes?: string) => {
  try {
    return await mockUpdateWorkLog(id, { reviewed, reviewNotes });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to review work log');
  }
};

export const exportWorkLogs = async (format: 'pdf' | 'csv', userId?: string, startDate?: string, endDate?: string) => {
  return api.get(`/workLogs/export/${format}`, { 
    params: { userId, startDate, endDate },
    responseType: 'blob'
  });
};
