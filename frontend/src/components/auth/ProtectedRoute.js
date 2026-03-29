import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// LoadingSpinner removed - all loaders disabled

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // All loaders removed - skip loading state
  if (isLoading) {
    return null; // No loading screen
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email verification is required and user is not verified
  if (requireVerification && user && !user.isVerified) {
    return <Navigate to="/verification-pending" state={{ email: user.email }} replace />;
  }

  return children;
};

export default ProtectedRoute;