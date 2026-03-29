import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const usePersistentNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const hasNavigatedRef = useRef(false);

  // Save current location to localStorage when user navigates (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Only save certain paths (exclude auth pages and verification pages)
      const pathsToSave = [
        '/dashboard',
        '/profile',
        '/farmer/dashboard',
        '/farmer/create-listing',
        '/farmer/my-listings',
        '/farmer/orders',
        '/buyer/dashboard',
        '/buyer/browse',
        '/buyer/orders',
        '/order/',
        '/waste/'
      ];

      const shouldSavePath = pathsToSave.some(path => 
        location.pathname.startsWith(path)
      );

      if (shouldSavePath) {
        localStorage.setItem('lastVisitedPath', location.pathname + location.search);
      }
    }
  }, [location, isAuthenticated, isLoading]);

  // Handle navigation after authentication is determined
  useEffect(() => {
    if (!isLoading && !hasNavigatedRef.current) {
      if (isAuthenticated) {
        // User is authenticated, check if we should restore their last location
        const lastVisitedPath = localStorage.getItem('lastVisitedPath');
        const currentPath = location.pathname;

        // Define paths where we should restore the last visited path
        const shouldRestoreFromPaths = [
          '/',
          '/login',
          '/register',
          '/verify-email'
        ];

        // If user is on a "restore-from" page and we have a saved path, restore it
        const shouldRestore = shouldRestoreFromPaths.includes(currentPath) && 
                             lastVisitedPath && 
                             lastVisitedPath !== currentPath &&
                             !lastVisitedPath.includes('/login') &&
                             !lastVisitedPath.includes('/register') &&
                             !lastVisitedPath.includes('/verify-email');

        if (shouldRestore) {
          hasNavigatedRef.current = true;
          navigate(lastVisitedPath, { replace: true });
        } else if (currentPath === '/') {
          // If user is on home page and authenticated, redirect to appropriate dashboard
          const dashboardPath = localStorage.getItem('user') ? 
            JSON.parse(localStorage.getItem('user')).userType === 'farmer' ? 
              '/farmer/dashboard' : '/buyer/dashboard' : '/dashboard';
          
          hasNavigatedRef.current = true;
          navigate(dashboardPath, { replace: true });
        }
      } else {
        // User is not authenticated, clear saved path and redirect to home if on protected route
        localStorage.removeItem('lastVisitedPath');
        
        const protectedPaths = [
          '/dashboard',
          '/profile',
          '/farmer/',
          '/buyer/',
          '/order/',
          '/waste/'
        ];

        const isOnProtectedRoute = protectedPaths.some(path => 
          location.pathname.startsWith(path)
        );

        if (isOnProtectedRoute) {
          hasNavigatedRef.current = true;
          navigate('/', { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Reset navigation flag when location changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [location.pathname]);

  return null;
};

export default usePersistentNavigation;