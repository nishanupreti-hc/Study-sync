import React from 'react';

const JavaCourse = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Java Course</h1>
          <p className="text-gray-600">Object-Oriented Programming Mastery</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600 mb-4">
            Our comprehensive Java course is under development. You'll learn:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Java fundamentals and syntax</li>
            <li>Object-oriented programming concepts</li>
            <li>Collections and data structures</li>
            <li>Exception handling</li>
            <li>File I/O and networking</li>
            <li>GUI development with Swing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JavaCourse;
