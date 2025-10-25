import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  TrendingUp,
  Activity,
  Plus,
  Save,
  BarChart3,
  Clock,
  Target,
  Zap,
  Brain,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MoodTracker = ({ userId = null, showHistory = true, compact = false }) => {
  const [currentMood, setCurrentMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('tracker'); // 'tracker', 'history', 'analytics'
  const [emotions, setEmotions] = useState([]);
  const [activities, setActivities] = useState([]);

  // Mood scale definitions
  const moodScale = [
    { 
      value: 1, 
      label: 'Very Bad', 
      emoji: '😢', 
      color: 'bg-red-500', 
      description: 'Feeling very low, depressed, or overwhelmed'
    },
    { 
      value: 2, 
      label: 'Bad', 
      emoji: '😔', 
      color: 'bg-orange-500', 
      description: 'Having a difficult day, feeling down'
    },
    { 
      value: 3, 
      label: 'Okay', 
      emoji: '😐', 
      color: 'bg-yellow-500', 
      description: 'Feeling neutral, neither good nor bad'
    },
    { 
      value: 4, 
      label: 'Good', 
      emoji: '🙂', 
      color: 'bg-green-500', 
      description: 'Having a positive day, feeling content'
    },
    { 
      value: 5, 
      label: 'Very Good', 
      emoji: '😊', 
      color: 'bg-emerald-500', 
      description: 'Feeling great, happy, or excited'
    }
  ];

  // Common emotions for tracking
  const emotionOptions = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-red-100 text-red-800' },
    { id: 'calm', label: 'Calm', emoji: '😌', color: 'bg-green-100 text-green-800' },
    { id: 'stressed', label: 'Stressed', emoji: '😤', color: 'bg-orange-100 text-orange-800' },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: 'bg-purple-100 text-purple-800' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: 'bg-gray-100 text-gray-800' },
    { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-100 text-red-800' },
    { id: 'hopeful', label: 'Hopeful', emoji: '🌟', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'grateful', label: 'Grateful', emoji: '🙏', color: 'bg-pink-100 text-pink-800' }
  ];

  // Activity options for mood correlation
  const activityOptions = [
    { id: 'exercise', label: 'Exercise', emoji: '🏃‍♂️' },
    { id: 'sleep', label: 'Good Sleep', emoji: '😴' },
    { id: 'social', label: 'Social Time', emoji: '👥' },
    { id: 'study', label: 'Study/Work', emoji: '📚' },
    { id: 'hobby', label: 'Hobbies', emoji: '🎨' },
    { id: 'nature', label: 'Nature/Outdoors', emoji: '🌳' },
    { id: 'meditation', label: 'Meditation', emoji: '🧘‍♂️' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'food', label: 'Good Meals', emoji: '🍎' },
    { id: 'screen', label: 'Screen Time', emoji: '📱' }
  ];

  // Generate mock mood history data
  useEffect(() => {
    const generateMockData = () => {
      const data = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic mood patterns
        const baseMood = 3 + Math.sin(i * 0.2) * 0.5; // Weekly patterns
        const randomVariation = (Math.random() - 0.5) * 1.5;
        const mood = Math.max(1, Math.min(5, Math.round(baseMood + randomVariation)));
        
        data.push({
          date: date.toISOString().split('T')[0],
          mood,
          emotions: emotionOptions.slice(0, Math.floor(Math.random() * 4) + 1).map(e => e.id),
          activities: activityOptions.slice(0, Math.floor(Math.random() * 5) + 2).map(a => a.id),
          note: Math.random() > 0.7 ? 'Sample mood note for this day' : '',
          timestamp: date
        });
      }
      setMoodHistory(data);
    };

    generateMockData();
  }, []);

  // Save mood entry
  const saveMoodEntry = async () => {
    if (!currentMood) return;

    setLoading(true);
    try {
      const entry = {
        date: selectedDate.toISOString().split('T')[0],
        mood: currentMood,
        emotions,
        activities,
        note: moodNote,
        timestamp: new Date()
      };

      // In real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local history
      setMoodHistory(prev => {
        const filtered = prev.filter(item => item.date !== entry.date);
        return [...filtered, entry].sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      // Reset form
      setCurrentMood(null);
      setMoodNote('');
      setEmotions([]);
      setActivities([]);
      
      alert('Mood entry saved successfully!');
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Error saving mood entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get mood statistics
  const getMoodStats = () => {
    if (moodHistory.length === 0) return null;

    const recentData = moodHistory.slice(0, 7);
    const avgMood = recentData.reduce((sum, entry) => sum + entry.mood, 0) / recentData.length;
    const trend = recentData.length > 1 ? 
      recentData[0].mood - recentData[recentData.length - 1].mood : 0;

    return {
      averageMood: avgMood.toFixed(1),
      trend: trend.toFixed(1),
      totalEntries: moodHistory.length,
      streak: calculateStreak()
    };
  };

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = moodHistory.some(entry => entry.date === dateStr);
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Prepare chart data
  const getChartData = () => {
    return moodHistory
      .slice(0, 14)
      .reverse()
      .map(entry => ({
        date: format(new Date(entry.date), 'MMM dd'),
        mood: entry.mood,
        activities: entry.activities.length
      }));
  };

  // Mood tracker view
  const renderMoodTracker = () => (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center space-x-4">
        <Calendar className="h-5 w-5 text-primary-600" />
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          max={new Date().toISOString().split('T')[0]}
          className="border border-secondary-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Mood Scale */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">How are you feeling today?</h3>
        <div className="grid grid-cols-5 gap-4">
          {moodScale.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setCurrentMood(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                currentMood === mood.value
                  ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                  : 'border-secondary-200 hover:border-primary-300 hover:shadow-md'
              }`}
              title={mood.description}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className={`w-4 h-4 ${mood.color} rounded-full mx-auto mb-2`}></div>
                <div className="text-sm font-medium text-secondary-700">{mood.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      {currentMood && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">What emotions are you experiencing?</h3>
          <div className="flex flex-wrap gap-2">
            {emotionOptions.map((emotion) => (
              <button
                key={emotion.id}
                onClick={() => {
                  setEmotions(prev => 
                    prev.includes(emotion.id)
                      ? prev.filter(id => id !== emotion.id)
                      : [...prev, emotion.id]
                  );
                }}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  emotions.includes(emotion.id)
                    ? `${emotion.color} shadow-md`
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                <span>{emotion.emoji}</span>
                <span>{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {currentMood && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">What activities did you do today?</h3>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((activity) => (
              <button
                key={activity.id}
                onClick={() => {
                  setActivities(prev => 
                    prev.includes(activity.id)
                      ? prev.filter(id => id !== activity.id)
                      : [...prev, activity.id]
                  );
                }}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activities.includes(activity.id)
                    ? 'bg-primary-100 text-primary-800 shadow-md border border-primary-300'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border border-secondary-200'
                }`}
              >
                <span>{activity.emoji}</span>
                <span>{activity.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {currentMood && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Additional notes (optional)</h3>
          <textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="How was your day? What influenced your mood?"
            className="w-full p-4 border border-secondary-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            maxLength={500}
          />
          <div className="text-sm text-secondary-500 text-right">
            {moodNote.length}/500 characters
          </div>
        </div>
      )}

      {/* Save Button */}
      {currentMood && (
        <button
          onClick={saveMoodEntry}
          disabled={loading}
          className="w-full btn-primary inline-flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>{loading ? 'Saving...' : 'Save Mood Entry'}</span>
        </button>
      )}
    </div>
  );

  // Mood history view
  const renderMoodHistory = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {getMoodStats() && (
          <>
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="text-sm font-medium text-primary-700">Avg Mood</div>
                  <div className="text-xl font-bold text-primary-900">{getMoodStats().averageMood}/5</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-700">Trend</div>
                  <div className="text-xl font-bold text-green-900">
                    {getMoodStats().trend > 0 ? '+' : ''}{getMoodStats().trend}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-orange-700">Streak</div>
                  <div className="text-xl font-bold text-orange-900">{getMoodStats().streak} days</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-purple-700">Total Entries</div>
                  <div className="text-xl font-bold text-purple-900">{getMoodStats().totalEntries}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mood Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Mood Trend (Last 14 days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Recent Entries</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {moodHistory.slice(0, 10).map((entry, index) => {
            const moodData = moodScale.find(m => m.value === entry.mood);
            return (
              <div key={index} className="bg-white p-4 rounded-lg border border-secondary-200 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{moodData?.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-secondary-900">{moodData?.label}</span>
                      <span className="text-sm text-secondary-500">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    
                    {entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.emotions.map(emotionId => {
                          const emotion = emotionOptions.find(e => e.id === emotionId);
                          return emotion ? (
                            <span key={emotionId} className={`text-xs px-2 py-1 rounded-full ${emotion.color}`}>
                              {emotion.emoji} {emotion.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {entry.note && (
                      <p className="text-sm text-secondary-600 italic">{entry.note}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="bg-white p-4 rounded-lg border border-secondary-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Quick Mood Check</h3>
          <Heart className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex space-x-2">
          {moodScale.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setCurrentMood(mood.value)}
              className={`p-2 rounded-lg transition-all ${
                currentMood === mood.value
                  ? 'bg-primary-100 shadow-md scale-105'
                  : 'hover:bg-secondary-50'
              }`}
              title={mood.label}
            >
              <div className="text-xl">{mood.emoji}</div>
            </button>
          ))}
        </div>
        {currentMood && (
          <button
            onClick={saveMoodEntry}
            className="w-full mt-3 btn-primary text-sm"
          >
            Save
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center space-x-1 mb-6 bg-secondary-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setView('tracker')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            view === 'tracker'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Track Mood
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            view === 'history'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          History
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6">
        {view === 'tracker' && renderMoodTracker()}
        {view === 'history' && renderMoodHistory()}
      </div>
    </div>
  );
};

export default MoodTracker;