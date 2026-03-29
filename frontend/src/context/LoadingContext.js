import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const updateLoadingMessage = (message) => {
    setLoadingMessage(message);
  };

  const hideLoading = (delay = 0) => {
    if (delay > 0) {
      setTimeout(() => setIsLoading(false), delay);
    } else {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    loadingMessage,
    setIsLoading,
    setLoadingMessage,
    showLoading,
    updateLoadingMessage,
    hideLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;