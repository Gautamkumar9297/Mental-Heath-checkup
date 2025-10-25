import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Activity,
  Heart,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    wellnessUpdates: true,
    crisisAlerts: true
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, checked) => {
    setNotifications(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically call an API to update the user profile
      console.log('Saving profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // Here you would typically call an API to update the password
      console.log('Updating password');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">My Profile</h1>
          <p className="text-secondary-600">Manage your account information and preferences</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200">
              {/* Profile Header */}
              <div className="p-6 border-b border-secondary-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg hover:bg-secondary-600 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-secondary-900">
                        {user?.name || `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim()}
                      </h2>
                      <p className="text-secondary-600">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Account Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-4 py-2 bg-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary-600" />
                    <span>Personal Information</span>
                  </h3>
                  
                  {/* Full Name Field (from signup) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Full Name <span className="text-xs text-secondary-500">(as used during signup)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        placeholder="Your full name"
                      />
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-secondary-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        />
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-secondary-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        />
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-secondary-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Date of Birth <span className="text-xs text-secondary-500">(as used during signup)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        />
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-secondary-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Address</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) => handleProfileChange('address', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        />
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-secondary-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span>Emergency Contact</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={profileData.emergencyContact}
                        onChange={(e) => handleProfileChange('emergencyContact', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={profileData.emergencyPhone}
                        onChange={(e) => handleProfileChange('emergencyPhone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:text-secondary-600"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-primary-600" />
                      <span>Password & Security</span>
                    </h3>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {showPasswordChange ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <div className="space-y-4 p-4 bg-secondary-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className="w-full pr-10 pl-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-secondary-500 hover:text-secondary-700"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className="w-full pr-10 pl-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-secondary-500 hover:text-secondary-700"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handlePasswordUpdate}
                        className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <span>Account Overview</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Member since</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Sessions completed</span>
                  <span className="text-sm font-medium text-secondary-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Wellness score</span>
                  <span className="text-sm font-medium text-green-600 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>8.2/10</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Account status</span>
                  <span className="text-sm font-medium text-green-600 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <span>Notifications</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleNotificationChange(key, e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-secondary-50 transition-colors flex items-center space-x-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-secondary-700">Export My Data</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-secondary-50 transition-colors flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-secondary-700">Privacy Settings</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;