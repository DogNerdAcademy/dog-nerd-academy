// src/components/content/LessonController.jsx
import React, { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import QuizComponent from './QuizComponent';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * @typedef {Object} Lesson
 * @property {string} id - Lesson ID
 * @property {string} type - 'video' or 'quiz'
 * @property {string} title - Lesson title
 * @property {string} [videoUrl] - URL for video content
 * @property {number} [videoDuration] - Duration of video in seconds
 * @property {Object} [quiz] - Quiz data if type is 'quiz'
 */

/**
 * Controls the display and tracking of lesson content
 * @param {Object} props
 * @param {Lesson} props.lesson - Lesson data
 * @param {string} props.userId - Current user ID
 * @param {Function} props.onComplete - Callback when lesson is completed
 */
const LessonController = ({ lesson, userId, onComplete }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update progress in Firestore
  const updateProgress = async (progressData) => {
    try {
      const progressRef = doc(db, 'progress', `${userId}_${lesson.id}`);
      await updateDoc(progressRef, {
        ...progressData,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to save progress');
    }
  };

  // Handle video progress
  const handleVideoProgress = async (playbackTime, watchedPercentage) => {
    await updateProgress({
      lastPlaybackTime: playbackTime,
      watchedPercentage: watchedPercentage,
      completed: watchedPercentage >= 90
    });

    if (watchedPercentage >= 90) {
      onComplete?.();
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (score) => {
    const passed = score >= (lesson.quiz?.passingScore || 70);
    await updateProgress({
      score,
      completed: passed,
      attempts: (progress?.attempts || 0) + 1
    });

    if (passed) {
      onComplete?.();
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {lesson.type === 'video' && (
        <VideoPlayer
          videoUrl={lesson.videoUrl}
          lastPlaybackTime={progress?.lastPlaybackTime}
          onProgress={handleVideoProgress}
        />
      )}

      {lesson.type === 'quiz' && (
        <QuizComponent
          quiz={lesson.quiz}
          onComplete={handleQuizComplete}
          previousAttempts={progress?.attempts}
        />
      )}
    </div>
  );
};

export default LessonController;