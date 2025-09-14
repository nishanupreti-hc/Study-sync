import React from 'react';

const HTMLCSSCourse = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">HTML/CSS Course</h1>
          <p className="text-gray-600">Web Design & Frontend Development</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600 mb-4">
            Learn to create beautiful websites with our HTML/CSS course:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>HTML structure and semantic elements</li>
            <li>CSS styling and layout techniques</li>
            <li>Responsive web design</li>
            <li>Flexbox and CSS Grid</li>
            <li>Animations and transitions</li>
            <li>Modern CSS features and best practices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTMLCSSCourse;
