// src/pages/LessonView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent } from '../components/ui/card';
import ContentProgressTracker from '../components/content/ContentProgressTracker';
import VideoPlayer from '../components/content/VideoPlayer';
import QuizComponent from '../components/content/QuizComponent';
import useContentProgress from '../hooks/useContentProgress';
import { useAuth } from '../contexts/AuthContext';

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State management
  const [lesson, setLesson] = useState(null);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [activeContent, setActiveContent] = useState('video');
  const [lessonLoading, setLessonLoading] = useState(true);
  const [lessonError, setLessonError] = useState(null);

  // Custom hook for progress management
  const {
    progress,
    loading: progressLoading,
    error: progressError,
    updateVideoProgress,
    updateQuizProgress,
    resetError
  } = useContentProgress({
    lessonId,
    userId: currentUser.uid,
    contentType: activeContent
  });

  // Fetch lesson and module data
  useEffect(() => {
    const fetchLessonData = async () => {
      setLessonLoading(true);
      setLessonError(null);
      
      try {
        // Fetch lesson data
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonDoc = await getDoc(lessonRef);
        
        if (!lessonDoc.exists()) {
          throw new Error('Lesson not found');
        }

        const lessonData = {
          id: lessonDoc.id,
          ...lessonDoc.data()
        };
        
        // Fetch module data
        const moduleRef = doc(db, 'modules', lessonData.moduleId);
        const moduleDoc = await getDoc(moduleRef);
        
        if (!moduleDoc.exists()) {
          throw new Error('Module not found');
        }

        setLesson(lessonData);
        setModuleInfo(moduleDoc.data());

        // Set initial content type based on lesson progress
        if (progress?.type === 'quiz' || 
            (progress?.type === 'video' && progress?.watchedPercentage >= 90)) {
          setActiveContent('quiz');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setLessonError(err.message || 'Failed to load lesson');
      } finally {
        setLessonLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, progress?.type, progress?.watchedPercentage]);

  // Handle video progress update
  const handleVideoProgress = async (videoData) => {
    try {
      await updateVideoProgress(videoData);
      
      // If video is completed (90% or more watched), show quiz
      if (videoData.watchedPercentage >= 90) {
        setActiveContent('quiz');
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (quizData) => {
    try {
      await updateQuizProgress({
        completed: true,
        score: quizData.score
      });

      // Navigate to next lesson if available
      if (moduleInfo?.nextLessonId) {
        navigate(`/lessons/${moduleInfo.nextLessonId}`);
      } else {
        // Navigate to module completion view or module overview
        navigate(`/modules/${lesson.moduleId}`);
      }
    } catch (error) {
      console.error('Error updating quiz progress:', error);
    }
  };

  // Loading state
  if (lessonLoading || progressLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Error Handling */}
      {(lessonError || progressError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {lessonError || progressError}
            <button 
              onClick={() => {
                setLessonError(null);
                resetError();
              }}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lesson Header */}
      {lesson && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-600">{lesson.description}</p>
          {moduleInfo && (
            <p className="text-sm text-gray-500 mt-2">
              Module: {moduleInfo.title}
            </p>
          )}
        </div>
      )}

      {/* Progress Tracker */}
      <div className="mb-6">
        <ContentProgressTracker
          lessonId={lessonId}
          userId={currentUser.uid}
          contentType={activeContent}
          videoProgress={activeContent === 'video' ? progress : null}
          quizProgress={activeContent === 'quiz' ? progress : null}
          onProgressUpdate={(progress) => {
            console.log('Progress updated:', progress);
          }}
        />
      </div>

      {/* Content Area */}
      <Card>
        <CardContent className="p-6">
          {activeContent === 'video' && (
            <VideoPlayer
              lessonId={lessonId}
              onProgress={handleVideoProgress}
              initialProgress={progress?.lastPlaybackTime || 0}
              videoUrl={lesson?.videoUrl}
            />
          )}
          
          {activeContent === 'quiz' && (
            <QuizComponent
              lessonId={lessonId}
              onComplete={handleQuizComplete}
              disabled={progress?.type === 'video' && progress?.watchedPercentage < 90}
              quiz={lesson?.quiz}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonView;