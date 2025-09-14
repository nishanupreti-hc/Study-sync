import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import json

class PomodoroService:
    def __init__(self):
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.session_history: Dict[str, list] = {}
    
    async def start_session(self, user_id: str, duration: int = 25, session_type: str = "work") -> Dict[str, Any]:
        """Start a new Pomodoro session"""
        session_id = f"{user_id}_{datetime.now().timestamp()}"
        
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "duration": duration,
            "session_type": session_type,  # work, short_break, long_break
            "start_time": datetime.now(),
            "end_time": datetime.now() + timedelta(minutes=duration),
            "status": "active",
            "focus_score": 0,
            "interruptions": 0,
            "camera_enabled": True
        }
        
        self.active_sessions[session_id] = session_data
        
        # Initialize session history if not exists
        if user_id not in self.session_history:
            self.session_history[user_id] = []
        
        return {
            "session_id": session_id,
            "duration": duration,
            "session_type": session_type,
            "start_time": session_data["start_time"].isoformat(),
            "end_time": session_data["end_time"].isoformat(),
            "camera_enabled": True
        }
    
    async def pause_session(self, session_id: str) -> Dict[str, Any]:
        """Pause an active session"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session = self.active_sessions[session_id]
        session["status"] = "paused"
        session["pause_time"] = datetime.now()
        
        return {"status": "paused", "session_id": session_id}
    
    async def resume_session(self, session_id: str) -> Dict[str, Any]:
        """Resume a paused session"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session = self.active_sessions[session_id]
        if session["status"] != "paused":
            return {"error": "Session is not paused"}
        
        # Adjust end time based on pause duration
        pause_duration = datetime.now() - session["pause_time"]
        session["end_time"] += pause_duration
        session["status"] = "active"
        
        return {"status": "resumed", "session_id": session_id}
    
    async def complete_session(self, session_id: str) -> Dict[str, Any]:
        """Complete a session"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session = self.active_sessions[session_id]
        session["status"] = "completed"
        session["actual_end_time"] = datetime.now()
        
        # Calculate final focus score
        session["final_focus_score"] = await self._calculate_focus_score(session)
        
        # Move to history
        user_id = session["user_id"]
        self.session_history[user_id].append(session)
        
        # Remove from active sessions
        del self.active_sessions[session_id]
        
        return {
            "status": "completed",
            "session_id": session_id,
            "focus_score": session["final_focus_score"],
            "duration_completed": (session["actual_end_time"] - session["start_time"]).total_seconds() / 60
        }
    
    async def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Get current session status"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session = self.active_sessions[session_id]
        current_time = datetime.now()
        
        if current_time >= session["end_time"] and session["status"] == "active":
            # Auto-complete session
            return await self.complete_session(session_id)
        
        time_remaining = (session["end_time"] - current_time).total_seconds()
        progress = ((session["duration"] * 60) - time_remaining) / (session["duration"] * 60) * 100
        
        return {
            "session_id": session_id,
            "status": session["status"],
            "time_remaining": max(0, time_remaining),
            "progress": min(100, max(0, progress)),
            "focus_score": session["focus_score"],
            "interruptions": session["interruptions"],
            "session_type": session["session_type"]
        }
    
    async def update_focus_data(self, session_id: str, focus_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update focus data from camera monitoring"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session = self.active_sessions[session_id]
        
        # Update focus metrics
        if "attention_score" in focus_data:
            session["focus_score"] = (session["focus_score"] + focus_data["attention_score"]) / 2
        
        if "interruption_detected" in focus_data and focus_data["interruption_detected"]:
            session["interruptions"] += 1
        
        return {"status": "updated", "current_focus_score": session["focus_score"]}
    
    async def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get user's Pomodoro statistics"""
        if user_id not in self.session_history:
            return {"total_sessions": 0, "total_time": 0, "average_focus": 0}
        
        sessions = self.session_history[user_id]
        completed_sessions = [s for s in sessions if s["status"] == "completed"]
        
        total_time = sum((s["actual_end_time"] - s["start_time"]).total_seconds() / 60 
                        for s in completed_sessions)
        
        average_focus = sum(s.get("final_focus_score", 0) for s in completed_sessions) / len(completed_sessions) if completed_sessions else 0
        
        # Calculate streak
        today = datetime.now().date()
        streak = 0
        for i in range(len(completed_sessions)):
            session_date = completed_sessions[-(i+1)]["start_time"].date()
            if session_date == today - timedelta(days=i):
                streak += 1
            else:
                break
        
        return {
            "total_sessions": len(completed_sessions),
            "total_time": round(total_time, 2),
            "average_focus": round(average_focus, 2),
            "current_streak": streak,
            "sessions_today": len([s for s in completed_sessions if s["start_time"].date() == today]),
            "best_focus_score": max((s.get("final_focus_score", 0) for s in completed_sessions), default=0)
        }
    
    async def _calculate_focus_score(self, session: Dict[str, Any]) -> float:
        """Calculate final focus score for a session"""
        base_score = session.get("focus_score", 50)
        
        # Penalty for interruptions
        interruption_penalty = session.get("interruptions", 0) * 5
        
        # Bonus for completing full session
        completion_bonus = 10 if session["status"] == "completed" else 0
        
        final_score = max(0, min(100, base_score - interruption_penalty + completion_bonus))
        return round(final_score, 2)
