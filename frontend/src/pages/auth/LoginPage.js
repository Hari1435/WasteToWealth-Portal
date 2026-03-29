import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { Eye, EyeOff, Mail, Lock, Leaf, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const { login } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous login error
    setLoginError('');
    
    if (!validateForm()) return;

    const result = await callWithLoading(
      async () => {
        const loginResult = await login(formData);
        
        if (loginResult.success) {
          // Small delay to show success before redirect
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return loginResult;
      },
      'Signing you in...'
    );
    
    if (result.success) {
      const redirectPath = result.user.userType === 'farmer' 
        ? '/farmer/dashboard' 
        : '/buyer/dashboard';
      navigate(redirectPath, { replace: true });
    } else if (result.requiresVerification) {
      // Redirect to verification pending page
      navigate('/verification-pending', { 
        state: { 
          email: result.email || formData.email 
        }
      });
    } else if (result.error) {
      // Display login error
      setLoginError(result.error);
    }
  };

  // Tractor loading screen is handled by callWithLoading hook

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center responsive-padding">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Leaf size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
          </div>
          <h2 className="mt-6 responsive-subtitle text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 responsive-text-sm text-gray-600">
            Sign in to your Waste2Wealth account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl responsive-padding">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Error Display */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Login Failed
                    </h3>
                    <p className="text-sm text-red-700">
                      {loginError}
                    </p>
                    {loginError.includes('No account found') && (
                      <p className="text-xs text-red-600 mt-2">
                        Don't have an account? <Link to="/register" className="font-medium underline hover:no-underline">Sign up here</Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.email || (loginError && loginError.includes('email')) ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${errors.password || (loginError && loginError.includes('password')) ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button type="button" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/register">
                <Button variant="outline" fullWidth size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-amber-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Need Help?</h3>
          <div className="text-xs text-amber-700 space-y-1">
            <p>• <strong>No account found?</strong> Click "Create Account" to sign up first</p>
            <p>• <strong>Wrong password?</strong> Double-check your password and try again</p>
            <p>• <strong>Account not verified?</strong> Check your email for the OTP verification</p>
            <p>• <strong>Forgot password?</strong> Contact support for assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;