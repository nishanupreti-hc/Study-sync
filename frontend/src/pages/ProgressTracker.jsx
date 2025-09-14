import React from 'react';

const ProgressTracker = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Progress Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your learning progress and analytics will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;
