import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, User } from 'lucide-react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const AudioCallRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [callError, setCallError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);

  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const remoteAnalyserRef = useRef(null);

  // Initialize socket connection and media stream
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        
        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
        setSocket(newSocket);

        // Get user audio only
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        setStream(mediaStream);
        
        // Setup audio level monitoring
        setupAudioLevelMonitoring(mediaStream);

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
        setCallError('Failed to access microphone. Please check permissions.');
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

  const setupAudioLevelMonitoring = (mediaStream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 255) * 100));
        }
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };

  const setupRemoteAudioMonitoring = (remoteStream) => {
    try {
      if (audioContextRef.current && remoteStream) {
        const remoteAnalyser = audioContextRef.current.createAnalyser();
        const remoteSource = audioContextRef.current.createMediaStreamSource(remoteStream);
        
        remoteAnalyser.fftSize = 256;
        remoteSource.connect(remoteAnalyser);
        remoteAnalyserRef.current = remoteAnalyser;

        const updateRemoteAudioLevel = () => {
          if (remoteAnalyserRef.current) {
            const dataArray = new Uint8Array(remoteAnalyserRef.current.frequencyBinCount);
            remoteAnalyserRef.current.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setRemoteAudioLevel(Math.min(100, (average / 255) * 100));
          }
          requestAnimationFrame(updateRemoteAudioLevel);
        };
        
        updateRemoteAudioLevel();
      }
    } catch (error) {
      console.error('Error setting up remote audio monitoring:', error);
    }
  };

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
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        setupRemoteAudioMonitoring(remoteStream);
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
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        setupRemoteAudioMonitoring(remoteStream);
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
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  const handleCallParticipants = (participantsList) => {
    setParticipants(participantsList);
  };

  const handleCallError = (error) => {
    setCallError(error.message);
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

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsSpeakerEnabled(!remoteAudioRef.current.muted);
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
    if (audioContextRef.current) {
      audioContextRef.current.close();
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

  const getAudioLevelColor = (level) => {
    if (level < 20) return 'bg-green-400';
    if (level < 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  if (callError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <PhoneOff className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Call Error</h2>
          <p className="text-gray-600 mb-6">{callError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
          <p className="text-gray-600">Setting up your audio call</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 relative">
      {/* Hidden audio elements */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Audio Call</h1>
          <p className="text-blue-200">Room: {roomId}</p>
          <div className="text-2xl font-mono text-white mt-4">{formatDuration(callDuration)}</div>
        </div>

        {/* Participants */}
        <div className="flex justify-center items-center space-x-8 mb-12">
          {/* Local user */}
          <div className="text-center">
            <div className="relative mb-4">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl transition-all duration-300 ${audioLevel > 5 ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                <User className="h-16 w-16 text-white" />
              </div>
              {/* Audio level indicator */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-150 ${getAudioLevelColor(audioLevel)}`}
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
            <p className="text-white font-medium">You</p>
            <p className="text-blue-200 text-sm">
              {isAudioEnabled ? 'Mic On' : 'Mic Off'}
            </p>
          </div>

          {/* Connection indicator */}
          <div className="flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`} />
            <p className="text-white text-sm mt-2">
              {isConnected ? 'Connected' : 'Waiting...'}
            </p>
          </div>

          {/* Remote user */}
          {remoteStream ? (
            <div className="text-center">
              <div className="relative mb-4">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-2xl transition-all duration-300 ${remoteAudioLevel > 5 ? 'ring-4 ring-white ring-opacity-50' : ''}`}>
                  <User className="h-16 w-16 text-white" />
                </div>
                {/* Remote audio level indicator */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-150 ${getAudioLevelColor(remoteAudioLevel)}`}
                    style={{ width: `${remoteAudioLevel}%` }}
                  />
                </div>
              </div>
              <p className="text-white font-medium">Participant</p>
              <p className="text-purple-200 text-sm">Speaking</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center shadow-2xl">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-400 font-medium mt-4">Waiting for participant</p>
              <p className="text-gray-500 text-sm">Share room ID to connect</p>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isAudioEnabled 
                ? 'bg-white text-blue-600 hover:bg-blue-50' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleSpeaker}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isSpeakerEnabled 
                ? 'bg-white text-blue-600 hover:bg-blue-50' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title={isSpeakerEnabled ? 'Mute speaker' : 'Unmute speaker'}
          >
            {isSpeakerEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>

          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all"
            title="End call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>

        {/* Status */}
        <div className="mt-8 text-center">
          <p className="text-blue-200">
            {participants.length} participant{participants.length !== 1 ? 's' : ''} in call
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioCallRoom;