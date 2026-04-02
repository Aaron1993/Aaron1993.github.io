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

export interface DraftPost {
  title: string;
  content: string;
  tags: string[];
}
