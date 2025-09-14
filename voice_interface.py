import speech_recognition as sr
import pyttsx3
import threading
import queue
import cv2
import numpy as np
from datetime import datetime
import json

class VoiceInterface:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = pyttsx3.init()
        self.setup_voice()
        
        self.listening = False
        self.voice_queue = queue.Queue()
        
    def setup_voice(self):
        """Configure TTS settings"""
        voices = self.tts_engine.getProperty('voices')
        self.tts_engine.setProperty('voice', voices[0].id)  # Female voice
        self.tts_engine.setProperty('rate', 150)
        self.tts_engine.setProperty('volume', 0.8)
    
    def listen_continuous(self):
        """Continuous voice listening in background"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        
        while self.listening:
            try:
                with self.microphone as source:
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
                
                text = self.recognizer.recognize_google(audio)
                self.voice_queue.put({
                    'text': text,
                    'timestamp': datetime.now(),
                    'confidence': 0.8  # Placeholder
                })
                
            except sr.WaitTimeoutError:
                pass
            except sr.UnknownValueError:
                pass
            except sr.RequestError as e:
                print(f"Voice recognition error: {e}")
    
    def start_listening(self):
        """Start voice recognition thread"""
        self.listening = True
        self.listen_thread = threading.Thread(target=self.listen_continuous)
        self.listen_thread.daemon = True
        self.listen_thread.start()
    
    def stop_listening(self):
        """Stop voice recognition"""
        self.listening = False
    
    def get_voice_input(self):
        """Get latest voice input"""
        try:
            return self.voice_queue.get_nowait()
        except queue.Empty:
            return None
    
    def speak(self, text, interrupt=False):
        """Text-to-speech output"""
        if interrupt:
            self.tts_engine.stop()
        
        def speak_async():
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        
        speak_thread = threading.Thread(target=speak_async)
        speak_thread.daemon = True
        speak_thread.start()
    
    def analyze_voice_emotion(self, audio_data):
        """Analyze emotional state from voice"""
        # Simplified emotion detection
        # In real implementation, use librosa for audio analysis
        
        emotions = {
            'stress': np.random.random(),
            'confidence': np.random.random(),
            'engagement': np.random.random(),
            'fatigue': np.random.random()
        }
        
        return emotions

class MultiModalProcessor:
    def __init__(self):
        self.supported_formats = {
            'image': ['.png', '.jpg', '.jpeg', '.bmp'],
            'video': ['.mp4', '.avi', '.mov'],
            'audio': ['.wav', '.mp3', '.m4a'],
            'document': ['.pdf', '.docx', '.txt']
        }
    
    def process_content(self, file_path, content_type=None):
        """Process different types of content"""
        if not content_type:
            content_type = self.detect_content_type(file_path)
        
        if content_type == 'image':
            return self.process_image(file_path)
        elif content_type == 'video':
            return self.process_video(file_path)
        elif content_type == 'audio':
            return self.process_audio(file_path)
        elif content_type == 'document':
            return self.process_document(file_path)
        
        return None
    
    def detect_content_type(self, file_path):
        """Auto-detect content type from file extension"""
        ext = file_path.lower().split('.')[-1]
        
        for content_type, extensions in self.supported_formats.items():
            if f'.{ext}' in extensions:
                return content_type
        
        return 'unknown'
    
    def process_image(self, image_path):
        """Extract text and analyze diagrams from images"""
        import pytesseract
        from PIL import Image
        
        image = Image.open(image_path)
        
        # OCR text extraction
        text = pytesseract.image_to_string(image)
        
        # Diagram analysis (simplified)
        img_array = np.array(image)
        has_diagrams = self.detect_diagrams(img_array)
        
        return {
            'text': text,
            'has_diagrams': has_diagrams,
            'image_analysis': 'Contains scientific diagrams' if has_diagrams else 'Text-based content'
        }
    
    def detect_diagrams(self, image_array):
        """Detect if image contains diagrams/charts"""
        # Simplified diagram detection using edge detection
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        # If many edges detected, likely contains diagrams
        edge_ratio = np.sum(edges > 0) / edges.size
        return edge_ratio > 0.1
    
    def process_video(self, video_path):
        """Extract frames and audio from educational videos"""
        cap = cv2.VideoCapture(video_path)
        
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = frame_count / fps
        
        # Extract key frames (every 30 seconds)
        key_frames = []
        for i in range(0, frame_count, int(fps * 30)):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                key_frames.append(frame)
        
        cap.release()
        
        return {
            'duration': duration,
            'key_frames': len(key_frames),
            'analysis': f'Video lecture of {duration:.1f} seconds with {len(key_frames)} key segments'
        }
    
    def process_audio(self, audio_path):
        """Extract speech from audio lectures"""
        # Placeholder for audio processing
        # In real implementation, use speech_recognition or whisper
        
        return {
            'transcript': 'Audio transcript would be extracted here',
            'duration': 120,  # Placeholder
            'speaker_count': 1,
            'analysis': 'Educational audio content detected'
        }
    
    def process_document(self, doc_path):
        """Process PDF and document files"""
        if doc_path.endswith('.pdf'):
            import PyPDF2
            
            with open(doc_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
            
            return {
                'text': text,
                'pages': len(reader.pages),
                'analysis': f'PDF document with {len(reader.pages)} pages'
            }
        
        return {'text': 'Document processing not implemented for this format'}

class ConversationMode:
    def __init__(self, voice_interface, ai_mentor):
        self.voice = voice_interface
        self.ai = ai_mentor
        self.conversation_active = False
        self.conversation_history = []
    
    def start_conversation(self):
        """Start voice-driven conversation mode"""
        self.conversation_active = True
        self.voice.start_listening()
        self.voice.speak("Hi Nishan! I'm ready to help you study. What would you like to learn today?")
        
        return self.conversation_loop()
    
    def conversation_loop(self):
        """Main conversation loop"""
        while self.conversation_active:
            voice_input = self.voice.get_voice_input()
            
            if voice_input:
                user_text = voice_input['text'].lower()
                
                # Handle conversation commands
                if 'stop' in user_text or 'quit' in user_text:
                    self.voice.speak("Goodbye! Great study session today!")
                    self.conversation_active = False
                    break
                
                elif 'quiz' in user_text:
                    self.handle_voice_quiz(user_text)
                
                elif 'explain' in user_text or 'what is' in user_text:
                    self.handle_voice_question(user_text)
                
                elif 'summary' in user_text:
                    self.handle_voice_summary(user_text)
                
                else:
                    # General question handling
                    response = self.ai.answer_question(user_text)
                    self.voice.speak(response)
                
                # Log conversation
                self.conversation_history.append({
                    'timestamp': datetime.now(),
                    'user': user_text,
                    'ai_response': response if 'response' in locals() else 'Command handled'
                })
    
    def handle_voice_quiz(self, user_input):
        """Handle quiz requests via voice"""
        # Extract topic from voice input
        topic = "physics"  # Simplified extraction
        
        quiz = self.ai.generate_adaptive_quiz(topic, "medium", 1)
        question = quiz['questions'][0]
        
        # Ask question via voice
        question_text = f"{question['question']}. Your options are: "
        for i, option in enumerate(question['options']):
            question_text += f"Option {chr(65+i)}: {option}. "
        
        self.voice.speak(question_text)
        
        # Wait for answer
        import time
        time.sleep(3)  # Give time to answer
        
        answer_input = self.voice.get_voice_input()
        if answer_input:
            # Process answer (simplified)
            self.voice.speak("Good answer! Let me explain the concept further.")
    
    def handle_voice_question(self, question):
        """Handle explanatory questions via voice"""
        answer = self.ai.answer_question(question)
        self.voice.speak(answer)
    
    def handle_voice_summary(self, request):
        """Handle summary requests via voice"""
        topic = "thermodynamics"  # Simplified topic extraction
        summary = self.ai.create_summary(topic, "bullets")
        self.voice.speak(f"Here's a summary of {topic}: {summary}")
    
    def stop_conversation(self):
        """Stop conversation mode"""
        self.conversation_active = False
        self.voice.stop_listening()
