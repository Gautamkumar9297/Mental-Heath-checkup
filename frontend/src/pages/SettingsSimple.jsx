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
  MessageCircle
} from 'lucide-react';

const SettingsSimple = () => {
  const { settings, updateSetting } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
  ];

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
            <div className="space-y-2">
              <ToggleSwitch
                enabled={settings.notifications.emailNotifications}
                onChange={() => updateSetting('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              <ToggleSwitch
                enabled={settings.notifications.pushNotifications}
                onChange={() => updateSetting('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                label="Push Notifications"
                description="Receive push notifications on your device"
              />
              <ToggleSwitch
                enabled={settings.notifications.appointmentReminders}
                onChange={() => updateSetting('notifications', 'appointmentReminders', !settings.notifications.appointmentReminders)}
                label="Appointment Reminders"
                description="Get reminded about upcoming appointments"
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
            <div className="space-y-2">
              <ToggleSwitch
                enabled={settings.privacy.shareDataForResearch}
                onChange={() => updateSetting('privacy', 'shareDataForResearch', !settings.privacy.shareDataForResearch)}
                label="Share Data for Research"
                description="Allow anonymized data to be used for mental health research"
              />
              <ToggleSwitch
                enabled={settings.privacy.allowAnonymousUsage}
                onChange={() => updateSetting('privacy', 'allowAnonymousUsage', !settings.privacy.allowAnonymousUsage)}
                label="Anonymous Usage Analytics"
                description="Help improve the app by sharing anonymous usage data"
              />
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Accessibility Settings</h3>
            <div className="space-y-2">
              <ToggleSwitch
                enabled={settings.accessibility.highContrast}
                onChange={() => updateSetting('accessibility', 'highContrast', !settings.accessibility.highContrast)}
                label="High Contrast"
                description="Increase contrast for better visibility"
              />
              <ToggleSwitch
                enabled={settings.accessibility.reducedMotion}
                onChange={() => updateSetting('accessibility', 'reducedMotion', !settings.accessibility.reducedMotion)}
                label="Reduced Motion"
                description="Minimize animations and motion effects"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <SettingsIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <p className="text-gray-600 mt-1">Manage your MindCare preferences and privacy settings</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm">
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

export default SettingsSimple;