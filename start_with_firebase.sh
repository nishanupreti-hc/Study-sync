#!/bin/bash

# Enhanced AI Programming Mentor with Firebase Authentication
echo "🚀 Starting AI Programming Mentor with Firebase Authentication..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase config exists
if grep -q "your-api-key" frontend/src/firebase.js; then
    echo -e "${YELLOW}⚠️  Firebase configuration needed!${NC}"
    echo -e "${BLUE}📋 Please follow these steps:${NC}"
    echo "1. Create a Firebase project at https://console.firebase.google.com/"
    echo "2. Enable Authentication (Email/Password and Google)"
    echo "3. Create Firestore database"
    echo "4. Get your config and update frontend/src/firebase.js"
    echo ""
    echo -e "${BLUE}📖 See FIREBASE_SETUP.md for detailed instructions${NC}"
    echo ""
    read -p "Press Enter to continue with demo mode or Ctrl+C to setup Firebase first..."
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ System requirements check passed${NC}"

# Setup Frontend
echo -e "${BLUE}📦 Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"

# Setup Backend
echo -e "${BLUE}🔧 Setting up backend...${NC}"
cd ../backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f "requirements_installed.flag" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch requirements_installed.flag
fi

echo -e "${GREEN}✅ Backend setup complete${NC}"

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"

# Start backend in background
echo "Starting backend server..."
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo -e "${GREEN}🎉 AI Programming Mentor is now running!${NC}"
echo ""
echo -e "${BLUE}📱 Access your application:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}🔥 New Features:${NC}"
echo "   ✅ Firebase Authentication (Sign up/Sign in)"
echo "   ✅ Enhanced Team Study with real-time features"
echo "   ✅ Progress tracking starting from 0"
echo "   ✅ Google OAuth integration"
echo "   ✅ Team creation and discovery"
echo "   ✅ Member management and roles"
echo ""
echo -e "${BLUE}🛠️  Firebase Setup:${NC}"
echo "   📖 See FIREBASE_SETUP.md for configuration"
echo "   🔧 Update frontend/src/firebase.js with your config"
echo ""
echo -e "${RED}Press Ctrl+C to stop all services${NC}"

# Wait for user interrupt
trap "echo -e '\n${YELLOW}🛑 Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep script running
wait
