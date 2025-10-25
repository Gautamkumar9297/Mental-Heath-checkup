const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be less than 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  phone: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  
  // Mental Health Profile
  mentalHealthHistory: {
    hasPreviousTherapy: { type: Boolean, default: false },
    currentMedication: { type: Boolean, default: false },
    medicationDetails: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // User Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dailyCheckIn: { type: Boolean, default: true }
    },
    privacy: {
      shareAnalytics: { type: Boolean, default: true },
      anonymousData: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['user', 'counselor', 'admin'],
    default: 'user'
  },
  
  // Tracking
  lastActive: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  
  // Crisis Management
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'critical'],
    default: 'low'
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's mood entries count
UserSchema.virtual('moodEntriesCount', {
  ref: 'Mood',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Virtual for user's counseling sessions count
UserSchema.virtual('sessionsCount', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update last active time
UserSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  this.loginCount += 1;
  return this.save();
};

// Static method to find users by risk level
UserSchema.statics.findByRiskLevel = function(riskLevel) {
  return this.find({ riskLevel, isActive: true });
};

// Index for performance
UserSchema.index({ riskLevel: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);