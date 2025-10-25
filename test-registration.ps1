# Test registration endpoint
$testData = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
    password = "testpassword123"
    phone = "555-0123"
    dateOfBirth = "1990-01-01"
    gender = "prefer-not-to-say"
} | ConvertTo-Json

Write-Host "Testing registration endpoint..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:5000/api/auth/register" -ForegroundColor Cyan
Write-Host "Data: $testData" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
                                  -Method POST `
                                  -Body $testData `
                                  -ContentType "application/json" `
                                  -ErrorAction Stop
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}