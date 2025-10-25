const express = require('express');
const jwt = require('jsonwebtoken');
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

// @route   POST /api/sessions
// @desc    Start a new counseling session
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const sessionData = {
      user: req.userId,
      ...req.body
    };

    const session = new Session(sessionData);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/sessions
// @desc    Get user's sessions
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sessionType } = req.query;
    
    let query = { user: req.userId };
    
    if (status) query.status = status;
    if (sessionType) query.sessionType = sessionType;

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/sessions/:id/messages
// @desc    Add message to session
// @access  Private
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.userId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.addMessage(req.body);

    res.json({
      success: true,
      message: 'Message added successfully',
      data: { session }
    });
  } catch (error) {
    console.error('Message add error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;