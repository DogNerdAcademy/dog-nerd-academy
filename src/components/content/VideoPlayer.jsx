// src/components/content/VideoPlayer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

const VideoPlayer = ({
  lessonId,
  videoUrl,
  onProgress,
  initialProgress = 0
}) => {
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: initialProgress,
    duration: 0,
    loading: true,
    error: null
  });

  // Extract video ID from URL
  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Update progress every 5 seconds
  const updateProgress = useCallback(async () => {
    if (!player || !playerState.duration) return;

    const currentTime = await player.getCurrentTime();
    const watchedPercentage = (currentTime / playerState.duration) * 100;

    onProgress({
      lastPlaybackTime: currentTime,
      videoDuration: playerState.duration,
      watchedPercentage: Math.min(watchedPercentage, 100)
    });
  }, [player, playerState.duration, onProgress]);

  // Set up progress update interval
  useEffect(() => {
    if (!player || !playerState.isPlaying) return;

    const intervalId = setInterval(updateProgress, 5000);
    return () => clearInterval(intervalId);
  }, [player, playerState.isPlaying, updateProgress]);

  // YouTube player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      start: Math.floor(initialProgress),
      autoplay: 0,
      modestbranding: 1,
      rel: 0
    }
  };

  // Player event handlers
  const onReady = (event) => {
    setPlayer(event.target);
    setPlayerState(prev => ({
      ...prev,
      duration: event.target.getDuration(),
      loading: false
    }));
  };

  const onStateChange = (event) => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: event.data === YouTube.PlayerState.PLAYING
    }));
  };

  const onError = (error) => {
    setPlayerState(prev => ({
      ...prev,
      error: 'Error loading video. Please try again.',
      loading: false
    }));
    console.error('YouTube Player Error:', error);
  };

  // UI control handlers
  const handlePlayPause = () => {
    if (!player) return;
    
    if (playerState.isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleRestart = () => {
    if (!player) return;
    player.seekTo(0);
    player.playVideo();
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invalid video URL provided.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative pt-[56.25%]">
        {playerState.loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        <div className={`absolute inset-0 ${playerState.loading ? 'opacity-0' : 'opacity-100'}`}>
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={playerState.loading}
          >
            {playerState.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          
          <button
            onClick={handleRestart}
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={playerState.loading}
          >
            <RotateCcw className="h-6 w-6" />
          </button>
          
          <div className="flex-grow">
            <Progress 
              value={(playerState.currentTime / playerState.duration) * 100} 
              className="h-2"
            />
          </div>
        </div>

        {playerState.error && (
          <Alert variant="destructive">
            <AlertDescription>{playerState.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;