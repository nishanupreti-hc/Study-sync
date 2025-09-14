import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const MiniPomodoroWidget = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('work');

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Auto switch session type
      setSessionType(prev => prev === 'work' ? 'break' : 'work');
      setTimeLeft(sessionType === 'work' ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType]);



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionType === 'work' ? 25 * 60 : 5 * 60) - timeLeft) / (sessionType === 'work' ? 25 * 60 : 5 * 60) * 100;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-3 w-48 z-50">
      {/* Timer */}
      <div className="text-center mb-2">
        <div className={`text-lg font-bold ${sessionType === 'work' ? 'text-red-600' : 'text-green-600'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-gray-500 capitalize">{sessionType}</div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className={`h-1 rounded-full ${sessionType === 'work' ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`p-1 rounded ${isActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button
          onClick={() => {
            setIsActive(false);
            setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
          }}
          className="p-1 bg-gray-500 text-white rounded"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default MiniPomodoroWidget;
