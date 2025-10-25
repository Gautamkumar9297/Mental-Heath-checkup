import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import socketService from '../services/socket';
import { chatbotAPI } from '../services/api';
import chatStorage from '../services/chatStorage';
import activityService from '../services/activityService';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Heart,
  MessageCircle,
  Loader,
  Phone,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Shield,
  Zap,
  Star,
  History,
  Video
} from 'lucide-react';
// import CallButtons from '../components/calls/CallButtons';
// import { useCall } from '../context/CallContext';
import { format } from 'date-fns';

const ChatSupport = () => {
  const { user } = useAuth();
  // const { initiateCall, callStatus, isInitialized: callServiceReady } = useCall();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true); // Default to true for REST API fallback
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(null);
  const [copingStrategies, setCopingStrategies] = useState([]);
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [emotionInsights, setEmotionInsights] = useState(null);
  const [sessionStats, setSessionStats] = useState({ messageCount: 0, avgSentiment: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Constants for localStorage keys
  const ACTIVE_SESSION_KEY = 'mindbot_active_session';
  const ACTIVE_MESSAGES_KEY = 'mindbot_active_messages';
  const ACTIVE_SESSION_DATA_KEY = 'mindbot_active_session_data';

  // Save current session to localStorage for persistence
  const saveActiveSession = () => {
    if (currentSessionId && messages.length > 0) {
      const sessionData = {
        sessionId: currentSessionId,
        messages: messages,
        currentMood: currentMood,
        sentimentHistory: sentimentHistory,
        emotionInsights: emotionInsights,
        sessionStats: sessionStats,
        copingStrategies: copingStrategies,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(ACTIVE_SESSION_KEY, currentSessionId);
      localStorage.setItem(ACTIVE_MESSAGES_KEY, JSON.stringify(messages));
      localStorage.setItem(ACTIVE_SESSION_DATA_KEY, JSON.stringify(sessionData));
      console.log('💾 Active session saved to localStorage:', currentSessionId);
    }
  };

  // Load active session from localStorage
  const loadActiveSession = () => {
    try {
      const savedSessionId = localStorage.getItem(ACTIVE_SESSION_KEY);
      const savedMessages = localStorage.getItem(ACTIVE_MESSAGES_KEY);
      const savedSessionData = localStorage.getItem(ACTIVE_SESSION_DATA_KEY);
      
      if (savedSessionId && savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        console.log('📂 Loading active session from localStorage:', savedSessionId);
        
        setCurrentSessionId(savedSessionId);
        setMessages(parsedMessages);
        
        // Restore additional session data if available
        if (savedSessionData) {
          try {
            const sessionData = JSON.parse(savedSessionData);
            if (sessionData.currentMood !== undefined) setCurrentMood(sessionData.currentMood);
            if (sessionData.sentimentHistory) setSentimentHistory(sessionData.sentimentHistory);
            if (sessionData.emotionInsights) setEmotionInsights(sessionData.emotionInsights);
            if (sessionData.sessionStats) setSessionStats(sessionData.sessionStats);
            if (sessionData.copingStrategies) setCopingStrategies(sessionData.copingStrategies);
          } catch (dataError) {
            console.log('Minor error loading session data, continuing with basic restore:', dataError.message);
          }
        }
        
        console.log('✅ Active session restored successfully with', parsedMessages.length, 'messages');
        
        // Track activity for restored session
        if (parsedMessages.length > 1) {
          const userMessages = parsedMessages.filter(msg => msg.sender === 'user').length;
          activityService.addActivity(
            'chat',
            'Resumed AI chat session 🔄',
            {
              value: `${userMessages} messages`,
              icon: 'MessageCircle',
              color: 'primary',
              messageCount: parsedMessages.length,
              sessionType: 'resumed'
            }
          );
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ Error loading active session from localStorage:', error);
      // Clear corrupted data
      clearActiveSession();
    }
    return false;
  };

  // Clear active session from localStorage
  const clearActiveSession = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(ACTIVE_MESSAGES_KEY);
    localStorage.removeItem(ACTIVE_SESSION_DATA_KEY);
    console.log('🗑️ Active session cleared from localStorage');
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check for active session and continued sessions from chat history
  useEffect(() => {
    console.log('🚀 ChatSupportNew component mounted - checking for existing sessions...');
    
    // PRIORITY 1: Check for active session (user's ongoing conversation)
    const hasActiveSession = loadActiveSession();
    if (hasActiveSession) {
      console.log('✅ Active session found and restored');
      return; // Don't check for continued sessions if we have an active one
    }
    
    // PRIORITY 2: Check for continued sessions from chat history
    const checkForContinuedSession = () => {
      // Check route state first
      const continuedSessionFromState = location.state?.continuedSession;
      
      // Check localStorage
      const continuedSessionFromStorage = localStorage.getItem('continuedSession');
      
      let continuedSession = null;
      if (continuedSessionFromState) {
        continuedSession = continuedSessionFromState;
        console.log('Found continued session from navigation state:', continuedSession);
      } else if (continuedSessionFromStorage) {
        try {
          continuedSession = JSON.parse(continuedSessionFromStorage);
          console.log('Found continued session from localStorage:', continuedSession);
          // Clear it after reading to avoid conflicts
          localStorage.removeItem('continuedSession');
        } catch (error) {
          console.error('Error parsing continued session from localStorage:', error);
          localStorage.removeItem('continuedSession'); // Clear corrupted data
        }
      }
      
      if (continuedSession && continuedSession.sessionId && continuedSession.messages) {
        console.log('Restoring continued session:', continuedSession.sessionId);
        setCurrentSessionId(continuedSession.sessionId);
        setMessages(continuedSession.messages);
        
        // Save as active session so it persists
        setTimeout(() => saveActiveSession(), 100);
        
        // Add a system message indicating the session was continued
        const continuationMessage = {
          id: Date.now(),
          sender: 'system',
          content: `Welcome back! Continuing your conversation "${continuedSession.title}". Feel free to pick up where you left off.`,
          timestamp: new Date(),
          type: 'continuation'
        };
        setMessages(prev => {
          const newMessages = [...prev, continuationMessage];
          return newMessages;
        });
        
        return true; // Indicates a session was continued
      }
      return false; // No session to continue
    };
    
    // Check for continued sessions if no active session was found
    checkForContinuedSession();
  }, [location.state]); // Only run when location.state changes

  // Initialize socket connection and event listeners
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        // Try to connect to socket, but don't fail if it doesn't work
        socketService.connect(token);

        // Connection events
        socketService.on('connection', (data) => {
          setIsConnected(data.status === 'connected');
        });

        socketService.on('server_connected', (data) => {
          console.log('Server connection confirmed:', data);
          setIsConnected(true);
        });

        // Chat session events - Handle session_started properly
        socketService.on('session_started', (data) => {
          console.log('🎉 Socket session started, updating UI...', data);
          setCurrentSessionId(data.sessionId);
          setMessages([{
            id: Date.now(),
            sender: 'ai',
            content: data.greeting,
            timestamp: new Date(),
            type: 'greeting'
          }]);
          setIsLoading(false); // Ensure loading is stopped
        });

        socketService.on('ai_response', (data) => {
          setIsAiTyping(false);
          const newMessage = {
            id: Date.now(),
            sender: 'ai',
            content: data.message.content,
            timestamp: new Date(),
            analysis: data.analysis,
            suggestions: data.suggestions
          };
          setMessages(prev => [...prev, newMessage]);

          // Handle sentiment analysis
          if (data.analysis?.sentiment) {
            setSentimentHistory(prev => [...prev, {
              timestamp: new Date(),
              sentiment: data.analysis.sentiment,
              emotions: data.analysis.emotions,
              confidence: data.analysis.confidence
            }]);
            setCurrentMood(data.analysis.sentiment);
          }

          // Handle emotion insights
          if (data.analysis?.emotions) {
            setEmotionInsights(data.analysis.emotions);
          }

          // Update session statistics
          setSessionStats(prev => ({
            messageCount: prev.messageCount + 1,
            avgSentiment: data.analysis?.sentiment ? 
              ((prev.avgSentiment * prev.messageCount) + data.analysis.sentiment) / (prev.messageCount + 1)
              : prev.avgSentiment
          }));

          // Handle coping strategies
          if (data.suggestions?.copingStrategies) {
            setCopingStrategies(data.suggestions.copingStrategies);
          }
        });

        socketService.on('crisis_detected', (data) => {
          setCrisisAlert(data);
        });

        socketService.on('ai_typing', () => {
          setIsAiTyping(true);
        });

        socketService.on('ai_stopped_typing', () => {
          setIsAiTyping(false);
        });

        socketService.on('session_ended', (data) => {
          const endMessage = {
            id: Date.now(),
            sender: 'system',
            content: 'Session ended. Thank you for using MindBot! 💙',
            timestamp: new Date(),
            type: 'system'
          };
          setMessages(prev => [...prev, endMessage]);
          setCurrentSessionId(null);
        });

        // Ensure we show connected status after 3 seconds even if socket fails
        setTimeout(() => {
          if (!isConnected) {
            setIsConnected(true);
          }
        }, 3000);

        return () => {
          socketService.disconnect();
        };
      } catch (error) {
        console.error('Socket connection error:', error);
        // If socket connection fails, still show connected (will use REST API)
        setIsConnected(true);
      }
    } else {
      // If no token or user, still show connected for REST API fallback
      setIsConnected(true);
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  // Auto-save active session whenever messages or important session data changes
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      console.log('💾 Auto-saving active session after message update');
      saveActiveSession();
      
      // Track chat activity every 5 messages
      if (messages.length > 1 && messages.length % 5 === 0) {
        const userMessages = messages.filter(msg => msg.sender === 'user').length;
        if (userMessages > 0) {
          activityService.addChatActivity('continued', messages.length);
        }
      }
    }
  }, [messages, currentMood, sentimentHistory, emotionInsights, sessionStats, copingStrategies]);

  // Auto-save on page unload/navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      try {
        if (!currentSessionId || messages.length === 0) return;
        const chatData = {
          sessionId: currentSessionId,
          title: chatStorage.generateChatTitle(messages),
          messages: messages,
          sentimentAnalysis: {
            currentMood,
            sentimentHistory,
            emotionInsights,
            sessionStats
          },
          tags: extractChatTags(messages),
          startTime: messages[0]?.timestamp || new Date().toISOString(),
          endTime: messages[messages.length - 1]?.timestamp || new Date().toISOString()
        };
        // Use local storage for unload safety (sync)
        chatStorage.saveChat(chatData);
      } catch (err) {
        console.error('Auto-save on unload failed:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSessionId, messages, currentMood, sentimentHistory, emotionInsights, sessionStats]);

  // Periodic auto-save every 5 messages
  useEffect(() => {
    const shouldAutoSave = currentSessionId && messages.length > 0 && messages.length % 5 === 0;
    if (shouldAutoSave) {
      const autoSave = async () => {
        try {
          const chatData = {
            sessionId: currentSessionId,
            title: chatStorage.generateChatTitle(messages),
            messages: messages,
            sentimentAnalysis: {
              currentMood,
              sentimentHistory,
              emotionInsights,
              sessionStats
            },
            tags: extractChatTags(messages),
            startTime: messages[0]?.timestamp || new Date().toISOString(),
            endTime: messages[messages.length - 1]?.timestamp || new Date().toISOString()
          };
          // Save to local storage during conversation
          chatStorage.saveChat(chatData);
          console.log(`Auto-saved chat after ${messages.length} messages`);
        } catch (error) {
          console.error('Periodic auto-save failed:', error);
        }
      };
      autoSave();
    }
  }, [messages, currentSessionId, currentMood, sentimentHistory, emotionInsights, sessionStats]);

  // Start chat session (modified to not auto-start immediately)
  const startChatSession = async () => {
    console.log('🚀 Starting chat session...');
    
    // If we already have an active session with messages, don't start a new one
    if (currentSessionId && messages.length > 0) {
      console.log('ℹ️ Session already active with', messages.length, 'messages. No need to start new session.');
      return;
    }
    setIsLoading(true);
    try {
      // Always prefer REST API for demo sessions for better reliability
      if (false && isConnected && socketService?.isSocketConnected?.()) {
        console.log('📡 Using socket connection');
        socketService.startChatSession();
      } else {
        console.log('🌐 Using REST API fallback');
        // Fallback to REST API or mock for development
        try {
          console.log('📞 Calling chatbotAPI.startSession(true)...');
          const response = await chatbotAPI.startSession(true); // Pass demo=true
          console.log('✅ API Response:', response.data);
          
          const sessionId = response.data.data.session.id;
          const greeting = response.data.data.session.messages[0].content;
          
          console.log('🔄 Setting session ID:', sessionId);
          console.log('💬 Setting greeting message:', greeting);
          
          setCurrentSessionId(sessionId);
          const initialMessage = {
            id: Date.now(),
            sender: 'ai',
            content: greeting,
            timestamp: new Date(),
            type: 'greeting'
          };
          setMessages([initialMessage]);
          
          // Track activity for new session
          activityService.addChatActivity('new', 1);
          
          console.log('🎯 State updates completed');
          console.log(`✅ Session started successfully: ${sessionId}`);
          
          // Verify state immediately after update
          setTimeout(() => {
            console.log('🔍 Verifying state after update...');
            console.log('Current Session ID should be:', sessionId);
            console.log('Messages array should contain:', [initialMessage]);
          }, 100);
        } catch (apiError) {
          console.error('❌ API Error:', apiError);
          console.log('🔄 Using mock AI response for development');
          
          const mockSessionId = 'demo-session-' + Date.now();
          setCurrentSessionId(mockSessionId);
          setMessages([{
            id: Date.now(),
            sender: 'ai',
            content: 'Hi! I\'m MindBot, your AI mental health companion. I\'m here to provide support, coping strategies, and a safe space to talk about what\'s on your mind. How are you feeling today?',
            timestamp: new Date(),
            type: 'greeting'
          }]);
          
          // Track activity for mock session
          activityService.addChatActivity('new', 1);
          
          console.log(`🔄 Mock session created: ${mockSessionId}`);
        }
      }
    } catch (error) {
      console.error('💥 Critical error starting chat session:', error);
      // Always provide a fallback
      const fallbackSessionId = 'fallback-session-' + Date.now();
      setCurrentSessionId(fallbackSessionId);
      setMessages([{
        id: Date.now(),
        sender: 'ai',
        content: 'Hello! I\'m here to support you. While our advanced features are temporarily unavailable, I can still provide basic support and resources. What\'s on your mind?',
        timestamp: new Date(),
        type: 'greeting'
      }]);
      
      // Track activity for fallback session
      activityService.addChatActivity('new', 1);
      
      console.log(`🆘 Fallback session created: ${fallbackSessionId}`);
    } finally {
      setIsLoading(false);
      console.log('✋ Loading finished');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsAiTyping(true);

    try {
      // Force REST API for demo sessions
      if (currentSessionId.startsWith('demo-session-')) {
        console.log('🌐 Using REST API for demo session message');
        // Use REST API for demo sessions
        try {
          const response = await chatbotAPI.sendMessage(currentSessionId, messageToSend);
          console.log('✅ Demo message response:', response.data);
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            content: response.data.data.aiResponse,
            timestamp: new Date(),
            analysis: response.data.data.analysis,
            suggestions: response.data.data.suggestions
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsAiTyping(false);

          if (response.data.data.suggestions?.copingStrategies) {
            setCopingStrategies(response.data.data.suggestions.copingStrategies);
          }
        } catch (demoError) {
          console.error('❌ Demo API Error:', demoError);
          // Still provide fallback for demo
          setTimeout(() => {
            const aiMessage = {
              id: Date.now() + 1,
              sender: 'ai',
              content: "Thank you for your message. I'm here to support you. How are you feeling about that?",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsAiTyping(false);
          }, 1000);
        }
      } else if (isConnected && socketService?.isSocketConnected?.()) {
        socketService.sendChatMessage(currentSessionId, messageToSend);
      } else {
        try {
          // Try REST API first
          const response = await chatbotAPI.sendMessage(currentSessionId, messageToSend);
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            content: response.data.data.aiResponse,
            timestamp: new Date(),
            analysis: response.data.data.analysis,
            suggestions: response.data.data.suggestions
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsAiTyping(false);

          if (response.data.data.suggestions?.copingStrategies) {
            setCopingStrategies(response.data.data.suggestions.copingStrategies);
          }
        } catch (apiError) {
          // Mock AI responses for development
          console.log('Using mock AI response for development');
          
          // Generate mock responses based on user input
          const mockResponses = [
            {
              content: "I understand you're going through a difficult time. It's completely normal to feel this way, and I want you to know that reaching out for support shows real strength. Can you tell me more about what's been weighing on your mind?",
              sentiment: Math.random() * 0.6 - 0.3, // Random sentiment between -0.3 and 0.3
              emotions: {
                empathy: 0.8,
                understanding: 0.7,
                supportive: 0.9
              },
              strategies: ['Deep breathing exercises', 'Mindfulness meditation', 'Progressive muscle relaxation']
            },
            {
              content: "Thank you for sharing that with me. Your feelings are valid, and it takes courage to express them. Let's work together to find some coping strategies that might help. Have you tried any relaxation techniques before?",
              sentiment: Math.random() * 0.4 + 0.1, // Positive sentiment
              emotions: {
                supportive: 0.9,
                encouraging: 0.8,
                calm: 0.7
              },
              strategies: ['Grounding techniques', 'Journaling', 'Physical exercise']
            },
            {
              content: "I hear you, and I want to help. Remember that you're not alone in this journey. Many students experience similar challenges, and there are effective ways to manage these feelings. Would you like to explore some immediate coping strategies?",
              sentiment: Math.random() * 0.5 + 0.2, // Positive sentiment
              emotions: {
                reassuring: 0.8,
                hopeful: 0.7,
                caring: 0.9
              },
              strategies: ['5-4-3-2-1 grounding technique', 'Box breathing', 'Self-compassion exercises']
            }
          ];
          
          const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
          
          setTimeout(() => {
            const aiMessage = {
              id: Date.now() + 1,
              sender: 'ai',
              content: randomResponse.content,
              timestamp: new Date(),
              analysis: {
                sentiment: randomResponse.sentiment,
                emotions: randomResponse.emotions,
                confidence: 0.85
              }
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsAiTyping(false);
            
            // Set mock coping strategies
            setCopingStrategies(randomResponse.strategies);
          }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAiTyping(false);
      
      // Final fallback response
      setTimeout(() => {
        const fallbackMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          content: "I'm here to listen and support you. While I'm experiencing some technical difficulties, please know that your wellbeing matters. If you're in crisis, please reach out to a counselor or call 988 for immediate support.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }, 1500);
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (currentSessionId && isConnected) {
      socketService.startTyping(currentSessionId);
      
      // Stop typing after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(currentSessionId);
      }, 3000);
    }
  };

  // End session
  const endSession = async () => {
    if (!currentSessionId) return;

    console.log('📽 Ending session:', currentSessionId);

    // Auto-save before ending the session
    try {
      if (messages.length > 0) {
        const chatData = {
          sessionId: currentSessionId,
          title: chatStorage.generateChatTitle(messages),
          messages: messages,
          sentimentAnalysis: {
            currentMood,
            sentimentHistory,
            emotionInsights,
            sessionStats
          },
          tags: extractChatTags(messages),
          startTime: messages[0]?.timestamp || new Date().toISOString(),
          endTime: messages[messages.length - 1]?.timestamp || new Date().toISOString()
        };
        try {
          await chatbotAPI.saveChat(chatData);
          console.log('Auto-saved chat to server before ending session');
        } catch (apiError) {
          console.log('Auto-save API failed, saving to local storage');
          chatStorage.saveChat(chatData);
        }
      }
    } catch (saveError) {
      console.error('Auto-save failed before ending session:', saveError);
    }

    try {
      if (isConnected && socketService.isSocketConnected()) {
        socketService.endChatSession(currentSessionId, { satisfaction: 4 });
      } else {
        await chatbotAPI.endSession(currentSessionId, { satisfaction: 4 });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }

    // Track final session activity before clearing
    if (messages.length > 0) {
      const userMessages = messages.filter(msg => msg.sender === 'user').length;
      const sessionStart = messages[0]?.timestamp || new Date();
      const sessionEnd = new Date();
      const duration = Math.ceil((sessionEnd - new Date(sessionStart)) / 1000); // duration in seconds
      
      activityService.addActivity(
        'chat',
        `Completed AI chat session 🏆`,
        {
          value: `${userMessages} messages`,
          icon: 'MessageCircle',
          color: 'success',
          messageCount: messages.length,
          userMessages: userMessages,
          duration: duration,
          sessionType: 'completed'
        }
      );
    }
    
    // Clear the active session from localStorage
    clearActiveSession();
    
    // Reset all session state
    setCurrentSessionId(null);
    setMessages([]);
    setCurrentMood(null);
    setSentimentHistory([]);
    setEmotionInsights(null);
    setSessionStats({ messageCount: 0, avgSentiment: 0 });
    setCopingStrategies([]);
    setCrisisAlert(null);
    
    console.log('✅ Session ended and cleaned up successfully');
  };

  // Helper functions for sentiment analysis
  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.1) return 'text-green-500';
    if (sentiment < -0.1) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.1) return <TrendingUp className="w-4 h-4" />;
    if (sentiment < -0.1) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getMoodEmoji = (sentiment) => {
    if (sentiment > 0.3) return '😊';
    if (sentiment > 0.1) return '🙂';
    if (sentiment > -0.1) return '😐';
    if (sentiment > -0.3) return '😔';
    return '😢';
  };


  // Extract relevant tags from chat messages
  const extractChatTags = (messages) => {
    const tags = [];
    const userMessages = messages.filter(msg => msg.sender === 'user');
    
    const tagKeywords = {
      'anxiety': ['anxious', 'anxiety', 'worried', 'nervous', 'panic'],
      'depression': ['depressed', 'depression', 'sad', 'down', 'hopeless'],
      'stress': ['stress', 'stressed', 'overwhelmed', 'pressure'],
      'sleep': ['sleep', 'insomnia', 'tired', 'sleepy', 'rest'],
      'work': ['work', 'job', 'career', 'workplace', 'boss'],
      'relationships': ['relationship', 'family', 'friend', 'partner', 'love'],
      'academic': ['school', 'study', 'exam', 'college', 'university', 'grade'],
      'self-care': ['self-care', 'exercise', 'meditation', 'hobby', 'relax']
    };

    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(tagKeywords).forEach(([tag, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword)) && !tags.includes(tag)) {
          tags.push(tag);
        }
      });
    });

    return tags;
  };



  // Render message
  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'ml-2 bg-primary-500' : 'mr-2 bg-secondary-500'}`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : isSystem ? (
              <MessageCircle className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Message bubble */}
          <div className={`px-4 py-2 rounded-2xl ${isUser ? 'bg-primary-500 text-white' : isSystem ? 'bg-secondary-200 text-secondary-800' : 'bg-white border border-secondary-200 text-secondary-900'} shadow-sm`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Sentiment Analysis for AI messages */}
            {!isUser && !isSystem && message.analysis?.sentiment !== undefined && (
              <div className="mt-2 pt-2 border-t border-secondary-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-secondary-500">Mood detected:</span>
                    <span className={getSentimentColor(message.analysis.sentiment)}>
                      {getSentimentIcon(message.analysis.sentiment)}
                    </span>
                    <span className="text-secondary-600">
                      {getMoodEmoji(message.analysis.sentiment)}
                    </span>
                  </div>
                  <div className="text-secondary-500">
                    {message.analysis.confidence && `${Math.round(message.analysis.confidence * 100)}% confident`}
                  </div>
                </div>
                
                {/* Emotion breakdown */}
                {message.analysis.emotions && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(message.analysis.emotions).slice(0, 3).map(([emotion, intensity]) => (
                      <span key={emotion} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700">
                        {emotion}: {Math.round(intensity * 100)}%
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className={`text-xs mt-1 ${isUser ? 'text-primary-100' : 'text-secondary-500'}`}>
              {format(message.timestamp, 'HH:mm')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto p-4">

        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">MindBot AI Assistant</h1>
                <p className="text-sm text-secondary-600">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Ready - 24/7 AI Support Available
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {currentSessionId && (
                <button
                  onClick={endSession}
                  className="px-4 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Crisis Alert */}
        {crisisAlert && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Immediate Support Available</h3>
                <p className="text-sm text-red-700 mt-1">{crisisAlert.message}</p>
                <div className="mt-2 space-y-1">
                  {crisisAlert.resources && Object.entries(crisisAlert.resources).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="bg-white shadow-lg border-x border-secondary-200 h-96 flex flex-col">
          {!currentSessionId ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                  {currentSessionId && messages.length > 0 ? 'Welcome Back!' : 'Ready to Begin Your Journey'}
                </h2>
                <p className="text-secondary-600 mb-4 max-w-md">
                  {currentSessionId && messages.length > 0
                    ? `Your conversation is ready to continue with ${messages.length} messages. Click below to resume chatting.`
                    : 'I\'m MindBot, your AI mental health companion. I provide compassionate support, coping strategies, and emotional analysis.'
                  }
                </p>
              <div className="mb-6 text-sm text-secondary-500">
                  <div className="flex items-center justify-center space-x-4 mb-2">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>24/7 Available</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Auto-Save</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Private & Secure</span>
                    </span>
                  </div>
                  <p className="text-xs">Click below when you're ready to start our conversation</p>
                </div>
                <button
                  onClick={startChatSession}
                  disabled={isLoading}
                  className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 transform hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading ? 'Connecting...' : 
                     currentSessionId && messages.length > 0 ? 'Continue Conversation' : 'Start Conversation'
                    }
                  </span>
                </button>
                <div className="mt-4 text-xs text-secondary-400">
                  Your conversations are automatically saved and analyzed for insights
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(renderMessage)}
                
                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-secondary-200 rounded-2xl px-4 py-2 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t border-secondary-200 p-4">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Share what's on your mind..."
                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    disabled={!currentSessionId}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !currentSessionId}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sentiment Analysis Dashboard */}
        {currentSessionId && (currentMood !== null || emotionInsights) && (
          <div className="bg-gradient-to-r from-primary-50 to-mint-50 border-x border-secondary-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-5 h-5 text-primary-600" />
              <h3 className="text-sm font-semibold text-primary-800">Real-time Emotional Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Mood */}
              {currentMood !== null && (
                <div className="bg-white rounded-lg p-3 border border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary-700">Current Mood</span>
                    <span className="text-lg">{getMoodEmoji(currentMood)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={getSentimentColor(currentMood)}>
                      {getSentimentIcon(currentMood)}
                    </span>
                    <span className="text-sm font-medium text-secondary-700">
                      {currentMood > 0.1 ? 'Positive' : currentMood < -0.1 ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Session Stats */}
              <div className="bg-white rounded-lg p-3 border border-primary-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary-700">Session Progress</span>
                  <Activity className="w-4 h-4 text-primary-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary-600">Messages:</span>
                    <span className="font-medium text-secondary-700">{sessionStats.messageCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary-600">Avg. Mood:</span>
                    <span className={`font-medium ${getSentimentColor(sessionStats.avgSentiment)}`}>
                      {sessionStats.avgSentiment > 0 ? '+' : ''}{(sessionStats.avgSentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Top Emotions */}
              {emotionInsights && (
                <div className="bg-white rounded-lg p-3 border border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary-700">Key Emotions</span>
                    <Heart className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="space-y-1">
                    {Object.entries(emotionInsights)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 2)
                      .map(([emotion, intensity]) => (
                        <div key={emotion} className="flex justify-between text-xs">
                          <span className="text-secondary-600 capitalize">{emotion}:</span>
                          <span className="font-medium text-secondary-700">{Math.round(intensity * 100)}%</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            {/* Mood Trend Visualization */}
            {sentimentHistory.length > 1 && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-medium text-primary-700">Mood Trend</span>
                </div>
                <div className="flex items-end space-x-1 h-8">
                  {sentimentHistory.slice(-10).map((entry, index) => (
                    <div
                      key={index}
                      className={`w-3 rounded-t transition-all duration-300 ${
                        entry.sentiment > 0.1 ? 'bg-green-400' :
                        entry.sentiment < -0.1 ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                      style={{ height: `${Math.max(Math.abs(entry.sentiment) * 100, 10)}%` }}
                      title={`${entry.sentiment > 0 ? 'Positive' : entry.sentiment < 0 ? 'Negative' : 'Neutral'} (${Math.round(entry.sentiment * 100)}%)`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coping Strategies */}
        {copingStrategies.length > 0 && (
          <div className="bg-green-50 rounded-b-xl border-x border-b border-secondary-200 p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">💡 Coping Strategies</h3>
            <div className="space-y-1">
              {copingStrategies.map((strategy, index) => (
                <p key={index} className="text-sm text-green-700">
                  • {strategy}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Call Support Section - Temporarily disabled */}
        {/* {callServiceReady && currentSessionId && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-x border-secondary-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Phone className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-800">Call Features Coming Soon!</h3>
            </div>
            <p className="text-xs text-purple-700">Video and audio calling with counselors will be available soon.</p>
          </div>
        )} */}

        {/* Footer */}
        <div className="bg-secondary-50 rounded-b-xl border border-secondary-200 p-4 text-center">
          <p className="text-xs text-secondary-600">
            💙 This is an AI assistant. For immediate crisis support, call{' '}
            <a href="tel:988" className="text-primary-600 hover:text-primary-700 font-medium">
              988
            </a>
            {' '}or{' '}
            <a href="tel:911" className="text-primary-600 hover:text-primary-700 font-medium">
              911
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;