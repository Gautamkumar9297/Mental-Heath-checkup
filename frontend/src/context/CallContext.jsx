import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WebRTCService from '../services/webrtcService';
import IncomingCallModal from '../components/calls/IncomingCallModal';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const navigate = useNavigate();
  const webrtcService = useRef(new WebRTCService());
  
  // Call states
  const [isInitialized, setIsInitialized] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  const [onlineCounselors, setOnlineCounselors] = useState([]);
  const [userStatuses, setUserStatuses] = useState(new Map());

  // Initialize WebRTC service
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing call service...');
        
        if (!WebRTCService.isSupported()) {
          console.warn('WebRTC not supported in this browser');
          setIsInitialized(false);
          return;
        }

        const success = await webrtcService.current.initializeSocket();
        if (success) {
          setIsInitialized(true);
          setupEventListeners();
          console.log('Call service initialized successfully');
        } else {
          console.warn('Call service failed to initialize - running in offline mode');
          // Still set as initialized for demo purposes
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize call service:', error);
        // Set as initialized with mock data for demo
        setIsInitialized(true);
        setupMockData();
      }
    };

    // Add a small delay to ensure the component renders first
    const timer = setTimeout(() => {
      initialize();
    }, 1000);

    return () => {
      clearTimeout(timer);
      try {
        webrtcService.current?.disconnect();
      } catch (error) {
        console.warn('Error disconnecting WebRTC service:', error);
      }
    };
  }, []);

  // Setup mock data for offline mode
  const setupMockData = () => {
    console.log('Setting up mock counselor data...');
    const mockCounselors = [
      {
        userId: 'counselor-1',
        name: 'Dr. Sarah Johnson',
        role: 'counselor',
        callStatus: 'available',
        specialization: 'Anxiety & Depression',
        connectedAt: new Date()
      },
      {
        userId: 'counselor-2', 
        name: 'Dr. Mike Chen',
        role: 'counselor',
        callStatus: 'available',
        specialization: 'Academic Stress',
        connectedAt: new Date()
      },
      {
        userId: 'counselor-3',
        name: 'Dr. Emily Davis',
        role: 'counselor', 
        callStatus: 'busy',
        specialization: 'Crisis Intervention',
        connectedAt: new Date()
      }
    ];
    setOnlineCounselors(mockCounselors);
  };

  // Setup WebRTC event listeners
  const setupEventListeners = () => {
    const service = webrtcService.current;

    // Incoming call
    service.on('incoming-call', (callData) => {
      console.log('Incoming call:', callData);
      setIncomingCall(callData);
      setCallStatus('ringing');
    });

    // Call accepted
    service.on('call-accepted', (data) => {
      console.log('Call accepted:', data);
      setCallStatus('connecting');
      
      // Navigate to call room
      const callType = currentCall?.callType || 'video';
      navigate(`/call/${callType}/${data.roomId}`);
    });

    // Call rejected
    service.on('call-rejected', (data) => {
      console.log('Call rejected:', data);
      setCallStatus('idle');
      setCurrentCall(null);
      
      // Could show a notification here
      alert('Call was declined');
    });

    // Call failed
    service.on('call-failed', (data) => {
      console.log('Call failed:', data);
      setCallStatus('idle');
      setCurrentCall(null);
      
      const messages = {
        user_offline: 'The user is not online',
        user_busy: 'The user is currently busy'
      };
      
      alert(messages[data.reason] || data.message || 'Call failed');
    });

    // Call ended
    service.on('call-ended', () => {
      console.log('Call ended');
      setCallStatus('idle');
      setCurrentCall(null);
      setIncomingCall(null);
    });

    // Error handling
    service.on('error', (error) => {
      console.error('Call service error:', error);
      
      if (error.type === 'media') {
        alert('Failed to access camera/microphone. Please check your permissions and try again.');
      } else {
        alert(error.message || 'An error occurred during the call');
      }
    });

    // Online counselors list
    service.on('online-counselors-list', (counselors) => {
      setOnlineCounselors(counselors);
    });

    // User status response
    service.on('user-status-response', (statusData) => {
      setUserStatuses(prev => new Map(prev).set(statusData.userId, statusData));
    });
  };

  // Initiate a call
  const initiateCall = async (targetUserId, callType = 'video') => {
    try {
      if (!isInitialized) {
        throw new Error('Call service not initialized');
      }

      if (callStatus !== 'idle') {
        throw new Error('Already in a call or calling');
      }

      console.log(`Initiating ${callType} call to ${targetUserId}`);
      setCallStatus('calling');
      
      // Check if we have a real socket connection
      if (webrtcService.current.socket && webrtcService.current.socket.connected) {
        // Get user media first
        const constraints = callType === 'video' 
          ? { video: true, audio: true }
          : { video: false, audio: true };
          
        await webrtcService.current.getUserMedia(constraints);
        
        // Initiate the call
        const callId = webrtcService.current.initiateCall(targetUserId, callType);
        
        setCurrentCall({
          callId,
          targetUserId,
          callType,
          initiatedAt: new Date()
        });

        console.log(`Real call initiated: ${callId} to ${targetUserId} (${callType})`);
        return callId;
      } else {
        // Demo mode - simulate call
        console.log('Running in demo mode - simulating call...');
        
        const callId = `demo-call-${Date.now()}`;
        setCurrentCall({
          callId,
          targetUserId,
          callType,
          initiatedAt: new Date()
        });
        
        // Simulate incoming call after 2 seconds
        setTimeout(() => {
          const mockCallData = {
            callId,
            from: targetUserId,
            to: 'current-user',
            callType,
            userInfo: {
              name: onlineCounselors.find(c => c.userId === targetUserId)?.name || 'Counselor',
              role: 'counselor'
            }
          };
          
          setIncomingCall(mockCallData);
          setCallStatus('ringing');
        }, 2000);
        
        return callId;
      }

    } catch (error) {
      console.error('Failed to initiate call:', error);
      setCallStatus('idle');
      setCurrentCall(null);
      throw error;
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    try {
      if (!incomingCall) {
        throw new Error('No incoming call to accept');
      }

      // Get user media
      const constraints = incomingCall.callType === 'video'
        ? { video: true, audio: true }
        : { video: false, audio: true };
        
      await webrtcService.current.getUserMedia(constraints);
      
      // Accept the call
      webrtcService.current.acceptCall(incomingCall);
      
      setCallStatus('connecting');
      setCurrentCall({
        callId: incomingCall.callId,
        targetUserId: incomingCall.from,
        callType: incomingCall.callType,
        acceptedAt: new Date()
      });
      
      // Clear incoming call
      setIncomingCall(null);

    } catch (error) {
      console.error('Failed to accept call:', error);
      rejectCall(); // Fall back to rejecting
      throw error;
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      webrtcService.current.rejectCall(incomingCall);
      setIncomingCall(null);
    }
    setCallStatus('idle');
  };

  // End current call
  const endCall = () => {
    webrtcService.current.endCall();
    setCallStatus('idle');
    setCurrentCall(null);
    setIncomingCall(null);
    
    // Navigate away from call room if currently in one
    if (window.location.pathname.includes('/call/')) {
      navigate('/dashboard');
    }
  };

  // Get user status
  const getUserStatus = (userId) => {
    webrtcService.current.socket?.emit('get-user-status', { userId });
    return userStatuses.get(userId);
  };

  // Get online counselors
  const getOnlineCounselors = () => {
    webrtcService.current.socket?.emit('get-online-counselors');
    return onlineCounselors;
  };

  // Check if user is available for calls
  const isUserAvailable = (userId) => {
    const status = userStatuses.get(userId);
    return status?.isOnline && status?.callStatus === 'available';
  };

  const contextValue = {
    // State
    isInitialized,
    callStatus,
    currentCall,
    incomingCall,
    onlineCounselors,
    
    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getUserStatus,
    getOnlineCounselors,
    isUserAvailable,
    
    // WebRTC service instance for advanced use
    webrtcService: webrtcService.current
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
      
      {/* Incoming call modal */}
      <IncomingCallModal
        callData={incomingCall}
        isVisible={!!incomingCall}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    </CallContext.Provider>
  );
};

export default CallProvider;