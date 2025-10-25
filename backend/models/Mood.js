const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Mood Data
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
  },
  
  // Mood Scale (1-10)
  moodScore: {
    type: Number,
    required: [true, 'Mood score is required'],
    min: [1, 'Mood score must be at least 1'],
    max: [10, 'Mood score must be at most 10']
  },
  
  // Emotional Categories
  emotions: [{
    type: String,
    enum: [
      'anxiety', 'stress', 'depression', 'anger', 'fear', 'joy',
      'excitement', 'calm', 'frustrated', 'lonely', 'hopeful',
      'grateful', 'overwhelmed', 'content', 'worried', 'peaceful'
    ]
  }],
  
  // Intensity Scale for emotions
  intensity: {
    type: String,
    enum: ['mild', 'moderate', 'intense', 'severe'],
    default: 'moderate'
  },
  
  // Context Information
  triggers: [{
    type: String,
    enum: [
      'work_stress', 'relationship', 'family', 'health', 'finances',
      'social_pressure', 'academic', 'weather', 'sleep', 'exercise',
      'medication', 'social_media', 'news', 'other'
    ]
  }],
  
  // User Notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  
  // Location/Environment
  location: {
    type: String,
    enum: ['home', 'work', 'school', 'outdoors', 'social_place', 'transport', 'other']
  },
  
  // Activities during mood entry
  activities: [{
    type: String,
    enum: [
      'work', 'exercise', 'socializing', 'relaxing', 'studying',
      'eating', 'sleeping', 'commuting', 'entertainment', 'meditation',
      'therapy', 'medication', 'other'
    ]
  }],
  
  // Physical Symptoms
  physicalSymptoms: [{
    type: String,
    enum: [
      'headache', 'fatigue', 'muscle_tension', 'stomach_issues',
      'sleep_problems', 'appetite_changes', 'restlessness',
      'heart_palpitations', 'breathing_issues', 'dizziness'
    ]
  }],
  
  // Sleep Quality (previous night)
  sleepQuality: {
    type: String,
    enum: ['very_poor', 'poor', 'fair', 'good', 'excellent']
  },
  
  sleepHours: {
    type: Number,
    min: [0, 'Sleep hours cannot be negative'],
    max: [24, 'Sleep hours cannot exceed 24']
  },
  
  // Energy Level
  energyLevel: {
    type: Number,
    min: [1, 'Energy level must be at least 1'],
    max: [10, 'Energy level must be at most 10']
  },
  
  // Coping Strategies Used
  copingStrategies: [{
    type: String,
    enum: [
      'deep_breathing', 'meditation', 'exercise', 'music', 'talking',
      'journaling', 'nature', 'creative_activity', 'relaxation',
      'professional_help', 'medication', 'distraction', 'none'
    ]
  }],
  
  // AI/NLP Analysis Results
  sentimentAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence must be between 0 and 1'],
      max: [1, 'Confidence must be between 0 and 1']
    },
    keywords: [String],
    emotionDetection: [{
      emotion: String,
      confidence: Number
    }]
  },
  
  // Risk Assessment
  riskIndicators: [{
    type: String,
    enum: [
      'suicidal_thoughts', 'self_harm', 'substance_abuse',
      'social_isolation', 'extreme_mood_swings', 'none'
    ]
  }],
  
  // Emergency Flag
  needsImmediateAttention: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  entryDate: {
    type: Date,
    default: Date.now
  },
  
  // Time of day for pattern analysis
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night']
  },
  
  // Entry method
  entryMethod: {
    type: String,
    enum: ['manual', 'voice', 'quick_check', 'reminder'],
    default: 'manual'
  },
  
  // Weather (if available)
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for mood category
MoodSchema.virtual('moodCategory').get(function() {
  if (this.moodScore <= 3) return 'low';
  if (this.moodScore <= 6) return 'moderate';
  return 'high';
});

// Virtual for day of week
MoodSchema.virtual('dayOfWeek').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.entryDate.getDay()];
});

// Pre-save middleware to determine time of day
MoodSchema.pre('save', function(next) {
  if (!this.timeOfDay) {
    const hour = this.entryDate.getHours();
    if (hour < 12) this.timeOfDay = 'morning';
    else if (hour < 17) this.timeOfDay = 'afternoon';
    else if (hour < 21) this.timeOfDay = 'evening';
    else this.timeOfDay = 'night';
  }
  next();
});

// Static method to get mood trends
MoodSchema.statics.getMoodTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { user: userId, entryDate: { $gte: startDate } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$entryDate" } },
        avgMoodScore: { $avg: "$moodScore" },
        avgEnergyLevel: { $avg: "$energyLevel" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to find concerning entries
MoodSchema.statics.findConcerningEntries = function(userId) {
  return this.find({
    user: userId,
    $or: [
      { needsImmediateAttention: true },
      { moodScore: { $lte: 3 } },
      { riskIndicators: { $in: ['suicidal_thoughts', 'self_harm'] } }
    ]
  }).sort({ entryDate: -1 });
};

// Indexes for performance
MoodSchema.index({ user: 1, entryDate: -1 });
MoodSchema.index({ mood: 1 });
MoodSchema.index({ moodScore: 1 });
MoodSchema.index({ 'sentimentAnalysis.sentiment': 1 });
MoodSchema.index({ needsImmediateAttention: 1 });
MoodSchema.index({ timeOfDay: 1 });

module.exports = mongoose.model('Mood', MoodSchema);