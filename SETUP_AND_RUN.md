# 🚀 Mental Health Support System - Setup & Run Guide

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **OpenAI API Key** - [Get from OpenAI](https://platform.openai.com/api-keys)

## 🏗️ Project Structure

```
mental-health-support-system/
├── backend/              # Node.js/Express.js API server
├── frontend/             # React.js client application
├── SETUP_AND_RUN.md     # This file
└── README.md            # Project overview
```

## ⚙️ Environment Setup

### 1. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy environment template:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file with your configurations:
   ```env
   # Essential configurations
   MONGODB_URI=mongodb://localhost:27017/mental-health-support
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   OPENAI_API_KEY=your_openai_api_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

### 2. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Copy environment template:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```

## 🎯 Quick Start (Development)

### Option 1: Run Both Services Simultaneously

1. **Install dependencies for both projects:**
   ```bash
   # From project root
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

2. **Start MongoDB:**
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # Or start manually
   mongod --dbpath "C:\Program Files\MongoDB\Server\6.0\data\db"
   ```

3. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: http://localhost:5000

4. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on: http://localhost:3000

### Option 2: Step-by-Step Setup

#### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start MongoDB service:**
   ```bash
   net start MongoDB
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

#### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React app:**
   ```bash
   npm start
   ```

## 🔧 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🌐 Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Socket.IO:** http://localhost:5000 (for real-time chat)
- **API Documentation:** http://localhost:5000/api/docs (if implemented)

## 🎨 Key Features to Test

### 1. **Authentication System**
- Register: http://localhost:3000/register
- Login: http://localhost:3000/login

### 2. **Dashboard**
- Main Dashboard: http://localhost:3000/
- Analytics & mood tracking

### 3. **AI Chat Support**
- Original Chat: http://localhost:3000/chat
- Enhanced Chat: http://localhost:3000/chat-new (Real-time with Socket.IO)

### 4. **Mental Health Features**
- Assessment: http://localhost:3000/assessment
- Resources: http://localhost:3000/resources
- Peer Support: http://localhost:3000/peer-support
- Book Appointment: http://localhost:3000/book-appointment

### 5. **Admin Panel**
- Admin Dashboard: http://localhost:3000/admin

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000/5000 already in use:**
   ```bash
   # Kill processes on Windows
   netstat -ano | findstr :3000
   taskkill /F /PID <PID_NUMBER>
   ```

2. **MongoDB connection error:**
   ```bash
   # Check if MongoDB is running
   net start MongoDB
   
   # Or check service status
   sc query MongoDB
   ```

3. **Environment variables not loading:**
   - Ensure `.env` files are in the correct directories
   - Restart both servers after changing `.env` files
   - Check for typos in variable names

4. **CORS errors:**
   - Verify `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches CORS configuration

5. **Socket.IO connection issues:**
   - Check `REACT_APP_SOCKET_URL` in frontend `.env`
   - Verify backend Socket.IO server is running
   - Check browser console for connection errors

### Performance Optimization

1. **Backend:**
   - Enable MongoDB indexes
   - Use Redis for session management
   - Implement request caching

2. **Frontend:**
   - Use React.memo for expensive components
   - Implement code splitting
   - Optimize bundle size

## 📱 Mobile Testing

The app is responsive and can be tested on mobile:
1. Find your local IP address
2. Update CORS_ORIGIN to include your IP
3. Access via `http://YOUR_IP:3000`

## 🚀 Production Deployment

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-strong-production-secret
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=https://your-domain.com
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

### Build Commands
```bash
# Frontend
cd frontend && npm run build

# Backend (if using PM2)
cd backend && pm2 start ecosystem.config.js
```

## 🆘 Support

If you encounter issues:
1. Check the console logs (both browser and terminal)
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check MongoDB connection
5. Verify OpenAI API key is valid

## 🎉 Success!

Once everything is running:
1. Visit http://localhost:3000
2. Register a new account
3. Test the real-time chat at http://localhost:3000/chat-new
4. Explore all mental health features

Your Mental Health Support System is now ready! 🧠💚