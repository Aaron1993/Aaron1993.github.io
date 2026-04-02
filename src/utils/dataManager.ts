import type { Post, Profile, SiteConfig, NavItem, AboutSection } from '../types';

const POSTS_KEY = 'blog_posts';
const DELETED_POSTS_KEY = 'blog_deleted_posts';
const SITE_CONFIG_KEY = 'blog_site_config';

// Default navigation items
const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: 'Home', order: 0, enabled: true, isCustom: false },
  { id: 'blog', label: 'Blog', path: '/blog', icon: 'FileText', order: 1, enabled: true, isCustom: false },
  { id: 'about', label: 'About', path: '/about', icon: 'User', order: 2, enabled: true, isCustom: false },
];

// Default about sections
const defaultAboutSections: AboutSection[] = [
  { id: 'intro', title: 'Introduction', content: '', order: 0, enabled: true },
];

export function getSiteConfig(): SiteConfig {
  const saved = localStorage.getItem(SITE_CONFIG_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    navItems: defaultNavItems,
    aboutSections: defaultAboutSections,
  };
}

export function saveSiteConfig(config: SiteConfig): void {
  localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
}

export function addNavItem(item: Omit<NavItem, 'id'>): NavItem {
  const config = getSiteConfig();
  const newItem: NavItem = {
    ...item,
    id: `custom-${Date.now()}`,
  };
  config.navItems.push(newItem);
  config.navItems.sort((a, b) => a.order - b.order);
  saveSiteConfig(config);
  return newItem;
}

export function updateNavItem(id: string, updates: Partial<NavItem>): void {
  const config = getSiteConfig();
  const index = config.navItems.findIndex(item => item.id === id);
  if (index >= 0) {
    config.navItems[index] = { ...config.navItems[index], ...updates };
    config.navItems.sort((a, b) => a.order - b.order);
    saveSiteConfig(config);
  }
}

export function deleteNavItem(id: string): void {
  const config = getSiteConfig();
  config.navItems = config.navItems.filter(item => item.id !== id);
  saveSiteConfig(config);
}

export function addAboutSection(section: Omit<AboutSection, 'id'>): AboutSection {
  const config = getSiteConfig();
  const newSection: AboutSection = {
    ...section,
    id: `section-${Date.now()}`,
  };
  config.aboutSections.push(newSection);
  config.aboutSections.sort((a, b) => a.order - b.order);
  saveSiteConfig(config);
  return newSection;
}

export function updateAboutSection(id: string, updates: Partial<AboutSection>): void {
  const config = getSiteConfig();
  const index = config.aboutSections.findIndex(section => section.id === id);
  if (index >= 0) {
    config.aboutSections[index] = { ...config.aboutSections[index], ...updates };
    config.aboutSections.sort((a, b) => a.order - b.order);
    saveSiteConfig(config);
  }
}

export function deleteAboutSection(id: string): void {
  const config = getSiteConfig();
  config.aboutSections = config.aboutSections.filter(section => section.id !== id);
  saveSiteConfig(config);
}

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
