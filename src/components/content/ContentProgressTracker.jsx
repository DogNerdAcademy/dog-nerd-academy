// src/components/content/ContentProgressTracker.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, PlayCircle } from 'lucide-react';

const ContentProgressTracker = ({ 
  lessonId, 
  userId,
  contentType, // 'video' | 'quiz'
  videoProgress = null, // { lastPlaybackTime, videoDuration, watchedPercentage }
  quizProgress = null, // { completed, score }
  onProgressUpdate 
}) => {
  const [unifiedProgress, setUnifiedProgress] = useState({
    completed: false,
    percentComplete: 0,
    status: 'not-started' // 'not-started' | 'in-progress' | 'completed'
  });

  // Calculate unified progress based on content type
  useEffect(() => {
    let newProgress = { ...unifiedProgress };

    if (contentType === 'video' && videoProgress) {
      newProgress = {
        completed: videoProgress.watchedPercentage >= 90,
        percentComplete: videoProgress.watchedPercentage,
        status: videoProgress.watchedPercentage >= 90 
          ? 'completed' 
          : videoProgress.watchedPercentage > 0 
            ? 'in-progress' 
            : 'not-started'
      };
    } else if (contentType === 'quiz' && quizProgress) {
      newProgress = {
        completed: quizProgress.completed,
        percentComplete: quizProgress.completed ? 100 : 0,
        status: quizProgress.completed 
          ? 'completed' 
          : quizProgress.score !== null 
            ? 'in-progress' 
            : 'not-started'
      };
    }

    setUnifiedProgress(newProgress);
    if (onProgressUpdate) {
      onProgressUpdate(newProgress);
    }
  }, [contentType, videoProgress, quizProgress]);

  const getStatusIcon = () => {
    switch (unifiedProgress.status) {
      case 'completed':
        return <CheckCircle className="text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="text-blue-500" />;
      default:
        return <AlertCircle className="text-gray-400" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {contentType === 'video' ? 'Video Progress' : 'Quiz Progress'}
        </CardTitle>
        <div className="h-4 w-4">
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress 
            value={unifiedProgress.percentComplete} 
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            {unifiedProgress.percentComplete.toFixed(0)}% Complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentProgressTracker;