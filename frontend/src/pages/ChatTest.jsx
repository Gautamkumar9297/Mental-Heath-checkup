import React, { useState } from 'react';
import { chatbotAPI } from '../services/api';

const ChatTest = () => {
  const [status, setStatus] = useState('Ready to test');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const testStartSession = async () => {
    setLoading(true);
    setStatus('Testing start session...');
    
    try {
      console.log('Calling chatbotAPI.startSession(true)...');
      const response = await chatbotAPI.startSession(true);
      console.log('Response:', response);
      
      setSessionId(response.data.data.session.id);
      setStatus(`✅ Success! Session ID: ${response.data.data.session.id}`);
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSendMessage = async () => {
    if (!sessionId) {
      setStatus('❌ Please start a session first');
      return;
    }

    setLoading(true);
    setStatus('Testing send message...');
    
    try {
      console.log('Sending message to session:', sessionId);
      const response = await chatbotAPI.sendMessage(sessionId, 'Hello, this is a test message');
      console.log('Message response:', response);
      
      setStatus(`✅ Message sent! AI Response: ${response.data.data.aiResponse.substring(0, 100)}...`);
    } catch (error) {
      console.error('Message error:', error);
      setStatus(`❌ Message error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat API Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Status:</h3>
            <p className={`text-sm ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
              {status}
            </p>
          </div>

          {sessionId && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700">Current Session:</h3>
              <p className="text-sm text-blue-600 font-mono">{sessionId}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={testStartSession}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test Start Session'}
            </button>

            <button
              onClick={testSendMessage}
              disabled={loading || !sessionId}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test Send Message'}
            </button>
          </div>

          <div className="text-xs text-gray-500">
            <p>Open browser console (F12) to see detailed logs</p>
            <p>Backend URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTest;