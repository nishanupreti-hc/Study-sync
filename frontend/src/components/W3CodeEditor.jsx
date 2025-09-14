import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const W3CodeEditor = ({ 
  language = 'javascript', 
  initialCode = '', 
  lesson = null,
  onComplete = null 
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const lessons = {
    javascript: [
      {
        title: "Variables and Data Types",
        description: "Learn how to declare variables and work with different data types",
        code: `// Declare variables
let name = "John";
let age = 25;
let isStudent = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Is Student:", isStudent);`,
        expected: "Name: John\nAge: 25\nIs Student: true"
      },
      {
        title: "Functions",
        description: "Create and call functions",
        code: `function greet(name) {
  return "Hello, " + name + "!";
}

let message = greet("World");
console.log(message);`,
        expected: "Hello, World!"
      }
    ],
    python: [
      {
        title: "Variables and Print",
        description: "Learn Python basics with variables and print statements",
        code: `# Python variables
name = "Alice"
age = 30
height = 5.6

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}")`,
        expected: "Name: Alice\nAge: 30\nHeight: 5.6"
      }
    ]
  };

  const currentLesson = lesson || lessons[language]?.[currentStep];

  useEffect(() => {
    if (currentLesson) {
      setCode(currentLesson.code);
    }
  }, [currentStep, currentLesson]);

  const runCode = () => {
    try {
      if (language === 'javascript') {
        // Capture console.log output
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        
        eval(code);
        console.log = originalLog;
        setOutput(logs.join('\n'));
      } else if (language === 'python') {
        // Simulate Python execution (in real app, use backend)
        setOutput('Python execution simulated - use backend for real execution');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const resetCode = () => {
    if (currentLesson) {
      setCode(currentLesson.code);
      setOutput('');
    }
  };

  const nextStep = () => {
    if (currentStep < lessons[language]?.length - 1) {
      setCurrentStep(currentStep + 1);
      setOutput('');
    } else {
      setIsCompleted(true);
      onComplete?.();
    }
  };

  const checkAnswer = () => {
    if (currentLesson && output.trim() === currentLesson.expected.trim()) {
      return true;
    }
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">
              {currentLesson?.title || `${language.toUpperCase()} Editor`}
            </h3>
          </div>
          <div className="text-sm">
            Step {currentStep + 1} of {lessons[language]?.length || 1}
          </div>
        </div>
        {currentLesson?.description && (
          <p className="text-blue-100 text-sm mt-2">{currentLesson.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-96">
        {/* Code Editor */}
        <div className="border-r">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Code Editor</span>
            <div className="flex space-x-2">
              <button
                onClick={resetCode}
                className="p-1 hover:bg-gray-200 rounded"
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={runCode}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Run
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
            style={{ minHeight: '300px' }}
            placeholder="Write your code here..."
          />
        </div>

        {/* Output */}
        <div>
          <div className="bg-gray-100 px-4 py-2 border-b">
            <span className="text-sm font-medium">Output</span>
          </div>
          <div className="p-4 h-full bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
            <pre className="whitespace-pre-wrap">{output || 'Click "Run" to see output'}</pre>
          </div>
        </div>
      </div>

      {/* Progress and Navigation */}
      {currentLesson && (
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {checkAnswer() && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Correct!</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(((currentStep + 1) / lessons[language]?.length) * 100)}%
              </div>
              <button
                onClick={nextStep}
                disabled={!checkAnswer() && !isCompleted}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCompleted ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / lessons[language]?.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default W3CodeEditor;
