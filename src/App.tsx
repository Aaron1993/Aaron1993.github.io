import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginModal } from './components/LoginModal';
import { Home } from './pages/Home';
import { BlogList } from './pages/BlogList';
import { BlogPost } from './pages/BlogPost';
import { BlogEdit } from './pages/BlogEdit';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { useAuth } from './hooks/useAuth';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { isAdmin, showLoginModal, login, logout, openLoginModal, closeLoginModal } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <>
      <Layout 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        isAdmin={isAdmin}
        onLogout={logout}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost isAdmin={isAdmin} />} />
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <Admin onLogout={logout} />
              ) : (
                <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Admin Access Required
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please login to access the admin dashboard.
                  </p>
                  <button
                    onClick={openLoginModal}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )
            } 
          />
          <Route 
            path="/edit" 
            element={
              isAdmin ? (
                <BlogEdit isAdmin={isAdmin} onLoginClick={openLoginModal} />
              ) : (
                <Navigate to="/blog" replace />
              )
            } 
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal} 
        onLogin={login} 
      />
    </>
  );
}

export default App;
