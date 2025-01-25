// src/services/courseService.js
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

// Course Operations
export const getAllCourses = async (isAdmin = false) => {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    let q;
    
    if (isAdmin) {
      // For admin, just order by orderIndex
      q = query(coursesRef, orderBy('orderIndex'));
    } else {
      // For regular users, temporarily remove orderBy until index is created
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

    // Sort manually for now
    return courses.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
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

// Test Data Function
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