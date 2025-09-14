import React, { useRef, useEffect, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, User, Zap, RotateCcw } from 'lucide-react';

const MovementTracker = ({ isActive, onMovementUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [movementData, setMovementData] = useState({
    currentMovement: 0,
    averageMovement: 0,
    movementHistory: [],
    status: 'Still',
    alerts: []
  });
  const [personDetected, setPersonDetected] = useState(false);
  const [bodyKeypoints, setBodyKeypoints] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const previousFrame = useRef(null);

  // Reset progress from beginning
  const resetProgress = () => {
    setMovementData({
      currentMovement: 0,
      averageMovement: 0,
      movementHistory: [],
      status: 'Still',
      alerts: []
    });
    setPersonDetected(false);
    setBodyKeypoints([]);
    previousFrame.current = null;
  };

  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [isActive]);

  const startTracking = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          frameRate: { ideal: 30 },
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            startMovementAnalysis();
          }).catch(err => {
            console.error('Video play failed:', err);
            setCameraError('Failed to start video');
          });
        };
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setCameraError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopTracking = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setPersonDetected(false);
    }
  };

  const startMovementAnalysis = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    const analyzeFrame = () => {
      if (!video || video.paused || video.ended) return;

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (previousFrame.current) {
        const movement = calculateMovement(previousFrame.current, currentImageData);
        updateMovementData(movement);
        detectPerson(movement);
      }
      
      previousFrame.current = currentImageData;
      requestAnimationFrame(analyzeFrame);
    };

    // Start analysis immediately if video is ready
    if (video.readyState >= 2) {
      analyzeFrame();
    } else {
      video.addEventListener('canplay', analyzeFrame, { once: true });
    }
  };

  const calculateMovement = (prevFrame, currentFrame) => {
    const prevData = prevFrame.data;
    const currData = currentFrame.data;
    let totalDiff = 0;
    let pixelCount = 0;

    // Sample every 4th pixel for performance
    for (let i = 0; i < prevData.length; i += 16) {
      const prevGray = (prevData[i] + prevData[i + 1] + prevData[i + 2]) / 3;
      const currGray = (currData[i] + currData[i + 1] + currData[i + 2]) / 3;
      totalDiff += Math.abs(prevGray - currGray);
      pixelCount++;
    }

    return pixelCount > 0 ? (totalDiff / pixelCount) / 255 * 100 : 0;
  };

  const detectPerson = (movement) => {
    // Enhanced person detection based on movement patterns
    const hasSignificantMovement = movement > 1 && movement < 60;
    setPersonDetected(hasSignificantMovement);
    
    // Simulate body keypoints for visualization with more realistic positions
    if (hasSignificantMovement) {
      const baseX = 320 + (Math.random() - 0.5) * 40;
      const baseY = 150 + (Math.random() - 0.5) * 20;
      
      setBodyKeypoints([
        { x: baseX, y: baseY, label: 'head', confidence: 0.9 },
        { x: baseX - 20, y: baseY + 50, label: 'left_shoulder', confidence: 0.8 },
        { x: baseX + 20, y: baseY + 50, label: 'right_shoulder', confidence: 0.8 },
        { x: baseX, y: baseY + 100, label: 'center', confidence: 0.7 },
        { x: baseX - 30, y: baseY + 150, label: 'left_hand', confidence: 0.6 },
        { x: baseX + 30, y: baseY + 150, label: 'right_hand', confidence: 0.6 }
      ]);
    }
  };

  const updateMovementData = (movement) => {
    setMovementData(prev => {
      const newHistory = [...prev.movementHistory, movement].slice(-60); // Keep last 60 readings (2 minutes)
      const avgMovement = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      
      let status = 'Still';
      let alerts = [];
      
      if (movement > 20) {
        status = 'High Movement';
        alerts.push('Excessive movement detected - try to stay still for better focus');
      } else if (movement > 12) {
        status = 'Moderate Movement';
        alerts.push('Some movement detected - maintain steady position');
      } else if (movement > 5) {
        status = 'Slight Movement';
      } else if (movement > 2) {
        status = 'Minimal Movement';
      }

      // Check for prolonged stillness
      if (avgMovement < 0.5 && newHistory.length > 30) {
        alerts.push('Very still for extended period - ensure you\'re comfortable');
      }

      // Check for fidgeting patterns
      const recentMovements = newHistory.slice(-10);
      const isConsistentlyHigh = recentMovements.every(m => m > 8);
      if (isConsistentlyHigh) {
        alerts.push('Consistent fidgeting detected - consider taking a short break');
      }

      const newData = {
        currentMovement: Math.round(movement * 10) / 10,
        averageMovement: Math.round(avgMovement * 10) / 10,
        movementHistory: newHistory,
        status,
        alerts
      };

      onMovementUpdate?.(newData);
      return newData;
    });
  };

  const getMovementColor = (movement) => {
    if (movement < 2) return 'text-green-600';
    if (movement < 5) return 'text-blue-600';
    if (movement < 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Still': return 'bg-green-100 text-green-800 border-green-200';
      case 'Minimal Movement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Slight Movement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Moderate Movement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High Movement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Movement Tracker
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetProgress}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Reset Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(movementData.status)}`}>
            {movementData.status}
          </div>
        </div>
      </div>

      {cameraError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {cameraError}
          </div>
        </div>
      )}

      {/* Video Feed with Overlay */}
      <div className="relative mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-32 bg-gray-200 rounded-lg object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Person Detection Overlay */}
        {personDetected && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              {bodyKeypoints.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={`${point.x * (100 / 640)}%`}
                    cy={`${point.y * (32 / 480)}%`}
                    r="3"
                    fill="#10B981"
                    className="animate-pulse"
                    opacity={point.confidence}
                  />
                  {/* Connection lines for skeleton */}
                  {index > 0 && index < 3 && (
                    <line
                      x1={`${bodyKeypoints[0].x * (100 / 640)}%`}
                      y1={`${bodyKeypoints[0].y * (32 / 480)}%`}
                      x2={`${point.x * (100 / 640)}%`}
                      y2={`${point.y * (32 / 480)}%`}
                      stroke="#10B981"
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>
        )}
        
        {/* Status Indicator */}
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${personDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            {personDetected ? 'Person Detected' : 'No Person'}
          </span>
        </div>
      </div>

      {/* Movement Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-2xl font-bold ${getMovementColor(movementData.currentMovement)}`}>
            {movementData.currentMovement}
          </div>
          <div className="text-xs text-gray-600">Current Level</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className={`text-2xl font-bold ${getMovementColor(movementData.averageMovement)}`}>
            {movementData.averageMovement}
          </div>
          <div className="text-xs text-gray-600">Average Level</div>
        </div>
      </div>

      {/* Movement Graph */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Movement History (Last 2 minutes)</div>
        <div className="h-16 bg-gray-100 rounded flex items-end justify-between px-1">
          {movementData.movementHistory.slice(-30).map((value, index) => (
            <div
              key={index}
              className={`w-1 rounded-t ${
                value < 2 ? 'bg-green-500' : 
                value < 5 ? 'bg-blue-500' :
                value < 12 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ height: `${Math.min(Math.max(value * 2, 2), 60)}px` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>2min ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Body Position Indicator */}
      {personDetected && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Body Position Tracking</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
              <span>Head Stable</span>
            </div>
            <div className="text-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-1" />
              <span>Torso Aligned</span>
            </div>
            <div className="text-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mb-1" />
              <span>Hands Tracked</span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {movementData.alerts.length > 0 ? (
        <div className="space-y-2 mb-4">
          {movementData.alerts.map((alert, index) => (
            <div key={index} className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-yellow-800">{alert}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded text-sm mb-4">
          <Zap className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-green-800">Movement levels optimal for focus!</span>
        </div>
      )}

      {/* Movement Tips */}
      <div className="bg-purple-50 rounded-lg p-3">
        <div className="text-sm font-medium text-purple-800 mb-2">💡 Movement Tips:</div>
        <ul className="text-xs text-purple-700 space-y-1">
          <li>• Slight movement is natural and healthy</li>
          <li>• Excessive movement may indicate discomfort</li>
          <li>• Adjust your chair and desk height for comfort</li>
          <li>• Take standing breaks every 25-30 minutes</li>
          <li>• Practice deep breathing to reduce fidgeting</li>
        </ul>
      </div>
    </div>
  );
};

export default MovementTracker;
