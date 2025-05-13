import { create } from 'zustand';
import { WorkLog, Task } from '../types';

interface WorkLogState {
  logs: WorkLog[];
  currentLog: WorkLog | null;
  isLoading: boolean;
  error: string | null;
}

interface WorkLogActions {
  setLogs: (logs: WorkLog[]) => void;
  addLog: (log: WorkLog) => void;
  updateLog: (logId: string, logData: Partial<WorkLog>) => void;
  deleteLog: (logId: string) => void;
  setCurrentLog: (log: WorkLog | null) => void;
  addTask: (logId: string, task: Task) => void;
  updateTask: (logId: string, taskId: string, taskData: Partial<Task>) => void;
  deleteTask: (logId: string, taskId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useWorkLogStore = create<WorkLogState & WorkLogActions>((set) => ({
  logs: [],
  currentLog: null,
  isLoading: false,
  error: null,
  
  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  updateLog: (logId, logData) => set((state) => ({
    logs: state.logs.map(log => 
      log.id === logId ? { ...log, ...logData } : log
    )
  })),
  deleteLog: (logId) => set((state) => ({
    logs: state.logs.filter(log => log.id !== logId)
  })),
  setCurrentLog: (log) => set({ currentLog: log }),
  
  addTask: (logId, task) => set((state) => ({
    logs: state.logs.map(log => 
      log.id === logId ? { ...log, tasks: [...log.tasks, task] } : log
    )
  })),
  updateTask: (logId, taskId, taskData) => set((state) => ({
    logs: state.logs.map(log => 
      log.id === logId 
        ? { 
            ...log, 
            tasks: log.tasks.map(task => 
              task.id === taskId ? { ...task, ...taskData } : task
            ) 
          } 
        : log
    )
  })),
  deleteTask: (logId, taskId) => set((state) => ({
    logs: state.logs.map(log => 
      log.id === logId 
        ? { ...log, tasks: log.tasks.filter(task => task.id !== taskId) } 
        : log
    )
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useWorkLogStore;