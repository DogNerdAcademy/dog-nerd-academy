// src/components/LessonViewer.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const LessonViewer = ({ 
  course, 
  currentModule, 
  currentLesson,
  onComplete,
  onNext,
  onPrevious,
  onProgressUpdate 
}) => {
  const handleVideoProgress = (currentTime, progressPercent) => {
    onProgressUpdate?.(currentModule.id, currentLesson.id, {
      currentTime,
      progressPercent,
      type: 'video'
    });
  };

  const handleVideoComplete = (duration) => {
    onComplete?.(currentModule.id, currentLesson.id);
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  if (!currentLesson) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please select a lesson to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Lesson Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentLesson.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentModule.title}
            </p>
          </div>
          <button
            onClick={() => onComplete?.(currentModule.id, currentLesson.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentLesson.completed
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{currentLesson.completed ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          {currentLesson.type === 'video' && currentLesson.videoUrl && (
            <div className="mb-6">
              <VideoPlayer
                videoId={getYouTubeId(currentLesson.videoUrl)}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                lastPlaybackTime={currentLesson.lastPlaybackTime}
              />
            </div>
          )}
          
          <div className="lesson-content">
            {currentLesson.content}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t px-6 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={onNext}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;