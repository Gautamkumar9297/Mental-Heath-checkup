import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, Settings } from 'lucide-react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import CallControls from './CallControls';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callError, setCallError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize socket connection and media stream
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        
        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
        setSocket(newSocket);

        // Get user media
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        // Join the room
        newSocket.emit('join-call-room', { roomId, userId: localStorage.getItem('userId') });

        // Handle socket events
        newSocket.on('user-joined-call', handleUserJoined);
        newSocket.on('receive-call-signal', handleReceiveCallSignal);
        newSocket.on('user-left-call', handleUserLeft);
        newSocket.on('call-participants', handleCallParticipants);
        newSocket.on('call-error', handleCallError);

        setIsConnecting(false);
      } catch (error) {
        console.error('Error initializing call:', error);
        setCallError('Failed to access camera/microphone. Please check permissions.');
        setIsConnecting(false);
      }
    };

    initializeCall();

    return () => {
      cleanup();
    };
  }, [roomId]);

  // Start call duration timer
  useEffect(() => {
    if (isConnected && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  const handleUserJoined = (data) => {
    const { userId, signal } = data;
    
    if (!peer && stream) {
      // Create peer as caller
      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });

      newPeer.on('signal', (signalData) => {
        socket.emit('send-call-signal', {
          roomId,
          signal: signalData,
          to: userId
        });
      });

      newPeer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
      });

      newPeer.on('connect', () => {
        console.log('Peer connection established');
        setIsConnected(true);
      });

      newPeer.on('error', (error) => {
        console.error('Peer error:', error);
        setCallError('Connection error occurred');
      });

      setPeer(newPeer);
    }
  };

  const handleReceiveCallSignal = (data) => {
    const { signal, from } = data;

    if (!peer && stream) {
      // Create peer as receiver
      const newPeer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
      });

      newPeer.on('signal', (signalData) => {
        socket.emit('send-call-signal', {
          roomId,
          signal: signalData,
          to: from
        });
      });

      newPeer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
      });

      newPeer.on('connect', () => {
        console.log('Peer connection established');
        setIsConnected(true);
      });

      newPeer.on('error', (error) => {
        console.error('Peer error:', error);
        setCallError('Connection error occurred');
      });

      newPeer.signal(signal);
      setPeer(newPeer);
    } else if (peer) {
      peer.signal(signal);
    }
  };

  const handleUserLeft = (data) => {
    setIsConnected(false);
    setRemoteStream(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const handleCallParticipants = (participantsList) => {
    setParticipants(participantsList);
  };

  const handleCallError = (error) => {
    setCallError(error.message);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (peer && stream) {
          // Replace video track with screen share
          const videoTrack = stream.getVideoTracks()[0];
          const screenTrack = screenStream.getVideoTracks()[0];
          
          peer.replaceTrack(videoTrack, screenTrack, stream);
          
          // Update local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          setIsScreenSharing(true);
          
          // Handle screen share end
          screenTrack.onended = () => {
            stopScreenShare();
          };
        }
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      setCallError('Failed to share screen');
    }
  };

  const stopScreenShare = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (peer && stream) {
        const videoTrack = newStream.getVideoTracks()[0];
        const currentTrack = stream.getVideoTracks()[0];
        
        peer.replaceTrack(currentTrack, videoTrack, newStream);
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
        
        setStream(newStream);
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  const endCall = () => {
    cleanup();
    navigate('/dashboard');
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    if (socket) {
      socket.emit('leave-call-room', { roomId });
      socket.disconnect();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <PhoneOff className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Call Error</h2>
          <p className="text-gray-600 mb-6">{callError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
          <p className="text-gray-600">Setting up your call</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex justify-between items-center text-white">
          <div>
            <h1 className="text-xl font-semibold">Video Call</h1>
            <p className="text-sm text-gray-300">Room: {roomId}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono">{formatDuration(callDuration)}</p>
            <p className="text-sm text-gray-300">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Main video area */}
      <div className="h-screen relative">
        {/* Remote video (full screen) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <Video className="h-24 w-24 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-2">Waiting for participant</h2>
              <p className="text-gray-400">Share the room ID with others to join</p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-20 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Call controls */}
      <CallControls
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isScreenSharing={isScreenSharing}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={endCall}
      />
    </div>
  );
};

export default VideoCallRoom;