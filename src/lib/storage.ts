// UnityNet Storage Utilities
export interface User {
  id: string;
  name: string;
  nidMasked: string;
  trustScore: number;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  community: string;
  createdAt: string;
  likes: number;
}

// Storage keys
export const STORAGE = {
  USERS: 'unity_users_v1',
  POSTS: 'unity_posts_v1',
  THEME: 'unity_theme_v1',
  CURRENT_USER: 'unity_current_user_v1',
};

// Storage utilities
export const load = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const save = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize sample data
export const initializeData = () => {
  const users = load<User[]>(STORAGE.USERS, []);
  const posts = load<Post[]>(STORAGE.POSTS, []);
  
  if (users.length === 0) {
    const sampleUsers: User[] = [
      { id: 'u1', name: 'আয়েশা রহমান', nidMasked: '****1234', trustScore: 85 },
      { id: 'u2', name: 'রফিকুল ইসলাম', nidMasked: '****6789', trustScore: 72 },
      { id: 'u3', name: 'Sarah Ahmed', nidMasked: '****5678', trustScore: 90 },
      { id: 'u4', name: 'মোহাম্মদ হাসান', nidMasked: '****9876', trustScore: 68 }
    ];
    save(STORAGE.USERS, sampleUsers);
  }
  
  if (posts.length === 0) {
    const samplePosts: Post[] = [
      {
        id: 'p1',
        author: { id: 'u1', name: 'আয়েশা রহমান' },
        content: 'শহরের প্রধান সড়কে বড় গর্ত রয়েছে। সিটি কর্পোরেশনকে জানানো প্রয়োজন।',
        community: 'ward-1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12
      },
      {
        id: 'p2',
        author: { id: 'u3', name: 'Sarah Ahmed' },
        content: 'Python শেখার জন্য কোন অনলাইন কোর্স সবচেয়ে ভালো? শুরুতে কি দিয়ে শুরু করা উচিত?',
        community: 'global',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8
      },
      {
        id: 'p3',
        author: { id: 'u2', name: 'রফিকুল ইসলাম' },
        content: 'স্থানীয় লাইব্রেরিতে নতুন বই এসেছে। কমিউনিটির সবাই ব্যবহার করতে পারেন।',
        community: 'ward-2',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 15
      }
    ];
    save(STORAGE.POSTS, samplePosts);
  }
};

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};