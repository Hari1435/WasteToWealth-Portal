import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // All loaders removed - skip loading state
  if (isLoading) {
    return null; // No loading screen
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = user?.userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;