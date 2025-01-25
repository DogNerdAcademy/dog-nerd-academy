// src/layouts/RootLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RootLayout = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Dog Nerd Academy</Link>
          <nav>
            <ul className="flex space-x-4">
              {currentUser && (
                <>
                  <li>
                    <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="hover:text-gray-200">
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Dog Nerd Academy</p>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;