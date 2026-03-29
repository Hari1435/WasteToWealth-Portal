import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  // Redirect to appropriate dashboard based on user type
  if (user?.userType === 'farmer') {
    return <Navigate to="/farmer/dashboard" replace />;
  } else if (user?.userType === 'buyer') {
    return <Navigate to="/buyer/dashboard" replace />;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600 mt-2">Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardPage;