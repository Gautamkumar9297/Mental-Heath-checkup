# Mental Health Support System - Backend API

A comprehensive Node.js/Express.js backend API for a 24/7 mental health support system featuring mood tracking, AI-powered counseling, analytics dashboard, and real-time crisis intervention.

## 🏗️ Architecture Overview

This backend supports a mental health platform with:
- **User Management**: Authentication, profiles, risk assessment
- **Mood Tracking**: Comprehensive emotional state monitoring 
- **AI Counseling**: 24/7 NLP-powered chatbot and sentiment analysis
- **Session Management**: Professional counselor and peer support sessions
- **Analytics Dashboard**: Well-being trends, mood patterns, and outcomes tracking
- **Crisis Management**: Real-time risk assessment and emergency interventions

## 🛠️ Technology Stack

- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **Development**: nodemon for auto-reload

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mental_health_support

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🗃️ Database Schema

### User Model
- **Authentication**: Email, password (hashed)
- **Profile**: Name, age, gender, phone, preferences
- **Mental Health**: History, medication, emergency contacts
- **Risk Management**: Risk level tracking, crisis indicators
- **Activity Tracking**: Login count, last active timestamp

### Mood Model
- **Mood Data**: Scale (1-10), emotions, intensity levels
- **Context**: Triggers, location, activities, physical symptoms
- **Wellness**: Sleep quality, energy level, coping strategies
- **AI Analysis**: Sentiment analysis, emotion detection, risk indicators
- **Temporal**: Time of day patterns, date tracking

### Session Model
- **Session Types**: AI chatbot, peer support, professional counselor, crisis intervention
- **Communication**: Real-time messaging, file sharing, voice notes
- **AI Analysis**: Sentiment trends, risk assessment, therapy techniques
- **Crisis Management**: Emergency flags, intervention tracking
- **Outcomes**: Satisfaction ratings, goal achievement, follow-up needs

### Analytics Model
- **Mood Analytics**: Trends, patterns, emotional distribution
- **Session Analytics**: Duration, effectiveness, satisfaction scores
- **Wellness Score**: Composite health metrics, progress tracking
- **Predictive Insights**: Risk prediction, intervention recommendations
- **Comparative Data**: Historical comparison, anonymized benchmarks

## 🛣️ API Routes

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /forgot-password` - Password reset request
- `DELETE /account` - Deactivate account

### User Routes (`/api/users`)
- `GET /dashboard` - User dashboard data
- `GET /stats` - User statistics
- `PUT /risk-level` - Update risk level
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update preferences
- `POST /emergency-contact` - Add/update emergency contact
- `GET /activity-summary` - Activity timeline

### Mood Routes (`/api/moods`)
- `POST /` - Create mood entry
- `GET /` - Get mood entries (paginated, filtered)
- `GET /trends` - Get mood trends and analytics

### Session Routes (`/api/sessions`)
- `POST /` - Start new counseling session
- `GET /` - Get user sessions (filtered, paginated)
- `POST /:id/messages` - Add message to session

### Analytics Routes (`/api/analytics`)
- `GET /dashboard` - Analytics dashboard data
- `GET /wellness-score` - User wellness score

### System Routes
- `GET /api/health` - Health check endpoint

## 🔐 Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Public Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/health`

All other endpoints require authentication.

## 📊 Sample API Requests

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "age": 25,
    "gender": "male"
  }'
```

### Create a Mood Entry
```bash
curl -X POST http://localhost:5000/api/moods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "mood": "happy",
    "moodScore": 8,
    "emotions": ["joy", "content"],
    "energyLevel": 7,
    "notes": "Had a great day at work!",
    "triggers": ["work_stress"],
    "copingStrategies": ["exercise", "music"]
  }'
```

### Start a Counseling Session
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "sessionType": "ai_chatbot",
    "title": "Daily Check-in",
    "priority": "normal"
  }'
```

## 🚨 Crisis Management Features

The system includes comprehensive crisis management:

- **Risk Assessment**: Automatic risk level calculation based on mood patterns
- **Emergency Flags**: Immediate attention alerts for concerning entries
- **Crisis Detection**: AI-powered analysis of session content for crisis indicators
- **Emergency Contacts**: Automatic notification system for high-risk situations
- **Professional Escalation**: Seamless handoff to human counselors when needed

## 📈 Analytics & Insights

The analytics system provides:

- **Mood Trends**: Daily, weekly, monthly mood patterns
- **Wellness Scoring**: Composite health metrics
- **Progress Tracking**: Goal achievement and milestone recognition
- **Predictive Analytics**: Risk prediction and intervention recommendations
- **Pattern Recognition**: Trigger identification and coping strategy effectiveness

## 🔧 Development

### Project Structure
```
backend/
├── models/          # Mongoose schemas
│   ├── User.js      # User model
│   ├── Mood.js      # Mood tracking model  
│   ├── Session.js   # Counseling session model
│   └── Analytics.js # Analytics model
├── routes/          # Express route handlers
│   ├── auth.js      # Authentication routes
│   ├── users.js     # User management routes
│   ├── moods.js     # Mood tracking routes
│   ├── sessions.js  # Session management routes
│   └── analytics.js # Analytics routes
├── server.js        # Main server file
├── .env            # Environment variables
└── package.json    # Dependencies and scripts
```

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRE`: JWT expiration time
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Frontend application URL

### Development Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure production MongoDB connection
4. Set appropriate CORS origins
5. Configure rate limiting and security headers

### Database Indexes
The models include optimized indexes for:
- User authentication and lookup
- Mood entry queries and analytics
- Session management and real-time features
- Analytics aggregation queries

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Structured error responses
- **CORS Protection**: Configurable cross-origin settings
- **Data Privacy**: User data anonymization options

## 🧪 Testing

The API is designed for comprehensive testing:

- **Unit Tests**: Model validation and business logic
- **Integration Tests**: API endpoint testing
- **Load Testing**: Performance under concurrent users
- **Security Testing**: Authentication and authorization
- **Crisis Simulation**: Emergency response testing

## 📚 API Documentation

For detailed API documentation with request/response examples, visit:
`http://localhost:5000/api/docs` (when documentation middleware is added)

## 🤝 Contributing

This mental health support system is built to save lives and improve well-being. Contributions should focus on:

- **Crisis Prevention**: Enhanced risk detection algorithms
- **User Experience**: Intuitive and compassionate interfaces  
- **Data Privacy**: Protecting sensitive mental health information
- **Accessibility**: Making support available to all users
- **Evidence-Based**: Features grounded in mental health research

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Crisis Resources

If you or someone you know is in immediate danger:
- **Emergency Services**: Call 911 (US) or local emergency number
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## 📞 Support

For technical support or questions about this implementation:
- Create an issue in the project repository
- Contact the development team
- Check the documentation and API reference

---

**Note**: This is a mental health application handling sensitive data. Always follow healthcare data privacy regulations (HIPAA, GDPR) and implement appropriate security measures in production environments.