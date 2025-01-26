import { useState, useEffect } from 'react';
import { quizService } from '../services/quizService';
import { useAuth } from '../contexts/AuthContext';

export const useQuiz = (quizId) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await quizService.getQuizById(quizId);
        setQuiz(quizData);
        setUserAnswers(new Array(quizData.questions.length).fill(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const submitAnswer = (answerIndex) => {
    if (currentQuestion >= quiz.questions.length) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      if (!currentUser) throw new Error('User must be logged in to submit quiz');
      
      const result = await quizService.submitQuizAttempt(
        quizId,
        currentUser.uid,
        userAnswers
      );
      setQuizResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setQuizResult(null);
  };

  return {
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
    isComplete: userAnswers.every(answer => answer !== null),
    progress: {
      current: currentQuestion + 1,
      total: quiz?.questions?.length || 0,
      percentage: quiz?.questions?.length 
        ? ((currentQuestion + 1) / quiz.questions.length) * 100 
        : 0
    }
  };
};