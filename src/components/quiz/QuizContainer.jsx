import React from 'react';
import { useQuiz } from '../../hooks/useQuiz';
import QuestionDisplay from './QuestionDisplay';
import QuizResults from './QuizResults';

const QuizContainer = ({ quizId, onComplete }) => {
  const {
    quiz,
    loading,
    error,
    currentQuestion,
    userAnswers,
    quizResult,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    progress
  } = useQuiz(quizId);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (quizResult) {
    return (
      <QuizResults 
        result={quizResult} 
        quiz={quiz} 
        onRetry={resetQuiz}
        onComplete={onComplete}
      />
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">{quiz.title}</h3>
            <span className="text-sm text-gray-500">
              Question {progress.current} of {progress.total}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>

        <QuestionDisplay
          question={currentQuestionData}
          selectedAnswer={userAnswers[currentQuestion]}
          onAnswerSelect={(index) => submitAnswer(index)}
        />
      </div>

      <div className="p-6 bg-gray-50 border-t flex justify-between">
        <button
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitQuiz}
            disabled={userAnswers.some(answer => answer === null)}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={nextQuestion}
            disabled={userAnswers[currentQuestion] === null}
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizContainer;