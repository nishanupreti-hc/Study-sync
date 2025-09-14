#!/bin/bash

echo "🚀 Starting AI Programming Mentor - Complete Full-Stack Platform"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

print_status "Setting up backend environment..."

# Setup backend
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

print_success "Backend setup complete!"

# Setup frontend
cd ../frontend

print_status "Installing Node.js dependencies..."
npm install

print_success "Frontend setup complete!"

# Create environment file for backend
cd ../backend
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cat > .env << EOL
# AI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4

# Database
DATABASE_URL=sqlite+aiosqlite:///./study_mentor.db

# Redis (optional)
REDIS_URL=redis://localhost:6379

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB

# Camera/Engagement
ENABLE_CAMERA_MONITORING=true
ENGAGEMENT_THRESHOLD=0.7

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
EOL
    print_warning "Please update the .env file with your actual API keys and configuration"
fi

# Start the applications
print_status "Starting backend server..."
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

print_status "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

print_success "🎉 AI Programming Mentor is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "🌟 Features Available:"
echo "   • Interactive Programming Courses (Python, JavaScript, Java, C++, HTML/CSS, SQL)"
echo "   • Pomodoro Timer with Camera Focus Monitoring"
echo "   • AI-Powered Chat Tutors for Each Subject"
echo "   • Team Study and Collaboration"
echo "   • Advanced Analytics and Progress Tracking"
echo "   • Gamification with XP, Levels, and Achievements"
echo "   • Multi-modal Learning (Text, Code, Voice)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Servers stopped. Goodbye!"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
