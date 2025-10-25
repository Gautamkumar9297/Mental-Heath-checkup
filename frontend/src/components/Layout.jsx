import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Pages where we don't want to show the sidebar
  const authPages = ['/login', '/register', '/register-test', '/admin/login'];
  const showSidebar = !authPages.includes(location.pathname) && isAuthenticated;

  const toggleSidebar = (isOpen) => {
    setSidebarOpen(typeof isOpen === 'boolean' ? isOpen : !sidebarOpen);
  };

  if (!showSidebar) {
    // For auth pages or unauthenticated users, just return children without sidebar
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen healing-bg">
      {/* Mobile Header */}
      <MobileHeader toggleSidebar={() => toggleSidebar(true)} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <main className="lg:ml-72 transition-all duration-300 main-content">
        {/* Add top padding for mobile header */}
        <div className="lg:hidden h-16" />
        
        <div className="p-4 lg:p-6 content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;