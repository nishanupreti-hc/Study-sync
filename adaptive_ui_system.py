import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import json

class AdaptiveUISystem:
    def __init__(self):
        self.themes = self.setup_themes()
        self.subject_colors = self.setup_subject_colors()
        self.responsive_config = self.setup_responsive_config()
        
    def setup_themes(self):
        return {
            "light": {
                "primary": "#667eea",
                "secondary": "#764ba2", 
                "accent": "#f093fb",
                "background": "#ffffff",
                "surface": "#f8f9fa",
                "text": "#2c3e50",
                "text_secondary": "#6c757d",
                "success": "#28a745",
                "warning": "#ffc107",
                "error": "#dc3545",
                "info": "#17a2b8"
            },
            "dark": {
                "primary": "#bb86fc",
                "secondary": "#03dac6",
                "accent": "#cf6679",
                "background": "#121212",
                "surface": "#1e1e1e",
                "text": "#ffffff",
                "text_secondary": "#b3b3b3",
                "success": "#4caf50",
                "warning": "#ff9800",
                "error": "#f44336",
                "info": "#2196f3"
            }
        }
    
    def setup_subject_colors(self):
        return {
            "physics": {"primary": "#3f51b5", "accent": "#9c27b0"},
            "chemistry": {"primary": "#4caf50", "accent": "#8bc34a"},
            "biology": {"primary": "#ff9800", "accent": "#ff5722"},
            "mathematics": {"primary": "#2196f3", "accent": "#03a9f4"},
            "programming": {"primary": "#9e9e9e", "accent": "#607d8b"},
            "english": {"primary": "#e91e63", "accent": "#f06292"}
        }
    
    def setup_responsive_config(self):
        return {
            "mobile": {"max_width": "768px", "columns": 1},
            "tablet": {"max_width": "1024px", "columns": 2},
            "desktop": {"max_width": "1920px", "columns": 3}
        }
    
    def get_theme_css(self, theme_mode="light", subject="general"):
        theme = self.themes[theme_mode]
        subject_colors = self.subject_colors.get(subject, {"primary": theme["primary"], "accent": theme["accent"]})
        
        return f"""
        <style>
        :root {{
            --primary-color: {subject_colors["primary"]};
            --secondary-color: {theme["secondary"]};
            --accent-color: {subject_colors["accent"]};
            --background-color: {theme["background"]};
            --surface-color: {theme["surface"]};
            --text-color: {theme["text"]};
            --text-secondary: {theme["text_secondary"]};
            --success-color: {theme["success"]};
            --warning-color: {theme["warning"]};
            --error-color: {theme["error"]};
            --info-color: {theme["info"]};
        }}
        
        .main-dashboard {{
            background: var(--background-color);
            color: var(--text-color);
            min-height: 100vh;
            padding: 1rem;
        }}
        
        .dashboard-header {{
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            padding: 2rem;
            border-radius: 15px;
            margin-bottom: 2rem;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }}
        
        .panel {{
            background: var(--surface-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }}
        
        .panel:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }}
        
        .profile-panel {{
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            color: white;
        }}
        
        .coding-panel {{
            background: linear-gradient(45deg, #2c3e50, #34495e);
            color: white;
        }}
        
        .focus-panel {{
            background: linear-gradient(45deg, var(--success-color), #27ae60);
            color: white;
        }}
        
        .team-panel {{
            background: linear-gradient(45deg, var(--info-color), #3498db);
            color: white;
        }}
        
        .ai-panel {{
            background: linear-gradient(45deg, var(--accent-color), #e74c3c);
            color: white;
        }}
        
        .gamification-panel {{
            background: linear-gradient(45deg, #f39c12, #e67e22);
            color: white;
        }}
        
        .metric-card {{
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 1rem;
            margin: 0.5rem 0;
            backdrop-filter: blur(10px);
        }}
        
        .status-indicator {{
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }}
        
        .status-online {{ background: var(--success-color); }}
        .status-away {{ background: var(--warning-color); }}
        .status-offline {{ background: var(--error-color); }}
        
        .progress-ring {{
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: conic-gradient(var(--primary-color) 0deg, var(--accent-color) 180deg, transparent 180deg);
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        
        .feature-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }}
        
        .mobile-responsive {{
            display: flex;
            flex-direction: column;
        }}
        
        @media (max-width: 768px) {{
            .dashboard-header {{ padding: 1rem; }}
            .panel {{ margin: 0.5rem 0; padding: 1rem; }}
            .feature-grid {{ grid-template-columns: 1fr; }}
        }}
        
        @media (min-width: 769px) and (max-width: 1024px) {{
            .feature-grid {{ grid-template-columns: repeat(2, 1fr); }}
        }}
        
        @media (min-width: 1025px) {{
            .feature-grid {{ grid-template-columns: repeat(3, 1fr); }}
        }}
        
        .theme-toggle {{
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: var(--surface-color);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }}
        
        .ar-container {{
            border: 2px dashed var(--accent-color);
            background: rgba(var(--accent-color), 0.1);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        
        .collaboration-active {{
            border-left: 4px solid var(--success-color);
            background: rgba(var(--success-color), 0.1);
        }}
        
        .notification-badge {{
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--error-color);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        </style>
        """

def initialize_ui_system():
    if 'ui_system' not in st.session_state:
        st.session_state.ui_system = AdaptiveUISystem()
    
    if 'theme_mode' not in st.session_state:
        st.session_state.theme_mode = "light"
    
    if 'current_subject' not in st.session_state:
        st.session_state.current_subject = "general"

def create_profile_panel():
    return """
    <div class="panel profile-panel">
        <h3>👤 Profile & Status</h3>
        <div class="metric-card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h4>Nishan Upreti</h4>
                    <p>Level 15 Scholar</p>
                    <span class="status-indicator status-online"></span>Online
                </div>
                <div class="progress-ring">
                    <span>85%</span>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
            <div class="metric-card">
                <h5>🏆 Level</h5>
                <h3>15</h3>
            </div>
            <div class="metric-card">
                <h5>💰 Coins</h5>
                <h3>2,450</h3>
            </div>
            <div class="metric-card">
                <h5>🔥 Streak</h5>
                <h3>12 days</h3>
            </div>
        </div>
    </div>
    """

def create_study_mode_panel():
    return """
    <div class="panel">
        <h3>🎯 Study Mode Selector</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="metric-card" style="cursor: pointer; border: 2px solid var(--primary-color);">
                <h4>📚 Study Mode</h4>
                <p>Regular learning sessions</p>
            </div>
            <div class="metric-card" style="cursor: pointer;">
                <h4>📝 Exam Mode</h4>
                <p>Intensive preparation</p>
            </div>
            <div class="metric-card" style="cursor: pointer;">
                <h4>🔄 Review Mode</h4>
                <p>Spaced repetition</p>
            </div>
            <div class="metric-card" style="cursor: pointer;">
                <h4>🚀 Project Mode</h4>
                <p>Creative collaboration</p>
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <h4>📖 Current Subject: Physics</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span style="background: var(--primary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">Physics</span>
                <span style="background: var(--accent-color); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">Chemistry</span>
                <span style="background: var(--secondary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">Math</span>
            </div>
        </div>
    </div>
    """

def create_active_learning_panel():
    return """
    <div class="panel">
        <h3>🧠 Active Learning Panel</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="metric-card">
                <h4>📝 Smart Notes</h4>
                <p>AI-generated summaries</p>
                <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem;">
                    <small>Newton's Laws of Motion...</small>
                </div>
            </div>
            <div class="metric-card">
                <h4>🃏 Flashcards</h4>
                <p>Spaced repetition system</p>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                    <span>Due: 5</span>
                    <span>Mastered: 23</span>
                </div>
            </div>
            <div class="metric-card">
                <h4>🎥 Video Learning</h4>
                <p>Interactive video analysis</p>
                <div style="background: rgba(255,255,255,0.1); height: 60px; border-radius: 4px; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center;">
                    ▶️ Physics Simulation
                </div>
            </div>
            <div class="metric-card">
                <h4>🔬 AR/3D Simulations</h4>
                <p>Immersive learning</p>
                <div class="ar-container" style="height: 60px; margin-top: 0.5rem;">
                    🥽 3D Molecule View
                </div>
            </div>
        </div>
    </div>
    """

def create_coding_panel():
    return """
    <div class="panel coding-panel">
        <h3>💻 Coding & Programming</h3>
        <div class="metric-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>🐍 Python Environment</h4>
                <span class="status-indicator status-online"></span>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-family: monospace; margin: 1rem 0;">
                <div style="color: #4CAF50;"># AI Pair Programming Active</div>
                <div>def calculate_velocity(distance, time):</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;return distance / time</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <button style="background: var(--success-color); border: none; padding: 0.5rem; border-radius: 4px; color: white;">▶️ Run</button>
                <button style="background: var(--info-color); border: none; padding: 0.5rem; border-radius: 4px; color: white;">🔍 Debug</button>
                <button style="background: var(--warning-color); border: none; padding: 0.5rem; border-radius: 4px; color: white;">🤖 AI Help</button>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
            <div class="metric-card">
                <h5>🏆 Challenges</h5>
                <h3>47 Completed</h3>
            </div>
            <div class="metric-card">
                <h5>🐛 Bugs Fixed</h5>
                <h3>23 Today</h3>
            </div>
        </div>
    </div>
    """

def create_focus_panel():
    return """
    <div class="panel focus-panel">
        <h3>🎯 Productivity & Focus</h3>
        <div class="metric-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4>🍅 Pomodoro Timer</h4>
                    <h2>23:45</h2>
                    <p>Focus Session Active</p>
                </div>
                <div class="progress-ring">
                    <span>76%</span>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
            <div class="metric-card">
                <h5>📊 Focus Score</h5>
                <h3>87%</h3>
            </div>
            <div class="metric-card">
                <h5>⏱️ Study Time</h5>
                <h3>4.2h</h3>
            </div>
            <div class="metric-card">
                <h5>🎯 Tasks Done</h5>
                <h3>8/12</h3>
            </div>
        </div>
        <div class="metric-card" style="margin-top: 1rem;">
            <h4>📈 Today's Focus Trend</h4>
            <div style="background: rgba(255,255,255,0.1); height: 60px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                📊 Focus Chart
            </div>
        </div>
    </div>
    """

def create_team_panel():
    return """
    <div class="panel team-panel">
        <h3>🤝 Collaboration & Team</h3>
        <div class="metric-card collaboration-active">
            <h4>👥 Active Team: Study Squad</h4>
            <div style="display: flex; gap: 1rem; margin: 1rem 0;">
                <div style="display: flex; align-items: center;">
                    <span class="status-indicator status-online"></span>
                    <span>Nishan (You)</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="status-indicator status-online"></span>
                    <span>Alice</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="status-indicator status-away"></span>
                    <span>Bob</span>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="metric-card">
                <h4>💬 Team Chat</h4>
                <div style="position: relative;">
                    <p>Latest: "Great progress on physics!"</p>
                    <span class="notification-badge">3</span>
                </div>
            </div>
            <div class="metric-card">
                <h4>📹 Video Call</h4>
                <button style="background: var(--success-color); border: none; padding: 0.5rem 1rem; border-radius: 4px; color: white; width: 100%;">Join Call</button>
            </div>
            <div class="metric-card">
                <h4>🖥️ Shared Screen</h4>
                <p>Alice is sharing: Code Editor</p>
            </div>
            <div class="metric-card">
                <h4>📊 Team Progress</h4>
                <div style="display: flex; justify-content: space-between;">
                    <span>Level 12</span>
                    <span>1,850 XP</span>
                </div>
            </div>
        </div>
    </div>
    """

def create_ai_panel():
    return """
    <div class="panel ai-panel">
        <h3>🤖 AI Assistance & Creativity</h3>
        <div class="metric-card">
            <h4>💬 AI Tutor Chat</h4>
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <div style="margin-bottom: 0.5rem;">
                    <strong>You:</strong> Explain quantum mechanics
                </div>
                <div>
                    <strong>AI:</strong> Quantum mechanics describes the behavior of matter and energy at the atomic scale...
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <input style="flex: 1; padding: 0.5rem; border: none; border-radius: 4px;" placeholder="Ask AI anything...">
                <button style="background: var(--success-color); border: none; padding: 0.5rem 1rem; border-radius: 4px; color: white;">Send</button>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div class="metric-card">
                <h4>🧠 Mind Maps</h4>
                <p>AI-generated concept maps</p>
            </div>
            <div class="metric-card">
                <h4>📝 Essay Helper</h4>
                <p>Writing assistance & review</p>
            </div>
            <div class="metric-card">
                <h4>🔬 Lab Reports</h4>
                <p>Automated report generation</p>
            </div>
            <div class="metric-card">
                <h4>🎨 Creative Projects</h4>
                <p>AI-powered ideation</p>
            </div>
        </div>
    </div>
    """

def create_gamification_panel():
    return """
    <div class="panel gamification-panel">
        <h3>🎮 Gamification & Achievements</h3>
        <div class="metric-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4>🏆 Current Level: 15</h4>
                    <p>2,450 / 3,000 XP to Level 16</p>
                </div>
                <div class="progress-ring">
                    <span>82%</span>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
            <div class="metric-card">
                <h4>🏅 Recent Achievements</h4>
                <div style="margin-top: 0.5rem;">
                    <div>🎯 Quiz Master</div>
                    <div>🔥 Week Warrior</div>
                    <div>💻 Code Ninja</div>
                </div>
            </div>
            <div class="metric-card">
                <h4>🎯 Active Challenges</h4>
                <div style="margin-top: 0.5rem;">
                    <div>📚 Study 5 hours today (3/5)</div>
                    <div>🧪 Complete 3 experiments (2/3)</div>
                    <div>💻 Solve 10 coding problems (7/10)</div>
                </div>
            </div>
        </div>
        <div class="metric-card" style="margin-top: 1rem;">
            <h4>🏆 Leaderboard Position</h4>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>#3 in Physics</span>
                <span>#1 in Programming</span>
                <span>#5 Overall</span>
            </div>
        </div>
    </div>
    """

def main():
    st.set_page_config(
        page_title="🌟 AI Study Mentor Dashboard",
        layout="wide",
        initial_sidebar_state="collapsed"
    )
    
    initialize_ui_system()
    ui_system = st.session_state.ui_system
    
    # Theme toggle in sidebar
    with st.sidebar:
        st.title("🎨 Theme Controls")
        
        # Theme mode toggle
        theme_mode = st.radio("Theme Mode:", ["light", "dark"], 
                             index=0 if st.session_state.theme_mode == "light" else 1)
        st.session_state.theme_mode = theme_mode
        
        # Subject context
        subject = st.selectbox("Subject Context:", 
                              ["general", "physics", "chemistry", "biology", "mathematics", "programming", "english"])
        st.session_state.current_subject = subject
        
        # Responsive preview
        st.subheader("📱 Responsive Preview")
        device_mode = st.selectbox("Device:", ["Desktop", "Tablet", "Mobile"])
        
        if device_mode == "Mobile":
            st.info("📱 Mobile layout active")
        elif device_mode == "Tablet":
            st.info("📱 Tablet layout active")
        else:
            st.info("🖥️ Desktop layout active")
    
    # Apply theme CSS
    theme_css = ui_system.get_theme_css(st.session_state.theme_mode, st.session_state.current_subject)
    st.markdown(theme_css, unsafe_allow_html=True)
    
    # Main dashboard
    st.markdown('<div class="main-dashboard">', unsafe_allow_html=True)
    
    # Dashboard header
    st.markdown("""
    <div class="dashboard-header">
        <h1>🌟 AI Study Mentor Dashboard</h1>
        <h3>Comprehensive Learning System for Nishan Upreti</h3>
        <p>🧠 Multi-Subject Learning • 💻 Programming • 🤝 Team Collaboration • 🎮 Gamification</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Feature grid layout
    st.markdown('<div class="feature-grid">', unsafe_allow_html=True)
    
    # Create all panels
    panels = [
        create_profile_panel(),
        create_study_mode_panel(),
        create_active_learning_panel(),
        create_coding_panel(),
        create_focus_panel(),
        create_team_panel(),
        create_ai_panel(),
        create_gamification_panel()
    ]
    
    # Display panels in responsive grid
    for panel in panels:
        st.markdown(panel, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)  # Close feature-grid
    
    # Theme toggle button
    st.markdown("""
    <button class="theme-toggle" onclick="toggleTheme()">
        🌓
    </button>
    
    <script>
    function toggleTheme() {
        // Theme toggle functionality would be implemented here
        console.log('Theme toggle clicked');
    }
    </script>
    """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)  # Close main-dashboard
    
    # Footer with system info
    st.markdown("""
    <div style="text-align: center; padding: 2rem; color: var(--text-secondary); border-top: 1px solid rgba(255,255,255,0.1); margin-top: 2rem;">
        <p>🌟 AI Study Mentor Dashboard • Adaptive UI System • Responsive Design</p>
        <p>Theme: {theme_mode} • Subject: {subject} • Last Updated: {timestamp}</p>
    </div>
    """.format(
        theme_mode=st.session_state.theme_mode.title(),
        subject=st.session_state.current_subject.title(),
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ), unsafe_allow_html=True)

if __name__ == "__main__":
    main()
