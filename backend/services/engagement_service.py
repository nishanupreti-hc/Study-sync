import cv2
import numpy as np
from typing import Dict, Any
import mediapipe as mp

class EngagementService:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_pose = mp.solutions.pose
        self.face_detection = self.mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    
    def analyze_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze a single frame for engagement metrics"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Face detection for attention tracking
        face_results = self.face_detection.process(rgb_frame)
        face_detected = face_results.detections is not None
        
        # Pose detection for posture analysis
        pose_results = self.pose.process(rgb_frame)
        posture_score = self._calculate_posture_score(pose_results)
        
        # Calculate engagement score
        engagement_score = self._calculate_engagement(face_detected, posture_score)
        
        return {
            "face_detected": face_detected,
            "posture_score": posture_score,
            "engagement_score": engagement_score,
            "timestamp": cv2.getTickCount()
        }
    
    def _calculate_posture_score(self, pose_results) -> float:
        """Calculate posture score based on pose landmarks"""
        if not pose_results.pose_landmarks:
            return 0.5
        
        landmarks = pose_results.pose_landmarks.landmark
        
        # Get shoulder and nose positions
        left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
        nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
        
        # Calculate shoulder alignment (good posture = aligned shoulders)
        shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
        alignment_score = max(0, 1 - shoulder_diff * 10)
        
        # Calculate head position relative to shoulders
        shoulder_center_y = (left_shoulder.y + right_shoulder.y) / 2
        head_position_score = max(0, 1 - abs(nose.y - shoulder_center_y) * 5)
        
        return (alignment_score + head_position_score) / 2
    
    def _calculate_engagement(self, face_detected: bool, posture_score: float) -> float:
        """Calculate overall engagement score"""
        face_score = 1.0 if face_detected else 0.0
        return (face_score * 0.6 + posture_score * 0.4)
    
    def get_recommendations(self, engagement_score: float) -> Dict[str, str]:
        """Get recommendations based on engagement score"""
        if engagement_score < 0.3:
            return {
                "level": "low",
                "message": "Take a break! Consider stretching or walking around.",
                "action": "break_recommended"
            }
        elif engagement_score < 0.6:
            return {
                "level": "medium", 
                "message": "Adjust your posture and ensure good lighting.",
                "action": "posture_adjustment"
            }
        else:
            return {
                "level": "high",
                "message": "Great focus! Keep up the good work.",
                "action": "continue"
            }
