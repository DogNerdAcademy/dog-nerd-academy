// src/hooks/useCourses.js
import { useState, useEffect } from 'react';
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// Hook for fetching all courses
export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesCollection = collection(db, 'courses');
        const querySnapshot = await getDocs(coursesCollection);
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};

// Hook for fetching single course details with modules and lessons
export const useCourseDetails = (courseId) => {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          throw new Error('Course not found');
        }
        
        // Get course data
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);

        // Fetch modules for the course
        const modulesQuery = query(
          collection(db, 'modules'),
          where('courseId', '==', courseId)
        );
        const moduleSnapshots = await getDocs(modulesQuery);
        
        // Fetch user progress if authenticated
        let userProgress = {};
        if (currentUser) {
          const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', currentUser.uid),
            where('courseId', '==', courseId)
          );
          const progressSnapshots = await getDocs(progressQuery);
          progressSnapshots.forEach(doc => {
            const data = doc.data();
            userProgress[data.lessonId] = data;
          });
        }

        // Create an array to store modules with their lessons
        const modulesWithLessons = [];

        // Fetch lessons for each module
        for (const moduleDoc of moduleSnapshots.docs) {
          const moduleData = { id: moduleDoc.id, ...moduleDoc.data() };
          
          // Fetch lessons for this module
          const lessonsQuery = query(
            collection(db, 'lessons'),
            where('moduleId', '==', moduleDoc.id)
          );
          const lessonSnapshots = await getDocs(lessonsQuery);
          
          // Add lessons to module data with progress information
          moduleData.lessons = lessonSnapshots.docs.map(lessonDoc => ({
            id: lessonDoc.id,
            ...lessonDoc.data(),
            completed: !!userProgress[lessonDoc.id]?.completed,
            lastAccessed: userProgress[lessonDoc.id]?.lastAccessed
          }));

          // Sort lessons by orderIndex
          moduleData.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
          
          modulesWithLessons.push(moduleData);
        }

        // Sort modules by orderIndex
        modulesWithLessons.sort((a, b) => a.orderIndex - b.orderIndex);
        
        // Update modules state
        setModules(modulesWithLessons);
        setError(null);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, currentUser]);

  const updateLessonProgress = async (moduleId, lessonId, completed) => {
    if (!currentUser) return;

    try {
      const progressRef = doc(db, 'progress', `${currentUser.uid}_${lessonId}`);
      await setDoc(progressRef, {
        userId: currentUser.uid,
        courseId,
        moduleId,
        lessonId,
        completed,
        lastAccessed: serverTimestamp()
      }, { merge: true });

      // Update local state
      setModules(prevModules => {
        return prevModules.map(module => {
          if (module.id !== moduleId) return module;
          
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.id !== lessonId) return lesson;
              
              return {
                ...lesson,
                completed,
                lastAccessed: new Date()
              };
            })
          };
        });
      });
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      throw err;
    }
  };

  const getCourseProgress = () => {
    if (!modules.length) return 0;
    
    const totalLessons = modules.reduce((total, module) => 
      total + module.lessons.length, 0
    );
    
    const completedLessons = modules.reduce((total, module) => 
      total + module.lessons.filter(lesson => lesson.completed).length, 0
    );
    
    return totalLessons ? (completedLessons / totalLessons) * 100 : 0;
  };

  return { 
    course, 
    modules, 
    loading, 
    error, 
    updateLessonProgress,
    getCourseProgress
  };
};