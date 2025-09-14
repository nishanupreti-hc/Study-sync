import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, User, Activity, RotateCcw } from 'lucide-react';

const PostureTracker = ({ isActive, onPostureUpdate }) => {
  const [posture, setPosture] = useState({ status: 'Good', angle: 85, alerts: [] });
  const [bodyMetrics, setBodyMetrics] = useState({
    shoulderAlignment: 85,
    spineAngle: 92,
    headPosition: 78,
    sittingTime: 0,
    neckAngle: 88,
    backSupport: 90
  });
  const [postureHistory, setPostureHistory] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  // Reset progress from beginning
  const resetProgress = () => {
    setBodyMetrics({
      shoulderAlignment: 85,
      spineAngle: 92,
      headPosition: 78,
      sittingTime: 0,
      neckAngle: 88,
      backSupport: 90
    });
    setPostureHistory([]);
    setSessionStartTime(Date.now());
    setPosture({ status: 'Good', angle: 85, alerts: [] });
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simulate real-time posture analysis with more detailed tracking
      const shoulderAlign = Math.max(60, Math.min(100, bodyMetrics.shoulderAlignment + (Math.random() - 0.5) * 15));
      const spineAngle = Math.max(70, Math.min(100, bodyMetrics.spineAngle + (Math.random() - 0.5) * 10));
      const headPos = Math.max(50, Math.min(100, bodyMetrics.headPosition + (Math.random() - 0.5) * 20));
      const neckAngle = Math.max(60, Math.min(100, bodyMetrics.neckAngle + (Math.random() - 0.5) * 12));
      const backSupport = Math.max(70, Math.min(100, bodyMetrics.backSupport + (Math.random() - 0.5) * 8));
      
      const newMetrics = {
        shoulderAlignment: Math.round(shoulderAlign),
        spineAngle: Math.round(spineAngle),
        headPosition: Math.round(headPos),
        neckAngle: Math.round(neckAngle),
        backSupport: Math.round(backSupport),
        sittingTime: bodyMetrics.sittingTime + 2 // 2 seconds per update
      };

      setBodyMetrics(newMetrics);

      // Generate detailed alerts
      const alerts = [];
      if (shoulderAlign < 70) alerts.push('Roll your shoulders back and down');
      if (spineAngle < 80) alerts.push('Sit up straight - engage your core');
      if (headPos < 65) alerts.push('Keep your head aligned over your shoulders');
      if (neckAngle < 70) alerts.push('Avoid forward head posture');
      if (backSupport < 75) alerts.push('Use your chair\'s back support');
      if (newMetrics.sittingTime > 1800) alerts.push('Take a 2-minute standing break');
      if (newMetrics.sittingTime > 3600) alerts.push('URGENT: You\'ve been sitting for over 1 hour!');

      const overallScore = (shoulderAlign + spineAngle + headPos + neckAngle + backSupport) / 5;
      const status = overallScore > 85 ? 'Excellent' : 
                   overallScore > 75 ? 'Good' : 
                   overallScore > 65 ? 'Fair' : 'Needs Improvement';

      const postureData = { status, angle: Math.round(overallScore), alerts };
      setPosture(postureData);
      
      // Update history
      setPostureHistory(prev => [...prev.slice(-29), overallScore]); // Keep last 30 readings
      
      onPostureUpdate?.(postureData);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, bodyMetrics]);

  const getStatusColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 65) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMetricColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <User className="w-5 h-5 mr-2" />
          Posture Tracker
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetProgress}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Reset Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(posture.angle)}`}>
            {posture.status}
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-4">
        <div className={`text-3xl font-bold ${getMetricColor(posture.angle)}`}>
          {posture.angle}%
        </div>
        <div className="text-sm text-gray-600">Overall Posture Score</div>
      </div>

      {/* Detailed Body Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-lg font-bold ${getMetricColor(bodyMetrics.shoulderAlignment)}`}>
            {bodyMetrics.shoulderAlignment}%
          </div>
          <div className="text-xs text-gray-600">Shoulders</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-lg font-bold ${getMetricColor(bodyMetrics.spineAngle)}`}>
            {bodyMetrics.spineAngle}%
          </div>
          <div className="text-xs text-gray-600">Spine</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-lg font-bold ${getMetricColor(bodyMetrics.headPosition)}`}>
            {bodyMetrics.headPosition}%
          </div>
          <div className="text-xs text-gray-600">Head</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-lg font-bold ${getMetricColor(bodyMetrics.neckAngle)}`}>
            {bodyMetrics.neckAngle}%
          </div>
          <div className="text-xs text-gray-600">Neck</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-lg font-bold ${getMetricColor(bodyMetrics.backSupport)}`}>
            {bodyMetrics.backSupport}%
          </div>
          <div className="text-xs text-gray-600">Back</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-bold text-purple-600">
            {formatTime(bodyMetrics.sittingTime)}
          </div>
          <div className="text-xs text-gray-600">Sitting</div>
        </div>
      </div>

      {/* Enhanced Posture Visualization */}
      <div className="mb-4">
        <div className="flex justify-center">
          <svg width="100" height="140" viewBox="0 0 100 140" className="border rounded bg-gray-50">
            {/* Head */}
            <circle 
              cx="50" 
              cy="25" 
              r="15" 
              fill={bodyMetrics.headPosition > 75 ? "#10B981" : bodyMetrics.headPosition > 65 ? "#F59E0B" : "#EF4444"} 
            />
            {/* Neck */}
            <line 
              x1="50" 
              y1="40" 
              x2="50" 
              y2="55" 
              stroke={bodyMetrics.neckAngle > 75 ? "#10B981" : bodyMetrics.neckAngle > 65 ? "#F59E0B" : "#EF4444"} 
              strokeWidth="6" 
            />
            {/* Shoulders */}
            <line 
              x1="25" 
              y1="55" 
              x2="75" 
              y2="55" 
              stroke={bodyMetrics.shoulderAlignment > 75 ? "#10B981" : bodyMetrics.shoulderAlignment > 65 ? "#F59E0B" : "#EF4444"} 
              strokeWidth="4" 
            />
            {/* Spine */}
            <line 
              x1="50" 
              y1="55" 
              x2="50" 
              y2="100" 
              stroke={bodyMetrics.spineAngle > 80 ? "#10B981" : bodyMetrics.spineAngle > 70 ? "#F59E0B" : "#EF4444"} 
              strokeWidth="6" 
            />
            {/* Torso */}
            <rect 
              x="35" 
              y="55" 
              width="30" 
              height="45" 
              fill="#E5E7EB" 
              stroke={bodyMetrics.backSupport > 75 ? "#10B981" : bodyMetrics.backSupport > 65 ? "#F59E0B" : "#EF4444"}
              strokeWidth="2"
            />
            {/* Arms */}
            <line x1="25" y1="55" x2="15" y2="85" stroke="#6B7280" strokeWidth="3" />
            <line x1="75" y1="55" x2="85" y2="85" stroke="#6B7280" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Posture History Graph */}
      {postureHistory.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Posture Trend (Last 60 seconds)</div>
          <div className="h-16 bg-gray-100 rounded flex items-end justify-between px-1">
            {postureHistory.slice(-30).map((value, index) => (
              <div
                key={index}
                className={`w-1 rounded-t ${
                  value >= 85 ? 'bg-green-500' : 
                  value >= 75 ? 'bg-blue-500' :
                  value >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ height: `${Math.max(value * 0.6, 8)}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {posture.alerts.length > 0 && (
        <div className="space-y-2 mb-4">
          {posture.alerts.map((alert, index) => (
            <div key={index} className={`flex items-center p-2 rounded text-sm border ${
              alert.includes('URGENT') ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <AlertTriangle className={`w-4 h-4 mr-2 ${
                alert.includes('URGENT') ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <span className={alert.includes('URGENT') ? 'text-red-800 font-medium' : 'text-yellow-800'}>
                {alert}
              </span>
            </div>
          ))}
        </div>
      )}

      {posture.alerts.length === 0 && (
        <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded text-sm mb-4">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-green-800">Excellent posture! Keep it up!</span>
        </div>
      )}

      {/* Posture Tips */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="text-sm font-medium text-blue-800 mb-2">💡 Posture Tips:</div>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Keep feet flat on floor, knees at 90°</li>
          <li>• Monitor at eye level, arm's length away</li>
          <li>• Shoulders relaxed, not hunched</li>
          <li>• Take micro-breaks every 20 minutes</li>
          <li>• Engage core muscles for spine support</li>
        </ul>
      </div>
    </div>
  );
};

export default PostureTracker;
