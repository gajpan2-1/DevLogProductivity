import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Clock, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { getWorkLogs } from '../../services/workLogs';
import { getMockUsers } from '../../utils/mockData';
import { WorkLog, User } from '../../types';
import { formatTime, calculateTotalTime, getMoodEmoji } from '../../utils/helpers';
import TeamProductivityChart from './TeamProductivityChart';


const ManagerDashboard: React.FC = () => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get logs for the last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const response = await getWorkLogs(undefined, startDate, endDate);
        setWorkLogs(response.data);
        
        // Get all developers
        const allUsers = getMockUsers();
        const devs = allUsers.filter(user => user.role === 'developer');
        setDevelopers(devs);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  //Re-fetch logs & Update
  const refreshLogs = async () => {
  const response = await getWorkLogs();
  setWorkLogs(response.data);
};
  
  // Get today's logs
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLogs = workLogs.filter(log => log.date === todayDate);
  
  // Calculate some stats
  const totalDevelopers = developers.length;
  const developersLoggedToday = new Set(todayLogs.map(log => log.userId)).size;
  
  const logsWithBlockers = workLogs.filter(log => log.blockers && log.blockers.length > 0);
  const unreviewedLogs = workLogs.filter(log => !log.reviewed);
  
  // Calculate weekly stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  
  const lastWeekLogs = workLogs.filter(log => log.date >= sevenDaysAgoStr);
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Team Check-in</h3>
              <p className="text-2xl font-semibold text-gray-900">{developersLoggedToday} / {totalDevelopers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <FileText size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Unreviewed Logs</h3>
              <p className="text-2xl font-semibold text-gray-900">{unreviewedLogs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Reported Blockers</h3>
              <p className="text-2xl font-semibold text-gray-900">{logsWithBlockers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Weekly Hours</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {formatTime(lastWeekLogs.reduce((total, log) => {
                  return total + calculateTotalTime(log.tasks);
                }, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Team Productivity Chart */}
      <Card 
        title="Team Productivity" 
        subtitle="Overall team performance over the past 7 days"
      >
        <div className="h-80">
          <TeamProductivityChart workLogs={lastWeekLogs} developers={developers} />
        </div>
      </Card>
      
      {/* Team Members */}
      <Card 
        title="Team Members" 
        headerAction={
          <Link to="/team">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : developers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No team members found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {developers.map((dev) => {
              const todayLogForDev = todayLogs.find(log => log.userId === dev.id);
              const hasLoggedToday = !!todayLogForDev;
              
              return (
                <div key={dev.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={dev.avatar || `https://ui-avatars.com/api/?name=${dev.name}&background=4F46E5&color=fff`}
                      alt={dev.name}
                    />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{dev.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${hasLoggedToday ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></span>
                        <p className="text-xs text-gray-500">
                          {hasLoggedToday 
                            ? `Logged today · Mood: ${getMoodEmoji(todayLogForDev.mood)}`
                            : 'Not logged today'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/team/${dev.id}`}>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      
      {/* Recent Blockers */}
      {logsWithBlockers.length > 0 && (
        <Card 
          title="Recent Blockers" 
          subtitle="Issues reported by the team"
          className="border-l-4 border-amber-500"
        >
          <div className="space-y-4">
            {logsWithBlockers.slice(0, 3).map((log) => {
              const developer = developers.find(dev => dev.id === log.userId);
              
              return (
                <div key={log.id} className="bg-amber-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {developer?.name} · {new Date(log.date).toLocaleDateString()}
                    </h4>
                    <Link to={`/logs/${log.id}`}>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{log.blockers}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};


export default ManagerDashboard;
