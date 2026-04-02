import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/blog/${post.id}`} className="block p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</time>
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <div className="flex gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs">+{post.tags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
