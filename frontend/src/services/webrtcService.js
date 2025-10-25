import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { v4 as uuidv4 } from 'uuid';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.roomId = null;
    this.userId = null;
    this.callbacks = {};
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];
  }

  // Event handling
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Initialize socket connection
  async initializeSocket(serverUrl = 'http://localhost:5000') {
    try {
      console.log('Attempting to connect to:', serverUrl);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      console.log('Using auth token for socket connection:', token ? 'present' : 'missing');
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true,
        auth: {
          token: token
        },
        extraHeaders: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      this.userId = localStorage.getItem('userId') || uuidv4();
      console.log('WebRTC Service User ID:', this.userId);
      
      // Socket event handlers
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.emit('socket-ready');
      });
      
      this.socket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
        this.emit('error', { type: 'socket', message: 'Connection failed - running in offline mode' });
      });
      
      this.socket.on('user-joined-call', this.handleUserJoined.bind(this));
      this.socket.on('receive-call-signal', this.handleReceiveSignal.bind(this));
      this.socket.on('user-left-call', this.handleUserLeft.bind(this));
      this.socket.on('call-participants', this.handleParticipants.bind(this));
      this.socket.on('call-error', this.handleError.bind(this));
      this.socket.on('incoming-call', this.handleIncomingCall.bind(this));
      this.socket.on('call-accepted', this.handleCallAccepted.bind(this));
      this.socket.on('call-rejected', this.handleCallRejected.bind(this));

      // Return true immediately - connection will be confirmed via events
      return true;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.emit('error', { type: 'socket', message: 'Failed to connect to server' });
      return false;
    }
  }

  // Get user media (video and/or audio)
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.emit('local-stream', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      this.emit('error', { 
        type: 'media', 
        message: 'Failed to access camera/microphone. Please check permissions.' 
      });
      throw error;
    }
  }

  // Join a call room
  joinRoom(roomId) {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    
    this.roomId = roomId;
    this.socket.emit('join-call-room', { 
      roomId, 
      userId: this.userId,
      userInfo: {
        name: localStorage.getItem('userName') || 'Anonymous',
        role: localStorage.getItem('userRole') || 'student'
      }
    });
  }

  // Create a peer connection
  createPeerConnection(isInitiator = false) {
    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: this.iceServers
      }
    });

    this.peer.on('signal', (signal) => {
      this.socket.emit('send-call-signal', {
        roomId: this.roomId,
        signal,
        to: this.remoteUserId
      });
    });

    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      this.emit('remote-stream', stream);
    });

    this.peer.on('connect', () => {
      this.emit('peer-connected');
    });

    this.peer.on('data', (data) => {
      this.emit('data', JSON.parse(data));
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
      this.emit('error', { type: 'peer', message: 'Connection error occurred' });
    });

    this.peer.on('close', () => {
      this.emit('peer-disconnected');
    });

    this.isInitiator = isInitiator;
    return this.peer;
  }

  // Send data through peer connection
  sendData(data) {
    if (this.peer && this.peer.connected) {
      this.peer.send(JSON.stringify(data));
    }
  }

  // Handle incoming call offer
  handleUserJoined(data) {
    this.remoteUserId = data.userId;
    this.createPeerConnection(true);
    this.emit('user-joined', data);
  }

  // Handle call signaling
  handleReceiveSignal(data) {
    const { signal, from } = data;
    this.remoteUserId = from;

    if (!this.peer) {
      this.createPeerConnection(false);
    }

    this.peer.signal(signal);
    this.emit('signal-received', data);
  }

  // Handle user leaving
  handleUserLeft(data) {
    this.cleanup();
    this.emit('user-left', data);
  }

  // Handle participants list
  handleParticipants(participants) {
    this.emit('participants', participants);
  }

  // Handle errors
  handleError(error) {
    this.emit('error', error);
  }

  // Handle incoming call notification
  handleIncomingCall(data) {
    this.emit('incoming-call', data);
  }

  // Handle call accepted
  handleCallAccepted(data) {
    this.emit('call-accepted', data);
  }

  // Handle call rejected
  handleCallRejected(data) {
    this.emit('call-rejected', data);
  }

  // Initiate a call to another user
  initiateCall(targetUserId, callType = 'video') {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    const callId = uuidv4();
    this.socket.emit('initiate-call', {
      callId,
      from: this.userId,
      to: targetUserId,
      callType,
      userInfo: {
        name: localStorage.getItem('userName') || 'Anonymous',
        role: localStorage.getItem('userRole') || 'student'
      }
    });

    return callId;
  }

  // Accept incoming call
  acceptCall(callData) {
    this.socket.emit('accept-call', {
      callId: callData.callId,
      from: callData.to,
      to: callData.from
    });

    // Join the call room
    this.joinRoom(callData.callId);
  }

  // Reject incoming call
  rejectCall(callData) {
    this.socket.emit('reject-call', {
      callId: callData.callId,
      from: callData.to,
      to: callData.from
    });
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        
        // Notify remote peer about video toggle
        this.sendData({
          type: 'media-toggle',
          mediaType: 'video',
          enabled: videoTrack.enabled
        });
        
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        
        // Notify remote peer about audio toggle
        this.sendData({
          type: 'media-toggle',
          mediaType: 'audio',
          enabled: audioTrack.enabled
        });
        
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Screen sharing
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (this.peer && this.localStream) {
        // Replace video track
        const videoTrack = this.localStream.getVideoTracks()[0];
        const screenTrack = screenStream.getVideoTracks()[0];
        
        await this.peer.replaceTrack(videoTrack, screenTrack, this.localStream);
        
        // Handle screen share end
        screenTrack.onended = () => {
          this.stopScreenShare();
        };

        this.emit('screen-share-started', screenStream);
        return screenStream;
      }
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      this.emit('error', { type: 'screen-share', message: 'Failed to share screen' });
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (this.peer && this.localStream) {
        const videoTrack = newStream.getVideoTracks()[0];
        const currentTrack = this.localStream.getVideoTracks()[0];
        
        await this.peer.replaceTrack(currentTrack, videoTrack, newStream);
        
        // Stop old stream
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = newStream;
        
        this.emit('screen-share-stopped', newStream);
        this.emit('local-stream', newStream);
        return newStream;
      }
    } catch (error) {
      console.error('Failed to stop screen sharing:', error);
      throw error;
    }
  }

  // End call
  endCall() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-call-room', { 
        roomId: this.roomId,
        userId: this.userId 
      });
    }
    
    this.cleanup();
    this.emit('call-ended');
  }

  // Cleanup resources
  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.remoteStream = null;
    this.isInitiator = false;
    this.remoteUserId = null;
  }

  // Disconnect and cleanup everything
  disconnect() {
    this.cleanup();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.callbacks = {};
    this.roomId = null;
  }

  // Get connection statistics
  getConnectionStats() {
    if (this.peer && this.peer._pc) {
      return this.peer._pc.getStats();
    }
    return null;
  }

  // Check if WebRTC is supported
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection
    );
  }
}

export default WebRTCService;