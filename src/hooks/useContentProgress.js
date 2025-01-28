// src/hooks/useContentProgress.js
import { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';

const useContentProgress = ({ 
  lessonId, 
  userId, 
  contentType,
  initialProgress = null 
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const existingProgress = await progressService.getLessonProgress(userId, lessonId);
        if (existingProgress) {
          setProgress(existingProgress);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [lessonId, userId]);

  // Update video progress
  const updateVideoProgress = async (videoData) => {
    try {
      setLoading(true);
      const updatedProgress = await progressService.updateVideoProgress(
        userId,
        lessonId,
        videoData
      );
      setProgress(updatedProgress);
      return updatedProgress;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update quiz progress
  const updateQuizProgress = async (quizData) => {
    try {
      setLoading(true);
      const updatedProgress = await progressService.updateQuizProgress(
        userId,
        lessonId,
        quizData
      );
      setProgress(updatedProgress);
      return updatedProgress;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset error state
  const resetError = () => {
    setError(null);
  };

  return {
    progress,
    loading,
    error,
    updateVideoProgress,
    updateQuizProgress,
    resetError
  };
};

export default useContentProgress;