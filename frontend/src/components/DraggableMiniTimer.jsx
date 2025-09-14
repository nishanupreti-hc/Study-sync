import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Settings, UserCheck, UserX } from 'lucide-react';

const DraggableMiniTimer = ({ 
  timeLeft, 
  isActive, 
  sessionType, 
  onToggle, 
  onReset, 
  onMaximize, 
  onSettings,
  faceDetected = true,
  autoFaceControl = false
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    
    setIsDragging(true);
    const rect = timerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 180, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return 'border-red-500 bg-red-50';
      case 'shortBreak': return 'border-green-500 bg-green-50';
      case 'longBreak': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div
      ref={timerRef}
      className={`fixed bg-white rounded-lg shadow-lg border-2 ${getSessionColor()} cursor-move z-50 select-none`}
      style={{ 
        left: position.x, 
        top: position.y,
        width: '180px'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold text-gray-800">
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center space-x-1">
            {autoFaceControl && (
              faceDetected ? 
                <UserCheck className="w-3 h-3 text-green-600" /> : 
                <UserX className="w-3 h-3 text-red-600" />
            )}
            <div className="text-xs text-gray-500 capitalize">
              {sessionType === 'shortBreak' ? 'Short Break' : 
               sessionType === 'longBreak' ? 'Long Break' : sessionType}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={onToggle}
              className={`p-1.5 rounded text-white no-drag ${
                isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            
            <button
              onClick={onReset}
              className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 no-drag"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={onSettings}
              className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 no-drag"
            >
              <Settings className="w-3 h-3" />
            </button>
            
            <button
              onClick={onMaximize}
              className="p-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 no-drag"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableMiniTimer;
