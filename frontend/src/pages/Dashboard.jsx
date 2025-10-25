import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, moodAPI, appointmentAPI, sessionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import activityService from '../services/activityService';
import {
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  ClipboardList,
  Heart,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader,
  RefreshCw,
  LogOut,
  User,
  Phone,
  Video
} from 'lucide-react';
import CounselorSelector from '../components/calls/CounselorSelector';
import { useCall } from '../context/CallContext';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { callStatus, isInitialized: callServiceReady } = useCall();
  const navigate = useNavigate();
  const [wellnessData, setWellnessData] = useState({
    currentMood: null,
    weeklyTrend: null,
    lastAssessment: null,
    upcomingAppointments: 0,
    completedSessions: 0,
    unreadMessages: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('Fetching dashboard data for user:', user?.id);
      
      // Try to get comprehensive dashboard data
      const responses = await Promise.allSettled([
        dashboardAPI.getDashboardData(),
        moodAPI.getMoodTrends(7),
        appointmentAPI.getUpcomingAppointments(),
        sessionAPI.getSessions({ limit: 10, status: 'completed' }),
        dashboardAPI.getRecentActivity()
      ]);

      // Process main dashboard data
      if (responses[0].status === 'fulfilled') {
        const dashboardData = responses[0].value.data;
        setWellnessData(prev => ({
          ...prev,
          currentMood: dashboardData.currentMood || prev.currentMood,
          lastAssessment: dashboardData.lastAssessment || prev.lastAssessment,
          unreadMessages: dashboardData.unreadMessages || 0
        }));
      }

      // Process mood trends
      if (responses[1].status === 'fulfilled') {
        const moodTrends = responses[1].value.data;
        const trend = calculateWeeklyTrend(moodTrends);
        setWellnessData(prev => ({ ...prev, weeklyTrend: trend }));
      }

      // Process appointments
      if (responses[2].status === 'fulfilled') {
        const appointments = responses[2].value.data;
        const appointmentCount = Array.isArray(appointments) ? appointments.length : 0;
        setWellnessData(prev => ({ ...prev, upcomingAppointments: appointmentCount }));
        console.log(`User has ${appointmentCount} upcoming appointments`);
      }

      // Process completed sessions
      if (responses[3].status === 'fulfilled') {
        const sessions = responses[3].value.data;
        const sessionCount = Array.isArray(sessions) ? sessions.length : 0;
        setWellnessData(prev => ({ ...prev, completedSessions: sessionCount }));
        console.log(`User has completed ${sessionCount} sessions`);
      }

      // Process recent activity - Use local activity service as primary source
      let localActivities = activityService.getRecentActivity();
      
      if (responses[4].status === 'fulfilled') {
        const remoteActivity = responses[4].value.data;
        if (Array.isArray(remoteActivity) && remoteActivity.length > 0) {
          // Merge remote and local activities, prioritizing local
          const mergedActivities = [...localActivities];
          remoteActivity.forEach(remote => {
            if (!localActivities.find(local => local.id === remote.id)) {
              mergedActivities.push(remote);
            }
          });
          setRecentActivity(mergedActivities.slice(0, 10)); // Keep only 10 most recent
        } else {
          setRecentActivity(localActivities);
        }
      } else {
        // Use local activities if remote fails
        setRecentActivity(localActivities);
      }

      // Fallback to individual API calls if main dashboard fails
      if (responses[0].status === 'rejected') {
        console.log('Main dashboard API failed, trying individual calls...');
        await loadFallbackData();
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Unable to connect to server. Showing offline data.');
      await loadMockData();
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback data loading with individual API calls
  const loadFallbackData = async () => {
    try {
      // Get current mood from latest mood entry
      try {
        const moodResponse = await moodAPI.getMoodEntries({ 
          limit: 1, 
          orderBy: 'createdAt', 
          order: 'desc' 
        });
        if (moodResponse.data && moodResponse.data.length > 0) {
          setWellnessData(prev => ({ 
            ...prev, 
            currentMood: moodResponse.data[0].moodScore 
          }));
        }
      } catch (e) {
        console.log('Mood API fallback failed');
      }

      // Get user stats
      try {
        const statsResponse = await dashboardAPI.getUserStats();
        if (statsResponse.data) {
          setWellnessData(prev => ({
            ...prev,
            lastAssessment: statsResponse.data.lastAssessment,
            unreadMessages: statsResponse.data.unreadMessages || 0
          }));
        }
      } catch (e) {
        console.log('User stats API fallback failed');
      }
    } catch (error) {
      console.log('All fallback API calls failed, using mock data');
      await loadMockData();
    }
  };

  // Load mock data for development/offline mode
  const loadMockData = async () => {
    console.log('Loading mock dashboard data...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setWellnessData({
      currentMood: 7,
      weeklyTrend: 'improving',
      lastAssessment: '2 days ago',
      upcomingAppointments: 1,
      completedSessions: 3,
      unreadMessages: 2
    });

    // Use local activities first, add mock data only if no local activities exist
    const localActivities = activityService.getRecentActivity();
    
    if (localActivities.length === 0) {
      // Only add mock data if user has no activities yet
      setRecentActivity([
        {
          id: Date.now(),
          type: 'welcome',
          title: 'Welcome to MindBot! 🌟',
          timestamp: 'Just now',
          value: 'Get started',
          icon: 'Heart',
          color: 'primary'
        }
      ]);
    } else {
      setRecentActivity(localActivities);
    }
  };

  // Calculate weekly mood trend
  const calculateWeeklyTrend = (moodData) => {
    if (!Array.isArray(moodData) || moodData.length < 2) {
      return 'stable';
    }

    const recentMoods = moodData.slice(-3);
    const olderMoods = moodData.slice(0, -3);
    
    if (recentMoods.length === 0) return 'stable';
    
    const recentAvg = recentMoods.reduce((sum, entry) => sum + (entry.moodScore || entry.mood || 5), 0) / recentMoods.length;
    const olderAvg = olderMoods.length > 0 
      ? olderMoods.reduce((sum, entry) => sum + (entry.moodScore || entry.mood || 5), 0) / olderMoods.length
      : recentAvg;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  };

  // Refresh dashboard data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // Auto-refresh every 5 minutes when tab is active
  useEffect(() => {
    if (isAuthenticated && user) {
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchDashboardData();
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'AI Chat Support',
      description: 'Get immediate support with sentiment analysis',
      icon: MessageCircle,
      link: '/chat',
      color: 'primary',
      urgent: false,
      badge: '24/7 Support'
    },
    {
      title: 'Book Appointment',
      description: 'Schedule with licensed counselors',
      icon: Calendar,
      link: '/book-appointment',
      color: 'success',
      urgent: false,
      badge: 'Professional'
    },
    {
      title: 'Mental Health Assessment',
      description: 'Take PHQ-9, GAD-7, or GHQ assessments',
      icon: ClipboardList,
      link: '/assessment',
      color: 'warning',
      urgent: true,
      badge: 'Clinical Tools'
    },
    {
      title: 'Mood Tracker',
      description: 'Daily mood logging with analytics',
      icon: Activity,
      link: '/mood-tracker',
      color: 'danger',
      urgent: false,
      badge: 'Daily Check-in'
    },
    {
      title: 'Wellness Resources',
      description: 'Videos, guides, and relaxation tools',
      icon: BookOpen,
      link: '/resources',
      color: 'secondary',
      urgent: false,
      badge: 'Learn & Grow'
    },
    {
      title: 'Peer Support',
      description: 'Connect with fellow students',
      icon: Users,
      link: '/peer-support',
      color: 'primary',
      urgent: false,
      badge: 'Community'
    }
  ];

  const moodColors = {
    1: 'bg-danger-500',
    2: 'bg-danger-400',
    3: 'bg-warning-500',
    4: 'bg-warning-400',
    5: 'bg-warning-300',
    6: 'bg-success-300',
    7: 'bg-success-400',
    8: 'bg-success-500',
    9: 'bg-success-600',
    10: 'bg-success-700'
  };

  const getMoodLabel = (mood) => {
    if (mood <= 3) return 'Needs Attention';
    if (mood <= 5) return 'Fair';
    if (mood <= 7) return 'Good';
    if (mood <= 9) return 'Very Good';
    return 'Excellent';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-mint-200/20 rounded-full blur-lg"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            {/* Heart Icon */}
            <div className="mb-8">
              <Heart className="h-16 w-16 text-primary-500 mx-auto animate-pulse" />
            </div>
            
            {/* Welcome Message */}
            <h1 className="text-3xl font-bold text-secondary-800 mb-4">
              Welcome to MindCare
            </h1>
            <p className="text-secondary-600 mb-8 leading-relaxed">
              Your journey to better mental health starts here
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Link 
                to="/login" 
                className="block w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="block w-full py-4 px-6 bg-gradient-to-r from-mint-500 to-mint-600 text-white font-semibold rounded-2xl hover:from-mint-600 hover:to-mint-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="healing-bg floating-shapes relative min-h-screen">
      <div className="calm-overlay absolute inset-0 z-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-4">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600/90 via-mint-500/90 to-lavender-500/90 text-white rounded-2xl p-8 backdrop-blur-sm shadow-xl border border-white/20 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 animate-slide-up">
                Welcome back, {user?.firstName || 'Student'}! 🌱
              </h1>
              <p className="text-white/90 text-lg animate-fade-in">
                How are you feeling today? Your mental health journey matters.
              </p>
              {error && (
                <div className="mt-2 text-yellow-200 text-sm flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm text-white">
                  <p className="font-medium">{user?.firstName || 'User'}</p>
                  <p className="text-white/80 text-xs">{user?.role || 'Student'}</p>
                </div>
              </div>
              
              {refreshing ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                <button 
                  onClick={handleRefresh}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
              
              <div className="breathing-circle bg-white/20"></div>
            </div>
            
            {/* Mobile Logout Button */}
            <div className="md:hidden mt-3">
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 backdrop-blur-sm w-full justify-center"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Wellness Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <div className="card hover:scale-105 transform transition-all duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 mb-1">Current Mood</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="h-6 w-6 animate-spin text-primary-600" />
                    <span className="text-sm text-secondary-500">Loading...</span>
                  </div>
                ) : wellnessData.currentMood ? (
                  <>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-mint-600 bg-clip-text text-transparent">
                      {wellnessData.currentMood}/10
                    </p>
                    <p className={`text-sm font-medium ${
                      wellnessData.currentMood <= 5 ? 'text-warning-600' : 'text-success-600'
                    }`}>
                      {getMoodLabel(wellnessData.currentMood)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-secondary-400">--</p>
                    <p className="text-sm font-medium text-secondary-500">No data yet</p>
                  </>
                )}
              </div>
              <div className={`w-16 h-16 rounded-full ${
                wellnessData.currentMood ? moodColors[wellnessData.currentMood] : 'bg-secondary-300'
              } flex items-center justify-center animate-breathe shadow-lg`}>
                {isLoading ? (
                  <Loader className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Heart className="h-8 w-8 text-white animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-300 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 mb-1">Weekly Trend</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="h-6 w-6 animate-spin text-success-600" />
                    <span className="text-sm text-secondary-500">Loading...</span>
                  </div>
                ) : wellnessData.weeklyTrend ? (
                  <>
                    <p className="text-3xl font-bold bg-gradient-to-r from-success-600 to-mint-600 bg-clip-text text-transparent capitalize">
                      {wellnessData.weeklyTrend}
                    </p>
                    <p className={`text-sm font-medium ${
                      wellnessData.weeklyTrend === 'improving' ? 'text-success-600' :
                      wellnessData.weeklyTrend === 'declining' ? 'text-warning-600' : 'text-secondary-600'
                    }`}>
                      {wellnessData.weeklyTrend === 'improving' ? 'Keep it up! 📈' :
                       wellnessData.weeklyTrend === 'declining' ? 'Let\'s improve 💪' : 'Staying steady 😊'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-secondary-400">--</p>
                    <p className="text-sm font-medium text-secondary-500">No trend data</p>
                  </>
                )}
              </div>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                wellnessData.weeklyTrend === 'improving' ? 'from-success-400 to-success-600' :
                wellnessData.weeklyTrend === 'declining' ? 'from-warning-400 to-warning-600' :
                'from-secondary-400 to-secondary-600'
              } flex items-center justify-center animate-gentle-bounce shadow-lg`}>
                {isLoading ? (
                  <Loader className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 mb-1">Appointments</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="h-6 w-6 animate-spin text-primary-600" />
                    <span className="text-sm text-secondary-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-lavender-600 bg-clip-text text-transparent">
                      {wellnessData.upcomingAppointments}
                    </p>
                    <p className="text-sm font-medium text-primary-600">
                      {wellnessData.upcomingAppointments === 0 ? 'None scheduled' :
                       wellnessData.upcomingAppointments === 1 ? 'Upcoming 📅' : `Upcoming 📅`}
                    </p>
                  </>
                )}
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-float shadow-lg">
                {isLoading ? (
                  <Loader className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Calendar className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 mb-1">Sessions</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="h-6 w-6 animate-spin text-success-600" />
                    <span className="text-sm text-secondary-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold bg-gradient-to-r from-success-600 to-mint-600 bg-clip-text text-transparent">
                      {wellnessData.completedSessions}
                    </p>
                    <p className="text-sm font-medium text-success-600">
                      {wellnessData.completedSessions === 0 ? 'Get started!' : 'Completed ✅'}
                    </p>
                  </>
                )}
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center animate-breathe shadow-lg">
                {isLoading ? (
                  <Loader className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
          </div>
      </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary-700 via-primary-600 to-mint-600 bg-clip-text text-transparent mb-2">
              Your Wellness Toolkit 🧠
            </h2>
            <p className="text-secondary-600">Choose the support that feels right for you today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map(({ title, description, icon: Icon, link, color, urgent, badge }, index) => (
              <Link
                key={title}
                to={link}
                className={`group card hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden animate-fade-in ${
                  urgent ? 'ring-2 ring-warning-300 animate-pulse' : ''
                }`}
                style={{animationDelay: `${0.5 + index * 0.1}s`}}
              >
                {urgent && (
                  <div className="absolute top-3 right-3 z-10">
                    <AlertTriangle className="h-6 w-6 text-warning-500 animate-bounce" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning-400 rounded-full animate-ping"></span>
                  </div>
                )}
                {badge && (
                  <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-secondary-700 shadow-md">
                    {badge}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center mb-6 shadow-lg group-hover:animate-gentle-bounce`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-800 mb-3 group-hover:text-primary-600 transition-colors">
                  {title}
                </h3>
                <p className="text-secondary-600 group-hover:text-secondary-700 transition-colors leading-relaxed">
                  {description}
                </p>
                <div className="mt-4 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Get Started →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Video/Audio Call Support */}
        {callServiceReady && (
          <div className="animate-slide-up" style={{animationDelay: '0.7s'}}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary-700 via-primary-600 to-success-600 bg-clip-text text-transparent mb-2">
                Connect with Counselors 📞
              </h2>
              <p className="text-secondary-600">Get personal support through video or audio calls</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CounselorSelector />
              
              {/* Call Status Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary-600" />
                  Call Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Service Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      callServiceReady ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                    }`}>
                      {callServiceReady ? 'Ready' : 'Initializing...'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600">Current Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      callStatus === 'idle' ? 'bg-gray-100 text-gray-700' :
                      callStatus === 'calling' ? 'bg-yellow-100 text-yellow-700' :
                      callStatus === 'connected' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {callStatus}
                    </span>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How it works:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Click video or audio call button</li>
                          <li>• Counselor will receive notification</li>
                          <li>• Accept call to start session</li>
                          <li>• Encrypted peer-to-peer connection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {callStatus !== 'idle' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        {callStatus === 'calling' ? '📞 Calling counselor...' :
                         callStatus === 'ringing' ? '📞 Incoming call...' :
                         callStatus === 'connected' ? '✅ Call in progress' : 
                         '🔄 Connecting...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="animate-slide-up" style={{animationDelay: '0.8s'}}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary-700 via-primary-600 to-lavender-600 bg-clip-text text-transparent mb-2">
              Your Journey So Far 🌱
            </h2>
            <p className="text-secondary-600">Every step forward is progress worth celebrating</p>
          </div>
          <div className="card">
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary-600" />
                  <span className="ml-2 text-secondary-600">Loading recent activity...</span>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const IconComponent = {
                    'ClipboardList': ClipboardList,
                    'MessageCircle': MessageCircle,
                    'BookOpen': BookOpen,
                    'Calendar': Calendar,
                    'Activity': Activity,
                    'Heart': Heart
                  }[activity.icon] || ClipboardList;
                  
                  const colorClasses = {
                    'success': 'from-success-400 to-success-600',
                    'primary': 'from-primary-400 to-primary-600',
                    'warning': 'from-warning-400 to-warning-600',
                    'danger': 'from-danger-400 to-danger-600'
                  };
                  
                  const textColors = {
                    'success': 'text-success-600',
                    'primary': 'text-primary-600',
                    'warning': 'text-warning-600',
                    'danger': 'text-danger-600'
                  };
                  
                  return (
                    <div 
                      key={activity.id || index}
                      className="flex items-center space-x-4 py-4 hover:bg-white/50 rounded-lg transition-colors duration-200 animate-fade-in"
                      style={{animationDelay: `${0.9 + index * 0.1}s`}}
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                        colorClasses[activity.color] || colorClasses.primary
                      } flex items-center justify-center shadow-lg animate-gentle-bounce`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-800 mb-1">{activity.title}</p>
                        <p className="text-sm text-secondary-600">{activity.timestamp}</p>
                      </div>
                      <div className={`font-medium ${
                        textColors[activity.color] || textColors.primary
                      }`}>
                        {activity.value}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-secondary-400 mx-auto mb-3" />
                  <p className="text-secondary-600 mb-2">No recent activity</p>
                  <p className="text-sm text-secondary-500">Start your wellness journey today!</p>
                  <Link 
                    to="/chat" 
                    className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Begin with AI Support
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
