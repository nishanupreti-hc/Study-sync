#!/bin/bash

echo "Setting up Nishan's AI Study Mentor..."

# Create virtual environment
python3 -m venv study_env
source study_env/bin/activate

# Install requirements
pip install -r requirements.txt

# Install additional system dependencies for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Installing macOS dependencies..."
    brew install tesseract
    brew install portaudio
fi

echo "Setup complete!"
echo "To run the application:"
echo "1. source study_env/bin/activate"
echo "2. streamlit run study_mentor.py"
echo ""
echo "For advanced features with camera:"
echo "streamlit run advanced_mentor.py"
