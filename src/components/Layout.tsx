import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Layout({ children, darkMode, toggleDarkMode, isAdmin, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        isAdmin={isAdmin}
        onLogout={onLogout}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
