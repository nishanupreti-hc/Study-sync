import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Camera, TrendingUp, Award, Eye, User, Activity, Move, X, Minimize2, UserCheck } from 'lucide-react';
import CameraMonitor from '../components/CameraMonitor';
import PostureTracker from '../components/PostureTracker';
import FocusEnhancer from '../components/FocusEnhancer';
import MovementTracker from '../components/MovementTracker';
import DraggableMiniTimer from '../components/DraggableMiniTimer';
import FaceDetector from '../components/FaceDetector';
import { loadSettings, saveSettings } from '../utils/pomodoroSettings';

const PomodoroPage = () => {
  // Timer settings with defaults
  const [settings, setSettings] = useState(loadSettings());
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [wasActiveBeforeFaceLoss, setWasActiveBeforeFaceLoss] = useState(false);
  
  const [focusData, setFocusData] = useState({ score: 85, attention: 'High', posture: 'Good' });
  const [postureData, setPostureData] = useState({ status: 'Good', angle: 85, alerts: [] });
  const [movementData, setMovementData] = useState({ currentMovement: 0, status: 'Still', alerts: [] });
  const [showFocusEnhancer, setShowFocusEnhancer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 12,
    averageFocus: 82,
    streakDays: 5,
    totalHours: 8.5
  });

  const intervalRef = useRef(null);

  const getSessionDurations = () => ({
    work: settings.workDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60
  });

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (sessionType === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      // Determine next session type based on custom settings
      const nextType = newSessionsCompleted % settings.sessionsUntilLongBreak === 0 ? 'longBreak' : 'shortBreak';
      setSessionType(nextType);
      setTimeLeft(getSessionDurations()[nextType]);
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsActive(true), 1000);
      }
    } else {
      // Break completed, switch to work
      setSessionType('work');
      setTimeLeft(getSessionDurations().work);
      
      // Auto-start work if enabled
      if (settings.autoStartWork) {
        setTimeout(() => setIsActive(true), 1000);
      }
    }

    // Play notification sound if enabled
    if (settings.soundNotifications) {
      new Audio('/notification.mp3').play().catch(() => {});
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getSessionDurations()[sessionType]);
  };

  const switchSession = (type) => {
    setSessionType(type);
    setTimeLeft(getSessionDurations()[type]);
    setIsActive(false);
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    // Update current timer if needed
    if (!isActive) {
      setTimeLeft(getSessionDurations()[sessionType]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = (type) => {
    switch (type) {
      case 'work': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleFocusImprovement = (improvement) => {
    setFocusData(prev => ({
      ...prev,
      score: Math.min(100, prev.score + improvement)
    }));
  };

  const handlePostureUpdate = (newPostureData) => {
    setPostureData(newPostureData);
  };

  const handleMovementUpdate = (newMovementData) => {
    setMovementData(newMovementData);
  };

  const handleFaceDetection = (detected) => {
    setFaceDetected(detected);
    
    // Auto control timer based on face detection
    if (settings.autoFaceControl && sessionType === 'work') {
      if (!detected && isActive) {
        // Face lost, pause timer
        setWasActiveBeforeFaceLoss(true);
        setIsActive(false);
      } else if (detected && !isActive && wasActiveBeforeFaceLoss) {
        // Face detected again, resume timer
        setIsActive(true);
        setWasActiveBeforeFaceLoss(false);
      }
    }
  };

  const progress = ((getSessionDurations()[sessionType] - timeLeft) / getSessionDurations()[sessionType]) * 100;

  // Settings Modal Component
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Timer Settings</h3>
          <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Work Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.workDuration}
              onChange={(e) => updateSettings({...settings, workDuration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Short Break (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSettings({...settings, shortBreakDuration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Long Break (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => updateSettings({...settings, longBreakDuration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sessions until Long Break</label>
            <input
              type="number"
              min="2"
              max="10"
              value={settings.sessionsUntilLongBreak}
              onChange={(e) => updateSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => updateSettings({...settings, autoStartBreaks: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Auto-start breaks</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoStartWork}
                onChange={(e) => updateSettings({...settings, autoStartWork: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Auto-start work sessions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.soundNotifications}
                onChange={(e) => updateSettings({...settings, soundNotifications: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Sound notifications</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.cameraMonitoring}
                onChange={(e) => updateSettings({...settings, cameraMonitoring: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Camera monitoring</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoFaceControl}
                onChange={(e) => updateSettings({...settings, autoFaceControl: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Auto pause when face not detected</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Face Detection Mode</label>
            <select
              value={settings.faceDetectionMode}
              onChange={(e) => updateSettings({...settings, faceDetectionMode: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="manual">Manual (monitoring only)</option>
              <option value="automatic">Automatic (controls timer)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  // Minimized Timer Component
  if (isMinimized) {
    return (
      <DraggableMiniTimer
        timeLeft={timeLeft}
        isActive={isActive}
        sessionType={sessionType}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onMaximize={() => setIsMinimized(false)}
        onSettings={() => setShowSettings(true)}
        faceDetected={faceDetected}
        autoFaceControl={settings.autoFaceControl}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {showSettings && <SettingsModal />}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-800">Focus Timer</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              title="Minimize Timer"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600">Enhanced Pomodoro with AI-powered focus monitoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Session Type Selector */}
              <div className="flex justify-center mb-8">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {Object.keys(getSessionDurations()).map((type) => (
                    <button
                      key={type}
                      onClick={() => switchSession(type)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        sessionType === type
                          ? `${getSessionColor(type)} text-white`
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {type === 'shortBreak' ? 'Short Break' : 
                       type === 'longBreak' ? 'Long Break' : 'Work'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className={sessionType === 'work' ? 'text-red-500' : 
                                sessionType === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-800">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-lg text-gray-600 mt-2">
                        {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center px-8 py-3 rounded-lg text-white font-medium ${
                    isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </button>
                <button
                  onClick={() => setShowFocusEnhancer(!showFocusEnhancer)}
                  className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Focus Boost
                </button>
              </div>

              {/* Real-time Metrics - Only show if camera monitoring is enabled */}
              {settings.cameraMonitoring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Focus Score</span>
                      <span className="text-2xl font-bold text-blue-600">{focusData.score}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Attention: {focusData.attention} • Gaze: {focusData.gazeDirection || 'Center'}
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-4 ${faceDetected ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-pink-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Face Detection</span>
                      <UserCheck className={`w-6 h-6 ${faceDetected ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="text-sm text-gray-600">
                      {faceDetected ? 'Face detected' : 'No face detected'}
                      {settings.autoFaceControl && ' • Auto control ON'}
                    </div>
                  </div>
                  
                  {postureData.alerts.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                      <div className="font-medium text-yellow-800 mb-2">Posture Alert</div>
                      <div className="text-sm text-yellow-700">
                        {postureData.alerts[0]}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Focus Enhancer */}
              {showFocusEnhancer && (
                <div className="mb-6">
                  <FocusEnhancer onFocusImprove={handleFocusImprovement} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Only show camera monitor if enabled */}
          <div className="space-y-6">
            {/* Face Detection - Always show if camera monitoring is enabled */}
            {settings.cameraMonitoring && (
              <FaceDetector
                isActive={isActive}
                onFaceDetected={handleFaceDetection}
                autoMode={settings.autoFaceControl}
              />
            )}

            {/* Camera Monitor - Only show if camera monitoring is enabled */}
            {settings.cameraMonitoring && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Camera Monitor</h3>
                  <button
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      cameraEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cameraEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <CameraMonitor 
                  isActive={cameraEnabled && isActive}
                  onFocusUpdate={setFocusData}
                />
              </div>
            )}

            {/* Posture Tracker - Only show if camera monitoring is enabled */}
            {settings.cameraMonitoring && (
              <PostureTracker 
                isActive={isActive}
                onPostureUpdate={handlePostureUpdate}
              />
            )}

            {/* Movement Tracker - Only show if camera monitoring is enabled */}
            {settings.cameraMonitoring && (
              <MovementTracker 
                isActive={isActive}
                onMovementUpdate={handleMovementUpdate}
              />
            )}

            {/* Session Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Session Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Today's Sessions</span>
                  <span className="font-semibold">{sessionsCompleted}/8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Focus</span>
                  <span className="font-semibold">{sessionStats.averageFocus}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streak Days</span>
                  <span className="font-semibold">{sessionStats.streakDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours</span>
                  <span className="font-semibold">{sessionStats.totalHours}h</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Daily Goal Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(sessionsCompleted / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Customize Timer
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Minimize Timer
                </button>
                <div className="text-sm text-gray-600 mt-4">
                  <div>Next long break: {settings.sessionsUntilLongBreak - (sessionsCompleted % settings.sessionsUntilLongBreak)} sessions</div>
                  <div>Work: {settings.workDuration}m | Short: {settings.shortBreakDuration}m | Long: {settings.longBreakDuration}m</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
