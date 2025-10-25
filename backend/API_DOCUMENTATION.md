# Mental Health Support System API Documentation

## Overview

A comprehensive REST API for a mental health support system with AI-powered chatbot, NLP sentiment analysis, real-time communication, and advanced analytics dashboard.

**Base URL:** `http://localhost:5000/api`

## Authentication

Most endpoints require authentication using JWT tokens.

**Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "age": 25,
  "gender": "male",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token-here"
  }
}
```

### Login User
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Profile
```http
GET /auth/profile
```
*Requires authentication*

---

## 👤 User Management Endpoints

### Get Dashboard Data
```http
GET /users/dashboard
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user info */ },
    "statistics": {
      "totalMoodEntries": 25,
      "totalSessions": 8,
      "averageMoodScore": 7.2,
      "weeklyMoodEntries": 5
    },
    "recentMoods": [ /* recent mood entries */ ],
    "recentSessions": [ /* recent sessions */ ]
  }
}
```

### Get User Statistics
```http
GET /users/stats?period=30
```
*Requires authentication*

### Update User Preferences
```http
PUT /users/preferences
```
*Requires authentication*

---

## 😊 Mood Management Endpoints

### Create Mood Entry
```http
POST /moods
```
*Requires authentication*

**Body:**
```json
{
  "mood": "happy",
  "moodScore": 8,
  "emotions": ["joy", "grateful"],
  "notes": "Had a great day at work!",
  "energyLevel": 7,
  "sleepHours": 8,
  "triggers": ["work_stress"],
  "copingStrategies": ["exercise", "meditation"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mood entry created successfully",
  "data": {
    "mood": { /* mood object */ },
    "nlpInsights": {
      "needsAttention": false,
      "detectedEmotions": [
        { "emotion": "joy", "confidence": 0.85 }
      ],
      "copingStrategiesDetected": ["exercise"],
      "overallSentiment": "positive"
    }
  }
}
```

### Get Mood Entries
```http
GET /moods?page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31
```
*Requires authentication*

### Analyze Text (Real-time)
```http
POST /moods/analyze-text
```
*Requires authentication*

**Body:**
```json
{
  "text": "I'm feeling really anxious about tomorrow's presentation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "sentiment": {
        "sentiment": "negative",
        "confidence": 0.78
      },
      "emotions": [
        { "emotion": "anxiety", "confidence": 0.92 }
      ],
      "crisis": {
        "isCrisis": false,
        "riskLevel": "low"
      }
    },
    "recommendations": ["emotional_support"],
    "supportLevel": "elevated"
  }
}
```

### Get Crisis Check
```http
GET /moods/crisis-check
```
*Requires authentication*

---

## 🤖 AI Chatbot Endpoints

### Start Chatbot Session
```http
POST /chatbot/start-session
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-id",
      "title": "AI Mental Health Support Session",
      "status": "active",
      "messages": [
        {
          "sender": "ai",
          "content": "Hello! I'm MindBot...",
          "timestamp": "2024-01-15T10:00:00Z"
        }
      ]
    }
  }
}
```

### Send Message to Chatbot
```http
POST /chatbot/{sessionId}/message
```
*Requires authentication*

**Body:**
```json
{
  "message": "I'm feeling really overwhelmed lately"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aiResponse": "I understand you're feeling overwhelmed...",
    "requiresAttention": false,
    "analysis": {
      "sentiment": { "sentiment": "negative", "confidence": 0.75 },
      "emotions": [{ "emotion": "stress", "confidence": 0.82 }],
      "supportLevel": "elevated"
    },
    "suggestions": {
      "copingStrategies": [
        "Try the 4-7-8 breathing technique",
        "Break down overwhelming tasks into smaller steps"
      ],
      "recommendedActions": ["emotional_support"]
    }
  }
}
```

### End Chatbot Session
```http
POST /api/chatbot/{sessionId}/end
```
*Requires authentication*

**Body:**
```json
{
  "feedback": {
    "satisfaction": 4,
    "effectiveness": 4,
    "helpful": true
  }
}
```

### Get Chat History (with Pagination & Search)
```http
GET /api/chatbot/chat-history?page=1&limit=10&search=anxiety&status=completed
```
*Requires authentication*

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of sessions per page (default: 10)
- `search` (optional): Search term to filter conversations
- `status` (optional): Filter by session status (active, completed, paused)
- `startDate` (optional): Filter conversations from this date
- `endDate` (optional): Filter conversations until this date

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "title": "AI Mental Health Support Session",
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T10:30:00Z",
        "status": "completed",
        "duration": 30,
        "messageCount": 12,
        "lastActivity": "2024-01-15T10:30:00Z",
        "lastMessage": {
          "sender": "ai",
          "content": "Take care and remember to practice those breathing exercises...",
          "timestamp": "2024-01-15T10:30:00Z"
        },
        "firstUserMessage": {
          "content": "I've been feeling really anxious lately...",
          "timestamp": "2024-01-15T10:00:00Z"
        },
        "priority": "normal",
        "needsAttention": false,
        "emotionalSummary": {
          "dominantEmotion": "anxiety",
          "intensity": 0.7
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalSessions": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalConversations": 25,
      "activeConversations": 2,
      "completedConversations": 23
    }
  }
}
```

### Get Recent Conversations
```http
GET /api/chatbot/recent
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "title": "Recent Chat Session",
        "startTime": "2024-01-15T10:00:00Z",
        "status": "completed",
        "messageCount": 8,
        "lastMessage": {
          "sender": "ai",
          "content": "I'm glad we could talk today...",
          "timestamp": "2024-01-15T10:25:00Z"
        },
        "firstUserMessage": "I had a difficult day",
        "priority": "normal"
      }
    ],
    "count": 5
  }
}
```

### Continue Previous Conversation
```http
POST /api/chatbot/{sessionId}/continue
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "message": "Chat session resumed successfully",
  "data": {
    "sessionId": "session-id",
    "status": "active",
    "messages": [ /* all previous messages plus resume message */ ],
    "resumedAt": "2024-01-16T09:00:00Z",
    "canContinue": true,
    "previousDuration": 25
  }
}
```

### Get Conversation Summary
```http
GET /api/chatbot/{sessionId}/summary
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionInfo": {
      "id": "session-id",
      "title": "Mental Health Support Session",
      "startTime": "2024-01-15T10:00:00Z",
      "status": "completed",
      "duration": 30,
      "canContinue": true
    },
    "conversationHighlights": {
      "totalMessages": 12,
      "userMessages": 6,
      "aiMessages": 6,
      "firstTopic": {
        "content": "I've been struggling with anxiety attacks lately...",
        "timestamp": "2024-01-15T10:02:00Z"
      },
      "lastTopic": {
        "content": "The breathing exercises really helped, thank you",
        "timestamp": "2024-01-15T10:28:00Z"
      },
      "lastAIResponse": {
        "content": "I'm so glad the breathing exercises helped! Remember, you can use them anytime you feel anxious...",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    },
    "emotionalContext": {
      "dominantEmotion": "anxiety",
      "intensity": 0.6,
      "stability": "improving"
    },
    "riskAssessment": {
      "level": "low",
      "indicators": [],
      "needsAttention": false
    },
    "keyTopics": ["anxiety", "breathing_exercises", "coping_strategies"],
    "recommendations": ["continue_monitoring", "practice_coping_strategies"]
  }
}
```

### Search Chat History
```http
GET /api/chatbot/search?query=anxiety&page=1&limit=5
```
*Requires authentication*

**Query Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "session-id",
        "title": "Anxiety Support Session",
        "startTime": "2024-01-15T10:00:00Z",
        "status": "completed",
        "messageCount": 10,
        "matchingMessages": [
          {
            "sender": "user",
            "content": "I have severe anxiety attacks",
            "timestamp": "2024-01-15T10:05:00Z",
            "highlighted": "I have severe **anxiety** attacks"
          }
        ],
        "matchCount": 3
      }
    ],
    "searchQuery": "anxiety",
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalResults": 8,
      "hasNextPage": true
    }
  }
}
```

### Pause Conversation
```http
POST /api/chatbot/{sessionId}/pause
```
*Requires authentication*

**Body:**
```json
{
  "reason": "Need to take a break"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation paused successfully",
  "data": {
    "sessionId": "session-id",
    "status": "paused",
    "pausedAt": "2024-01-15T10:15:00Z",
    "canResume": true
  }
}
```

### Quick Support (No Session)
```http
POST /chatbot/quick-support
```
*Requires authentication*

**Body:**
```json
{
  "message": "I need some quick advice for anxiety",
  "context": { "urgent": false }
}
```

---

## 💬 Session Management

### Create Session
```http
POST /sessions
```
*Requires authentication*

### Get User Sessions
```http
GET /sessions?page=1&limit=10&status=active&sessionType=ai_chatbot
```
*Requires authentication*

### Add Message to Session
```http
POST /sessions/{sessionId}/messages
```
*Requires authentication*

---

## 📊 Analytics Dashboard Endpoints

### Get Complete Dashboard Analytics
```http
GET /analytics/dashboard?period=30&includeComparisons=true&includePredictions=false
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "period": 30,
    "generatedAt": "2024-01-15T10:00:00Z",
    "summary": {
      "totalMoodEntries": 25,
      "avgMoodScore": 7.2,
      "totalSessions": 8,
      "currentRiskLevel": "low"
    },
    "charts": {
      "moodTrends": {
        "type": "line",
        "data": {
          "labels": ["Jan 1", "Jan 2", "Jan 3"],
          "datasets": [{
            "label": "Mood Score",
            "data": [7, 8, 6],
            "borderColor": "#3b82f6"
          }]
        },
        "options": { /* Chart.js options */ }
      },
      "moodDistribution": {
        "type": "doughnut",
        "data": { /* Chart.js doughnut data */ }
      },
      "emotions": {
        "type": "bar",
        "data": { /* Chart.js bar data */ }
      },
      "wellness": {
        "type": "radar",
        "data": { /* Chart.js radar data */ }
      },
      "sessionActivity": {
        "type": "bar",
        "data": { /* Chart.js stacked bar data */ }
      }
    },
    "comparisons": {
      "current": { /* current period stats */ },
      "previous": { /* previous period stats */ },
      "changes": {
        "moodChange": 12.5,
        "engagementChange": -5.2
      }
    }
  }
}
```

### Individual Chart Endpoints

#### Mood Trends Chart
```http
GET /analytics/mood-trends?period=30
```

#### Mood Distribution Chart
```http
GET /analytics/mood-distribution?period=30
```

#### Emotions Frequency Chart
```http
GET /analytics/emotions?period=30
```

#### Session Activity Chart
```http
GET /analytics/session-activity?period=30
```

#### Wellness Score Radar Chart
```http
GET /analytics/wellness-score
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": 72,
    "components": {
      "moodStability": 75,
      "engagementLevel": 68,
      "progressRate": 82,
      "copingSkills": 70,
      "socialConnection": 65,
      "selfCare": 73
    },
    "chart": { /* Chart.js radar chart data */ },
    "trend": "improving"
  }
}
```

### User Summary Statistics
```http
GET /analytics/summary?period=30
```

### Predictive Insights
```http
GET /analytics/predictions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskPrediction": "low",
    "confidence": 0.75,
    "recommendations": [
      "Continue regular mood tracking",
      "Maintain current coping strategies"
    ],
    "trendAnalysis": {
      "direction": "stable",
      "strength": 0.3
    }
  }
}
```

### Comparative Analytics
```http
GET /analytics/comparisons?period=30
```

### Generate Analytics Report
```http
POST /analytics/generate-report
```
*Requires authentication*

**Body:**
```json
{
  "period": 30,
  "reportType": "comprehensive"
}
```

---

## 🔄 Real-time Communication (Socket.io)

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client to Server Events

**Start Chat Session:**
```javascript
socket.emit('start_chat_session', {});
```

**Send Chat Message:**
```javascript
socket.emit('chat_message', {
  sessionId: 'session-id',
  message: 'Hello, I need help with anxiety'
});
```

**End Chat Session:**
```javascript
socket.emit('end_chat_session', {
  sessionId: 'session-id',
  feedback: { satisfaction: 4 }
});
```

**Analyze Text:**
```javascript
socket.emit('analyze_text', {
  text: 'I am feeling very sad today'
});
```

**Typing Indicators:**
```javascript
socket.emit('typing', { sessionId: 'session-id' });
socket.emit('stop_typing', { sessionId: 'session-id' });
```

#### Server to Client Events

**Connection Confirmed:**
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data.message);
});
```

**Session Started:**
```javascript
socket.on('session_started', (data) => {
  console.log('Session ID:', data.sessionId);
  console.log('AI Greeting:', data.greeting);
});
```

**AI Response:**
```javascript
socket.on('ai_response', (data) => {
  console.log('AI Message:', data.message);
  console.log('Analysis:', data.analysis);
  console.log('Suggestions:', data.suggestions);
});
```

**Crisis Detected:**
```javascript
socket.on('crisis_detected', (data) => {
  console.log('Crisis Alert:', data.message);
  console.log('Resources:', data.resources);
});
```

**Text Analysis Result:**
```javascript
socket.on('text_analysis_result', (data) => {
  console.log('Analysis:', data.analysis);
});
```

---

## 🛡️ Security Features

### Rate Limiting
- **Authentication endpoints:** 5 attempts per 15 minutes
- **API endpoints:** 100 requests per minute
- **Chatbot messages:** 30 messages per minute
- **Mood entries:** 10 entries per minute
- **Text analysis:** 20 requests per minute

### Input Validation
All inputs are validated and sanitized:
- Email format validation
- Password strength requirements
- Text length limits
- Enum value validation
- SQL injection prevention
- XSS protection

### Security Headers
- Content Security Policy
- CORS configuration
- Rate limiting headers
- Request logging

---

## 📈 Chart.js Integration

All analytics endpoints return Chart.js-compatible data structures:

```javascript
// Example usage with Chart.js
const response = await fetch('/api/analytics/mood-trends');
const { data: chartConfig } = await response.json();

const chart = new Chart(ctx, chartConfig);
```

### Supported Chart Types
- **Line Charts:** Mood trends over time
- **Doughnut Charts:** Mood distribution
- **Bar Charts:** Emotions frequency, session activity
- **Radar Charts:** Wellness score components

### Color Schemes
- **Mood colors:** Semantic colors for different moods
- **Emotion colors:** Distinct colors for emotions
- **Wellness colors:** Professional blue/violet palette

---

## 🚨 Crisis Management

### Automatic Detection
- NLP analysis detects crisis keywords
- Risk levels: low, moderate, high, critical
- Automatic flagging and intervention

### Crisis Response
- Immediate resources provided
- Emergency contacts suggested
- Professional referrals recommended
- Real-time alerts to counselors

### Emergency Resources
- **National Suicide Prevention Lifeline:** 988
- **Crisis Text Line:** Text HOME to 741741
- **Emergency Services:** 911

---

## 📊 Data Models

### Mood Entry
```json
{
  "mood": "happy|sad|neutral|very_happy|very_sad",
  "moodScore": 1-10,
  "emotions": ["anxiety", "joy", "stress"],
  "notes": "Free text",
  "energyLevel": 1-10,
  "sleepHours": 0-24,
  "needsImmediateAttention": false,
  "sentimentAnalysis": {
    "sentiment": "positive|negative|neutral",
    "confidence": 0.85,
    "keywords": ["happy", "work"],
    "emotionDetection": [
      { "emotion": "joy", "confidence": 0.9 }
    ]
  }
}
```

### Session
```json
{
  "sessionType": "ai_chatbot|professional_counselor|peer_support",
  "status": "active|ended|paused",
  "priority": "normal|high|critical|emergency",
  "messages": [
    {
      "sender": "user|ai|counselor",
      "content": "Message text",
      "timestamp": "2024-01-15T10:00:00Z",
      "sentiment": "positive|negative|neutral"
    }
  ],
  "crisisFlags": {
    "isCrisis": false,
    "crisisType": "suicidal|self_harm|panic_attack"
  }
}
```

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mental_health_support

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Gemini AI (for AI chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start MongoDB**

4. **Run the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## 📚 Additional Features

### NLP Capabilities
- **Sentiment Analysis:** Real-time emotion detection
- **Crisis Detection:** Automatic risk assessment
- **Theme Extraction:** Key topic identification
- **Coping Strategies:** Automatic recommendation

### Analytics Features
- **Trend Analysis:** Mood patterns over time
- **Comparative Analytics:** Period-over-period comparison
- **Predictive Insights:** Risk prediction algorithms
- **Wellness Scoring:** Multi-dimensional health metrics

### Real-time Features
- **Live Chat:** Instant AI responses
- **Typing Indicators:** Real-time interaction feedback
- **Crisis Alerts:** Immediate intervention notifications
- **Session Management:** Live session tracking

---

This API provides a comprehensive foundation for building a mental health support application with advanced AI capabilities, real-time communication, and detailed analytics dashboard integration.