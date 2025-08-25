import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { dsaQuestions } from '../data/mockData';
import { 
  Clock, 
  Save, 
  Play, 
  RotateCcw, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Code,
  CheckCircle,
  Circle,
  Dot
} from 'lucide-react';

export default function DSAAssessment() {
  const { state, dispatch } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [showOutput, setShowOutput] = useState(false);
  const [testOutput, setTestOutput] = useState('');

  const currentQuestion = dsaQuestions[currentQuestionIndex];
  const progress = state.assessmentProgress.dsa;

  useEffect(() => {
    if (currentQuestion) {
      setCode(currentQuestion.template[language] || '');
    }
  }, [currentQuestion, language]);

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

  const handleRunCode = () => {
    setShowOutput(true);
    setTestOutput(`Test Case 1: ✓ Passed
Input: [2,7,11,15], target = 9
Output: [0,1]
Expected: [0,1]
Execution Time: 0.05ms
Memory Usage: 2.1MB

Test Case 2: ✓ Passed
Input: [3,2,4], target = 6
Output: [1,2]
Expected: [1,2]
Execution Time: 0.03ms
Memory Usage: 2.0MB`);
  };

  const handleSubmit = () => {
    const updatedProgress = {
      ...progress,
      completedQuestions: [...progress.completedQuestions, currentQuestion.id],
      answers: { ...progress.answers, [currentQuestion.id]: code },
    };
    
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { dsa: updatedProgress },
    });

    if (currentQuestionIndex < dsaQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowOutput(false);
      setTestOutput('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionStatus = (index: number) => {
    const questionId = dsaQuestions[index]?.id;
    if (progress.completedQuestions.includes(questionId)) {
      return 'completed';
    }
    if (index === currentQuestionIndex) {
      return 'current';
    }
    return 'unattempted';
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
              <h1 className="text-xl font-semibold text-gray-900">DSA Assessment</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {dsaQuestions.length}
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

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50">
              <Save className="w-4 h-4 mr-2" />
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Panel - Question */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{currentQuestion?.title}</h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getDifficultyColor(currentQuestion?.difficulty)
                }`}>
                  {currentQuestion?.difficulty.charAt(0).toUpperCase() + currentQuestion?.difficulty.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {currentQuestion?.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose max-w-none">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h3>
                <p className="text-gray-700 leading-relaxed">{currentQuestion?.statement}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
                {currentQuestion?.examples.map((example, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Example {index + 1}:</p>
                    <p className="text-sm text-gray-700 font-mono">
                      <span className="font-semibold">Input:</span> {example.input}
                    </p>
                    <p className="text-sm text-gray-700 font-mono">
                      <span className="font-semibold">Output:</span> {example.output}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h3>
                <ul className="space-y-1">
                  {currentQuestion?.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <Dot className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="font-mono">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Code className="w-5 h-5 text-gray-600" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </button>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 font-mono text-sm border-none focus:outline-none resize-none bg-gray-900 text-gray-100"
              placeholder="Write your solution here..."
              spellCheck={false}
            />

            {showOutput && (
              <div className="h-48 border-t border-gray-200 bg-gray-50">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Console Output</h4>
                  <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                    {testOutput}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Question Navigation */}
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

              <div className="grid grid-cols-5 gap-2">
                {dsaQuestions.slice(0, 10).map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : status === 'current'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentQuestionIndex(Math.min(dsaQuestions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === dsaQuestions.length - 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}