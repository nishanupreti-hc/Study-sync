import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Camera, Mic } from 'lucide-react';

const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
      setMicPermission(true);
    } catch (err) {
      console.error('Permission denied:', err);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setMinutes(25);
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-lg">
      <div className="flex-1">
        <div className="text-center mb-4">
          <div className="text-6xl font-mono font-bold text-blue-600">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={toggle} className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button onClick={reset} className="p-3 bg-gray-500 text-white rounded-full hover:bg-gray-600">
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
      
      <div className="w-48 h-36 bg-gray-100 rounded-lg overflow-hidden relative">
        {!cameraPermission ? (
          <div className="flex flex-col items-center justify-center h-full">
            <button 
              onClick={requestPermissions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Camera size={16} />
              <Mic size={16} />
              Enable Camera & Mic
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
