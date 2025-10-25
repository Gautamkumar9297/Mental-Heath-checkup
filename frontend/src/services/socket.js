import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection', { status: 'error', error });
    });

    // Server event handlers
    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
      this.emit('server_connected', data);
    });

    this.socket.on('session_started', (data) => {
      console.log('Chat session started:', data);
      this.emit('session_started', data);
    });

    this.socket.on('ai_response', (data) => {
      console.log('AI response received:', data);
      this.emit('ai_response', data);
    });

    this.socket.on('crisis_detected', (data) => {
      console.log('Crisis detected:', data);
      this.emit('crisis_detected', data);
    });

    this.socket.on('message_received', (data) => {
      this.emit('message_received', data);
    });

    this.socket.on('session_ended', (data) => {
      console.log('Session ended:', data);
      this.emit('session_ended', data);
    });

    this.socket.on('text_analysis_result', (data) => {
      this.emit('text_analysis_result', data);
    });

    this.socket.on('ai_typing', (data) => {
      this.emit('ai_typing', data);
    });

    this.socket.on('ai_stopped_typing', (data) => {
      this.emit('ai_stopped_typing', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket_error', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Chat methods
  startChatSession() {
    if (this.socket?.connected) {
      this.socket.emit('start_chat_session', {});
    } else {
      throw new Error('Socket not connected');
    }
  }

  sendChatMessage(sessionId, message) {
    if (this.socket?.connected) {
      this.socket.emit('chat_message', {
        sessionId,
        message
      });
    } else {
      throw new Error('Socket not connected');
    }
  }

  endChatSession(sessionId, feedback) {
    if (this.socket?.connected) {
      this.socket.emit('end_chat_session', {
        sessionId,
        feedback
      });
    } else {
      throw new Error('Socket not connected');
    }
  }

  analyzeText(text) {
    if (this.socket?.connected) {
      this.socket.emit('analyze_text', { text });
    } else {
      throw new Error('Socket not connected');
    }
  }

  // Typing indicators
  startTyping(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { sessionId });
    }
  }

  stopTyping(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { sessionId });
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;