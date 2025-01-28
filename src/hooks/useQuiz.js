// src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import { quizService } from '../services/quizService';

/**
 * Custom hook for managing quiz state and interactions
 * @param {string} lessonId - ID of the lesson
 * @param {string} userId - ID of the current user
 */
const useQuiz = (lessonId, userId) => {
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState({
    answers: [],
    currentQuestion: 0
  });

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const quizzes = await quizService.getQuizzesByLesson(lessonId);
        if (quizzes.length > 0) {
          const quiz = quizzes[0]; // Assuming one quiz per lesson
          setQuiz(quiz);
          
          // Load user's previous attempts
          const userAttempts = await quizService.getUserAttempts(userId, quiz.id);
          setAttempts(userAttempts);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && userId) {
      loadQuiz();
    }
  }, [lessonId, userId]);

  // Check if user can attempt quiz
  const canAttemptQuiz = () => {
    if (!quiz) return false;
    if (quiz.maxAttempts === 0) return true; // Unlimited attempts
    return attempts.length < quiz.maxAttempts;
  };

  // Handle answer selection
  const selectAnswer = (questionIndex, answerIndex) => {
    setCurrentAttempt(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = answerIndex;
      return {
        ...prev,
        answers: newAnswers
      };
    });
  };

  // Navigate questions
  const goToQuestion = (index) => {
    if (index >= 0 && index < quiz?.questions.length) {
      setCurrentAttempt(prev => ({
        ...prev,
        currentQuestion: index
      }));
    }
  };

  // Submit quiz attempt
  const submitAttempt = async () => {
    if (!quiz || !canAttemptQuiz()) return;

    try {
      setLoading(true);
      const result = await quizService.submitQuizAttempt(
        quiz.id,
        userId,
        currentAttempt.answers
      );

      // Update attempts list
      const newAttempts = await quizService.getUserAttempts(userId, quiz.id);
      setAttempts(newAttempts);

      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error submitting quiz:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get best attempt
  const getBestAttempt = () => {
    if (!attempts.length) return null;
    return attempts.reduce((best, current) => 
      (current.score > best.score) ? current : best
    );
  };

  // Reset current attempt
  const resetAttempt = () => {
    setCurrentAttempt({
      answers: [],
      currentQuestion: 0
    });
  };

  return {
    quiz,
    loading,
    error,
    attempts,
    currentAttempt,
    canAttemptQuiz: canAttemptQuiz(),
    bestAttempt: getBestAttempt(),
    actions: {
      selectAnswer,
      goToQuestion,
      submitAttempt,
      resetAttempt
    }
  };
};

export default useQuiz;