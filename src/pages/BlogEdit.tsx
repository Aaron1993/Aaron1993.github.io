import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, Send, X, Plus } from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { savePost, fetchPosts } from '../utils/dataManager';
import type { Post, DraftPost } from '../types';

const DRAFT_KEY = 'blog_draft';

interface BlogEditProps {
  isAdmin: boolean;
  onLoginClick: () => void;
}

export function BlogEdit({ isAdmin, onLoginClick }: BlogEditProps) {
  // Redirect or show login if not admin
  useEffect(() => {
    if (!isAdmin) {
      onLoginClick();
    }
  }, [isAdmin, onLoginClick]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use ref to track if we've loaded from localStorage to prevent loops
  const hasLoadedDraft = useRef(false);

  // Load existing post or draft on mount only
  useEffect(() => {
    const loadData = async () => {
      if (editId) {
        const posts = await fetchPosts();
        const post = posts.find((p) => p.id === editId);
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags);
        }
      } else {
        // Load draft from localStorage once
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft && !hasLoadedDraft.current) {
          hasLoadedDraft.current = true;
          const draft: DraftPost = JSON.parse(savedDraft);
          setTitle(draft.title);
          setContent(draft.content);
          setTags(draft.tags);
        }
      }
      setIsLoaded(true);
    };
    loadData();
  }, [editId]);

  // Auto-save draft - use a debounced approach
  useEffect(() => {
    if (!editId && isLoaded) {
      const draft: DraftPost = { title, content, tags };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [title, content, tags, editId, isLoaded]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }, [tags]);

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    const post: Post = {
      id: editId || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      excerpt: content.slice(0, 150).replace(/[#*`]/g, '') + '...',
      tags,
      createdAt: editId ? now : now,
      updatedAt: now,
      published: true,
    };

    savePost(post);
    
    // Clear draft if it was a new post
    if (!editId) {
      localStorage.removeItem(DRAFT_KEY);
    }

    navigate(`/blog/${post.id}`);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      setTitle('');
      setContent('');
      setTags([]);
      if (!editId) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  };



  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-8rem)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-lg font-semibold w-64 md:w-96"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showPreview
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            {editId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tags Input */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="hover:text-primary-800"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm w-32"
          />
          <button
            onClick={handleAddTag}
            className="p-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex gap-4 h-[calc(100%-8rem)]">
        {/* Editor */}
        <div className={`${showPreview ? 'flex-1' : 'w-full'} flex flex-col`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post in Markdown..."
            className="flex-1 w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Preview
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {title}
                </h1>
              )}
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-gray-400 dark:text-gray-600 italic">
                  Start typing to see preview...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
        <div>
          {content.length} characters | {content.split(/\s+/).filter(Boolean).length} words
        </div>
        <div>
          {!editId && 'Auto-saving enabled'}
        </div>
      </div>
    </div>
  );
}
