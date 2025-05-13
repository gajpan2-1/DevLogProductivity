import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkLog, Task } from '../types';

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Format minutes to hours and minutes
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

// Calculate total time spent on tasks
export const calculateTotalTime = (tasks: Task[]): number => {
  return tasks.reduce((total, task) => total + task.timeSpent, 0);
};

// Get emoji for mood
export const getMoodEmoji = (mood: 1 | 2 | 3 | 4 | 5): string => {
  const emojis = ['😞', '😕', '😐', '🙂', '😀'];
  return emojis[mood - 1];
};

// Generate PDF report from work logs
export const generatePDFReport = (workLogs: WorkLog[], userName: string): Blob => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(`Productivity Report: ${userName}`, 14, 22);
  
  // Date range
  const startDate = new Date(Math.min(...workLogs.map(log => new Date(log.date).getTime()))).toLocaleDateString();
  const endDate = new Date(Math.max(...workLogs.map(log => new Date(log.date).getTime()))).toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Period: ${startDate} - ${endDate}`, 14, 32);
  
  // Summary stats
  const totalMinutes = workLogs.reduce((total, log) => {
    return total + calculateTotalTime(log.tasks);
  }, 0);
  
  const totalTasks = workLogs.reduce((total, log) => total + log.tasks.length, 0);
  const avgMood = workLogs.reduce((total, log) => total + log.mood, 0) / workLogs.length;
  
  doc.text(`Total Time Logged: ${formatTime(totalMinutes)}`, 14, 42);
  doc.text(`Total Tasks Completed: ${totalTasks}`, 14, 50);
  doc.text(`Average Mood: ${avgMood.toFixed(1)} ${getMoodEmoji(Math.round(avgMood) as 1|2|3|4|5)}`, 14, 58);
  
  // Table data
  const tableData = workLogs.map(log => {
    return [
      new Date(log.date).toLocaleDateString(),
      log.tasks.length,
      formatTime(calculateTotalTime(log.tasks)),
      getMoodEmoji(log.mood),
      log.blockers || 'None'
    ];
  });
  
  // Generate table
  autoTable(doc, {
    head: [['Date', 'Tasks', 'Time Spent', 'Mood', 'Blockers']],
    body: tableData,
    startY: 70
  });
  
  return doc.output('blob');
};

// Generate CSV data from work logs
export const generateCSVReport = (workLogs: WorkLog[]): string => {
  const header = 'Date,Tasks,Time Spent,Mood,Blockers\n';
  
  const rows = workLogs.map(log => {
    return [
      log.date,
      log.tasks.length,
      formatTime(calculateTotalTime(log.tasks)),
      log.mood,
      log.blockers ? `"${log.blockers.replace(/"/g, '""')}"` : ''
    ].join(',');
  }).join('\n');
  
  return header + rows;
};

// Download file helper
export const downloadFile = (data: Blob | string, filename: string): void => {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/csv;charset=utf-8;' }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};