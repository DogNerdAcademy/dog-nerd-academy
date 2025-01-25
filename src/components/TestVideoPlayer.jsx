// src/components/TestVideoPlayer.jsx
import React from 'react';
import VideoPlayer from './VideoPlayer';

const TestVideoPlayer = () => {
  const [showVideo, setShowVideo] = React.useState(false);
  const [lastPlaybackTime, setLastPlaybackTime] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  const handleProgress = (currentTime, progressPercent) => {
    setLastPlaybackTime(currentTime);
    setProgress(progressPercent);
    console.log(`Video Progress: ${progressPercent.toFixed(1)}%`);
  };

  const handleComplete = (duration) => {
    console.log(`Video completed! Duration: ${duration} seconds`);
    setProgress(100);
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Video Player Test</h3>
      <button
        onClick={() => setShowVideo(!showVideo)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showVideo ? 'Hide Video' : 'Show Test Video'}
      </button>

      {showVideo && (
        <div className="mt-4 w-[560px]">
          <VideoPlayer
            videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            onProgress={handleProgress}
            onComplete={handleComplete}
            lastPlaybackTime={lastPlaybackTime}
          />
          {/* Progress indicator */}
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Progress: {progress.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestVideoPlayer;