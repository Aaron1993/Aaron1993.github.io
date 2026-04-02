import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, LogOut, FileText, AlertCircle, X } from 'lucide-react';
import { fetchPosts, deletePost } from '../utils/dataManager';
import type { Post } from '../types';

interface AdminProps {
  onLogout: () => void;
}

export function Admin({ onLogout }: AdminProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; postId: string | null; postTitle: string }>({
    show: false,
    postId: null,
    postTitle: '',
  });

  const loadPosts = async () => {
    const fetchedPosts = await fetchPosts();
    setPosts(fetchedPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openDeleteModal = (post: Post) => {
    setDeleteModal({
      show: true,
      postId: post.id,
      postTitle: post.title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, postId: null, postTitle: '' });
  };

  const confirmDelete = () => {
    if (deleteModal.postId) {
      deletePost(deleteModal.postId);
      loadPosts();
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-primary-100">Manage your blog posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/edit"
              className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {posts.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Posts
          </h2>
        </div>

        {posts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {posts.map((post) => (
              <div
                key={post.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(post.createdAt).toLocaleDateString('zh-CN')} · {post.tags.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    to={`/blog/${post.id}`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="View"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/edit?id=${post.id}`}
                    className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(post)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No posts yet. Create your first blog post!
            </p>
            <Link
              to="/edit"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Confirm Delete
              </h3>
              <button
                onClick={closeDeleteModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the post:
              <br />
              <span className="font-semibold text-gray-900 dark:text-white">
                "{deleteModal.postTitle}"
              </span>
              ?
              <br />
              <span className="text-sm text-red-500">This action cannot be undone.</span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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
