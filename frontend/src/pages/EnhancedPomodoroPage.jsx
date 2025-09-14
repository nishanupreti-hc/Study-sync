import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, User, UserX, Activity, Award, TrendingUp, Clock, Target } from 'lucide-react';
import EnhancedCameraMonitor from '../components/EnhancedCameraMonitor';

const EnhancedPomodoroPage = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [personPresent, setPersonPresent] = useState(true);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [isPausedAuto, setIsPausedAuto] = useState(false);
  const [postureData, setPostureData] = useState({
    score: 85,
    status: 'good',
    alerts: []
  });
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 12,
    averageFocus: 82,
    streakDays: 5,
    totalHours: 8.5,
    todayGoal: 8,
    todayCompleted: 3
  });

  const intervalRef = useRef(null);
  const wsRef = useRef(null);

  const sessionDurations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  const sessionConfig = {
    work: {
      name: 'Focus Session',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500',
      lightBg: 'bg-red-50',
      textColor: 'text-red-600'
    },
    shortBreak: {
      name: 'Short Break',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
      textColor: 'text-green-600'
    },
    longBreak: {
      name: 'Long Break',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  };

  useEffect(() => {
    // Initialize WebSocket connection
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && !isPausedAuto && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPausedAuto, timeLeft]);

  const initializeWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/pomodoro');
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'timer_state':
        updateTimerState(data.payload);
        break;
      case 'auto_paused':
        setIsPausedAuto(true);
        setIsActive(false);
        break;
      case 'auto_resumed':
        setIsPausedAuto(false);
        if (data.payload.should_resume) {
          setIsActive(true);
        }
        break;
      default:
        break;
    }
  };

  const updateTimerState = (state) => {
    setTimeLeft(state.time_left);
    setSessionType(state.session_type);
    setSessionsCompleted(state.sessions_completed);
  };

  const handlePersonDetected = async (detected) => {
    const wasPresent = personPresent;
    setPersonPresent(detected);

    if (autoPauseEnabled && isActive) {
      if (!detected && wasPresent) {
        // Person left - auto pause
        setIsPausedAuto(true);
        setIsActive(false);
        showNotification('Timer paused - Please return to your seat', 'warning');
      } else if (detected && !wasPresent && isPausedAuto) {
        // Person returned - auto resume
        setIsPausedAuto(false);
        setIsActive(true);
        showNotification('Timer resumed - Welcome back!', 'success');
      }
    }

    // Send presence update to backend
    try {
      await fetch('/api/pomodoro/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ present: detected })
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  };

  const handlePostureUpdate = (newPostureData) => {
    setPostureData(newPostureData);
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    setIsPausedAuto(false);
    
    if (sessionType === 'work') {
      const newCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newCompleted);
      
      // Auto-switch to break
      const nextType = newCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
      setSessionType(nextType);
      setTimeLeft(sessionDurations[nextType]);
      
      showNotification('Work session completed! Time for a break.', 'success');
    } else {
      // Break completed, switch to work
      setSessionType('work');
      setTimeLeft(sessionDurations.work);
      showNotification('Break over! Ready for another focus session?', 'info');
    }

    // Play notification sound
    playNotificationSound();
  };

  const toggleTimer = async () => {
    if (isPausedAuto && !personPresent) {
      showNotification('Please ensure you are visible to the camera before starting', 'warning');
      return;
    }

    const newState = !isActive;
    setIsActive(newState);
    setIsPausedAuto(false);

    // Send state to backend
    try {
      await fetch(`/api/pomodoro/${newState ? 'start' : 'pause'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true })
      });
    } catch (error) {
      console.error('Failed to update timer state:', error);
    }
  };

  const resetTimer = async () => {
    setIsActive(false);
    setIsPausedAuto(false);
    setTimeLeft(sessionDurations[sessionType]);

    try {
      await fetch('/api/pomodoro/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to reset timer:', error);
    }
  };

  const switchSession = async (type) => {
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsActive(false);
    setIsPausedAuto(false);

    try {
      await fetch('/api/pomodoro/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_type: type })
      });
    } catch (error) {
      console.error('Failed to switch session:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showNotification = (message, type = 'info') => {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const progress = ((sessionDurations[sessionType] - timeLeft) / sessionDurations[sessionType]) * 100;
  const currentConfig = sessionConfig[sessionType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Professional Focus Timer
          </h1>
          <p className="text-gray-600 text-lg">AI-powered productivity with automatic presence detection</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Timer Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Session Type Header */}
              <div className={`bg-gradient-to-r ${currentConfig.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">{currentConfig.name}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isPausedAuto && (
                      <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                        <UserX className="w-4 h-4 mr-2" />
                        <span className="text-sm">Auto-Paused</span>
                      </div>
                    )}
                    <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                      {personPresent ? (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          <span className="text-sm">Present</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          <span className="text-sm">Away</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Session Type Selector */}
                <div className="flex justify-center mb-8">
                  <div className="flex bg-gray-100 rounded-2xl p-2">
                    {Object.entries(sessionDurations).map(([type, duration]) => (
                      <button
                        key={type}
                        onClick={() => switchSession(type)}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          sessionType === type
                            ? `${sessionConfig[type].bgColor} text-white shadow-lg`
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'shortBreak' ? 'Short Break' : 
                         type === 'longBreak' ? 'Long Break' : 'Focus'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                        className={currentConfig.textColor}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-gray-800 mb-2">
                          {formatTime(timeLeft)}
                        </div>
                        <div className="text-lg text-gray-600">
                          {Math.round(progress)}% Complete
                        </div>
                        {isPausedAuto && (
                          <div className="text-sm text-red-500 mt-2 font-medium">
                            Paused - Return to seat
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    onClick={toggleTimer}
                    disabled={isPausedAuto && !personPresent}
                    className={`flex items-center px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-200 shadow-lg ${
                      isPausedAuto && !personPresent
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isActive 
                          ? 'bg-red-500 hover:bg-red-600 hover:shadow-xl' 
                          : 'bg-green-500 hover:bg-green-600 hover:shadow-xl'
                    }`}
                  >
                    {isActive ? <Pause className="w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
                    {isActive ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="flex items-center px-6 py-4 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </button>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`${currentConfig.lightBg} rounded-xl p-4 text-center`}>
                    <div className={`text-2xl font-bold ${currentConfig.textColor}`}>
                      {sessionsCompleted}
                    </div>
                    <div className="text-sm text-gray-600">Sessions Today</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(postureData.score)}%
                    </div>
                    <div className="text-sm text-gray-600">Posture Score</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {sessionStats.streakDays}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Camera Monitor - Always Active */}
            <EnhancedCameraMonitor
              isActive={true}
              onPersonDetected={handlePersonDetected}
              onPostureUpdate={handlePostureUpdate}
            />

            {/* Daily Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Daily Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sessions Goal</span>
                    <span>{sessionStats.todayCompleted}/{sessionStats.todayGoal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(sessionStats.todayCompleted / sessionStats.todayGoal) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">{sessionStats.totalHours}h</div>
                    <div className="text-xs text-gray-600">Total Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">{sessionStats.averageFocus}%</div>
                    <div className="text-xs text-gray-600">Avg Focus</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-pause when away</span>
                  <input 
                    type="checkbox" 
                    checked={autoPauseEnabled}
                    onChange={(e) => setAutoPauseEnabled(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sound notifications</span>
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto-start breaks</span>
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPomodoroPage;
