import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WorkLog } from '../../types';
import { calculateTotalTime } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProductivityChartProps {
  workLogs: WorkLog[];
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ workLogs }) => {
  // Sort logs by date
  const sortedLogs = [...workLogs].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Extract dates and total time spent for each day
  const dates = sortedLogs.map(log => {
    const date = new Date(log.date);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });
  
  const timeData = sortedLogs.map(log => {
    // Convert minutes to hours for better readability
    return calculateTotalTime(log.tasks) / 60;
  });
  
  // Calculate mood data
  const moodData = sortedLogs.map(log => log.mood);
  
  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Hours Logged',
        data: timeData,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Mood (1-5)',
        data: moodData,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.3,
        yAxisID: 'y1',
      }
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Hours Logged',
        },
        min: 0,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      y1: {
        title: {
          display: true,
          text: 'Mood',
        },
        position: 'right' as const,
        min: 1,
        max: 5,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  
  return <Line data={data} options={options} />;
};

export default ProductivityChart;