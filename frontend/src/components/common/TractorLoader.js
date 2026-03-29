import React from 'react';
import Lottie from 'lottie-react';
import tractorAnimation from '../../Animations/TractorLoader.json';

const TractorLoader = ({ 
  size = 200, 
  message = 'Loading...', 
  showMessage = true,
  className = '',
  speed = 1 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Lottie
          animationData={tractorAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
          speed={speed}
        />
      </div>
      
      {showMessage && (
        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-gray-700 mb-2">
            {message}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Full screen tractor loader
export const FullScreenTractorLoader = ({ 
  message = 'Loading...', 
  backgroundColor = 'bg-gradient-to-br from-green-50 to-blue-50' 
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${backgroundColor}`}>
      <TractorLoader 
        size={300} 
        message={message} 
        showMessage={true}
        speed={1.2}
      />
    </div>
  );
};

// Inline tractor loader for smaller spaces
export const InlineTractorLoader = ({ 
  size = 120, 
  message = 'Loading...', 
  showMessage = false 
}) => {
  return (
    <div className="flex items-center justify-center py-8">
      <TractorLoader 
        size={size} 
        message={message} 
        showMessage={showMessage}
        speed={1.5}
      />
    </div>
  );
};

// Card tractor loader for content areas
export const CardTractorLoader = ({ 
  message = 'Loading content...', 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
      <TractorLoader 
        size={150} 
        message={message} 
        showMessage={true}
        speed={1}
      />
    </div>
  );
};

export default TractorLoader;