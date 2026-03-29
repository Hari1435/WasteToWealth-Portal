import React from 'react';
import { Check, X } from 'lucide-react';
import { 
  validatePassword, 
  getPasswordStrengthColor, 
  getPasswordStrengthText 
} from '../../utils/passwordValidation';

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  const validation = validatePassword(password);
  const { requirements, strength } = validation;

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-medium ${
            strength === 'strong' ? 'text-green-600' :
            strength === 'good' ? 'text-blue-600' :
            strength === 'fair' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {getPasswordStrengthText(strength)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(strength)}`}
            style={{ 
              width: `${(Object.values(requirements).filter(Boolean).length / Object.keys(requirements).length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
          <div className="space-y-1">
            <RequirementItem 
              met={requirements.minLength} 
              text="At least 8 characters long" 
            />
            <RequirementItem 
              met={requirements.hasUppercase} 
              text="Contains uppercase letter (A-Z)" 
            />
            <RequirementItem 
              met={requirements.hasLowercase} 
              text="Contains lowercase letter (a-z)" 
            />
            <RequirementItem 
              met={requirements.hasNumber} 
              text="Contains number (0-9)" 
            />
            <RequirementItem 
              met={requirements.hasSpecialChar} 
              text="Contains special character (!@#$%^&*)" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const RequirementItem = ({ met, text }) => (
  <div className="flex items-center space-x-2">
    <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
      met ? 'bg-green-100' : 'bg-gray-100'
    }`}>
      {met ? (
        <Check size={12} className="text-green-600" />
      ) : (
        <X size={12} className="text-gray-400" />
      )}
    </div>
    <span className={`text-sm ${met ? 'text-green-700' : 'text-gray-600'}`}>
      {text}
    </span>
  </div>
);

export default PasswordStrengthIndicator;