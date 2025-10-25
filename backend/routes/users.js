const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Mood = require('../models/Mood');
const Session = require('../models/Session');
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

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent mood entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMoods = await Mood.find({
      user: req.userId,
      entryDate: { $gte: sevenDaysAgo }
    }).sort({ entryDate: -1 }).limit(7);

    // Get recent sessions (last 5)
    const recentSessions = await Session.find({
      user: req.userId
    }).sort({ startTime: -1 }).limit(5);

    // Calculate basic statistics
    const totalMoodEntries = await Mood.countDocuments({ user: req.userId });
    const totalSessions = await Session.countDocuments({ user: req.userId });
    
    const avgMoodScore = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + mood.moodScore, 0) / recentMoods.length 
      : 0;

    const dashboardData = {
      user: {
        name: user.name,
        riskLevel: user.riskLevel,
        lastActive: user.lastActive,
        loginCount: user.loginCount
      },
      statistics: {
        totalMoodEntries,
        totalSessions,
        averageMoodScore: Math.round(avgMoodScore * 10) / 10,
        weeklyMoodEntries: recentMoods.length
      },
      recentMoods: recentMoods.slice(0, 5),
      recentSessions: recentSessions.map(session => ({
        _id: session._id,
        sessionType: session.sessionType,
        title: session.title,
        startTime: session.startTime,
        duration: session.duration,
        status: session.status
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Mood statistics
    const moodStats = await Mood.aggregate([
      {
        $match: {
          user: req.userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgMoodScore: { $avg: '$moodScore' },
          avgEnergyLevel: { $avg: '$energyLevel' },
          totalEntries: { $sum: 1 },
          moodDistribution: {
            $push: '$mood'
          },
          commonEmotions: {
            $push: '$emotions'
          }
        }
      }
    ]);

    // Session statistics
    const sessionStats = await Session.aggregate([
      {
        $match: {
          user: req.userId,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          sessionTypes: { $push: '$sessionType' },
          avgSatisfaction: { $avg: '$outcomes.userSatisfaction' }
        }
      }
    ]);

    // Risk level history
    const riskHistory = await User.findById(req.userId, 'riskLevel createdAt updatedAt');

    const statistics = {
      period: `${days} days`,
      mood: moodStats[0] || {
        avgMoodScore: 0,
        avgEnergyLevel: 0,
        totalEntries: 0,
        moodDistribution: [],
        commonEmotions: []
      },
      sessions: sessionStats[0] || {
        totalSessions: 0,
        avgDuration: 0,
        sessionTypes: [],
        avgSatisfaction: 0
      },
      user: {
        currentRiskLevel: riskHistory.riskLevel,
        accountAge: Math.ceil((new Date() - riskHistory.createdAt) / (1000 * 60 * 60 * 24))
      }
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/risk-level
// @desc    Update user risk level (admin/counselor only)
// @access  Private
router.put('/risk-level', authenticateToken, async (req, res) => {
  try {
    const { riskLevel, reason } = req.body;
    
    if (!['low', 'moderate', 'high', 'critical'].includes(riskLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid risk level'
      });
    }

    // Check if user has permission (for now, any authenticated user can update their risk level)
    // In production, this should be restricted to counselors/admins
    const user = await User.findByIdAndUpdate(
      req.userId,
      { riskLevel },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Risk level updated successfully',
      data: {
        user: {
          _id: user._id,
          riskLevel: user.riskLevel,
          updatedAt: user.updatedAt
        },
        reason
      }
    });
  } catch (error) {
    console.error('Risk level update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating risk level',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId, 'preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Preferences fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/users/emergency-contact
// @desc    Add or update emergency contact
// @access  Private
router.post('/emergency-contact', authenticateToken, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    
    if (!name || !phone || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and relationship are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          'mentalHealthHistory.emergencyContact': {
            name,
            phone,
            relationship
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: {
        emergencyContact: user.mentalHealthHistory.emergencyContact
      }
    });
  } catch (error) {
    console.error('Emergency contact update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating emergency contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/activity-summary
// @desc    Get user activity summary
// @access  Private
router.get('/activity-summary', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activity data
    const moodEntries = await Mood.find({
      user: req.userId,
      entryDate: { $gte: startDate }
    }).sort({ entryDate: 1 });

    const sessions = await Session.find({
      user: req.userId,
      startTime: { $gte: startDate }
    }).sort({ startTime: 1 });

    // Create activity timeline
    const activity = [];
    
    moodEntries.forEach(mood => {
      activity.push({
        type: 'mood_entry',
        date: mood.entryDate,
        data: {
          mood: mood.mood,
          moodScore: mood.moodScore,
          emotions: mood.emotions
        }
      });
    });

    sessions.forEach(session => {
      activity.push({
        type: 'counseling_session',
        date: session.startTime,
        data: {
          sessionType: session.sessionType,
          title: session.title,
          duration: session.duration,
          status: session.status
        }
      });
    });

    // Sort by date
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalActivities: activity.length,
        moodEntriesCount: moodEntries.length,
        sessionsCount: sessions.length,
        activity: activity.slice(0, 50) // Limit to last 50 activities
      }
    });
  } catch (error) {
    console.error('Activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;