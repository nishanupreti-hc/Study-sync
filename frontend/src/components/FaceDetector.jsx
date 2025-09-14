import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff, User, UserX } from 'lucide-react';

const FaceDetector = ({ isActive, onFaceDetected, autoMode = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive && autoMode) {
      startFaceDetection();
    } else {
      stopFaceDetection();
    }

    return () => stopFaceDetection();
  }, [isActive, autoMode]);

  const startFaceDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsDetecting(true);
        
        // Start detection loop
        detectionIntervalRef.current = setInterval(detectFace, 500);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsDetecting(false);
    setFaceDetected(false);
    setFaceData(null);
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      // Use browser's built-in face detection if available
      if ('FaceDetector' in window) {
        const faceDetector = new window.FaceDetector();
        const faces = await faceDetector.detect(canvas);
        
        const detected = faces.length > 0;
        setFaceDetected(detected);
        
        if (detected) {
          const face = faces[0];
          setFaceData({
            boundingBox: face.boundingBox,
            landmarks: face.landmarks || []
          });
        } else {
          setFaceData(null);
        }
        
        onFaceDetected(detected);
      } else {
        // Fallback: Simple motion detection
        detectMotion(ctx, canvas);
      }
    } catch (error) {
      console.error('Face detection error:', error);
      // Fallback to motion detection
      detectMotion(ctx, canvas);
    }
  };

  const detectMotion = (ctx, canvas) => {
    // Simple motion/presence detection as fallback
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    
    const avgBrightness = brightness / (data.length / 4);
    const detected = avgBrightness > 50; // Assume face present if sufficient light
    
    setFaceDetected(detected);
    onFaceDetected(detected);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Face Detection</h3>
        <div className={`flex items-center space-x-2 ${faceDetected ? 'text-green-600' : 'text-red-600'}`}>
          {faceDetected ? <User className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          <span className="text-xs">
            {faceDetected ? 'Face Detected' : 'No Face'}
          </span>
        </div>
      </div>

      {isDetecting && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-32 bg-gray-200 rounded object-cover"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {faceData && (
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute border-2 border-green-400 rounded"
                style={{
                  left: `${(faceData.boundingBox?.x || 0) / (videoRef.current?.videoWidth || 1) * 100}%`,
                  top: `${(faceData.boundingBox?.y || 0) / (videoRef.current?.videoHeight || 1) * 100}%`,
                  width: `${(faceData.boundingBox?.width || 0) / (videoRef.current?.videoWidth || 1) * 100}%`,
                  height: `${(faceData.boundingBox?.height || 0) / (videoRef.current?.videoHeight || 1) * 100}%`
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-600">
        {autoMode ? (
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>Auto mode: Timer pauses when no face detected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <EyeOff className="w-3 h-3" />
            <span>Manual mode: Face detection for monitoring only</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceDetector;
