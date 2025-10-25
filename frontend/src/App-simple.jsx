import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          🧠 Mental Health Support System
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            ✅ Frontend is Working!
          </h2>
          <p className="text-gray-600 mb-4">
            If you can see this message, your frontend is running correctly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">Next Steps:</h3>
            <ul className="text-green-700 space-y-1">
              <li>✅ Frontend server is running on port 5173</li>
              <li>✅ Vite development server is active</li>
              <li>✅ React components are loading</li>
              <li>✅ Tailwind CSS is working</li>
            </ul>
          </div>
          <div className="mt-6 text-center">
            <a 
              href="/register" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Registration
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;