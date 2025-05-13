import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Calendar, Tag } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { WorkLog } from '../../types';
import { getWorkLogs } from '../../services/workLogs';
import useAuthStore from '../../store/authStore';
import { formatTime, calculateTotalTime, getMoodEmoji } from '../../utils/helpers';

const WorkLogs: React.FC = () => {
  const { user } = useAuthStore();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        if (!user?.id) return;
        
        const response = await getWorkLogs(user.id);
        setWorkLogs(response.data);
        setFilteredLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch work logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkLogs();
  }, [user?.id]);
  
  useEffect(() => {
    // Apply filters
    let filtered = [...workLogs];
    
    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(log => log.date === dateFilter);
    }
    
    // Search filter - search in task titles and descriptions
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        return (
          // Search in task titles
          log.tasks.some(task => task.title.toLowerCase().includes(query)) ||
          // Search in task descriptions
          log.tasks.some(task => task.description.toLowerCase().includes(query)) ||
          // Search in task tags
          log.tasks.some(task => task.tags.some(tag => tag.toLowerCase().includes(query))) ||
          // Search in blockers
          (log.blockers && log.blockers.toLowerCase().includes(query)) ||
          // Search in notes
          (log.notes && log.notes.toLowerCase().includes(query))
        );
      });
    }
    
    setFilteredLogs(filtered);
  }, [workLogs, searchQuery, dateFilter]);
  
  // Group logs by month for better organization
  const groupedLogs: Record<string, WorkLog[]> = {};
  
  filteredLogs.forEach(log => {
    const date = new Date(log.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!groupedLogs[monthYear]) {
      groupedLogs[monthYear] = [];
    }
    
    groupedLogs[monthYear].push(log);
  });
  
  // Sort each month's logs by date (newest first)
  Object.keys(groupedLogs).forEach(month => {
    groupedLogs[month].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });
  
  // Sort months (newest first)
  const sortedMonths = Object.keys(groupedLogs).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <Layout title="My Work Logs">
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <Link to="/logs/new">
              <Button
                variant="primary"
                className="whitespace-nowrap"
                icon={<PlusCircle size={16} />}
              >
                New Log
              </Button>
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading work logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">No work logs found</h3>
            {searchQuery || dateFilter ? (
              <p className="text-gray-500 mb-6">Try adjusting your filters</p>
            ) : (
              <p className="text-gray-500 mb-6">Create your first work log to start tracking your productivity!</p>
            )}
            
            <Link to="/logs/new">
              <Button
                variant="primary"
                icon={<PlusCircle size={16} />}
              >
                Create Work Log
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMonths.map(month => (
              <div key={month}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{month}</h3>
                
                <div className="space-y-4">
                  {groupedLogs[month].map(log => (
                    <Link
                      key={log.id}
                      to={`/logs/${log.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow border-l-4 border-indigo-500">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">
                              {new Date(log.date).toLocaleDateString('en-US', {
                                weekday: 'long',
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
                            </div>
                            
                            {log.tasks.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {Array.from(new Set(log.tasks.flatMap(task => task.tags)))
                                  .slice(0, 5)
                                  .map((tag, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      <Tag size={12} className="mr-1" />
                                      {tag}
                                    </span>
                                  ))
                                }
                                
                                {log.tasks.flatMap(task => task.tags).length > 5 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{log.tasks.flatMap(task => task.tags).length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {log.blockers && (
                            <div className="ml-4 flex items-start">
                              <span className="inline-flex items-center px-2.5 py-0.5 h-6 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Blockers
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkLogs;