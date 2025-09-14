import time
from datetime import datetime, timedelta
import threading
import json
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class SessionConfig:
    mode: str
    duration: int  # minutes
    break_duration: int  # minutes
    focus_threshold: float
    notification_style: str

class AdvancedSessionManager:
    def __init__(self):
        self.current_session = None
        self.session_history = []
        self.mode_configs = self.setup_mode_configs()
        self.timer_thread = None
        self.is_running = False
        self.callbacks = {}
        
    def setup_mode_configs(self):
        """Configure different study modes"""
        return {
            'Study': SessionConfig('Study', 25, 5, 0.7, 'gentle'),
            'College': SessionConfig('College', 45, 10, 0.6, 'academic'),
            'Office': SessionConfig('Office', 50, 10, 0.8, 'professional'),
            'Project': SessionConfig('Project', 90, 15, 0.75, 'creative')
        }
    
    def start_session(self, mode='Study', custom_duration=None):
        """Start a new study session"""
        config = self.mode_configs[mode]
        if custom_duration:
            config.duration = custom_duration
            
        self.current_session = StudySession(mode, config)
        self.is_running = True
        
        # Start timer thread
        self.timer_thread = threading.Thread(target=self._session_timer)
        self.timer_thread.daemon = True
        self.timer_thread.start()
        
        return self.current_session
    
    def _session_timer(self):
        """Background timer for session management"""
        while self.is_running and self.current_session:
            time.sleep(1)
            self.current_session.update_timer()
            
            # Check for break suggestions
            if self.current_session.should_suggest_break():
                self._trigger_callback('break_suggestion', self.current_session.get_break_data())
            
            # Check for session completion
            if self.current_session.is_completed():
                self._trigger_callback('session_complete', self.current_session.get_summary())
                self.end_session()
    
    def end_session(self):
        """End current session"""
        if self.current_session:
            self.current_session.end_session()
            self.session_history.append(self.current_session)
            self.current_session = None
        
        self.is_running = False
    
    def register_callback(self, event, callback):
        """Register callbacks for session events"""
        if event not in self.callbacks:
            self.callbacks[event] = []
        self.callbacks[event].append(callback)
    
    def _trigger_callback(self, event, data):
        """Trigger registered callbacks"""
        if event in self.callbacks:
            for callback in self.callbacks[event]:
                callback(data)

class StudySession:
    def __init__(self, mode, config):
        self.mode = mode
        self.config = config
        self.start_time = datetime.now()
        self.elapsed_time = 0
        self.engagement_scores = []
        self.break_count = 0
        self.activities = []
        self.focus_periods = []
        self.current_focus_start = None
        
    def update_timer(self):
        """Update session timer"""
        self.elapsed_time = (datetime.now() - self.start_time).total_seconds()
    
    def log_engagement(self, score):
        """Log engagement score"""
        self.engagement_scores.append({
            'timestamp': datetime.now(),
            'score': score
        })
        
        # Track focus periods
        if score >= self.config.focus_threshold:
            if self.current_focus_start is None:
                self.current_focus_start = datetime.now()
        else:
            if self.current_focus_start:
                focus_duration = (datetime.now() - self.current_focus_start).total_seconds()
                self.focus_periods.append(focus_duration)
                self.current_focus_start = None
    
    def should_suggest_break(self):
        """Determine if break should be suggested"""
        if len(self.engagement_scores) < 10:
            return False
        
        recent_scores = [s['score'] for s in self.engagement_scores[-10:]]
        avg_recent = np.mean(recent_scores)
        
        # Suggest break if engagement consistently low
        return avg_recent < self.config.focus_threshold * 0.8
    
    def take_break(self, duration_minutes=None):
        """Record a break"""
        duration = duration_minutes or self.config.break_duration
        self.break_count += 1
        
        break_data = {
            'start_time': datetime.now(),
            'duration': duration,
            'type': 'manual' if duration_minutes else 'scheduled'
        }
        
        self.activities.append(break_data)
        return break_data
    
    def is_completed(self):
        """Check if session is completed"""
        return self.elapsed_time >= (self.config.duration * 60)
    
    def get_summary(self):
        """Get session summary"""
        total_focus_time = sum(self.focus_periods)
        avg_engagement = np.mean([s['score'] for s in self.engagement_scores]) if self.engagement_scores else 0
        
        return {
            'mode': self.mode,
            'duration': self.elapsed_time / 60,  # Convert to minutes
            'total_focus_time': total_focus_time / 60,
            'focus_percentage': (total_focus_time / self.elapsed_time) * 100 if self.elapsed_time > 0 else 0,
            'average_engagement': avg_engagement,
            'break_count': self.break_count,
            'activities_count': len(self.activities)
        }

class ModeSpecificGuidance:
    def __init__(self):
        self.guidance_rules = self.setup_guidance_rules()
    
    def setup_guidance_rules(self):
        """Setup mode-specific guidance rules"""
        return {
            'Study': {
                'notifications': {
                    'style': 'encouraging',
                    'frequency': 'moderate',
                    'tone': 'supportive'
                },
                'break_activities': [
                    'Stretch for 2 minutes',
                    'Drink water',
                    'Look away from screen',
                    'Take deep breaths'
                ],
                'focus_tips': [
                    'Remove distractions from your study area',
                    'Use active recall techniques',
                    'Take notes by hand when possible'
                ]
            },
            'College': {
                'notifications': {
                    'style': 'academic',
                    'frequency': 'regular',
                    'tone': 'informative'
                },
                'break_activities': [
                    'Review previous concepts',
                    'Organize notes',
                    'Plan next study session',
                    'Quick mental exercises'
                ],
                'focus_tips': [
                    'Connect new concepts to existing knowledge',
                    'Use spaced repetition for memorization',
                    'Form study groups for discussion'
                ]
            },
            'Office': {
                'notifications': {
                    'style': 'professional',
                    'frequency': 'minimal',
                    'tone': 'efficient'
                },
                'break_activities': [
                    'Stand and walk around',
                    'Check calendar and priorities',
                    'Organize workspace',
                    'Brief meditation'
                ],
                'focus_tips': [
                    'Use time-blocking for tasks',
                    'Minimize context switching',
                    'Set clear objectives for each session'
                ]
            },
            'Project': {
                'notifications': {
                    'style': 'creative',
                    'frequency': 'adaptive',
                    'tone': 'inspiring'
                },
                'break_activities': [
                    'Brainstorm new ideas',
                    'Sketch concepts',
                    'Research inspiration',
                    'Change environment'
                ],
                'focus_tips': [
                    'Allow for creative exploration',
                    'Document ideas as they come',
                    'Use mind mapping techniques'
                ]
            }
        }
    
    def get_guidance_for_mode(self, mode, context='general'):
        """Get specific guidance for mode and context"""
        mode_guidance = self.guidance_rules.get(mode, self.guidance_rules['Study'])
        
        if context == 'break':
            return {
                'activities': mode_guidance['break_activities'],
                'message': self.generate_break_message(mode)
            }
        elif context == 'focus':
            return {
                'tips': mode_guidance['focus_tips'],
                'message': self.generate_focus_message(mode)
            }
        else:
            return mode_guidance
    
    def generate_break_message(self, mode):
        """Generate mode-specific break messages"""
        messages = {
            'Study': "Great work! Take a short break to recharge your mind.",
            'College': "Time for a strategic break. Review what you've learned so far.",
            'Office': "Productivity break time. Step away and return refreshed.",
            'Project': "Creative pause! Let your ideas percolate while you rest."
        }
        return messages.get(mode, messages['Study'])
    
    def generate_focus_message(self, mode):
        """Generate mode-specific focus messages"""
        messages = {
            'Study': "You're in the zone! Keep up the excellent focus.",
            'College': "Academic excellence in progress. Stay concentrated.",
            'Office': "Professional productivity mode activated.",
            'Project': "Creative flow state achieved. Innovation in progress."
        }
        return messages.get(mode, messages['Study'])

class PomodoroTimer:
    def __init__(self):
        self.work_duration = 25 * 60  # 25 minutes
        self.short_break = 5 * 60    # 5 minutes
        self.long_break = 15 * 60    # 15 minutes
        self.cycles_until_long_break = 4
        
        self.current_cycle = 0
        self.is_work_period = True
        self.start_time = None
        self.remaining_time = self.work_duration
        
    def start_pomodoro(self):
        """Start Pomodoro timer"""
        self.start_time = datetime.now()
        self.remaining_time = self.work_duration if self.is_work_period else self.get_break_duration()
    
    def get_break_duration(self):
        """Get appropriate break duration"""
        if (self.current_cycle + 1) % self.cycles_until_long_break == 0:
            return self.long_break
        return self.short_break
    
    def update_timer(self):
        """Update timer state"""
        if self.start_time:
            elapsed = (datetime.now() - self.start_time).total_seconds()
            self.remaining_time = max(0, (self.work_duration if self.is_work_period else self.get_break_duration()) - elapsed)
            
            if self.remaining_time <= 0:
                self.complete_period()
    
    def complete_period(self):
        """Complete current period and switch"""
        if self.is_work_period:
            self.current_cycle += 1
        
        self.is_work_period = not self.is_work_period
        self.start_time = None
        
        return {
            'completed_period': 'work' if not self.is_work_period else 'break',
            'next_period': 'break' if not self.is_work_period else 'work',
            'cycle': self.current_cycle
        }
    
    def get_status(self):
        """Get current timer status"""
        return {
            'current_period': 'work' if self.is_work_period else 'break',
            'remaining_time': self.remaining_time,
            'cycle': self.current_cycle,
            'progress': 1 - (self.remaining_time / (self.work_duration if self.is_work_period else self.get_break_duration()))
        }

class EngagementTracker:
    def __init__(self):
        self.engagement_history = []
        self.focus_sessions = []
        self.distraction_events = []
        
    def log_engagement_event(self, event_type, data):
        """Log engagement-related events"""
        event = {
            'timestamp': datetime.now(),
            'type': event_type,
            'data': data
        }
        
        self.engagement_history.append(event)
        
        if event_type == 'focus_start':
            self.focus_sessions.append({'start': datetime.now(), 'end': None})
        elif event_type == 'focus_end' and self.focus_sessions:
            self.focus_sessions[-1]['end'] = datetime.now()
        elif event_type == 'distraction':
            self.distraction_events.append(event)
    
    def get_engagement_analytics(self, time_window_minutes=60):
        """Get engagement analytics for specified time window"""
        cutoff_time = datetime.now() - timedelta(minutes=time_window_minutes)
        
        recent_events = [e for e in self.engagement_history if e['timestamp'] > cutoff_time]
        recent_distractions = [d for d in self.distraction_events if d['timestamp'] > cutoff_time]
        
        # Calculate focus time
        total_focus_time = 0
        for session in self.focus_sessions:
            if session['start'] > cutoff_time:
                end_time = session['end'] or datetime.now()
                focus_duration = (end_time - session['start']).total_seconds()
                total_focus_time += focus_duration
        
        return {
            'total_events': len(recent_events),
            'distraction_count': len(recent_distractions),
            'focus_time_minutes': total_focus_time / 60,
            'focus_percentage': (total_focus_time / (time_window_minutes * 60)) * 100,
            'distraction_rate': len(recent_distractions) / max(1, time_window_minutes)
        }
