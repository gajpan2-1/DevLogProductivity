import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import WorkLogForm from '../../components/worklog/WorkLogForm';
import { WorkLog } from '../../types';
import { getWorkLogById, updateWorkLog } from '../../services/workLogs';

const EditWorkLog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workLog, setWorkLog] = useState<WorkLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchWorkLog = async () => {
      if (!id) return;
      
      try {
        const workLogData = await getWorkLogById(id);
        setWorkLog(workLogData);
      } catch (err) {
        console.error('Failed to fetch work log:', err);
        setError('Failed to load the work log');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkLog();
  }, [id]);
  
  const handleSubmit = async (data: WorkLog) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateWorkLog(id, data);
      navigate(`/logs/${id}`);
    } catch (err) {
      console.error('Failed to update work log:', err);
      setError('Failed to update the work log');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Edit Work Log">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading work log...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !workLog) {
    return (
      <Layout title="Edit Work Log">
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
    <Layout title="Edit Work Log">
      <WorkLogForm 
        initialData={workLog}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default EditWorkLog;