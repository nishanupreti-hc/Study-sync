#!/usr/bin/env python3
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError:
        print("❌ Failed to install requirements")
        return False
    return True

def run_app():
    """Run the Streamlit application"""
    try:
        subprocess.run([sys.executable, "-m", "streamlit", "run", "study_mentor.py"])
    except KeyboardInterrupt:
        print("\n👋 Study session ended. Great work!")
    except Exception as e:
        print(f"❌ Error running app: {e}")

if __name__ == "__main__":
    print("🎓 Starting Nishan's AI Study Mentor...")
    
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    print("📦 Installing requirements...")
    if install_requirements():
        print("🚀 Launching study mentor...")
        run_app()
    else:
        print("❌ Setup failed. Please check your Python environment.")
