// src/services/videoService.js
import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const updateVideoProgress = async (userId, lessonId, progressData) => {
  try {
    const progressRef = doc(db, 'progress', `${userId}_${lessonId}`);
    await setDoc(progressRef, {
      userId,
      lessonId,
      lastPlaybackTime: progressData.currentTime,
      watchedPercentage: progressData.progressPercent,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // If video is mostly watched (e.g., >90%), mark as completed
    if (progressData.progressPercent > 90) {
      await setDoc(progressRef, {
        completed: true,
        completedAt: serverTimestamp()
      }, { merge: true });
    }

    return true;
  } catch (error) {
    console.error('Error updating video progress:', error);
    throw error;
  }
};

export const getVideoProgress = async (userId, lessonId) => {
  try {
    const progressRef = doc(db, 'progress', `${userId}_${lessonId}`);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    
    return {
      lastPlaybackTime: 0,
      watchedPercentage: 0,
      completed: false
    };
  } catch (error) {
    console.error('Error getting video progress:', error);
    throw error;
  }
};