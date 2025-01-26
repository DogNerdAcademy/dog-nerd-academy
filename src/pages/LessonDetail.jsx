import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLessonById } from '../services/courseService';
import VideoPlayer from '../components/VideoPlayer';

const LessonDetail = () => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lessonId } = useParams();

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        const lessonData = await getLessonById(lessonId);
        setLesson(lessonData);
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const handleVideoProgress = async (currentTime, progress) => {
    try {
      await updateLessonProgress(lessonId, {
        currentTime,
        progress
      });
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Lesson not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <p className="text-gray-600 mb-6">{lesson.description}</p>
          
          {lesson.videoUrl && (
            <div className="mb-6">
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                onProgress={handleVideoProgress}
                lastPlaybackTime={lesson.lastPlaybackTime}
              />
            </div>
          )}
          
          <div className="prose max-w-none">
            {/* Add lesson content here */}
            {lesson.content && <div>{lesson.content}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;