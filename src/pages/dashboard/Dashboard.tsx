import React from 'react';
import Layout from '../../components/layout/Layout';
import DeveloperDashboard from '../../components/dashboard/DeveloperDashboard';
import ManagerDashboard from '../../components/dashboard/ManagerDashboard';
import useAuthStore from '../../store/authStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  
  return (
    <Layout title="Dashboard">
      {user?.role === 'developer' ? (
        <DeveloperDashboard />
      ) : (
        <ManagerDashboard />
      )}
    </Layout>
  );
};

export default Dashboard;