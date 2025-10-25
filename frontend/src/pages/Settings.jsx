import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Smartphone,
  Eye,
  Heart,
  MessageCircle,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Phone,
  Plus,
  X
} from 'lucide-react';

const Settings = () => {
  const { settings, updateSetting } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saveStatus, setSaveStatus] = useState('');

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appBehavior', label: 'App Behavior', icon: Smartphone },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'mentalHealth', label: 'Mental Health', icon: Heart },
    { id: 'aiChat', label: 'AI Assistant', icon: MessageCircle },
  ];

  const handleToggle = (category, key) => {
    updateSetting(category, key, !settings[category][key]);
    showSaveConfirmation();
  };

  const handleSelectChange = (category, key, value) => {
    updateSetting(category, key, value);
    showSaveConfirmation();
  };

  const handleNumberChange = (category, key, value) => {
    updateSetting(category, key, parseInt(value));
    showSaveConfirmation();
  };

  const showSaveConfirmation = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };


  const addEmergencyContact = () => {
    const newContacts = [
      ...settings.mentalHealth.emergencyContacts,
      { name: '', phone: '', relationship: '' }
    ];
    updateSetting('mentalHealth', 'emergencyContacts', newContacts);
  };

  const updateEmergencyContact = (index, field, value) => {
    const updatedContacts = settings.mentalHealth.emergencyContacts.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    updateSetting('mentalHealth', 'emergencyContacts', updatedContacts);
  };

  const removeEmergencyContact = (index) => {
    const updatedContacts = settings.mentalHealth.emergencyContacts.filter((_, i) => i !== index);
    updateSetting('mentalHealth', 'emergencyContacts', updatedContacts);
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectDropdown = ({ value, onChange, options, label, description }) => (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</label>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notification Preferences</h3>
            <div className="space-y-2">
              <ToggleSwitch
                enabled={settings.notifications.emailNotifications}
                onChange={() => handleToggle('notifications', 'emailNotifications')}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              <ToggleSwitch
                enabled={settings.notifications.pushNotifications}
                onChange={() => handleToggle('notifications', 'pushNotifications')}
                label="Push Notifications"
                description="Receive push notifications on your device"
              />
              <ToggleSwitch
                enabled={settings.notifications.appointmentReminders}
                onChange={() => handleToggle('notifications', 'appointmentReminders')}
                label="Appointment Reminders"
                description="Get reminded about upcoming appointments"
              />
              <ToggleSwitch
                enabled={settings.notifications.assessmentReminders}
                onChange={() => handleToggle('notifications', 'assessmentReminders')}
                label="Assessment Reminders"
                description="Regular reminders to complete mental health assessments"
              />
              <ToggleSwitch
                enabled={settings.notifications.dailyCheckIns}
                onChange={() => handleToggle('notifications', 'dailyCheckIns')}
                label="Daily Check-ins"
                description="Daily prompts to track your mood and wellbeing"
              />
              <ToggleSwitch
                enabled={settings.notifications.weeklyReports}
                onChange={() => handleToggle('notifications', 'weeklyReports')}
                label="Weekly Reports"
                description="Receive weekly summaries of your mental health journey"
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Privacy & Security Settings</h3>
            <div className="space-y-2">
              <ToggleSwitch
                enabled={settings.privacy.shareDataForResearch}
                onChange={() => handleToggle('privacy', 'shareDataForResearch')}
                label="Share Data for Research"
                description="Allow anonymized data to be used for mental health research"
              />
              <ToggleSwitch
                enabled={settings.privacy.allowAnonymousUsage}
                onChange={() => handleToggle('privacy', 'allowAnonymousUsage')}
                label="Anonymous Usage Analytics"
                description="Help improve the app by sharing anonymous usage data"
              />
              <ToggleSwitch
                enabled={settings.privacy.showOnlineStatus}
                onChange={() => handleToggle('privacy', 'showOnlineStatus')}
                label="Show Online Status"
                description="Let others see when you're active in peer support"
              />
              <SelectDropdown
                value={settings.privacy.profileVisibility}
                onChange={(value) => handleSelectChange('privacy', 'profileVisibility', value)}
                label="Profile Visibility"
                description="Control who can see your profile information"
                options={[
                  { value: 'private', label: 'Private - Only you' },
                  { value: 'friends', label: 'Peer Support Connections' },
                  { value: 'public', label: 'Public - All users' },
                ]}
              />
            </div>
          </div>
        );

      case 'appBehavior':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">App Behavior</h3>
            <div className="space-y-2">
              <SelectDropdown
                value={settings.appBehavior.theme}
                onChange={(value) => handleSelectChange('appBehavior', 'theme', value)}
                label="Theme"
                description="Choose your preferred app appearance"
                options={[
                  { value: 'light', label: 'Light Mode' },
                  { value: 'dark', label: 'Dark Mode' },
                  { value: 'auto', label: 'System Default' },
                ]}
              />
              <SelectDropdown
                value={settings.appBehavior.language}
                onChange={(value) => handleSelectChange('appBehavior', 'language', value)}
                label="Language"
                description="Select your preferred language"
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'हिंदी (Hindi)' },
                  { value: 'regional', label: 'Regional Language' },
                ]}
              />
              <SelectDropdown
                value={settings.appBehavior.chatRetention}
                onChange={(value) => handleSelectChange('appBehavior', 'chatRetention', value)}
                label="Chat History Retention"
                description="How long to keep your chat conversations"
                options={[
                  { value: 'until-end-session', label: 'Until End of Session' },
                  { value: '7-days', label: '7 Days' },
                  { value: '30-days', label: '30 Days' },
                  { value: 'forever', label: 'Forever' },
                ]}
              />
              <ToggleSwitch
                enabled={settings.appBehavior.autoSave}
                onChange={() => handleToggle('appBehavior', 'autoSave')}
                label="Auto-Save"
                description="Automatically save your progress and data"
              />
              <ToggleSwitch
                enabled={settings.appBehavior.soundEffects}
                onChange={() => handleToggle('appBehavior', 'soundEffects')}
                label="Sound Effects"
                description="Play sounds for notifications and interactions"
              />
              <ToggleSwitch
                enabled={settings.appBehavior.animations}
                onChange={() => handleToggle('appBehavior', 'animations')}
                label="Animations"
                description="Enable smooth animations throughout the app"
              />
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Accessibility Settings</h3>
            <div className="space-y-2">
              <SelectDropdown
                value={settings.accessibility.fontSize}
                onChange={(value) => handleSelectChange('accessibility', 'fontSize', value)}
                label="Font Size"
                description="Adjust text size for better readability"
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium (Default)' },
                  { value: 'large', label: 'Large' },
                  { value: 'extra-large', label: 'Extra Large' },
                ]}
              />
              <ToggleSwitch
                enabled={settings.accessibility.highContrast}
                onChange={() => handleToggle('accessibility', 'highContrast')}
                label="High Contrast"
                description="Increase contrast for better visibility"
              />
              <ToggleSwitch
                enabled={settings.accessibility.screenReader}
                onChange={() => handleToggle('accessibility', 'screenReader')}
                label="Screen Reader Support"
                description="Optimize for screen reader accessibility"
              />
              <ToggleSwitch
                enabled={settings.accessibility.reducedMotion}
                onChange={() => handleToggle('accessibility', 'reducedMotion')}
                label="Reduced Motion"
                description="Minimize animations and motion effects"
              />
              <ToggleSwitch
                enabled={settings.accessibility.keyboardNavigation}
                onChange={() => handleToggle('accessibility', 'keyboardNavigation')}
                label="Enhanced Keyboard Navigation"
                description="Improve navigation using keyboard only"
              />
            </div>
          </div>
        );

      case 'mentalHealth':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Mental Health Settings</h3>
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="text-sm font-medium text-red-800">Crisis Mode</h4>
                </div>
                <div className="mt-2">
                  <ToggleSwitch
                    enabled={settings.mentalHealth.crisisMode}
                    onChange={() => handleToggle('mentalHealth', 'crisisMode')}
                    label="Enable Crisis Mode"
                    description="Quick access to emergency resources and contacts"
                  />
                </div>
              </div>

              <div className="py-3">
                <label className="block text-sm font-medium text-gray-900 mb-2">Emergency Contacts</label>
                <p className="text-sm text-gray-500 mb-3">Add trusted contacts for emergency situations</p>
                
                {settings.mentalHealth.emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={contact.relationship}
                          onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                          className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          onClick={() => removeEmergencyContact(index)}
                          className="ml-2 p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addEmergencyContact}
                  className="flex items-center text-primary-600 hover:text-primary-800 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Emergency Contact
                </button>
              </div>

              <SelectDropdown
                value={settings.mentalHealth.preferredCounselorGender}
                onChange={(value) => handleSelectChange('mentalHealth', 'preferredCounselorGender', value)}
                label="Preferred Counselor Gender"
                description="Choose your preference for counselor gender"
                options={[
                  { value: 'no-preference', label: 'No Preference' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
              />

              <div className="py-3">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Session Reminders ({settings.mentalHealth.sessionReminders} minutes before)
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.mentalHealth.sessionReminders}
                  onChange={(e) => handleNumberChange('mentalHealth', 'sessionReminders', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>2 hours</span>
                </div>
              </div>

              <SelectDropdown
                value={settings.mentalHealth.moodTrackingFrequency}
                onChange={(value) => handleSelectChange('mentalHealth', 'moodTrackingFrequency', value)}
                label="Mood Tracking Frequency"
                description="How often you'd like to track your mood"
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'as-needed', label: 'As Needed' },
                ]}
              />

              <ToggleSwitch
                enabled={settings.mentalHealth.shareProgressWithCounselor}
                onChange={() => handleToggle('mentalHealth', 'shareProgressWithCounselor')}
                label="Share Progress with Counselor"
                description="Allow your counselor to view your mood tracking and assessment data"
              />
            </div>
          </div>
        );

      case 'aiChat':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">AI Assistant Settings</h3>
            <div className="space-y-2">
              <ToggleSwitch
                enabled={settings.aiChat.personalizedResponses}
                onChange={() => handleToggle('aiChat', 'personalizedResponses')}
                label="Personalized Responses"
                description="Allow MindBot to personalize responses based on your history"
              />
              <ToggleSwitch
                enabled={settings.aiChat.contextAwareness}
                onChange={() => handleToggle('aiChat', 'contextAwareness')}
                label="Context Awareness"
                description="MindBot remembers context within conversations"
              />
              <SelectDropdown
                value={settings.aiChat.emotionalTone}
                onChange={(value) => handleSelectChange('aiChat', 'emotionalTone', value)}
                label="Emotional Tone"
                description="Choose how MindBot should communicate with you"
                options={[
                  { value: 'professional', label: 'Professional' },
                  { value: 'empathetic', label: 'Empathetic' },
                  { value: 'casual', label: 'Casual & Friendly' },
                ]}
              />
              <SelectDropdown
                value={settings.aiChat.responseSpeed}
                onChange={(value) => handleSelectChange('aiChat', 'responseSpeed', value)}
                label="Response Speed"
                description="How quickly MindBot should respond"
                options={[
                  { value: 'fast', label: 'Fast - Quick responses' },
                  { value: 'normal', label: 'Normal - Balanced responses' },
                  { value: 'thoughtful', label: 'Thoughtful - Detailed responses' },
                ]}
              />
              <ToggleSwitch
                enabled={settings.aiChat.saveConversations}
                onChange={() => handleToggle('aiChat', 'saveConversations')}
                label="Save Conversations"
                description="Keep chat history for future reference and continuity"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SettingsIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
              </div>
              <div className="flex items-center space-x-3">
                {saveStatus === 'saved' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Error</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your MindCare preferences and privacy settings</p>
          </div>

        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-3" />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
              <div className="px-6 py-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;