import streamlit as st
import cv2
import numpy as np
from datetime import datetime, timedelta
import threading
import time
import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Import our custom modules
from ai_backend import AIStudyMentor
from voice_interface import VoiceInterface, ConversationMode, MultiModalProcessor
from engagement_monitor import AdvancedEngagementMonitor

class CompleteStudyMentor:
    def __init__(self):
        # Initialize all components
        self.ai_mentor = AIStudyMentor()
        self.voice_interface = VoiceInterface()
        self.engagement_monitor = AdvancedEngagementMonitor()
        self.multimodal_processor = MultiModalProcessor()
        self.conversation_mode = ConversationMode(self.voice_interface, self.ai_mentor)
        
        # Session state
        self.session_active = False
        self.camera_active = False
        self.voice_active = False
        
        # Analytics
        self.session_analytics = {
            'start_time': None,
            'total_questions': 0,
            'correct_answers': 0,
            'topics_covered': [],
            'engagement_scores': [],
            'break_count': 0
        }

def initialize_session_state():
    """Initialize Streamlit session state variables"""
    if 'mentor' not in st.session_state:
        st.session_state.mentor = CompleteStudyMentor()
    if 'camera_thread' not in st.session_state:
        st.session_state.camera_thread = None
    if 'session_data' not in st.session_state:
        st.session_state.session_data = {}

def camera_monitoring_thread():
    """Background thread for camera monitoring"""
    cap = cv2.VideoCapture(0)
    mentor = st.session_state.mentor
    
    while st.session_state.get('camera_active', False):
        ret, frame = cap.read()
        if ret:
            # Analyze engagement
            engagement_data = mentor.engagement_monitor.analyze_frame(frame)
            
            # Store in session state for display
            st.session_state.current_frame = frame
            st.session_state.engagement_data = engagement_data
            
            # Check if break needed
            if mentor.engagement_monitor.should_suggest_break():
                st.session_state.break_suggestion = True
        
        time.sleep(0.1)  # 10 FPS
    
    cap.release()

def main():
    st.set_page_config(
        page_title="Nishan's Complete AI Study Mentor",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    initialize_session_state()
    mentor = st.session_state.mentor
    
    # Custom CSS for better UI
    st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .engagement-high { color: #28a745; }
    .engagement-medium { color: #ffc107; }
    .engagement-low { color: #dc3545; }
    </style>
    """, unsafe_allow_html=True)
    
    # Header
    st.markdown('<h1 class="main-header">🧠 Nishan\'s Complete AI Study Mentor</h1>', unsafe_allow_html=True)
    
    # Sidebar - Control Panel
    with st.sidebar:
        st.title("🎛️ Control Panel")
        
        # Mode Selection
        study_mode = st.selectbox(
            "Select Mode",
            ["Study", "College", "Office", "Project"],
            help="Choose your current activity mode"
        )
        
        # Session Controls
        st.subheader("Session Controls")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("▶️ Start Session"):
                mentor.session_active = True
                mentor.session_analytics['start_time'] = datetime.now()
                st.success("Session started!")
        
        with col2:
            if st.button("⏹️ End Session"):
                mentor.session_active = False
                st.info("Session ended!")
        
        # Camera Controls
        st.subheader("Camera Monitoring")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📹 Start Camera"):
                st.session_state.camera_active = True
                if st.session_state.camera_thread is None or not st.session_state.camera_thread.is_alive():
                    st.session_state.camera_thread = threading.Thread(target=camera_monitoring_thread)
                    st.session_state.camera_thread.daemon = True
                    st.session_state.camera_thread.start()
                st.success("Camera started!")
        
        with col2:
            if st.button("📹 Stop Camera"):
                st.session_state.camera_active = False
                st.info("Camera stopped!")
        
        # Voice Controls
        st.subheader("Voice Interface")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🎤 Start Voice"):
                mentor.voice_interface.start_listening()
                mentor.voice_active = True
                st.success("Voice activated!")
        
        with col2:
            if st.button("🔇 Stop Voice"):
                mentor.voice_interface.stop_listening()
                mentor.voice_active = False
                st.info("Voice deactivated!")
        
        # Conversation Mode
        if st.button("💬 Start Conversation"):
            mentor.conversation_mode.start_conversation()
        
        # Session Timer
        if mentor.session_active and mentor.session_analytics['start_time']:
            elapsed = datetime.now() - mentor.session_analytics['start_time']
            st.metric("Session Time", f"{elapsed.seconds//3600:02d}:{(elapsed.seconds//60)%60:02d}:{elapsed.seconds%60:02d}")
        
        # Live Engagement Score
        if 'engagement_data' in st.session_state:
            engagement_score = st.session_state.engagement_data['attention_score']
            
            if engagement_score >= 80:
                color_class = "engagement-high"
                emoji = "🟢"
            elif engagement_score >= 60:
                color_class = "engagement-medium"
                emoji = "🟡"
            else:
                color_class = "engagement-low"
                emoji = "🔴"
            
            st.markdown(f'<div class="metric-card"><h3>{emoji} Engagement: <span class="{color_class}">{engagement_score:.1f}%</span></h3></div>', unsafe_allow_html=True)
    
    # Main Content Area
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "📚 Study", "🧪 Quiz", "📝 Notes", "📊 Analytics", 
        "🎯 Monitoring", "🎮 Gamification"
    ])
    
    # Study Tab
    with tab1:
        st.header("Interactive Learning Assistant")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Subject and Grade Selection
            subject = st.selectbox("Subject", ["Physics", "Chemistry"])
            grade = st.selectbox("Grade", list(range(1, 13)))
            
            # Question Input
            question = st.text_area("Ask me anything about " + subject, height=100)
            
            col_a, col_b = st.columns(2)
            with col_a:
                if st.button("🤔 Get Hint First"):
                    if question:
                        hint = f"Hint: Think about the basic principles of {subject.lower()}..."
                        st.info(hint)
                        if mentor.voice_active:
                            mentor.voice_interface.speak(hint)
            
            with col_b:
                if st.button("💡 Get Full Answer"):
                    if question:
                        answer = mentor.ai_mentor.answer_question(question, grade, subject)
                        st.write("**Answer:**")
                        st.write(answer)
                        if mentor.voice_active:
                            mentor.voice_interface.speak(answer)
            
            # Multi-modal Content Upload
            st.subheader("📎 Upload Study Materials")
            
            uploaded_files = st.file_uploader(
                "Upload PDFs, Images, Videos, or Audio",
                type=['pdf', 'png', 'jpg', 'jpeg', 'mp4', 'avi', 'wav', 'mp3'],
                accept_multiple_files=True
            )
            
            if uploaded_files:
                for file in uploaded_files:
                    with st.expander(f"Processing: {file.name}"):
                        # Process different file types
                        processed_content = mentor.multimodal_processor.process_content(file.name)
                        st.json(processed_content)
                        
                        # Ingest into AI system
                        if hasattr(file, 'read'):
                            content = file.read()
                            result = mentor.ai_mentor.ingest_content(content, file.type, {'filename': file.name})
                            st.success(result)
        
        with col2:
            # Voice Input
            st.subheader("🎤 Voice Interaction")
            
            if mentor.voice_active:
                voice_input = mentor.voice_interface.get_voice_input()
                if voice_input:
                    st.write("**You said:** " + voice_input['text'])
                    
                    # Process voice question
                    answer = mentor.ai_mentor.answer_question(voice_input['text'], grade, subject)
                    st.write("**AI Response:**")
                    st.write(answer)
                    mentor.voice_interface.speak(answer)
            
            # Quick Actions
            st.subheader("⚡ Quick Actions")
            
            if st.button("📋 Generate Summary"):
                topic = st.text_input("Topic to summarize:")
                if topic:
                    summary = mentor.ai_mentor.create_summary(topic, "bullets")
                    st.write(summary)
            
            if st.button("🃏 Create Flashcards"):
                topic = st.text_input("Topic for flashcards:", key="flashcard_topic")
                if topic:
                    flashcards = mentor.ai_mentor.generate_flashcards(topic)
                    for i, card in enumerate(flashcards):
                        with st.expander(f"Flashcard {i+1}"):
                            st.write(f"**Q:** {card['front']}")
                            if st.button(f"Show Answer {i+1}"):
                                st.write(f"**A:** {card['back']}")
    
    # Quiz Tab
    with tab2:
        st.header("🧪 Adaptive Quiz System")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            quiz_subject = st.selectbox("Quiz Subject", ["Physics", "Chemistry"], key="quiz_subject")
            difficulty = st.selectbox("Difficulty Level", ["easy", "medium", "hard"])
            num_questions = st.slider("Number of Questions", 1, 10, 5)
            
            if st.button("🎯 Generate Adaptive Quiz"):
                quiz_data = mentor.ai_mentor.generate_adaptive_quiz(quiz_subject, difficulty, num_questions)
                
                st.session_state.current_quiz = quiz_data
                st.session_state.quiz_answers = {}
            
            # Display Quiz
            if 'current_quiz' in st.session_state:
                quiz = st.session_state.current_quiz
                
                for i, question in enumerate(quiz['questions']):
                    st.write(f"**Question {i+1}:** {question['question']}")
                    
                    answer = st.radio(
                        f"Select answer for Q{i+1}:",
                        question['options'],
                        key=f"quiz_q_{i}"
                    )
                    
                    st.session_state.quiz_answers[i] = {
                        'selected': question['options'].index(answer),
                        'correct': question['correct'],
                        'concept': question.get('concept', quiz_subject)
                    }
                
                if st.button("📊 Submit Quiz"):
                    # Analyze results
                    results = []
                    for i, answer_data in st.session_state.quiz_answers.items():
                        results.append({
                            'correct': answer_data['selected'] == answer_data['correct'],
                            'concept': answer_data['concept']
                        })
                    
                    performance = mentor.ai_mentor.analyze_performance(results)
                    
                    st.success(f"Quiz completed! Score: {performance['score']:.1f}%")
                    
                    if performance['weak_areas']:
                        st.warning("Weak areas identified: " + ", ".join(performance['weak_areas']))
                    
                    st.write("**Recommendations:**")
                    for rec in performance['recommendations']:
                        st.write(f"• {rec}")
        
        with col2:
            # Quiz Statistics
            st.subheader("📈 Quiz Performance")
            
            # Mock performance data
            performance_data = pd.DataFrame({
                'Date': pd.date_range('2024-01-01', periods=10, freq='D'),
                'Score': np.random.randint(60, 100, 10),
                'Subject': np.random.choice(['Physics', 'Chemistry'], 10)
            })
            
            fig = px.line(performance_data, x='Date', y='Score', color='Subject', title='Quiz Performance Trend')
            st.plotly_chart(fig, use_container_width=True)
    
    # Notes Tab
    with tab3:
        st.header("📝 Smart Notes & Summaries")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📄 Create Summaries")
            
            topic = st.text_input("Enter topic to summarize:")
            format_type = st.selectbox("Summary Format", ["bullets", "mindmap", "flashcards", "cheatsheet"])
            
            if st.button("✨ Generate Summary"):
                if topic:
                    summary = mentor.ai_mentor.create_summary(topic, format_type)
                    st.write(summary)
                    
                    if mentor.voice_active:
                        mentor.voice_interface.speak(f"Summary for {topic} created")
            
            st.subheader("🔍 Search Notes")
            search_query = st.text_input("Search in your notes:")
            
            if search_query:
                # Search in vector database
                results = mentor.ai_mentor.collection.query(
                    query_texts=[search_query],
                    n_results=5
                )
                
                if results['documents']:
                    st.write("**Search Results:**")
                    for doc in results['documents'][0]:
                        st.write(f"• {doc[:200]}...")
        
        with col2:
            st.subheader("🃏 Flashcard Manager")
            
            # Spaced Repetition Schedule
            if mentor.ai_mentor.student_profile['spaced_repetition_schedule']:
                st.write("**Due for Review:**")
                
                for card_id, card_data in mentor.ai_mentor.student_profile['spaced_repetition_schedule'].items():
                    if card_data['next_review'] <= datetime.now():
                        card = card_data['card']
                        
                        with st.expander(f"Review: {card['front'][:50]}..."):
                            st.write(f"**Question:** {card['front']}")
                            
                            if st.button(f"Show Answer", key=f"show_{card_id}"):
                                st.write(f"**Answer:** {card['back']}")
                                
                                difficulty = st.selectbox(
                                    "How difficult was this?",
                                    ["Easy", "Medium", "Hard"],
                                    key=f"diff_{card_id}"
                                )
                                
                                if st.button(f"Mark Reviewed", key=f"mark_{card_id}"):
                                    # Update spaced repetition schedule
                                    if difficulty == "Easy":
                                        card_data['interval'] *= 2
                                    elif difficulty == "Hard":
                                        card_data['interval'] = max(1, card_data['interval'] // 2)
                                    
                                    card_data['next_review'] = datetime.now() + timedelta(days=card_data['interval'])
                                    st.success("Card scheduled for next review!")
    
    # Analytics Tab
    with tab4:
        st.header("📊 Progress Analytics & Learning Path")
        
        col1, col2, col3 = st.columns(3)
        
        # Key Metrics
        with col1:
            st.metric("Total Study Hours", "45.5", "↗️ +2.3")
        with col2:
            st.metric("Average Score", "85%", "↗️ +5%")
        with col3:
            st.metric("Streak Days", "12", "↗️ +1")
        
        # Performance Charts
        col1, col2 = st.columns(2)
        
        with col1:
            # Study time chart
            study_data = pd.DataFrame({
                'Date': pd.date_range('2024-01-01', periods=30, freq='D'),
                'Hours': np.random.uniform(0.5, 4, 30),
                'Subject': np.random.choice(['Physics', 'Chemistry'], 30)
            })
            
            fig = px.bar(study_data, x='Date', y='Hours', color='Subject', title='Daily Study Hours')
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Engagement over time
            if 'engagement_data' in st.session_state:
                engagement_history = mentor.engagement_monitor.engagement_history
                
                if engagement_history:
                    df = pd.DataFrame([
                        {
                            'Time': d['timestamp'],
                            'Attention': d['attention_score'],
                            'Distractions': d['distraction_level']
                        }
                        for d in engagement_history[-50:]  # Last 50 data points
                    ])
                    
                    fig = px.line(df, x='Time', y=['Attention', 'Distractions'], title='Real-time Engagement')
                    st.plotly_chart(fig, use_container_width=True)
        
        # Learning Path Recommendations
        st.subheader("🎯 Personalized Learning Path")
        
        recommendations = mentor.ai_mentor.get_learning_recommendations()
        
        for i, rec in enumerate(recommendations):
            st.write(f"{i+1}. {rec}")
        
        # Weak Areas Analysis
        weak_areas = mentor.ai_mentor.student_profile['weak_areas']
        
        if weak_areas:
            st.subheader("⚠️ Areas Needing Attention")
            
            for area in weak_areas:
                with st.expander(f"Improve: {area}"):
                    st.write(f"• Practice problems on {area}")
                    st.write(f"• Review notes on {area}")
                    st.write(f"• Take focused quiz on {area}")
                    
                    if st.button(f"Generate {area} Practice", key=f"practice_{area}"):
                        quiz = mentor.ai_mentor.generate_adaptive_quiz(area, "easy", 3)
                        st.json(quiz)
    
    # Monitoring Tab
    with tab5:
        st.header("🎯 Live Engagement Monitoring")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Live Camera Feed
            if st.session_state.get('camera_active', False) and 'current_frame' in st.session_state:
                st.subheader("📹 Live Camera Feed")
                
                frame = st.session_state.current_frame
                st.image(frame, channels="BGR", width=600)
                
                # Engagement Analysis
                if 'engagement_data' in st.session_state:
                    data = st.session_state.engagement_data
                    
                    st.subheader("📊 Real-time Analysis")
                    
                    col_a, col_b, col_c = st.columns(3)
                    
                    with col_a:
                        st.metric("Attention Score", f"{data['attention_score']:.1f}%")
                    with col_b:
                        st.metric("Posture Score", f"{data['posture_score']['score']:.1f}%")
                    with col_c:
                        st.metric("Distractions", data['distraction_level'])
                    
                    # Detailed Analysis
                    with st.expander("Detailed Analysis"):
                        st.json(data)
            else:
                st.info("Start camera monitoring to see live feed and engagement analysis")
        
        with col2:
            # Engagement Summary
            st.subheader("📈 Engagement Summary")
            
            summary = mentor.engagement_monitor.get_engagement_summary(5)
            
            st.metric("5-min Average", f"{summary['average_attention']:.1f}%")
            st.metric("Total Distractions", summary['total_distractions'])
            
            if summary['recommendations']:
                st.subheader("💡 Recommendations")
                for rec in summary['recommendations']:
                    st.warning(rec)
            
            # Break Suggestion
            if st.session_state.get('break_suggestion', False):
                st.error("🚨 Break Recommended!")
                st.write("Your engagement has been low. Consider taking a 5-minute break.")
                
                if st.button("✅ Break Taken"):
                    st.session_state.break_suggestion = False
                    mentor.session_analytics['break_count'] += 1
                    st.success("Break logged! Welcome back!")
            
            # Motivational Messages
            st.subheader("💪 Motivation")
            
            gamification = mentor.ai_mentor.get_gamification_status()
            
            st.write(f"🏆 Level: {gamification['level']}")
            st.write(f"⭐ Points: {gamification['points']}")
            st.write(f"🔥 Streak: {gamification['streak']} days")
            
            if gamification['badges']:
                st.write("🏅 Badges:")
                for badge in gamification['badges']:
                    st.write(f"• {badge}")
    
    # Gamification Tab
    with tab6:
        st.header("🎮 Gamification & Achievements")
        
        gamification = mentor.ai_mentor.get_gamification_status()
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("🏆 Level", gamification['level'])
            st.progress(gamification['level'] / 10)
        
        with col2:
            st.metric("⭐ Total Points", gamification['points'])
        
        with col3:
            st.metric("🔥 Study Streak", f"{gamification['streak']} days")
        
        # Achievements
        st.subheader("🏅 Achievements")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("**Earned Badges:**")
            for badge in gamification['badges']:
                st.success(f"🏅 {badge}")
        
        with col2:
            st.write("**Available Challenges:**")
            challenges = [
                "Complete 5 quizzes in a day",
                "Study for 2 hours straight",
                "Perfect score on hard quiz",
                "Use voice mode for 30 minutes"
            ]
            
            for challenge in challenges:
                st.info(f"🎯 {challenge}")
        
        # Leaderboard (Mock)
        st.subheader("🏆 Leaderboard")
        
        leaderboard_data = pd.DataFrame({
            'Rank': [1, 2, 3, 4, 5],
            'Name': ['Nishan', 'Student A', 'Student B', 'Student C', 'Student D'],
            'Points': [gamification['points'], 850, 720, 680, 650],
            'Level': [gamification['level'], 8, 7, 6, 6]
        })
        
        st.dataframe(leaderboard_data, use_container_width=True)
        
        # Projects and Experiments
        st.subheader("🔬 Project Suggestions")
        
        project_subject = st.selectbox("Project Subject", ["Physics", "Chemistry"], key="project_subject")
        project_difficulty = st.selectbox("Project Difficulty", ["easy", "medium", "hard"])
        
        if st.button("🚀 Generate Project Ideas"):
            projects = mentor.ai_mentor.generate_project(project_subject, project_difficulty)
            
            st.write("**Suggested Projects:**")
            for project in projects:
                st.write(f"• {project}")

if __name__ == "__main__":
    main()
