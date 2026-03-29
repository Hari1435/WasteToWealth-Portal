import React from 'react';
import TractorLoader from './TractorLoader';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {/* Brand Name */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Waste2Wealth
          </h2>
          <p className="text-gray-600">Agricultural Waste Marketplace</p>
        </div>
        
        {/* Tractor Animation */}
        <TractorLoader 
          size={280} 
          message={message}
          showMessage={true}
          speed={1.2}
        />
        
        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Connecting farmers and buyers for sustainable agriculture
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;