import React, { useEffect, useState } from 'react';
import { Calendar, Download, Users } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { User, WorkLog } from '../../types';
import { getMockUsers } from '../../utils/mockData';
import { getWorkLogs } from '../../services/workLogs';
import { 
  generatePDFReport, 
  generateCSVReport, 
  downloadFile, 
  calculateTotalTime,
  formatTime,
  getMoodEmoji
} from '../../utils/helpers';

const Reports: React.FC = () => {
  const [developers, setDevelopers] = useState<User[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all developers
        const allUsers = getMockUsers();
        const devs = allUsers.filter(user => user.role === 'developer');
        setDevelopers(devs);
        
        // Get default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        
        // Get work logs for the last 30 days
        const response = await getWorkLogs(
          undefined,
          thirtyDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        
        setWorkLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters to get filtered logs
  const getFilteredLogs = () => {
    let filtered = [...workLogs];
    
    // Filter by developer
    if (selectedDeveloper !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedDeveloper);
    }
    
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(log => log.date >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(log => log.date <= endDate);
    }
    
    return filtered;
  };
  
  const filteredLogs = getFilteredLogs();
  
  // Calculate stats for filtered logs
  const totalLogs = filteredLogs.length;
  
  const totalTimeLogged = filteredLogs.reduce((total, log) => {
    return total + calculateTotalTime(log.tasks);
  }, 0);
  
  const totalTasks = filteredLogs.reduce((total, log) => {
    return total + log.tasks.length;
  }, 0);
  
  const averageDailyTime = totalLogs > 0 ? totalTimeLogged / totalLogs : 0;
  
  // Generate developer select options
  const developerOptions = [
    { value: 'all', label: 'All Developers' },
    ...developers.map(dev => ({
      value: dev.id,
      label: dev.name
    }))
  ];
  
  // Handle export
  const handleExport = (format: 'pdf' | 'csv') => {
    if (filteredLogs.length === 0) {
      alert('No data to export');
      return;
    }
    
    const developerName = selectedDeveloper === 'all' 
      ? 'All Developers' 
      : developers.find(d => d.id === selectedDeveloper)?.name || 'Unknown';
    
    let blob: Blob | string;
    let filename: string;
    
    if (format === 'pdf') {
      blob = generatePDFReport(filteredLogs, developerName);
      filename = `productivity_report_${startDate}_to_${endDate}.pdf`;
    } else {
      const csvData = generateCSVReport(filteredLogs);
      blob = csvData;
      filename = `productivity_report_${startDate}_to_${endDate}.csv`;
    }
    
    downloadFile(blob, filename);
  };
  
  return (
    <Layout title="Reports">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Developer"
              options={developerOptions}
              value={selectedDeveloper}
              onChange={setSelectedDeveloper}
            />
            
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={() => handleExport('csv')}
              disabled={isLoading || filteredLogs.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={<Download size={16} />}
              onClick={() => handleExport('pdf')}
              disabled={isLoading || filteredLogs.length === 0}
            >
              Export PDF
            </Button>
          </div>
        </Card>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Calendar size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Logs</h3>
                <p className="text-2xl font-semibold text-gray-900">{totalLogs}</p>
              </div>
            </div>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-xl font-bold">✓</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
                <p className="text-2xl font-semibold text-gray-900">{totalTasks}</p>
              </div>
            </div>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Time</h3>
                <p className="text-2xl font-semibold text-gray-900">{formatTime(totalTimeLogged)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <span className="text-xl font-bold">⌚</span>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Avg. Daily</h3>
                <p className="text-2xl font-semibold text-gray-900">{formatTime(averageDailyTime)}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Report Preview */}
        <Card title="Report Preview">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">No data found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Developer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Logged
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mood
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blockers
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => {
                    const developer = developers.find(dev => dev.id === log.userId);
                    
                    return (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {developer?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.tasks.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(calculateTotalTime(log.tasks))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xl">
                          {getMoodEmoji(log.mood)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.blockers ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;