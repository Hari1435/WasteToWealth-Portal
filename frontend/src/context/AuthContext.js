import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          
          // Verify token is still valid
          const response = await authAPI.getCurrentUser();
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: {
              user: response.data.data.user,
            },
          });
        } catch (error) {
          // Token is invalid, clear storage and navigation state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('lastVisitedPath'); // Clear saved navigation state
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: 'Session expired',
          });
        }
      } else {
        // No token, clear any saved navigation state
        localStorage.removeItem('lastVisitedPath');
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: null,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      // Don't dispatch LOGIN_START to avoid loading state conflicts with tractor loading
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Clear any pending verification
      localStorage.removeItem('pendingVerificationEmail');

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success('Login successful!', { duration: 3000 });
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      const requiresVerification = error.response?.data?.requiresVerification;
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      if (requiresVerification) {
        // Store email for OTP verification page
        localStorage.setItem('pendingVerificationEmail', credentials.email);
        toast.error(errorMessage);
        return { 
          success: false, 
          error: errorMessage, 
          requiresVerification: true,
          email: credentials.email 
        };
      } else {
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  };

  // Direct login with user and token (for OTP verification)
  const loginDirect = (user, token) => {
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // Clear any pending verification
    localStorage.removeItem('pendingVerificationEmail');

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user, token },
    });

    toast.success('Login successful!', { duration: 3000 });
    return { success: true, user };
  };

  // Register function
  const register = async (userData, userType) => {
    try {
      // Don't dispatch REGISTER_START to avoid loading state conflicts with tractor loading
      const response = await authAPI.register(userData, userType);
      const { user, otpSent } = response.data.data;

      // Don't store token or login immediately - user needs to verify OTP first
      // Store email for OTP verification page
      localStorage.setItem('pendingVerificationEmail', user.email);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token: null }, // No token until verified
      });

      const message = otpSent 
        ? 'Registration successful! Please check your email for the OTP to verify your account.'
        : 'Registration successful! Please check your email for the OTP. (Email sending failed, but you can request a new one)';
      
      toast.success(message);
      return { 
        success: true, 
        user, 
        requiresVerification: true,
        otpSent 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear localStorage including navigation state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastVisitedPath'); // Clear saved navigation state

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully', { duration: 3000 });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.userType === role;
  };

  // Check if user is farmer
  const isFarmer = () => hasRole('farmer');

  // Check if user is buyer
  const isBuyer = () => hasRole('buyer');



  // Refresh user data
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
        
        // Get updated user data from server
        const response = await authAPI.getCurrentUser();
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: {
            user: response.data.data.user,
          },
        });
        
        return { success: true, user: response.data.data.user };
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'Failed to refresh user data',
        });
        return { success: false, error: 'Failed to refresh user data' };
      }
    }
    
    return { success: false, error: 'No token found' };
  };

  const value = {
    ...state,
    login,
    loginDirect,
    register,
    logout,
    clearError,
    refreshUser,
    hasRole,
    isFarmer,
    isBuyer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;