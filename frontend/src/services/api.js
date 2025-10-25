import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// User API
export const userAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getStats: (period = 30) => api.get(`/users/stats?period=${period}`),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  getPreferences: () => api.get('/users/preferences'),
  updateRiskLevel: (data) => api.put('/users/risk-level', data),
  addEmergencyContact: (contact) => api.post('/users/emergency-contact', contact),
  getActivitySummary: (days = 30) => api.get(`/users/activity-summary?days=${days}`),
};

// Mood API
export const moodAPI = {
  createMoodEntry: (moodData) => api.post('/moods', moodData),
  getMoodEntries: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/moods?${searchParams}`);
  },
  getMoodTrends: (days = 30) => api.get(`/moods/trends?days=${days}`),
  analyzeText: (text) => api.post('/moods/analyze-text', { text }),
  getCrisisCheck: () => api.get('/moods/crisis-check'),
};

// Chatbot API
export const chatbotAPI = {
  testChatGPT: () => api.get('/api/chatbot/test'),
  startSession: (demo = true) => api.post('/chatbot/start-session', { demo }),
  sendMessage: (sessionId, message) => 
    api.post(`/chatbot/${sessionId}/message`, { message }),
  endSession: (sessionId, feedback) => 
    api.post(`/chatbot/${sessionId}/end`, { feedback }),
  getConversation: (sessionId) => api.get(`/chatbot/${sessionId}/conversation`),
  getActiveSessions: () => api.get('/chatbot/active-sessions'),
  quickSupport: (message, context) => 
    api.post('/chatbot/quick-support', { message, context }),
  // Chat saving functionality
  saveChat: (chatData) => api.post('/chatbot/save-chat', chatData),
  getSavedChats: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/chatbot/saved-chats?${searchParams}`);
  },
  getSavedChatById: (chatId) => api.get(`/chatbot/saved-chats/${chatId}`),
  deleteSavedChat: (chatId) => api.delete(`/chatbot/saved-chats/${chatId}`),
  updateSavedChat: (chatId, updateData) => api.put(`/chatbot/saved-chats/${chatId}`, updateData),
  
  // New chat history and session management endpoints
  getChatHistory: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/api/chatbot/chat-history?${searchParams}`);
  },
  getRecentSessions: (limit = 10) => api.get(`/api/chatbot/recent?limit=${limit}`),
  continueSession: (sessionId) => api.post(`/api/chatbot/${sessionId}/continue`),
  pauseSession: (sessionId) => api.post(`/api/chatbot/${sessionId}/pause`),
  getSessionSummary: (sessionId) => api.get(`/api/chatbot/${sessionId}/summary`),
  deleteSession: (sessionId) => api.delete(`/api/chatbot/sessions/${sessionId}`),
};

// Session API
export const sessionAPI = {
  createSession: (sessionData) => api.post('/sessions', sessionData),
  getSessions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/sessions?${searchParams}`);
  },
  addMessage: (sessionId, messageData) => 
    api.post(`/sessions/${sessionId}/messages`, messageData),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/analytics/dashboard?${searchParams}`);
  },
  getMoodTrends: (period = 30) => api.get(`/analytics/mood-trends?period=${period}`),
  getMoodDistribution: (period = 30) => api.get(`/analytics/mood-distribution?period=${period}`),
  getEmotions: (period = 30) => api.get(`/analytics/emotions?period=${period}`),
  getSessionActivity: (period = 30) => api.get(`/analytics/session-activity?period=${period}`),
  getWellnessScore: () => api.get('/analytics/wellness-score'),
  getSummary: (period = 30) => api.get(`/analytics/summary?period=${period}`),
  getPredictions: () => api.get('/analytics/predictions'),
  getComparisons: (period = 30) => api.get(`/analytics/comparisons?period=${period}`),
  generateReport: (data) => api.post('/analytics/generate-report', data),
};

// Appointment API
export const appointmentAPI = {
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  getAppointments: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/appointments?${searchParams}`);
  },
  getUpcomingAppointments: () => api.get('/appointments/upcoming'),
  updateAppointment: (appointmentId, updateData) => 
    api.put(`/appointments/${appointmentId}`, updateData),
  cancelAppointment: (appointmentId, reason) => 
    api.put(`/appointments/${appointmentId}/cancel`, { reason }),
  getAppointmentById: (appointmentId) => api.get(`/appointments/${appointmentId}`),
  rescheduleAppointment: (appointmentId, newDateTime) => 
    api.put(`/appointments/${appointmentId}/reschedule`, { dateTime: newDateTime }),
};

// Assessment API
export const assessmentAPI = {
  submitPHQ9: (answers) => api.post('/assessments/phq9', { answers }),
  submitGAD7: (answers) => api.post('/assessments/gad7', { answers }),
  submitGHQ: (answers) => api.post('/assessments/ghq', { answers }),
  getAssessmentHistory: () => api.get('/assessments/history'),
  getLatestAssessment: (type) => api.get(`/assessments/latest?type=${type}`),
  getAllLatest: () => api.get('/assessments/latest-all'),
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
  getCurrentMood: () => api.get('/dashboard/current-mood'),
  getWeeklyTrend: () => api.get('/dashboard/weekly-trend'),
  getUpcomingAppointments: () => api.get('/dashboard/appointments'),
  getCompletedSessions: () => api.get('/dashboard/sessions'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getUserStats: () => api.get('/dashboard/user-stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
