# Mental Health Support System - Frontend Starter
Write-Host "🚀 Starting Mental Health Support System Frontend..." -ForegroundColor Green

# Navigate to frontend directory
Set-Location "C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\frontend"

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. You may need to edit it with your API keys." -ForegroundColor Green
}

# Start the React development server
Write-Host "🎨 Starting React development server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

npm start