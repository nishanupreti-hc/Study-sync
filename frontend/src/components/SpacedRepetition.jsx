import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Clock, TrendingUp, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const SpacedRepetition = ({ subject = 'JavaScript' }) => {
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [studyMode, setStudyMode] = useState('review'); // review, new, mixed

  const sampleCards = {
    JavaScript: [
      {
        id: 1,
        question: "What is the difference between let and var?",
        answer: "let has block scope and cannot be redeclared, while var has function scope and can be redeclared. let also has temporal dead zone.",
        difficulty: 2,
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 2,
        category: 'Variables'
      },
      {
        id: 2,
        question: "Explain JavaScript closures",
        answer: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. It 'closes over' these variables.",
        difficulty: 3,
        lastReviewed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        interval: 3,
        easeFactor: 2.3,
        repetitions: 1,
        category: 'Functions'
      },
      {
        id: 3,
        question: "What is the event loop in JavaScript?",
        answer: "The event loop is a mechanism that handles asynchronous operations by continuously checking the call stack and callback queue, moving callbacks to the stack when it's empty.",
        difficulty: 4,
        lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.1,
        repetitions: 0,
        category: 'Async'
      },
      {
        id: 4,
        question: "What are JavaScript Promises?",
        answer: "Promises are objects representing the eventual completion or failure of an asynchronous operation. They have three states: pending, fulfilled, and rejected.",
        difficulty: 3,
        lastReviewed: null,
        nextReview: new Date(),
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        category: 'Async'
      }
    ],
    Python: [
      {
        id: 5,
        question: "What is a Python decorator?",
        answer: "A decorator is a function that takes another function and extends its behavior without explicitly modifying it. It uses the @decorator syntax.",
        difficulty: 3,
        lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextReview: new Date(),
        interval: 2,
        easeFactor: 2.4,
        repetitions: 1,
        category: 'Functions'
      }
    ]
  };

  useEffect(() => {
    loadCards();
  }, [subject, studyMode]);

  const loadCards = () => {
    const subjectCards = sampleCards[subject] || [];
    let filteredCards = [];

    switch (studyMode) {
      case 'review':
        filteredCards = subjectCards.filter(card => 
          card.nextReview <= new Date() && card.repetitions > 0
        );
        break;
      case 'new':
        filteredCards = subjectCards.filter(card => card.repetitions === 0);
        break;
      case 'mixed':
        filteredCards = subjectCards;
        break;
    }

    // Sort by priority (overdue cards first, then by difficulty)
    filteredCards.sort((a, b) => {
      const aOverdue = new Date() - new Date(a.nextReview);
      const bOverdue = new Date() - new Date(b.nextReview);
      
      if (aOverdue > 0 && bOverdue <= 0) return -1;
      if (bOverdue > 0 && aOverdue <= 0) return 1;
      
      return b.difficulty - a.difficulty;
    });

    setCards(filteredCards);
    setCurrentCard(filteredCards[0] || null);
    setShowAnswer(false);
  };

  const calculateNextReview = (card, quality) => {
    // SM-2 Algorithm implementation
    let { interval, easeFactor, repetitions } = card;
    
    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }
    
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return {
      interval,
      easeFactor: Math.round(easeFactor * 100) / 100,
      repetitions,
      nextReview,
      lastReviewed: new Date()
    };
  };

  const handleAnswer = (quality) => {
    if (!currentCard) return;
    
    const updatedCard = {
      ...currentCard,
      ...calculateNextReview(currentCard, quality)
    };
    
    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
      total: prev.total + 1
    }));
    
    // Move to next card
    const currentIndex = cards.findIndex(card => card.id === currentCard.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < cards.length) {
      setCurrentCard(cards[nextIndex]);
      setShowAnswer(false);
    } else {
      setCurrentCard(null); // Session complete
    }
    
    // In a real app, you would save the updated card to the backend
    console.log('Updated card:', updatedCard);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-orange-600 bg-orange-100';
      case 5: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverdueStatus = (nextReview) => {
    const now = new Date();
    const reviewDate = new Date(nextReview);
    const diffDays = Math.ceil((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { status: 'overdue', days: diffDays, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { status: 'due', days: 0, color: 'text-yellow-600' };
    } else {
      return { status: 'future', days: Math.abs(diffDays), color: 'text-green-600' };
    }
  };

  if (!currentCard) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h3>
        <p className="text-gray-600 mb-6">Great job on your spaced repetition session.</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
            <div className="text-sm text-green-700">Correct</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
            <div className="text-sm text-red-700">Incorrect</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-700">Accuracy</div>
          </div>
        </div>
        
        <button
          onClick={loadCards}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Session
        </button>
      </div>
    );
  }

  const overdueStatus = getOverdueStatus(currentCard.nextReview);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              Spaced Repetition - {subject}
            </h3>
            <p className="text-indigo-100">Intelligent review scheduling for long-term retention</p>
          </div>
          <div className="text-right text-white">
            <div className="text-sm opacity-75">Session Progress</div>
            <div className="text-lg font-semibold">
              {sessionStats.total + 1} / {cards.length}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          {['review', 'new', 'mixed'].map(mode => (
            <button
              key={mode}
              onClick={() => setStudyMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                studyMode === mode 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Card Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
              Difficulty {currentCard.difficulty}/5
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {currentCard.category}
            </span>
            <span className={`text-sm font-medium ${overdueStatus.color}`}>
              {overdueStatus.status === 'overdue' && `${overdueStatus.days} days overdue`}
              {overdueStatus.status === 'due' && 'Due today'}
              {overdueStatus.status === 'future' && `Due in ${overdueStatus.days} days`}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Repetitions: {currentCard.repetitions} | Ease: {currentCard.easeFactor}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 min-h-[200px]">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              Q
            </div>
            <h4 className="text-lg font-semibold ml-3">Question</h4>
          </div>
          <p className="text-gray-800 text-lg leading-relaxed">{currentCard.question}</p>
        </div>

        {/* Answer Section */}
        {!showAnswer ? (
          <div className="text-center">
            <button
              onClick={() => setShowAnswer(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Show Answer
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  A
                </div>
                <h4 className="text-lg font-semibold ml-3">Answer</h4>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">{currentCard.answer}</p>
            </div>

            {/* Quality Buttons */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-center">How well did you know this?</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleAnswer(1)}
                  className="flex flex-col items-center p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-red-600 mb-2" />
                  <span className="text-sm font-medium text-red-700">Again</span>
                  <span className="text-xs text-red-600">< 1 day</span>
                </button>
                
                <button
                  onClick={() => handleAnswer(2)}
                  className="flex flex-col items-center p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Clock className="w-6 h-6 text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-orange-700">Hard</span>
                  <span className="text-xs text-orange-600">1-3 days</span>
                </button>
                
                <button
                  onClick={() => handleAnswer(3)}
                  className="flex flex-col items-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <CheckCircle className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-700">Good</span>
                  <span className="text-xs text-blue-600">3-7 days</span>
                </button>
                
                <button
                  onClick={() => handleAnswer(4)}
                  className="flex flex-col items-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-700">Easy</span>
                  <span className="text-xs text-green-600">1-2 weeks</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 px-6 py-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Session Progress</span>
          <span className="text-sm text-gray-600">
            {Math.round(((sessionStats.total) / cards.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((sessionStats.total) / cards.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetition;
