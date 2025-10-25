const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  // User Reference (can be null for aggregated analytics)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Analytics Type
  analyticsType: {
    type: String,
    required: [true, 'Analytics type is required'],
    enum: [
      'user_progress', 'mood_trends', 'session_effectiveness', 
      'crisis_patterns', 'wellness_score', 'engagement_metrics',
      'outcome_tracking', 'system_usage', 'demographic_insights'
    ]
  },
  
  // Time Period
  periodType: {
    type: String,
    required: [true, 'Period type is required'],
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
  },
  
  periodStart: {
    type: Date,
    required: true
  },
  
  periodEnd: {
    type: Date,
    required: true
  },
  
  // Mood Analytics
  moodAnalytics: {
    averageMoodScore: {
      type: Number,
      min: [1, 'Average mood score must be at least 1'],
      max: [10, 'Average mood score must be at most 10']
    },
    moodDistribution: {
      very_sad: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      happy: { type: Number, default: 0 },
      very_happy: { type: Number, default: 0 }
    },
    moodTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining', 'fluctuating']
    },
    totalEntries: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }, // Consecutive days with entries
    
    // Emotion Analysis
    dominantEmotions: [{
      emotion: String,
      frequency: Number,
      percentage: Number
    }],
    
    // Trigger Analysis
    commonTriggers: [{
      trigger: String,
      frequency: Number,
      impact: Number // average mood score when this trigger is present
    }],
    
    // Pattern Analysis
    patterns: {
      timeOfDayTrends: {
        morning: { avgMood: Number, count: Number },
        afternoon: { avgMood: Number, count: Number },
        evening: { avgMood: Number, count: Number },
        night: { avgMood: Number, count: Number }
      },
      weeklyPatterns: {
        monday: { avgMood: Number, count: Number },
        tuesday: { avgMood: Number, count: Number },
        wednesday: { avgMood: Number, count: Number },
        thursday: { avgMood: Number, count: Number },
        friday: { avgMood: Number, count: Number },
        saturday: { avgMood: Number, count: Number },
        sunday: { avgMood: Number, count: Number }
      }
    }
  },
  
  // Session Analytics
  sessionAnalytics: {
    totalSessions: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 }, // in minutes
    sessionTypes: {
      ai_chatbot: { count: Number, avgDuration: Number, satisfaction: Number },
      peer_support: { count: Number, avgDuration: Number, satisfaction: Number },
      professional_counselor: { count: Number, avgDuration: Number, satisfaction: Number },
      crisis_intervention: { count: Number, avgDuration: Number, satisfaction: Number },
      group_therapy: { count: Number, avgDuration: Number, satisfaction: Number }
    },
    averageSatisfaction: {
      type: Number,
      min: [1, 'Satisfaction must be at least 1'],
      max: [5, 'Satisfaction must be at most 5']
    },
    averageEffectiveness: {
      type: Number,
      min: [1, 'Effectiveness must be at least 1'],
      max: [5, 'Effectiveness must be at most 5']
    },
    goalsAchieved: { type: Number, default: 0 },
    followUpCompliance: { type: Number, default: 0 } // percentage
  },
  
  // Wellness Score (composite metric)
  wellnessScore: {
    overall: {
      type: Number,
      min: [0, 'Wellness score must be at least 0'],
      max: [100, 'Wellness score must be at most 100']
    },
    components: {
      moodStability: { type: Number, min: 0, max: 100 },
      engagementLevel: { type: Number, min: 0, max: 100 },
      progressRate: { type: Number, min: 0, max: 100 },
      copingSkills: { type: Number, min: 0, max: 100 },
      socialConnection: { type: Number, min: 0, max: 100 },
      selfCare: { type: Number, min: 0, max: 100 }
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Crisis Analytics
  crisisAnalytics: {
    totalCrisisEvents: { type: Number, default: 0 },
    crisisTypes: {
      suicidal: { type: Number, default: 0 },
      self_harm: { type: Number, default: 0 },
      panic_attack: { type: Number, default: 0 },
      psychotic_episode: { type: Number, default: 0 },
      substance_abuse: { type: Number, default: 0 }
    },
    averageResolutionTime: { type: Number, default: 0 }, // in minutes
    interventionSuccess: { type: Number, default: 0 }, // percentage
    preventedCrises: { type: Number, default: 0 }, // early intervention success
    riskLevelHistory: [{
      date: Date,
      riskLevel: String,
      trigger: String
    }]
  },
  
  // Engagement Metrics
  engagementMetrics: {
    totalLogins: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 }, // in minutes
    featuresUsed: [{
      feature: String,
      usageCount: Number,
      lastUsed: Date
    }],
    streakData: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      totalActiveDays: { type: Number, default: 0 }
    },
    notificationInteraction: {
      sent: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 }
    }
  },
  
  // Outcome Tracking
  outcomeTracking: {
    goalsSet: { type: Number, default: 0 },
    goalsAchieved: { type: Number, default: 0 },
    goalCategories: [{
      category: String,
      totalGoals: Number,
      achievedGoals: Number,
      successRate: Number
    }],
    
    // Progress Indicators
    progressIndicators: {
      anxietyReduction: { type: Number, min: -100, max: 100 }, // percentage change
      depressionImprovement: { type: Number, min: -100, max: 100 },
      stressManagement: { type: Number, min: -100, max: 100 },
      sleepQuality: { type: Number, min: -100, max: 100 },
      socialConnection: { type: Number, min: -100, max: 100 }
    },
    
    // Milestone Tracking
    milestones: [{
      milestone: String,
      achievedDate: Date,
      significance: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'breakthrough']
      }
    }]
  },
  
  // Predictive Insights
  predictiveInsights: {
    riskPrediction: {
      nextWeekRisk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'critical']
      },
      confidence: {
        type: Number,
        min: [0, 'Confidence must be between 0 and 1'],
        max: [1, 'Confidence must be between 0 and 1']
      },
      factorsInfluencing: [String]
    },
    
    recommendedInterventions: [{
      intervention: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent']
      },
      expectedOutcome: String,
      confidence: Number
    }],
    
    optimalTimes: {
      bestTimeForMoodCheck: String,
      bestTimeForTherapy: String,
      bestDayForIntervention: String
    }
  },
  
  // Comparative Analytics
  comparativeData: {
    // Compared to user's own historical data
    selfComparison: {
      lastPeriod: {
        moodChange: Number, // percentage
        engagementChange: Number,
        wellnessChange: Number
      },
      yearOverYear: {
        moodChange: Number,
        progressChange: Number,
        crisisChange: Number
      }
    },
    
    // Anonymized benchmarks (optional, with user consent)
    benchmarkData: {
      similarUserGroup: String, // age group, similar conditions, etc.
      percentileRanking: {
        mood: Number,
        engagement: Number,
        progress: Number
      }
    }
  },
  
  // Data Quality Metrics
  dataQuality: {
    completeness: {
      type: Number,
      min: [0, 'Completeness must be between 0 and 100'],
      max: [100, 'Completeness must be between 0 and 100']
    },
    consistency: {
      type: Number,
      min: [0, 'Consistency must be between 0 and 100'],
      max: [100, 'Consistency must be between 0 and 100']
    },
    accuracy: {
      type: Number,
      min: [0, 'Accuracy must be between 0 and 100'],
      max: [100, 'Accuracy must be between 0 and 100']
    },
    dataPoints: { type: Number, default: 0 },
    missingData: [String] // list of missing data types
  },
  
  // Metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  version: {
    type: String,
    default: '1.0.0'
  },
  
  isPublic: {
    type: Boolean,
    default: false // for research purposes with user consent
  },
  
  tags: [String],
  
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for period duration in days
AnalyticsSchema.virtual('periodDuration').get(function() {
  if (this.periodEnd && this.periodStart) {
    return Math.ceil((this.periodEnd - this.periodStart) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for overall progress score
AnalyticsSchema.virtual('overallProgress').get(function() {
  if (this.wellnessScore && this.wellnessScore.overall !== undefined) {
    return this.wellnessScore.overall;
  }
  
  // Calculate from mood and engagement if wellness score not available
  const mood = this.moodAnalytics?.averageMoodScore || 5;
  const engagement = this.engagementMetrics?.streakData?.currentStreak || 0;
  
  return Math.min(100, (mood * 10) + Math.min(30, engagement * 3));
});

// Static method to generate user analytics
AnalyticsSchema.statics.generateUserAnalytics = async function(userId, periodType = 'monthly') {
  const now = new Date();
  let periodStart, periodEnd;
  
  switch (periodType) {
    case 'daily':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 1);
      break;
    case 'weekly':
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - now.getDay());
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);
      break;
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'yearly':
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 30);
      periodEnd = now;
  }
  
  // This would implement the actual analytics calculation
  // For now, returning the structure
  return {
    user: userId,
    analyticsType: 'user_progress',
    periodType,
    periodStart,
    periodEnd,
    generatedAt: new Date()
  };
};

// Static method to get trending insights
AnalyticsSchema.statics.getTrendingInsights = function(timeframe = 'week') {
  // Implementation for trending patterns across all users
  return this.aggregate([
    {
      $match: {
        periodType: timeframe,
        generatedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last week
        }
      }
    },
    {
      $group: {
        _id: '$analyticsType',
        avgWellnessScore: { $avg: '$wellnessScore.overall' },
        totalUsers: { $sum: 1 },
        trendingTopics: { $push: '$outcomeTracking.milestones.milestone' }
      }
    }
  ]);
};

// Method to update wellness score
AnalyticsSchema.methods.updateWellnessScore = function(components) {
  if (!this.wellnessScore) this.wellnessScore = { components: {} };
  
  Object.keys(components).forEach(key => {
    if (this.wellnessScore.components) {
      this.wellnessScore.components[key] = components[key];
    }
  });
  
  // Calculate overall score (weighted average)
  const weights = {
    moodStability: 0.25,
    engagementLevel: 0.15,
    progressRate: 0.20,
    copingSkills: 0.20,
    socialConnection: 0.10,
    selfCare: 0.10
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(key => {
    if (this.wellnessScore.components[key] !== undefined) {
      totalScore += this.wellnessScore.components[key] * weights[key];
      totalWeight += weights[key];
    }
  });
  
  this.wellnessScore.overall = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  this.wellnessScore.lastUpdated = new Date();
  
  return this.save();
};

// Indexes for performance
AnalyticsSchema.index({ user: 1, periodStart: -1 });
AnalyticsSchema.index({ analyticsType: 1 });
AnalyticsSchema.index({ periodType: 1, periodStart: -1 });
AnalyticsSchema.index({ 'wellnessScore.overall': -1 });
AnalyticsSchema.index({ generatedAt: -1 });
AnalyticsSchema.index({ 'crisisAnalytics.totalCrisisEvents': -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);