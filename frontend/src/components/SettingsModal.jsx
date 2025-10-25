import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Settings as SettingsIcon,
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting } = useSettings();

  if (!isOpen) return null;

  const QuickToggle = ({ enabled, onChange, icon: Icon, disabledIcon: DisabledIcon, label, description }) => (
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
    >
      <div className="flex items-center">
        {enabled ? (
          <Icon className="h-5 w-5 text-primary-600 mr-3" />
        ) : (
          <DisabledIcon className="h-5 w-5 text-gray-400 mr-3" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  );

  const ThemeSelector = () => (
    <div className="p-3">
      <p className="text-sm font-medium text-gray-900 mb-2">Theme</p>
      <div className="flex space-x-2">
        {[
          { value: 'light', label: 'Light', icon: Sun },
          { value: 'dark', label: 'Dark', icon: Moon },
          { value: 'auto', label: 'Auto', icon: SettingsIcon },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => updateSetting('appBehavior', 'theme', value)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              settings.appBehavior.theme === value
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <SettingsIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Quick Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-1">
              {/* Theme Selector */}
              <ThemeSelector />

              <div className="border-t border-gray-200 pt-3 mt-3">
                {/* Quick Toggles */}
                <QuickToggle
                  enabled={settings.notifications.pushNotifications}
                  onChange={() => updateSetting('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                  icon={Bell}
                  disabledIcon={BellOff}
                  label="Push Notifications"
                  description="Enable app notifications"
                />

                <QuickToggle
                  enabled={settings.appBehavior.soundEffects}
                  onChange={() => updateSetting('appBehavior', 'soundEffects', !settings.appBehavior.soundEffects)}
                  icon={Volume2}
                  disabledIcon={VolumeX}
                  label="Sound Effects"
                  description="Play notification sounds"
                />

                <QuickToggle
                  enabled={settings.accessibility.highContrast}
                  onChange={() => updateSetting('accessibility', 'highContrast', !settings.accessibility.highContrast)}
                  icon={Eye}
                  disabledIcon={EyeOff}
                  label="High Contrast"
                  description="Improve visibility"
                />

                <QuickToggle
                  enabled={settings.mentalHealth.crisisMode}
                  onChange={() => updateSetting('mentalHealth', 'crisisMode', !settings.mentalHealth.crisisMode)}
                  icon={SettingsIcon}
                  disabledIcon={SettingsIcon}
                  label="Crisis Mode"
                  description="Emergency support access"
                />
              </div>

              {/* Font Size Quick Selector */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm font-medium text-gray-900 mb-2">Font Size</p>
                <div className="flex space-x-1">
                  {[
                    { value: 'small', label: 'A' },
                    { value: 'medium', label: 'A' },
                    { value: 'large', label: 'A' },
                    { value: 'extra-large', label: 'A' },
                  ].map(({ value, label }, index) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('accessibility', 'fontSize', value)}
                      className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs font-medium transition-colors ${
                        settings.accessibility.fontSize === value
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ fontSize: `${0.6 + index * 0.1}rem` }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <Link
              to="/settings"
              onClick={onClose}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;