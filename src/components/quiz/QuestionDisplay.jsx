import React from 'react';

const QuestionDisplay = ({ question, selectedAnswer, onAnswerSelect }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">{question.text}</h4>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div 
            key={index} 
            className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              selectedAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => onAnswerSelect(index)}
          >
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              selectedAnswer === index 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedAnswer === index && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-base">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionDisplay;