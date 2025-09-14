import cv2
import mediapipe as mp
import numpy as np
import asyncio
from typing import Dict, List, Optional, Tuple
import time
import json

class EnhancedPostureService:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_face = mp.solutions.face_detection
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.face_detection = self.mp_face.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.7
        )
        
        self.person_present = False
        self.last_detection_time = 0
        self.posture_history = []
        self.movement_threshold = 0.05
        self.absence_threshold = 3.0  # seconds
        
    def analyze_frame(self, frame) -> Dict:
        """Analyze frame for person detection and posture"""
        if frame is None:
            return self._get_empty_result()
            
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Face detection for person presence
        face_results = self.face_detection.process(rgb_frame)
        person_detected = face_results.detections is not None and len(face_results.detections) > 0
        
        # Pose detection
        pose_results = self.pose.process(rgb_frame)
        
        current_time = time.time()
        
        if person_detected and pose_results.pose_landmarks:
            self.person_present = True
            self.last_detection_time = current_time
            
            # Analyze posture
            posture_data = self._analyze_posture(pose_results.pose_landmarks, frame.shape)
            movement_data = self._analyze_movement(pose_results.pose_landmarks)
            
            return {
                'person_present': True,
                'posture': posture_data,
                'movement': movement_data,
                'confidence': 0.9,
                'timestamp': current_time
            }
        else:
            # Check if person has been absent too long
            if current_time - self.last_detection_time > self.absence_threshold:
                self.person_present = False
                
            return {
                'person_present': self.person_present,
                'posture': {'status': 'unknown', 'score': 0},
                'movement': {'status': 'unknown', 'level': 0},
                'confidence': 0.0,
                'timestamp': current_time
            }
    
    def _analyze_posture(self, landmarks, frame_shape) -> Dict:
        """Analyze posture from pose landmarks"""
        try:
            h, w = frame_shape[:2]
            
            # Key landmarks
            nose = landmarks.landmark[self.mp_pose.PoseLandmark.NOSE]
            left_shoulder = landmarks.landmark[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_ear = landmarks.landmark[self.mp_pose.PoseLandmark.LEFT_EAR]
            right_ear = landmarks.landmark[self.mp_pose.PoseLandmark.RIGHT_EAR]
            
            # Calculate shoulder alignment
            shoulder_slope = abs(left_shoulder.y - right_shoulder.y)
            shoulder_alignment = max(0, 100 - (shoulder_slope * 1000))
            
            # Calculate head position relative to shoulders
            avg_shoulder_x = (left_shoulder.x + right_shoulder.x) / 2
            avg_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
            
            head_forward = abs(nose.x - avg_shoulder_x) * 100
            head_tilt = abs(nose.y - avg_shoulder_y) * 100
            
            # Calculate overall posture score
            posture_score = max(0, min(100, 
                shoulder_alignment * 0.4 + 
                max(0, 100 - head_forward * 2) * 0.4 + 
                max(0, 100 - head_tilt * 2) * 0.2
            ))
            
            # Determine posture status
            if posture_score >= 80:
                status = "excellent"
            elif posture_score >= 65:
                status = "good"
            elif posture_score >= 50:
                status = "fair"
            else:
                status = "poor"
            
            return {
                'status': status,
                'score': round(posture_score, 1),
                'shoulder_alignment': round(shoulder_alignment, 1),
                'head_position': {
                    'forward': round(head_forward, 1),
                    'tilt': round(head_tilt, 1)
                },
                'alerts': self._generate_posture_alerts(posture_score, head_forward, shoulder_slope)
            }
            
        except Exception as e:
            return {'status': 'error', 'score': 0, 'error': str(e)}
    
    def _analyze_movement(self, landmarks) -> Dict:
        """Analyze movement patterns"""
        try:
            # Calculate movement based on key points
            key_points = [
                landmarks.landmark[self.mp_pose.PoseLandmark.NOSE],
                landmarks.landmark[self.mp_pose.PoseLandmark.LEFT_SHOULDER],
                landmarks.landmark[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            ]
            
            current_position = np.array([[p.x, p.y, p.z] for p in key_points])
            
            if len(self.posture_history) > 0:
                last_position = self.posture_history[-1]
                movement = np.mean(np.linalg.norm(current_position - last_position, axis=1))
                
                # Classify movement level
                if movement < 0.01:
                    level = "still"
                    score = 100
                elif movement < 0.03:
                    level = "minimal"
                    score = 85
                elif movement < 0.06:
                    level = "moderate"
                    score = 70
                else:
                    level = "high"
                    score = 40
                    
            else:
                movement = 0
                level = "still"
                score = 100
            
            # Store position history (keep last 10 frames)
            self.posture_history.append(current_position)
            if len(self.posture_history) > 10:
                self.posture_history.pop(0)
            
            return {
                'level': level,
                'score': score,
                'movement_value': round(movement * 100, 2),
                'stability': self._calculate_stability()
            }
            
        except Exception as e:
            return {'level': 'error', 'score': 0, 'error': str(e)}
    
    def _calculate_stability(self) -> float:
        """Calculate stability score based on movement history"""
        if len(self.posture_history) < 3:
            return 100.0
            
        movements = []
        for i in range(1, len(self.posture_history)):
            movement = np.mean(np.linalg.norm(
                self.posture_history[i] - self.posture_history[i-1], axis=1
            ))
            movements.append(movement)
        
        avg_movement = np.mean(movements)
        stability = max(0, 100 - (avg_movement * 1000))
        return round(stability, 1)
    
    def _generate_posture_alerts(self, score: float, head_forward: float, shoulder_slope: float) -> List[str]:
        """Generate posture improvement alerts"""
        alerts = []
        
        if score < 50:
            alerts.append("Poor posture detected - please adjust your position")
        elif score < 65:
            alerts.append("Posture needs improvement")
            
        if head_forward > 15:
            alerts.append("Head too far forward - move closer to screen")
            
        if shoulder_slope > 0.05:
            alerts.append("Shoulders uneven - straighten your posture")
            
        return alerts
    
    def _get_empty_result(self) -> Dict:
        """Return empty result when no frame available"""
        return {
            'person_present': False,
            'posture': {'status': 'no_data', 'score': 0},
            'movement': {'status': 'no_data', 'level': 0},
            'confidence': 0.0,
            'timestamp': time.time()
        }
    
    def should_pause_timer(self) -> bool:
        """Determine if timer should be paused due to absence"""
        return not self.person_present
    
    def should_resume_timer(self) -> bool:
        """Determine if timer should be resumed when person returns"""
        return self.person_present
    
    def cleanup(self):
        """Cleanup resources"""
        if hasattr(self, 'pose'):
            self.pose.close()
        if hasattr(self, 'face_detection'):
            self.face_detection.close()
