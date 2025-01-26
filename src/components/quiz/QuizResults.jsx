import React from 'react';

const QuizResults = ({ result, quiz, onRetry, onComplete }) => {
  const { score, passed, feedback } = result;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6 text-center space-y-4">
        <h3 className="text-2xl font-bold">Quiz Results</h3>
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl font-bold">{Math.round(score)}%</span>
          {passed ? (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Passed!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Try Again</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-4">
          {feedback.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                item.correct ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <h4 className="font-semibold mb-2">
                Question {index + 1}: {quiz.questions[index].text}
              </h4>
              <p className={`text-sm ${
                item.correct ? 'text-green-700' : 'text-red-700'
              }`}>
                {item.correct ? 'Correct!' : 'Incorrect'}
              </p>
              {!item.correct && (
                <p className="text-sm mt-2 text-gray-600">
                  {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t flex justify-between">
        {!passed && (
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
        {passed && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={onComplete}
          >
            Continue to Next Lesson
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizResults;