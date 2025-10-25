const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const User = require('../models/User');
const chatbotService = require('../services/chatbotService');
const nlpService = require('../services/nlpService');

// Store active connections
const activeConnections = new Map();
const activeCallRooms = new Map(); // roomId -> { participants: [], callType: 'video'|'audio', startTime: Date }
const userCallStatus = new Map(); // userId -> { status: 'available'|'busy'|'in_call', currentCallId: string }

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected (${socket.userId})`);

    // Store active connection
    activeConnections.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date(),
      activeSessions: new Set()
    });

    // Initialize user call status
    if (!userCallStatus.has(socket.userId)) {
      userCallStatus.set(socket.userId, {
        status: 'available',
        currentCallId: null,
        lastActivity: new Date()
      });
    } else {
      // Update existing status to available if not in call
      const callStatus = userCallStatus.get(socket.userId);
      if (callStatus.status !== 'in_call') {
        callStatus.status = 'available';
        callStatus.lastActivity = new Date();
      }
    }

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join counselors to counselor room for crisis alerts
    if (socket.user.role === 'counselor' || socket.user.role === 'admin') {
      socket.join('counselors');
    }

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to Mental Health Support System',
      user: {
        id: socket.user._id,
        name: socket.user.name,
        riskLevel: socket.user.riskLevel
      },
      timestamp: new Date().toISOString()
    });

    // Handle starting a new chat session
    socket.on('start_chat_session', async (data) => {
      try {
        console.log(`Starting chat session for user ${socket.userId}`);

        // Get user context for personalized greeting
        const userContext = {
          riskLevel: socket.user.riskLevel,
          hasActiveSession: activeConnections.get(socket.userId)?.activeSessions.size > 0
        };

        // Create new session in database
        const sessionData = {
          user: socket.userId,
          sessionType: 'ai_chatbot',
          title: 'Real-time AI Mental Health Support',
          description: 'Live conversation with MindBot AI assistant',
          status: 'active',
          priority: socket.user.riskLevel === 'critical' ? 'emergency' : 
                   socket.user.riskLevel === 'high' ? 'high' : 'normal',
          aiModel: {
            name: 'MindBot',
            version: '1.0',
            specialization: 'general'
          }
        };

        const session = new Session(sessionData);
        
        // Add initial greeting
        const greeting = chatbotService.getConversationStarter(userContext);
        session.messages.push({
          sender: 'ai',
          senderInfo: {
            name: 'MindBot',
            role: 'AI Mental Health Assistant'
          },
          content: greeting,
          messageType: 'text',
          timestamp: new Date()
        });

        await session.save();

        // Join session room
        socket.join(`session_${session._id}`);
        activeConnections.get(socket.userId).activeSessions.add(session._id.toString());

        // Emit session started event
        socket.emit('session_started', {
          sessionId: session._id,
          greeting: greeting,
          timestamp: new Date().toISOString()
        });

        console.log(`Chat session ${session._id} started for user ${socket.userId}`);

      } catch (error) {
        console.error('Error starting chat session:', error);
        socket.emit('error', {
          type: 'session_start_error',
          message: 'Failed to start chat session',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        const { sessionId, message } = data;

        if (!sessionId || !message || typeof message !== 'string') {
          socket.emit('error', {
            type: 'invalid_message',
            message: 'Session ID and message content are required'
          });
          return;
        }

        console.log(`Processing message in session ${sessionId} from user ${socket.userId}`);

        // Find the session
        const session = await Session.findOne({
          _id: sessionId,
          user: socket.userId,
          sessionType: 'ai_chatbot'
        });

        if (!session) {
          socket.emit('error', {
            type: 'session_not_found',
            message: 'Chat session not found'
          });
          return;
        }

        // Add user message to session
        const userMessage = {
          sender: 'user',
          content: message.trim(),
          messageType: 'text',
          timestamp: new Date()
        };

        session.messages.push(userMessage);

        // Emit user message to session room
        io.to(`session_${sessionId}`).emit('message_received', {
          sessionId,
          message: userMessage,
          timestamp: new Date().toISOString()
        });

        // Show typing indicator
        socket.to(`session_${sessionId}`).emit('ai_typing', { sessionId });

        // Get conversation history
        const conversationHistory = session.messages.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp
        }));

        // Generate AI response
        const aiResponse = await chatbotService.generateResponse(
          message,
          conversationHistory.slice(0, -1), // Exclude current message
          {
            userRiskLevel: socket.user.riskLevel,
            sessionId: sessionId,
            realTime: true
          }
        );

        // Add AI response to session
        const aiMessage = {
          sender: 'ai',
          senderInfo: {
            name: 'MindBot',
            role: 'AI Mental Health Assistant'
          },
          content: aiResponse.message,
          messageType: 'text',
          timestamp: new Date(),
          sentiment: aiResponse.nlpAnalysis?.sentiment?.sentiment
        };

        session.messages.push(aiMessage);

        // Update session analysis and crisis detection
        if (aiResponse.requiresHumanIntervention) {
          session.priority = 'critical';
          session.crisisFlags.isCrisis = true;
          session.crisisFlags.crisisType = aiResponse.nlpAnalysis.crisis.indicators.some(i => i.includes('suicide')) ? 'suicidal' : 'self_harm';
          
          // Update user risk level
          if (socket.user.riskLevel !== 'critical') {
            await User.findByIdAndUpdate(socket.userId, {
              riskLevel: aiResponse.nlpAnalysis.crisis.riskLevel === 'critical' ? 'critical' : 'high'
            });
          }
        }

        // Add analysis data to session
        if (aiResponse.nlpAnalysis) {
          session.aiAnalysis = {
            sentimentTrend: [{
              timestamp: new Date(),
              sentiment: aiResponse.nlpAnalysis.sentiment.sentiment,
              confidence: aiResponse.nlpAnalysis.sentiment.confidence
            }],
            keyTopics: aiResponse.nlpAnalysis.themes,
            emotionalState: {
              dominantEmotion: aiResponse.nlpAnalysis.emotions[0]?.emotion || 'neutral',
              intensity: aiResponse.nlpAnalysis.emotions[0]?.confidence || 0,
              stability: aiResponse.context.supportLevel
            },
            riskAssessment: {
              level: aiResponse.nlpAnalysis.crisis.riskLevel,
              indicators: aiResponse.nlpAnalysis.crisis.indicators,
              confidence: aiResponse.nlpAnalysis.crisis.confidence
            }
          };
        }

        await session.save();

        // Stop typing indicator
        socket.to(`session_${sessionId}`).emit('ai_stopped_typing', { sessionId });

        // Emit AI response
        io.to(`session_${sessionId}`).emit('ai_response', {
          sessionId,
          message: aiMessage,
          analysis: {
            sentiment: aiResponse.nlpAnalysis?.sentiment,
            emotions: aiResponse.nlpAnalysis?.emotions,
            supportLevel: aiResponse.context?.supportLevel,
            requiresAttention: aiResponse.requiresHumanIntervention
          },
          suggestions: {
            copingStrategies: aiResponse.nlpAnalysis ? chatbotService.getCopingStrategies(aiResponse.nlpAnalysis.emotions) : [],
            recommendedActions: aiResponse.nlpAnalysis?.overallAssessment?.recommendedActions
          },
          timestamp: new Date().toISOString()
        });

        // If crisis detected, emit special alert
        if (aiResponse.requiresHumanIntervention) {
          socket.emit('crisis_detected', {
            sessionId,
            riskLevel: aiResponse.nlpAnalysis.crisis.riskLevel,
            indicators: aiResponse.nlpAnalysis.crisis.indicators,
            message: 'We\'re concerned about you and want to help. Please consider reaching out to a crisis counselor.',
            resources: {
              crisis_text_line: 'Text HOME to 741741',
              suicide_prevention_lifeline: '988',
              emergency_services: '911'
            },
            timestamp: new Date().toISOString()
          });

          // Notify counselors/admins (if they exist)
          io.to('counselors').emit('user_crisis_alert', {
            userId: socket.userId,
            userName: socket.user.name,
            sessionId,
            riskLevel: aiResponse.nlpAnalysis.crisis.riskLevel,
            indicators: aiResponse.nlpAnalysis.crisis.indicators,
            timestamp: new Date().toISOString()
          });
        }

        console.log(`AI response sent for session ${sessionId}`);

      } catch (error) {
        console.error('Error processing chat message:', error);
        socket.emit('error', {
          type: 'message_processing_error',
          message: 'Failed to process your message',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    // Handle ending a chat session
    socket.on('end_chat_session', async (data) => {
      try {
        const { sessionId, feedback } = data;

        const session = await Session.findOne({
          _id: sessionId,
          user: socket.userId
        });

        if (!session) {
          socket.emit('error', {
            type: 'session_not_found',
            message: 'Session not found'
          });
          return;
        }

        // End the session
        const outcomes = {
          userSatisfaction: feedback?.satisfaction,
          effectivenessRating: feedback?.effectiveness,
          goalAchieved: feedback?.helpful
        };

        await session.endSession(outcomes);

        // Add closing message
        const closingMessage = "Thank you for talking with me today. Take care! 💙";
        session.messages.push({
          sender: 'ai',
          senderInfo: {
            name: 'MindBot',
            role: 'AI Mental Health Assistant'
          },
          content: closingMessage,
          messageType: 'text',
          timestamp: new Date()
        });

        await session.save();

        // Leave session room
        socket.leave(`session_${sessionId}`);
        activeConnections.get(socket.userId)?.activeSessions.delete(sessionId);

        // Emit session ended event
        socket.emit('session_ended', {
          sessionId,
          duration: session.duration,
          messageCount: session.messages.length,
          feedback: outcomes,
          timestamp: new Date().toISOString()
        });

        console.log(`Chat session ${sessionId} ended for user ${socket.userId}`);

      } catch (error) {
        console.error('Error ending chat session:', error);
        socket.emit('error', {
          type: 'session_end_error',
          message: 'Failed to end session properly',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    // Handle quick NLP analysis requests
    socket.on('analyze_text', async (data) => {
      try {
        const { text } = data;

        if (!text || typeof text !== 'string') {
          socket.emit('error', {
            type: 'invalid_text',
            message: 'Text content is required for analysis'
          });
          return;
        }

        const analysis = nlpService.analyzeText(text);

        socket.emit('text_analysis_result', {
          analysis: {
            sentiment: analysis.sentiment,
            emotions: analysis.emotions,
            crisis: analysis.crisis,
            themes: analysis.themes,
            copingMechanisms: analysis.copingMechanisms,
            overallAssessment: analysis.overallAssessment
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error analyzing text:', error);
        socket.emit('error', {
          type: 'analysis_error',
          message: 'Failed to analyze text',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    // Handle user typing indicators
    socket.on('typing', (data) => {
      const { sessionId } = data;
      socket.to(`session_${sessionId}`).emit('user_typing', {
        sessionId,
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('stop_typing', (data) => {
      const { sessionId } = data;
      socket.to(`session_${sessionId}`).emit('user_stopped_typing', {
        sessionId,
        userId: socket.userId
      });
    });

    // ===== VIDEO/AUDIO CALL HANDLERS =====

    // Handle call initiation
    socket.on('initiate-call', (data) => {
      try {
        const { callId, to, callType, userInfo } = data;
        
        // Check if target user is online and available
        const targetConnection = activeConnections.get(to);
        const targetCallStatus = userCallStatus.get(to);
        
        if (!targetConnection) {
          socket.emit('call-failed', {
            callId,
            reason: 'user_offline',
            message: 'User is not online'
          });
          return;
        }
        
        if (targetCallStatus && targetCallStatus.status !== 'available') {
          socket.emit('call-failed', {
            callId,
            reason: 'user_busy',
            message: 'User is currently busy'
          });
          return;
        }
        
        // Update caller status
        userCallStatus.set(socket.userId, {
          status: 'busy',
          currentCallId: callId,
          lastActivity: new Date()
        });
        
        // Send incoming call to target user
        io.to(`user_${to}`).emit('incoming-call', {
          callId,
          from: socket.userId,
          to,
          callType,
          userInfo: {
            name: socket.user.name,
            role: socket.user.role || 'user',
            id: socket.userId
          },
          timestamp: new Date().toISOString()
        });
        
        console.log(`Call initiated: ${callId} from ${socket.userId} to ${to} (${callType})`);
        
      } catch (error) {
        console.error('Error initiating call:', error);
        socket.emit('call-error', {
          type: 'initiation_error',
          message: 'Failed to initiate call'
        });
      }
    });
    
    // Handle call acceptance
    socket.on('accept-call', (data) => {
      try {
        const { callId, from, to } = data;
        
        // Update both users' call status
        userCallStatus.set(socket.userId, {
          status: 'in_call',
          currentCallId: callId,
          lastActivity: new Date()
        });
        
        userCallStatus.set(from, {
          status: 'in_call',
          currentCallId: callId,
          lastActivity: new Date()
        });
        
        // Notify caller that call was accepted
        io.to(`user_${from}`).emit('call-accepted', {
          callId,
          by: socket.userId,
          roomId: callId, // Use callId as roomId
          timestamp: new Date().toISOString()
        });
        
        console.log(`Call accepted: ${callId} by ${socket.userId}`);
        
      } catch (error) {
        console.error('Error accepting call:', error);
        socket.emit('call-error', {
          type: 'accept_error',
          message: 'Failed to accept call'
        });
      }
    });
    
    // Handle call rejection
    socket.on('reject-call', (data) => {
      try {
        const { callId, from, to } = data;
        
        // Reset caller's status
        userCallStatus.set(from, {
          status: 'available',
          currentCallId: null,
          lastActivity: new Date()
        });
        
        // Notify caller that call was rejected
        io.to(`user_${from}`).emit('call-rejected', {
          callId,
          by: socket.userId,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Call rejected: ${callId} by ${socket.userId}`);
        
      } catch (error) {
        console.error('Error rejecting call:', error);
      }
    });
    
    // Handle joining call room
    socket.on('join-call-room', (data) => {
      try {
        const { roomId, userId, userInfo } = data;
        
        // Join the call room
        socket.join(roomId);
        
        // Initialize or update call room data
        if (!activeCallRooms.has(roomId)) {
          activeCallRooms.set(roomId, {
            participants: [],
            callType: 'video', // Default, can be updated
            startTime: new Date(),
            roomId
          });
        }
        
        const callRoom = activeCallRooms.get(roomId);
        
        // Add participant if not already present
        const existingParticipant = callRoom.participants.find(p => p.userId === userId);
        if (!existingParticipant) {
          callRoom.participants.push({
            userId: userId,
            socketId: socket.id,
            userInfo: userInfo || { name: socket.user.name, role: socket.user.role },
            joinedAt: new Date()
          });
        }
        
        // Update user call status
        userCallStatus.set(userId, {
          status: 'in_call',
          currentCallId: roomId,
          lastActivity: new Date()
        });
        
        // Notify existing participants about new user
        socket.to(roomId).emit('user-joined-call', {
          userId: userId,
          userInfo: userInfo || { name: socket.user.name, role: socket.user.role },
          roomId
        });
        
        // Send current participants list to new user
        socket.emit('call-participants', callRoom.participants);
        
        console.log(`User ${userId} joined call room ${roomId}`);
        
      } catch (error) {
        console.error('Error joining call room:', error);
        socket.emit('call-error', {
          type: 'join_room_error',
          message: 'Failed to join call room'
        });
      }
    });
    
    // Handle WebRTC signaling
    socket.on('send-call-signal', (data) => {
      try {
        const { roomId, signal, to } = data;
        
        // Forward signal to specific user or room
        if (to) {
          // Send to specific user
          const targetConnection = activeConnections.get(to);
          if (targetConnection) {
            io.to(targetConnection.socketId).emit('receive-call-signal', {
              signal,
              from: socket.userId,
              roomId
            });
          }
        } else {
          // Broadcast to room
          socket.to(roomId).emit('receive-call-signal', {
            signal,
            from: socket.userId,
            roomId
          });
        }
        
      } catch (error) {
        console.error('Error handling call signal:', error);
        socket.emit('call-error', {
          type: 'signal_error',
          message: 'Failed to handle call signal'
        });
      }
    });
    
    // Handle leaving call room
    socket.on('leave-call-room', (data) => {
      try {
        const { roomId } = data;
        
        // Leave the room
        socket.leave(roomId);
        
        // Update call room data
        if (activeCallRooms.has(roomId)) {
          const callRoom = activeCallRooms.get(roomId);
          callRoom.participants = callRoom.participants.filter(p => p.userId !== socket.userId);
          
          // Notify remaining participants
          socket.to(roomId).emit('user-left-call', {
            userId: socket.userId,
            roomId
          });
          
          // If no participants left, clean up the room
          if (callRoom.participants.length === 0) {
            activeCallRooms.delete(roomId);
            console.log(`Call room ${roomId} cleaned up - no participants remaining`);
          }
        }
        
        // Update user call status
        userCallStatus.set(socket.userId, {
          status: 'available',
          currentCallId: null,
          lastActivity: new Date()
        });
        
        console.log(`User ${socket.userId} left call room ${roomId}`);
        
      } catch (error) {
        console.error('Error leaving call room:', error);
      }
    });
    
    // Handle getting user availability status
    socket.on('get-user-status', (data) => {
      try {
        const { userId } = data;
        const isOnline = activeConnections.has(userId);
        const callStatus = userCallStatus.get(userId) || { status: 'offline' };
        
        socket.emit('user-status-response', {
          userId,
          isOnline,
          callStatus: isOnline ? callStatus.status : 'offline',
          lastActivity: callStatus.lastActivity
        });
        
      } catch (error) {
        console.error('Error getting user status:', error);
      }
    });
    
    // Handle getting online counselors
    socket.on('get-online-counselors', () => {
      try {
        const onlineCounselors = [];
        
        activeConnections.forEach((connection, userId) => {
          if (connection.user.role === 'counselor' || connection.user.role === 'admin') {
            const callStatus = userCallStatus.get(userId) || { status: 'available' };
            onlineCounselors.push({
              userId,
              name: connection.user.name,
              role: connection.user.role,
              callStatus: callStatus.status,
              specialization: connection.user.specialization || 'General',
              connectedAt: connection.connectedAt
            });
          }
        });
        
        socket.emit('online-counselors-list', onlineCounselors);
        
      } catch (error) {
        console.error('Error getting online counselors:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.name} disconnected (${socket.userId}): ${reason}`);

      // Clean up active sessions
      const connection = activeConnections.get(socket.userId);
      if (connection) {
        connection.activeSessions.forEach(sessionId => {
          socket.leave(`session_${sessionId}`);
        });
        activeConnections.delete(socket.userId);
      }

      // Clean up call-related data
      const callStatus = userCallStatus.get(socket.userId);
      if (callStatus && callStatus.currentCallId) {
        const roomId = callStatus.currentCallId;
        
        // Leave call room
        socket.leave(roomId);
        
        // Update call room participants
        if (activeCallRooms.has(roomId)) {
          const callRoom = activeCallRooms.get(roomId);
          callRoom.participants = callRoom.participants.filter(p => p.userId !== socket.userId);
          
          // Notify remaining participants
          socket.to(roomId).emit('user-left-call', {
            userId: socket.userId,
            roomId,
            reason: 'disconnected'
          });
          
          // Clean up empty call rooms
          if (callRoom.participants.length === 0) {
            activeCallRooms.delete(roomId);
            console.log(`Call room ${roomId} cleaned up after user disconnect`);
          }
        }
      }
      
      // Update user call status to offline
      userCallStatus.set(socket.userId, {
        status: 'offline',
        currentCallId: null,
        lastActivity: new Date()
      });

      // Leave user room
      socket.leave(`user_${socket.userId}`);
      
      // Leave counselor room if applicable
      if (socket.user.role === 'counselor' || socket.user.role === 'admin') {
        socket.leave('counselors');
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Utility function to get active connections count
  io.getActiveConnections = () => {
    return {
      total: activeConnections.size,
      users: Array.from(activeConnections.values()).map(conn => ({
        userId: conn.user._id,
        userName: conn.user.name,
        riskLevel: conn.user.riskLevel,
        connectedAt: conn.connectedAt,
        activeSessions: conn.activeSessions.size
      }))
    };
  };

  // Utility function to broadcast to all connected users
  io.broadcastToAll = (event, data) => {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  };

  // Utility function to send message to specific user
  io.sendToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  };

  return io;
};