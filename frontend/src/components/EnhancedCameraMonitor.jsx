import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, User, UserX, Activity, AlertTriangle } from 'lucide-react';

const EnhancedCameraMonitor = ({ isActive, onPersonDetected, onPostureUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [personPresent, setPersonPresent] = useState(false);
  const [postureData, setPostureData] = useState({
    score: 0,
    status: 'unknown',
    alerts: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
        
        // Start analysis when video loads
        videoRef.current.onloadedmetadata = () => {
          startAnalysis();
        };
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setPersonPresent(false);
    setPostureData({ score: 0, status: 'unknown', alerts: [] });
  };

  const startAnalysis = () => {
    const analyzeFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isStreaming) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for analysis
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      try {
        // Send frame to backend for analysis
        const response = await fetch('/api/analyze-posture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageData,
            timestamp: Date.now()
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // Update person presence
          const wasPresent = personPresent;
          setPersonPresent(result.person_present);
          
          // Notify parent component of person detection changes
          if (onPersonDetected && wasPresent !== result.person_present) {
            onPersonDetected(result.person_present);
          }

          // Update posture data
          if (result.posture) {
            setPostureData(result.posture);
            if (onPostureUpdate) {
              onPostureUpdate(result.posture);
            }
          }
        }
      } catch (err) {
        console.error('Analysis error:', err);
      }

      // Continue analysis if still active
      if (isStreaming) {
        setTimeout(analyzeFrame, 1000); // Analyze every second
      }
    };

    // Start analysis loop
    setTimeout(analyzeFrame, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Focus Monitor</h3>
          </div>
          <div className="flex items-center space-x-2">
            {personPresent ? (
              <div className="flex items-center text-green-600">
                <User className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Present</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <UserX className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Away</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative">
        {error ? (
          <div className="h-48 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
        ) : (
          <div className="relative h-48 bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Status Overlay */}
            <div className="absolute top-2 left-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isStreaming ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                {isStreaming ? 'LIVE' : 'OFF'}
              </div>
            </div>

            {/* Person Detection Indicator */}
            <div className="absolute top-2 right-2">
              <div className={`p-2 rounded-full ${
                personPresent ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {personPresent ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <UserX className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posture Analysis */}
      {isStreaming && (
        <div className="p-4 space-y-3">
          {/* Posture Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Posture Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    postureData.score >= 80 ? 'bg-green-500' :
                    postureData.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${postureData.score}%` }}
                />
              </div>
              <span className="text-sm font-bold">{Math.round(postureData.score)}%</span>
            </div>
          </div>

          {/* Posture Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(postureData.status)}`}>
              {postureData.status}
            </span>
          </div>

          {/* Alerts */}
          {postureData.alerts && postureData.alerts.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Posture Alert</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {postureData.alerts.map((alert, index) => (
                      <li key={index}>• {alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Activity Indicator */}
          <div className="flex items-center justify-center pt-2 border-t">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Activity className="w-3 h-3" />
              <span>Monitoring active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCameraMonitor;
