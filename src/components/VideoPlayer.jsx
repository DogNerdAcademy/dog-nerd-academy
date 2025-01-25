// src/components/VideoPlayer.jsx
import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ 
  videoUrl, 
  onProgress, 
  onComplete,
  lastPlaybackTime = 0 
}) => {
  const [player, setPlayer] = useState(null);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  
  // YouTube player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      start: Math.floor(lastPlaybackTime),
      modestbranding: 1,
      rel: 0 // Don't show related videos
    },
  };

  // Track progress every 5 seconds
  useEffect(() => {
    if (!player) return;

    const progressInterval = setInterval(async () => {
      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        const progress = (currentTime / duration) * 100;
        
        onProgress?.(currentTime, progress);
      } catch (error) {
        console.error('Error tracking video progress:', error);
      }
    }, 5000);

    return () => clearInterval(progressInterval);
  }, [player, onProgress]);

  const handleReady = (event) => {
    setPlayer(event.target);
    console.log('Video Player Ready');
  };

  const handleStateChange = async (event) => {
    // YouTube Player States:
    // -1 (unstarted)
    // 0 (ended)
    // 1 (playing)
    // 2 (paused)
    // 3 (buffering)
    // 5 (video cued)
    
    if (event.data === YouTube.PlayerState.ENDED) {
      const duration = await player.getDuration();
      onComplete?.(duration);
      console.log('Video completed');
    }
  };

  const handleError = (error) => {
    console.error('YouTube Player Error:', error);
  };

  if (!videoId) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="relative pt-[56.25%] w-full bg-black rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={handleReady}
          onStateChange={handleStateChange}
          onError={handleError}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;