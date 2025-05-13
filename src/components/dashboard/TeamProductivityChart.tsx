import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { WorkLog, User } from '../../types';
import { calculateTotalTime } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TeamProductivityChartProps {
  workLogs: WorkLog[];
  developers: User[];
}

const TeamProductivityChart: React.FC<TeamProductivityChartProps> = ({ workLogs, developers }) => {
  // Sort logs by date
  const sortedLogs = [...workLogs].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Get unique dates
  const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date)));
  const formattedDates = uniqueDates.map(date => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });
  
  // Create datasets for each developer
  const datasets = developers.map(dev => {
    // Generate a unique color for each developer
    const hue = Math.floor(Math.random() * 360);
    const baseColor = `hsl(${hue}, 70%, 50%)`;
    const backgroundColor = `hsl(${hue}, 70%, 85%)`;
    
    // Calculate time spent for each date
    const data = uniqueDates.map(date => {
      const log = sortedLogs.find(log => log.date === date && log.userId === dev.id);
      if (!log) return 0;
      
      // Convert minutes to hours
      return calculateTotalTime(log.tasks) / 60;
    });
    
    return {
      label: dev.name,
      data,
      backgroundColor,
      borderColor: baseColor,
      borderWidth: 1,
    };
  });
  
  const data = {
    labels: formattedDates,
    datasets,
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours Logged',
        },
        stacked: true,
      },
      x: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Team Productivity',
      },
    },
  };
  
  return <Bar data={data} options={options} />;
};

export default TeamProductivityChart;