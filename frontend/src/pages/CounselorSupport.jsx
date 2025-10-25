import React, { useState } from 'react';
import { useCall } from '../context/CallContext';
import { Phone, Video, Users, Clock, Star, Shield } from 'lucide-react';
import CounselorSelector from '../components/calls/CounselorSelector';
import CallHistory from '../components/calls/CallHistory';
import { useAuth } from '../context/AuthContext';

const CounselorSupport = () => {
  const { user } = useAuth();
  const { callStatus, isInitialized: callServiceReady, onlineCounselors } = useCall();
  const [activeTab, setActiveTab] = useState('connect');

  const tabs = [
    { id: 'connect', label: 'Connect Now', icon: Phone },
    { id: 'history', label: 'Call History', icon: Clock },
    { id: 'about', label: 'About', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Professional Counselor Support 🎯
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with licensed mental health professionals through secure video and audio calls. 
            Get personalized support when you need it most.
          </p>
          
          {/* Status Indicators */}
          <div className="flex justify-center items-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${callServiceReady ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
              <span className="text-sm font-medium text-gray-700">
                Service {callServiceReady ? 'Ready' : 'Initializing...'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {onlineCounselors.length} Counselors Online
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                End-to-End Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex space-x-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'connect' && (
            <div className="space-y-8">
              {/* Service Status */}
              {!callServiceReady && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Initializing Call Service
                  </h3>
                  <p className="text-yellow-700">
                    Please wait while we set up secure calling capabilities...
                  </p>
                </div>
              )}

              {/* Current Call Status */}
              {callStatus !== 'idle' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-pulse">
                      {callStatus === 'calling' && <Phone className="h-6 w-6 text-blue-600" />}
                      {callStatus === 'ringing' && <Phone className="h-6 w-6 text-green-600 animate-bounce" />}
                      {callStatus === 'connected' && <Video className="h-6 w-6 text-green-600" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">
                        {callStatus === 'calling' && 'Calling counselor...'}
                        {callStatus === 'ringing' && 'Incoming call'}
                        {callStatus === 'connected' && 'Call in progress'}
                        {callStatus === 'connecting' && 'Connecting to call...'}
                      </h3>
                      <p className="text-blue-700 text-sm">
                        {callStatus === 'calling' && 'Please wait while we connect you'}
                        {callStatus === 'ringing' && 'Accept the call to start your session'}
                        {callStatus === 'connected' && 'Enjoy your counseling session'}
                        {callStatus === 'connecting' && 'Setting up secure connection'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Counselor Selector */}
                <div>
                  <CounselorSelector />
                </div>

                {/* Information Panel */}
                <div className="space-y-6">
                  {/* Features */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      Why Choose Our Counselors?
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Licensed Professionals</h4>
                          <p className="text-gray-600 text-sm">All counselors are licensed and experienced in mental health support</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Video className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Flexible Communication</h4>
                          <p className="text-gray-600 text-sm">Choose between video calls for face-to-face support or audio-only for privacy</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Available 24/7</h4>
                          <p className="text-gray-600 text-sm">Crisis support and regular counseling available around the clock</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <Phone className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Secure & Private</h4>
                          <p className="text-gray-600 text-sm">End-to-end encrypted calls with no recording or data storage</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">10,000+</div>
                        <div className="text-blue-100 text-sm">Students Helped</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold">4.9★</div>
                        <div className="text-blue-100 text-sm">Average Rating</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold">24/7</div>
                        <div className="text-blue-100 text-sm">Available</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold">50+</div>
                        <div className="text-blue-100 text-sm">Counselors</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <CallHistory userId={user?.id} />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About Our Counselor Support</h2>
              
              <div className="prose max-w-none text-gray-600">
                <p className="text-lg mb-6">
                  Our counselor support system provides you with direct access to licensed mental health 
                  professionals through secure video and audio calls. This service complements our AI 
                  support system by offering human connection when you need it most.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
                    <ol className="space-y-3 text-sm">
                      <li className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Browse available counselors and their specializations</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Click video or audio call button to initiate contact</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Counselor receives notification and can accept the call</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                        <span>Secure, encrypted session begins automatically</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>End-to-end encrypted communication</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>No call recording or storage</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>HIPAA compliant practices</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Anonymous session options available</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Important Note</h4>
                  <p className="text-yellow-800 text-sm">
                    This service is designed to complement, not replace, professional mental health treatment. 
                    In case of emergency or immediate crisis, please contact your local emergency services 
                    or crisis hotline immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorSupport;