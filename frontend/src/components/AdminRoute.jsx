import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader, AlertTriangle } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-blue-200">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated at all, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, show access denied
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-red-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-red-500/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <div className="mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
              <p className="text-red-200">
                You don't have administrator privileges to access this area.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start text-left">
                  <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-200">
                    <p className="font-medium mb-1">Administrative Access Required</p>
                    <p>
                      This section is restricted to authorized administrative personnel only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-red-300">
                <p>Currently logged in as: <span className="font-medium">{user?.email || 'Unknown'}</span></p>
                <p>Role: <span className="font-medium">{user?.role || 'Student/Staff'}</span></p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Go Back
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Return to Dashboard
              </button>

              <button
                onClick={() => window.location.href = '/admin/login'}
                className="w-full text-red-300 hover:text-white font-medium py-2 px-4 rounded-lg border border-red-500/50 hover:border-red-400 transition-all duration-200"
              >
                Admin Login
              </button>
            </div>

            <div className="mt-6 text-xs text-red-400">
              <p>If you believe you should have admin access, please contact your system administrator.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and admin, render the protected component
  return children;
};

export default AdminRoute;