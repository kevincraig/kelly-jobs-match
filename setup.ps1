Write-Host "Setting up Kelly Jobs Match project..." -ForegroundColor Green

# Check if Docker is running
try {
    $dockerStatus = docker info
    Write-Host "Docker is running..." -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL and Redis
Write-Host "Starting PostgreSQL and Redis..." -ForegroundColor Green
docker-compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Green
Set-Location ../backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Setup environment
Write-Host "Setting up environment variables..." -ForegroundColor Green
if (Test-Path .env.example) {
    if (-not (Test-Path .env)) {
        Copy-Item .env.example .env
        Write-Host "Created .env file from .env.example" -ForegroundColor Green
    } else {
        Write-Host ".env file already exists" -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: .env.example file not found" -ForegroundColor Yellow
}

# Return to root directory
Set-Location ..

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "To start the project:" -ForegroundColor Cyan
Write-Host "1. Backend: cd backend; npm run dev" -ForegroundColor Cyan
Write-Host "2. Frontend: cd frontend; npm start" -ForegroundColor Cyan 