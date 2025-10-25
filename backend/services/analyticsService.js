const mongoose = require('mongoose');
const User = require('../models/User');
const Mood = require('../models/Mood');
const Session = require('../models/Session');
const Analytics = require('../models/Analytics');

class AnalyticsService {
  constructor() {
    // Color schemes for charts
    this.colorSchemes = {
      mood: {
        very_sad: '#ef4444',    // red-500
        sad: '#f97316',        // orange-500
        neutral: '#eab308',    // yellow-500
        happy: '#22c55e',      // green-500
        very_happy: '#10b981'  // emerald-500
      },
      emotions: {
        anxiety: '#dc2626',     // red-600
        depression: '#7c3aed',  // violet-600
        stress: '#ea580c',      // orange-600
        anger: '#b91c1c',       // red-700
        joy: '#16a34a',         // green-600
        calm: '#0891b2',        // cyan-600
        fear: '#9333ea'         // purple-600
      },
      wellness: {
        primary: '#3b82f6',     // blue-500
        secondary: '#8b5cf6',   // violet-500
        success: '#10b981',     // emerald-500
        warning: '#f59e0b',     // amber-500
        danger: '#ef4444'       // red-500
      }
    };

    // Chart.js default options
    this.defaultChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    };
  }

  /**
   * Generate mood trends data in Chart.js format
   * @param {string} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Object} Chart.js compatible mood trends data
   */
  async getMoodTrendsChart(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get mood entries
      const moodEntries = await Mood.find({
        user: userId,
        entryDate: { $gte: startDate }
      }).sort({ entryDate: 1 });

      // Group by date
      const dailyMoods = {};
      moodEntries.forEach(mood => {
        const dateKey = mood.entryDate.toISOString().split('T')[0];
        if (!dailyMoods[dateKey]) {
          dailyMoods[dateKey] = [];
        }
        dailyMoods[dateKey].push(mood);
      });

      // Generate chart data
      const labels = [];
      const moodScoreData = [];
      const energyData = [];
      const sleepData = [];

      // Fill in all dates in range
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        labels.push(formattedDate);
        
        const dayMoods = dailyMoods[dateKey] || [];
        if (dayMoods.length > 0) {
          const avgMoodScore = dayMoods.reduce((sum, mood) => sum + mood.moodScore, 0) / dayMoods.length;
          const avgEnergy = dayMoods.reduce((sum, mood) => sum + (mood.energyLevel || 5), 0) / dayMoods.length;
          const avgSleep = dayMoods.reduce((sum, mood) => sum + (mood.sleepHours || 7), 0) / dayMoods.length;
          
          moodScoreData.push(Number(avgMoodScore.toFixed(1)));
          energyData.push(Number(avgEnergy.toFixed(1)));
          sleepData.push(Number(avgSleep.toFixed(1)));
        } else {
          moodScoreData.push(null);
          energyData.push(null);
          sleepData.push(null);
        }
      }

      return {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Mood Score',
              data: moodScoreData,
              borderColor: this.colorSchemes.wellness.primary,
              backgroundColor: this.colorSchemes.wellness.primary + '20',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Energy Level',
              data: energyData,
              borderColor: this.colorSchemes.wellness.success,
              backgroundColor: this.colorSchemes.wellness.success + '20',
              tension: 0.4,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          ...this.defaultChartOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              title: {
                display: true,
                text: 'Score (1-10)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              title: {
                display: true,
                text: 'Date'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Mood Trends - Last ${days} Days`
            },
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
      };
    } catch (error) {
      console.error('Error generating mood trends chart:', error);
      return this.getEmptyChart('line', 'Mood Trends');
    }
  }

  /**
   * Generate mood distribution pie chart
   * @param {string} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Object} Chart.js compatible pie chart data
   */
  async getMoodDistributionChart(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const moodDistribution = await Mood.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            entryDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$mood',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      if (moodDistribution.length === 0) {
        return this.getEmptyChart('doughnut', 'Mood Distribution');
      }

      const labels = moodDistribution.map(item => 
        item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      );
      const data = moodDistribution.map(item => item.count);
      const backgroundColor = moodDistribution.map(item => 
        this.colorSchemes.mood[item._id] || '#6b7280'
      );

      return {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          ...this.defaultChartOptions,
          plugins: {
            title: {
              display: true,
              text: `Mood Distribution - Last ${days} Days`
            },
            legend: {
              display: true,
              position: 'right'
            }
          }
        }
      };
    } catch (error) {
      console.error('Error generating mood distribution chart:', error);
      return this.getEmptyChart('doughnut', 'Mood Distribution');
    }
  }

  /**
   * Generate emotions frequency bar chart
   * @param {string} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Object} Chart.js compatible bar chart data
   */
  async getEmotionsChart(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const emotionData = await Mood.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            entryDate: { $gte: startDate },
            emotions: { $exists: true, $ne: [] }
          }
        },
        {
          $unwind: '$emotions'
        },
        {
          $group: {
            _id: '$emotions',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10 // Top 10 emotions
        }
      ]);

      if (emotionData.length === 0) {
        return this.getEmptyChart('bar', 'Emotions Frequency');
      }

      const labels = emotionData.map(item => 
        item._id.charAt(0).toUpperCase() + item._id.slice(1)
      );
      const data = emotionData.map(item => item.count);
      const backgroundColor = emotionData.map(item => 
        this.colorSchemes.emotions[item._id] || this.colorSchemes.wellness.primary
      );

      return {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Frequency',
            data,
            backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1
          }]
        },
        options: {
          ...this.defaultChartOptions,
          plugins: {
            title: {
              display: true,
              text: `Most Common Emotions - Last ${days} Days`
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              title: {
                display: true,
                text: 'Frequency'
              }
            },
            x: {
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'Emotions'
              }
            }
          }
        }
      };
    } catch (error) {
      console.error('Error generating emotions chart:', error);
      return this.getEmptyChart('bar', 'Emotions Frequency');
    }
  }

  /**
   * Generate wellness score radar chart
   * @param {string} userId - User ID
   * @returns {Object} Chart.js compatible radar chart data
   */
  async getWellnessRadarChart(userId) {
    try {
      // Get latest analytics or calculate from recent data
      let wellnessData = await Analytics.findOne({
        user: userId,
        analyticsType: 'wellness_score'
      }).sort({ generatedAt: -1 });

      let components = {
        moodStability: 50,
        engagementLevel: 50,
        progressRate: 50,
        copingSkills: 50,
        socialConnection: 50,
        selfCare: 50
      };

      if (wellnessData?.wellnessScore?.components) {
        components = { ...components, ...wellnessData.wellnessScore.components };
      } else {
        // Calculate from recent mood data
        components = await this.calculateWellnessComponents(userId);
      }

      const labels = [
        'Mood Stability',
        'Engagement Level',
        'Progress Rate',
        'Coping Skills',
        'Social Connection',
        'Self Care'
      ];

      const data = [
        components.moodStability,
        components.engagementLevel,
        components.progressRate,
        components.copingSkills,
        components.socialConnection,
        components.selfCare
      ];

      return {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            label: 'Current Wellness Score',
            data,
            fill: true,
            backgroundColor: this.colorSchemes.wellness.primary + '20',
            borderColor: this.colorSchemes.wellness.primary,
            pointBackgroundColor: this.colorSchemes.wellness.primary,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: this.colorSchemes.wellness.primary,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Wellness Score Overview'
            },
            legend: {
              display: false
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              pointLabels: {
                font: {
                  size: 12
                }
              },
              ticks: {
                display: false
              }
            }
          }
        }
      };
    } catch (error) {
      console.error('Error generating wellness radar chart:', error);
      return this.getEmptyChart('radar', 'Wellness Overview');
    }
  }

  /**
   * Generate session activity chart
   * @param {string} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Object} Chart.js compatible chart data
   */
  async getSessionActivityChart(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sessionData = await Session.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            startTime: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
              type: '$sessionType'
            },
            count: { $sum: 1 },
            totalDuration: { $sum: '$duration' }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]);

      // Process data for chart
      const dates = [];
      const sessionCounts = {};
      const sessionTypes = ['ai_chatbot', 'professional_counselor', 'peer_support'];

      // Generate date range
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      // Initialize data structure
      sessionTypes.forEach(type => {
        sessionCounts[type] = new Array(dates.length).fill(0);
      });

      // Fill in actual data
      sessionData.forEach(session => {
        const sessionDate = new Date(session._id.date);
        const dateIndex = dates.findIndex(date => {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - (days - 1 - dates.indexOf(date)));
          return checkDate.toDateString() === sessionDate.toDateString();
        });

        if (dateIndex !== -1 && sessionCounts[session._id.type]) {
          sessionCounts[session._id.type][dateIndex] = session.count;
        }
      });

      const datasets = sessionTypes.map((type, index) => {
        const colors = [this.colorSchemes.wellness.primary, this.colorSchemes.wellness.secondary, this.colorSchemes.wellness.success];
        return {
          label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          data: sessionCounts[type],
          backgroundColor: colors[index] + '60',
          borderColor: colors[index],
          borderWidth: 1
        };
      });

      return {
        type: 'bar',
        data: {
          labels: dates,
          datasets
        },
        options: {
          ...this.defaultChartOptions,
          plugins: {
            title: {
              display: true,
              text: `Session Activity - Last ${days} Days`
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              title: {
                display: true,
                text: 'Number of Sessions'
              }
            }
          }
        }
      };
    } catch (error) {
      console.error('Error generating session activity chart:', error);
      return this.getEmptyChart('bar', 'Session Activity');
    }
  }

  /**
   * Generate comprehensive dashboard data
   * @param {string} userId - User ID
   * @param {Object} options - Analysis options
   * @returns {Object} Complete dashboard analytics
   */
  async getDashboardAnalytics(userId, options = {}) {
    const {
      period = 30,
      includeComparisons = true,
      includePredictions = false
    } = options;

    try {
      // Generate all chart data concurrently
      const [
        moodTrends,
        moodDistribution,
        emotionsChart,
        wellnessRadar,
        sessionActivity,
        summary
      ] = await Promise.all([
        this.getMoodTrendsChart(userId, period),
        this.getMoodDistributionChart(userId, period),
        this.getEmotionsChart(userId, period),
        this.getWellnessRadarChart(userId),
        this.getSessionActivityChart(userId, period),
        this.getUserSummary(userId, period)
      ]);

      const analytics = {
        period,
        generatedAt: new Date().toISOString(),
        summary,
        charts: {
          moodTrends,
          moodDistribution,
          emotions: emotionsChart,
          wellness: wellnessRadar,
          sessionActivity
        }
      };

      // Add comparisons if requested
      if (includeComparisons) {
        analytics.comparisons = await this.getComparativeAnalytics(userId, period);
      }

      // Add predictions if requested
      if (includePredictions) {
        analytics.predictions = await this.getPredictiveInsights(userId);
      }

      return analytics;
    } catch (error) {
      console.error('Error generating dashboard analytics:', error);
      throw new Error('Failed to generate dashboard analytics');
    }
  }

  /**
   * Calculate wellness components from recent data
   * @param {string} userId - User ID
   * @returns {Object} Wellness components
   */
  async calculateWellnessComponents(userId) {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      // Get recent mood entries
      const recentMoods = await Mood.find({
        user: userId,
        entryDate: { $gte: last30Days }
      }).sort({ entryDate: -1 }).limit(20);

      // Get recent sessions
      const recentSessions = await Session.find({
        user: userId,
        startTime: { $gte: last30Days }
      });

      const components = {};

      if (recentMoods.length > 0) {
        // Mood Stability - based on mood score variance
        const moodScores = recentMoods.map(m => m.moodScore);
        const avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
        const variance = moodScores.reduce((sum, score) => sum + Math.pow(score - avgMood, 2), 0) / moodScores.length;
        components.moodStability = Math.max(0, Math.min(100, 100 - (variance * 10)));

        // Self Care - based on sleep and activities
        const sleepScores = recentMoods.filter(m => m.sleepHours).map(m => m.sleepHours);
        if (sleepScores.length > 0) {
          const avgSleep = sleepScores.reduce((sum, h) => sum + h, 0) / sleepScores.length;
          components.selfCare = Math.max(0, Math.min(100, (avgSleep / 8) * 100));
        } else {
          components.selfCare = 50;
        }

        // Coping Skills - based on coping strategies used
        const copingUsed = recentMoods.filter(m => m.copingStrategies && m.copingStrategies.length > 0).length;
        components.copingSkills = Math.max(0, Math.min(100, (copingUsed / recentMoods.length) * 100));
      } else {
        components.moodStability = 50;
        components.selfCare = 50;
        components.copingSkills = 50;
      }

      // Engagement Level - based on recent activity
      const totalEntries = recentMoods.length + recentSessions.length;
      components.engagementLevel = Math.max(0, Math.min(100, totalEntries * 3));

      // Progress Rate - based on mood trend over time
      if (recentMoods.length >= 5) {
        const recentAvg = recentMoods.slice(0, 5).reduce((sum, m) => sum + m.moodScore, 0) / 5;
        const olderAvg = recentMoods.slice(-5).reduce((sum, m) => sum + m.moodScore, 0) / 5;
        const improvement = ((recentAvg - olderAvg) / 10) * 50 + 50;
        components.progressRate = Math.max(0, Math.min(100, improvement));
      } else {
        components.progressRate = 50;
      }

      // Social Connection - based on session activity and mentions
      components.socialConnection = Math.max(0, Math.min(100, recentSessions.length * 10));

      return components;
    } catch (error) {
      console.error('Error calculating wellness components:', error);
      return {
        moodStability: 50,
        engagementLevel: 50,
        progressRate: 50,
        copingSkills: 50,
        socialConnection: 50,
        selfCare: 50
      };
    }
  }

  /**
   * Get user summary statistics
   * @param {string} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Object} Summary statistics
   */
  async getUserSummary(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get counts and averages
      const [moodStats, sessionStats, user] = await Promise.all([
        Mood.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              entryDate: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalEntries: { $sum: 1 },
              avgMoodScore: { $avg: '$moodScore' },
              avgEnergyLevel: { $avg: '$energyLevel' },
              crisisEntries: {
                $sum: { $cond: ['$needsImmediateAttention', 1, 0] }
              }
            }
          }
        ]),
        Session.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              startTime: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              avgDuration: { $avg: '$duration' },
              avgSatisfaction: { $avg: '$outcomes.userSatisfaction' }
            }
          }
        ]),
        User.findById(userId)
      ]);

      const mood = moodStats[0] || {};
      const sessions = sessionStats[0] || {};

      return {
        totalMoodEntries: mood.totalEntries || 0,
        avgMoodScore: mood.avgMoodScore ? Number(mood.avgMoodScore.toFixed(1)) : null,
        avgEnergyLevel: mood.avgEnergyLevel ? Number(mood.avgEnergyLevel.toFixed(1)) : null,
        totalSessions: sessions.totalSessions || 0,
        avgSessionDuration: sessions.avgDuration ? Number(sessions.avgDuration.toFixed(1)) : null,
        avgSatisfaction: sessions.avgSatisfaction ? Number(sessions.avgSatisfaction.toFixed(1)) : null,
        crisisEntries: mood.crisisEntries || 0,
        currentRiskLevel: user?.riskLevel || 'low',
        period: `${days} days`
      };
    } catch (error) {
      console.error('Error generating user summary:', error);
      return {
        totalMoodEntries: 0,
        avgMoodScore: null,
        avgEnergyLevel: null,
        totalSessions: 0,
        avgSessionDuration: null,
        avgSatisfaction: null,
        crisisEntries: 0,
        currentRiskLevel: 'low',
        period: `${days} days`
      };
    }
  }

  /**
   * Get comparative analytics (current vs previous period)
   * @param {string} userId - User ID
   * @param {number} days - Current period days
   * @returns {Object} Comparative analytics
   */
  async getComparativeAnalytics(userId, days = 30) {
    try {
      const currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - days);
      
      const previousStart = new Date();
      previousStart.setDate(previousStart.getDate() - (days * 2));
      const previousEnd = new Date();
      previousEnd.setDate(previousEnd.getDate() - days);

      // Get current and previous period data
      const [currentStats, previousStats] = await Promise.all([
        this.getUserSummary(userId, days),
        this.getPeriodStats(userId, previousStart, previousEnd)
      ]);

      const comparisons = {};
      
      // Calculate percentage changes
      if (previousStats.avgMoodScore && currentStats.avgMoodScore) {
        comparisons.moodChange = Number(
          (((currentStats.avgMoodScore - previousStats.avgMoodScore) / previousStats.avgMoodScore) * 100).toFixed(1)
        );
      }

      if (previousStats.totalMoodEntries && currentStats.totalMoodEntries) {
        comparisons.engagementChange = Number(
          (((currentStats.totalMoodEntries - previousStats.totalMoodEntries) / previousStats.totalMoodEntries) * 100).toFixed(1)
        );
      }

      if (previousStats.totalSessions && currentStats.totalSessions) {
        comparisons.sessionChange = Number(
          (((currentStats.totalSessions - previousStats.totalSessions) / previousStats.totalSessions) * 100).toFixed(1)
        );
      }

      return {
        current: currentStats,
        previous: previousStats,
        changes: comparisons
      };
    } catch (error) {
      console.error('Error generating comparative analytics:', error);
      return null;
    }
  }

  /**
   * Get statistics for a specific time period
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Period statistics
   */
  async getPeriodStats(userId, startDate, endDate) {
    try {
      const [moodStats, sessionStats] = await Promise.all([
        Mood.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              entryDate: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalEntries: { $sum: 1 },
              avgMoodScore: { $avg: '$moodScore' }
            }
          }
        ]),
        Session.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              startTime: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 }
            }
          }
        ])
      ]);

      const mood = moodStats[0] || {};
      const sessions = sessionStats[0] || {};

      return {
        totalMoodEntries: mood.totalEntries || 0,
        avgMoodScore: mood.avgMoodScore ? Number(mood.avgMoodScore.toFixed(1)) : null,
        totalSessions: sessions.totalSessions || 0
      };
    } catch (error) {
      console.error('Error getting period stats:', error);
      return { totalMoodEntries: 0, avgMoodScore: null, totalSessions: 0 };
    }
  }

  /**
   * Get predictive insights (simplified version)
   * @param {string} userId - User ID
   * @returns {Object} Predictive insights
   */
  async getPredictiveInsights(userId) {
    try {
      // Get recent mood trend
      const recentMoods = await Mood.find({ user: userId })
        .sort({ entryDate: -1 })
        .limit(14); // Last 2 weeks

      if (recentMoods.length < 7) {
        return {
          riskPrediction: 'low',
          confidence: 0.3,
          recommendations: ['Continue regular mood tracking']
        };
      }

      // Simple trend analysis
      const recentAvg = recentMoods.slice(0, 7).reduce((sum, m) => sum + m.moodScore, 0) / 7;
      const olderAvg = recentMoods.slice(7, 14).reduce((sum, m) => sum + m.moodScore, 0) / 7;
      const trend = recentAvg - olderAvg;

      let riskPrediction = 'low';
      let confidence = 0.5;
      const recommendations = [];

      if (trend < -1) {
        riskPrediction = 'moderate';
        confidence = 0.7;
        recommendations.push('Consider scheduling additional support sessions');
        recommendations.push('Practice stress management techniques');
      } else if (trend < -2) {
        riskPrediction = 'high';
        confidence = 0.8;
        recommendations.push('Reach out to mental health professional');
        recommendations.push('Increase self-care activities');
      }

      // Check for crisis indicators
      const recentCrisis = recentMoods.some(m => m.needsImmediateAttention);
      if (recentCrisis) {
        riskPrediction = 'critical';
        confidence = 0.9;
        recommendations.unshift('Seek immediate professional support');
      }

      return {
        riskPrediction,
        confidence,
        recommendations,
        trendAnalysis: {
          direction: trend > 0 ? 'improving' : trend < -0.5 ? 'declining' : 'stable',
          strength: Math.abs(trend)
        }
      };
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return {
        riskPrediction: 'low',
        confidence: 0.3,
        recommendations: ['Continue regular mood tracking']
      };
    }
  }

  /**
   * Get empty chart template
   * @param {string} type - Chart type
   * @param {string} title - Chart title
   * @returns {Object} Empty chart object
   */
  getEmptyChart(type, title) {
    const baseChart = {
      type,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        ...this.defaultChartOptions,
        plugins: {
          title: {
            display: true,
            text: title
          },
          legend: {
            display: false
          }
        }
      }
    };

    // Add empty data message
    baseChart.options.plugins.subtitle = {
      display: true,
      text: 'No data available for this period'
    };

    return baseChart;
  }
}

module.exports = new AnalyticsService();