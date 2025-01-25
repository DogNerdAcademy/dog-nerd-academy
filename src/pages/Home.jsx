// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Dog Nerd Academy</h1>
      <div className="space-x-4">
        {!currentUser ? (
          <>
            <Link
              to="/login"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Register
            </Link>
          </>
        ) : (
          <Link
            to="/dashboard"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}