import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Edit2, Trash2, X } from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { fetchPosts, deletePost } from '../utils/dataManager';
import type { Post } from '../types';

interface BlogPostProps {
  isAdmin: boolean;
}

export function BlogPost({ isAdmin }: BlogPostProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      const posts = await fetchPosts();
      const foundPost = posts.find((p) => p.id === id);
      if (foundPost) {
        setPost(foundPost);
      }
      setLoading(false);
    };
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl mt-8" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</time>
            </div>

            {post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <>
                <Link
                  to={`/edit?id=${post.id}`}
                  className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </header>

        {/* Post Content */}
        <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Post Footer */}
        <footer className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Last updated: {new Date(post.updatedAt).toLocaleDateString('zh-CN')}
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All Posts
            </Link>
          </div>
        </footer>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && post && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Confirm Delete
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the post:
              <br />
              <span className="font-semibold text-gray-900 dark:text-white">
                "{post.title}"
              </span>
              ?
              <br />
              <span className="text-sm text-red-500">This action cannot be undone.</span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePost(post.id);
                  navigate('/blog');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
