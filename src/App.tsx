import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Work Log Pages
import WorkLogs from './pages/worklog/WorkLogs';
import CreateWorkLog from './pages/worklog/CreateWorkLog';
import EditWorkLog from './pages/worklog/EditWorkLog';
import WorkLogView from './pages/worklog/WorkLogView';

// Team Pages
import TeamOverview from './pages/team/TeamOverview';
import TeamMemberLogs from './pages/team/TeamMemberLogs';

// Reports Page
import Reports from './pages/reports/Reports';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Manager Route Component
const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Work Log Routes */}
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <WorkLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs/new"
          element={
            <ProtectedRoute>
              <CreateWorkLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs/edit/:id"
          element={
            <ProtectedRoute>
              <EditWorkLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs/:id"
          element={
            <ProtectedRoute>
              <WorkLogView />
            </ProtectedRoute>
          }
        />
        
        {/* Team Routes - Manager Only */}
        <Route
          path="/team"
          element={
            <ManagerRoute>
              <TeamOverview />
            </ManagerRoute>
          }
        />
        <Route
          path="/team/:id"
          element={
            <ManagerRoute>
              <TeamMemberLogs />
            </ManagerRoute>
          }
        />
        
        {/* Reports - Manager Only */}
        <Route
          path="/reports"
          element={
            <ManagerRoute>
              <Reports />
            </ManagerRoute>
          }
        />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;