import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

const COURSES_COLLECTION = 'courses';
const MODULES_COLLECTION = 'modules';
const LESSONS_COLLECTION = 'lessons';
const PROGRESS_COLLECTION = 'progress';

// Course Operations
export const getAllCourses = async (isAdmin = false) => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    let q;
    
    if (isAdmin) {
      q = query(coursesRef, orderBy('orderIndex'));
    } else {
      q = query(
        coursesRef,
        where('status', '==', 'published')
      );
    }

    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return courses.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourseById = async (courseId) => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      throw new Error('Course not found');
    }
    return {
      id: courseDoc.id,
      ...courseDoc.data()
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const newCourse = {
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: courseData.status || 'draft'
    };
    const docRef = await addDoc(coursesRef, newCourse);
    return {
      id: docRef.id,
      ...newCourse
    };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    const updateData = {
      ...courseData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(courseRef, updateData);
    return {
      id: courseId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Module Operations
export const getModulesByCourseId = async (courseId) => {
  try {
    const modulesRef = collection(db, MODULES_COLLECTION);
    const q = query(
      modulesRef, 
      where('courseId', '==', courseId),
      orderBy('orderIndex')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

export const createModule = async (moduleData) => {
  try {
    const modulesRef = collection(db, MODULES_COLLECTION);
    const newModule = {
      ...moduleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: moduleData.status || 'draft'
    };
    const docRef = await addDoc(modulesRef, newModule);
    return {
      id: docRef.id,
      ...newModule
    };
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

export const updateModule = async (moduleId, moduleData) => {
  try {
    const moduleRef = doc(db, MODULES_COLLECTION, moduleId);
    const updateData = {
      ...moduleData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(moduleRef, updateData);
    return {
      id: moduleId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

// Lesson Operations
export const getLessonsByModuleId = async (moduleId) => {
  try {
    const lessonsRef = collection(db, LESSONS_COLLECTION);
    const q = query(
      lessonsRef,
      where('moduleId', '==', moduleId),
      orderBy('orderIndex')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

export const getLessonById = async (lessonId) => {
  try {
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    const lessonDoc = await getDoc(lessonRef);
    if (!lessonDoc.exists()) {
      throw new Error('Lesson not found');
    }
    return {
      id: lessonDoc.id,
      ...lessonDoc.data()
    };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

export const createLesson = async (lessonData) => {
  try {
    const lessonsRef = collection(db, LESSONS_COLLECTION);
    const newLesson = {
      ...lessonData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: lessonData.status || 'draft',
      videoUrl: lessonData.videoUrl || null,
      lastPlaybackTime: 0,
      videoDuration: null,
      watchedPercentage: 0
    };
    const docRef = await addDoc(lessonsRef, newLesson);
    return {
      id: docRef.id,
      ...newLesson
    };
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const updateLesson = async (lessonId, lessonData) => {
  try {
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    // Only admin can update these fields
    if (!lessonData.hasOwnProperty('id') && !lessonData.hasOwnProperty('moduleId')) {
      const updateData = {
        ...lessonData,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(lessonRef, updateData);
      return {
        id: lessonId,
        ...updateData
      };
    } else {
      throw new Error('Cannot update id or moduleId fields');
    }
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const updateLessonProgress = async (lessonId, progressData) => {
  try {
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    const updateData = {
      lastPlaybackTime: progressData.currentTime || 0,
      videoDuration: progressData.duration || null,
      watchedPercentage: progressData.progress || 0,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(lessonRef, updateData);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Test Data Functions
export const addTestCourses = async () => {
  const coursesRef = collection(db, COURSES_COLLECTION);
  
  const testCourses = [
    {
      title: "Basic Dog Training",
      description: "Learn the fundamentals of dog training",
      difficulty: "Beginner",
      status: "published",
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: "Advanced Behavior Modification",
      description: "Advanced techniques for behavior modification",
      difficulty: "Advanced",
      status: "published",
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const course of testCourses) {
    try {
      await addDoc(coursesRef, course);
      console.log('Added course:', course.title);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  }
};