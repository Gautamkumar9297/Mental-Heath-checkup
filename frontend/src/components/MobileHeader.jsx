import React from 'react';
import { Menu, Heart, Sparkles } from 'lucide-react';

const MobileHeader = ({ toggleSidebar }) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg z-30">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Heart className="h-8 w-8 text-blue-600 animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-3 w-3 text-green-500 animate-bounce" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              MindCare
            </h1>
          </div>
        </div>
        
        {/* Hamburger Menu */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-105 group"
        >
          <Menu className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;