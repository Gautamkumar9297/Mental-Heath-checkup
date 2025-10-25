import React from 'react';

const SettingsTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings Test Page</h1>
        <p className="text-gray-600">This is a test settings page to verify routing is working.</p>
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Section</h2>
          <p>If you can see this, the routing to settings is working correctly.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTest;