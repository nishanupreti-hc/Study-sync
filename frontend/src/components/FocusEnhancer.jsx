import React, { useState, useEffect } from 'react';
import { Brain, Wind, Eye, Zap, Play, Pause } from 'lucide-react';

const FocusEnhancer = ({ onFocusImprove }) => {
  const [activeExercise, setActiveExercise] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [focusScore, setFocusScore] = useState(75);
  const [isActive, setIsActive] = useState(false);

  const exercises = [
    {
      id: 'breathing',
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8',
      icon: Wind,
      duration: 60,
      color: 'blue'
    },
    {
      id: 'attention',
      name: 'Attention Training',
      description: 'Focus on a single point for 2 minutes',
      icon: Eye,
      duration: 120,
      color: 'green'
    },
    {
      id: 'mindfulness',
      name: 'Quick Mindfulness',
      description: '1-minute awareness exercise',
      icon: Brain,
      duration: 60,
      color: 'purple'
    }
  ];

  useEffect(() => {
    if (activeExercise?.id === 'breathing' && isActive) {
      const phases = ['inhale', 'hold', 'exhale', 'pause'];
      const durations = [4000, 7000, 8000, 1000];
      
      const cycleBreathing = () => {
        phases.forEach((phase, index) => {
          setTimeout(() => {
            setBreathingPhase(phase);
            if (phase === 'pause') {
              setBreathingCount(prev => prev + 1);
              if (breathingCount < 5) {
                setTimeout(cycleBreathing, 1000);
              } else {
                completeExercise();
              }
            }
          }, durations.slice(0, index).reduce((a, b) => a + b, 0));
        });
      };

      cycleBreathing();
    }
  }, [activeExercise, isActive, breathingCount]);

  const startExercise = (exercise) => {
    setActiveExercise(exercise);
    setIsActive(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  const stopExercise = () => {
    setActiveExercise(null);
    setIsActive(false);
    setBreathingCount(0);
  };

  const completeExercise = () => {
    const improvement = Math.random() * 15 + 5; // 5-20 point improvement
    setFocusScore(prev => Math.min(100, prev + improvement));
    onFocusImprove?.(improvement);
    stopExercise();
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      case 'pause': return 'Pause...';
      default: return 'Ready?';
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case 'inhale': return 'bg-blue-500';
      case 'hold': return 'bg-yellow-500';
      case 'exhale': return 'bg-green-500';
      case 'pause': return 'bg-gray-400';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Focus Enhancer
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{Math.round(focusScore)}%</div>
          <div className="text-sm text-gray-600">Focus Level</div>
        </div>
      </div>

      {!activeExercise ? (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            Take a quick break to enhance your focus and concentration
          </p>
          
          {exercises.map((exercise) => {
            const IconComponent = exercise.icon;
            return (
              <button
                key={exercise.id}
                onClick={() => startExercise(exercise)}
                className={`w-full p-4 rounded-lg border-2 border-${exercise.color}-200 hover:border-${exercise.color}-400 transition-all text-left`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-${exercise.color}-100 mr-3`}>
                    <IconComponent className={`w-5 h-5 text-${exercise.color}-600`} />
                  </div>
                  <div>
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-gray-600">{exercise.description}</div>
                    <div className="text-xs text-gray-500">{exercise.duration}s</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center">
          <h4 className="text-xl font-semibold mb-4">{activeExercise.name}</h4>
          
          {activeExercise.id === 'breathing' && (
            <div className="mb-6">
              <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-1000 ${getBreathingColor()}`}>
                <div className="text-white font-semibold">
                  {getBreathingInstruction()}
                </div>
              </div>
              <div className="text-lg font-medium mb-2">Cycle {breathingCount + 1} of 5</div>
              <div className="text-sm text-gray-600">
                Follow the circle and breathe with the rhythm
              </div>
            </div>
          )}

          {activeExercise.id === 'attention' && (
            <div className="mb-6">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="text-lg font-medium mb-2">Focus on the red dot</div>
              <div className="text-sm text-gray-600">
                Keep your attention on the dot without looking away
              </div>
            </div>
          )}

          {activeExercise.id === 'mindfulness' && (
            <div className="mb-6">
              <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <div className="text-lg font-medium mb-2">Be Present</div>
              <div className="text-sm text-gray-600">
                Notice your thoughts without judgment, then return focus to your breath
              </div>
            </div>
          )}

          <button
            onClick={stopExercise}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Stop Exercise
          </button>
        </div>
      )}

      {/* Focus Tips */}
      <div className="mt-6 pt-4 border-t">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-2">💡 Focus Tips:</div>
          <ul className="space-y-1 text-xs">
            <li>• Take breaks every 25-30 minutes</li>
            <li>• Keep your workspace clean and organized</li>
            <li>• Use natural lighting when possible</li>
            <li>• Stay hydrated throughout your study session</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FocusEnhancer;
