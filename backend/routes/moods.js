const express = require('express');
const jwt = require('jsonwebtoken');
const Mood = require('../models/Mood');
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

// @route   POST /api/moods
// @desc    Create a new mood entry
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const moodData = {
      user: req.userId,
      ...req.body
    };

    // Perform NLP analysis on notes if provided
    if (moodData.notes && moodData.notes.trim()) {
      const nlpAnalysis = nlpService.analyzeText(moodData.notes);
      
      // Update sentiment analysis
      moodData.sentimentAnalysis = {
        sentiment: nlpAnalysis.sentiment.sentiment,
        confidence: nlpAnalysis.sentiment.confidence,
        keywords: nlpAnalysis.themes,
        emotionDetection: nlpAnalysis.emotions.map(emotion => ({
          emotion: emotion.emotion,
          confidence: emotion.confidence
        }))
      };
      
      // Check for crisis indicators
      if (nlpAnalysis.crisis.isCrisis) {
        moodData.needsImmediateAttention = true;
        moodData.riskIndicators = nlpAnalysis.crisis.indicators.map(indicator => 
          indicator.includes('suicide') || indicator.includes('kill') ? 'suicidal_thoughts' :
          indicator.includes('harm') ? 'self_harm' : 'none'
        );
      }
      
      // Add detected coping strategies
      if (nlpAnalysis.copingMechanisms.length > 0) {
        moodData.copingStrategies = nlpAnalysis.copingMechanisms.map(coping => {
          // Map NLP coping to mood schema enums
          const copingMap = {
            'meditation': 'meditation',
            'exercise': 'exercise', 
            'breathing': 'deep_breathing',
            'therapy': 'professional_help',
            'journal': 'journaling',
            'music': 'music',
            'talk': 'talking'
          };
          return copingMap[coping] || 'other';
        });
      }
    }

    const mood = new Mood(moodData);
    await mood.save();

    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: { 
        mood,
        nlpInsights: moodData.notes ? {
          needsAttention: mood.needsImmediateAttention,
          detectedEmotions: mood.sentimentAnalysis?.emotionDetection || [],
          copingStrategiesDetected: mood.copingStrategies || [],
          overallSentiment: mood.sentimentAnalysis?.sentiment || 'neutral'
        } : null
      }
    });
  } catch (error) {
    console.error('Mood creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating mood entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/moods
// @desc    Get user's mood entries
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, mood: moodFilter } = req.query;
    
    let query = { user: req.userId };
    
    // Date range filter
    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) query.entryDate.$lte = new Date(endDate);
    }
    
    // Mood filter
    if (moodFilter) {
      query.mood = moodFilter;
    }

    const moods = await Mood.find(query)
      .sort({ entryDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Mood.countDocuments(query);

    res.json({
      success: true,
      data: {
        moods,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Mood fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mood entries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/moods/trends
// @desc    Get mood trends and analytics
// @access  Private
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await Mood.getMoodTrends(req.userId, parseInt(days));

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Mood trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mood trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/moods/analyze-text
// @desc    Analyze text for sentiment and emotions (for real-time feedback)
// @access  Private
router.post('/analyze-text', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required for analysis'
      });
    }
    
    const analysis = nlpService.analyzeText(text);
    
    res.json({
      success: true,
      data: {
        analysis,
        recommendations: analysis.overallAssessment.recommendedActions,
        supportLevel: analysis.overallAssessment.supportLevel
      }
    });
  } catch (error) {
    console.error('Text analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during text analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/moods/crisis-check
// @desc    Get entries flagged for immediate attention
// @access  Private
router.get('/crisis-check', authenticateToken, async (req, res) => {
  try {
    const crisisMoods = await Mood.find({
      user: req.userId,
      needsImmediateAttention: true
    }).sort({ entryDate: -1 }).limit(10);
    
    res.json({
      success: true,
      data: {
        crisisEntries: crisisMoods,
        count: crisisMoods.length,
        needsAttention: crisisMoods.length > 0
      }
    });
  } catch (error) {
    console.error('Crisis check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during crisis check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
