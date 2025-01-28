// src/services/quizService.js
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// Types
/**
 * @typedef {Object} QuizQuestion
 * @property {string} id - Unique identifier for the question
 * @property {string} text - The question text
 * @property {string[]} options - Array of possible answers
 * @property {number} correctOption - Index of the correct answer
 * @property {string} explanation - Explanation of the correct answer
 */

/**
 * @typedef {Object} Quiz
 * @property {string} id - Quiz identifier
 * @property {string} lessonId - Associated lesson ID
 * @property {string} title - Quiz title
 * @property {QuizQuestion[]} questions - Array of quiz questions
 * @property {number} passingScore - Minimum score needed to pass (percentage)
 * @property {boolean} isRequired - Whether quiz completion is required for lesson completion
 * @property {number} maxAttempts - Maximum number of attempts allowed (0 for unlimited)
 */

/**
 * @typedef {Object} QuizAttempt
 * @property {string} quizId - Quiz identifier
 * @property {string} userId - User identifier
 * @property {number} score - Score achieved (percentage)
 * @property {boolean} passed - Whether the attempt passed the quiz
 * @property {number[]} answers - Array of selected answer indices
 * @property {Date} timestamp - When the attempt was made
 */

class QuizService {
  constructor() {
    this.quizCollection = collection(db, 'quizzes');
    this.attemptCollection = collection(db, 'quiz-attempts');
  }

  /**
   * Fetch a quiz by its ID
   * @param {string} quizId
   * @returns {Promise<Quiz>}
   */
  async getQuizById(quizId) {
    const quizDoc = await getDoc(doc(this.quizCollection, quizId));
    if (!quizDoc.exists()) {
      throw new Error('Quiz not found');
    }
    return { id: quizDoc.id, ...quizDoc.data() };
  }

  /**
   * Fetch all quizzes for a specific lesson
   * @param {string} lessonId
   * @returns {Promise<Quiz[]>}
   */
  async getQuizzesByLesson(lessonId) {
    const q = query(this.quizCollection, where('lessonId', '==', lessonId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Create a new quiz
   * @param {Omit<Quiz, 'id'>} quizData
   * @returns {Promise<string>} The ID of the created quiz
   */
  async createQuiz(quizData) {
    const docRef = await addDoc(this.quizCollection, {
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  /**
   * Update an existing quiz
   * @param {string} quizId
   * @param {Partial<Quiz>} updates
   * @returns {Promise<void>}
   */
  async updateQuiz(quizId, updates) {
    const quizRef = doc(this.quizCollection, quizId);
    await updateDoc(quizRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  /**
   * Delete a quiz
   * @param {string} quizId
   * @returns {Promise<void>}
   */
  async deleteQuiz(quizId) {
    await deleteDoc(doc(this.quizCollection, quizId));
  }

  /**
   * Submit a quiz attempt and calculate score
   * @param {string} quizId
   * @param {string} userId
   * @param {number[]} answers - Array of selected answer indices
   * @returns {Promise<{score: number, passed: boolean, feedback: Object[]}>}
   */
  async submitQuizAttempt(quizId, userId, answers) {
    const quiz = await this.getQuizById(quizId);
    const score = this.calculateScore(quiz.questions, answers);
    const passed = score >= quiz.passingScore;

    // Generate feedback for each question
    const feedback = quiz.questions.map((question, index) => ({
      questionId: question.id,
      correct: answers[index] === question.correctOption,
      explanation: question.explanation
    }));

    // Store the attempt
    await this.recordAttempt(quizId, userId, {
      score,
      passed,
      answers,
      timestamp: new Date()
    });

    return { score, passed, feedback };
  }

  /**
   * Get the best score from all attempts for a quiz
   * @param {string} userId
   * @param {string} quizId
   * @returns {Promise<number|null>} Best score or null if no attempts
   */
  async getBestAttemptScore(userId, quizId) {
    try {
      const q = query(
        this.attemptCollection,
        where('userId', '==', userId),
        where('quizId', '==', quizId)
      );
      
      const querySnapshot = await getDocs(q);
      const attempts = querySnapshot.docs.map(doc => doc.data());
      
      if (!attempts.length) return null;
      return Math.max(...attempts.map(attempt => attempt.score));
    } catch (error) {
      console.error('Error getting best attempt:', error);
      throw error;
    }
  }

  /**
   * Get all attempts for a user on a specific quiz
   * @param {string} userId
   * @param {string} quizId
   * @returns {Promise<QuizAttempt[]>}
   */
  async getUserAttempts(userId, quizId) {
    const q = query(
      this.attemptCollection,
      where('userId', '==', userId),
      where('quizId', '==', quizId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Check if user has passed the quiz
   * @param {string} userId
   * @param {string} quizId
   * @returns {Promise<boolean>}
   */
  async hasPassedQuiz(userId, quizId) {
    try {
      const quiz = await this.getQuizById(quizId);
      const bestScore = await this.getBestAttemptScore(userId, quizId);
      return bestScore !== null && bestScore >= quiz.passingScore;
    } catch (error) {
      console.error('Error checking quiz passing status:', error);
      throw error;
    }
  }

  /**
   * Calculate the score for a quiz attempt
   * @private
   * @param {QuizQuestion[]} questions
   * @param {number[]} answers
   * @returns {number} Percentage score (0-100)
   */
  calculateScore(questions, answers) {
    const correctAnswers = questions.reduce((count, question, index) => {
      return count + (question.correctOption === answers[index] ? 1 : 0);
    }, 0);
    return (correctAnswers / questions.length) * 100;
  }

  /**
   * Record a quiz attempt in Firestore
   * @private
   * @param {string} quizId
   * @param {string} userId
   * @param {Object} attemptData
   * @returns {Promise<void>}
   */
  async recordAttempt(quizId, userId, attemptData) {
    await addDoc(this.attemptCollection, {
      quizId,
      userId,
      ...attemptData
    });
  }
}

export const quizService = new QuizService();