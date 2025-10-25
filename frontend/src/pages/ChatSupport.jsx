import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatSupport = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <MessageCircle className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-secondary-900">AI Chat Support</h1>
      </div>
      <div className="card">
        <p>24/7 AI-powered mental health chat support coming soon...</p>
        <p className="mt-4 text-secondary-600">
          This will feature sentiment analysis, crisis detection, and coping strategies.
        </p>
      </div>
    </div>
  );
};

export default ChatSupport;