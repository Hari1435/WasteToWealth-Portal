import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // All loaders removed - skip loading state
  if (isLoading) {
    return null; // No loading screen
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.userType)) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = user?.userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;