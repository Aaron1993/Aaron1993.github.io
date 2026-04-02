import { useState, useEffect } from 'react';

const ADMIN_KEY = 'blog_admin_key';
const ADMIN_HASH_KEY = 'blog_admin_hash';
const ADMIN_SALT_KEY = 'blog_admin_salt';

// Generate a random salt
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash password with salt using SHA-256
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Initialize admin password from env or use default
async function initializeAdminPassword(): Promise<{ hash: string; salt: string }> {
  // Check if already initialized
  const existingHash = localStorage.getItem(ADMIN_HASH_KEY);
  const existingSalt = localStorage.getItem(ADMIN_SALT_KEY);
  
  if (existingHash && existingSalt) {
    return { hash: existingHash, salt: existingSalt };
  }
  
  // Initialize with env password or default
  const password = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  
  localStorage.setItem(ADMIN_HASH_KEY, hash);
  localStorage.setItem(ADMIN_SALT_KEY, salt);
  
  return { hash, salt };
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{ hash: string; salt: string } | null>(null);

  useEffect(() => {
    // Initialize credentials
    initializeAdminPassword().then(setAdminCredentials);
    
    // Check if already logged in
    const saved = localStorage.getItem(ADMIN_KEY);
    if (saved === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    if (!adminCredentials) return false;
    
    const inputHash = await hashPassword(password, adminCredentials.salt);
    if (inputHash === adminCredentials.hash) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, 'true');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    const salt = generateSalt();
    const hash = await hashPassword(newPassword, salt);
    
    localStorage.setItem(ADMIN_HASH_KEY, hash);
    localStorage.setItem(ADMIN_SALT_KEY, salt);
    setAdminCredentials({ hash, salt });
    
    return true;
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
    changePassword,
  };
}
