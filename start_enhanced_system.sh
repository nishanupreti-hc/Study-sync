#!/bin/bash

# Enhanced AI Programming Mentor - Startup Script
# Version 2.0 with Advanced Posture Tracking and Auto Pause/Resume

echo "🚀 Starting Enhanced AI Programming Mentor System v2.0"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check system requirements
print_info "Checking system requirements..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi

# Check if camera is available (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_info "Checking camera permissions on macOS..."
    # Note: Camera permission will be requested when the app starts
fi

print_status "System requirements check passed"

# Setup backend
print_info "Setting up enhanced backend..."

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/upgrade dependencies
print_info "Installing enhanced backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating environment configuration..."
    cat > .env << EOF
# Enhanced AI Programming Mentor Configuration
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL=sqlite+aiosqlite:///./enhanced_mentor.db
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB
ENABLE_CAMERA_MONITORING=true
ENGAGEMENT_THRESHOLD=0.7
AUTO_PAUSE_ENABLED=true
POSTURE_ANALYSIS_INTERVAL=1.0
MOVEMENT_THRESHOLD=0.05
ABSENCE_THRESHOLD=3.0
EOF
    print_warning "Please update .env file with your OpenAI API key"
fi

print_status "Backend setup completed"

# Setup frontend
print_info "Setting up enhanced frontend..."

cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
fi

print_status "Frontend setup completed"

# Create uploads directory
mkdir -p ../backend/uploads

print_status "Enhanced system setup completed!"

echo ""
echo "🎯 NEW ENHANCED FEATURES:"
echo "========================="
echo "✨ Advanced Posture Tracking with MediaPipe"
echo "✨ Automatic Pause/Resume based on Person Detection"
echo "✨ Professional UI with Real-time Status"
echo "✨ Camera Always Active (No Disable Option)"
echo "✨ Improved Movement Detection with Body Structure"
echo "✨ WebSocket Real-time Communication"
echo "✨ Enhanced Focus Scoring Algorithm"
echo ""

# Start the services
print_info "Starting enhanced services..."

# Start backend in background
cd ../backend
print_info "Starting enhanced backend server..."
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
cd ../frontend
print_info "Starting enhanced frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait for services to start
sleep 5

echo ""
echo "🎉 ENHANCED SYSTEM READY!"
echo "========================"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🔥 ENHANCED FEATURES ACTIVE:"
echo "• 📹 Camera monitoring with automatic activation"
echo "• 🧘 Advanced posture analysis with MediaPipe"
echo "• ⏸️  Auto-pause when person leaves camera view"
echo "• ▶️  Auto-resume when person returns"
echo "• 🏃 Improved movement tracking with body structure"
echo "• 💼 Professional UI design"
echo "• 🔄 Real-time WebSocket communication"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "• Camera permission will be requested on first use"
echo "• Ensure good lighting for optimal posture detection"
echo "• Position yourself clearly in camera view"
echo "• Auto-pause feature requires person detection"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo -e "\n🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Keep script running
wait
