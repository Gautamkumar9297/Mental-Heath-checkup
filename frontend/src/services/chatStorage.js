import { format } from 'date-fns';

/**
 * Chat Storage Service
 * Provides local storage functionality for chat conversations
 * with fallback when API is unavailable
 */

const STORAGE_KEY = 'mindbot_saved_chats';
const MAX_STORED_CHATS = 50; // Limit to prevent localStorage overflow

class ChatStorage {
  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize local storage if not exists
   */
  initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  /**
   * Generate unique chat ID
   */
  generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Save chat conversation to local storage
   */
  saveChat(chatData) {
    try {
      const savedChats = this.getSavedChats();
      
      const newChat = {
        id: chatData.id || this.generateChatId(),
        title: chatData.title || this.generateChatTitle(chatData.messages),
        messages: chatData.messages || [],
        sessionId: chatData.sessionId || null,
        startTime: chatData.startTime || new Date().toISOString(),
        endTime: chatData.endTime || new Date().toISOString(),
        summary: chatData.summary || this.generateChatSummary(chatData.messages),
        sentimentAnalysis: chatData.sentimentAnalysis || null,
        tags: chatData.tags || [],
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to beginning of array (most recent first)
      savedChats.unshift(newChat);

      // Limit storage to prevent overflow
      if (savedChats.length > MAX_STORED_CHATS) {
        savedChats.splice(MAX_STORED_CHATS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats));
      return newChat;
    } catch (error) {
      console.error('Error saving chat to local storage:', error);
      throw new Error('Failed to save chat');
    }
  }

  /**
   * Get all saved chats from local storage
   */
  getSavedChats(filters = {}) {
    try {
      const savedChats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      let filteredChats = savedChats;

      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredChats = filteredChats.filter(chat => 
          chat.title.toLowerCase().includes(searchTerm) ||
          chat.summary.toLowerCase().includes(searchTerm) ||
          chat.messages.some(msg => 
            msg.content.toLowerCase().includes(searchTerm)
          )
        );
      }

      if (filters.dateFrom) {
        filteredChats = filteredChats.filter(chat => 
          new Date(chat.createdAt) >= new Date(filters.dateFrom)
        );
      }

      if (filters.dateTo) {
        filteredChats = filteredChats.filter(chat => 
          new Date(chat.createdAt) <= new Date(filters.dateTo)
        );
      }

      if (filters.favorite) {
        filteredChats = filteredChats.filter(chat => chat.favorite);
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredChats = filteredChats.filter(chat => 
          filters.tags.some(tag => chat.tags.includes(tag))
        );
      }

      // Sort by date (most recent first)
      return filteredChats.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error('Error getting saved chats from local storage:', error);
      return [];
    }
  }

  /**
   * Get specific saved chat by ID
   */
  getSavedChatById(chatId) {
    try {
      const savedChats = this.getSavedChats();
      return savedChats.find(chat => chat.id === chatId) || null;
    } catch (error) {
      console.error('Error getting saved chat by ID:', error);
      return null;
    }
  }

  /**
   * Update saved chat
   */
  updateSavedChat(chatId, updateData) {
    try {
      const savedChats = this.getSavedChats();
      const chatIndex = savedChats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }

      savedChats[chatIndex] = {
        ...savedChats[chatIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats));
      return savedChats[chatIndex];
    } catch (error) {
      console.error('Error updating saved chat:', error);
      throw new Error('Failed to update chat');
    }
  }

  /**
   * Delete saved chat
   */
  deleteSavedChat(chatId) {
    try {
      const savedChats = this.getSavedChats();
      const filteredChats = savedChats.filter(chat => chat.id !== chatId);
      
      if (filteredChats.length === savedChats.length) {
        throw new Error('Chat not found');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredChats));
      return true;
    } catch (error) {
      console.error('Error deleting saved chat:', error);
      throw new Error('Failed to delete chat');
    }
  }

  /**
   * Toggle favorite status of a chat
   */
  toggleFavorite(chatId) {
    try {
      const savedChats = this.getSavedChats();
      const chatIndex = savedChats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) {
        throw new Error('Chat not found');
      }

      savedChats[chatIndex].favorite = !savedChats[chatIndex].favorite;
      savedChats[chatIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats));
      return savedChats[chatIndex];
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      throw new Error('Failed to update favorite status');
    }
  }

  /**
   * Generate chat title from messages
   */
  generateChatTitle(messages) {
    if (!messages || messages.length === 0) {
      return `Chat ${format(new Date(), 'MMM dd, yyyy')}`;
    }

    // Find first user message
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? `${title}...` : title;
    }

    // Fallback to date-based title
    return `Chat ${format(new Date(), 'MMM dd, yyyy HH:mm')}`;
  }

  /**
   * Generate chat summary from messages
   */
  generateChatSummary(messages) {
    if (!messages || messages.length === 0) {
      return 'Empty conversation';
    }

    const userMessages = messages.filter(msg => msg.sender === 'user');
    const aiMessages = messages.filter(msg => msg.sender === 'ai');

    if (userMessages.length === 0) {
      return 'AI introduction only';
    }

    // Extract key topics/themes
    const topics = [];
    const keywords = ['stress', 'anxiety', 'depression', 'help', 'support', 'feeling', 'mood', 'worry', 'sad', 'happy', 'angry', 'tired'];
    
    userMessages.forEach(msg => {
      keywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword) && !topics.includes(keyword)) {
          topics.push(keyword);
        }
      });
    });

    if (topics.length > 0) {
      return `Discussion about ${topics.slice(0, 3).join(', ')}. ${userMessages.length} user messages, ${aiMessages.length} AI responses.`;
    }

    return `Conversation with ${userMessages.length} user messages and ${aiMessages.length} AI responses.`;
  }

  /**
   * Export chat to JSON format
   */
  exportChatToJSON(chatId) {
    const chat = this.getSavedChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const exportData = {
      ...chat,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export chat to text format
   */
  exportChatToText(chatId) {
    const chat = this.getSavedChatById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    let textContent = `MindBot Conversation\n`;
    textContent += `Title: ${chat.title}\n`;
    textContent += `Date: ${format(new Date(chat.createdAt), 'PPP p')}\n`;
    textContent += `Summary: ${chat.summary}\n`;
    textContent += `${'='.repeat(50)}\n\n`;

    chat.messages.forEach(message => {
      const sender = message.sender === 'user' ? 'You' : 
                    message.sender === 'ai' ? 'MindBot' : 'System';
      const timestamp = format(new Date(message.timestamp), 'HH:mm');
      
      textContent += `[${timestamp}] ${sender}:\n`;
      textContent += `${message.content}\n\n`;
      
      if (message.analysis && message.analysis.sentiment !== undefined) {
        textContent += `   → Mood detected: ${message.analysis.sentiment > 0.1 ? 'Positive' : 
                                             message.analysis.sentiment < -0.1 ? 'Negative' : 'Neutral'}\n\n`;
      }
    });

    textContent += `${'='.repeat(50)}\n`;
    textContent += `End of conversation\n`;
    textContent += `Exported at: ${format(new Date(), 'PPP p')}\n`;

    return textContent;
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    try {
      const savedChats = this.getSavedChats();
      const totalMessages = savedChats.reduce((sum, chat) => sum + chat.messages.length, 0);
      const favoriteChats = savedChats.filter(chat => chat.favorite).length;
      
      // Calculate storage usage (approximate)
      const storageData = localStorage.getItem(STORAGE_KEY);
      const storageSize = new Blob([storageData]).size;

      return {
        totalChats: savedChats.length,
        totalMessages,
        favoriteChats,
        storageSize,
        storageSizeFormatted: this.formatBytes(storageSize),
        maxChats: MAX_STORED_CHATS,
        oldestChat: savedChats.length > 0 ? savedChats[savedChats.length - 1].createdAt : null,
        newestChat: savedChats.length > 0 ? savedChats[0].createdAt : null
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Clear all saved chats (with confirmation)
   */
  clearAllChats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Error clearing all chats:', error);
      throw new Error('Failed to clear chats');
    }
  }
}

// Create singleton instance
const chatStorage = new ChatStorage();
export default chatStorage;