// UnityNet Storage Utilities
export interface User {
  id: string;
  name: string;
  email?: string;
  nidMasked: string;
  profileImage?: string;
  trustScore: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  content: string;
  images?: string[];
  community: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: string[];
  participantImages?: string[];
  isGroup: boolean;
  groupName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
}

// Storage keys
export const STORAGE = {
  USERS: 'unity_users_v1',
  POSTS: 'unity_posts_v1',
  COMMENTS: 'unity_comments_v1',
  CHATS: 'unity_chats_v1',
  MESSAGES: 'unity_messages_v1',
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
      { id: 'u1', name: 'আয়েশা রহমান', email: 'ayesha@example.com', nidMasked: '****1234', trustScore: 85 },
      { id: 'u2', name: 'রফিকুল ইসলাম', email: 'rafiq@example.com', nidMasked: '****6789', trustScore: 72 },
      { id: 'u3', name: 'Sarah Ahmed', email: 'sarah@example.com', nidMasked: '****5678', trustScore: 90 },
      { id: 'u4', name: 'মোহাম্মদ হাসান', email: 'hasan@example.com', nidMasked: '****9876', trustScore: 68 }
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
        likes: 12,
        comments: []
      },
      {
        id: 'p2',
        author: { id: 'u3', name: 'Sarah Ahmed' },
        content: 'Python শেখার জন্য কোন অনলাইন কোর্স সবচেয়ে ভালো? শুরুতে কি দিয়ে শুরু করা উচিত?',
        community: 'global',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        comments: []
      },
      {
        id: 'p3',
        author: { id: 'u2', name: 'রফিকুল ইসলাম' },
        content: 'স্থানীয় লাইব্রেরিতে নতুন বই এসেছে। কমিউনিটির সবাই ব্যবহার করতে পারেন।',
        community: 'ward-2',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        comments: []
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