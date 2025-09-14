import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Mic, MicOff, Upload, Code, BookOpen, Lightbulb, Target } from 'lucide-react';

const StudyPage = () => {
  const { subject } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const subjectInfo = {
    python: { name: 'Python', icon: '🐍', color: 'from-yellow-400 to-yellow-600' },
    javascript: { name: 'JavaScript', icon: '⚡', color: 'from-yellow-400 to-yellow-600' },
    java: { name: 'Java', icon: '☕', color: 'from-red-500 to-red-600' },
    cpp: { name: 'C++', icon: '⚙️', color: 'from-blue-500 to-blue-600' },
    'html-css': { name: 'HTML/CSS', icon: '🎨', color: 'from-orange-400 to-orange-500' },
    sql: { name: 'SQL', icon: '🗄️', color: 'from-green-500 to-green-600' }
  };

  const currentSubject = subjectInfo[subject] || { name: subject, icon: '📚', color: 'from-blue-500 to-purple-600' };

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: `Hello! I'm your ${currentSubject.name} programming tutor. I'm here to help you learn and master ${currentSubject.name}. What would you like to learn today?`,
        timestamp: new Date(),
        suggestions: ['Show me basics', 'Help with code', 'Give me a quiz', 'Suggest a project']
      }
    ]);
  }, [subject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(messageText, currentSubject.name);
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (message, subject) => {
    const responses = {
      'show me basics': {
        content: `Great! Let's start with ${subject} basics. Here are the fundamental concepts you should know:\n\n• Variables and data types\n• Control structures (if/else, loops)\n• Functions and methods\n• Basic syntax and conventions\n\nWould you like me to explain any of these topics in detail?`,
        suggestions: ['Explain variables', 'Show me functions', 'Control structures', 'Give examples']
      },
      'help with code': {
        content: `I'd be happy to help you with your code! You can:\n\n• Share your code and I'll review it\n• Ask about specific errors or bugs\n• Get suggestions for optimization\n• Learn best practices\n\nWhat specific coding help do you need?`,
        suggestions: ['Debug my code', 'Code review', 'Best practices', 'Optimization tips']
      },
      'give me a quiz': {
        content: `🧠 **${subject} Quiz Question:**\n\nWhat is the primary purpose of variables in programming?\n\nA) To make code look complex\nB) To store and manipulate data\nC) To slow down execution\nD) To confuse other programmers`,
        suggestions: ['Answer B', 'Answer A', 'Answer C', 'Answer D']
      },
      'suggest a project': {
        content: `🚀 **Project Idea for ${subject}:**\n\n**Calculator App**\nBuild a simple calculator that can perform basic arithmetic operations.\n\n**What you'll learn:**\n• User input handling\n• Mathematical operations\n• Function creation\n• Error handling\n\nWould you like me to guide you through building this project step by step?`,
        suggestions: ['Start project', 'Different project', 'Show me steps', 'Help me plan']
      }
    };

    const defaultResponse = {
      content: `I understand you're asking about: "${message}"\n\nLet me help you with this ${subject} topic. I can:\n\n• Provide detailed explanations\n• Show you code examples\n• Create practice exercises\n• Suggest related topics\n\nWhat would be most helpful for you?`,
      suggestions: ['Explain in detail', 'Show examples', 'Give me practice', 'Related topics']
    };

    const response = responses[message.toLowerCase()] || defaultResponse;

    return {
      id: Date.now() + 1,
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentSubject.color} text-white p-6 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="text-4xl">{currentSubject.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{currentSubject.name} Study Session</h1>
            <p className="opacity-90">Interactive AI Programming Tutor</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-md border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
                
                {message.suggestions && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="flex space-x-2 mb-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Code className="w-4 h-4" />
              <span className="text-sm">Code Help</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Explain Topic</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Target className="w-4 h-4" />
              <span className="text-sm">Quiz Me</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm">Project Ideas</span>
            </button>
          </div>

          {/* Message Input */}
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything about ${currentSubject.name}...`}
                className="w-full p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button className="p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors">
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
