import streamlit as st
import cv2
import time
import pandas as pd
from datetime import datetime
import numpy as np
from PIL import Image
import pytesseract
import speech_recognition as sr
import pyttsx3
import threading

class StudyMentor:
    def __init__(self):
        self.session_data = {
            'start_time': None,
            'focus_score': 0,
            'questions_answered': 0,
            'correct_answers': 0,
            'topics_covered': [],
            'weak_areas': []
        }
        
    def start_session(self, mode="Study"):
        self.session_data['start_time'] = datetime.now()
        st.session_state.session_active = True
        st.session_state.mode = mode
        
    def process_image_notes(self, image):
        text = pytesseract.image_to_string(image)
        return text
        
    def generate_quiz(self, topic, difficulty="medium"):
        questions = {
            "physics": {
                "easy": [
                    {"q": "What is the unit of force?", "options": ["Newton", "Joule", "Watt", "Pascal"], "answer": 0},
                    {"q": "Speed of light in vacuum?", "options": ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁷ m/s", "3×10⁹ m/s"], "answer": 0}
                ],
                "medium": [
                    {"q": "If F = ma, what happens to acceleration when mass doubles and force remains constant?", 
                     "options": ["Doubles", "Halves", "Remains same", "Becomes zero"], "answer": 1}
                ]
            },
            "chemistry": {
                "easy": [
                    {"q": "What is the chemical symbol for Gold?", "options": ["Go", "Gd", "Au", "Ag"], "answer": 2},
                    {"q": "How many electrons does Carbon have?", "options": ["4", "6", "8", "12"], "answer": 1}
                ]
            }
        }
        return questions.get(topic.lower(), {}).get(difficulty, [])
        
    def track_engagement(self):
        # Simplified engagement tracking
        if 'engagement_score' not in st.session_state:
            st.session_state.engagement_score = 100
        return st.session_state.engagement_score

def main():
    st.set_page_config(page_title="Nishan's AI Study Mentor", layout="wide")
    
    mentor = StudyMentor()
    
    # Sidebar
    st.sidebar.title("Study Dashboard")
    
    # Mode Selection
    mode = st.sidebar.selectbox("Select Mode", ["Study", "College", "Office", "Project"])
    
    # Session Timer
    if st.sidebar.button("Start Session"):
        mentor.start_session(mode)
        
    if 'session_active' in st.session_state and st.session_state.session_active:
        elapsed = (datetime.now() - mentor.session_data['start_time']).seconds
        st.sidebar.metric("Session Time", f"{elapsed//60}:{elapsed%60:02d}")
        st.sidebar.metric("Focus Score", f"{mentor.track_engagement()}%")
    
    # Main Interface
    st.title("🧠 Nishan's AI Study Mentor")
    
    tab1, tab2, tab3, tab4 = st.tabs(["Study", "Quiz", "Notes", "Analytics"])
    
    with tab1:
        st.header("Interactive Learning")
        
        subject = st.selectbox("Subject", ["Physics", "Chemistry"])
        grade = st.selectbox("Grade", list(range(1, 13)))
        
        question = st.text_area("Ask me anything about " + subject)
        
        if st.button("Get Answer"):
            if question:
                # Simplified answer generation
                st.write(f"**Answer for Grade {grade} {subject}:**")
                st.write("This is where the AI would provide a detailed explanation...")
                
        # File Upload
        uploaded_file = st.file_uploader("Upload Notes/PDFs", type=['pdf', 'png', 'jpg', 'jpeg'])
        if uploaded_file:
            if uploaded_file.type.startswith('image'):
                image = Image.open(uploaded_file)
                st.image(image, caption="Uploaded Notes")
                text = mentor.process_image_notes(image)
                st.text_area("Extracted Text", text, height=200)
    
    with tab2:
        st.header("Adaptive Quiz")
        
        quiz_subject = st.selectbox("Quiz Subject", ["Physics", "Chemistry"], key="quiz")
        difficulty = st.selectbox("Difficulty", ["easy", "medium", "hard"])
        
        if st.button("Generate Quiz"):
            questions = mentor.generate_quiz(quiz_subject, difficulty)
            
            if questions:
                for i, q in enumerate(questions):
                    st.write(f"**Q{i+1}: {q['q']}**")
                    answer = st.radio(f"Options for Q{i+1}", q['options'], key=f"q{i}")
                    
                if st.button("Submit Quiz"):
                    st.success("Quiz submitted! Results will be analyzed.")
    
    with tab3:
        st.header("Smart Notes & Summaries")
        
        topic_input = st.text_input("Enter topic to summarize")
        if st.button("Generate Summary"):
            st.write(f"**Summary for {topic_input}:**")
            st.write("• Key concept 1")
            st.write("• Key concept 2") 
            st.write("• Important formula")
            
        # Flashcards
        if st.button("Generate Flashcards"):
            st.write("**Flashcard 1:** What is Newton's First Law?")
            if st.button("Show Answer", key="flash1"):
                st.write("An object at rest stays at rest...")
    
    with tab4:
        st.header("Progress Analytics")
        
        # Mock data for demonstration
        dates = pd.date_range('2024-01-01', periods=30, freq='D')
        scores = np.random.randint(60, 100, 30)
        
        chart_data = pd.DataFrame({
            'Date': dates,
            'Score': scores
        })
        
        st.line_chart(chart_data.set_index('Date'))
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Study Hours", "45.5")
        with col2:
            st.metric("Average Score", "85%")
        with col3:
            st.metric("Streak Days", "12")

if __name__ == "__main__":
    main()
