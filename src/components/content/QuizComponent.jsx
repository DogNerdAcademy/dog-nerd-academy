// src/components/content/QuizComponent.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

const QuizComponent = ({
  lessonId,
  onComplete,
  disabled = false,
  initialProgress = null
}) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual quiz service call
        const quizData = {
          id: '1',
          title: 'Lesson Quiz',
          questions: [
            {
              id: '1',
              text: 'What is the first step in loose leash walking?',
              options: [
                { id: 'a', text: 'Pull the dog back' },
                { id: 'b', text: 'Stop when the dog pulls' },
                { id: 'c', text: 'Mark and reward when leash is loose' },
                { id: 'd', text: 'Run with the dog' }
              ],
              correctAnswer: 'c'
            },
            // Add more questions...
          ],
          passingScore: 70
        };
        setQuiz(quizData);
      } catch (err) {
        setError('Failed to load quiz. Please try again.');
        console.error('Error loading quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [lessonId]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Calculate progress percentage
  const progressPercentage = (Object.keys(answers).length / (quiz?.questions?.length || 1)) * 100;

  // Check if all questions are answered
  const allQuestionsAnswered = quiz?.questions?.every(q => answers[q.id]) || false;

  // Calculate final score
  const calculateScore = () => {
    const correctAnswers = quiz.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length;
    return (correctAnswers / quiz.questions.length) * 100;
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return;

    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);

    try {
      await onComplete({
        completed: true,
        score: finalScore,
        answers
      });
    } catch (err) {
      setError('Failed to save quiz results. Please try again.');
      console.error('Error saving quiz results:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (disabled) {
    return (
      <Alert>
        <AlertDescription>
          Please complete watching the video before taking the quiz.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{quiz?.title}</CardTitle>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <>
            {quiz?.questions[currentQuestion] && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </h3>
                <p className="text-gray-700">
                  {quiz.questions[currentQuestion].text}
                </p>
                
                <RadioGroup
                  value={answers[quiz.questions[currentQuestion].id] || ''}
                  onValueChange={(value) => 
                    handleAnswerSelect(quiz.questions[currentQuestion].id, value)
                  }
                >
                  {quiz.questions[currentQuestion].options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <label htmlFor={option.id} className="text-sm">
                        {option.text}
                      </label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between mt-6">
                  <Button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  
                  {currentQuestion === quiz.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!allQuestionsAnswered}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      disabled={!answers[quiz.questions[currentQuestion].id]}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">Quiz Complete!</h3>
            <p className="text-lg">
              Your score: {score.toFixed(1)}%
            </p>
            {score >= quiz.passingScore ? (
              <Alert>
                <AlertDescription className="text-green-600">
                  Congratulations! You've passed the quiz!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  You'll need {quiz.passingScore}% to pass. Please review the material and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizComponent;