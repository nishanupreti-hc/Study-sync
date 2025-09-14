import asyncio
import json
import cv2
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import mediapipe as mp
from dataclasses import dataclass
import logging

@dataclass
class FocusMetrics:
    attention_score: float
    posture_score: float
    eye_contact_score: float
    movement_score: float
    overall_score: float
    timestamp: datetime

@dataclass
class LessonProgress:
    lesson_id: str
    completed: bool
    score: float
    time_spent: int
    attempts: int
    last_accessed: datetime

class CameraMonitorService:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_pose = mp.solutions.pose
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5
        )
        
    async def analyze_frame(self, frame: np.ndarray) -> FocusMetrics:
        """Analyze a video frame for focus metrics"""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Face analysis
            face_results = self.face_mesh.process(rgb_frame)
            attention_score = self._calculate_attention_score(face_results, frame.shape)
            eye_contact_score = self._calculate_eye_contact_score(face_results)
            
            # Pose analysis
            pose_results = self.pose.process(rgb_frame)
            posture_score = self._calculate_posture_score(pose_results)
            movement_score = self._calculate_movement_score(pose_results)
            
            # Overall focus score
            overall_score = (
                attention_score * 0.3 +
                posture_score * 0.25 +
                eye_contact_score * 0.25 +
                movement_score * 0.2
            )
            
            return FocusMetrics(
                attention_score=attention_score,
                posture_score=posture_score,
                eye_contact_score=eye_contact_score,
                movement_score=movement_score,
                overall_score=overall_score,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logging.error(f"Error analyzing frame: {e}")
            return FocusMetrics(50, 50, 50, 50, 50, datetime.now())
    
    def _calculate_attention_score(self, face_results, frame_shape) -> float:
        """Calculate attention score based on face detection and orientation"""
        if not face_results.multi_face_landmarks:
            return 0.0
        
        # Face detected - base score
        score = 70.0
        
        # Check face orientation (looking at screen)
        landmarks = face_results.multi_face_landmarks[0]
        nose_tip = landmarks.landmark[1]
        
        # Center of frame
        center_x = 0.5
        center_y = 0.5
        
        # Distance from center (closer = more focused)
        distance = np.sqrt((nose_tip.x - center_x)**2 + (nose_tip.y - center_y)**2)
        orientation_score = max(0, 30 - distance * 100)
        
        return min(100, score + orientation_score)
    
    def _calculate_eye_contact_score(self, face_results) -> float:
        """Calculate eye contact score"""
        if not face_results.multi_face_landmarks:
            return 0.0
        
        # Simplified eye contact detection
        # In real implementation, would analyze eye landmarks
        return np.random.uniform(70, 95)  # Simulated for demo
    
    def _calculate_posture_score(self, pose_results) -> float:
        """Calculate posture score based on shoulder and spine alignment"""
        if not pose_results.pose_landmarks:
            return 50.0
        
        landmarks = pose_results.pose_landmarks.landmark
        
        # Get shoulder landmarks
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        
        # Calculate shoulder alignment
        shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
        alignment_score = max(0, 100 - shoulder_diff * 500)
        
        return min(100, alignment_score)
    
    def _calculate_movement_score(self, pose_results) -> float:
        """Calculate movement score (less movement = better focus)"""
        if not pose_results.pose_landmarks:
            return 50.0
        
        # Simplified movement detection
        # In real implementation, would track movement over time
        return np.random.uniform(75, 95)  # Simulated for demo

class W3SchoolsContentService:
    def __init__(self):
        self.courses = {
            'python': self._get_python_course(),
            'javascript': self._get_javascript_course(),
            'java': self._get_java_course(),
            'cpp': self._get_cpp_course(),
            'html-css': self._get_html_css_course(),
            'sql': self._get_sql_course()
        }
    
    def _get_python_course(self) -> Dict:
        return {
            'title': 'Python Programming',
            'description': 'Learn Python from basics to advanced',
            'lessons': [
                {
                    'id': 'py_intro',
                    'title': 'Python Introduction',
                    'content': 'Python is a popular programming language...',
                    'code_example': 'print("Hello, World!")',
                    'exercises': [
                        {
                            'question': 'Write a program to print your name',
                            'starter_code': '# Write your code here\n',
                            'solution': 'print("Your Name")'
                        }
                    ],
                    'quiz': {
                        'question': 'What is Python?',
                        'options': ['A snake', 'A programming language', 'A game', 'A book'],
                        'correct': 1
                    }
                }
            ]
        }
    
    def _get_javascript_course(self) -> Dict:
        return {
            'title': 'JavaScript Programming',
            'description': 'Master JavaScript for web development',
            'lessons': [
                {
                    'id': 'js_intro',
                    'title': 'JavaScript Introduction',
                    'content': 'JavaScript is the programming language of the Web...',
                    'code_example': 'console.log("Hello, World!");',
                    'exercises': [
                        {
                            'question': 'Create a variable and display it',
                            'starter_code': '// Write your code here\n',
                            'solution': 'let name = "John";\nconsole.log(name);'
                        }
                    ],
                    'quiz': {
                        'question': 'Which tag is used for JavaScript?',
                        'options': ['<js>', '<script>', '<javascript>', '<code>'],
                        'correct': 1
                    }
                }
            ]
        }
    
    def _get_java_course(self) -> Dict:
        return {
            'title': 'Java Programming',
            'description': 'Learn Java object-oriented programming',
            'lessons': []
        }
    
    def _get_cpp_course(self) -> Dict:
        return {
            'title': 'C++ Programming',
            'description': 'Master C++ for system programming',
            'lessons': []
        }
    
    def _get_html_css_course(self) -> Dict:
        return {
            'title': 'HTML & CSS',
            'description': 'Build beautiful web pages',
            'lessons': []
        }
    
    def _get_sql_course(self) -> Dict:
        return {
            'title': 'SQL Database',
            'description': 'Learn database management with SQL',
            'lessons': []
        }
    
    async def get_course_content(self, course_id: str) -> Dict:
        """Get complete course content"""
        return self.courses.get(course_id, {})
    
    async def get_lesson_content(self, course_id: str, lesson_id: str) -> Dict:
        """Get specific lesson content"""
        course = self.courses.get(course_id, {})
        lessons = course.get('lessons', [])
        
        for lesson in lessons:
            if lesson['id'] == lesson_id:
                return lesson
        
        return {}
    
    async def validate_code_solution(self, course_id: str, lesson_id: str, 
                                   exercise_id: str, user_code: str) -> Dict:
        """Validate user's code solution"""
        # Simplified validation - in real implementation would execute code safely
        lesson = await self.get_lesson_content(course_id, lesson_id)
        exercises = lesson.get('exercises', [])
        
        if exercise_id < len(exercises):
            exercise = exercises[exercise_id]
            expected = exercise.get('solution', '')
            
            # Simple string comparison (in real app, would use proper code execution)
            is_correct = user_code.strip().lower() == expected.strip().lower()
            
            return {
                'correct': is_correct,
                'feedback': 'Correct!' if is_correct else 'Try again!',
                'hint': 'Check your syntax' if not is_correct else None
            }
        
        return {'correct': False, 'feedback': 'Exercise not found'}

class PomodoroService:
    def __init__(self):
        self.active_sessions = {}
        self.session_history = []
    
    async def start_session(self, user_id: str, session_type: str = 'work', 
                          duration: int = 1500) -> Dict:
        """Start a new Pomodoro session"""
        session_id = f"{user_id}_{datetime.now().timestamp()}"
        
        session = {
            'id': session_id,
            'user_id': user_id,
            'type': session_type,
            'duration': duration,
            'start_time': datetime.now(),
            'end_time': datetime.now() + timedelta(seconds=duration),
            'focus_metrics': [],
            'status': 'active'
        }
        
        self.active_sessions[session_id] = session
        return session
    
    async def update_session_focus(self, session_id: str, 
                                 focus_metrics: FocusMetrics) -> Dict:
        """Update session with focus metrics"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            session['focus_metrics'].append(focus_metrics)
            
            # Calculate average focus for session
            if session['focus_metrics']:
                avg_focus = sum(m.overall_score for m in session['focus_metrics']) / len(session['focus_metrics'])
                session['average_focus'] = avg_focus
            
            return session
        
        return {}
    
    async def complete_session(self, session_id: str) -> Dict:
        """Complete a Pomodoro session"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            session['status'] = 'completed'
            session['actual_end_time'] = datetime.now()
            
            # Move to history
            self.session_history.append(session)
            del self.active_sessions[session_id]
            
            return session
        
        return {}
    
    async def get_session_stats(self, user_id: str) -> Dict:
        """Get user's session statistics"""
        user_sessions = [s for s in self.session_history if s['user_id'] == user_id]
        
        if not user_sessions:
            return {
                'total_sessions': 0,
                'total_time': 0,
                'average_focus': 0,
                'streak_days': 0
            }
        
        total_sessions = len(user_sessions)
        total_time = sum(s['duration'] for s in user_sessions) / 3600  # hours
        
        focus_scores = [s.get('average_focus', 0) for s in user_sessions if s.get('average_focus')]
        average_focus = sum(focus_scores) / len(focus_scores) if focus_scores else 0
        
        # Calculate streak (simplified)
        streak_days = self._calculate_streak(user_sessions)
        
        return {
            'total_sessions': total_sessions,
            'total_time': round(total_time, 1),
            'average_focus': round(average_focus, 1),
            'streak_days': streak_days
        }
    
    def _calculate_streak(self, sessions: List[Dict]) -> int:
        """Calculate consecutive days with sessions"""
        if not sessions:
            return 0
        
        # Group sessions by date
        dates = set()
        for session in sessions:
            date = session['start_time'].date()
            dates.add(date)
        
        # Count consecutive days from today
        today = datetime.now().date()
        streak = 0
        
        current_date = today
        while current_date in dates:
            streak += 1
            current_date -= timedelta(days=1)
        
        return streak

class EnhancedAIService:
    def __init__(self):
        self.camera_service = CameraMonitorService()
        self.content_service = W3SchoolsContentService()
        self.pomodoro_service = PomodoroService()
        self.user_progress = {}
    
    async def process_camera_frame(self, user_id: str, frame_data: bytes) -> Dict:
        """Process camera frame for focus analysis"""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Analyze frame
            metrics = await self.camera_service.analyze_frame(frame)
            
            # Update active Pomodoro session if exists
            active_sessions = [s for s in self.pomodoro_service.active_sessions.values() 
                             if s['user_id'] == user_id]
            
            if active_sessions:
                session_id = active_sessions[0]['id']
                await self.pomodoro_service.update_session_focus(session_id, metrics)
            
            return {
                'focus_score': round(metrics.overall_score, 1),
                'attention': 'High' if metrics.attention_score > 80 else 'Medium' if metrics.attention_score > 60 else 'Low',
                'posture': 'Good' if metrics.posture_score > 75 else 'Needs Adjustment',
                'timestamp': metrics.timestamp.isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error processing camera frame: {e}")
            return {
                'focus_score': 0,
                'attention': 'Unknown',
                'posture': 'Unknown',
                'error': str(e)
            }
    
    async def get_personalized_content(self, user_id: str, course_id: str) -> Dict:
        """Get personalized course content based on user progress"""
        course = await self.content_service.get_course_content(course_id)
        user_progress = self.user_progress.get(user_id, {})
        
        # Add progress information to lessons
        if 'lessons' in course:
            for lesson in course['lessons']:
                lesson_id = lesson['id']
                progress = user_progress.get(lesson_id, {})
                lesson['completed'] = progress.get('completed', False)
                lesson['score'] = progress.get('score', 0)
                lesson['attempts'] = progress.get('attempts', 0)
        
        return course
    
    async def update_lesson_progress(self, user_id: str, course_id: str, 
                                   lesson_id: str, completed: bool, 
                                   score: float = 0) -> Dict:
        """Update user's lesson progress"""
        if user_id not in self.user_progress:
            self.user_progress[user_id] = {}
        
        progress_key = f"{course_id}_{lesson_id}"
        
        if progress_key not in self.user_progress[user_id]:
            self.user_progress[user_id][progress_key] = {
                'completed': False,
                'score': 0,
                'attempts': 0,
                'time_spent': 0,
                'last_accessed': datetime.now()
            }
        
        progress = self.user_progress[user_id][progress_key]
        progress['completed'] = completed
        progress['score'] = max(progress['score'], score)
        progress['attempts'] += 1
        progress['last_accessed'] = datetime.now()
        
        return progress
    
    async def get_learning_analytics(self, user_id: str) -> Dict:
        """Get comprehensive learning analytics"""
        user_progress = self.user_progress.get(user_id, {})
        pomodoro_stats = await self.pomodoro_service.get_session_stats(user_id)
        
        # Calculate learning metrics
        total_lessons = len(user_progress)
        completed_lessons = sum(1 for p in user_progress.values() if p.get('completed', False))
        average_score = sum(p.get('score', 0) for p in user_progress.values()) / total_lessons if total_lessons > 0 else 0
        
        return {
            'learning_progress': {
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'completion_rate': round(completed_lessons / total_lessons * 100, 1) if total_lessons > 0 else 0,
                'average_score': round(average_score, 1)
            },
            'focus_analytics': pomodoro_stats,
            'recommendations': self._generate_recommendations(user_progress, pomodoro_stats)
        }
    
    def _generate_recommendations(self, progress: Dict, pomodoro_stats: Dict) -> List[str]:
        """Generate personalized learning recommendations"""
        recommendations = []
        
        # Focus-based recommendations
        avg_focus = pomodoro_stats.get('average_focus', 0)
        if avg_focus < 70:
            recommendations.append("Try shorter study sessions to improve focus")
            recommendations.append("Ensure good lighting and minimize distractions")
        
        # Progress-based recommendations
        completion_rate = len([p for p in progress.values() if p.get('completed', False)]) / len(progress) if progress else 0
        
        if completion_rate < 0.5:
            recommendations.append("Focus on completing current lessons before moving to new topics")
        
        if pomodoro_stats.get('streak_days', 0) < 3:
            recommendations.append("Try to study consistently every day to build a habit")
        
        return recommendations[:3]  # Return top 3 recommendations
