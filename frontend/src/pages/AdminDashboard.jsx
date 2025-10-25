import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Brain,
  Heart,
  Activity,
  MessageCircle,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  Code,
  LogOut,
  User
} from 'lucide-react';
import {
  MoodTrendsChart,
  MoodDistributionChart,
  EmotionsChart,
  WellnessRadarChart,
  SessionActivityChart,
  ChartCard,
  StatsCard
} from '../components/Charts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const isDevelopmentMode = user?.isDevelopmentMode || user?.id?.includes('admin') || user?.id?.includes('dev');
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Mock data - in real implementation, this would come from API
  const generateMockData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Generate dates
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Mood trends data
    const moodTrendsData = {
      data: {
        labels,
        datasets: [
          {
            label: 'Average Mood Score',
            data: Array.from({ length: days }, () => Math.random() * 2 - 1), // -1 to 1 range
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Crisis Interventions',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 5)),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Mood Score (-1 to 1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Crisis Events' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    };

    // Mood distribution data
    const moodDistributionData = {
      data: {
        labels: ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'],
        datasets: [{
          data: [8, 15, 35, 30, 12],
          backgroundColor: [
            '#ef4444',
            '#f97316',
            '#eab308',
            '#22c55e',
            '#15803d'
          ],
          borderWidth: 2
        }]
      }
    };

    // Emotions data
    const emotionsData = {
      data: {
        labels: ['Anxiety', 'Depression', 'Stress', 'Hope', 'Joy', 'Anger', 'Fear'],
        datasets: [{
          label: 'Frequency (%)',
          data: [35, 28, 45, 20, 15, 18, 25],
          backgroundColor: [
            '#f59e0b',
            '#6366f1',
            '#ef4444',
            '#10b981',
            '#f472b6',
            '#f97316',
            '#8b5cf6'
          ]
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Frequency (%)' }
          }
        }
      }
    };

    // Wellness radar data
    const wellnessData = {
      data: {
        labels: ['Sleep Quality', 'Physical Activity', 'Social Connection', 'Academic Performance', 'Emotional Regulation', 'Coping Skills'],
        datasets: [
          {
            label: 'Current Average',
            data: [6.2, 5.8, 7.1, 6.9, 6.4, 6.7],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          },
          {
            label: 'Target Goals',
            data: [8, 8, 8, 8, 8, 8],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
          }
        ]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            title: { display: true, text: 'Wellness Score (1-10)' }
          }
        }
      }
    };

    // Session activity data
    const sessionActivityData = {
      data: {
        labels,
        datasets: [
          {
            label: 'AI Chat Sessions',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10),
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          },
          {
            label: 'Assessment Completions',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 5),
            backgroundColor: 'rgba(16, 185, 129, 0.8)'
          },
          {
            label: 'Appointments Booked',
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 15) + 2),
            backgroundColor: 'rgba(245, 158, 11, 0.8)'
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Sessions' }
          }
        }
      }
    };

    return {
      stats: {
        totalUsers: 1247,
        activeUsers: 892,
        totalSessions: 3456,
        crisisInterventions: 23,
        avgMoodScore: 0.12,
        completedAssessments: 1876
      },
      charts: {
        moodTrends: moodTrendsData,
        moodDistribution: moodDistributionData,
        emotions: emotionsData,
        wellness: wellnessData,
        sessionActivity: sessionActivityData
      }
    };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateMockData();
      setDashboardData(data);
      setLastUpdated(new Date());
      setLoading(false);
    };

    loadDashboardData();
  }, [timeRange]);

  const refreshData = () => {
    const data = generateMockData();
    setDashboardData(data);
    setLastUpdated(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Analytics Dashboard</h1>
            <p className="text-secondary-600">Mental Health Support System - Administrative Overview</p>
            {user && (
              <p className="text-sm text-primary-600 font-medium">
                Welcome, {user.firstName || 'Admin'} ({user.email})
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-white/50 rounded-lg border border-secondary-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-secondary-900">{user?.firstName || 'Admin'}</p>
              <p className="text-secondary-500 text-xs">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-secondary-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className="btn-secondary inline-flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {/* Export Button */}
          <button className="btn-primary inline-flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Development Mode Banner */}
      {isDevelopmentMode && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-200">Development Mode Active</h3>
              <p className="text-yellow-300 text-sm">
                You are viewing mock data for testing purposes. Welcome, {user?.firstName || 'Admin'}!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-sm text-secondary-500">
        Last updated: {lastUpdated.toLocaleString()}{isDevelopmentMode ? ' (Mock Data)' : ''}
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Total Users"
          value={dashboardData?.stats?.totalUsers?.toLocaleString() || '---'}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          color="primary"
          loading={loading}
        />
        <StatsCard
          title="Active Users"
          value={dashboardData?.stats?.activeUsers?.toLocaleString() || '---'}
          change="+8% from last week"
          changeType="positive"
          icon={Activity}
          color="success"
          loading={loading}
        />
        <StatsCard
          title="Chat Sessions"
          value={dashboardData?.stats?.totalSessions?.toLocaleString() || '---'}
          change="+15% from last week"
          changeType="positive"
          icon={MessageCircle}
          color="info"
          loading={loading}
        />
        <StatsCard
          title="Crisis Alerts"
          value={dashboardData?.stats?.crisisInterventions || '---'}
          change="-5% from last week"
          changeType="positive"
          icon={AlertTriangle}
          color="warning"
          loading={loading}
        />
        <StatsCard
          title="Avg. Mood"
          value={dashboardData?.stats?.avgMoodScore ? `${(dashboardData.stats.avgMoodScore * 100).toFixed(1)}%` : '---'}
          change={dashboardData?.stats?.avgMoodScore > 0 ? `+${Math.abs(dashboardData.stats.avgMoodScore * 100).toFixed(1)}%` : `${(dashboardData?.stats?.avgMoodScore * 100).toFixed(1)}%`}
          changeType={dashboardData?.stats?.avgMoodScore > 0 ? 'positive' : 'negative'}
          icon={Heart}
          color="danger"
          loading={loading}
        />
        <StatsCard
          title="Assessments"
          value={dashboardData?.stats?.completedAssessments?.toLocaleString() || '---'}
          change="+22% from last month"
          changeType="positive"
          icon={Brain}
          color="primary"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trends */}
        <ChartCard
          title="Mood Trends & Crisis Events"
          description="Daily mood patterns and crisis interventions over time"
          loading={loading}
          className="lg:col-span-2"
        >
          <MoodTrendsChart data={dashboardData?.charts?.moodTrends} loading={loading} />
        </ChartCard>

        {/* Mood Distribution */}
        <ChartCard
          title="Mood Distribution"
          description="Overall sentiment breakdown of user interactions"
          loading={loading}
        >
          <MoodDistributionChart data={dashboardData?.charts?.moodDistribution} loading={loading} />
        </ChartCard>

        {/* Emotions Chart */}
        <ChartCard
          title="Top Emotions Detected"
          description="Most frequently detected emotions in conversations"
          loading={loading}
        >
          <EmotionsChart data={dashboardData?.charts?.emotions} loading={loading} />
        </ChartCard>

        {/* Session Activity */}
        <ChartCard
          title="Platform Activity"
          description="Daily usage across different platform features"
          loading={loading}
          className="lg:col-span-2"
        >
          <SessionActivityChart data={dashboardData?.charts?.sessionActivity} loading={loading} />
        </ChartCard>

        {/* Wellness Radar */}
        <ChartCard
          title="Wellness Overview"
          description="Multi-dimensional wellness assessment results"
          loading={loading}
        >
          <WellnessRadarChart data={dashboardData?.charts?.wellness} loading={loading} />
        </ChartCard>

        {/* Additional Insights */}
        <div className="bg-white rounded-xl shadow-lg border border-secondary-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-secondary-900">Key Insights</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-900">Positive Trend</h4>
                  <p className="text-sm text-green-700">Overall mood scores have improved by 8% this month</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-medium text-yellow-900">Attention Needed</h4>
                  <p className="text-sm text-yellow-700">Stress levels peak during exam periods - consider targeted interventions</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900">Privacy Compliant</h4>
                  <p className="text-sm text-blue-700">All data is anonymized and FERPA/HIPAA compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-secondary-50 rounded-lg p-4 text-center">
        <p className="text-sm text-secondary-600">
          🔒 All data presented is anonymized and aggregated to protect student privacy.
          For detailed reports or specific interventions, contact the Mental Health Services team.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
