// src/pages/Dashboard.jsx
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';
import { seedDatabase } from '../utils/seedData';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { courses, loading, error, refetchCourses } = useCourses();
  
  console.log('Auth State:', currentUser);
  console.log('Dashboard State:', { courses, loading, error });

  const handleSeedData = async () => {
    await seedDatabase();
    refetchCourses();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        Error loading courses: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug Info Section */}
      <div className="bg-yellow-100 p-4 mb-4 rounded-lg">
        <h2 className="font-bold">Debug Info:</h2>
        <p>Auth Status: {currentUser ? 'Logged In' : 'Not Logged In'}</p>
        <p>User Email: {currentUser?.email}</p>
        <p>User ID: {currentUser?.uid}</p>
        <p>User Role: {currentUser?.role || 'none'}</p>
        {currentUser?.role === 'admin' && (
          <button
            onClick={handleSeedData}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Seed Test Data
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      
      {courses.length === 0 ? (
        <div className="text-center p-4 text-gray-600">
          No courses available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;