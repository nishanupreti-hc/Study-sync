import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Activity, Clock, Target, Award } from 'lucide-react';

const AnalyticsDashboard = ({ userId = 'user_123' }) => {
  const [analyticsData, setAnalyticsData] = useState({
    focusHistory: [],
    movementHistory: [],
    sessionStats: {},
    weeklyProgress: [],
    achievements: []
  });

  useEffect(() => {
    // Simulate loading analytics data
    loadAnalyticsData();
  }, [userId]);

  const loadAnalyticsData = () => {
    // Generate sample data for demonstration
    const focusHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      focus: Math.floor(Math.random() * 40) + 60,
      attention: Math.floor(Math.random() * 30) + 70,
      movement: Math.floor(Math.random() * 20) + 5
    }));

    const movementHistory = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      movement: Math.floor(Math.random() * 15) + 2,
      sessions: Math.floor(Math.random() * 3)
    }));

    const weeklyProgress = [
      { day: 'Mon', focus: 85, movement: 8, sessions: 6 },
      { day: 'Tue', focus: 78, movement: 12, sessions: 5 },
      { day: 'Wed', focus: 92, movement: 6, sessions: 8 },
      { day: 'Thu', focus: 88, movement: 9, sessions: 7 },
      { day: 'Fri', focus: 82, movement: 11, sessions: 6 },
      { day: 'Sat', focus: 90, movement: 7, sessions: 4 },
      { day: 'Sun', focus: 87, movement: 8, sessions: 5 }
    ];

    const achievements = [
      { id: 1, title: 'Focus Master', description: 'Maintained 90%+ focus for 5 sessions', earned: true, date: '2024-01-15' },
      { id: 2, title: 'Steady Learner', description: '7-day study streak', earned: true, date: '2024-01-20' },
      { id: 3, title: 'Movement Optimizer', description: 'Optimal movement levels for a week', earned: false },
      { id: 4, title: 'Early Bird', description: 'Complete 10 morning sessions', earned: true, date: '2024-01-18' }
    ];

    setAnalyticsData({
      focusHistory,
      movementHistory,
      sessionStats: {
        totalSessions: 156,
        averageFocus: 84,
        totalHours: 78.5,
        streakDays: 12,
        bestFocusScore: 98,
        averageMovement: 8.2
      },
      weeklyProgress,
      achievements
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const focusDistribution = [
    { name: 'Excellent (90-100%)', value: 35, color: '#10B981' },
    { name: 'Good (80-89%)', value: 40, color: '#3B82F6' },
    { name: 'Fair (70-79%)', value: 20, color: '#F59E0B' },
    { name: 'Needs Work (<70%)', value: 5, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.sessionStats.totalSessions}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 text-sm text-green-600">
            +12% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Focus</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.sessionStats.averageFocus}%</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2 text-sm text-green-600">
            +5% improvement
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Study Hours</p>
              <p className="text-2xl font-bold text-purple-600">{analyticsData.sessionStats.totalHours}h</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-2 text-sm text-green-600">
            Target: 80h/month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">{analyticsData.sessionStats.streakDays}</p>
            </div>
            <Award className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2 text-sm text-green-600">
            Personal best: 18 days
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Focus Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.focusHistory.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="focus" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="attention" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Focus Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Focus Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={focusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {focusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Progress and Movement Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="focus" fill="#3B82F6" name="Focus Score" />
              <Bar dataKey="sessions" fill="#10B981" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Movement Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Daily Movement Pattern
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.movementHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="movement" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.earned
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Award className={`w-6 h-6 ${achievement.earned ? 'text-yellow-500' : 'text-gray-400'}`} />
                {achievement.earned && (
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Earned
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
              <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
              {achievement.earned && achievement.date && (
                <p className="text-xs text-yellow-600">Earned: {achievement.date}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-800 mb-2">✅ What's Working Well</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Consistent morning study sessions</li>
              <li>• Excellent focus scores on weekdays</li>
              <li>• Good posture maintenance during long sessions</li>
              <li>• Regular break intervals</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">💡 Areas for Improvement</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Try shorter sessions on weekends</li>
              <li>• Reduce movement during afternoon sessions</li>
              <li>• Consider using focus enhancement exercises</li>
              <li>• Maintain consistent sleep schedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
