import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, WorkLog } from '../../types';
import { getMockUsers } from '../../utils/mockData';
import { getWorkLogs } from '../../services/workLogs';
import { calculateTotalTime, formatTime, getMoodEmoji } from '../../utils/helpers';
import ProductivityChart from '../../components/dashboard/ProductivityChart';

const TeamMemberLogs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [developer, setDeveloper] = useState<User | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        // Get developer info
        const allUsers = getMockUsers();
        const dev = allUsers.find(user => user.id === id);
        if (dev) {
          setDeveloper(dev);
        }
        
        // Get work logs for this developer
        const response = await getWorkLogs(id);
        
        // Sort logs by date (newest first)
        const sortedLogs = response.data.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setWorkLogs(sortedLogs);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Get recent logs for chart
  const last7DaysLogs = [...workLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);
  
  // Calculate stats
  const totalTimeLogged = workLogs.reduce((total, log) => {
    return total + calculateTotalTime(log.tasks);
  }, 0);
  
  const totalTasks = workLogs.reduce((total, log) => {
    return total + log.tasks.length;
  }, 0);
  
  const avgMood = workLogs.length > 0
    ? workLogs.reduce((total, log) => total + log.mood, 0) / workLogs.length
    : 0;
  
  const logsWithBlockers = workLogs.filter(log => log.blockers && log.blockers.length > 0);
  
  return (
    <Layout title={developer ? `${developer.name}'s Logs` : 'Team Member Logs'}>
      <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/team" className="mr-4">
            <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />}>
              Back to Team
            </Button>
          </Link>
          
          {developer && (
            <div className="flex items-center">
              <img
                className="h-10 w-10 rounded-full"
                src={developer.avatar || `https://ui-avatars.com/api/?name=${developer.name}&background=4F46E5&color=fff`}
                alt={developer.name}
              />
              <div className="ml-3">
                <h2 className="text-xl font-bold text-gray-900">{developer.name}</h2>
                <p className="text-sm text-gray-500">{developer.email}</p>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading logs...</p>
          </div>
        ) : !developer ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Developer not found</h3>
            <p className="text-gray-500">The team member you're looking for doesn't exist</p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <Calendar size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Logs</h3>
                    <p className="text-2xl font-semibold text-gray-900">{workLogs.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Clock size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Time Logged</h3>
                    <p className="text-2xl font-semibold text-gray-900">{formatTime(totalTimeLogged)}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <div className="text-2xl">
                      {avgMood > 0 ? getMoodEmoji(Math.round(avgMood) as 1|2|3|4|5) : '😐'}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Average Mood</h3>
                    <p className="text-2xl font-semibold text-gray-900">
                      {avgMood > 0 ? avgMood.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Blockers</h3>
                    <p className="text-2xl font-semibold text-gray-900">{logsWithBlockers.length}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Productivity Chart */}
            {last7DaysLogs.length > 0 && (
              <Card 
                title="Productivity Trend" 
                subtitle="Time logged over the past 7 days"
              >
                <div className="h-80">
                  <ProductivityChart workLogs={last7DaysLogs} />
                </div>
              </Card>
            )}
            
            {/* Recent Logs */}
            <Card title="Work Logs">
              {workLogs.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No work logs found for this team member.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {workLogs.map((log) => (
                    <div key={log.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">
                            {new Date(log.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h4>
                          
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">
                              Tasks: {log.tasks.length}
                            </span>
                            <span className="text-sm text-gray-500">
                              Time: {formatTime(calculateTotalTime(log.tasks))}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              Mood: <span className="ml-1 text-lg">{getMoodEmoji(log.mood)}</span>
                            </span>
                            {log.reviewed ? (
                              <span className="text-sm text-green-600">Reviewed ✓</span>
                            ) : (
                              <span className="text-sm text-amber-600">Not reviewed</span>
                            )}
                          </div>
                          
                          {log.blockers && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-md text-sm text-amber-800">
                              <strong>Blocker:</strong> {log.blockers}
                            </div>
                          )}
                        </div>
                        
                        <Link to={`/logs/${log.id}`}>
                          <Button variant="outline" size="sm">
                            {log.reviewed ? 'View' : 'Review'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeamMemberLogs;