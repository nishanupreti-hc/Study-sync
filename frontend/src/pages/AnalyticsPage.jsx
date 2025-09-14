import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Trophy, Calendar, Eye, Brain } from 'lucide-react';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('week');

  const stats = {
    studyHours: 45.5,
    questionsAnswered: 234,
    averageQuizScore: 87,
    streakDays: 12,
    focusScore: 85,
    completedLessons: 28,
    totalLessons: 45,
    pomodoroSessions: 67
  };

  const subjectProgress = [
    { name: 'Python', progress: 85, hours: 15.2, color: 'bg-yellow-500' },
    { name: 'JavaScript', progress: 72, hours: 12.8, color: 'bg-yellow-400' },
    { name: 'Java', progress: 45, hours: 8.5, color: 'bg-red-500' },
    { name: 'C++', progress: 30, hours: 6.2, color: 'bg-blue-500' },
    { name: 'HTML/CSS', progress: 90, hours: 3.1, color: 'bg-orange-500' }
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 2.5, focus: 85 },
    { day: 'Tue', hours: 3.2, focus: 78 },
    { day: 'Wed', hours: 1.8, focus: 92 },
    { day: 'Thu', hours: 4.1, focus: 88 },
    { day: 'Fri', hours: 2.9, focus: 75 },
    { day: 'Sat', hours: 3.5, focus: 90 },
    { day: 'Sun', hours: 2.1, focus: 82 }
  ];

  const achievements = [
    { name: 'First Steps', description: 'Completed your first lesson', icon: '🎯', earned: true },
    { name: 'Code Master', description: 'Solved 50 coding problems', icon: '💻', earned: true },
    { name: 'Quiz Champion', description: 'Scored 90%+ on 10 quizzes', icon: '🏆', earned: true },
    { name: 'Focus Master', description: 'Maintained 90%+ focus for 1 hour', icon: '🧠', earned: false },
    { name: 'Team Player', description: 'Joined your first study team', icon: '👥', earned: true },
    { name: 'Streak Legend', description: 'Study for 30 days straight', icon: '🔥', earned: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Analytics</h1>
            <p className="text-gray-600">Track your progress and optimize your learning</p>
          </div>
          
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.studyHours}h</h3>
            <p className="text-gray-600">Study Hours</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.averageQuizScore}%</h3>
            <p className="text-gray-600">Avg Quiz Score</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+2 days</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.streakDays}</h3>
            <p className="text-gray-600">Day Streak</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+5%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.focusScore}%</h3>
            <p className="text-gray-600">Focus Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Subject Progress</h2>
            <div className="space-y-4">
              {subjectProgress.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{subject.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-800">{subject.progress}%</span>
                      <span className="text-xs text-gray-500 ml-2">{subject.hours}h</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${subject.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Activity</h2>
            <div className="space-y-4">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(day.hours / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{day.hours}h</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${
                      day.focus >= 85 ? 'text-green-600' : 
                      day.focus >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {day.focus}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${
                      achievement.earned ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {achievement.name}
                    </h3>
                    {achievement.earned && (
                      <span className="text-xs text-green-600 font-medium">EARNED</span>
                    )}
                  </div>
                </div>
                <p className={`text-sm ${
                  achievement.earned ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Learning Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Best Study Time</h3>
              <p className="text-blue-700">You're most focused between 2-4 PM</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Strongest Subject</h3>
              <p className="text-green-700">HTML/CSS - 90% completion rate</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Improvement Area</h3>
              <p className="text-orange-700">Focus on C++ fundamentals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
