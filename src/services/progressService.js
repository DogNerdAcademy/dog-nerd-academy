// src/services/progressService.js
import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

class ProgressService {
  constructor() {
    this.progressCollection = 'progress';
  }

  // Generate a unique progress document ID
  generateProgressId(userId, lessonId) {
    return `${userId}_${lessonId}`;
  }

  // Create or update video progress
  async updateVideoProgress(userId, lessonId, progressData) {
    const progressId = this.generateProgressId(userId, lessonId);
    const progressRef = doc(db, this.progressCollection, progressId);
    
    try {
      const docSnap = await getDoc(progressRef);
      
      const progressUpdate = {
        userId,
        lessonId,
        lastUpdated: new Date(),
        lastPlaybackTime: progressData.lastPlaybackTime,
        watchedPercentage: progressData.watchedPercentage,
        videoDuration: progressData.videoDuration,
        type: 'video'
      };

      if (!docSnap.exists()) {
        await setDoc(progressRef, progressUpdate);
      } else {
        await updateDoc(progressRef, progressUpdate);
      }

      return progressUpdate;
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  }

  // Create or update quiz progress
  async updateQuizProgress(userId, lessonId, progressData) {
    const progressId = this.generateProgressId(userId, lessonId);
    const progressRef = doc(db, this.progressCollection, progressId);
    
    try {
      const docSnap = await getDoc(progressRef);
      
      const progressUpdate = {
        userId,
        lessonId,
        lastUpdated: new Date(),
        completed: progressData.completed,
        score: progressData.score,
        type: 'quiz'
      };

      if (!docSnap.exists()) {
        await setDoc(progressRef, progressUpdate);
      } else {
        await updateDoc(progressRef, progressUpdate);
      }

      return progressUpdate;
    } catch (error) {
      console.error('Error updating quiz progress:', error);
      throw error;
    }
  }

  // Get progress for a specific lesson
  async getLessonProgress(userId, lessonId) {
    const progressId = this.generateProgressId(userId, lessonId);
    const progressRef = doc(db, this.progressCollection, progressId);
    
    try {
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      throw error;
    }
  }

  // Get all progress for a user in a course
  async getCourseProgress(userId, courseId) {
    try {
      const q = query(
        collection(db, this.progressCollection),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );

      const querySnapshot = await getDocs(q);
      const progress = {};
      
      querySnapshot.forEach((doc) => {
        progress[doc.data().lessonId] = doc.data();
      });

      return progress;
    } catch (error) {
      console.error('Error getting course progress:', error);
      throw error;
    }
  }

  // Calculate overall course completion percentage
  async calculateCourseCompletion(userId, courseId, totalLessons) {
    try {
      const courseProgress = await this.getCourseProgress(userId, courseId);
      const completedLessons = Object.values(courseProgress).filter(
        progress => (
          (progress.type === 'video' && progress.watchedPercentage >= 90) ||
          (progress.type === 'quiz' && progress.completed)
        )
      ).length;

      return (completedLessons / totalLessons) * 100;
    } catch (error) {
      console.error('Error calculating course completion:', error);
      throw error;
    }
  }
}

export const progressService = new ProgressService();