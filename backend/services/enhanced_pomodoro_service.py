import asyncio
import time
from typing import Dict, Optional, Callable
from enum import Enum
import json

class SessionType(Enum):
    WORK = "work"
    SHORT_BREAK = "short_break"
    LONG_BREAK = "long_break"

class TimerState(Enum):
    STOPPED = "stopped"
    RUNNING = "running"
    PAUSED = "paused"
    PAUSED_AUTO = "paused_auto"  # Auto-paused due to absence

class EnhancedPomodoroService:
    def __init__(self):
        self.session_durations = {
            SessionType.WORK: 25 * 60,
            SessionType.SHORT_BREAK: 5 * 60,
            SessionType.LONG_BREAK: 15 * 60
        }
        
        self.current_session = SessionType.WORK
        self.time_left = self.session_durations[SessionType.WORK]
        self.state = TimerState.STOPPED
        self.sessions_completed = 0
        
        self.auto_pause_enabled = True
        self.person_present = True
        self.last_presence_check = time.time()
        
        self.callbacks = {
            'on_tick': None,
            'on_session_complete': None,
            'on_state_change': None,
            'on_auto_pause': None,
            'on_auto_resume': None
        }
        
        self._timer_task = None
        self._running = False
    
    def set_callback(self, event: str, callback: Callable):
        """Set callback for timer events"""
        if event in self.callbacks:
            self.callbacks[event] = callback
    
    async def start_timer(self) -> Dict:
        """Start the timer"""
        if self.state == TimerState.PAUSED_AUTO:
            # Don't allow manual start when auto-paused
            return {
                'success': False,
                'message': 'Timer is auto-paused. Please ensure you are visible to the camera.',
                'state': self.get_state()
            }
        
        self.state = TimerState.RUNNING
        self._running = True
        
        if self._timer_task is None or self._timer_task.done():
            self._timer_task = asyncio.create_task(self._timer_loop())
        
        await self._notify_state_change()
        
        return {
            'success': True,
            'message': 'Timer started',
            'state': self.get_state()
        }
    
    async def pause_timer(self, manual: bool = True) -> Dict:
        """Pause the timer"""
        if self.state == TimerState.RUNNING:
            self.state = TimerState.PAUSED if manual else TimerState.PAUSED_AUTO
            await self._notify_state_change()
            
            if not manual and self.callbacks['on_auto_pause']:
                await self.callbacks['on_auto_pause'](self.get_state())
        
        return {
            'success': True,
            'message': 'Timer paused' + (' automatically' if not manual else ''),
            'state': self.get_state()
        }
    
    async def resume_timer(self, manual: bool = True) -> Dict:
        """Resume the timer"""
        if self.state in [TimerState.PAUSED, TimerState.PAUSED_AUTO]:
            # Only allow resume if person is present (for auto-paused) or manual resume
            if self.state == TimerState.PAUSED_AUTO and not self.person_present:
                return {
                    'success': False,
                    'message': 'Cannot resume - person not detected',
                    'state': self.get_state()
                }
            
            self.state = TimerState.RUNNING
            await self._notify_state_change()
            
            if self.state == TimerState.PAUSED_AUTO and self.callbacks['on_auto_resume']:
                await self.callbacks['on_auto_resume'](self.get_state())
        
        return {
            'success': True,
            'message': 'Timer resumed',
            'state': self.get_state()
        }
    
    async def reset_timer(self) -> Dict:
        """Reset the timer"""
        self.state = TimerState.STOPPED
        self.time_left = self.session_durations[self.current_session]
        self._running = False
        
        if self._timer_task and not self._timer_task.done():
            self._timer_task.cancel()
        
        await self._notify_state_change()
        
        return {
            'success': True,
            'message': 'Timer reset',
            'state': self.get_state()
        }
    
    async def switch_session(self, session_type: SessionType) -> Dict:
        """Switch to a different session type"""
        was_running = self.state == TimerState.RUNNING
        
        await self.reset_timer()
        self.current_session = session_type
        self.time_left = self.session_durations[session_type]
        
        if was_running:
            await self.start_timer()
        
        return {
            'success': True,
            'message': f'Switched to {session_type.value}',
            'state': self.get_state()
        }
    
    async def update_person_presence(self, present: bool) -> Dict:
        """Update person presence status"""
        previous_presence = self.person_present
        self.person_present = present
        self.last_presence_check = time.time()
        
        # Auto pause/resume logic
        if self.auto_pause_enabled and self.state == TimerState.RUNNING:
            if not present and previous_presence:
                # Person just left - auto pause
                await self.pause_timer(manual=False)
                return {
                    'action': 'auto_paused',
                    'message': 'Timer auto-paused - person not detected',
                    'state': self.get_state()
                }
        
        elif self.auto_pause_enabled and self.state == TimerState.PAUSED_AUTO:
            if present and not previous_presence:
                # Person returned - auto resume
                await self.resume_timer(manual=False)
                return {
                    'action': 'auto_resumed',
                    'message': 'Timer auto-resumed - person detected',
                    'state': self.get_state()
                }
        
        return {
            'action': 'presence_updated',
            'person_present': present,
            'state': self.get_state()
        }
    
    def get_state(self) -> Dict:
        """Get current timer state"""
        return {
            'session_type': self.current_session.value,
            'time_left': self.time_left,
            'state': self.state.value,
            'sessions_completed': self.sessions_completed,
            'person_present': self.person_present,
            'auto_pause_enabled': self.auto_pause_enabled,
            'progress': self._calculate_progress(),
            'formatted_time': self._format_time(self.time_left)
        }
    
    async def _timer_loop(self):
        """Main timer loop"""
        while self._running and self.time_left > 0:
            if self.state == TimerState.RUNNING:
                self.time_left -= 1
                
                if self.callbacks['on_tick']:
                    await self.callbacks['on_tick'](self.get_state())
                
                if self.time_left <= 0:
                    await self._handle_session_complete()
                    break
            
            await asyncio.sleep(1)
    
    async def _handle_session_complete(self):
        """Handle session completion"""
        self.state = TimerState.STOPPED
        
        if self.current_session == SessionType.WORK:
            self.sessions_completed += 1
            # Auto-switch to break
            next_session = (SessionType.LONG_BREAK if self.sessions_completed % 4 == 0 
                          else SessionType.SHORT_BREAK)
        else:
            # Break completed, switch to work
            next_session = SessionType.WORK
        
        self.current_session = next_session
        self.time_left = self.session_durations[next_session]
        
        if self.callbacks['on_session_complete']:
            await self.callbacks['on_session_complete']({
                'completed_session': self.current_session.value,
                'next_session': next_session.value,
                'sessions_completed': self.sessions_completed,
                'state': self.get_state()
            })
        
        await self._notify_state_change()
    
    async def _notify_state_change(self):
        """Notify state change"""
        if self.callbacks['on_state_change']:
            await self.callbacks['on_state_change'](self.get_state())
    
    def _calculate_progress(self) -> float:
        """Calculate session progress percentage"""
        total_time = self.session_durations[self.current_session]
        elapsed = total_time - self.time_left
        return (elapsed / total_time) * 100 if total_time > 0 else 0
    
    def _format_time(self, seconds: int) -> str:
        """Format time as MM:SS"""
        mins = seconds // 60
        secs = seconds % 60
        return f"{mins:02d}:{secs:02d}"
    
    def set_auto_pause(self, enabled: bool):
        """Enable/disable auto pause feature"""
        self.auto_pause_enabled = enabled
    
    def cleanup(self):
        """Cleanup resources"""
        self._running = False
        if self._timer_task and not self._timer_task.done():
            self._timer_task.cancel()
