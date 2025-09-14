import openai
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import PyPDF2
import cv2
import numpy as np
from datetime import datetime, timedelta
import json

class AIStudyMentor:
    def __init__(self, api_key=None):
        self.client = openai.OpenAI(api_key=api_key) if api_key else None
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.create_collection("study_notes")
        self.embeddings = OpenAIEmbeddings() if api_key else None
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        
        # Student profile
        self.student_profile = {
            'name': 'Nishan',
            'grade': 10,
            'weak_areas': [],
            'learning_style': 'visual',
            'performance_history': [],
            'spaced_repetition_schedule': {}
        }
        
    def ingest_content(self, content, content_type="text", metadata=None):
        """Ingest PDFs, notes, images into vector database"""
        if content_type == "pdf":
            text = self.extract_pdf_text(content)
        elif content_type == "image":
            text = self.extract_image_text(content)
        else:
            text = content
            
        chunks = self.text_splitter.split_text(text)
        
        for i, chunk in enumerate(chunks):
            self.collection.add(
                documents=[chunk],
                metadatas=[metadata or {}],
                ids=[f"{content_type}_{datetime.now().timestamp()}_{i}"]
            )
        
        return f"Ingested {len(chunks)} chunks from {content_type}"
    
    def extract_pdf_text(self, pdf_file):
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    
    def extract_image_text(self, image):
        import pytesseract
        return pytesseract.image_to_string(image)
    
    def answer_question(self, question, grade=None, subject=None):
        """Smart Q&A with RAG retrieval"""
        grade = grade or self.student_profile['grade']
        
        # Retrieve relevant context
        results = self.collection.query(
            query_texts=[question],
            n_results=3
        )
        
        context = "\n".join(results['documents'][0]) if results['documents'] else ""
        
        prompt = f"""
        You are Nishan's personal AI tutor for Grade {grade} {subject or 'Science'}.
        
        Context from notes: {context}
        
        Question: {question}
        
        Provide a step-by-step explanation suitable for Grade {grade}.
        First give a hint, then the full answer with examples.
        """
        
        if self.client:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        else:
            return f"Grade {grade} answer for: {question}\n[LLM integration needed for full response]"
    
    def generate_adaptive_quiz(self, topic, difficulty, num_questions=5):
        """Generate adaptive quizzes based on performance"""
        prompt = f"""
        Generate {num_questions} {difficulty} level questions on {topic} for Grade {self.student_profile['grade']}.
        
        Format as JSON:
        {{
            "questions": [
                {{
                    "question": "...",
                    "options": ["A", "B", "C", "D"],
                    "correct": 0,
                    "explanation": "...",
                    "concept": "..."
                }}
            ]
        }}
        """
        
        if self.client:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return json.loads(response.choices[0].message.content)
        else:
            return {
                "questions": [
                    {
                        "question": f"Sample {difficulty} question on {topic}",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct": 0,
                        "explanation": "Sample explanation",
                        "concept": topic
                    }
                ]
            }
    
    def create_summary(self, topic, format_type="bullets"):
        """Auto-summarization in different formats"""
        prompt = f"""
        Create a {format_type} summary of {topic} for Grade {self.student_profile['grade']}.
        
        Formats:
        - bullets: Key points as bullet points
        - mindmap: Hierarchical mind map structure
        - flashcards: Question-answer pairs
        - cheatsheet: Formulas and key concepts
        """
        
        if self.client:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        else:
            return f"{format_type.title()} summary for {topic}\n[Content would be generated here]"
    
    def generate_flashcards(self, topic):
        """Generate flashcards with spaced repetition"""
        cards = [
            {"front": f"What is {topic}?", "back": f"Definition of {topic}", "due": datetime.now()},
            {"front": f"Key formula for {topic}", "back": "Formula explanation", "due": datetime.now()}
        ]
        
        # Schedule spaced repetition
        for card in cards:
            card_id = f"{topic}_{len(self.student_profile['spaced_repetition_schedule'])}"
            self.student_profile['spaced_repetition_schedule'][card_id] = {
                'card': card,
                'interval': 1,
                'ease_factor': 2.5,
                'next_review': datetime.now() + timedelta(days=1)
            }
        
        return cards
    
    def analyze_performance(self, quiz_results):
        """Analyze performance and identify weak areas"""
        correct = sum(1 for r in quiz_results if r['correct'])
        total = len(quiz_results)
        score = (correct / total) * 100
        
        # Identify weak concepts
        weak_concepts = [r['concept'] for r in quiz_results if not r['correct']]
        
        # Update student profile
        self.student_profile['performance_history'].append({
            'date': datetime.now(),
            'score': score,
            'weak_concepts': weak_concepts
        })
        
        # Update weak areas
        for concept in weak_concepts:
            if concept not in self.student_profile['weak_areas']:
                self.student_profile['weak_areas'].append(concept)
        
        return {
            'score': score,
            'weak_areas': weak_concepts,
            'recommendations': self.get_learning_recommendations()
        }
    
    def get_learning_recommendations(self):
        """Personalized learning path recommendations"""
        weak_areas = self.student_profile['weak_areas']
        
        if not weak_areas:
            return ["Great job! Try advanced topics in your strong areas."]
        
        recommendations = []
        for area in weak_areas[:3]:  # Top 3 weak areas
            recommendations.append(f"Focus on {area} - practice 15 minutes daily")
            recommendations.append(f"Review {area} flashcards")
            
        return recommendations
    
    def detect_emotion_stress(self, facial_landmarks=None, voice_tone=None, typing_pattern=None):
        """Emotional intelligence and stress detection"""
        stress_indicators = []
        
        if facial_landmarks:
            # Simplified stress detection from facial features
            stress_indicators.append("facial_tension")
        
        if voice_tone and voice_tone.get('pitch_variance', 0) > 0.5:
            stress_indicators.append("voice_stress")
            
        if typing_pattern and typing_pattern.get('speed', 0) < 20:
            stress_indicators.append("slow_typing")
        
        stress_level = len(stress_indicators) / 3.0  # Normalize to 0-1
        
        suggestions = []
        if stress_level > 0.6:
            suggestions = [
                "Take a 5-minute break",
                "Try deep breathing exercises",
                "Switch to an easier topic"
            ]
        
        return {
            'stress_level': stress_level,
            'indicators': stress_indicators,
            'suggestions': suggestions
        }
    
    def generate_project(self, subject, difficulty="medium"):
        """Generate real-world projects and experiments"""
        projects = {
            "physics": {
                "easy": ["Build a simple pendulum", "Measure speed of sound"],
                "medium": ["Design a bridge model", "Solar panel efficiency test"],
                "hard": ["Build a Tesla coil", "Quantum mechanics simulation"]
            },
            "chemistry": {
                "easy": ["pH indicator from cabbage", "Crystal growing"],
                "medium": ["Electroplating experiment", "Reaction rate analysis"],
                "hard": ["Synthesis of aspirin", "Fuel cell construction"]
            }
        }
        
        return projects.get(subject.lower(), {}).get(difficulty, ["Custom project"])
    
    def get_gamification_status(self):
        """Points, badges, streaks system"""
        total_sessions = len(self.student_profile['performance_history'])
        avg_score = np.mean([p['score'] for p in self.student_profile['performance_history']]) if self.student_profile['performance_history'] else 0
        
        points = total_sessions * 10 + int(avg_score)
        
        badges = []
        if total_sessions >= 7:
            badges.append("Week Warrior")
        if avg_score >= 90:
            badges.append("Excellence Master")
        if len(self.student_profile['weak_areas']) == 0:
            badges.append("No Weak Spots")
        
        return {
            'points': points,
            'badges': badges,
            'streak': total_sessions,
            'level': min(points // 100, 10)
        }
