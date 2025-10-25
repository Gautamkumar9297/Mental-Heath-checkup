const express = require('express');
const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const User = require('../models/User');
const Mood = require('../models/Mood');
const chatbotService = require('../services/chatbotService');
const nlpService = require('../services/nlpService');
const router = express.Router();

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware to handle demo sessions (no authentication required)
const authenticateTokenOrDemo = (req, res, next) => {
  // Check if this is a demo session
  const sessionId = req.params.sessionId;
  if (sessionId && sessionId.startsWith('demo-session-')) {
    req.isDemoSession = true;
    req.userId = 'demo-user'; // Use a placeholder user ID for demo
    return next();
  }

  // For non-demo sessions, use normal authentication
  return authenticateToken(req, res, next);
};

// @route   POST /api/chatbot/start-session
// @desc    Start a new AI chatbot session
// @access  Private
// @route   GET /api/chatbot/test
// @desc    Test Gemini AI connection
// @access  Private
router.get('/test', authenticateToken, async (req, res) => {
  try {
    console.log('🧪 Testing Gemini AI connection...');
    
    // Test Gemini AI with a simple message
    const testResponse = await chatbotService.generateResponse(
      "Hello, this is a test message",
      [], // No conversation history
      { sessionId: 'test-session' }
    );
    
    res.json({
      success: true,
      message: 'Gemini AI test completed',
      data: {
        geminiEnabled: testResponse.responseType !== 'fallback',
        responseType: testResponse.responseType,
        aiResponse: testResponse.message,
        usage: testResponse.usage || null,
        error: testResponse.error || null,
        aiService: testResponse.aiService
      }
    });
  } catch (error) {
    console.error('Gemini AI test error:', error);
    res.status(500).json({
      success: false,
      message: 'Gemini AI test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/chatbot/start-session
// @desc    Start a new AI chatbot session (or demo session)
// @access  Private/Demo
router.post('/start-session', async (req, res) => {
  try {
    // Check if this is a demo session request
    const isDemoRequest = req.body.demo === true || req.query.demo === 'true';
    
    if (isDemoRequest) {
      // Generate a demo session ID
      const demoSessionId = `demo-session-${Date.now()}`;
      
      // Return demo session info without database interaction
      const greeting = "Hello! I'm MindBot, your AI mental health companion. This is a demo session - I'm here to listen and support you. How are you feeling today?";
      
      return res.status(201).json({
        success: true,
        message: 'Demo chatbot session started successfully',
        data: {
          session: {
            id: demoSessionId,
            title: 'AI Mental Health Support Demo',
            status: 'active',
            startTime: new Date(),
            messages: [{
              sender: 'ai',
              senderInfo: {
                name: 'MindBot',
                role: 'AI Mental Health Assistant'
              },
              content: greeting,
              messageType: 'text',
              timestamp: new Date()
            }]
          },
          userContext: {
            riskLevel: 'low',
            recentMoodTrend: 'stable',
            hasRecentPositiveMoods: true
          }
        }
      });
    }
    
    // For non-demo sessions, require authentication
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      req.userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Continue with regular session logic...
    // Get user context for personalized greeting
    const user = await User.findById(req.userId);
    const recentMoods = await Mood.find({ user: req.userId })
      .sort({ entryDate: -1 })
      .limit(5);

    // Build user context
    const userContext = {
      riskLevel: user.riskLevel,
      recentMoodTrend: recentMoods.length > 2 ? 
        (recentMoods[0].moodScore < recentMoods[2].moodScore ? 'declining' : 'stable') : 'unknown',
      hasRecentPositiveMoods: recentMoods.some(mood => mood.moodScore >= 7)
    };

    // Create new chatbot session
    const sessionData = {
      user: req.userId,
      sessionType: 'ai_chatbot',
      title: 'AI Mental Health Support Session',
      description: 'Conversation with MindBot AI assistant',
      status: 'active',
      priority: user.riskLevel === 'critical' ? 'emergency' : 
               user.riskLevel === 'high' ? 'high' : 'normal',
      aiModel: {
        name: 'MindBot',
        version: '1.0',
        specialization: 'general'
      }
    };

    const session = new Session(sessionData);
    
    // Add initial greeting message from AI
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

    res.status(201).json({
      success: true,
      message: 'Chatbot session started successfully',
      data: {
        session: {
          id: session._id,
          title: session.title,
          status: session.status,
          startTime: session.startTime,
          messages: session.messages
        },
        userContext
      }
    });
    
  } catch (error) {
    console.error('Chatbot session start error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting chatbot session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/chatbot/:sessionId/message
// @desc    Send message to AI chatbot and get response
// @access  Private/Demo
router.post('/:sessionId/message', authenticateTokenOrDemo, async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Handle demo sessions
    if (req.isDemoSession) {
      // Generate AI response without database interaction
      const context = {
        userRiskLevel: 'low',
        sessionId: sessionId,
        quickSupport: true
      };
      
      const aiResponse = await chatbotService.generateResponse(
        message,
        [], // No conversation history for demo
        context
      );

      // Get coping strategies if emotions detected
      let copingStrategies = [];
      if (aiResponse.nlpAnalysis && aiResponse.nlpAnalysis.emotions.length > 0) {
        copingStrategies = chatbotService.getCopingStrategies(aiResponse.nlpAnalysis.emotions);
      }

      return res.json({
        success: true,
        data: {
          aiResponse: aiResponse.message,
          sessionId: sessionId,
          requiresAttention: aiResponse.requiresHumanIntervention,
          responseType: aiResponse.responseType,
          analysis: {
            sentiment: aiResponse.nlpAnalysis?.sentiment,
            emotions: aiResponse.nlpAnalysis?.emotions,
            supportLevel: aiResponse.context?.supportLevel,
            needsAttention: aiResponse.nlpAnalysis?.overallAssessment?.needsAttention
          },
          suggestions: {
            copingStrategies,
            recommendedActions: aiResponse.nlpAnalysis?.overallAssessment?.recommendedActions
          },
          conversation: [
            {
              sender: 'user',
              content: message.trim(),
              messageType: 'text',
              timestamp: new Date()
            },
            {
              sender: 'ai',
              senderInfo: {
                name: 'MindBot',
                role: 'AI Mental Health Assistant'
              },
              content: aiResponse.message,
              messageType: 'text',
              timestamp: new Date()
            }
          ]
        }
      });
    }

    // Find the session for authenticated users
    const session = await Session.findOne({ 
      _id: sessionId, 
      user: req.userId,
      sessionType: 'ai_chatbot'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot session not found'
      });
    }

    // Add user message to session
    session.messages.push({
      sender: 'user',
      content: message.trim(),
      messageType: 'text',
      timestamp: new Date()
    });

    // Get conversation history for context
    const conversationHistory = session.messages.map(msg => ({
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp
    }));

    // Get user context
    const user = await User.findById(req.userId);
    const context = {
      userRiskLevel: user.riskLevel,
      sessionId: session._id
    };

    // Generate AI response
    const aiResponse = await chatbotService.generateResponse(
      message,
      conversationHistory.slice(0, -1), // Exclude the current message
      context
    );

    // Add AI response to session
    session.messages.push({
      sender: 'ai',
      senderInfo: {
        name: 'MindBot',
        role: 'AI Mental Health Assistant'
      },
      content: aiResponse.message,
      messageType: 'text',
      timestamp: new Date(),
      sentiment: aiResponse.nlpAnalysis?.sentiment?.sentiment
    });

    // Update session based on AI analysis
    if (aiResponse.requiresHumanIntervention) {
      session.priority = 'critical';
      session.crisisFlags.isCrisis = true;
      session.crisisFlags.crisisType = aiResponse.nlpAnalysis.crisis.indicators.includes('suicide') ? 'suicidal' : 'self_harm';
    }

    // Add AI analysis to session for counselor review
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
          confidence: aiResponse.nlpAnalysis.crisis.confidence,
          recommendations: aiResponse.context.supportLevel === 'crisis' ? 
            ['immediate_professional_intervention'] : 
            ['continue_monitoring', 'provide_coping_strategies']
        }
      };
    }

    await session.save();

    // Update user risk level if crisis detected
    if (aiResponse.requiresHumanIntervention && user.riskLevel !== 'critical') {
      await User.findByIdAndUpdate(req.userId, { 
        riskLevel: aiResponse.nlpAnalysis.crisis.riskLevel === 'critical' ? 'critical' : 'high'
      });
    }

    // Prepare response with coping strategies if needed
    let copingStrategies = [];
    if (aiResponse.nlpAnalysis && aiResponse.nlpAnalysis.emotions.length > 0) {
      copingStrategies = chatbotService.getCopingStrategies(aiResponse.nlpAnalysis.emotions);
    }

    res.json({
      success: true,
      data: {
        aiResponse: aiResponse.message,
        sessionId: session._id,
        requiresAttention: aiResponse.requiresHumanIntervention,
        responseType: aiResponse.responseType,
        analysis: {
          sentiment: aiResponse.nlpAnalysis?.sentiment,
          emotions: aiResponse.nlpAnalysis?.emotions,
          supportLevel: aiResponse.context?.supportLevel,
          needsAttention: aiResponse.nlpAnalysis?.overallAssessment?.needsAttention
        },
        suggestions: {
          copingStrategies,
          recommendedActions: aiResponse.nlpAnalysis?.overallAssessment?.recommendedActions
        },
        conversation: session.messages.slice(-2) // Return last 2 messages (user + AI)
      }
    });

  } catch (error) {
    console.error('Chatbot message processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/recent
// @desc    Get recent chat conversations (last 5)
// @access  Private
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const recentSessions = await Session.find({
      user: req.userId,
      sessionType: 'ai_chatbot',
      status: { $in: ['completed', 'active'] }
    })
    .sort({ startTime: -1 })
    .limit(5)
    .select('title startTime endTime status messages duration priority')
    .lean();

    const formattedSessions = recentSessions.map(session => {
      const lastMessage = session.messages[session.messages.length - 1];
      const firstUserMessage = session.messages.find(msg => msg.sender === 'user');
      
      return {
        id: session._id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        duration: session.duration,
        messageCount: session.messages.length,
        lastMessage: lastMessage ? {
          sender: lastMessage.sender,
          content: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
          timestamp: lastMessage.timestamp
        } : null,
        firstUserMessage: firstUserMessage ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') : 'New conversation',
        priority: session.priority
      };
    });

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        count: formattedSessions.length
      }
    });
  } catch (error) {
    console.error('Recent conversations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/:sessionId/conversation
// @desc    Get full conversation history with enhanced details
// @access  Private
router.get('/:sessionId/conversation', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { includeAnalysis = 'true' } = req.query;

    const session = await Session.findOne({ 
      _id: sessionId, 
      user: req.userId,
      sessionType: 'ai_chatbot'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot session not found'
      });
    }

    // Enhanced message formatting
    const formattedMessages = session.messages.map(message => ({
      id: message._id,
      sender: message.sender,
      senderInfo: message.senderInfo,
      content: message.content,
      messageType: message.messageType || 'text',
      timestamp: message.timestamp,
      sentiment: message.sentiment,
      isImportant: message.isImportant || false,
      edited: message.edited
    }));

    let conversationAnalysis = null;
    if (includeAnalysis === 'true') {
      // Analyze conversation patterns
      conversationAnalysis = chatbotService.analyzeConversation(session.messages);
    }

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          title: session.title,
          description: session.description,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          priority: session.priority,
          duration: session.duration || session.calculatedDuration,
          aiModel: session.aiModel,
          crisisFlags: session.crisisFlags,
          outcomes: session.outcomes
        },
        messages: formattedMessages,
        analysis: conversationAnalysis,
        statistics: {
          totalMessages: session.messages.length,
          userMessages: session.messages.filter(m => m.sender === 'user').length,
          aiMessages: session.messages.filter(m => m.sender === 'ai').length,
          avgResponseTime: session.aiAnalysis?.avgResponseTime || null
        },
        aiAnalysis: session.aiAnalysis
      }
    });
  } catch (error) {
    console.error('Conversation fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/saved-chats
// @desc    Get user's saved chatbot conversations
// @access  Private
router.get('/saved-chats', authenticateToken, async (req, res) => {
  try {
    const savedSessions = await Session.find({
      user: req.userId,
      sessionType: 'ai_chatbot',
      status: { $in: ['completed', 'active'] }
    }).sort({ startTime: -1 }).limit(20);

    res.json({
      success: true,
      data: {
        sessions: savedSessions.map(session => ({
          id: session._id,
          title: session.title,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          messageCount: session.messages.length,
          lastActivity: session.messages[session.messages.length - 1]?.timestamp,
          summary: session.messages.slice(-2).map(m => ({
            sender: m.sender,
            content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : '')
          }))
        })),
        count: savedSessions.length
      }
    });
  } catch (error) {
    console.error('Saved chats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/active-sessions
// @desc    Get user's active chatbot sessions
// @access  Private
router.get('/active-sessions', authenticateToken, async (req, res) => {
  try {
    const activeSessions = await Session.find({
      user: req.userId,
      sessionType: 'ai_chatbot',
      status: 'active'
    }).sort({ startTime: -1 });

    res.json({
      success: true,
      data: {
        sessions: activeSessions.map(session => ({
          id: session._id,
          title: session.title,
          startTime: session.startTime,
          messageCount: session.messages.length,
          lastActivity: session.messages[session.messages.length - 1]?.timestamp,
          priority: session.priority,
          needsAttention: session.crisisFlags.isCrisis
        })),
        count: activeSessions.length
      }
    });
  } catch (error) {
    console.error('Active sessions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/chatbot/:sessionId/end
// @desc    End a chatbot session
// @access  Private
router.post('/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { feedback } = req.body;

    const session = await Session.findOne({ 
      _id: sessionId, 
      user: req.userId,
      sessionType: 'ai_chatbot'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot session not found'
      });
    }

    // End the session
    const outcomes = {
      userSatisfaction: feedback?.satisfaction || undefined,
      effectivenessRating: feedback?.effectiveness || undefined,
      goalAchieved: feedback?.helpful || false
    };

    await session.endSession(outcomes);

    // Add closing message from AI
    const closingMessage = "Thank you for talking with me today. Remember that I'm here whenever you need support. If you're in crisis or need immediate help, please don't hesitate to contact a mental health professional or call 988. Take care of yourself! 💙";
    
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

    res.json({
      success: true,
      message: 'Chatbot session ended successfully',
      data: {
        sessionSummary: {
          id: session._id,
          duration: session.duration,
          messageCount: session.messages.length,
          startTime: session.startTime,
          endTime: session.endTime,
          outcomes: session.outcomes
        }
      }
    });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/chat-history
// @desc    Get comprehensive chat history with pagination and search
// @access  Private
router.get('/chat-history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {
      user: req.userId,
      sessionType: 'ai_chatbot'
    };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    // Search in session titles if search term provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalSessions = await Session.countDocuments(filter);

    // Get sessions with pagination
    const sessions = await Session.find(filter)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title startTime endTime status messages priority crisisFlags aiAnalysis duration')
      .lean();

    // Format the response data
    const formattedSessions = sessions.map(session => {
      const lastMessage = session.messages[session.messages.length - 1];
      const firstUserMessage = session.messages.find(msg => msg.sender === 'user');
      
      return {
        id: session._id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        duration: session.duration,
        messageCount: session.messages.length,
        lastActivity: lastMessage?.timestamp,
        lastMessage: lastMessage ? {
          sender: lastMessage.sender,
          content: lastMessage.content.substring(0, 150) + (lastMessage.content.length > 150 ? '...' : ''),
          timestamp: lastMessage.timestamp
        } : null,
        firstUserMessage: firstUserMessage ? {
          content: firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : ''),
          timestamp: firstUserMessage.timestamp
        } : null,
        priority: session.priority,
        needsAttention: session.crisisFlags?.isCrisis || false,
        emotionalSummary: session.aiAnalysis?.emotionalState ? {
          dominantEmotion: session.aiAnalysis.emotionalState.dominantEmotion,
          intensity: session.aiAnalysis.emotionalState.intensity
        } : null
      };
    });

    const totalPages = Math.ceil(totalSessions / limit);

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSessions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        summary: {
          totalConversations: totalSessions,
          activeConversations: sessions.filter(s => s.status === 'active').length,
          completedConversations: sessions.filter(s => s.status === 'completed').length
        }
      }
    });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/chatbot/:sessionId/continue
// @desc    Continue/resume a previous chat conversation
// @access  Private
router.post('/:sessionId/continue', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find the session
    const session = await Session.findOne({
      _id: sessionId,
      user: req.userId,
      sessionType: 'ai_chatbot'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // If session is already active, just return it
    if (session.status === 'active') {
      return res.json({
        success: true,
        message: 'Chat session is already active',
        data: {
          sessionId: session._id,
          status: session.status,
          messages: session.messages,
          canContinue: true
        }
      });
    }

    // Reactivate the session if it was completed or paused
    if (session.status === 'completed' || session.status === 'paused') {
      session.status = 'active';
      session.endTime = null; // Clear end time since we're resuming
      
      // Add a system message indicating the session was resumed
      const resumeMessage = {
        sender: 'ai',
        senderInfo: {
          name: 'MindBot',
          role: 'AI Mental Health Assistant'
        },
        content: "Welcome back! I'm glad you decided to continue our conversation. How are you feeling now? You can pick up right where we left off, or share anything new that's on your mind.",
        messageType: 'text',
        timestamp: new Date(),
        isImportant: false
      };

      session.messages.push(resumeMessage);
      await session.save();

      return res.json({
        success: true,
        message: 'Chat session resumed successfully',
        data: {
          sessionId: session._id,
          status: session.status,
          messages: session.messages,
          resumedAt: new Date(),
          canContinue: true,
          previousDuration: session.duration
        }
      });
    }

    // If session is cancelled or ended permanently
    if (session.status === 'cancelled' || session.status === 'emergency') {
      return res.status(400).json({
        success: false,
        message: 'This chat session cannot be resumed due to its current status',
        data: {
          status: session.status,
          canContinue: false
        }
      });
    }

    // Default response for any other status
    res.json({
      success: true,
      message: 'Chat session available for continuation',
      data: {
        sessionId: session._id,
        status: session.status,
        messages: session.messages,
        canContinue: true
      }
    });

  } catch (error) {
    console.error('Continue chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resuming chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/:sessionId/summary
// @desc    Get a summary of the conversation before continuing
// @access  Private
router.get('/:sessionId/summary', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      user: req.userId,
      sessionType: 'ai_chatbot'
    }).select('title startTime endTime status messages aiAnalysis duration priority');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Get key conversation highlights
    const userMessages = session.messages.filter(m => m.sender === 'user');
    const aiMessages = session.messages.filter(m => m.sender === 'ai');
    const lastMessage = session.messages[session.messages.length - 1];
    const firstUserMessage = userMessages[0];
    const lastUserMessage = userMessages[userMessages.length - 1];

    // Create conversation summary
    const summary = {
      sessionInfo: {
        id: session._id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        duration: session.duration,
        priority: session.priority,
        canContinue: ['active', 'completed', 'paused'].includes(session.status)
      },
      conversationHighlights: {
        totalMessages: session.messages.length,
        userMessages: userMessages.length,
        aiMessages: aiMessages.length,
        firstTopic: firstUserMessage ? {
          content: firstUserMessage.content.substring(0, 150) + (firstUserMessage.content.length > 150 ? '...' : ''),
          timestamp: firstUserMessage.timestamp
        } : null,
        lastTopic: lastUserMessage && lastUserMessage !== firstUserMessage ? {
          content: lastUserMessage.content.substring(0, 150) + (lastUserMessage.content.length > 150 ? '...' : ''),
          timestamp: lastUserMessage.timestamp
        } : null,
        lastAIResponse: lastMessage && lastMessage.sender === 'ai' ? {
          content: lastMessage.content.substring(0, 200) + (lastMessage.content.length > 200 ? '...' : ''),
          timestamp: lastMessage.timestamp
        } : null
      },
      emotionalContext: session.aiAnalysis?.emotionalState ? {
        dominantEmotion: session.aiAnalysis.emotionalState.dominantEmotion,
        intensity: session.aiAnalysis.emotionalState.intensity,
        stability: session.aiAnalysis.emotionalState.stability
      } : null,
      riskAssessment: session.aiAnalysis?.riskAssessment ? {
        level: session.aiAnalysis.riskAssessment.level,
        indicators: session.aiAnalysis.riskAssessment.indicators || [],
        needsAttention: session.aiAnalysis.riskAssessment.level === 'high' || session.aiAnalysis.riskAssessment.level === 'critical'
      } : null,
      keyTopics: session.aiAnalysis?.keyTopics?.slice(0, 5) || [],
      recommendations: session.aiAnalysis?.riskAssessment?.recommendations || []
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Conversation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating conversation summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/chatbot/quick-support
// @desc    Get quick AI support without starting a full session
// @access  Private
router.post('/quick-support', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required for quick support'
      });
    }

    // Get user info for context
    const user = await User.findById(req.userId);

    // Generate AI response without saving to database
    const aiResponse = await chatbotService.generateResponse(
      message,
      [],
      { 
        userRiskLevel: user.riskLevel,
        quickSupport: true,
        ...context
      }
    );

    // Get coping strategies if emotions detected
    let copingStrategies = [];
    if (aiResponse.nlpAnalysis && aiResponse.nlpAnalysis.emotions.length > 0) {
      copingStrategies = chatbotService.getCopingStrategies(aiResponse.nlpAnalysis.emotions);
    }

    res.json({
      success: true,
      data: {
        response: aiResponse.message,
        requiresAttention: aiResponse.requiresHumanIntervention,
        analysis: {
          sentiment: aiResponse.nlpAnalysis?.sentiment,
          emotions: aiResponse.nlpAnalysis?.emotions,
          crisisRisk: aiResponse.nlpAnalysis?.crisis
        },
        copingStrategies,
        recommendedNextSteps: aiResponse.requiresHumanIntervention ? 
          ['start_full_session', 'contact_crisis_line'] : 
          ['practice_coping_strategies', 'continue_monitoring']
      }
    });
  } catch (error) {
    console.error('Quick support error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while providing quick support',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chatbot/search
// @desc    Search through all chat conversations
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    // Search in sessions and messages
    const sessions = await Session.find({
      user: req.userId,
      sessionType: 'ai_chatbot',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'messages.content': searchRegex }
      ]
    })
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('title startTime endTime status messages duration')
    .lean();

    // Format results with matching message highlights
    const searchResults = sessions.map(session => {
      const matchingMessages = session.messages.filter(message => 
        searchRegex.test(message.content)
      ).slice(0, 3); // Limit to 3 matching messages per session

      return {
        id: session._id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        duration: session.duration,
        messageCount: session.messages.length,
        matchingMessages: matchingMessages.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          // Highlight the search term (basic highlighting)
          highlighted: msg.content.replace(searchRegex, `**${query}**`)
        })),
        matchCount: session.messages.filter(msg => searchRegex.test(msg.content)).length
      };
    });

    const totalResults = await Session.countDocuments({
      user: req.userId,
      sessionType: 'ai_chatbot',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'messages.content': searchRegex }
      ]
    });

    res.json({
      success: true,
      data: {
        results: searchResults,
        searchQuery: query,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalResults / limit),
          totalResults,
          hasNextPage: page * limit < totalResults
        }
      }
    });

  } catch (error) {
    console.error('Search chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/chatbot/:sessionId/pause
// @desc    Pause a conversation (can be resumed later)
// @access  Private
router.post('/:sessionId/pause', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      user: req.userId,
      sessionType: 'ai_chatbot'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active sessions can be paused',
        data: { currentStatus: session.status }
      });
    }

    // Update session status
    session.status = 'paused';
    
    // Add a pause message
    const pauseMessage = {
      sender: 'system',
      senderInfo: {
        name: 'System',
        role: 'System Message'
      },
      content: reason ? `Conversation paused: ${reason}. You can resume this conversation anytime.` : 'Conversation paused. You can resume this conversation anytime.',
      messageType: 'system',
      timestamp: new Date(),
      isImportant: false
    };

    session.messages.push(pauseMessage);
    await session.save();

    res.json({
      success: true,
      message: 'Conversation paused successfully',
      data: {
        sessionId: session._id,
        status: session.status,
        pausedAt: new Date(),
        canResume: true
      }
    });

  } catch (error) {
    console.error('Pause conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while pausing conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
