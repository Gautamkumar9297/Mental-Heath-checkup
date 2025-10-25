import React, { useState, useEffect } from 'react';
import { User, Phone, Video, Clock, Star, MapPin } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import CallButtons from './CallButtons';

const CounselorSelector = ({ onSelectCounselor, selectedCounselorId }) => {
  const { getOnlineCounselors, onlineCounselors, initiateCall, getUserStatus, isUserAvailable } = useCall();
  const [loading, setLoading] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  useEffect(() => {
    loadCounselors();
  }, []);

  const loadCounselors = async () => {
    try {
      setLoading(true);
      await getOnlineCounselors();
      
      // Get status for each counselor
      onlineCounselors.forEach(counselor => {
        getUserStatus(counselor.userId);
      });
      
    } catch (error) {
      console.error('Failed to load counselors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCounselor = (counselor) => {
    setSelectedCounselor(counselor);
    if (onSelectCounselor) {
      onSelectCounselor(counselor);
    }
  };

  const handleCallCounselor = async (counselorId, callType) => {
    try {
      await initiateCall(counselorId, callType);
    } catch (error) {
      console.error('Failed to initiate call:', error);
      alert('Failed to start call. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
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

  if (onlineCounselors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Counselors Available</h3>
        <p className="text-gray-600 mb-4">
          All counselors are currently offline or busy. Please try again later.
        </p>
        <button
          onClick={loadCounselors}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Available Counselors</h3>
        <button
          onClick={loadCounselors}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {onlineCounselors.map(counselor => (
          <div
            key={counselor.userId}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedCounselor?.userId === counselor.userId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleSelectCounselor(counselor)}
          >
            {/* Counselor info */}
            <div className="flex items-start space-x-4 mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  counselor.callStatus === 'available' ? 'bg-green-400' :
                  counselor.callStatus === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900 truncate">
                    {counselor.name}
                  </h4>
                  <div className="flex items-center text-sm text-yellow-600">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600 capitalize">
                    {counselor.role} • {counselor.specialization}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      counselor.callStatus === 'available' ? 'bg-green-400' :
                      counselor.callStatus === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`} />
                    <span className="capitalize">
                      {counselor.callStatus === 'available' ? 'Available' :
                       counselor.callStatus === 'busy' ? 'Busy' :
                       counselor.callStatus === 'in_call' ? 'In Call' : 'Away'}
                    </span>
                    <Clock className="h-3 w-3 ml-3 mr-1" />
                    <span>Online since {new Date(counselor.connectedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call buttons */}
            <CallButtons
              targetUserId={counselor.userId}
              targetUserName={counselor.name}
              targetUserRole={counselor.role}
              isOnline={true}
              disabled={counselor.callStatus !== 'available'}
              onInitiateCall={handleCallCounselor}
            />

            {/* Additional info if selected */}
            {selectedCounselor?.userId === counselor.userId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <span className="ml-2 text-gray-900">5+ years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Languages:</span>
                    <span className="ml-2 text-gray-900">English, Hindi</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <span className="ml-2 text-gray-900">4.8/5 (124 reviews)</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Response Time:</span>
                    <span className="ml-2 text-gray-900">Usually immediate</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Specializes in:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Anxiety', 'Depression', 'Stress Management', 'Academic Pressure'].map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Need immediate help?</p>
            <p>Call our crisis helpline: <strong>1-800-CRISIS</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorSelector;