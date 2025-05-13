import { User, WorkLog, Task } from '../types';
import { generateId } from './helpers';

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Developer',
    email: 'developer@example.com',
    role: 'developer',
    avatar: 'https://i.pravatar.cc/150?img=1',
    teamId: '1'
  },
  {
    id: '2',
    name: 'Jane Manager',
    email: 'manager@example.com',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?img=2',
    teamId: '1'
  },
  {
    id: '3',
    name: 'Alex Developer',
    email: 'alex@example.com',
    role: 'developer',
    avatar: 'https://i.pravatar.cc/150?img=3',
    teamId: '1'
  }
];

// Mock tasks
const createMockTasks = (): Task[] => [
  {
    id: generateId(),
    title: 'Implement login functionality',
    description: 'Created login form and connected to API',
    timeSpent: 120, // 2 hours
    tags: ['frontend', 'auth'],
    completed: true
  },
  {
    id: generateId(),
    title: 'Fix navigation bug',
    description: 'Fixed issue with dropdown menu not closing',
    timeSpent: 45, // 45 minutes
    tags: ['bugfix', 'ui'],
    completed: true
  },
  {
    id: generateId(),
    title: 'Code review',
    description: 'Reviewed PR for user profile feature',
    timeSpent: 30, // 30 minutes
    tags: ['review'],
    completed: true
  }
];

// Mock work logs storage
let mockWorkLogs: WorkLog[] = [
  {
    id: '1',
    userId: '1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    tasks: createMockTasks(),
    mood: 4,
    blockers: 'Waiting for design assets',
    notes: 'Good progress today, but still need to finish the error handling',
    reviewed: true,
    reviewedBy: '2',
    reviewNotes: 'Great job on the login functionality!'
  },
  {
    id: '2',
    userId: '1',
    date: new Date().toISOString().split('T')[0], // Today
    tasks: createMockTasks(),
    mood: 5,
    notes: 'Completed all planned tasks ahead of schedule',
    reviewed: false
  },
  {
    id: '3',
    userId: '3',
    date: new Date().toISOString().split('T')[0], // Today
    tasks: createMockTasks(),
    mood: 3,
    blockers: 'API integration issues',
    notes: 'Spent most of the day troubleshooting API issues',
    reviewed: false
  }
];

// Mock authentication
export const mockLogin = async (email: string, password: string) => {
  return new Promise<{ user: User; token: string }>((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      
      if (user && password === 'password') {
        resolve({
          user,
          token: 'mock-jwt-token-' + user.id
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

// Mock work log API
export const mockGetWorkLogs = async (userId?: string, startDate?: string, endDate?: string) => {
  return new Promise<{ data: WorkLog[] }>((resolve) => {
    setTimeout(() => {
      let filteredLogs = [...mockWorkLogs];
      
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }
      
      if (startDate) {
        filteredLogs = filteredLogs.filter(log => log.date >= startDate);
      }
      
      if (endDate) {
        filteredLogs = filteredLogs.filter(log => log.date <= endDate);
      }
      
      resolve({ data: filteredLogs });
    }, 500);
  });
};

export const mockCreateWorkLog = async (workLogData: Omit<WorkLog, 'id'>) => {
  return new Promise<{ data: WorkLog }>((resolve) => {
    setTimeout(() => {
      const newWorkLog: WorkLog = {
        ...workLogData,
        id: generateId(),
        reviewed: false
      };
      
      mockWorkLogs.push(newWorkLog);
      resolve({ data: newWorkLog });
    }, 500);
  });
};

export const mockUpdateWorkLog = async (id: string, workLogData: Partial<WorkLog>) => {
  return new Promise<{ data: WorkLog }>((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkLogs.findIndex(log => log.id === id);
      
      if (index !== -1) {
        mockWorkLogs[index] = { ...mockWorkLogs[index], ...workLogData };
        resolve({ data: mockWorkLogs[index] });
      } else {
        reject(new Error('Work log not found'));
      }
    }, 500);
  });
};

export const mockDeleteWorkLog = async (id: string) => {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    setTimeout(() => {
      const index = mockWorkLogs.findIndex(log => log.id === id);
      
      if (index !== -1) {
        mockWorkLogs = mockWorkLogs.filter(log => log.id !== id);
        resolve({ success: true });
      } else {
        reject(new Error('Work log not found'));
      }
    }, 500);
  });
};
// Add a notifications array
let notifications: {
  id: string;
  userId: string;
  message: string;
  type: 'reminder' | 'system';
  createdAt: string;
}[] = [];

// Function to create a notification
export const createNotification = (userId: string, message: string, type: 'reminder' | 'system') => {
  const notification = {
    id: generateId(),
    userId,
    message,
    type,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  console.log(`Notification created for user ${userId}: ${message}`);
};

// Function to get notifications for a specific user
export const getNotificationsForUser = (userId: string) => {
  return notifications.filter((notification) => notification.userId === userId);
};

// Schedule daily reminders at 10 PM
import cron from 'node-cron';
export const scheduleDailyReminders = () => {
  cron.schedule('0 22 * * *', () => {
    const users = getMockUsers();
    const today = new Date().toISOString().split('T')[0];

    users.forEach((user) => {
      if (user.role === 'developer') {
        const hasSubmittedLog = mockWorkLogs.some((log) => log.userId === user.id && log.date === today);
        if (!hasSubmittedLog) {
          createNotification(user.id, 'Reminder: Please submit your daily log by 10 PM.', 'reminder');
        }
      }
    });
  });

  console.log('Daily reminders scheduled at 10 PM.');
};

// Initialize reminders
scheduleDailyReminders();

// Export mock data for testing/development
export const getMockUsers = () => mockUsers;
export const getMockWorkLogs = () => mockWorkLogs;
