import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { chatbotAPI } from '../services/api';
import chatStorage from '../services/chatStorage';
import {
  History,
  Search,
  Calendar,
  Star,
  Download,
  Trash2,
  Eye,
  MessageCircle,
  Bot,
  User,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  Tag,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader,
  AlertCircle,
  FileText,
  Database,
  X,
  Play,
  RefreshCw
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

const ChatHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedChats, setSavedChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Available filter options
  const filterOptions = [
    { value: 'all', label: 'All Conversations' },
    { value: 'favorites', label: 'Favorites Only' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'messages', label: 'Most Messages' }
  ];

  // Load saved chats on component mount
  useEffect(() => {
    loadSavedChats();
    loadStorageStats();
  }, []);

  // Apply filters and search when dependencies change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [savedChats, searchTerm, sortBy, filterBy, selectedTags]);

  const loadSavedChats = async () => {
    setLoading(true);
    try {
      // Try to load from new chat history API first
      try {
        const response = await chatbotAPI.getChatHistory();
        if (response.data && response.data.sessions) {
          // Transform backend session format to frontend chat format
          const transformedChats = response.data.sessions.map(session => ({
            id: session._id,
            sessionId: session._id,
            title: session.summary || `Chat from ${format(new Date(session.createdAt), 'MMM dd, HH:mm')}`,
            summary: session.summary || 'No summary available',
            messages: session.messages || [],
            sentimentAnalysis: session.sentimentData,
            tags: session.tags || [],
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            status: session.status,
            favorite: false // Default value, can be enhanced later
          }));
          setSavedChats(transformedChats);
        } else {
          // Fallback to old saved chats API
          const fallbackResponse = await chatbotAPI.getSavedChats();
          setSavedChats(fallbackResponse.data.data || []);
        }
      } catch (apiError) {
        console.log('API error, falling back to local storage:', apiError.message);
        // Fallback to local storage
        const localChats = chatStorage.getSavedChats();
        setSavedChats(localChats);
      }
    } catch (error) {
      console.error('Error loading saved chats:', error);
      setSavedChats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageStats = () => {
    const stats = chatStorage.getStorageStats();
    setStorageStats(stats);
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...savedChats];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(chat => 
        chat.title.toLowerCase().includes(search) ||
        chat.summary.toLowerCase().includes(search) ||
        chat.messages.some(msg => msg.content.toLowerCase().includes(search))
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(chat => chat.favorite);
        break;
      case 'today':
        filtered = filtered.filter(chat => isToday(new Date(chat.createdAt)));
        break;
      case 'yesterday':
        filtered = filtered.filter(chat => isYesterday(new Date(chat.createdAt)));
        break;
      case 'week':
        filtered = filtered.filter(chat => isThisWeek(new Date(chat.createdAt)));
        break;
      case 'month':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filtered = filtered.filter(chat => new Date(chat.createdAt) >= oneMonthAgo);
        break;
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(chat => 
        selectedTags.some(tag => chat.tags && chat.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'messages':
        filtered.sort((a, b) => b.messages.length - a.messages.length);
        break;
    }

    setFilteredChats(filtered);
  };

  const toggleFavorite = async (chatId) => {
    try {
      // Try API first
      try {
        await chatbotAPI.updateSavedChat(chatId, { favorite: !savedChats.find(c => c.id === chatId)?.favorite });
      } catch (apiError) {
        // Fallback to local storage
        chatStorage.toggleFavorite(chatId);
      }
      
      // Update local state
      setSavedChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, favorite: !chat.favorite } : chat
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  const deleteChat = async (chatId) => {
    try {
      // Try API first
      try {
        await chatbotAPI.deleteSavedChat(chatId);
      } catch (apiError) {
        // Fallback to local storage
        chatStorage.deleteSavedChat(chatId);
      }
      
      // Update local state
      setSavedChats(prev => prev.filter(chat => chat.id !== chatId));
      setShowDeleteConfirm(null);
      loadStorageStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  // Continue an existing chat session
  const continueChat = async (chat) => {
    try {
      setLoading(true);
      // Try to continue the session using the backend API
      try {
        const response = await chatbotAPI.continueSession(chat.sessionId);
        console.log('Session continued successfully:', response.data);
        
        // Store the session data for the chat interface to pick up
        localStorage.setItem('continuedSession', JSON.stringify({
          sessionId: chat.sessionId,
          messages: chat.messages,
          title: chat.title,
          status: 'active'
        }));
        
        // Navigate to the chat interface
        navigate('/chat', { 
          state: { 
            continuedSession: {
              sessionId: chat.sessionId,
              messages: chat.messages,
              title: chat.title
            }
          } 
        });
      } catch (apiError) {
        console.log('Continue session API failed, using local continuation:', apiError.message);
        
        // Fallback: Navigate to chat with the existing messages
        localStorage.setItem('continuedSession', JSON.stringify({
          sessionId: chat.sessionId || `continued-${Date.now()}`,
          messages: chat.messages,
          title: chat.title,
          status: 'active'
        }));
        
        navigate('/chat', { 
          state: { 
            continuedSession: {
              sessionId: chat.sessionId || `continued-${Date.now()}`,
              messages: chat.messages,
              title: chat.title
            }
          } 
        });
      }
    } catch (error) {
      console.error('Error continuing chat:', error);
      alert('Failed to continue chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadChat = (chatId, format = 'txt') => {
    try {
      let content, filename, mimeType;
      
      if (format === 'json') {
        content = chatStorage.exportChatToJSON(chatId);
        filename = `mindbot-chat-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
        mimeType = 'application/json';
      } else {
        content = chatStorage.exportChatToText(chatId);
        filename = `mindbot-chat-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`;
        mimeType = 'text/plain';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading chat:', error);
      alert('Failed to download chat');
    }
  };

  const getAvailableTags = () => {
    const tags = new Set();
    savedChats.forEach(chat => {
      if (chat.tags) {
        chat.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  };

  const formatRelativeTime = (date) => {
    const chatDate = new Date(date);
    if (isToday(chatDate)) {
      return `Today ${format(chatDate, 'HH:mm')}`;
    } else if (isYesterday(chatDate)) {
      return `Yesterday ${format(chatDate, 'HH:mm')}`;
    } else if (isThisWeek(chatDate)) {
      return format(chatDate, 'EEEE HH:mm');
    } else {
      return format(chatDate, 'MMM dd, yyyy HH:mm');
    }
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'text-secondary-500';
    if (sentiment > 0.1) return 'text-green-500';
    if (sentiment < -0.1) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return <Activity className="w-4 h-4" />;
    if (sentiment > 0.1) return <TrendingUp className="w-4 h-4" />;
    if (sentiment < -0.1) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const renderChatCard = (chat) => (
    <div key={chat.id} className="bg-white rounded-lg shadow-sm border border-secondary-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-secondary-900 truncate">{chat.title}</h3>
            <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{chat.summary}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => toggleFavorite(chat.id)}
              className={`p-1 rounded transition-colors ${
                chat.favorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-secondary-400 hover:text-yellow-500'
              }`}
              title={chat.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${chat.favorite ? 'fill-current' : ''}`} />
            </button>
            <div className="relative group">
              <button className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-6 w-24 bg-white rounded-lg shadow-lg border border-secondary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => downloadChat(chat.id, 'txt')}
                  className="w-full px-3 py-2 text-left text-xs text-secondary-700 hover:bg-secondary-50 rounded-t-lg transition-colors"
                >
                  Text
                </button>
                <button
                  onClick={() => downloadChat(chat.id, 'json')}
                  className="w-full px-3 py-2 text-left text-xs text-secondary-700 hover:bg-secondary-50 rounded-b-lg transition-colors"
                >
                  JSON
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(chat.id)}
              className="p-1 text-secondary-400 hover:text-red-500 transition-colors"
              title="Delete conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-secondary-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{chat.messages.length} messages</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(chat.createdAt)}</span>
            </span>
            {chat.sentimentAnalysis?.currentMood !== undefined && (
              <span className={`flex items-center space-x-1 ${getSentimentColor(chat.sentimentAnalysis.currentMood)}`}>
                {getSentimentIcon(chat.sentimentAnalysis.currentMood)}
                <span>
                  {chat.sentimentAnalysis.currentMood > 0.1 ? 'Positive' : 
                   chat.sentimentAnalysis.currentMood < -0.1 ? 'Negative' : 'Neutral'}
                </span>
              </span>
            )}
          </div>
        </div>

        {chat.tags && chat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {chat.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700">
                {tag}
              </span>
            ))}
            {chat.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-600">
                +{chat.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedChat(chat)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            
            {/* Continue Chat Button */}
            <button
              onClick={() => continueChat(chat)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-mint-50 text-mint-700 rounded-md hover:bg-mint-100 transition-colors disabled:opacity-50"
              title="Continue this conversation"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Continue</span>
            </button>
          </div>
          
          {/* Status indicator */}
          {chat.status && (
            <div className="flex items-center space-x-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                chat.status === 'active' ? 'bg-green-500' :
                chat.status === 'paused' ? 'bg-yellow-500' :
                chat.status === 'ended' ? 'bg-gray-500' : 'bg-blue-500'
              }`}></div>
              <span className="text-secondary-600 capitalize">{chat.status || 'saved'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderChatViewer = () => {
    if (!selectedChat) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">{selectedChat.title}</h2>
                <p className="text-sm text-secondary-600">{formatRelativeTime(selectedChat.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedChat(null)}
              className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
            <div className="space-y-4">
              {selectedChat.messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'ml-2 bg-primary-500' : 'mr-2 bg-secondary-500'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white border border-secondary-200 text-secondary-900'
                    } shadow-sm`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-primary-100' : 'text-secondary-500'
                      }`}>
                        {format(new Date(message.timestamp), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-secondary-200 bg-secondary-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm font-medium text-secondary-700 mb-1">Messages</div>
                <div className="text-lg font-semibold text-secondary-900">{selectedChat.messages.length}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm font-medium text-secondary-700 mb-1">Duration</div>
                <div className="text-lg font-semibold text-secondary-900">
                  {selectedChat.messages.length > 0 
                    ? Math.ceil((new Date(selectedChat.messages[selectedChat.messages.length - 1]?.timestamp) - 
                        new Date(selectedChat.messages[0]?.timestamp)) / (1000 * 60)) + ' min'
                    : '0 min'
                  }
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm font-medium text-secondary-700 mb-1">Overall Mood</div>
                <div className={`text-lg font-semibold ${getSentimentColor(selectedChat.sentimentAnalysis?.currentMood)}`}>
                  {selectedChat.sentimentAnalysis?.currentMood !== undefined ? (
                    selectedChat.sentimentAnalysis.currentMood > 0.1 ? 'Positive' : 
                    selectedChat.sentimentAnalysis.currentMood < -0.1 ? 'Negative' : 'Neutral'
                  ) : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <History className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-secondary-900">Chat History</h1>
          </div>
          <p className="text-secondary-600">
            Review, manage, and continue your conversations with MindBot AI Assistant
          </p>
        </div>

        {/* Storage Stats */}
        {storageStats && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{storageStats.totalChats}</div>
                <div className="text-sm text-secondary-600">Saved Chats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mint-600">{storageStats.totalMessages}</div>
                <div className="text-sm text-secondary-600">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{storageStats.favoriteChats}</div>
                <div className="text-sm text-secondary-600">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600">{storageStats.storageSizeFormatted}</div>
                <div className="text-sm text-secondary-600">Storage Used</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-secondary-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tag Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="mb-2">
                <span className="text-sm font-medium text-secondary-700">Filter by tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getAvailableTags().map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="ml-3 text-secondary-600">Loading saved chats...</span>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {savedChats.length === 0 ? 'No saved chats yet' : 'No chats match your filters'}
            </h3>
            <p className="text-secondary-600 mb-4">
              {savedChats.length === 0 
                ? 'Start a conversation with MindBot and save it to see it here.'
                : 'Try adjusting your search terms or filters to find what you\'re looking for.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChats.map(renderChatCard)}
          </div>
        )}

        {/* Chat Viewer Modal */}
        {renderChatViewer()}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-secondary-900">Delete Conversation</h3>
              </div>
              
              <p className="text-secondary-600 mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;