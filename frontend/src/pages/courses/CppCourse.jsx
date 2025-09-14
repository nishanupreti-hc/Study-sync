import React from 'react';

const CppCourse = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚙️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">C++ Course</h1>
          <p className="text-gray-600">Systems Programming & Performance</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600 mb-4">
            Master C++ programming with our comprehensive course covering:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>C++ fundamentals and syntax</li>
            <li>Memory management and pointers</li>
            <li>Object-oriented programming</li>
            <li>Templates and generic programming</li>
            <li>STL (Standard Template Library)</li>
            <li>Advanced topics and best practices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CppCourse;
