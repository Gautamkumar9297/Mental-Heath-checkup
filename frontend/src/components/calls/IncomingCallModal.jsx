import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';

const IncomingCallModal = ({ callData, onAccept, onReject, isVisible }) => {
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeoutSeconds(prev => {
        if (prev <= 1) {
          onReject(); // Auto-reject after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onReject]);

  useEffect(() => {
    if (isVisible) {
      setTimeoutSeconds(30); // Reset timeout when modal becomes visible
    }
  }, [isVisible]);

  if (!isVisible || !callData) return null;

  const isVideoCall = callData.callType === 'video';
  const callerName = callData.userInfo?.name || 'Unknown Caller';
  const callerRole = callData.userInfo?.role || 'User';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
      {/* Background blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            {isVideoCall ? (
              <Video className="h-16 w-16 text-blue-600 mx-auto" />
            ) : (
              <Phone className="h-16 w-16 text-green-600 mx-auto" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Incoming {isVideoCall ? 'Video' : 'Audio'} Call
          </h2>
          <p className="text-gray-600">Someone wants to connect with you</p>
        </div>

        {/* Caller info */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{callerName}</h3>
          <p className="text-gray-500 capitalize">{callerRole}</p>
        </div>

        {/* Timeout indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Call timeout in {timeoutSeconds}s
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center space-x-6">
          {/* Reject button */}
          <button
            onClick={onReject}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg"
            title="Decline call"
          >
            <PhoneOff className="h-8 w-8" />
          </button>

          {/* Accept button */}
          <button
            onClick={onAccept}
            className={`w-16 h-16 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg ${
              isVideoCall 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            title={`Accept ${isVideoCall ? 'video' : 'audio'} call`}
          >
            {isVideoCall ? (
              <Video className="h-8 w-8" />
            ) : (
              <Phone className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Call details */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Call ID: {callData.callId?.slice(0, 8)}...</p>
            <p>Type: {isVideoCall ? 'Video Call' : 'Audio Call'}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default IncomingCallModal;