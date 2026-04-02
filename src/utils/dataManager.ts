import type { Post, Profile } from '../types';

const POSTS_KEY = 'blog_posts';
const DELETED_POSTS_KEY = 'blog_deleted_posts';

export async function fetchPosts(): Promise<Post[]> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}data/posts.json`);
    const data = await response.json();
    const localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    const deletedPostIds = JSON.parse(localStorage.getItem(DELETED_POSTS_KEY) || '[]');
    
    // Filter out deleted posts from JSON file
    const jsonPosts = data.posts.filter((p: Post) => !deletedPostIds.includes(p.id));
    
    const allPosts = [...jsonPosts, ...localPosts];
    const uniquePosts = allPosts.filter((post, index, self) =>
      index === self.findIndex((p) => p.id === post.id)
    );
    
    return uniquePosts.filter((post: Post) => post.published);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function fetchProfile(): Promise<Profile | null> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}data/profile.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export function savePost(post: Post): void {
  const localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  const existingIndex = localPosts.findIndex((p: Post) => p.id === post.id);
  
  if (existingIndex >= 0) {
    localPosts[existingIndex] = post;
  } else {
    localPosts.push(post);
  }
  
  localStorage.setItem(POSTS_KEY, JSON.stringify(localPosts));
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const posts = await fetchPosts();
  return posts.find((p: Post) => p.id === id);
}

export function deletePost(id: string): void {
  // Remove from localPosts if exists
  const localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  const filteredPosts = localPosts.filter((p: Post) => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(filteredPosts));
  
  // Add to deleted list to prevent reload from JSON
  const deletedPostIds = JSON.parse(localStorage.getItem(DELETED_POSTS_KEY) || '[]');
  if (!deletedPostIds.includes(id)) {
    deletedPostIds.push(id);
    localStorage.setItem(DELETED_POSTS_KEY, JSON.stringify(deletedPostIds));
  }
}

export function getAllPostsCount(): number {
  const localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  // Count both local posts and we need to fetch from JSON file too
  // For now return local posts count, will be updated when fetchPosts is called
  return localPosts.filter((p: Post) => p.published).length;
}

export function getAllTags(posts: Post[]): string[] {
  const tags = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function exportData(): string {
  const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  return JSON.stringify({ posts }, null, 2);
}
