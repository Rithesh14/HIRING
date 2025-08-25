import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { aptitudeQuestions } from '../data/mockData';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Flag,
  Save,
  CheckCircle,
  AlertTriangle,
  Circle,
  Eye
} from 'lucide-react';

export default function AptitudeAssessment() {
  const { state, dispatch } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);

  const currentQuestion = aptitudeQuestions[currentQuestionIndex];
  const progress = state.assessmentProgress.aptitude;

  useEffect(() => {
    const savedAnswer = progress.answers[currentQuestion?.id];
    setSelectedAnswer(savedAnswer !== undefined ? savedAnswer : null);
  }, [currentQuestionIndex, progress.answers, currentQuestion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    const updatedAnswers = { ...progress.answers, [currentQuestion.id]: answerIndex };
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { 
        aptitude: { 
          ...progress, 
          answers: updatedAnswers 
        } 
      },
    });
  };

  const handleMarkForReview = () => {
    const isMarked = markedForReview.includes(currentQuestion.id);
    const updatedMarked = isMarked
      ? markedForReview.filter(id => id !== currentQuestion.id)
      : [...markedForReview, currentQuestion.id];
    
    setMarkedForReview(updatedMarked);
    
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { 
        aptitude: { 
          ...progress, 
          markedForReview: updatedMarked 
        } 
      },
    });
  };

  const getQuestionStatus = (index: number) => {
    const questionId = aptitudeQuestions[index]?.id;
    const hasAnswer = progress.answers[questionId] !== undefined;
    const isMarked = markedForReview.includes(questionId);
    
    if (index === currentQuestionIndex) return 'current';
    if (hasAnswer && isMarked) return 'answered-marked';
    if (hasAnswer) return 'answered';
    if (isMarked) return 'marked';
    return 'unattempted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-blue-100 text-blue-800 border-2 border-blue-500';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'marked': return 'bg-yellow-100 text-yellow-800';
      case 'answered-marked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  const getCategoryQuestions = (category: string) => {
    return aptitudeQuestions.filter(q => q.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Aptitude Test</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {aptitudeQuestions.length} • {currentQuestion?.category.charAt(0).toUpperCase() + currentQuestion?.category.slice(1)} Reasoning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className={`font-mono text-lg font-semibold ${
                timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Submit Test
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Object.keys(progress.answers).length}/{aptitudeQuestions.length} ({Math.round((Object.keys(progress.answers).length / aptitudeQuestions.length) * 100)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(Object.keys(progress.answers).length / aptitudeQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Panel - Question */}
        <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1} - {currentQuestion?.category.charAt(0).toUpperCase() + currentQuestion?.category.slice(1)} Reasoning
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-green-600">+{currentQuestion?.marks.correct}</span> for correct, 
                  <span className="text-red-600 ml-1">{currentQuestion?.marks.incorrect}</span> for incorrect
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-8">
              <h3 className="text-lg text-gray-900 leading-relaxed mb-6">
                {currentQuestion?.question}
              </h3>

              <div className="space-y-4">
                {currentQuestion?.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => handleAnswerSelect(index)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleMarkForReview}
                  className={`inline-flex items-center px-4 py-2 rounded-lg ${
                    markedForReview.includes(currentQuestion.id)
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {markedForReview.includes(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}
                </button>

                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Save className="w-4 h-4 mr-2" />
                  Clear Response
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (currentQuestionIndex < aptitudeQuestions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save & Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Navigation */}
        <div className="w-80 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigation</h3>
            
            {/* Category Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Quantitative (1-8)</span>
                <span className="font-medium">
                  {aptitudeQuestions.slice(0, 8).filter((_, i) => progress.answers[aptitudeQuestions[i]?.id] !== undefined).length}/8
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Logical (9-16)</span>
                <span className="font-medium">
                  {aptitudeQuestions.slice(8, 16).filter((_, i) => progress.answers[aptitudeQuestions[i + 8]?.id] !== undefined).length}/8
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Verbal (17-25)</span>
                <span className="font-medium">
                  {aptitudeQuestions.slice(16, 25).filter((_, i) => progress.answers[aptitudeQuestions[i + 16]?.id] !== undefined).length}/9
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {aptitudeQuestions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center ${getStatusColor(status)}`}
                    title={`Question ${index + 1} - ${status.replace('-', ' ')}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300 mr-2"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300 mr-2"></div>
                <span className="text-gray-600">Marked for Review</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 mr-2"></div>
                <span className="text-gray-600">Answered & Marked</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300 mr-2"></div>
                <span className="text-gray-600">Not Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500 mr-2"></div>
                <span className="text-gray-600">Current Question</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}