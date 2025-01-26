import React, { useEffect, useState } from 'react';
import { quizService } from '../../services/quizService';
import QuizContainer from '../../components/quiz/QuizContainer';
import { useAuth } from '../../contexts/AuthContext';

const SAMPLE_QUIZ = {
  title: "Dog Training Basics",
  lessonId: "sample-lesson-1",
  questions: [
    {
      id: "q1",
      text: "What is the first step in clicker training?",
      options: [
        "Immediately start training complex behaviors",
        "Charging the clicker (creating positive association)",
        "Ignoring the dog until they perform the desired behavior",
        "Using treats without the clicker"
      ],
      correctOption: 1,
      explanation: "Before starting clicker training, the dog needs to associate the click sound with rewards."
    },
    {
      id: "q2",
      text: "When should you mark (click) a behavior?",
      options: [
        "After giving the treat",
        "At the exact moment the desired behavior occurs",
        "A few seconds after the behavior",
        "Only when the dog is looking at you"
      ],
      correctOption: 1,
      explanation: "Timing is crucial - mark the exact moment the desired behavior occurs to communicate precisely what was correct."
    },
    {
      id: "q3",
      text: "What is the recommended treat delivery time after clicking?",
      options: [
        "Within 1-3 seconds",
        "Immediately with the click",
        "When the dog sits",
        "After the dog performs another behavior"
      ],
      correctOption: 0,
      explanation: "While the click marks the exact behavior, you have 1-3 seconds to deliver the treat without losing the association."
    }
  ],
  passingScore: 70,
  isRequired: true,
  maxAttempts: 0
};

const QuizTestingPage = () => {
  const [testQuizId, setTestQuizId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeTestQuiz = async () => {
      try {
        setLoading(true);
        // Check if test quiz exists
        const quizzes = await quizService.getQuizzesByLesson(SAMPLE_QUIZ.lessonId);
        let quizId;

        if (quizzes.length === 0) {
          // Create test quiz if it doesn't exist
          quizId = await quizService.createQuiz(SAMPLE_QUIZ);
          console.log('Created test quiz with ID:', quizId);
        } else {
          quizId = quizzes[0].id;
          console.log('Found existing test quiz:', quizId);
        }

        setTestQuizId(quizId);
      } catch (err) {
        console.error('Error initializing test quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeTestQuiz();
  }, []);

  const handleQuizComplete = async (result) => {
    console.log('Quiz completed with result:', result);
    // In a real lesson, this would trigger lesson completion
    alert(`Quiz completed! Score: ${result.score}%`);
  };

  const resetTestQuiz = async () => {
    try {
      setLoading(true);
      // Delete existing quiz
      if (testQuizId) {
        await quizService.deleteQuiz(testQuizId);
      }
      // Create new test quiz
      const newQuizId = await quizService.createQuiz(SAMPLE_QUIZ);
      setTestQuizId(newQuizId);
      console.log('Reset test quiz, new ID:', newQuizId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quiz Testing Page</h1>
        <button 
          onClick={resetTestQuiz}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Reset Test Quiz
        </button>
      </div>

      {testQuizId && (
        <QuizContainer
          quizId={testQuizId}
          onComplete={handleQuizComplete}
        />
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <pre className="bg-white p-4 rounded overflow-x-auto">
          {JSON.stringify({
            quizId: testQuizId,
            userId: currentUser?.uid,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default QuizTestingPage;