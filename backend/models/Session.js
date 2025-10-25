const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Session Type
  sessionType: {
    type: String,
    required: [true, 'Session type is required'],
    enum: ['ai_chatbot', 'peer_support', 'professional_counselor', 'crisis_intervention', 'group_therapy']
  },
  
  // Counselor/AI Reference
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // References counselor user
  },
  
  aiModel: {
    name: String, // e.g., 'Gemini-1.5-Flash', 'MindBot-AI', etc.
    version: String,
    specialization: {
      type: String,
      enum: ['general', 'anxiety', 'depression', 'trauma', 'addiction', 'relationships']
    }
  },
  
  // Session Status
  status: {
    type: String,
    required: [true, 'Session status is required'],
    enum: ['active', 'ended', 'paused', 'cancelled', 'emergency'],
    default: 'active'
  },
  
  // Session Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical', 'emergency'],
    default: 'normal'
  },
  
  // Timing Information
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  endTime: Date,
  
  duration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  
  // Session Content
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Chat Messages
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'counselor', 'ai', 'system'],
      required: true
    },
    senderInfo: {
      name: String,
      role: String
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'audio', 'image', 'file', 'emoji', 'quick_response'],
      default: 'text'
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    edited: {
      isEdited: { type: Boolean, default: false },
      editTimestamp: Date,
      originalContent: String
    }
  }],
  
  // Session Outcomes
  outcomes: {
    userSatisfaction: {
      type: Number,
      min: [1, 'Satisfaction must be at least 1'],
      max: [5, 'Satisfaction must be at most 5']
    },
    effectivenessRating: {
      type: Number,
      min: [1, 'Effectiveness must be at least 1'],
      max: [5, 'Effectiveness must be at most 5']
    },
    goalAchieved: {
      type: Boolean,
      default: false
    },
    followUpNeeded: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    improvements: [{
      area: String,
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }]
  },
  
  // AI Analysis
  aiAnalysis: {
    sentimentTrend: [{
      timestamp: Date,
      sentiment: String,
      confidence: Number
    }],
    keyTopics: [String],
    emotionalState: {
      dominantEmotion: String,
      intensity: Number,
      stability: String // stable, improving, declining
    },
    riskAssessment: {
      level: {
        type: String,
        enum: ['low', 'moderate', 'high', 'critical']
      },
      indicators: [String],
      confidence: Number,
      recommendations: [String]
    },
    therapyTechniques: [{
      technique: String,
      effectiveness: Number,
      usage: String
    }]
  },
  
  // Crisis Management
  crisisFlags: {
    isCrisis: {
      type: Boolean,
      default: false
    },
    crisisType: {
      type: String,
      enum: ['suicidal', 'self_harm', 'panic_attack', 'psychotic_episode', 'substance_abuse']
    },
    interventionTaken: {
      type: String,
      enum: ['none', 'de_escalation', 'emergency_contact', 'professional_referral', 'emergency_services']
    },
    resolvedAt: Date,
    emergencyContacts: [{
      name: String,
      phone: String,
      relationship: String,
      contacted: { type: Boolean, default: false },
      contactTime: Date
    }]
  },
  
  // Resources Shared
  resourcesShared: [{
    type: {
      type: String,
      enum: ['article', 'video', 'exercise', 'hotline', 'app_recommendation', 'professional_referral']
    },
    title: String,
    url: String,
    description: String,
    category: String,
    accessed: { type: Boolean, default: false },
    accessTime: Date
  }],
  
  // Session Metrics
  metrics: {
    messageCount: { type: Number, default: 0 },
    userEngagement: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    responseTime: { // Average AI/counselor response time in seconds
      type: Number,
      min: [0, 'Response time cannot be negative']
    },
    waitTime: { // Time user waited for session to start
      type: Number,
      min: [0, 'Wait time cannot be negative']
    }
  },
  
  // Session Environment
  environment: {
    platform: {
      type: String,
      enum: ['web', 'mobile', 'tablet', 'voice_assistant'],
      default: 'web'
    },
    location: String, // General location if available
    internetQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent']
    },
    interruptions: [{
      type: String,
      timestamp: Date,
      duration: Number // in seconds
    }]
  },
  
  // Privacy and Compliance
  privacy: {
    isAnonymous: { type: Boolean, default: false },
    dataRetention: { type: Date }, // When to delete session data
    consentGiven: { type: Boolean, default: true },
    recordingPermission: { type: Boolean, default: false }
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Notes from counselor/system
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session duration calculation
SessionSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
  }
  return null;
});

// Virtual for session status summary
SessionSchema.virtual('statusSummary').get(function() {
  return {
    status: this.status,
    duration: this.calculatedDuration,
    messageCount: this.metrics.messageCount,
    isCrisis: this.crisisFlags.isCrisis
  };
});

// Pre-save middleware to calculate metrics
SessionSchema.pre('save', function(next) {
  // Update message count
  this.metrics.messageCount = this.messages.length;
  
  // Calculate duration if session ended
  if (this.endTime && this.startTime && !this.duration) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  // Auto-end session if inactive for too long (4 hours)
  if (this.status === 'active' && this.startTime) {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage || lastMessage.timestamp < fourHoursAgo) {
      this.status = 'ended';
      this.endTime = lastMessage ? lastMessage.timestamp : fourHoursAgo;
    }
  }
  
  next();
});

// Static method to find active sessions
SessionSchema.statics.findActiveSessions = function() {
  return this.find({ status: 'active' }).populate('user', 'name email riskLevel');
};

// Static method to find crisis sessions
SessionSchema.statics.findCrisisSessions = function() {
  return this.find({ 'crisisFlags.isCrisis': true, status: { $in: ['active', 'paused'] } })
    .populate('user', 'name email phone emergencyContact')
    .sort({ 'crisisFlags.detectedAt': -1 });
};

// Static method to get session analytics
SessionSchema.statics.getSessionAnalytics = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { user: userId, startTime: { $gte: startDate } } },
    { $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        avgSatisfaction: { $avg: '$outcomes.userSatisfaction' },
        crisisCount: { $sum: { $cond: ['$crisisFlags.isCrisis', 1, 0] } },
        sessionTypes: { $push: '$sessionType' }
      }
    }
  ]);
};

// Method to end session
SessionSchema.methods.endSession = function(outcomes = {}) {
  this.status = 'ended';
  this.endTime = new Date();
  this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  
  if (outcomes.userSatisfaction) this.outcomes.userSatisfaction = outcomes.userSatisfaction;
  if (outcomes.effectivenessRating) this.outcomes.effectivenessRating = outcomes.effectivenessRating;
  if (outcomes.goalAchieved !== undefined) this.outcomes.goalAchieved = outcomes.goalAchieved;
  
  return this.save();
};

// Method to add message
SessionSchema.methods.addMessage = function(messageData) {
  this.messages.push({
    sender: messageData.sender,
    content: messageData.content,
    messageType: messageData.messageType || 'text',
    timestamp: new Date(),
    ...messageData
  });
  
  return this.save();
};

// Indexes for performance
SessionSchema.index({ user: 1, startTime: -1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ sessionType: 1 });
SessionSchema.index({ priority: 1 });
SessionSchema.index({ 'crisisFlags.isCrisis': 1 });
SessionSchema.index({ startTime: -1 });
SessionSchema.index({ 'aiAnalysis.riskAssessment.level': 1 });

module.exports = mongoose.model('Session', SessionSchema);