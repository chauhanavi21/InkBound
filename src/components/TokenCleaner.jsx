import React from 'react';
import { useAuth } from '../context/AuthContext';

const TokenCleaner = () => {
  const { authMessage, forceLogout } = useAuth();

  const clearTokenAndRefresh = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Force logout to reset auth state
    forceLogout('Authentication cleared. Please log in again.');
    
    // Refresh the page to restart the app
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Only show if there's an auth message (indicating token issues)
  if (!authMessage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-3 px-4 z-50">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm mb-2">{authMessage}</p>
        <button
          onClick={clearTokenAndRefresh}
          className="bg-white text-red-600 px-4 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Clear Session & Refresh
        </button>
      </div>
    </div>
  );
};

export default TokenCleaner; 