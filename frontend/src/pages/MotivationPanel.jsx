import React from 'react';

const MotivationPanel = () => {
  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Daily Motivation</h1>
        <p className="text-lg opacity-90">
          {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Today's Goals</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Complete Physics Chapter 5</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Take Chemistry Quiz</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Review Yesterday's Notes</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏆</span>
              <span className="text-gray-700 dark:text-gray-300">Week Warrior</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <span className="text-gray-700 dark:text-gray-300">Quiz Master</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <span className="text-gray-700 dark:text-gray-300">Study Streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationPanel;
