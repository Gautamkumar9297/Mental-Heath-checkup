import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import VideoCallRoom from '../components/calls/VideoCallRoom';
import AudioCallRoom from '../components/calls/AudioCallRoom';
import { useCall } from '../context/CallContext';

const CallPage = () => {
  const { callType, roomId } = useParams();
  const { callStatus, currentCall } = useCall();

  // Validate call type
  if (!['video', 'audio'].includes(callType)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validate room ID
  if (!roomId) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user should be in a call
  useEffect(() => {
    if (callStatus === 'idle' && !currentCall) {
      console.warn('User accessed call page without active call');
      // Could redirect to dashboard after a delay to allow for initialization
    }
  }, [callStatus, currentCall]);

  // Render appropriate call component
  if (callType === 'video') {
    return <VideoCallRoom />;
  } else {
    return <AudioCallRoom />;
  }
};

export default CallPage;