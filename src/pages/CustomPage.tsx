import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getSiteConfig } from '../utils/dataManager';
import type { NavItem } from '../types';

export function CustomPage() {
  const { path } = useParams<{ path: string }>();
  const [navItem, setNavItem] = useState<NavItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const config = getSiteConfig();
    const item = config.navItems.find(
      (n) => n.path === `/${path}` && n.isCustom && n.enabled
    );
    setNavItem(item || null);
    setLoading(false);
  }, [path]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!navItem) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {navItem.label}
          </h1>
          {navItem.content ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {navItem.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              This is a custom page for "{navItem.label}". You can add content to this page through the admin panel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
