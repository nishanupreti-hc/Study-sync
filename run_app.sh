#!/bin/bash

echo "🚀 Starting AI Study Mentor Frontend..."
echo "======================================"

# Navigate to frontend directory
cd "frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo "🌟 Starting development server..."
echo "App will open at: http://localhost:3000"
echo "======================================"

# Start the development server
npm run dev
