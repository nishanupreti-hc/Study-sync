import streamlit as st
import cv2
import mediapipe as mp
import numpy as np
import time
from datetime import datetime
import threading
import queue

class EngagementMonitor:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_pose = mp.solutions.pose
        self.face_detection = self.mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        
    def analyze_engagement(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Face detection
        face_results = self.face_detection.process(rgb_frame)
        face_detected = face_results.detections is not None
        
        # Pose detection
        pose_results = self.pose.process(rgb_frame)
        good_posture = self.check_posture(pose_results)
        
        engagement_score = 0
        if face_detected:
            engagement_score += 50
        if good_posture:
            engagement_score += 50
            
        return engagement_score, face_detected, good_posture
    
    def check_posture(self, pose_results):
        if not pose_results.pose_landmarks:
            return False
        
        # Simplified posture check
        landmarks = pose_results.pose_landmarks.landmark
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        
        # Check if shoulders are relatively level
        shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
        return shoulder_diff < 0.1

class VoiceAssistant:
    def __init__(self):
        self.tts_engine = None
        self.setup_tts()
        
    def setup_tts(self):
        try:
            import pyttsx3
            self.tts_engine = pyttsx3.init()
            self.tts_engine.setProperty('rate', 150)
        except:
            pass
    
    def speak(self, text):
        if self.tts_engine:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()

class StudySession:
    def __init__(self):
        self.start_time = None
        self.engagement_history = []
        self.break_suggestions = 0
        self.total_focus_time = 0
        
    def start(self):
        self.start_time = datetime.now()
        
    def log_engagement(self, score):
        self.engagement_history.append({
            'timestamp': datetime.now(),
            'score': score
        })
        
        # Suggest break if low engagement for 5 minutes
        recent_scores = [e['score'] for e in self.engagement_history[-10:]]
        if len(recent_scores) >= 5 and np.mean(recent_scores) < 30:
            self.break_suggestions += 1
            return True
        return False

def camera_feed():
    """Camera monitoring in separate thread"""
    if 'camera_active' not in st.session_state:
        st.session_state.camera_active = False
        
    if st.session_state.camera_active:
        cap = cv2.VideoCapture(0)
        monitor = EngagementMonitor()
        
        frame_placeholder = st.empty()
        metrics_placeholder = st.empty()
        
        while st.session_state.camera_active:
            ret, frame = cap.read()
            if ret:
                engagement_score, face_detected, good_posture = monitor.analyze_engagement(frame)
                
                # Display frame
                frame_placeholder.image(frame, channels="BGR", width=300)
                
                # Display metrics
                metrics_placeholder.metric("Engagement", f"{engagement_score}%")
                
                # Log to session
                if 'study_session' in st.session_state:
                    needs_break = st.session_state.study_session.log_engagement(engagement_score)
                    if needs_break:
                        st.warning("⚠️ Low engagement detected. Consider taking a break!")
                
            time.sleep(1)
        
        cap.release()

def main():
    st.set_page_config(page_title="Advanced Study Mentor", layout="wide")
    
    # Initialize session state
    if 'study_session' not in st.session_state:
        st.session_state.study_session = StudySession()
    if 'voice_assistant' not in st.session_state:
        st.session_state.voice_assistant = VoiceAssistant()
    
    st.title("🎯 Advanced AI Study Mentor")
    
    # Sidebar controls
    st.sidebar.title("Session Controls")
    
    # Camera toggle
    if st.sidebar.button("Start Camera Monitoring"):
        st.session_state.camera_active = True
        
    if st.sidebar.button("Stop Camera"):
        st.session_state.camera_active = False
    
    # Session timer
    if st.sidebar.button("Start Study Session"):
        st.session_state.study_session.start()
        st.session_state.session_started = True
    
    # Display session info
    if hasattr(st.session_state, 'session_started') and st.session_state.session_started:
        elapsed = (datetime.now() - st.session_state.study_session.start_time).seconds
        st.sidebar.metric("Session Time", f"{elapsed//60}:{elapsed%60:02d}")
        
        if st.session_state.study_session.engagement_history:
            avg_engagement = np.mean([e['score'] for e in st.session_state.study_session.engagement_history])
            st.sidebar.metric("Avg Engagement", f"{avg_engagement:.1f}%")
    
    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("Study Interface")
        
        # Voice input
        if st.button("🎤 Voice Question"):
            st.info("Voice recognition would be implemented here")
        
        # Text input
        question = st.text_area("Ask your question:")
        if st.button("Get Answer"):
            if question:
                answer = f"Detailed explanation for: {question}"
                st.write(answer)
                
                # Voice output
                if st.checkbox("Read answer aloud"):
                    st.session_state.voice_assistant.speak(answer)
        
        # Quiz section
        st.subheader("Quick Quiz")
        quiz_question = st.selectbox("Select topic", ["Newton's Laws", "Atomic Structure", "Thermodynamics"])
        
        if st.button("Generate Quiz"):
            st.write(f"**Question:** What is the main principle of {quiz_question}?")
            answer_options = ["Option A", "Option B", "Option C", "Option D"]
            selected = st.radio("Choose answer:", answer_options)
            
            if st.button("Submit Answer"):
                st.success("Answer recorded! Generating feedback...")
    
    with col2:
        st.header("Live Monitoring")
        
        # Camera feed
        if st.session_state.get('camera_active', False):
            camera_feed()
        else:
            st.info("Click 'Start Camera Monitoring' to begin engagement tracking")
        
        # Engagement chart
        if st.session_state.study_session.engagement_history:
            scores = [e['score'] for e in st.session_state.study_session.engagement_history[-20:]]
            st.line_chart(scores)
        
        # Motivational messages
        st.subheader("Motivation")
        motivational_messages = [
            "🌟 You're doing great!",
            "💪 Keep up the focus!",
            "🎯 Stay on target!",
            "🚀 Learning mode activated!"
        ]
        
        if st.button("Get Motivation"):
            message = np.random.choice(motivational_messages)
            st.success(message)
            st.session_state.voice_assistant.speak(message)

if __name__ == "__main__":
    main()
