import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Key,
  Loader,
  AlertCircle,
  LogIn,
  ArrowRight,
  Users,
  BarChart3
} from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, isAuthenticated, isAdmin, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    } else if (isAuthenticated && !isAdmin) {
      navigate('/'); // Redirect regular users to dashboard
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.adminKey.trim()) {
      errors.adminKey = 'Admin access key is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await adminLogin(
        formData.email.trim().toLowerCase(), 
        formData.password,
        formData.adminKey.trim()
      );
      
      if (result.success) {
        console.log('Admin login successful');
        // User will be redirected by useEffect
      }
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-blue-200">Secure access to administrative dashboard</p>
          </div>

          {/* Admin Login Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-300 mr-3" />
                <div>
                  <p className="text-red-200 font-medium">Authentication Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Admin Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white/20 border backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-blue-200 ${
                      formErrors.email ? 'border-red-400' : 'border-white/30'
                    }`}
                    placeholder="Enter admin email address"
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white/20 border backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-blue-200 ${
                      formErrors.password ? 'border-red-400' : 'border-white/30'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Admin Key Field */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Admin Access Key *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    name="adminKey"
                    value={formData.adminKey}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white/20 border backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-blue-200 ${
                      formErrors.adminKey ? 'border-red-400' : 'border-white/30'
                    }`}
                    placeholder="Enter admin access key"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100"
                  >
                    {showAdminKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.adminKey && (
                  <p className="text-red-300 text-sm mt-1">{formErrors.adminKey}</p>
                )}
                <p className="text-xs text-blue-300 mt-1">
                  Contact IT administrator if you don't have an access key
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Access Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Development Info */}
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-start">
                <AlertCircle className="w-5 w-5 text-green-300 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-200">
                  <p className="font-medium mb-2">✅ Development Mode Active</p>
                  <div className="space-y-1">
                    <p><strong>Quick Login:</strong></p>
                    <p>• Email: admin@test.com</p>
                    <p>• Password: password123</p>
                    <p>• Admin Key: admin123</p>
                  </div>
                  <p className="mt-2 text-xs text-green-300">
                    Or use any email containing "admin" with key "admin123"
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      email: 'admin@test.com',
                      password: 'password123',
                      adminKey: 'admin123'
                    })}
                    className="mt-2 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Fill Demo Credentials
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <p className="text-blue-200">
              Regular user?{' '}
              <Link
                to="/login"
                className="text-blue-300 hover:text-white font-medium transition-colors underline"
              >
                Student/Staff Login
              </Link>
            </p>
          </div>

          {/* Admin Features Preview */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 text-center">
              <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <p className="text-sm text-blue-100 font-medium">User Management</p>
              <p className="text-xs text-blue-300">Monitor student wellbeing</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 text-center">
              <BarChart3 className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <p className="text-sm text-blue-100 font-medium">Analytics Dashboard</p>
              <p className="text-xs text-blue-300">Comprehensive insights</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 mt-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-100">
                <p className="font-medium mb-1">Secure Access</p>
                <p>
                  All admin sessions are encrypted and monitored for security compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;