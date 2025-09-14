import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Clock, 
  Users, 
  BarChart3, 
  Code, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Trophy,
  Settings,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, currentUser }) => {
  const location = useLocation();
  const [coursesExpanded, setCoursesExpanded] = useState(true);
  const { logout } = useAuth();

  const programmingCourses = [
    { name: 'Python', path: '/course/python', icon: '🐍', color: 'text-yellow-600' },
    { name: 'JavaScript', path: '/course/javascript', icon: '⚡', color: 'text-yellow-500' },
    { name: 'Java', path: '/course/java', icon: '☕', color: 'text-red-600' },
    { name: 'C++', path: '/course/cpp', icon: '⚙️', color: 'text-blue-600' },
    { name: 'HTML/CSS', path: '/course/html-css', icon: '🎨', color: 'text-orange-500' },
    { name: 'SQL', path: '/course/sql', icon: '🗄️', color: 'text-green-600' }
  ];

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Pomodoro Timer', path: '/pomodoro', icon: Clock },
    { name: 'Team Study', path: '/team', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-800">AI Programming Mentor</h1>
                <p className="text-xs text-gray-500">Complete Learning Platform</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Profile */}
      {isOpen && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{currentUser.name}</p>
              <div className="flex items-center space-x-2">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-500">Level {currentUser.level}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>XP Progress</span>
              <span>{currentUser.xp}/3000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentUser.xp / 3000) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  } ${!isOpen && 'justify-center'}`}
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Programming Courses Section */}
          <div className="mt-6">
            <button
              onClick={() => setCoursesExpanded(!coursesExpanded)}
              className={`flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg w-full transition-colors ${
                !isOpen && 'justify-center'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              {isOpen && (
                <>
                  <span className="font-medium flex-1 text-left">Programming Courses</span>
                  {coursesExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>

            {(coursesExpanded || !isOpen) && (
              <div className={`mt-2 space-y-1 ${isOpen ? 'ml-4' : ''}`}>
                {programmingCourses.map((course) => (
                  <Link
                    key={course.path}
                    to={course.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(course.path)
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    } ${!isOpen && 'justify-center'}`}
                  >
                    <span className="text-lg">{course.icon}</span>
                    {isOpen && (
                      <div className="flex-1">
                        <span className={`font-medium ${course.color}`}>{course.name}</span>
                        <div className="text-xs text-gray-500">Interactive Course</div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
