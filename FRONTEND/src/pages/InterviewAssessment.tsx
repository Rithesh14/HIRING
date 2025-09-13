import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { interviewQuestions } from '../data/mockData';
import { 
  Mic, 
  Play, 
  Square, 
  SkipForward,
  ChevronLeft,
  Volume2,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

export default function InterviewAssessment() {
  const { state, dispatch } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [transcript, setTranscript] = useState(''); // speech-to-text result

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = state.assessmentProgress.interview;

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    }
  }, []);

  useEffect(() => {
    const hasRecordingForCurrent = progress.recordings[currentQuestion?.id];
    setHasRecorded(hasRecordingForCurrent || false);
  }, [currentQuestionIndex, progress.recordings, currentQuestion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Update progress
    const updatedRecordings = { ...progress.recordings, [currentQuestion.id]: true };
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { 
        interview: { 
          ...progress, 
          recordings: updatedRecordings 
        } 
      },
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setRecordingTime(0);
      setIsRecording(false);
      setIsPlaying(false);
      setTranscript('');
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'hr': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionStatus = (index: number) => {
    const questionId = interviewQuestions[index]?.id;
    if (progress.recordings[questionId]) return 'completed';
    if (index === currentQuestionIndex) return 'current';
    return 'pending';
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
              <h1 className="text-xl font-semibold text-gray-900">Interview Assessment</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {interviewQuestions.length} • Voice Recording
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Progress</p>
              <p className="font-semibold">
                {Object.keys(progress.recordings).length}/{interviewQuestions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Question Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    getQuestionTypeColor(currentQuestion?.type)
                  }`}>
                    {currentQuestion?.type.charAt(0).toUpperCase() + currentQuestion?.type.slice(1)} Question
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Expected: {Math.floor((currentQuestion?.expectedDuration || 0) / 60)} mins
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Recording Interface */}
              <div className="bg-gray-50 rounded-xl p-8 mb-6">
                <div className="text-center">
                  {/* Recording Status */}
                  <div className="mb-6">
                    {isRecording ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-lg font-semibold text-red-600">Recording...</span>
                      </div>
                    ) : hasRecorded ? (
                      <div className="flex items-center justify-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-lg font-semibold text-green-600">Response Recorded</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-600">Ready to Record</span>
                      </div>
                    )}
                  </div>

                  {/* Timer */}
                  <div className="mb-6">
                    <div className="text-4xl font-mono font-bold text-gray-900">
                      {formatTime(recordingTime)}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    {!isRecording ? (
                      <>
                        <button
                          onClick={handleStartRecording}
                          className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <Mic className="w-8 h-8" />
                        </button>
                        
                        {hasRecorded && (
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                          >
                            <Play className="w-6 h-6" />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={handleStopRecording}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                      >
                        <Square className="w-8 h-8" />
                      </button>
                    )}
                  </div>

                  {/* Transcript */}
                  {transcript && (
                    <div className="mt-6 bg-white border rounded-lg p-4 text-left shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Transcript:</h4>
                      <p className="text-sm text-gray-800">{transcript}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {hasRecorded && (
                    <div className="flex items-center justify-center space-x-4 mt-6">
                      <button
                        onClick={handleStartRecording}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Re-record
                      </button>
                      
                      <button
                        onClick={handleNextQuestion}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                      >
                        {currentQuestionIndex === interviewQuestions.length - 1 ? 'Finish Interview' : 'Next Question'}
                        <SkipForward className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Progress</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold">{Object.keys(progress.recordings).length}/{interviewQuestions.length}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(Object.keys(progress.recordings).length / interviewQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              
              <div className="space-y-2">
                {interviewQuestions.map((question, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        status === 'completed'
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : status === 'current'
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          {status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getQuestionTypeColor(question.type)}`}>
                          {question.type}
                        </span>
                      </div>
                      <p className="text-xs mt-1 line-clamp-2">{question.question}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* General Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Tips</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Volume2 className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-blue-600" />
                  <span>Speak clearly and at a moderate pace</span>
                </div>
                <div className="flex items-start">
                  <Clock className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-green-600" />
                  <span>Aim for 2-3 minutes per response</span>
                </div>
                <div className="flex items-start">
                  <Lightbulb className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-yellow-600" />
                  <span>Use specific examples and metrics when possible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
