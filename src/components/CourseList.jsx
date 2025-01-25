// src/components/CourseList.jsx
import React from 'react';
import { useCourses } from '../hooks/useCourses';
import CourseCard from './CourseCard';  // This import should now work

const CourseList = () => {
  const { courses, loading, error } = useCourses();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading courses: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};

export default CourseList;  // Make sure this is here too