import { useState, useEffect } from 'react';

const ADMIN_KEY = 'blog_admin_key';
const ADMIN_PASSWORD_HASH = 'admin123'; // Simple password for demo - change this in production

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_KEY);
    if (saved === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD_HASH) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, 'true');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_KEY);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return {
    isAdmin,
    showLoginModal,
    login,
    logout,
    openLoginModal,
    closeLoginModal,
  };
}
