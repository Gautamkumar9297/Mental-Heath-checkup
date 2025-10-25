const express = require('express');
const jwt = require('jsonwebtoken');
const Analytics = require('../models/Analytics');
const analyticsService = require('../services/analyticsService');
const { authenticate, rateLimiters } = require('../middleware/security');
const router = express.Router();

// Apply rate limiting to analytics endpoints
router.use(rateLimiters.api);


// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive dashboard analytics with Chart.js compatible data
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { 
      period = 30,
      includeComparisons = 'true',
      includePredictions = 'false'
    } = req.query;
    
    const options = {
      period: parseInt(period),
      includeComparisons: includeComparisons === 'true',
      includePredictions: includePredictions === 'true'
    };
    
    // Generate comprehensive analytics
    const analyticsData = await analyticsService.getDashboardAnalytics(req.userId, options);
    
    res.json({
      success: true,
      data: analyticsData,
      message: 'Dashboard analytics generated successfully'
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/wellness-score
// @desc    Get user wellness score with radar chart data
// @access  Private
router.get('/wellness-score', authenticate, async (req, res) => {
  try {
    const wellnessChart = await analyticsService.getWellnessRadarChart(req.userId);
    const components = await analyticsService.calculateWellnessComponents(req.userId);
    
    // Calculate overall score
    const overallScore = Math.round(
      Object.values(components).reduce((sum, score) => sum + score, 0) / Object.keys(components).length
    );
    
    res.json({
      success: true,
      data: {
        overall: overallScore,
        components,
        chart: wellnessChart,
        trend: overallScore >= 70 ? 'improving' : overallScore <= 40 ? 'declining' : 'stable',
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Wellness score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wellness score',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/mood-trends
// @desc    Get mood trends chart data
// @access  Private
router.get('/mood-trends', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const chartData = await analyticsService.getMoodTrendsChart(req.userId, parseInt(period));
    
    res.json({
      success: true,
      data: chartData,
      message: 'Mood trends data generated successfully'
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

// @route   GET /api/analytics/mood-distribution
// @desc    Get mood distribution pie chart data
// @access  Private
router.get('/mood-distribution', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const chartData = await analyticsService.getMoodDistributionChart(req.userId, parseInt(period));
    
    res.json({
      success: true,
      data: chartData,
      message: 'Mood distribution data generated successfully'
    });
  } catch (error) {
    console.error('Mood distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mood distribution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/emotions
// @desc    Get emotions frequency chart data
// @access  Private
router.get('/emotions', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const chartData = await analyticsService.getEmotionsChart(req.userId, parseInt(period));
    
    res.json({
      success: true,
      data: chartData,
      message: 'Emotions data generated successfully'
    });
  } catch (error) {
    console.error('Emotions chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching emotions data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/session-activity
// @desc    Get session activity chart data
// @access  Private
router.get('/session-activity', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const chartData = await analyticsService.getSessionActivityChart(req.userId, parseInt(period));
    
    res.json({
      success: true,
      data: chartData,
      message: 'Session activity data generated successfully'
    });
  } catch (error) {
    console.error('Session activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/summary
// @desc    Get user summary statistics
// @access  Private
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const summary = await analyticsService.getUserSummary(req.userId, parseInt(period));
    
    res.json({
      success: true,
      data: summary,
      message: 'User summary generated successfully'
    });
  } catch (error) {
    console.error('User summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/predictions
// @desc    Get predictive insights and recommendations
// @access  Private
router.get('/predictions', authenticate, async (req, res) => {
  try {
    const predictions = await analyticsService.getPredictiveInsights(req.userId);
    
    res.json({
      success: true,
      data: predictions,
      message: 'Predictive insights generated successfully'
    });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating predictions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/comparisons
// @desc    Get comparative analytics (current vs previous period)
// @access  Private
router.get('/comparisons', authenticate, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const comparisons = await analyticsService.getComparativeAnalytics(req.userId, parseInt(period));
    
    res.json({
      success: true,
      data: comparisons,
      message: 'Comparative analytics generated successfully'
    });
  } catch (error) {
    console.error('Comparisons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating comparisons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/analytics/generate-report
// @desc    Generate and save comprehensive analytics report
// @access  Private
router.post('/generate-report', authenticate, async (req, res) => {
  try {
    const { period = 30, reportType = 'comprehensive' } = req.body;
    
    // Generate comprehensive analytics
    const analyticsData = await analyticsService.getDashboardAnalytics(req.userId, {
      period: parseInt(period),
      includeComparisons: true,
      includePredictions: true
    });
    
    // Create analytics record in database
    const analyticsRecord = new Analytics({
      user: req.userId,
      analyticsType: reportType,
      periodType: period <= 7 ? 'weekly' : period <= 31 ? 'monthly' : 'custom',
      periodStart: new Date(Date.now() - period * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      moodAnalytics: {
        averageMoodScore: analyticsData.summary.avgMoodScore,
        totalEntries: analyticsData.summary.totalMoodEntries,
        streakDays: Math.min(period, analyticsData.summary.totalMoodEntries)
      },
      sessionAnalytics: {
        totalSessions: analyticsData.summary.totalSessions,
        averageDuration: analyticsData.summary.avgSessionDuration,
        averageSatisfaction: analyticsData.summary.avgSatisfaction
      },
      wellnessScore: {
        overall: analyticsData.charts.wellness.data.datasets[0].data.reduce((a, b) => a + b, 0) / 6,
        lastUpdated: new Date()
      }
    });
    
    await analyticsRecord.save();
    
    res.json({
      success: true,
      data: {
        reportId: analyticsRecord._id,
        analytics: analyticsData,
        generatedAt: analyticsRecord.generatedAt
      },
      message: 'Analytics report generated and saved successfully'
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
