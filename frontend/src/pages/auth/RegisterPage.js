import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApiWithLoading } from '../../hooks/useApiWithLoading';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Leaf,
  Building,
  Tractor
} from 'lucide-react';
import Button from '../../components/common/Button';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';
import AddressInput from '../../components/common/AddressInput';
import { validatePassword } from '../../utils/passwordValidation';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      formatted: '',
      lat: null,
      lng: null
    },
    farmDetails: {
      farmSize: '',
      cropTypes: [],
      farmingExperience: ''
    },
    companyDetails: {
      companyName: '',
      companyType: '',
      gstNumber: '',
      licenseNumber: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const { callWithLoading } = useApiWithLoading();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCropTypesChange = (e) => {
    const value = e.target.value;
    const cropTypes = value.split(',').map(crop => crop.trim()).filter(crop => crop);
    setFormData(prev => ({
      ...prev,
      farmDetails: {
        ...prev.farmDetails,
        cropTypes
      }
    }));
  };

  const handleLocationChange = (newAddress) => {
    setFormData(prev => ({
      ...prev,
      address: newAddress
    }));

    // Clear address-related errors when user updates location
    const addressErrors = ['address.city', 'address.state', 'address.pincode', 'address.street'];
    const clearedErrors = { ...errors };
    addressErrors.forEach(key => {
      if (clearedErrors[key]) {
        delete clearedErrors[key];
      }
    });
    setErrors(clearedErrors);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Enhanced password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]; // Show first error
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Address validation
    if (!formData.address.city) newErrors['address.city'] = 'City is required';
    if (!formData.address.state) newErrors['address.state'] = 'State is required';
    if (!formData.address.pincode) {
      newErrors['address.pincode'] = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    if (userType === 'farmer') {
      if (!formData.farmDetails.farmSize) newErrors['farmDetails.farmSize'] = 'Farm size is required';
      if (formData.farmDetails.cropTypes.length === 0) newErrors['farmDetails.cropTypes'] = 'At least one crop type is required';
    }

    if (userType === 'buyer') {
      if (!formData.companyDetails.companyName) newErrors['companyDetails.companyName'] = 'Company name is required';
      if (!formData.companyDetails.companyType) newErrors['companyDetails.companyType'] = 'Company type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    const result = await callWithLoading(
      async () => {
        const registerResult = await register(formData, userType);
        
        if (registerResult.success) {
          // Small delay to show success before redirect
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return registerResult;
      },
      'Creating your account...'
    );
    
    if (result.success && result.requiresVerification) {
      // Redirect to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          otpSent: result.otpSent 
        },
        replace: true 
      });
    } else if (result.success) {
      // Fallback - shouldn't happen with new flow but just in case
      const redirectPath = userType === 'farmer' 
        ? '/farmer/dashboard' 
        : '/buyer/dashboard';
      navigate(redirectPath, { replace: true });
    }
  };

  const renderUserTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="responsive-subtitle text-gray-900 mb-2">
          Choose Your Account Type
        </h2>
        <p className="responsive-text-sm text-gray-600">
          Select how you want to use Waste2Wealth
        </p>
      </div>

      <div className="responsive-grid-2 responsive-gap">
        <button
          type="button"
          onClick={() => setUserType('farmer')}
          className={`responsive-padding-sm rounded-lg border-2 transition-all ${
            userType === 'farmer'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-center space-y-3">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center ${
              userType === 'farmer' ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Tractor size={24} className={`${userType === 'farmer' ? 'text-primary-600' : 'text-gray-600'} sm:w-8 sm:h-8`} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">I'm a Farmer</h3>
            <p className="responsive-text-sm text-gray-600">
              I want to sell my agricultural waste and earn extra income
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setUserType('buyer')}
          className={`responsive-padding-sm rounded-lg border-2 transition-all ${
            userType === 'buyer'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-center space-y-3">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center ${
              userType === 'buyer' ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Building size={24} className={`${userType === 'buyer' ? 'text-primary-600' : 'text-gray-600'} sm:w-8 sm:h-8`} />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">I'm a Buyer</h3>
            <p className="responsive-text-sm text-gray-600">
              I want to purchase agricultural waste for my business
            </p>
          </div>
        </button>
      </div>

      {userType && (
        <Button
          onClick={handleNext}
          fullWidth
          size="lg"
        >
          Continue as {userType === 'farmer' ? 'Farmer' : 'Buyer'}
        </Button>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="responsive-subtitle text-gray-900 mb-2">
          Create Your Account
        </h2>
        <p className="responsive-text-sm text-gray-600">
          Enter your basic information
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`input-field pl-10 ${errors.name ? 'border-red-300' : ''}`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`input-field pl-10 ${errors.email ? 'border-red-300' : ''}`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className={`input-field pl-10 ${errors.phone ? 'border-red-300' : ''}`}
              placeholder="+91 98765 43210"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          
          {/* Password Strength Indicator */}
          <PasswordStrengthIndicator 
            password={formData.password} 
            showRequirements={true}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      <Button onClick={handleNext} fullWidth size="lg">
        Next Step
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="responsive-subtitle text-gray-900 mb-2">
          Additional Information
        </h2>
        <p className="responsive-text-sm text-gray-600">
          Tell us more about yourself
        </p>
      </div>

      {/* Address with Location Services */}
      <AddressInput
        address={formData.address}
        onAddressChange={handleLocationChange}
        errors={{
          city: errors['address.city'],
          state: errors['address.state'],
          pincode: errors['address.pincode'],
          street: errors['address.street']
        }}
      />

      {/* Role-specific fields */}
      {userType === 'farmer' && (
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Farm Details</h3>
          
          <div className="responsive-form-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size (acres)</label>
              <input
                name="farmDetails.farmSize"
                type="number"
                value={formData.farmDetails.farmSize}
                onChange={handleInputChange}
                className={`input-field ${errors['farmDetails.farmSize'] ? 'border-red-300' : ''}`}
                placeholder="Enter farm size"
              />
              {errors['farmDetails.farmSize'] && <p className="mt-1 text-sm text-red-600">{errors['farmDetails.farmSize']}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farming Experience (years)</label>
              <input
                name="farmDetails.farmingExperience"
                type="number"
                value={formData.farmDetails.farmingExperience}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Years of experience"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Types</label>
            <input
              type="text"
              onChange={handleCropTypesChange}
              className={`input-field ${errors['farmDetails.cropTypes'] ? 'border-red-300' : ''}`}
              placeholder="Enter crop types (comma separated): rice, wheat, corn"
            />
            {errors['farmDetails.cropTypes'] && <p className="mt-1 text-sm text-red-600">{errors['farmDetails.cropTypes']}</p>}
          </div>
        </div>
      )}

      {userType === 'buyer' && (
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Company Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              name="companyDetails.companyName"
              type="text"
              value={formData.companyDetails.companyName}
              onChange={handleInputChange}
              className={`input-field ${errors['companyDetails.companyName'] ? 'border-red-300' : ''}`}
              placeholder="Enter company name"
            />
            {errors['companyDetails.companyName'] && <p className="mt-1 text-sm text-red-600">{errors['companyDetails.companyName']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Type</label>
            <select
              name="companyDetails.companyType"
              value={formData.companyDetails.companyType}
              onChange={handleInputChange}
              className={`input-field ${errors['companyDetails.companyType'] ? 'border-red-300' : ''}`}
            >
              <option value="">Select company type</option>
              <option value="fertilizer">Fertilizer Company</option>
              <option value="biogas">Biogas Company</option>
              <option value="compost">Compost Company</option>
              <option value="paper">Paper And Pulp Industry</option>
              <option value="construction">Construction Industry</option>
              <option value="animal">Animal Feed Industry</option>
              <option value="textile">Textile Industry</option>
              <option value="other">Other</option>
            </select>
            {errors['companyDetails.companyType'] && <p className="mt-1 text-sm text-red-600">{errors['companyDetails.companyType']}</p>}
          </div>

          <div className="responsive-form-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
              <input
                name="companyDetails.gstNumber"
                type="text"
                value={formData.companyDetails.gstNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter GST number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input
                name="companyDetails.licenseNumber"
                type="text"
                value={formData.companyDetails.licenseNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter license number"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          fullWidth
          size="lg"
        >
          Back
        </Button>
        <Button
          type="submit"
          fullWidth
          size="lg"
        >
          Create Account
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center responsive-padding">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Leaf size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
          </div>
          <h1 className="mt-6 responsive-subtitle text-gray-900">
            Join Waste2Wealth
          </h1>
          <p className="mt-2 responsive-text-sm text-gray-600">
            Start your journey towards sustainable agriculture
          </p>
        </div>

        {/* Progress Indicator */}
        {userType && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Basic Info</span>
              <span>Additional Details</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!userType && renderUserTypeSelection()}
          {userType && step === 1 && renderStep1()}
          {userType && step === 2 && renderStep2()}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Registration Help:</h3>
          <div className="text-xs text-green-700 space-y-1">
            <p>• <strong>Account exists?</strong> You'll see a message to login instead</p>
            <p>• <strong>Choose wisely:</strong> Select Farmer to sell waste, Buyer to purchase</p>
            <p>• <strong>Secure signup:</strong> Your information is encrypted and protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;