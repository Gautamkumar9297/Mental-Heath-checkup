import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Users, 
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  User,
  Home,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
  Shield,
  Activity,
  Phone
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const logout = useLogout();

  const isActive = (path) => location.pathname === path;

  // Navigation items for authenticated users
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: BarChart3, 
      color: 'from-blue-500 to-blue-600',
      description: 'Your wellness overview'
    },
    { 
      path: '/chat', 
      label: 'AI Support', 
      icon: MessageCircle, 
      color: 'from-green-500 to-green-600',
      description: '24/7 AI counseling'
    },
    { 
      path: '/counselor-support', 
      label: 'Counselor Calls', 
      icon: Phone, 
      color: 'from-indigo-500 to-indigo-600',
      description: 'Video/Audio calls with professionals'
    },
    { 
      path: '/assessment', 
      label: 'Mental Health Assessment', 
      icon: ClipboardList, 
      color: 'from-violet-500 to-violet-600',
      description: 'Track your mental state'
    },
    { 
      path: '/mood-tracker', 
      label: 'Mood Tracker', 
      icon: Activity, 
      color: 'from-rose-500 to-rose-600',
      description: 'Daily mood logging'
    },
    { 
      path: '/book-appointment', 
      label: 'Book Appointment', 
      icon: Calendar, 
      color: 'from-teal-500 to-teal-600',
      description: 'Schedule with professionals'
    },
    { 
      path: '/peer-support', 
      label: 'Peer Support', 
      icon: Users, 
      color: 'from-cyan-500 to-cyan-600',
      description: 'Connect with community'
    },
    { 
      path: '/resources', 
      label: 'Resources', 
      icon: BookOpen, 
      color: 'from-orange-500 to-orange-600',
      description: 'Helpful materials & guides'
    },
    { 
      path: '/profile', 
      label: 'Profile', 
      icon: User, 
      color: 'from-purple-500 to-purple-600',
      description: 'Manage your account'
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings, 
      color: 'from-gray-500 to-gray-600',
      description: 'App preferences & privacy'
    },
  ];

  // Admin items
  const adminItems = [
    { 
      path: '/admin', 
      label: 'Admin Panel', 
      icon: Shield, 
      color: 'from-red-500 to-red-600',
      description: 'Administrative controls'
    },
  ];

  const handleLogout = () => {
    toggleSidebar(false);
    logout();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40 transition-all duration-300"
          onClick={() => toggleSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl
        border-r border-gray-200 shadow-xl z-50 transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-72 overflow-y-auto
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Heart className="h-10 w-10 text-blue-600 animate-pulse" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-green-500 animate-bounce" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
                MindCare
              </h1>
              <p className="text-xs text-gray-500">Your Mental Wellness Companion</p>
            </div>
          </div>
          
          <button
            onClick={() => toggleSidebar(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* User Profile Section */}
        {isAuthenticated && user && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  Welcome, {user.name || user.firstName || 'User'}!
                </h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Mental wellness journey
                </p>
              </div>
            </div>
            
            {/* Wellness Score */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Wellness Score</span>
                <span className="text-lg font-bold text-green-600">8.2/10</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000 w-4/5" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {isAuthenticated ? (
            <>
              {/* Main Navigation */}
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                        ${active 
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-[1.02]` 
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:scale-[1.02]'
                        }
                      `}
                      onMouseEnter={() => setHoveredItem(index)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar(false)}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-lg" />
                      )}
                      
                      {/* Icon with animation */}
                      <div className={`
                        relative p-2 rounded-lg transition-all duration-300
                        ${active ? 'bg-white/20' : 'group-hover:bg-white/30'}
                      `}>
                        <Icon className={`
                          h-5 w-5 transition-all duration-300
                          ${active ? 'text-white animate-gentle-bounce' : 'group-hover:scale-110'}
                        `} />
                        
                        {/* Hover glow effect */}
                        {hoveredItem === index && !active && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 rounded-lg`} />
                        )}
                      </div>
                      
                      {/* Label and description */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium transition-all duration-300 ${
                          active ? 'text-white' : 'group-hover:text-gray-900'
                        }`}>
                          {item.label}
                        </div>
                        <div className={`text-xs transition-all duration-300 ${
                          active ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      
                      {/* Hover arrow */}
                      <ChevronLeft className={`
                        h-4 w-4 transform rotate-180 transition-all duration-300
                        ${active ? 'text-white' : 'text-transparent group-hover:text-gray-600 group-hover:translate-x-1'}
                      `} />
                    </Link>
                  );
                })}
              </div>

              {/* Admin Section */}
              {user?.role === 'admin' && (
                <div className="pt-4 mt-4 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Administration
                  </h4>
                  {adminItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`
                          group relative flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                          ${active 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-[1.02]` 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:scale-[1.02]'
                          }
                        `}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar(false)}
                      >
                        <div className={`
                          p-2 rounded-lg transition-all duration-300
                          ${active ? 'bg-white/20' : 'group-hover:bg-white/30'}
                        `}>
                          <Icon className={`
                            h-5 w-5 transition-all duration-300
                            ${active ? 'text-white' : 'group-hover:scale-110'}
                          `} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            active ? 'text-white' : 'group-hover:text-gray-900'
                          }`}>
                            {item.label}
                          </div>
                          <div className={`text-xs ${
                            active ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Unauthenticated state */
            <div className="space-y-4">
              <div className="text-center p-6">
                <Heart className="h-16 w-16 text-blue-300 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to MindCare
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your journey to better mental health starts here
                </p>
                
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => window.innerWidth < 1024 && toggleSidebar(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={() => window.innerWidth < 1024 && toggleSidebar(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        {isAuthenticated && (
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg group-hover:bg-red-100 transition-all duration-300">
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;