import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Code, Timer, Users, TrendingUp, Award, Brain, Zap,
  Play, Calendar, Target, Sparkles, Atom, Globe, Beaker, Gamepad2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [streakDays, setStreakDays] = useState(7);
  const [todayGoals, setTodayGoals] = useState({ completed: 3, total: 5 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [currentTime]);

  const subjects = [
    { 
      name: 'Python', 
      icon: Code, 
      progress: 75, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      route: '/course/python',
      lessons: 12,
      completed: 9
    },
    { 
      name: 'JavaScript', 
      icon: Code, 
      progress: 60, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      route: '/course/javascript',
      lessons: 15,
      completed: 9
    },
    { 
      name: 'Java', 
      icon: Code, 
      progress: 45, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      route: '/course/java',
      lessons: 18,
      completed: 8
    },
    { 
      name: 'C++', 
      icon: Code, 
      progress: 30, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      route: '/course/cpp',
      lessons: 20,
      completed: 6
    },
    { 
      name: 'HTML/CSS', 
      icon: Globe, 
      progress: 85, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      route: '/course/html-css',
      lessons: 10,
      completed: 8
    },
    { 
      name: 'SQL', 
      icon: BookOpen, 
      progress: 55, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      route: '/course/sql',
      lessons: 14,
      completed: 7
    }
  ];

  const quickActions = [
    { 
      name: 'Pomodoro Timer', 
      icon: Timer, 
      route: '/pomodoro',
      color: 'from-red-500 to-pink-500',
      description: 'Focus sessions with AI monitoring'
    },
    { 
      name: 'Team Study', 
      icon: Users, 
      route: '/team',
      color: 'from-blue-500 to-cyan-500',
      description: 'Collaborate with study groups'
    },
    { 
      name: 'Analytics', 
      icon: TrendingUp, 
      route: '/analytics',
      color: 'from-purple-500 to-indigo-500',
      description: 'Track your learning progress'
    },
    { 
      name: 'Mind Maps', 
      icon: Brain, 
      route: '/mindmap',
      color: 'from-green-500 to-teal-500',
      description: 'Visual concept mapping'
    },
    { 
      name: 'AR/VR Lab', 
      icon: Atom, 
      route: '/simulation',
      color: 'from-orange-500 to-red-500',
      description: '3D molecular simulations'
    },
    { 
      name: 'Coding Quests', 
      icon: Gamepad2, 
      route: '/quests',
      color: 'from-pink-500 to-purple-500',
      description: 'Gamified programming challenges'
    }
  ];

  const recentAchievements = [
    { title: 'Code Warrior', description: 'Completed 50 coding challenges', icon: '🏆', date: '2 days ago' },
    { title: 'Focus Master', description: '5 perfect Pomodoro sessions', icon: '🎯', date: '1 week ago' },
    { title: 'Team Player', description: 'Helped 10 teammates', icon: '🤝', date: '3 days ago' }
  ];

  const upcomingReviews = [
    { subject: 'JavaScript Closures', due: '2 hours', difficulty: 'Hard' },
    { subject: 'Python Decorators', due: '4 hours', difficulty: 'Medium' },
    { subject: 'SQL Joins', due: '1 day', difficulty: 'Easy' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {greeting}, Nishan! ✨
                </h1>
                <p className="text-xl text-gray-600 mb-4">Ready to continue your learning journey?</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 font-medium">{streakDays} day streak</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 font-medium">{todayGoals.completed}/{todayGoals.total} goals today</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="text-3xl font-bold text-gray-800">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-gray-600">
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div className="mt-4">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Level 15 Learner
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                to={action.route}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl mb-3 text-white`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{action.name}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Programming Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Code className="w-6 h-6 mr-3 text-blue-600" />
                  Programming Courses
                </h2>
                <Link 
                  to="/courses" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  View All
                  <Play className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject, index) => {
                  const IconComponent = subject.icon;
                  return (
                    <Link
                      key={index}
                      to={subject.route}
                      className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 ${subject.bgColor} rounded-xl`}>
                            <IconComponent className={`w-6 h-6 ${subject.textColor}`} />
                          </div>
                          <span className="text-2xl font-bold text-gray-800">{subject.progress}%</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {subject.completed}/{subject.lessons} lessons completed
                        </p>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className={`bg-gradient-to-r ${subject.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{subject.progress}% Complete</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Recent Achievements */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 rounded-xl">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm">{achievement.title}</h4>
                      <p className="text-gray-600 text-xs">{achievement.description}</p>
                      <span className="text-gray-500 text-xs">{achievement.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spaced Repetition */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                Review Schedule
              </h3>
              <div className="space-y-3">
                {upcomingReviews.map((review, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm">{review.subject}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 text-xs">Due in {review.due}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                      review.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {review.difficulty}
                    </span>
                  </div>
                ))}
              </div>
              <Link 
                to="/spaced-repetition" 
                className="block w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Start Review Session
              </Link>
            </div>

            {/* Today's Focus */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Today's Focus
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Study Sessions</span>
                  <span className="font-semibold text-gray-800">3/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Focus Time</span>
                  <span className="font-semibold text-gray-800">2.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Quizzes Completed</span>
                  <span className="font-semibold text-gray-800">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
