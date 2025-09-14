import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const QuizPage = () => {
  const { subject } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Sample quiz data
  const quizData = {
    physics: {
      title: 'Physics Quiz - Mechanics',
      questions: [
        {
          question: "What is Newton's First Law of Motion?",
          options: [
            "An object at rest stays at rest unless acted upon by a force",
            "Force equals mass times acceleration",
            "For every action, there is an equal and opposite reaction",
            "Energy cannot be created or destroyed"
          ],
          correct: 0,
          explanation: "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force."
        },
        {
          question: "What is the unit of force in the SI system?",
          options: ["Joule", "Newton", "Watt", "Pascal"],
          correct: 1,
          explanation: "The Newton (N) is the SI unit of force, named after Sir Isaac Newton."
        },
        {
          question: "If a car accelerates at 2 m/s² and has a mass of 1000 kg, what force is applied?",
          options: ["500 N", "1000 N", "2000 N", "4000 N"],
          correct: 2,
          explanation: "Using F = ma, Force = 1000 kg × 2 m/s² = 2000 N"
        }
      ]
    },
    chemistry: {
      title: 'Chemistry Quiz - Atomic Structure',
      questions: [
        {
          question: "What is the atomic number of Carbon?",
          options: ["4", "6", "8", "12"],
          correct: 1,
          explanation: "Carbon has 6 protons, which determines its atomic number."
        },
        {
          question: "Which subatomic particle has no charge?",
          options: ["Proton", "Electron", "Neutron", "Ion"],
          correct: 2,
          explanation: "Neutrons are electrically neutral particles found in the nucleus."
        }
      ]
    }
  };

  const currentQuiz = quizData[subject] || quizData.physics;
  const question = currentQuiz.questions[currentQuestion];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    const isCorrect = selectedAnswer === question.correct;
    
    setAnswers([...answers, {
      questionIndex: currentQuestion,
      selectedAnswer,
      correct: isCorrect
    }]);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  const getScoreColor = () => {
    const percentage = (score / currentQuiz.questions.length) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (quizCompleted) {
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400">Great job on completing the {subject} quiz</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <div className={`text-3xl font-bold ${getScoreColor()}`}>{percentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Final Score</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{score}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatTime(300 - timeLeft)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              Review Answers
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentQuiz.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </p>
          </div>
          
          {/* Timer */}
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⏱️</span>
              <div className="text-right">
                <div className={`text-xl font-bold ${timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Time Left</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestion + 1) / currentQuiz.questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? showFeedback
                    ? index === question.correct
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : showFeedback && index === question.correct
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                  selectedAnswer === index
                    ? showFeedback
                      ? index === question.correct
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-red-500 bg-red-500 text-white'
                      : 'border-blue-500 bg-blue-500 text-white'
                    : showFeedback && index === question.correct
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option}</span>
                {showFeedback && index === question.correct && (
                  <span className="ml-auto text-green-600 dark:text-green-400">✓</span>
                )}
                {showFeedback && selectedAnswer === index && index !== question.correct && (
                  <span className="ml-auto text-red-600 dark:text-red-400">✗</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedAnswer === question.correct
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              <span className="text-xl">
                {selectedAnswer === question.correct ? '✅' : '❌'}
              </span>
              <div>
                <div className={`font-semibold mb-1 ${
                  selectedAnswer === question.correct
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {selectedAnswer === question.correct ? 'Correct!' : 'Incorrect'}
                </div>
                <p className={`text-sm ${
                  selectedAnswer === question.correct
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {currentQuestion < currentQuiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
