const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = true) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limiters for different endpoints
const rateLimiters = {
  // Strict rate limiting for authentication endpoints
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts. Please try again in 15 minutes.',
    false // Don't skip failed requests
  ),

  // Rate limiting for API endpoints
  api: createRateLimiter(
    1 * 60 * 1000, // 1 minute
    100, // 100 requests per minute
    'Too many API requests. Please slow down.',
    true
  ),

  // Rate limiting for chatbot interactions
  chatbot: createRateLimiter(
    1 * 60 * 1000, // 1 minute
    30, // 30 messages per minute
    'Too many chatbot messages. Please slow down to have a meaningful conversation.',
    true
  ),

  // Rate limiting for mood entries
  moodEntry: createRateLimiter(
    1 * 60 * 1000, // 1 minute
    10, // 10 mood entries per minute
    'Too many mood entries. Please take a moment between entries.',
    true
  ),

  // Rate limiting for text analysis
  textAnalysis: createRateLimiter(
    1 * 60 * 1000, // 1 minute
    20, // 20 analysis requests per minute
    'Too many text analysis requests. Please slow down.',
    true
  )
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"] // Allow WebSocket connections
    }
  },
  crossOriginEmbedderPolicy: false // Disable for development
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for this action.'
      });
    }

    next();
  };
};

// Input validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data.',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules
const validationRules = {
  // User registration validation
  registerUser: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('age')
      .optional()
      .isInt({ min: 13, max: 120 })
      .withMessage('Age must be between 13 and 120'),
    
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Invalid gender value'),
    
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-()]{10,15}$/)
      .withMessage('Please provide a valid phone number')
  ],

  // User login validation
  loginUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Mood entry validation
  createMoodEntry: [
    body('mood')
      .isIn(['very_sad', 'sad', 'neutral', 'happy', 'very_happy'])
      .withMessage('Invalid mood value'),
    
    body('moodScore')
      .isInt({ min: 1, max: 10 })
      .withMessage('Mood score must be between 1 and 10'),
    
    body('emotions')
      .optional()
      .isArray()
      .withMessage('Emotions must be an array'),
    
    body('emotions.*')
      .optional()
      .isIn([
        'anxiety', 'stress', 'depression', 'anger', 'fear', 'joy',
        'excitement', 'calm', 'frustrated', 'lonely', 'hopeful',
        'grateful', 'overwhelmed', 'content', 'worried', 'peaceful'
      ])
      .withMessage('Invalid emotion value'),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    
    body('energyLevel')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Energy level must be between 1 and 10'),
    
    body('sleepHours')
      .optional()
      .isFloat({ min: 0, max: 24 })
      .withMessage('Sleep hours must be between 0 and 24')
  ],

  // Session creation validation
  createSession: [
    body('sessionType')
      .isIn(['ai_chatbot', 'peer_support', 'professional_counselor', 'crisis_intervention', 'group_therapy'])
      .withMessage('Invalid session type'),
    
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters')
  ],

  // Message validation
  sendMessage: [
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters')
      .custom((value) => {
        // Basic profanity filter - in production, use a more sophisticated solution
        const inappropriate = ['spam', 'test123']; // Add actual inappropriate words
        const lowerValue = value.toLowerCase();
        if (inappropriate.some(word => lowerValue.includes(word))) {
          throw new Error('Message contains inappropriate content');
        }
        return true;
      }),
    
    body('messageType')
      .optional()
      .isIn(['text', 'audio', 'image', 'file', 'emoji', 'quick_response'])
      .withMessage('Invalid message type')
  ],

  // Text analysis validation
  analyzeText: [
    body('text')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Text must be between 1 and 5000 characters')
  ]
};

// Sanitize user input
const sanitizeInput = (req, res, next) => {
  // Remove any potentially harmful HTML/script tags
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>?/gm, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};

// Crisis detection middleware
const detectCrisis = async (req, res, next) => {
  // This middleware can be applied to mood entries or messages
  // to automatically flag potential crisis situations
  
  try {
    const textToAnalyze = req.body.notes || req.body.message || '';
    
    if (textToAnalyze && textToAnalyze.length > 0) {
      const nlpService = require('../services/nlpService');
      const analysis = nlpService.analyzeText(textToAnalyze);
      
      if (analysis.crisis.isCrisis) {
        // Add crisis flag to request for further processing
        req.crisisDetected = {
          riskLevel: analysis.crisis.riskLevel,
          indicators: analysis.crisis.indicators,
          confidence: analysis.crisis.confidence
        };
        
        // Log crisis detection for monitoring
        console.warn(`CRISIS DETECTED for user ${req.userId}:`, {
          riskLevel: analysis.crisis.riskLevel,
          indicators: analysis.crisis.indicators,
          text: textToAnalyze.substring(0, 100) + '...'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Crisis detection error:', error);
    // Don't block the request if crisis detection fails
    next();
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.userId || 'anonymous',
      timestamp: new Date().toISOString()
    };
    
    // Log different levels based on status code
    if (res.statusCode >= 500) {
      console.error('Server Error:', logData);
    } else if (res.statusCode >= 400) {
      console.warn('Client Error:', logData);
    } else {
      console.log('Request:', logData);
    }
  });
  
  next();
};

module.exports = {
  rateLimiters,
  securityHeaders,
  authenticate,
  authorize,
  validationRules,
  handleValidationErrors,
  sanitizeInput,
  detectCrisis,
  requestLogger
};