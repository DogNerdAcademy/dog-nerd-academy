import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import QuizTestingPage from './pages/admin/QuizTestingPage';

// Import course-related components
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';

// Error boundary component
const ErrorBoundary = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-4">We couldn't find the page you're looking for.</p>
        <a 
          href="/"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Return Home
        </a>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'courses',
        children: [
          {
            path: ':courseId',
            element: (
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: ':courseId/lessons/:lessonId',
            element: (
              <ProtectedRoute>
                <LessonDetail />
              </ProtectedRoute>
            ),
          }
        ]
      },
      {
        path: 'admin',
        children: [
          {
            path: 'quiz-testing',
            element: (
              <ProtectedRoute adminOnly>
                <QuizTestingPage />
              </ProtectedRoute>
            ),
          }
        ]
      }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;