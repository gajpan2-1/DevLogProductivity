import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import WorkLogDetail from '../../components/worklog/WorkLogDetail';
import { WorkLog, User } from '../../types';
import { getWorkLogById, reviewWorkLog, exportWorkLogs } from '../../services/workLogs';
import { getMockUsers } from '../../utils/mockData';
import useAuthStore from '../../store/authStore';
import { generatePDFReport, downloadFile, generateCSVReport } from '../../utils/helpers';

const WorkLogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [workLog, setWorkLog] = useState<WorkLog | null>(null);
  const [developer, setDeveloper] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isManager = user?.role === 'manager';
  
  useEffect(() => {
    const fetchWorkLog = async () => {
      if (!id) return;
      
      try {
        const workLogData = await getWorkLogById(id);
        setWorkLog(workLogData);
        
        // Get developer info
        const mockUsers = getMockUsers();
        const dev = mockUsers.find(u => u.id === workLogData.userId);
        if (dev) {
          setDeveloper(dev);
        }
      } catch (err) {
        console.error('Failed to fetch work log:', err);
        setError('Failed to load the work log');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkLog();
  }, [id]);
  
  const handleReview = async (reviewed: boolean, reviewNotes?: string) => {
    if (!id) return;
    
    try {
      await reviewWorkLog(id, reviewed, reviewNotes);
      // Update local state
      if (workLog) {
        setWorkLog({
          ...workLog,
          reviewed,
          reviewNotes: reviewNotes || workLog.reviewNotes,
          reviewedBy: user?.id
        });
      }
    } catch (err) {
      console.error('Failed to review work log:', err);
      alert('Failed to submit review');
    }
  };
  
  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!workLog || !developer) return;
    
    try {
      // In a real app, this would call the API
      // const response = await exportWorkLogs(format, workLog.userId, workLog.date, workLog.date);
      // const blob = new Blob([response.data]);
      
      // For demo, generate locally
      let blob: Blob | string;
      let filename: string;
      
      if (format === 'pdf') {
        blob = generatePDFReport([workLog], developer.name);
        filename = `worklog_${workLog.date}_${developer.name.replace(/\s+/g, '_')}.pdf`;
      } else {
        const csvData = generateCSVReport([workLog]);
        blob = csvData;
        filename = `worklog_${workLog.date}_${developer.name.replace(/\s+/g, '_')}.csv`;
      }
      
      downloadFile(blob, filename);
    } catch (err) {
      console.error('Failed to export work log:', err);
      alert('Failed to export work log');
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Work Log Details">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading work log...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !workLog) {
    return (
      <Layout title="Work Log Details">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Work log not found'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <WorkLogDetail 
        workLog={workLog}
        user={developer}
        isManager={isManager}
        onReview={isManager ? handleReview : undefined}
        onExport={handleExport}
      />
    </Layout>
  );
};

export default WorkLogView;