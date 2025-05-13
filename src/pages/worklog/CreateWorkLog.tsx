import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import WorkLogForm from '../../components/worklog/WorkLogForm';
import { WorkLog } from '../../types';
import { createWorkLog } from '../../services/workLogs';
import useAuthStore from '../../store/authStore';

const CreateWorkLog: React.FC = () => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (data: Omit<WorkLog, 'id'>) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      // Add the user ID to the data
      const workLogData = {
        ...data,
        userId: user.id
      };
      
      const response = await createWorkLog(workLogData);
      navigate(`/logs/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create work log:', error);
      alert('Failed to create work log');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="Create Work Log">
      <WorkLogForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default CreateWorkLog;