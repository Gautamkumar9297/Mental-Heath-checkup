import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(settings.appBehavior.theme);
  }, [settings.appBehavior.theme]);

  // Handle system theme changes when auto mode is selected
  useEffect(() => {
    if (settings.appBehavior.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.appBehavior.theme]);

  const isDarkMode = settings.appBehavior.theme === 'dark' || 
    (settings.appBehavior.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const contextValue = {
    theme: settings.appBehavior.theme,
    isDarkMode,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;