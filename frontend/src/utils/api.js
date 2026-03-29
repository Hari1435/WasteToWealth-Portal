import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased to 30 seconds
});

// Flag to track logout operations
let isLoggingOut = false;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't show session expired message during logout
      if (!isLoggingOut) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status === 403) {
      const requiresVerification = error.response?.data?.requiresVerification;
      if (requiresVerification) {
        // Redirect to verification page
        window.location.href = '/verification-pending';
        toast.error('Please verify your email to access this feature.');
      } else {
        toast.error('Access denied. Insufficient permissions.');
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData, userType) => 
    api.post(`/auth/register/${userType}`, userData),
  
  login: (credentials) => 
    api.post('/auth/login', credentials),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
  
  verifyOTP: (otpData) => 
    api.post('/auth/verify-otp', otpData),
  
  resendOTP: (email) => 
    api.post('/auth/resend-otp', { email }),
  
  forgotPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (resetData) => 
    api.post('/auth/reset-password', resetData),
  
  verifyEmail: (token, email) => 
    api.get(`/auth/verify-email?token=${token}&email=${email}`),
  
  resendVerification: (email) => 
    api.post('/auth/resend-verification', { email }),
  
  logout: () => {
    isLoggingOut = true;
    return api.post('/auth/logout').finally(() => {
      isLoggingOut = false;
    });
  },
};

// Waste API calls
export const wasteAPI = {
  create: (wasteData) => 
    api.post('/waste/create', wasteData),
  
  getAll: (params = {}) => 
    api.get('/waste/listings', { params }),
  
  getById: (id) => 
    api.get(`/waste/${id}`),
  
  update: (id, wasteData) => 
    api.put(`/waste/${id}`, wasteData),
  
  delete: (id) => 
    api.delete(`/waste/${id}`),
  
  search: (query, params = {}) => 
    api.get(`/waste/search/${query}`, { params }),
  
  getMyListings: (params = {}) => 
    api.get('/waste/farmer/my-listings', { params }),
  
  uploadImages: (formData) => 
    api.post('/waste/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Order API calls
export const orderAPI = {
  create: (orderData) => 
    api.post('/orders/create', orderData),
  
  // New order flow endpoints
  createRequest: (orderData) => 
    api.post('/orders/create-request', orderData),
  
  acceptOrder: (id, acceptData) => 
    api.post(`/orders/${id}/accept`, acceptData),
  
  rejectOrder: (id, rejectData) => 
    api.post(`/orders/${id}/reject`, rejectData),
  
  getPendingReview: () => 
    api.get('/orders/farmer/pending-review'),
  
  getFarmerOrders: (params = {}) => 
    api.get('/orders/farmer/my-orders', { params }),
  
  getBuyerOrders: (params = {}) => 
    api.get('/orders/buyer/my-orders', { params }),
  
  getById: (id) => 
    api.get(`/orders/${id}`),
  
  updateStatus: (id, statusData) => 
    api.put(`/orders/${id}/status`, statusData),
  
  updateShipping: (id, shippingData) => 
    api.put(`/orders/${id}/shipping`, shippingData),
  
  addNotes: (id, notesData) => 
    api.put(`/orders/${id}/notes`, notesData),
};



// Payment API calls
export const paymentAPI = {
  createOrder: (orderData) => 
    api.post('/payments/create-order', orderData),
  
  verifyPayment: (paymentData) => 
    api.post('/payments/verify', paymentData),
  
  handleFailure: (failureData) => 
    api.post('/payments/failure', failureData),
  
  getHistory: (params = {}) => 
    api.get('/payments/history', { params }),
  
  refund: (paymentId, refundData) => 
    api.post(`/payments/refund/${paymentId}`, refundData),

  // New payment functions for delivery charges workflow
  createOrderWithDelivery: (orderData) => 
    api.post('/payments/create-order-with-delivery', orderData),
  
  verifyPaymentWithDelivery: (paymentData) => 
    api.post('/payments/verify-payment-with-delivery', paymentData),
};

// User API calls
export const userAPI = {
  getProfile: (id) => 
    api.get(`/users/profile/${id}`),
  
  getMyProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (profileData) => 
    api.put('/users/profile', profileData),
  
  uploadProfileImage: (formData) => 
    api.post('/users/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  changePassword: (passwordData) => 
    api.put('/users/change-password', passwordData),
  
  getFarmerDashboard: () => 
    api.get('/users/farmer/dashboard'),
  
  getBuyerDashboard: () => 
    api.get('/users/buyer/dashboard'),
  
  getRatings: () => 
    api.get('/users/ratings'),
  
  searchUsers: (params = {}) => 
    api.get('/users/search', { params }),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};





export const formatApiResponse = (response) => {
  return response.data;
};

export default api;