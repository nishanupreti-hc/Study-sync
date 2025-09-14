import React from 'react';

const SQLCourse = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗄️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SQL Course</h1>
          <p className="text-gray-600">Database Management & Queries</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600 mb-4">
            Master database management with our comprehensive SQL course:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>SQL fundamentals and syntax</li>
            <li>Database design and normalization</li>
            <li>Complex queries and joins</li>
            <li>Stored procedures and functions</li>
            <li>Database optimization</li>
            <li>Advanced SQL features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SQLCourse;
