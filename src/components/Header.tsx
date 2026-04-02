import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, User, Moon, Sun, LogOut, Shield, BookOpen, Award, Briefcase, Globe, Star, Heart, Zap, Layout, type LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSiteConfig } from '../utils/dataManager';
import type { NavItem } from '../types';

const iconMap: Record<string, LucideIcon> = {
  Home,
  FileText,
  User,
  Shield,
  BookOpen,
  Award,
  Briefcase,
  Globe,
  Star,
  Heart,
  Zap,
  Layout,
};

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Header({ darkMode, toggleDarkMode, isAdmin, onLogout }: HeaderProps) {
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const config = getSiteConfig();
    const items = isAdmin 
      ? [
          { id: 'admin', label: 'Dashboard', path: '/admin', icon: 'Shield', order: 0, enabled: true, isCustom: false },
          { id: 'blog', label: 'Blog', path: '/blog', icon: 'FileText', order: 1, enabled: true, isCustom: false },
        ]
      : config.navItems.filter(item => item.enabled).sort((a, b) => a.order - b.order);
    setNavItems(items);
  }, [isAdmin]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">HL</span>
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">Hailong's Page</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Layout;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Layout;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
