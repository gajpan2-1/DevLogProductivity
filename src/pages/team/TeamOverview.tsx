import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, BarChart, UserCheck } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, WorkLog } from '../../types';
import { getMockUsers } from '../../utils/mockData';
import { getWorkLogs } from '../../services/workLogs';
import { formatTime, calculateTotalTime, getMoodEmoji } from '../../utils/helpers';

const TeamOverview: React.FC = () => {
  const [developers, setDevelopers] = useState<User[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get developers from mock data
        const allUsers = getMockUsers();
        const devs = allUsers.filter(user => user.role === 'developer');
        setDevelopers(devs);
        
        // Get recent work logs
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const response = await getWorkLogs(undefined, startDate, endDate);
        setWorkLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter developers based on search query
  const filteredDevelopers = developers.filter(dev => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return dev.name.toLowerCase().includes(query) || dev.email.toLowerCase().includes(query);
  });
  
  // Get today's date for checking today's logs
  const todayDate = new Date().toISOString().split('T')[0];
  
  return (
    <Layout title="Team Overview">
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading team data...</p>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">No team members found</h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevelopers.map(dev => {
              // Find today's log for this developer
              const todayLog = workLogs.find(log => log.date === todayDate && log.userId === dev.id);
              
              // Find all logs for this developer
              const devLogs = workLogs.filter(log => log.userId === dev.id);
              
              // Calculate total time logged
              const totalTimeLogged = devLogs.reduce((total, log) => {
                return total + calculateTotalTime(log.tasks);
              }, 0);
              
              // Calculate average mood
              const avgMood = devLogs.length > 0
                ? devLogs.reduce((total, log) => total + log.mood, 0) / devLogs.length
                : 0;
              
              // Count logs with blockers
              const logsWithBlockers = devLogs.filter(log => log.blockers && log.blockers.length > 0);
              
              return (
                <Card key={dev.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={dev.avatar || `https://ui-avatars.com/api/?name=${dev.name}&background=4F46E5&color=fff`}
                      alt={dev.name}
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{dev.name}</h3>
                      <p className="text-sm text-gray-500">{dev.email}</p>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-sm">
                          <CalendarDays size={16} className="text-gray-400 mr-2" />
                          <span>
                            {devLogs.length} logs in last 30 days
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <BarChart size={16} className="text-gray-400 mr-2" />
                          <span>
                            Total time: {formatTime(totalTimeLogged)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <span className="text-xl mr-2">
                            {avgMood > 0 ? getMoodEmoji(Math.round(avgMood) as 1|2|3|4|5) : '😐'}
                          </span>
                          <span>
                            Avg. mood: {avgMood > 0 ? avgMood.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        {todayLog ? (
                          <div className="flex items-center text-sm text-green-600">
                            <UserCheck size={16} className="mr-1" />
                            <span>Logged today</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Not logged today</div>
                        )}
                        
                        {logsWithBlockers.length > 0 && (
                          <div className="ml-auto px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                            {logsWithBlockers.length} blocker{logsWithBlockers.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <Link to={`/team/${dev.id}`}>
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamOverview;