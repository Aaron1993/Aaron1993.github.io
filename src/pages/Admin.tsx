import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, LogOut, FileText, AlertCircle, X, Menu, User, Lock, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { fetchPosts, deletePost, getSiteConfig, addNavItem, updateNavItem, deleteNavItem, addAboutSection, updateAboutSection, deleteAboutSection } from '../utils/dataManager';
import type { Post, NavItem, AboutSection } from '../types';

interface AdminProps {
  onLogout: () => void;
  onChangePassword?: (newPassword: string) => Promise<boolean>;
}

const AVAILABLE_ICONS = ['Home', 'FileText', 'User', 'BookOpen', 'Award', 'Briefcase', 'Globe', 'Star', 'Heart', 'Zap', 'Layout'];

export function Admin({ onLogout, onChangePassword }: AdminProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'nav' | 'about' | 'password'>('posts');
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; postId: string | null; postTitle: string }>({
    show: false,
    postId: null,
    postTitle: '',
  });
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Nav item editing state
  const [newNavItem, setNewNavItem] = useState<Partial<NavItem>>({ label: '', path: '', icon: 'Layout', order: 0, enabled: true, isCustom: true, content: '' });
  const [editingNavItemId, setEditingNavItemId] = useState<string | null>(null);
  const [editingNavContent, setEditingNavContent] = useState('');
  
  // About section editing state
  const [newAboutSection, setNewAboutSection] = useState<Partial<AboutSection>>({ title: '', content: '', order: 0, enabled: true });

  const loadPosts = async () => {
    const fetchedPosts = await fetchPosts();
    setPosts(fetchedPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setLoading(false);
  };
  
  const loadConfig = () => {
    const config = getSiteConfig();
    setNavItems(config.navItems);
    setAboutSections(config.aboutSections);
  };

  useEffect(() => {
    loadPosts();
    loadConfig();
  }, []);
  
  // Password change handler
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (onChangePassword) {
      const success = await onChangePassword(newPassword);
      if (success) {
        setPasswordSuccess('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError('Failed to change password');
      }
    }
  };
  
  // Nav item handlers
  const handleAddNavItem = () => {
    if (!newNavItem.label || !newNavItem.path) return;
    const item = addNavItem(newNavItem as Omit<NavItem, 'id'>);
    setNavItems([...navItems, item]);
    setNewNavItem({ label: '', path: '', icon: 'Layout', order: navItems.length, enabled: true, isCustom: true });
  };
  
  const handleUpdateNavItem = (id: string, updates: Partial<NavItem>) => {
    updateNavItem(id, updates);
    loadConfig();
  };
  
  const handleDeleteNavItem = (id: string) => {
    deleteNavItem(id);
    loadConfig();
  };
  
  const moveNavItem = (id: string, direction: 'up' | 'down') => {
    const index = navItems.findIndex(item => item.id === id);
    if (index < 0) return;
    
    const newItems = [...navItems];
    if (direction === 'up' && index > 0) {
      const temp = newItems[index].order;
      newItems[index].order = newItems[index - 1].order;
      newItems[index - 1].order = temp;
    } else if (direction === 'down' && index < newItems.length - 1) {
      const temp = newItems[index].order;
      newItems[index].order = newItems[index + 1].order;
      newItems[index + 1].order = temp;
    }
    
    newItems.forEach(item => updateNavItem(item.id, { order: item.order }));
    loadConfig();
  };
  
  // About section handlers
  const handleAddAboutSection = () => {
    if (!newAboutSection.title) return;
    const section = addAboutSection(newAboutSection as Omit<AboutSection, 'id'>);
    setAboutSections([...aboutSections, section]);
    setNewAboutSection({ title: '', content: '', order: aboutSections.length, enabled: true });
  };
  
  const handleUpdateAboutSection = (id: string, updates: Partial<AboutSection>) => {
    updateAboutSection(id, updates);
    loadConfig();
  };
  
  const handleDeleteAboutSection = (id: string) => {
    deleteAboutSection(id);
    loadConfig();
  };
  
  const moveAboutSection = (id: string, direction: 'up' | 'down') => {
    const index = aboutSections.findIndex(section => section.id === id);
    if (index < 0) return;
    
    const newSections = [...aboutSections];
    if (direction === 'up' && index > 0) {
      const temp = newSections[index].order;
      newSections[index].order = newSections[index - 1].order;
      newSections[index - 1].order = temp;
    } else if (direction === 'down' && index < newSections.length - 1) {
      const temp = newSections[index].order;
      newSections[index].order = newSections[index + 1].order;
      newSections[index + 1].order = temp;
    }
    
    newSections.forEach(section => updateAboutSection(section.id, { order: section.order }));
    loadConfig();
  };

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
            <p className="text-primary-100">Manage your blog and site settings</p>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'nav', label: 'Navigation', icon: Menu },
          { id: 'about', label: 'About Page', icon: User },
          { id: 'password', label: 'Password', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <>
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
        </>
      )}

      {/* Navigation Tab */}
      {activeTab === 'nav' && (
        <div className="space-y-6">
          {/* Add New Nav Item */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Navigation Item
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Label (e.g., Publications)"
                value={newNavItem.label}
                onChange={(e) => setNewNavItem({ ...newNavItem, label: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Path (e.g., /publications)"
                value={newNavItem.path}
                onChange={(e) => setNewNavItem({ ...newNavItem, path: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <select
                value={newNavItem.icon}
                onChange={(e) => setNewNavItem({ ...newNavItem, icon: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <button
                onClick={handleAddNavItem}
                disabled={!newNavItem.label || !newNavItem.path}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Nav Items List */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navigation Items
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {navItems.map((item, index) => (
                <div key={item.id}>
                  <div
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                      <span className="text-sm text-gray-500">{item.path}</span>
                      {item.isCustom && (
                        <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-1 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isCustom && (
                        <button
                          onClick={() => {
                            if (editingNavItemId === item.id) {
                              setEditingNavItemId(null);
                              setEditingNavContent('');
                            } else {
                              setEditingNavItemId(item.id);
                              setEditingNavContent(item.content || '');
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            editingNavItemId === item.id
                              ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                          title="Edit Content"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateNavItem(item.id, { enabled: !item.enabled })}
                        className={`p-2 rounded-lg transition-colors ${
                          item.enabled
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title={item.enabled ? 'Enabled' : 'Disabled'}
                      >
                        {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => moveNavItem(item.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveNavItem(item.id, 'down')}
                        disabled={index === navItems.length - 1}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {item.isCustom && (
                        <button
                          onClick={() => handleDeleteNavItem(item.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Content Editor for Custom Pages */}
                  {editingNavItemId === item.id && item.isCustom && (
                    <div className="px-6 pb-4 bg-gray-50 dark:bg-gray-800/30">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Page Content (Markdown supported)
                        </label>
                        <textarea
                          value={editingNavContent}
                          onChange={(e) => setEditingNavContent(e.target.value)}
                          rows={8}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                          placeholder="# Your Title\n\nWrite your content here using Markdown..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleUpdateNavItem(item.id, { content: editingNavContent });
                              setEditingNavItemId(null);
                            }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Save Content
                          </button>
                          <button
                            onClick={() => {
                              setEditingNavItemId(null);
                              setEditingNavContent('');
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Page Tab */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* Add New Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New About Section
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Section Title"
                value={newAboutSection.title}
                onChange={(e) => setNewAboutSection({ ...newAboutSection, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <textarea
                placeholder="Section Content (Markdown supported)"
                value={newAboutSection.content}
                onChange={(e) => setNewAboutSection({ ...newAboutSection, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddAboutSection}
                disabled={!newAboutSection.title}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Section
              </button>
            </div>
          </div>

          {/* About Sections List */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                About Page Sections
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {aboutSections.map((section, index) => (
                <div
                  key={section.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateAboutSection(section.id, { enabled: !section.enabled })}
                        className={`p-2 rounded-lg transition-colors ${
                          section.enabled
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => moveAboutSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveAboutSection(section.id, 'down')}
                        disabled={index === aboutSections.length - 1}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAboutSection(section.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {section.content && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-10 line-clamp-2">
                      {section.content.substring(0, 100)}{section.content.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Change Admin Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600">{passwordSuccess}</p>
              )}
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

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
