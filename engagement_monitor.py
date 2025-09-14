import cv2
import mediapipe as mp
import numpy as np
from datetime import datetime, timedelta
import threading
import time

class AdvancedEngagementMonitor:
    def __init__(self):
        # MediaPipe setup
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_pose = mp.solutions.pose
        self.mp_hands = mp.solutions.hands
        
        # Initialize models
        self.face_detection = self.mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
        self.face_mesh = self.mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.hands = self.mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        
        # Engagement tracking
        self.engagement_history = []
        self.distraction_count = 0
        self.last_face_time = datetime.now()
        self.posture_warnings = 0
        
        # Calibration data
        self.baseline_head_position = None
        self.calibration_frames = 0
        
    def analyze_frame(self, frame):
        """Comprehensive frame analysis for engagement"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Face detection and analysis
        face_results = self.face_detection.process(rgb_frame)
        face_mesh_results = self.face_mesh.process(rgb_frame)
        
        # Pose analysis
        pose_results = self.pose.process(rgb_frame)
        
        # Hand tracking
        hand_results = self.hands.process(rgb_frame)
        
        # Calculate engagement metrics
        engagement_data = {
            'timestamp': datetime.now(),
            'face_detected': face_results.detections is not None,
            'gaze_direction': self.analyze_gaze(face_mesh_results),
            'head_pose': self.analyze_head_pose(face_mesh_results),
            'posture_score': self.analyze_posture(pose_results),
            'hand_activity': self.analyze_hands(hand_results),
            'attention_score': 0,
            'distraction_level': 0
        }
        
        # Calculate overall engagement score
        engagement_data['attention_score'] = self.calculate_attention_score(engagement_data)
        engagement_data['distraction_level'] = self.detect_distractions(engagement_data)
        
        # Update tracking history
        self.engagement_history.append(engagement_data)
        
        # Keep only last 100 frames
        if len(self.engagement_history) > 100:
            self.engagement_history.pop(0)
        
        return engagement_data
    
    def analyze_gaze(self, face_mesh_results):
        """Analyze gaze direction using facial landmarks"""
        if not face_mesh_results.multi_face_landmarks:
            return {'looking_at_screen': False, 'gaze_angle': 0}
        
        landmarks = face_mesh_results.multi_face_landmarks[0]
        
        # Get eye landmarks (simplified)
        left_eye = landmarks.landmark[33]  # Left eye corner
        right_eye = landmarks.landmark[263]  # Right eye corner
        nose_tip = landmarks.landmark[1]  # Nose tip
        
        # Calculate gaze direction (simplified)
        eye_center_x = (left_eye.x + right_eye.x) / 2
        gaze_offset = abs(eye_center_x - nose_tip.x)
        
        looking_at_screen = gaze_offset < 0.05  # Threshold for looking straight
        gaze_angle = gaze_offset * 180  # Convert to degrees
        
        return {
            'looking_at_screen': looking_at_screen,
            'gaze_angle': gaze_angle,
            'eye_openness': self.calculate_eye_openness(landmarks)
        }
    
    def calculate_eye_openness(self, landmarks):
        """Calculate eye aspect ratio to detect drowsiness"""
        # Left eye landmarks
        left_eye_top = landmarks.landmark[159]
        left_eye_bottom = landmarks.landmark[145]
        left_eye_left = landmarks.landmark[33]
        left_eye_right = landmarks.landmark[133]
        
        # Calculate eye aspect ratio
        vertical_dist = abs(left_eye_top.y - left_eye_bottom.y)
        horizontal_dist = abs(left_eye_left.x - left_eye_right.x)
        
        ear = vertical_dist / horizontal_dist if horizontal_dist > 0 else 0
        
        return ear
    
    def analyze_head_pose(self, face_mesh_results):
        """Analyze head position and orientation"""
        if not face_mesh_results.multi_face_landmarks:
            return {'pitch': 0, 'yaw': 0, 'roll': 0, 'position_stable': False}
        
        landmarks = face_mesh_results.multi_face_landmarks[0]
        
        # Key points for head pose estimation
        nose_tip = landmarks.landmark[1]
        chin = landmarks.landmark[18]
        left_eye = landmarks.landmark[33]
        right_eye = landmarks.landmark[263]
        
        # Calculate head orientation (simplified)
        pitch = (nose_tip.y - chin.y) * 180  # Up/down tilt
        yaw = (left_eye.x - right_eye.x) * 180  # Left/right turn
        roll = np.arctan2(right_eye.y - left_eye.y, right_eye.x - left_eye.x) * 180 / np.pi
        
        # Check position stability
        if self.baseline_head_position is None and self.calibration_frames < 30:
            self.baseline_head_position = (nose_tip.x, nose_tip.y)
            self.calibration_frames += 1
        
        position_stable = True
        if self.baseline_head_position:
            distance = np.sqrt((nose_tip.x - self.baseline_head_position[0])**2 + 
                             (nose_tip.y - self.baseline_head_position[1])**2)
            position_stable = distance < 0.1  # Threshold for stability
        
        return {
            'pitch': pitch,
            'yaw': yaw,
            'roll': roll,
            'position_stable': position_stable
        }
    
    def analyze_posture(self, pose_results):
        """Analyze body posture for study ergonomics"""
        if not pose_results.pose_landmarks:
            return {'score': 0, 'warnings': []}
        
        landmarks = pose_results.pose_landmarks.landmark
        
        # Key posture points
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        left_ear = landmarks[7]
        right_ear = landmarks[8]
        
        warnings = []
        score = 100
        
        # Check shoulder alignment
        shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
        if shoulder_diff > 0.1:
            warnings.append("Uneven shoulders - adjust posture")
            score -= 20
        
        # Check head forward position
        ear_shoulder_diff = abs((left_ear.y + right_ear.y)/2 - (left_shoulder.y + right_shoulder.y)/2)
        if ear_shoulder_diff > 0.15:
            warnings.append("Head too far forward - sit up straight")
            score -= 30
        
        # Check if leaning too much
        body_tilt = abs(left_shoulder.x - right_shoulder.x)
        if body_tilt > 0.2:
            warnings.append("Leaning too much to one side")
            score -= 25
        
        return {
            'score': max(0, score),
            'warnings': warnings,
            'shoulder_alignment': shoulder_diff,
            'head_position': ear_shoulder_diff
        }
    
    def analyze_hands(self, hand_results):
        """Analyze hand activity and gestures"""
        if not hand_results.multi_hand_landmarks:
            return {'hands_visible': False, 'activity_level': 0, 'gestures': []}
        
        hands_count = len(hand_results.multi_hand_landmarks)
        
        # Calculate hand movement (simplified)
        activity_level = min(hands_count * 50, 100)  # More hands = more activity
        
        gestures = []
        for hand_landmarks in hand_results.multi_hand_landmarks:
            # Detect basic gestures (simplified)
            thumb_tip = hand_landmarks.landmark[4]
            index_tip = hand_landmarks.landmark[8]
            
            # Check if pointing (index finger extended)
            if index_tip.y < thumb_tip.y:
                gestures.append("pointing")
        
        return {
            'hands_visible': hands_count > 0,
            'hands_count': hands_count,
            'activity_level': activity_level,
            'gestures': gestures
        }
    
    def calculate_attention_score(self, engagement_data):
        """Calculate overall attention score from all metrics"""
        score = 0
        
        # Face detection (30 points)
        if engagement_data['face_detected']:
            score += 30
        
        # Gaze direction (25 points)
        if engagement_data['gaze_direction']['looking_at_screen']:
            score += 25
        
        # Eye openness (20 points) - detect drowsiness
        eye_openness = engagement_data['gaze_direction'].get('eye_openness', 0.3)
        if eye_openness > 0.2:  # Eyes sufficiently open
            score += 20
        
        # Posture (15 points)
        posture_score = engagement_data['posture_score']['score']
        score += (posture_score / 100) * 15
        
        # Head stability (10 points)
        if engagement_data['head_pose']['position_stable']:
            score += 10
        
        return min(100, score)
    
    def detect_distractions(self, engagement_data):
        """Detect various types of distractions"""
        distractions = []
        
        # No face detected
        if not engagement_data['face_detected']:
            distractions.append("person_absent")
            self.distraction_count += 1
        else:
            self.last_face_time = datetime.now()
        
        # Looking away from screen
        if not engagement_data['gaze_direction']['looking_at_screen']:
            distractions.append("looking_away")
        
        # Poor posture
        if engagement_data['posture_score']['score'] < 50:
            distractions.append("poor_posture")
        
        # Drowsiness detection
        eye_openness = engagement_data['gaze_direction'].get('eye_openness', 0.3)
        if eye_openness < 0.15:
            distractions.append("drowsiness")
        
        # Head movement (fidgeting)
        if not engagement_data['head_pose']['position_stable']:
            distractions.append("fidgeting")
        
        return len(distractions)
    
    def get_engagement_summary(self, minutes=5):
        """Get engagement summary for last N minutes"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        recent_data = [d for d in self.engagement_history if d['timestamp'] > cutoff_time]
        
        if not recent_data:
            return {'average_attention': 0, 'total_distractions': 0, 'recommendations': []}
        
        avg_attention = np.mean([d['attention_score'] for d in recent_data])
        total_distractions = sum([d['distraction_level'] for d in recent_data])
        
        # Generate recommendations
        recommendations = []
        if avg_attention < 60:
            recommendations.append("Take a short break to refocus")
        if total_distractions > 10:
            recommendations.append("Minimize distractions in your environment")
        
        # Check for specific issues
        posture_issues = sum(1 for d in recent_data if d['posture_score']['score'] < 70)
        if posture_issues > len(recent_data) * 0.5:
            recommendations.append("Adjust your sitting posture")
        
        gaze_issues = sum(1 for d in recent_data if not d['gaze_direction']['looking_at_screen'])
        if gaze_issues > len(recent_data) * 0.3:
            recommendations.append("Focus your attention on the study material")
        
        return {
            'average_attention': avg_attention,
            'total_distractions': total_distractions,
            'recommendations': recommendations,
            'data_points': len(recent_data)
        }
    
    def should_suggest_break(self):
        """Determine if a break should be suggested"""
        if len(self.engagement_history) < 10:
            return False
        
        # Check last 10 measurements
        recent_scores = [d['attention_score'] for d in self.engagement_history[-10:]]
        avg_recent = np.mean(recent_scores)
        
        # Suggest break if attention consistently low
        if avg_recent < 40:
            return True
        
        # Check for drowsiness
        recent_drowsiness = sum(1 for d in self.engagement_history[-10:] 
                              if d['gaze_direction'].get('eye_openness', 0.3) < 0.15)
        if recent_drowsiness > 5:
            return True
        
        return False
