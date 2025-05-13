import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckSquare, AlertCircle, TrendingUp, Edit } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';
import { getWorkLogs } from '../../services/workLogs';
import { WorkLog } from '../../types';
import { formatTime, calculateTotalTime } from '../../utils/helpers';
import ProductivityChart from './ProductivityChart';
import { getNotificationsForUser } from '../../utils/mockData';

const DeveloperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        // Get logs for the last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const response = await getWorkLogs(user?.id, startDate, endDate);
        setWorkLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch work logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchWorkLogs();
    }
  }, [user?.id]);
  
  // Get today's log if exists
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLog = workLogs.find(log => log.date === todayDate);
  
  // Calculate some stats
  const totalTimeToday = todayLog ? calculateTotalTime(todayLog.tasks) : 0;
  const totalTasksToday = todayLog ? todayLog.tasks.length : 0;
  const completedTasksToday = todayLog ? todayLog.tasks.filter(task => task.completed).length : 0;
  const hasBlockersToday = todayLog?.blockers && todayLog.blockers.length > 0;
  
  // Calculate weekly stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  const lastWeekLogs = workLogs.filter(log => log.date >= sevenDaysAgoStr);
  const totalTimeWeek = lastWeekLogs.reduce((total, log) => {
    return total + calculateTotalTime(log.tasks);
  }, 0);
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-indigo-700 rounded-lg overflow-hidden shadow-lg">
        <div className="px-6 py-8 md:px-8 md:py-10">
          <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h2>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {!todayLog ? (
              <Link to="/logs/new">
                <Button variant="outline" className="bg-white">
                  Start Today's Log
                </Button>
              </Link>
            ) : (
              <Link to={`/logs/edit/${todayLog.id}`}>
                <Button 
                  variant="outline" 
                  className="bg-white" 
                  icon={<Edit size={16} />}
                >
                  Update Today's Log
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Time Logged Today</h3>
              <p className="text-2xl font-semibold text-gray-900">{formatTime(totalTimeToday)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckSquare size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tasks Completed</h3>
              <p className="text-2xl font-semibold text-gray-900">{completedTasksToday} / {totalTasksToday}</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${hasBlockersToday ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              <AlertCircle size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Blockers</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {hasBlockersToday ? 'Yes' : 'None'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Weekly Total</h3>
              <p className="text-2xl font-semibold text-gray-900">{formatTime(totalTimeWeek)}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Productivity Chart */}
      <Card 
        title="Productivity Trend" 
        subtitle="Time logged over the past 7 days"
      >
        <div className="h-80">
          <ProductivityChart workLogs={lastWeekLogs} />
        </div>
      </Card>
      
      {/* Recent Logs */}
      <Card 
        title="Recent Logs" 
        headerAction={
          <Link to="/logs">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : workLogs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No work logs found. Start tracking your productivity!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {workLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {log.tasks.length} tasks · {formatTime(calculateTotalTime(log.tasks))}
                  </p>
                </div>
                
                <Link to={`/logs/${log.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const DeveloperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const notifications = user ? getNotificationsForUser(user.id) : [];

  return (
    <div>
      {/* Existing Dashboard Content */}
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <strong>{notification.type.toUpperCase()}:</strong> {notification.message} ({new Date(notification.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeveloperDashboard;
export default DeveloperDashboard;
