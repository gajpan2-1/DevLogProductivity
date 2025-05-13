export interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'manager';
  avatar?: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  members: string[]; // User IDs
}

export interface Task {
  id: string;
  title: string;
  description: string;
  timeSpent: number; // in minutes
  tags: string[];
  completed: boolean;
}

export interface WorkLog {
  id: string;
  userId: string;
  date: string;
  tasks: Task[];
  mood: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  blockers?: string;
  notes?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'reminder' | 'review' | 'system';
}