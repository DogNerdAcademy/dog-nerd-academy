// src/components/CourseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  // Status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
      scheduled: "bg-purple-100 text-purple-800"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200">
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-400">Course Image</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
              {course.difficulty}
            </span>
            {course.status && (
              <span className={`px-2 py-1 text-sm rounded-full ${getStatusBadge(course.status)}`}>
                {course.status}
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex justify-between items-center">
          <Link 
            to={`/courses/${course.id}`}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            {course.status === 'published' ? 'Start Learning' : 'Preview Course'}
          </Link>
          {course.status === 'scheduled' && (
            <span className="text-sm text-gray-600">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;