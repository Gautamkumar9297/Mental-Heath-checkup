# 🚀 Mental Health Support System - Complete Project Startup
# This script will start both backend and frontend services

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "🧠 MENTAL HEALTH SUPPORT SYSTEM - STARTUP SCRIPT" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if MongoDB is accessible
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Yellow
try {
    # Try to connect to MongoDB (this will fail silently if not available)
    Write-Host "⚠️  Make sure MongoDB is running!" -ForegroundColor Yellow
    Write-Host "   Start MongoDB: net start MongoDB (as Administrator)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  MongoDB status unknown. Continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 STARTING BACKEND SERVER..." -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

# Navigate to backend directory
Set-Location "C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\backend"

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Backend .env not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Backend .env created" -ForegroundColor Green
}

Write-Host "🚀 Starting backend server on http://localhost:5000" -ForegroundColor Green
Write-Host "📊 API endpoints available at http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "🏥 Health check: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\backend'; Write-Host '🔥 BACKEND SERVER STARTING...' -ForegroundColor Red; npm run dev"

# Wait a moment for backend to start
Write-Host "⏳ Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎨 STARTING FRONTEND SERVER..." -ForegroundColor Blue
Write-Host "=" * 50 -ForegroundColor Blue

# Navigate to frontend directory
Set-Location "C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\frontend"

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Frontend .env not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
}

Write-Host "🚀 Starting React development server on http://localhost:5173" -ForegroundColor Green
Write-Host "🌐 Main application will open automatically in browser" -ForegroundColor Cyan
Write-Host ""

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\frontend'; Write-Host '🔥 FRONTEND SERVER STARTING...' -ForegroundColor Blue; npm start"

# Wait for frontend to start
Write-Host "⏳ Waiting 10 seconds for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🎉 PROJECT STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""
Write-Host "📍 AVAILABLE SERVICES:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend App:     http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔧 Backend API:      http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "   🏥 Health Check:     http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "   💬 Enhanced Chat:    http://localhost:3000/chat-new" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎯 KEY FEATURES TO TEST:" -ForegroundColor Yellow
Write-Host "   • User Registration:  http://localhost:5173/register" -ForegroundColor White
Write-Host "   • User Login:         http://localhost:5173/login" -ForegroundColor White
Write-Host "   • Real-time Chat:     http://localhost:5173/chat-new" -ForegroundColor White
Write-Host "   • Dashboard:          http://localhost:5173/" -ForegroundColor White
Write-Host "   • Mental Health Tools: Assessment, Resources, Support" -ForegroundColor White
Write-Host ""
Write-Host "🚨 CRISIS SUPPORT:" -ForegroundColor Red
Write-Host "   📞 National Suicide Prevention: 988" -ForegroundColor Red
Write-Host "   🆘 Emergency Services: 911" -ForegroundColor Red
Write-Host ""
Write-Host "💡 TIPS:" -ForegroundColor Yellow
Write-Host "   • Keep both terminal windows open while using the app" -ForegroundColor White
Write-Host "   • Backend must be running for full functionality" -ForegroundColor White
Write-Host "   • Check console logs for any errors" -ForegroundColor White
Write-Host "   • Add OpenAI API key to .env files for AI chat features" -ForegroundColor White
Write-Host ""
Write-Host "🎊 Ready to support mental wellness! 🧠💚" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green

# Try to open browser automatically
Start-Sleep -Seconds 3
try {
    Start-Process "http://localhost:5173"
    Write-Host "🌐 Opening browser to http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not open browser automatically. Please visit http://localhost:5173" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit this startup script..." -ForegroundColor Gray
Read-Host