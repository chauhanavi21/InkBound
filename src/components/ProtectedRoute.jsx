import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaSignInAlt, FaExclamationTriangle } from 'react-icons/fa';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <FaSignInAlt className="mx-auto text-4xl text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-md transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Authenticated but not admin (when admin is required)
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-2">
            <strong>Hello {user?.username}!</strong>
          </p>
          <p className="text-gray-600 mb-6">
            You don't have administrator privileges to access this page.
            Only admin users can access the admin dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-md transition-colors"
            >
              Back to Homepage
            </button>
            <div className="text-sm text-gray-500">
              Signed in as: {user?.email} (Role: {user?.role})
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin user accessing admin area
  if (requireAdmin && isAdmin()) {
    return (
      <div>
        {/* Admin access confirmation banner */}
        <div className="bg-green-100 border-l-4 border-green-500 p-2">
          <div className="flex items-center">
            <FaShieldAlt className="text-green-500 mr-2" />
            <p className="text-sm text-green-700">
              Admin access granted - Signed in as {user?.username}
            </p>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Regular authenticated user accessing regular content
  return children;
};

export default ProtectedRoute; 