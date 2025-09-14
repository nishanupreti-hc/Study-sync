#!/bin/bash

echo "🚀 Setting up Ultimate AI Study Mentor System..."
echo "================================================"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv ultimate_env
source ultimate_env/bin/activate

# Upgrade pip
pip install --upgrade pip

echo "📚 Installing core dependencies..."
pip install streamlit opencv-python pandas numpy pillow

echo "🤖 Installing AI/ML libraries..."
pip install openai langchain chromadb transformers torch torchvision

echo "🎤 Installing audio/video processing..."
pip install speechrecognition pyttsx3 librosa whisper pyaudio

echo "👁️ Installing computer vision..."
pip install mediapipe

echo "📊 Installing visualization libraries..."
pip install plotly matplotlib seaborn bokeh altair

echo "📄 Installing document processing..."
pip install PyPDF2 python-docx pytesseract

echo "🔬 Installing scientific computing..."
pip install scikit-learn networkx igraph

echo "🎮 Installing Streamlit extensions..."
pip install streamlit-webrtc streamlit-option-menu streamlit-lottie
pip install streamlit-aggrid streamlit-camera-input-live
pip install streamlit-drawable-canvas streamlit-ace streamlit-chat
pip install streamlit-elements streamlit-player streamlit-folium

echo "🧠 Installing NLP libraries..."
pip install spacy nltk textblob wordcloud

echo "📱 Installing additional utilities..."
pip install requests webrtcvad pyvis

# Install system dependencies for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Installing macOS dependencies..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install system dependencies
    brew install tesseract
    brew install portaudio
    brew install ffmpeg
    
    echo "📱 Installing additional macOS tools..."
    brew install --cask obs  # For advanced screen recording
fi

# Download spaCy model
echo "🧠 Downloading spaCy language model..."
python -m spacy download en_core_web_sm

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p data/uploads
mkdir -p data/processed
mkdir -p data/models
mkdir -p logs
mkdir -p exports

# Create configuration file
echo "⚙️ Creating configuration..."
cat > config.json << EOF
{
    "system": {
        "name": "Ultimate AI Study Mentor",
        "version": "2.0.0",
        "student": "Nishan Upreti"
    },
    "features": {
        "ai_core": true,
        "voice_interface": true,
        "camera_monitoring": true,
        "ar_visualization": true,
        "adaptive_learning": true,
        "scenario_engine": true,
        "gamification": true
    },
    "settings": {
        "default_mode": "Study",
        "auto_save": true,
        "voice_enabled": true,
        "camera_enabled": false,
        "ar_enabled": false
    }
}
EOF

# Create launch script
echo "🚀 Creating launch script..."
cat > launch_ultimate.sh << 'EOF'
#!/bin/bash
echo "🚀 Launching Ultimate AI Study Mentor..."
source ultimate_env/bin/activate
streamlit run ultimate_mentor.py --server.port 8501 --server.headless true
EOF

chmod +x launch_ultimate.sh

# Create quick start script
cat > quick_start.sh << 'EOF'
#!/bin/bash
echo "⚡ Quick Start - Ultimate Study Mentor"
source ultimate_env/bin/activate

echo "Available applications:"
echo "1. Ultimate Mentor (Full Features) - streamlit run ultimate_mentor.py"
echo "2. Complete Mentor (Standard) - streamlit run complete_mentor.py"
echo "3. Basic Mentor (Simple) - streamlit run study_mentor.py"
echo ""
echo "Choose your application:"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🚀 Starting Ultimate Mentor..."
        streamlit run ultimate_mentor.py
        ;;
    2)
        echo "🎯 Starting Complete Mentor..."
        streamlit run complete_mentor.py
        ;;
    3)
        echo "📚 Starting Basic Mentor..."
        streamlit run study_mentor.py
        ;;
    *)
        echo "Invalid choice. Starting Ultimate Mentor..."
        streamlit run ultimate_mentor.py
        ;;
esac
EOF

chmod +x quick_start.sh

echo ""
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "🎯 To start the Ultimate AI Study Mentor:"
echo "   ./launch_ultimate.sh"
echo ""
echo "⚡ For quick start with options:"
echo "   ./quick_start.sh"
echo ""
echo "📚 Manual activation:"
echo "   source ultimate_env/bin/activate"
echo "   streamlit run ultimate_mentor.py"
echo ""
echo "🔧 Features included:"
echo "   ✅ Advanced AI Core with GPT-4 integration"
echo "   ✅ Real-time camera engagement monitoring"
echo "   ✅ Voice interface with conversation mode"
echo "   ✅ AR/3D visualization capabilities"
echo "   ✅ Adaptive learning system"
echo "   ✅ Scenario-based learning"
echo "   ✅ Advanced analytics dashboard"
echo "   ✅ Gamification system"
echo "   ✅ Multi-modal content processing"
echo "   ✅ Session management with Pomodoro"
echo ""
echo "🎓 Ready for advanced learning with Nishan!"
echo "================================================"
