// Password validation utilities for frontend
export const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
};

export const validatePassword = (password) => {
  const errors = [];
  const requirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, requirements };
  }

  // Check minimum length
  if (password.length >= passwordRequirements.minLength) {
    requirements.minLength = true;
  } else {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters long`);
  }

  // Check for uppercase letter
  if (/[A-Z]/.test(password)) {
    requirements.hasUppercase = true;
  } else {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (/[a-z]/.test(password)) {
    requirements.hasLowercase = true;
  } else {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (/\d/.test(password)) {
    requirements.hasNumber = true;
  } else {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    requirements.hasSpecialChar = true;
  } else {
    errors.push('Password must contain at least one special character');
  }

  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    requirements,
    strength: calculatePasswordStrength(requirements)
  };
};

export const calculatePasswordStrength = (requirements) => {
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  if (metRequirements === 0) return 'very-weak';
  if (metRequirements <= 2) return 'weak';
  if (metRequirements <= 3) return 'fair';
  if (metRequirements <= 4) return 'good';
  return 'strong';
};

export const getPasswordStrengthColor = (strength) => {
  const colors = {
    'very-weak': 'bg-red-500',
    'weak': 'bg-red-400',
    'fair': 'bg-yellow-400',
    'good': 'bg-blue-400',
    'strong': 'bg-green-500'
  };
  return colors[strength] || 'bg-gray-300';
};

export const getPasswordStrengthText = (strength) => {
  const texts = {
    'very-weak': 'Very Weak',
    'weak': 'Weak',
    'fair': 'Fair',
    'good': 'Good',
    'strong': 'Strong'
  };
  return texts[strength] || 'Unknown';
};