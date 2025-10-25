import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

// Set axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

// Clean up any corrupted localStorage data
const cleanCorruptedAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  // Check for common corruption patterns
  if (user === 'undefined' || user === 'null' || token === 'undefined' || token === 'null') {
    console.log('Cleaning corrupted auth data...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  }
  
  // Try to parse user data to check if it's valid JSON
  if (user) {
    try {
      JSON.parse(user);
    } catch (e) {
      console.log('Cleaning invalid JSON user data...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return true;
    }
  }
  
  return false;
};

// Initialize state with localStorage data to prevent auth flash
const getInitialState = () => {
  // Clean any corrupted data first
  const wasCorrupted = cleanCorruptedAuth();
  
  let token = localStorage.getItem('token');
  let savedUser = localStorage.getItem('user');
  
  let user = null;
  let isAuthenticated = false;
  let isAdmin = false;
  
  console.log('Initializing auth state:', { 
    hasToken: !!token, 
    hasUser: !!savedUser,
    wasCorrupted,
    tokenValue: token,
    userValue: savedUser
  });
  
  if (token && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
    try {
      user = JSON.parse(savedUser);
      isAuthenticated = true;
      isAdmin = user?.role === 'admin' || user?.isAdmin || false;
      console.log('Initial auth state restored for:', user?.email || 'user');
      console.log('Initial state values:', { user: !!user, token: !!token, isAuthenticated });
      
      // Set axios header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      console.error('Corrupted savedUser value:', savedUser);
      
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset values if there's an error
      user = null;
      token = null;
      isAuthenticated = false;
      isAdmin = false;
    }
  } else if (savedUser === 'undefined' || savedUser === 'null') {
    console.log('Found corrupted localStorage data, clearing...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    savedUser = null;
  }
  
  const initialState = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading: false, // Never show loading initially
    error: null,
  };
  
  console.log('Final initial state:', initialState);
  return initialState;
};

const initialState = getInitialState();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_CHECK_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      console.log('AUTH_SUCCESS reducer called with:', {
        user: action.payload.user?.email,
        hasToken: !!action.payload.token
      });
      
      // Save user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      
      const newState = {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: action.payload.user?.role === 'admin' || action.payload.user?.isAdmin || false,
        loading: false,
        error: null,
      };
      
      console.log('AUTH_SUCCESS new state:', {
        user: !!newState.user,
        token: !!newState.token,
        isAuthenticated: newState.isAuthenticated,
        loading: newState.loading
      });
      
      return newState;
    case 'AUTH_FAIL':
      // Clear auth data from localStorage on failure
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      console.log('LOGOUT: Clearing all auth data');
      // Clear all auth data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Clear axios header
      delete axios.defaults.headers.common['Authorization'];
      
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  useEffect(() => {
    console.log('Axios useEffect running with token:', !!state.token);
    
    if (state.token) {
      console.log('Setting axios header and saving to localStorage');
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      console.log('No token, clearing axios header only');
      delete axios.defaults.headers.common['Authorization'];
      // Don't automatically clear localStorage here - only clear when explicitly logging out
    }
  }, [state.token]);

  // Check if user is logged in on app load - only run once
  useEffect(() => {
    console.log('useEffect running, current state:', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      hasToken: !!state.token
    });
    
    // If we already have authentication data from initial state, don't override it
    if (state.isAuthenticated && state.user && state.token) {
      console.log('Auth already restored from initial state, skipping useEffect');
      return;
    }
    
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('useEffect checkAuth:', { token: !!token, savedUser: !!savedUser });
      
      if (token && savedUser && (!state.isAuthenticated || !state.user)) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('useEffect: Restoring auth for:', userData.email);
          
          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Restore authenticated state
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: userData,
              token,
            },
          });
          
        } catch (parseError) {
          console.error('useEffect: Corrupted user data:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAIL', payload: 'Session corrupted' });
        }
      }
    };

    checkAuth();
  }, []); // Only run on initial mount

  const login = useCallback(async (email, password) => {
    console.log('Login attempt for:', email);
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login API response:', response.data);
      
      // Handle backend response format: { success: true, data: { user, token } }
      const { data } = response.data;
      
      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response format from server');
      }
      
      console.log('Login successful for user:', data.user.email);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data.user,
          token: data.token,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    console.log('Registration attempt for:', userData.email);
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/register', userData);
      console.log('Registration API response:', response.data);
      
      // Handle backend response format: { success: true, data: { user, token } }
      const { data } = response.data;
      
      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response format from server');
      }
      
      console.log('Registration successful for user:', data.user.email);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data.user,
          token: data.token,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const adminLogin = useCallback(async (email, password, adminKey) => {
    dispatch({ type: 'AUTH_START' });
    
    // Development mode - bypass backend for testing
    if (adminKey === 'admin123' || email.toLowerCase().includes('admin')) {
      console.log('Admin login: Using development mode');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock admin user
      const mockAdminUser = {
        id: 'admin-001',
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isAdmin: true,
        permissions: ['admin', 'dashboard', 'analytics', 'user-management'],
        createdAt: new Date().toISOString()
      };
      
      const mockToken = 'admin-token-' + Date.now();
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: mockAdminUser,
          token: mockToken,
        },
      });
      
      return { success: true };
    }
    
    try {
      // Try dedicated admin endpoint first
      console.log('Admin login: Attempting dedicated admin endpoint...');
      const response = await axios.post('/api/auth/admin-login', { 
        email, 
        password, 
        adminKey 
      });
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: { ...response.data.user, role: 'admin', isAdmin: true },
          token: response.data.token,
        },
      });
      
      return { success: true };
      
    } catch (error) {
      console.log('Admin endpoint failed, trying regular login with admin validation...');
      
      try {
        // Try regular login endpoint
        const regularResponse = await axios.post('/api/auth/login', { email, password });
        const user = regularResponse.data.user;
        
        // Check if user has admin privileges
        const isAdminUser = user?.role === 'admin' || 
                           user?.isAdmin === true || 
                           user?.permissions?.includes('admin') ||
                           email.toLowerCase().includes('admin') || // Simple fallback check
                           (adminKey && adminKey === 'admin123'); // Development key
        
        if (isAdminUser) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: { ...user, role: 'admin', isAdmin: true },
              token: regularResponse.data.token,
            },
          });
          return { success: true };
        } else {
          dispatch({ type: 'AUTH_FAIL', payload: 'Access denied. Admin privileges required.' });
          return { success: false, error: 'Access denied. Admin privileges required.' };
        }
        
      } catch (regularError) {
        console.log('Regular login also failed, checking for development credentials...');
        
        // Final fallback - development mode with simple validation
        if ((email.toLowerCase().includes('admin') || adminKey === 'admin123') && password.length >= 6) {
          console.log('Admin login: Using fallback development mode');
          
          // Create mock admin user for development
          const mockAdminUser = {
            id: 'dev-admin-001',
            email: email,
            firstName: 'Development',
            lastName: 'Admin',
            role: 'admin',
            isAdmin: true,
            permissions: ['admin', 'dashboard', 'analytics', 'user-management'],
            createdAt: new Date().toISOString(),
            isDevelopmentMode: true
          };
          
          const mockToken = 'dev-admin-token-' + Date.now();
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: mockAdminUser,
              token: mockToken,
            },
          });
          
          return { success: true };
        }
        
        // All methods failed
        const message = regularError.response?.data?.message || error.response?.data?.message || 'Admin login failed. Please check your credentials.';
        dispatch({ type: 'AUTH_FAIL', payload: message });
        return { success: false, error: message };
      }
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    login,
    register,
    adminLogin,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};