import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Terminal, Cpu } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { fetchPosts, fetchProfile } from '../utils/dataManager';
import type { Post, Profile } from '../types';

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [fetchedPosts, fetchedProfile] = await Promise.all([
        fetchPosts(),
        fetchProfile(),
      ]);
      setPosts(fetchedPosts.slice(0, 3));
      setProfile(fetchedProfile);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hi, I'm {profile?.name || 'Developer'}
              </h1>
              <p className="text-xl text-primary-100 mb-6">
                {profile?.title || 'Full Stack Developer'}
              </p>
              <p className="text-primary-100 mb-8 max-w-2xl">
                {profile?.bio || 'Passionate about building elegant solutions to complex problems.'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                >
                  Read Blog
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors"
                >
                  View All Posts
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center">
                <img
                  src={profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer'}
                  alt="Profile"
                  className="w-40 h-40 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {posts.length}+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Blog Posts</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profile?.skills?.length || 0}+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Technologies</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">5+</h3>
            <p className="text-gray-600 dark:text-gray-400">Years Experience</p>
          </div>
        </div>
      </section> */}

      {/* Recent Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Posts
          </h2>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              No posts yet. Start writing your first blog post!
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Posts
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
