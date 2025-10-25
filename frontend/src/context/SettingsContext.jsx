import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  // Notification Settings
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    assessmentReminders: true,
    dailyCheckIns: false,
    weeklyReports: true,
  },
  
  // Privacy Settings
  privacy: {
    shareDataForResearch: false,
    allowAnonymousUsage: true,
    showOnlineStatus: false,
    profileVisibility: 'private', // 'public', 'private', 'friends'
  },
  
  // App Behavior Settings
  appBehavior: {
    theme: 'light', // 'light', 'dark', 'auto'
    language: 'en', // 'en', 'hi', 'regional'
    chatRetention: 'until-end-session', // 'until-end-session', '7-days', '30-days', 'forever'
    autoSave: true,
    soundEffects: true,
    animations: true,
  },
  
  // Accessibility Settings
  accessibility: {
    fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
    highContrast: false,
    screenReader: false,
    reducedMotion: false,
    keyboardNavigation: false,
  },
  
  // Mental Health Specific Settings
  mentalHealth: {
    crisisMode: false,
    emergencyContacts: [],
    preferredCounselorGender: 'no-preference', // 'no-preference', 'male', 'female'
    sessionReminders: 30, // minutes before
    moodTrackingFrequency: 'daily', // 'daily', 'weekly', 'as-needed'
    shareProgressWithCounselor: true,
  },
  
  // AI Chat Settings
  aiChat: {
    personalizedResponses: true,
    contextAwareness: true,
    emotionalTone: 'empathetic', // 'professional', 'empathetic', 'casual'
    responseSpeed: 'normal', // 'fast', 'normal', 'thoughtful'
    saveConversations: true,
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('mindcare-settings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return defaultSettings;
    }
  });

  const [loading, setLoading] = useState(false);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem('mindcare-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (category, newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        ...newSettings
      }
    }));
  };

  const updateSetting = (category, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value
      }
    }));
  };


  const contextValue = {
    settings,
    updateSettings,
    updateSetting,
    loading,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;