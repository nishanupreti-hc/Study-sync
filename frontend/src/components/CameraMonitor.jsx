import React, { useRef, useEffect, useState } from 'react';
import { Camera, Eye, AlertTriangle, CheckCircle, User, Target } from 'lucide-react';

const CameraMonitor = ({ onFocusUpdate, isActive = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [focusScore, setFocusScore] = useState(85);
  const [attentionLevel, setAttentionLevel] = useState('High');
  const [postureStatus, setPostureStatus] = useState('Good');
  const [isTracking, setIsTracking] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeTracking, setEyeTracking] = useState({ leftEye: false, rightEye: false });
  const [headPose, setHeadPose] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [blinkCount, setBlinkCount] = useState(0);
  const [gazeDirection, setGazeDirection] = useState('Center');
  const [cameraError, setCameraError] = useState(null);

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
            setIsTracking(true);
            startAdvancedAnalysis();
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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsTracking(false);
      setFaceDetected(false);
    }
  };

  const startAdvancedAnalysis = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    
    const analyzeFrame = () => {
      if (!video || video.paused || video.ended || !isTracking) return;

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simulate advanced face analysis
      const faceAnalysis = performFaceAnalysis(ctx);
      updateFocusMetrics(faceAnalysis);
      
      requestAnimationFrame(analyzeFrame);
    };

    // Start analysis immediately if video is ready
    if (video.readyState >= 2) {
      analyzeFrame();
    } else {
      video.addEventListener('canplay', analyzeFrame, { once: true });
    }
  };

  const performFaceAnalysis = (ctx) => {
    // Simulate face detection and analysis
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Simulate face detection (in real app, use MediaPipe or similar)
    const hasFace = Math.random() > 0.1; // 90% chance of face detection
    setFaceDetected(hasFace);
    
    if (!hasFace) {
      return {
        attention: 0,
        eyeContact: 0,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
        blinkRate: 0,
        gazeDirection: 'Away'
      };
    }

    // Simulate eye tracking
    const leftEyeOpen = Math.random() > 0.1;
    const rightEyeOpen = Math.random() > 0.1;
    setEyeTracking({ leftEye: leftEyeOpen, rightEye: rightEyeOpen });
    
    // Simulate blink detection
    if (!leftEyeOpen && !rightEyeOpen) {
      setBlinkCount(prev => prev + 1);
    }

    // Simulate head pose estimation
    const yaw = (Math.random() - 0.5) * 60; // -30 to 30 degrees
    const pitch = (Math.random() - 0.5) * 40; // -20 to 20 degrees
    const roll = (Math.random() - 0.5) * 30; // -15 to 15 degrees
    setHeadPose({ yaw, pitch, roll });

    // Simulate gaze direction
    const gazeDirections = ['Center', 'Left', 'Right', 'Up', 'Down'];
    const gaze = Math.abs(yaw) < 15 && Math.abs(pitch) < 10 ? 'Center' : 
                 gazeDirections[Math.floor(Math.random() * gazeDirections.length)];
    setGazeDirection(gaze);

    // Calculate attention metrics
    const eyeContactScore = (leftEyeOpen && rightEyeOpen) ? 90 : 30;
    const headPoseScore = Math.max(0, 100 - Math.abs(yaw) * 2 - Math.abs(pitch) * 3);
    const gazeScore = gaze === 'Center' ? 95 : 60;
    
    return {
      attention: (eyeContactScore + headPoseScore + gazeScore) / 3,
      eyeContact: eyeContactScore,
      headPose: { yaw, pitch, roll },
      blinkRate: blinkCount,
      gazeDirection: gaze
    };
  };

  const updateFocusMetrics = (analysis) => {
    const newScore = Math.max(30, Math.min(100, analysis.attention + (Math.random() - 0.5) * 10));
    setFocusScore(Math.round(newScore));
    
    const attention = newScore > 80 ? 'High' : newScore > 60 ? 'Medium' : 'Low';
    setAttentionLevel(attention);
    
    const posture = analysis.headPose.pitch > -20 && analysis.headPose.pitch < 20 ? 'Good' : 'Needs Adjustment';
    setPostureStatus(posture);
    
    onFocusUpdate?.({ 
      score: newScore, 
      attention, 
      posture,
      eyeTracking,
      headPose,
      gazeDirection,
      faceDetected
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'Good' || status === 'High') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          AI Focus Monitor
        </h3>
        <div className={`px-2 py-1 rounded text-sm flex items-center ${
          isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {isTracking ? 'Active' : 'Inactive'}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-32 bg-gray-200 rounded-lg object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Status Overlay */}
            {!isTracking && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="text-white text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Camera Starting...</div>
                </div>
              </div>
            )}
            
            {/* Face Detection Overlay */}
            {faceDetected && isTracking && (
              <div className="absolute inset-0 border-2 border-green-400 rounded-lg pointer-events-none">
                <div className="absolute top-1 left-1 bg-green-400 text-white text-xs px-2 py-1 rounded">
                  Face Detected
                </div>
                
                {/* Eye indicators */}
                <div className="absolute top-6 left-1/4 flex space-x-4">
                  <div className={`w-2 h-2 rounded-full ${eyeTracking.leftEye ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className={`w-2 h-2 rounded-full ${eyeTracking.rightEye ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
                
                {/* Gaze direction indicator */}
                <div className="absolute bottom-1 right-1 bg-blue-400 text-white text-xs px-2 py-1 rounded">
                  {gazeDirection}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(focusScore)}`}>
              {focusScore}%
            </div>
            <div className="text-sm text-gray-600">Focus Score</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Attention:</span>
              <div className="flex items-center">
                {getStatusIcon(attentionLevel)}
                <span className="ml-1 text-sm">{attentionLevel}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Posture:</span>
              <div className="flex items-center">
                {getStatusIcon(postureStatus)}
                <span className="ml-1 text-sm">{postureStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Gaze:</span>
              <span className="text-sm font-medium">{gazeDirection}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      {faceDetected && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{blinkCount}</div>
              <div className="text-xs text-gray-600">Blinks</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{Math.abs(Math.round(headPose.yaw))}°</div>
              <div className="text-xs text-gray-600">Head Turn</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{Math.abs(Math.round(headPose.pitch))}°</div>
              <div className="text-xs text-gray-600">Head Tilt</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 bg-gray-50 rounded p-2">
        <div className="flex items-center text-xs text-gray-600">
          <Eye className="w-3 h-3 mr-1" />
          {faceDetected ? 
            'AI tracking your attention, eye movement, and head position' :
            'Position yourself in front of the camera for tracking'
          }
        </div>
      </div>
    </div>
  );
};

export default CameraMonitor;
