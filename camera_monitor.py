import cv2
import mediapipe as mp
import numpy as np

class EngagementMonitor:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
    def calculate_engagement_score(self, landmarks):
        # Simple engagement calculation based on eye aspect ratio
        # Left eye landmarks
        left_eye = [landmarks[33], landmarks[7], landmarks[163], landmarks[144], landmarks[145], landmarks[153]]
        # Right eye landmarks  
        right_eye = [landmarks[362], landmarks[382], landmarks[381], landmarks[380], landmarks[374], landmarks[373]]
        
        # Calculate eye aspect ratios
        left_ear = self.eye_aspect_ratio(left_eye)
        right_ear = self.eye_aspect_ratio(right_eye)
        
        # Average EAR
        ear = (left_ear + right_ear) / 2.0
        
        # Simple engagement score (higher EAR = more alert)
        engagement_score = min(100, max(0, ear * 1000))
        return engagement_score
    
    def eye_aspect_ratio(self, eye_landmarks):
        # Calculate distances
        A = np.linalg.norm(np.array([eye_landmarks[1].x, eye_landmarks[1].y]) - 
                          np.array([eye_landmarks[5].x, eye_landmarks[5].y]))
        B = np.linalg.norm(np.array([eye_landmarks[2].x, eye_landmarks[2].y]) - 
                          np.array([eye_landmarks[4].x, eye_landmarks[4].y]))
        C = np.linalg.norm(np.array([eye_landmarks[0].x, eye_landmarks[0].y]) - 
                          np.array([eye_landmarks[3].x, eye_landmarks[3].y]))
        
        ear = (A + B) / (2.0 * C)
        return ear
    
    def monitor_session(self):
        cap = cv2.VideoCapture(0)
        engagement_scores = []
        
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                break
                
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(image_rgb)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    score = self.calculate_engagement_score(face_landmarks.landmark)
                    engagement_scores.append(score)
                    
                    # Display engagement score
                    cv2.putText(image, f'Engagement: {score:.1f}%', 
                              (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            cv2.imshow('Study Monitor', image)
            
            if cv2.waitKey(5) & 0xFF == 27:  # ESC key
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        return np.mean(engagement_scores) if engagement_scores else 0
