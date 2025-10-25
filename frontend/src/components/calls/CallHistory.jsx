import React, { useState, useEffect } from 'react';
import { Phone, Video, Clock, Calendar, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const CallHistory = ({ userId }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, video, audio, missed

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    const mockHistory = [
      {
        id: '1',
        type: 'video',
        direction: 'outgoing',
        participantName: 'Dr. Sarah Johnson',
        participantRole: 'counselor',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        duration: 1800, // 30 minutes
        status: 'completed',
        rating: 5,
        notes: 'Very helpful session about stress management'
      },
      {
        id: '2',
        type: 'audio',
        direction: 'incoming',
        participantName: 'Dr. Mike Chen',
        participantRole: 'counselor',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endTime: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
        duration: 1200, // 20 minutes
        status: 'completed',
        rating: 4
      },
      {
        id: '3',
        type: 'video',
        direction: 'outgoing',
        participantName: 'Dr. Emily Davis',
        participantRole: 'counselor',
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        endTime: null,
        duration: 0,
        status: 'missed',
        rating: null
      },
      {
        id: '4',
        type: 'audio',
        direction: 'incoming',
        participantName: 'Crisis Counselor',
        participantRole: 'counselor',
        startTime: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        endTime: new Date(Date.now() - 71.5 * 60 * 60 * 1000),
        duration: 900, // 15 minutes
        status: 'completed',
        rating: 5,
        isEmergency: true
      }
    ];

    setTimeout(() => {
      setCallHistory(mockHistory);
      setLoading(false);
    }, 1000);
  }, [userId]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return callHistory;
    if (filter === 'missed') return callHistory.filter(call => call.status === 'missed');
    return callHistory.filter(call => call.type === filter);
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  const renderCallIcon = (type, direction, status) => {
    const iconClass = "h-5 w-5";
    
    if (status === 'missed') {
      return type === 'video' ? 
        <Video className={`${iconClass} text-red-500`} /> :
        <Phone className={`${iconClass} text-red-500`} />;
    }
    
    if (type === 'video') {
      return <Video className={`${iconClass} text-blue-600`} />;
    } else {
      return <Phone className={`${iconClass} text-green-600`} />;
    }
  };

  const renderDirectionIcon = (direction) => {
    return direction === 'outgoing' ? 
      <ArrowUpRight className="h-4 w-4 text-gray-400" /> :
      <ArrowDownLeft className="h-4 w-4 text-gray-400" />;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L0 6.91l6.564-.955L10 0l2.436 5.955L20 6.91l-5.245 4.635L15.878 18z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredHistory = getFilteredHistory();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
        <div className="text-sm text-gray-500">
          {callHistory.length} total calls
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All', count: callHistory.length },
          { key: 'video', label: 'Video', count: callHistory.filter(c => c.type === 'video').length },
          { key: 'audio', label: 'Audio', count: callHistory.filter(c => c.type === 'audio').length },
          { key: 'missed', label: 'Missed', count: callHistory.filter(c => c.status === 'missed').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No calls found</h4>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You haven't made any calls yet."
              : `No ${filter} calls found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(call => (
            <div
              key={call.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                call.status === 'missed' 
                  ? 'border-red-200 bg-red-50'
                  : call.isEmergency 
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {renderCallIcon(call.type, call.direction, call.status)}
                    {renderDirectionIcon(call.direction)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {call.participantName}
                      </h4>
                      {call.isEmergency && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="capitalize">{call.participantRole}</span>
                      <span>•</span>
                      <span>{getRelativeTime(call.startTime)}</span>
                      {call.status === 'completed' && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(call.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {call.rating && renderStars(call.rating)}
                  <div className="text-sm text-gray-500">
                    {call.startTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              {call.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{call.notes}</p>
                </div>
              )}

              {call.status === 'missed' && (
                <div className="mt-3 flex justify-end">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Call back
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      {callHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {callHistory.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(
                  callHistory
                    .filter(c => c.status === 'completed')
                    .reduce((sum, c) => sum + c.duration, 0) / 60
                )}m
              </div>
              <div className="text-sm text-gray-500">Total Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {callHistory.filter(c => c.status === 'missed').length}
              </div>
              <div className="text-sm text-gray-500">Missed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;