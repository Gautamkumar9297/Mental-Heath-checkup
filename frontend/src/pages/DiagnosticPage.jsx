import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DiagnosticPage = () => {
  const auth = useAuth();
  const [apiStatus, setApiStatus] = useState('checking...');
  const [envVars, setEnvVars] = useState({});
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV
    });

    // Test API connection
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus('✅ API Connected: ' + data.message);
      } else {
        setApiStatus('❌ API Error: ' + response.statusText);
      }
    } catch (error) {
      setApiStatus('❌ API Connection Failed: ' + error.message);
      setErrors(prev => [...prev, 'API Connection: ' + error.message]);
    }
  };

  const testRegistration = async () => {
    try {
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test' + Date.now() + '@example.com',
        password: 'testpassword123',
        phone: '555-0123',
        dateOfBirth: '1990-01-01',
        gender: 'prefer-not-to-say'
      };

      console.log('Testing registration with:', testData);
      const result = await auth.register(testData);
      
      if (result.success) {
        alert('✅ Registration test successful!');
      } else {
        alert('❌ Registration test failed: ' + result.error);
        setErrors(prev => [...prev, 'Registration: ' + result.error]);
      }
    } catch (error) {
      console.error('Registration test error:', error);
      alert('❌ Registration test error: ' + error.message);
      setErrors(prev => [...prev, 'Registration Test: ' + error.message]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">System Diagnostics</h1>

        {/* API Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <p className={`text-lg ${apiStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {apiStatus}
          </p>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-mono text-sm">{key}:</span>
                <span className="font-mono text-sm text-gray-600">
                  {value || 'undefined'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Context Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {auth.loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {auth.user ? JSON.stringify(auth.user, null, 2) : 'None'}</p>
            <p><strong>Error:</strong> {auth.error || 'None'}</p>
            <p><strong>Token:</strong> {auth.token ? 'Present' : 'None'}</p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testApiConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
            >
              Test API Connection
            </button>
            <button
              onClick={testRegistration}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Registration
            </button>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Errors</h2>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="space-x-4">
            <a href="/register" className="text-blue-600 hover:underline">
              Go to Registration Page
            </a>
            <a href="/register-test" className="text-blue-600 hover:underline">
              Go to Registration Test
            </a>
            <a href="/login" className="text-blue-600 hover:underline">
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;