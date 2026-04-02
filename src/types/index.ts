export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  social: {
    github: string;
    email: string;
    twitter?: string;
    linkedin?: string;
  };
  skills: string[];
}

export interface AboutSection {
  id: string;
  title: string;
  content: string;
  order: number;
  enabled: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  order: number;
  enabled: boolean;
  isCustom: boolean;
  content?: string;
}

export interface SiteConfig {
  navItems: NavItem[];
  aboutSections: AboutSection[];
}

export interface DraftPost {
  title: string;
  content: string;
  tags: string[];
}
