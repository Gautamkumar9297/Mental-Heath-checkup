// Activity tracking service for dashboard display
import { format } from 'date-fns';

class ActivityService {
  constructor() {
    this.ACTIVITY_KEY = 'user_recent_activity';
    this.MAX_ACTIVITIES = 10; // Keep only the most recent 10 activities
  }

  // Get all recent activities
  getRecentActivity() {
    try {
      const activities = localStorage.getItem(this.ACTIVITY_KEY);
      return activities ? JSON.parse(activities) : [];
    } catch (error) {
      console.error('Error loading recent activity:', error);
      return [];
    }
  }

  // Add a new activity
  addActivity(type, title, details = {}) {
    try {
      const activities = this.getRecentActivity();
      
      const newActivity = {
        id: Date.now(),
        type: type,
        title: title,
        timestamp: format(new Date(), 'MMM dd, HH:mm'),
        timestampFull: new Date().toISOString(),
        value: details.value || '',
        icon: details.icon || this.getDefaultIcon(type),
        color: details.color || this.getDefaultColor(type),
        ...details
      };

      // Add to beginning of array (most recent first)
      activities.unshift(newActivity);
      
      // Keep only the most recent activities
      const trimmedActivities = activities.slice(0, this.MAX_ACTIVITIES);
      
      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(trimmedActivities));
      console.log('💫 Activity added:', newActivity.title);
      
      return newActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  }

  // Add chat session activity
  addChatActivity(sessionType, messageCount, duration = null) {
    const durationText = duration ? `${Math.ceil(duration / 60)}min` : `${messageCount} messages`;
    const emoji = sessionType === 'new' ? '🤖' : '💭';
    
    return this.addActivity(
      'chat',
      `${sessionType === 'new' ? 'Started' : 'Continued'} AI chat session ${emoji}`,
      {
        value: durationText,
        icon: 'MessageCircle',
        color: 'primary',
        messageCount: messageCount,
        sessionType: sessionType
      }
    );
  }

  // Add assessment activity
  addAssessmentActivity(assessmentType, score = null) {
    const emoji = '📋';
    const scoreText = score ? `Score: ${score}` : 'Completed';
    
    return this.addActivity(
      'assessment',
      `Completed ${assessmentType} assessment ${emoji}`,
      {
        value: scoreText,
        icon: 'ClipboardList',
        color: 'warning',
        assessmentType: assessmentType,
        score: score
      }
    );
  }

  // Add mood tracking activity
  addMoodActivity(moodScore, notes = '') {
    const emoji = moodScore >= 7 ? '😊' : moodScore >= 5 ? '😐' : '😔';
    
    return this.addActivity(
      'mood',
      `Mood check-in ${emoji}`,
      {
        value: `${moodScore}/10`,
        icon: 'Heart',
        color: moodScore >= 7 ? 'success' : moodScore >= 5 ? 'warning' : 'danger',
        moodScore: moodScore,
        notes: notes
      }
    );
  }

  // Add appointment activity
  addAppointmentActivity(action, appointmentDetails = {}) {
    const emoji = action === 'booked' ? '📅' : action === 'completed' ? '✅' : '📝';
    
    return this.addActivity(
      'appointment',
      `${action === 'booked' ? 'Booked' : action === 'completed' ? 'Completed' : 'Updated'} appointment ${emoji}`,
      {
        value: appointmentDetails.time || 'Scheduled',
        icon: 'Calendar',
        color: 'success',
        action: action,
        ...appointmentDetails
      }
    );
  }

  // Add resource activity
  addResourceActivity(resourceType, resourceName) {
    const emoji = resourceType === 'video' ? '🎥' : resourceType === 'article' ? '📚' : '🔗';
    
    return this.addActivity(
      'resource',
      `Viewed ${resourceType}: ${resourceName} ${emoji}`,
      {
        value: 'Completed',
        icon: 'BookOpen',
        color: 'secondary',
        resourceType: resourceType,
        resourceName: resourceName
      }
    );
  }

  // Get default icon for activity type
  getDefaultIcon(type) {
    const iconMap = {
      'chat': 'MessageCircle',
      'assessment': 'ClipboardList',
      'mood': 'Heart',
      'appointment': 'Calendar',
      'resource': 'BookOpen',
      'session': 'Activity'
    };
    return iconMap[type] || 'Activity';
  }

  // Get default color for activity type
  getDefaultColor(type) {
    const colorMap = {
      'chat': 'primary',
      'assessment': 'warning',
      'mood': 'success',
      'appointment': 'success',
      'resource': 'secondary',
      'session': 'primary'
    };
    return colorMap[type] || 'primary';
  }

  // Clear all activities (for testing/reset)
  clearAllActivities() {
    localStorage.removeItem(this.ACTIVITY_KEY);
    console.log('🗑️ All activities cleared');
  }

  // Get activities by type
  getActivitiesByType(type) {
    return this.getRecentActivity().filter(activity => activity.type === type);
  }

  // Get activity count by type
  getActivityCount(type) {
    return this.getActivitiesByType(type).length;
  }

  // Get most recent activity
  getMostRecentActivity() {
    const activities = this.getRecentActivity();
    return activities.length > 0 ? activities[0] : null;
  }
}

// Export singleton instance
export default new ActivityService();