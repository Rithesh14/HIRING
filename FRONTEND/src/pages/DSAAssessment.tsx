import React, { useState, useEffect, useRef } from 'react';
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
  Dot,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Mock data
const dsaQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "easy",
    tags: ["Array", "Hash Table"],
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    template: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
      python: "def two_sum(nums, target):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};"
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
    ]
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "easy",
    tags: ["String", "Stack"],
    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    examples: [
      { input: "s = \"()\"", output: "true" },
      { input: "s = \"()[]{}\"", output: "true" },
      { input: "s = \"(]\"", output: "false" }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    template: {
      javascript: "function isValid(s) {\n  // Write your code here\n  \n}",
      python: "def is_valid(s):\n    # Write your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        \n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        \n    }\n};"
    },
    testCases: [
      { input: { s: "()" }, expected: true },
      { input: { s: "()[]{}" }, expected: true },
      { input: { s: "(]" }, expected: false },
      { input: { s: "([)]" }, expected: false }
    ]
  }
];

// Real code editor component with syntax highlighting
function CodeEditor({ value, onChange, language }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [lineNumbers, setLineNumbers] = useState([]);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [value]);

  useEffect(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value]);

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const syntaxHighlight = (code) => {
    const keywords = {
      javascript: /\b(function|const|let|var|return|if|else|for|while|class|new|this|import|export|async|await|try|catch|throw|typeof|instanceof)\b/g,
      python: /\b(def|class|return|if|elif|else|for|while|import|from|as|pass|True|False|None|try|except|raise|with|lambda|yield)\b/g,
      java: /\b(public|private|protected|class|void|int|return|if|else|for|while|new|static|String|boolean|true|false|null|try|catch|throw|extends|implements)\b/g,
      cpp: /\b(class|public|private|protected|int|void|return|if|else|for|while|vector|string|bool|true|false|nullptr|try|catch|throw|using|namespace)\b/g,
    };

    const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const comments = /\/\/.*|\/\*[\s\S]*?\*\/|#.*/g;
    const numbers = /\b\d+(\.\d+)?\b/g;

    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    highlighted = highlighted.replace(comments, '<span style="color: #6a9955;">$&</span>');
    highlighted = highlighted.replace(strings, '<span style="color: #ce9178;">$&</span>');
    highlighted = highlighted.replace(keywords[language] || keywords.javascript, '<span style="color: #569cd6;">$&</span>');
    highlighted = highlighted.replace(numbers, '<span style="color: #b5cea8;">$&</span>');

    return highlighted;
  };

  return (
    <div className="relative w-full h-full flex bg-gray-900">
      {/* Line numbers */}
      <div className="flex-shrink-0 w-12 bg-gray-800 text-gray-500 text-right pr-2 pt-4 pb-4 font-mono text-sm select-none overflow-hidden">
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6">{num}</div>
        ))}
      </div>

      {/* Editor area */}
      <div className="relative flex-1 font-mono text-sm">
        <div
          ref={highlightRef}
          className="absolute inset-0 p-4 overflow-auto pointer-events-none text-gray-300"
          style={{ whiteSpace: 'pre', wordWrap: 'normal' }}
        >
          <div dangerouslySetInnerHTML={{ __html: syntaxHighlight(value) }} />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 p-4 bg-transparent text-transparent caret-white overflow-auto resize-none outline-none"
          style={{ 
            whiteSpace: 'pre',
            wordWrap: 'normal',
            caretColor: 'white'
          }}
          spellCheck="false"
        />
      </div>
    </div>
  );
}

// Function to execute JavaScript code safely
function executeJavaScriptCode(code, testCase) {
  try {
    const func = new Function('nums', 'target', 's', `
      ${code}
      
      // Determine which function to call
      if (typeof twoSum !== 'undefined') {
        return twoSum(nums, target);
      } else if (typeof isValid !== 'undefined') {
        return isValid(s);
      }
      return undefined;
    `);
    
    const result = func(testCase.input.nums, testCase.input.target, testCase.input.s);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to compare arrays deeply
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  return true;
}

export default function DSAAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showOutput, setShowOutput] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const currentQuestion = dsaQuestions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id];
      setCode(savedAnswer || currentQuestion.template[language] || '');
    }
  }, [currentQuestion, language]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRunCode = () => {
    if (language !== 'javascript') {
      setShowOutput(true);
      setTestResults([{
        passed: false,
        error: `Code execution is only supported for JavaScript in this demo. Python, Java, and C++ support requires a backend compiler.`
      }]);
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    
    const results = currentQuestion.testCases.map((testCase, index) => {
      const startTime = performance.now();
      const execution = executeJavaScriptCode(code, testCase);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);

      if (!execution.success) {
        return {
          caseNumber: index + 1,
          passed: false,
          error: execution.error,
          input: testCase.input,
          expected: testCase.expected
        };
      }

      const result = execution.result;
      const expected = testCase.expected;
      
      let passed = false;
      if (Array.isArray(expected) && Array.isArray(result)) {
        passed = arraysEqual(result, expected);
      } else {
        passed = result === expected;
      }

      return {
        caseNumber: index + 1,
        passed,
        input: testCase.input,
        output: result,
        expected: expected,
        executionTime: executionTime + 'ms'
      };
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const handleSubmit = () => {
    // First run the code
    handleRunCode();
    
    // Check if all tests pass
    setTimeout(() => {
      const allPassed = testResults.every(r => r.passed);
      
      if (allPassed && !completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }
      
      setAnswers({ ...answers, [currentQuestion.id]: code });

      if (allPassed && currentQuestionIndex < dsaQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowOutput(false);
          setTestResults([]);
        }, 2000);
      }
    }, 100);
  };

  const handleReset = () => {
    setCode(currentQuestion.template[language] || '');
    setShowOutput(false);
    setTestResults([]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionStatus = (index) => {
    const questionId = dsaQuestions[index]?.id;
    if (completedQuestions.includes(questionId)) {
      return 'completed';
    }
    if (index === currentQuestionIndex) {
      return 'current';
    }
    return 'unattempted';
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);
  const hasErrors = testResults.some(r => !r.passed);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">DSA Assessment</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {dsaQuestions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className={`font-mono text-lg font-semibold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full ${timeLeft < 300 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${(timeLeft / (25 * 60)) * 100}%` }}
                />
              </div>
            </div>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50">
              <Save className="w-4 h-4 mr-2" />
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Panel - Question */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{currentQuestion?.title}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getDifficultyColor(currentQuestion?.difficulty)
              }`}>
                {currentQuestion?.difficulty.charAt(0).toUpperCase() + currentQuestion?.difficulty.slice(1)}
              </span>
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
            <div className="max-w-none">
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
                  <option value="python">Python (View Only)</option>
                  <option value="java">Java (View Only)</option>
                  <option value="cpp">C++ (View Only)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Code Editor */}
            <div className={showOutput ? "h-3/5" : "h-full"}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
              />
            </div>

            {showOutput && (
              <div className="h-2/5 border-t border-gray-200 bg-gray-50 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Test Results</h4>
                    {allTestsPassed && (
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        All tests passed!
                      </div>
                    )}
                    {hasErrors && (
                      <div className="flex items-center text-red-600 text-sm font-medium">
                        <XCircle className="w-4 h-4 mr-1" />
                        Some tests failed
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border-2 ${
                          result.passed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            Test Case {result.caseNumber}
                          </span>
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        
                        {result.error ? (
                          <div className="text-sm text-red-700 font-mono">
                            <div className="flex items-start">
                              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span>Error: {result.error}</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-gray-700 space-y-1">
                              <div>
                                <span className="font-semibold">Input:</span>{' '}
                                <span className="font-mono">
                                  {JSON.stringify(result.input)}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">Your Output:</span>{' '}
                                <span className="font-mono">
                                  {JSON.stringify(result.output)}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">Expected:</span>{' '}
                                <span className="font-mono">
                                  {JSON.stringify(result.expected)}
                                </span>
                              </div>
                              {result.executionTime && (
                                <div className="text-gray-500">
                                  Execution Time: {result.executionTime}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                  setShowOutput(false);
                  setTestResults([]);
                }}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex gap-2">
                {dsaQuestions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setShowOutput(false);
                        setTestResults([]);
                      }}
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
                onClick={() => {
                  setCurrentQuestionIndex(Math.min(dsaQuestions.length - 1, currentQuestionIndex + 1));
                  setShowOutput(false);
                  setTestResults([]);
                }}
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