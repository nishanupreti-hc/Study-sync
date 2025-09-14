import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import threading
import queue
import asyncio

class TeamCollaborationSystem:
    def __init__(self):
        self.teams = {}
        self.team_sessions = {}
        self.team_projects = {}
        self.team_chat = TeamChatSystem()
        self.team_voice = TeamVoiceSystem()
        self.team_video = TeamVideoSystem()
        self.ai_team_assistant = AITeamAssistant()
        self.engagement_tracker = TeamEngagementTracker()
        
    def create_team(self, team_name, creator_id, max_members=6):
        team_id = str(uuid.uuid4())
        team = Team(team_id, team_name, creator_id, max_members)
        self.teams[team_id] = team
        return team
    
    def join_team(self, team_id, user_id, user_name):
        if team_id in self.teams:
            return self.teams[team_id].add_member(user_id, user_name)
        return False
    
    def start_team_session(self, team_id, session_type="study"):
        if team_id in self.teams:
            session = TeamSession(team_id, session_type)
            self.team_sessions[team_id] = session
            return session
        return None

class Team:
    def __init__(self, team_id, name, creator_id, max_members=6):
        self.id = team_id
        self.name = name
        self.creator_id = creator_id
        self.max_members = max_members
        self.members = {creator_id: {"role": "leader", "joined": datetime.now(), "active": True}}
        self.created_at = datetime.now()
        self.stats = {
            "total_study_time": 0,
            "projects_completed": 0,
            "challenges_won": 0,
            "team_level": 1,
            "team_xp": 0,
            "team_coins": 0
        }
        self.achievements = []
        self.active_projects = []
        
    def add_member(self, user_id, user_name):
        if len(self.members) < self.max_members and user_id not in self.members:
            self.members[user_id] = {
                "name": user_name,
                "role": "member",
                "joined": datetime.now(),
                "active": True,
                "contribution_score": 0
            }
            return True
        return False
    
    def remove_member(self, user_id):
        if user_id in self.members and user_id != self.creator_id:
            del self.members[user_id]
            return True
        return False
    
    def get_active_members(self):
        return [uid for uid, data in self.members.items() if data.get("active", False)]
    
    def add_team_xp(self, amount):
        self.stats["team_xp"] += amount
        if self.stats["team_xp"] >= self.get_xp_for_next_level():
            self.stats["team_level"] += 1
            self.stats["team_xp"] = 0
            self.stats["team_coins"] += 100 * self.stats["team_level"]
            return {"level_up": True, "new_level": self.stats["team_level"]}
        return {"xp_gained": amount}
    
    def get_xp_for_next_level(self):
        return self.stats["team_level"] * 200 + 100

class TeamSession:
    def __init__(self, team_id, session_type="study"):
        self.team_id = team_id
        self.session_type = session_type
        self.start_time = datetime.now()
        self.active_members = {}
        self.shared_screen = None
        self.collaborative_workspace = CollaborativeWorkspace()
        self.session_chat = []
        self.engagement_data = {}
        
    def add_member_to_session(self, user_id, user_name):
        self.active_members[user_id] = {
            "name": user_name,
            "joined_at": datetime.now(),
            "engagement_score": 100,
            "contributions": 0,
            "active": True
        }
    
    def update_member_engagement(self, user_id, engagement_score):
        if user_id in self.active_members:
            self.active_members[user_id]["engagement_score"] = engagement_score
            self.engagement_data[user_id] = {
                "timestamp": datetime.now(),
                "score": engagement_score
            }

class CollaborativeWorkspace:
    def __init__(self):
        self.shared_documents = {}
        self.shared_code = {}
        self.shared_whiteboard = WhiteboardSystem()
        self.real_time_sync = RealTimeSyncSystem()
        
    def create_shared_document(self, doc_type, content=""):
        doc_id = str(uuid.uuid4())
        self.shared_documents[doc_id] = {
            "type": doc_type,
            "content": content,
            "created_at": datetime.now(),
            "last_modified": datetime.now(),
            "collaborators": [],
            "version_history": []
        }
        return doc_id
    
    def update_shared_document(self, doc_id, new_content, user_id):
        if doc_id in self.shared_documents:
            doc = self.shared_documents[doc_id]
            # Save version history
            doc["version_history"].append({
                "content": doc["content"],
                "timestamp": doc["last_modified"],
                "user": user_id
            })
            # Update document
            doc["content"] = new_content
            doc["last_modified"] = datetime.now()
            if user_id not in doc["collaborators"]:
                doc["collaborators"].append(user_id)
            return True
        return False

class WhiteboardSystem:
    def __init__(self):
        self.canvas_data = {}
        self.drawing_history = []
        self.active_tools = {}
        
    def add_drawing_element(self, element_type, coordinates, user_id, properties=None):
        element = {
            "id": str(uuid.uuid4()),
            "type": element_type,
            "coordinates": coordinates,
            "user_id": user_id,
            "timestamp": datetime.now(),
            "properties": properties or {}
        }
        self.drawing_history.append(element)
        return element["id"]
    
    def get_canvas_state(self):
        return {
            "elements": self.drawing_history,
            "active_tools": self.active_tools
        }

class RealTimeSyncSystem:
    def __init__(self):
        self.sync_queue = queue.Queue()
        self.connected_clients = {}
        self.sync_thread = None
        
    def start_sync(self):
        self.sync_thread = threading.Thread(target=self._sync_loop)
        self.sync_thread.daemon = True
        self.sync_thread.start()
    
    def _sync_loop(self):
        while True:
            try:
                sync_data = self.sync_queue.get(timeout=1)
                self._broadcast_to_clients(sync_data)
            except queue.Empty:
                continue
    
    def _broadcast_to_clients(self, data):
        # Broadcast changes to all connected clients
        for client_id in self.connected_clients:
            # In real implementation, this would use WebSockets
            pass

class TeamChatSystem:
    def __init__(self):
        self.chat_rooms = {}
        self.message_history = {}
        
    def create_chat_room(self, team_id):
        self.chat_rooms[team_id] = {
            "messages": [],
            "active_users": set(),
            "created_at": datetime.now()
        }
        return team_id
    
    def send_message(self, team_id, user_id, user_name, message, message_type="text"):
        if team_id in self.chat_rooms:
            msg = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "user_name": user_name,
                "message": message,
                "type": message_type,
                "timestamp": datetime.now(),
                "reactions": {}
            }
            self.chat_rooms[team_id]["messages"].append(msg)
            return msg
        return None
    
    def add_reaction(self, team_id, message_id, user_id, reaction):
        if team_id in self.chat_rooms:
            for msg in self.chat_rooms[team_id]["messages"]:
                if msg["id"] == message_id:
                    if reaction not in msg["reactions"]:
                        msg["reactions"][reaction] = []
                    if user_id not in msg["reactions"][reaction]:
                        msg["reactions"][reaction].append(user_id)
                    return True
        return False

class TeamVoiceSystem:
    def __init__(self):
        self.voice_channels = {}
        self.active_calls = {}
        
    def create_voice_channel(self, team_id):
        self.voice_channels[team_id] = {
            "participants": {},
            "is_recording": False,
            "quality": "high",
            "created_at": datetime.now()
        }
        return team_id
    
    def join_voice_channel(self, team_id, user_id, user_name):
        if team_id in self.voice_channels:
            self.voice_channels[team_id]["participants"][user_id] = {
                "name": user_name,
                "joined_at": datetime.now(),
                "muted": False,
                "speaking": False
            }
            return True
        return False
    
    def toggle_mute(self, team_id, user_id):
        if team_id in self.voice_channels and user_id in self.voice_channels[team_id]["participants"]:
            participant = self.voice_channels[team_id]["participants"][user_id]
            participant["muted"] = not participant["muted"]
            return participant["muted"]
        return None

class TeamVideoSystem:
    def __init__(self):
        self.video_rooms = {}
        self.screen_sharing = {}
        
    def create_video_room(self, team_id, max_participants=6):
        self.video_rooms[team_id] = {
            "participants": {},
            "max_participants": max_participants,
            "screen_sharing_active": False,
            "recording": False,
            "created_at": datetime.now()
        }
        return team_id
    
    def join_video_room(self, team_id, user_id, user_name):
        if team_id in self.video_rooms:
            room = self.video_rooms[team_id]
            if len(room["participants"]) < room["max_participants"]:
                room["participants"][user_id] = {
                    "name": user_name,
                    "joined_at": datetime.now(),
                    "camera_on": True,
                    "screen_sharing": False
                }
                return True
        return False
    
    def start_screen_sharing(self, team_id, user_id):
        if team_id in self.video_rooms:
            # Stop any existing screen sharing
            for uid, participant in self.video_rooms[team_id]["participants"].items():
                participant["screen_sharing"] = False
            
            # Start screen sharing for this user
            if user_id in self.video_rooms[team_id]["participants"]:
                self.video_rooms[team_id]["participants"][user_id]["screen_sharing"] = True
                self.video_rooms[team_id]["screen_sharing_active"] = True
                return True
        return False

class AITeamAssistant:
    def __init__(self):
        self.team_recommendations = {}
        self.team_challenges = TeamChallengeEngine()
        self.team_analytics = TeamAnalytics()
        
    def analyze_team_performance(self, team_id, team_data):
        # Analyze team dynamics and performance
        analysis = {
            "team_cohesion": self.calculate_team_cohesion(team_data),
            "productivity_score": self.calculate_productivity(team_data),
            "engagement_levels": self.analyze_engagement(team_data),
            "skill_gaps": self.identify_skill_gaps(team_data),
            "recommended_activities": self.suggest_team_activities(team_data)
        }
        return analysis
    
    def calculate_team_cohesion(self, team_data):
        # Calculate how well team members work together
        active_members = len(team_data.get("active_members", []))
        collaboration_score = team_data.get("collaboration_events", 0)
        
        if active_members == 0:
            return 0
        
        cohesion_score = min(100, (collaboration_score / active_members) * 20)
        return cohesion_score
    
    def suggest_team_activities(self, team_data):
        suggestions = []
        
        # Based on team performance
        if team_data.get("productivity_score", 0) < 60:
            suggestions.append("Team coding challenge to boost collaboration")
            suggestions.append("Pair programming session")
        
        # Based on engagement
        avg_engagement = team_data.get("average_engagement", 0)
        if avg_engagement < 70:
            suggestions.append("Interactive quiz battle")
            suggestions.append("Virtual science experiment")
        
        # Based on skill gaps
        skill_gaps = team_data.get("skill_gaps", [])
        for gap in skill_gaps:
            suggestions.append(f"Team workshop on {gap}")
        
        return suggestions
    
    def create_team_challenge(self, team_id, challenge_type, difficulty="medium"):
        return self.team_challenges.generate_challenge(team_id, challenge_type, difficulty)

class TeamChallengeEngine:
    def __init__(self):
        self.active_challenges = {}
        self.challenge_templates = self.load_challenge_templates()
        
    def load_challenge_templates(self):
        return {
            "coding_relay": {
                "name": "Coding Relay Race",
                "description": "Team members take turns coding to solve a complex problem",
                "duration": 60,  # minutes
                "min_members": 2,
                "max_members": 6,
                "rewards": {"team_xp": 300, "team_coins": 150}
            },
            "quiz_battle": {
                "name": "Multi-Subject Quiz Battle",
                "description": "Team quiz covering multiple subjects",
                "duration": 30,
                "min_members": 2,
                "max_members": 8,
                "rewards": {"team_xp": 200, "team_coins": 100}
            },
            "project_sprint": {
                "name": "24-Hour Project Sprint",
                "description": "Build a complete project in 24 hours",
                "duration": 1440,  # 24 hours
                "min_members": 3,
                "max_members": 6,
                "rewards": {"team_xp": 1000, "team_coins": 500, "special_badge": "Sprint Masters"}
            },
            "debug_hunt": {
                "name": "Bug Hunt Challenge",
                "description": "Find and fix bugs in provided code",
                "duration": 45,
                "min_members": 2,
                "max_members": 4,
                "rewards": {"team_xp": 250, "team_coins": 125}
            }
        }
    
    def generate_challenge(self, team_id, challenge_type, difficulty="medium"):
        template = self.challenge_templates.get(challenge_type)
        if not template:
            return None
        
        challenge = {
            "id": str(uuid.uuid4()),
            "team_id": team_id,
            "type": challenge_type,
            "difficulty": difficulty,
            "name": template["name"],
            "description": template["description"],
            "duration": template["duration"],
            "rewards": template["rewards"],
            "start_time": None,
            "end_time": None,
            "status": "created",
            "participants": [],
            "progress": 0,
            "tasks": self.generate_challenge_tasks(challenge_type, difficulty)
        }
        
        self.active_challenges[challenge["id"]] = challenge
        return challenge
    
    def generate_challenge_tasks(self, challenge_type, difficulty):
        if challenge_type == "coding_relay":
            return [
                {"task": "Implement sorting algorithm", "assigned_to": None, "completed": False},
                {"task": "Add error handling", "assigned_to": None, "completed": False},
                {"task": "Write unit tests", "assigned_to": None, "completed": False},
                {"task": "Optimize performance", "assigned_to": None, "completed": False}
            ]
        elif challenge_type == "quiz_battle":
            return [
                {"task": "Physics questions (5)", "assigned_to": None, "completed": False},
                {"task": "Chemistry questions (5)", "assigned_to": None, "completed": False},
                {"task": "Math questions (5)", "assigned_to": None, "completed": False},
                {"task": "Programming questions (5)", "assigned_to": None, "completed": False}
            ]
        return []

class TeamEngagementTracker:
    def __init__(self):
        self.team_engagement_data = {}
        self.individual_contributions = {}
        
    def track_team_session(self, team_id, session_data):
        if team_id not in self.team_engagement_data:
            self.team_engagement_data[team_id] = []
        
        engagement_snapshot = {
            "timestamp": datetime.now(),
            "active_members": session_data.get("active_members", []),
            "average_engagement": self.calculate_average_engagement(session_data),
            "collaboration_events": session_data.get("collaboration_events", 0),
            "productivity_score": session_data.get("productivity_score", 0)
        }
        
        self.team_engagement_data[team_id].append(engagement_snapshot)
    
    def calculate_average_engagement(self, session_data):
        engagement_scores = session_data.get("member_engagement", {})
        if not engagement_scores:
            return 0
        
        return sum(engagement_scores.values()) / len(engagement_scores)
    
    def get_team_analytics(self, team_id, time_period_days=7):
        if team_id not in self.team_engagement_data:
            return {}
        
        cutoff_date = datetime.now() - timedelta(days=time_period_days)
        recent_data = [
            data for data in self.team_engagement_data[team_id]
            if data["timestamp"] > cutoff_date
        ]
        
        if not recent_data:
            return {}
        
        analytics = {
            "average_engagement": sum(d["average_engagement"] for d in recent_data) / len(recent_data),
            "total_sessions": len(recent_data),
            "most_active_periods": self.identify_active_periods(recent_data),
            "collaboration_trend": self.calculate_collaboration_trend(recent_data),
            "team_productivity": sum(d["productivity_score"] for d in recent_data) / len(recent_data)
        }
        
        return analytics
    
    def identify_active_periods(self, data):
        # Identify when the team is most active
        hour_activity = {}
        for session in data:
            hour = session["timestamp"].hour
            if hour not in hour_activity:
                hour_activity[hour] = 0
            hour_activity[hour] += session["average_engagement"]
        
        # Return top 3 most active hours
        sorted_hours = sorted(hour_activity.items(), key=lambda x: x[1], reverse=True)
        return sorted_hours[:3]
    
    def calculate_collaboration_trend(self, data):
        if len(data) < 2:
            return "insufficient_data"
        
        recent_collab = sum(d["collaboration_events"] for d in data[-3:]) / min(3, len(data))
        older_collab = sum(d["collaboration_events"] for d in data[:-3]) / max(1, len(data) - 3)
        
        if recent_collab > older_collab * 1.1:
            return "improving"
        elif recent_collab < older_collab * 0.9:
            return "declining"
        else:
            return "stable"

class TeamAnalytics:
    def __init__(self):
        self.analytics_data = {}
        
    def generate_team_dashboard_data(self, team_id, team_data):
        dashboard = {
            "team_overview": {
                "total_members": len(team_data.get("members", [])),
                "active_members": len(team_data.get("active_members", [])),
                "team_level": team_data.get("team_level", 1),
                "team_xp": team_data.get("team_xp", 0),
                "team_coins": team_data.get("team_coins", 0)
            },
            "performance_metrics": {
                "projects_completed": team_data.get("projects_completed", 0),
                "challenges_won": team_data.get("challenges_won", 0),
                "average_engagement": team_data.get("average_engagement", 0),
                "collaboration_score": team_data.get("collaboration_score", 0)
            },
            "member_contributions": self.calculate_member_contributions(team_data),
            "recent_activities": team_data.get("recent_activities", []),
            "upcoming_deadlines": team_data.get("upcoming_deadlines", []),
            "recommended_actions": team_data.get("ai_recommendations", [])
        }
        
        return dashboard
    
    def calculate_member_contributions(self, team_data):
        members = team_data.get("members", {})
        contributions = {}
        
        for member_id, member_data in members.items():
            contributions[member_id] = {
                "name": member_data.get("name", "Unknown"),
                "contribution_score": member_data.get("contribution_score", 0),
                "active_time": member_data.get("active_time", 0),
                "tasks_completed": member_data.get("tasks_completed", 0),
                "engagement_average": member_data.get("engagement_average", 0)
            }
        
        return contributions
