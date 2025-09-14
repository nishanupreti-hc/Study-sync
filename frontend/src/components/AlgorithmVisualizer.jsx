import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Zap } from 'lucide-react';

const AlgorithmVisualizer = ({ algorithm = 'bubbleSort' }) => {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sorted, setSorted] = useState([]);

  const algorithms = {
    bubbleSort: {
      name: 'Bubble Sort',
      description: 'Compares adjacent elements and swaps them if they are in wrong order',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    quickSort: {
      name: 'Quick Sort',
      description: 'Divides array into partitions around a pivot element',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)'
    },
    mergeSort: {
      name: 'Merge Sort',
      description: 'Divides array into halves and merges them in sorted order',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)'
    },
    binarySearch: {
      name: 'Binary Search',
      description: 'Searches for element by repeatedly dividing search interval in half',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)'
    }
  };

  useEffect(() => {
    generateSteps();
  }, [array, algorithm]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < steps.length) {
      interval = setInterval(() => {
        executeStep(steps[currentStep]);
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps, speed]);

  const generateSteps = () => {
    const arr = [...array];
    const newSteps = [];
    
    switch (algorithm) {
      case 'bubbleSort':
        generateBubbleSortSteps(arr, newSteps);
        break;
      case 'quickSort':
        generateQuickSortSteps(arr, newSteps, 0, arr.length - 1);
        break;
      case 'mergeSort':
        generateMergeSortSteps(arr, newSteps, 0, arr.length - 1);
        break;
      case 'binarySearch':
        generateBinarySearchSteps(arr.sort((a, b) => a - b), newSteps, 25);
        break;
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    resetVisualization();
  };

  const generateBubbleSortSteps = (arr, steps) => {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          type: 'compare',
          indices: [j, j + 1],
          array: [...arr],
          description: `Comparing ${arr[j]} and ${arr[j + 1]}`
        });
        
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            type: 'swap',
            indices: [j, j + 1],
            array: [...arr],
            description: `Swapped ${arr[j + 1]} and ${arr[j]}`
          });
        }
      }
      steps.push({
        type: 'sorted',
        indices: [n - i - 1],
        array: [...arr],
        description: `Element ${arr[n - i - 1]} is in correct position`
      });
    }
  };

  const generateQuickSortSteps = (arr, steps, low, high) => {
    if (low < high) {
      const pi = partition(arr, steps, low, high);
      generateQuickSortSteps(arr, steps, low, pi - 1);
      generateQuickSortSteps(arr, steps, pi + 1, high);
    }
  };

  const partition = (arr, steps, low, high) => {
    const pivot = arr[high];
    let i = low - 1;
    
    steps.push({
      type: 'pivot',
      indices: [high],
      array: [...arr],
      description: `Pivot selected: ${pivot}`
    });
    
    for (let j = low; j < high; j++) {
      steps.push({
        type: 'compare',
        indices: [j, high],
        array: [...arr],
        description: `Comparing ${arr[j]} with pivot ${pivot}`
      });
      
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          type: 'swap',
          indices: [i, j],
          array: [...arr],
          description: `Swapped ${arr[j]} and ${arr[i]}`
        });
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      type: 'swap',
      indices: [i + 1, high],
      array: [...arr],
      description: `Placed pivot in correct position`
    });
    
    return i + 1;
  };

  const generateMergeSortSteps = (arr, steps, left, right) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      generateMergeSortSteps(arr, steps, left, mid);
      generateMergeSortSteps(arr, steps, mid + 1, right);
      merge(arr, steps, left, mid, right);
    }
  };

  const merge = (arr, steps, left, mid, right) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        type: 'compare',
        indices: [left + i, mid + 1 + j],
        array: [...arr],
        description: `Comparing ${leftArr[i]} and ${rightArr[j]}`
      });
      
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      
      steps.push({
        type: 'merge',
        indices: [k],
        array: [...arr],
        description: `Placed ${arr[k]} in merged array`
      });
      k++;
    }
    
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      steps.push({
        type: 'merge',
        indices: [k],
        array: [...arr],
        description: `Placed remaining ${arr[k]}`
      });
      i++;
      k++;
    }
    
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      steps.push({
        type: 'merge',
        indices: [k],
        array: [...arr],
        description: `Placed remaining ${arr[k]}`
      });
      j++;
      k++;
    }
  };

  const generateBinarySearchSteps = (arr, steps, target) => {
    let left = 0, right = arr.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      steps.push({
        type: 'search',
        indices: [left, mid, right],
        array: [...arr],
        description: `Searching in range [${left}, ${right}], checking middle element ${arr[mid]}`
      });
      
      if (arr[mid] === target) {
        steps.push({
          type: 'found',
          indices: [mid],
          array: [...arr],
          description: `Found target ${target} at index ${mid}!`
        });
        break;
      } else if (arr[mid] < target) {
        left = mid + 1;
        steps.push({
          type: 'eliminate',
          indices: Array.from({length: mid + 1}, (_, i) => i),
          array: [...arr],
          description: `${arr[mid]} < ${target}, search right half`
        });
      } else {
        right = mid - 1;
        steps.push({
          type: 'eliminate',
          indices: Array.from({length: arr.length - mid}, (_, i) => mid + i),
          array: [...arr],
          description: `${arr[mid]} > ${target}, search left half`
        });
      }
    }
  };

  const executeStep = (step) => {
    resetVisualization();
    
    switch (step.type) {
      case 'compare':
        setComparing(step.indices);
        break;
      case 'swap':
        setSwapping(step.indices);
        break;
      case 'sorted':
        setSorted(prev => [...prev, ...step.indices]);
        break;
      case 'pivot':
        setComparing(step.indices);
        break;
      case 'merge':
        setSwapping(step.indices);
        break;
      case 'search':
        setComparing(step.indices);
        break;
      case 'found':
        setSorted(step.indices);
        break;
      case 'eliminate':
        // Visual indication of eliminated elements
        break;
    }
    
    setArray(step.array);
  };

  const resetVisualization = () => {
    setComparing([]);
    setSwapping([]);
    setSorted([]);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setArray([64, 34, 25, 12, 22, 11, 90]);
    resetVisualization();
  };

  const getBarColor = (index) => {
    if (sorted.includes(index)) return 'bg-green-500';
    if (swapping.includes(index)) return 'bg-red-500';
    if (comparing.includes(index)) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const maxValue = Math.max(...array);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Zap className="w-6 h-6 mr-2" />
              {algorithms[algorithm].name}
            </h3>
            <p className="text-indigo-100 mt-1">{algorithms[algorithm].description}</p>
          </div>
          <div className="text-right text-white">
            <div className="text-sm opacity-75">Time: {algorithms[algorithm].timeComplexity}</div>
            <div className="text-sm opacity-75">Space: {algorithms[algorithm].spaceComplexity}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={reset}
            className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-white text-sm">Speed:</label>
            <input
              type="range"
              min="100"
              max="1000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Array Visualization */}
        <div className="flex items-end justify-center space-x-2 mb-6 h-64">
          {array.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-12 transition-all duration-300 ${getBarColor(index)} rounded-t-lg flex items-end justify-center text-white font-semibold text-sm`}
                style={{ height: `${(value / maxValue) * 200}px` }}
              >
                {value}
              </div>
              <div className="text-xs text-gray-600 mt-1">{index}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">Default</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Comparing</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Swapping</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Sorted</span>
          </div>
        </div>

        {/* Step Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep >= steps.length - 1}
                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-700">
            {steps[currentStep]?.description || 'Click Play to start the algorithm visualization'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;
