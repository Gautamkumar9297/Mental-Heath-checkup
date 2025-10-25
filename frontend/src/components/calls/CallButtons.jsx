import React, { useState } from 'react';
import { Video, Phone, UserCheck, Clock } from 'lucide-react';

const CallButtons = ({ 
  targetUserId, 
  targetUserName, 
  targetUserRole = 'counselor',
  onInitiateCall,
  isOnline = false,
  disabled = false 
}) => {
  const [isInitiating, setIsInitiating] = useState(false);

  const handleCall = async (callType) => {
    if (disabled || isInitiating) return;

    try {
      setIsInitiating(true);
      await onInitiateCall(targetUserId, callType);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
      {/* User status */}
      <div className="flex items-center space-x-2 flex-1">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {targetUserName || 'Counselor'}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {isOnline ? 'Online' : 'Offline'} • {targetUserRole}
          </p>
        </div>
      </div>

      {/* Call buttons */}
      <div className="flex space-x-2">
        {/* Audio call button */}
        <button
          onClick={() => handleCall('audio')}
          disabled={disabled || isInitiating || !isOnline}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            disabled || isInitiating || !isOnline
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
          }`}
          title={isOnline ? 'Start audio call' : 'User is offline'}
        >
          {isInitiating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Phone className="h-5 w-5" />
          )}
        </button>

        {/* Video call button */}
        <button
          onClick={() => handleCall('video')}
          disabled={disabled || isInitiating || !isOnline}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            disabled || isInitiating || !isOnline
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
          }`}
          title={isOnline ? 'Start video call' : 'User is offline'}
        >
          {isInitiating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Status indicators */}
      {!isOnline && (
        <div className="flex items-center text-xs text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          Offline
        </div>
      )}
    </div>
  );
};

export default CallButtons;