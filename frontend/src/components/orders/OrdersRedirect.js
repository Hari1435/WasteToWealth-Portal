import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

const OrdersRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user type
      if (user.userType === 'farmer') {
        navigate('/farmer/orders', { replace: true });
      } else if (user.userType === 'buyer') {
        navigate('/buyer/orders', { replace: true });
      } else {
        // Fallback to dashboard if user type is unclear
        navigate('/dashboard', { replace: true });
      }
    } else if (!loading && !user) {
      // User not authenticated, redirect to login
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while determining redirect
  return <LoadingScreen message="Redirecting to your orders..." />;
};

export default OrdersRedirect;