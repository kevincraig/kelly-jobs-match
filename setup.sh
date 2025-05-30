#!/bin/bash

echo "Setting up Kelly Jobs Match project..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Install dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install

echo "Installing backend dependencies..."
cd ../backend && npm install

# Setup environment
echo "Setting up environment variables..."
cp .env.example .env

echo "Setup complete!"
echo "To start the project:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm start"