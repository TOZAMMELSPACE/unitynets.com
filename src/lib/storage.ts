// UnityNet Storage Utilities
export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string;
  nidMasked: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  role?: 'freelancer' | 'trainer' | 'learner' | 'moderator' | 'user';
  trustScore: number;
  followers: number;
  following: number;
  followersList?: string[]; // Array of user IDs
  followingList?: string[]; // Array of user IDs
  friendRequests?: string[]; // Array of user IDs who sent requests
  savedPosts?: string[]; // Array of post IDs
  achievements: string[];
  portfolioItems?: PortfolioItem[];
  lastOnline?: string;
  isOnline: boolean;
  isVerified: boolean;
  joinDate: string;
  privacySettings?: PrivacySettings;
  unityBalance?: number;
  unityEarned?: number;
  unitySpent?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  url?: string;
  tags: string[];
}

export interface PrivacySettings {
  allowMessagesFrom: 'everyone' | 'followers' | 'none';
  showLastOnline: boolean;
  showEmail: boolean;
  showPhone: boolean;
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
  postType: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job';
  location?: string;
  hashtags?: string[];
  mentions?: string[];
  createdAt: string;
  likes: number;
  dislikes?: number;
  views?: number;
  comments: Comment[];
  isEvent?: boolean;
  eventDetails?: {
    title: string;
    date: string;
    location: string;
    description: string;
  };
  isJob?: boolean;
  jobDetails?: {
    title: string;
    budget: string;
    deadline: string;
    skills: string[];
    description: string;
  };
  pollOptions?: {
    option: string;
    votes: number;
  }[];
  isDraft?: boolean;
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

export interface Notification {
  id: string;
  userId: string; // Who receives the notification
  type: 'like' | 'comment' | 'follow' | 'friend_request' | 'friend_accept' | 'mention' | 'post_share';
  fromUserId: string; // Who triggered the notification
  fromUserName: string;
  fromUserImage?: string;
  content: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'post' | 'comment' | 'like' | 'follow' | 'join';
  content: string;
  postId?: string;
  targetUserId?: string;
  createdAt: string;
}

export interface UnityNoteTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  serviceType: string;
  description: string;
  duration: number; // in hours
  rating?: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface ServiceOffer {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  ratePerHour: number; // in Unity Notes
  availability: string[];
  createdAt: string;
}

// Storage keys
export const STORAGE = {
  USERS: 'unity_users_v1',
  POSTS: 'unity_posts_v1',
  COMMENTS: 'unity_comments_v1',
  CHATS: 'unity_chats_v1',
  MESSAGES: 'unity_messages_v1',
  NOTIFICATIONS: 'unity_notifications_v1',
  ACTIVITIES: 'unity_activities_v1',
  THEME: 'unity_theme_v1',
  CURRENT_USER: 'unity_current_user_v1',
  UNITY_TRANSACTIONS: 'unity_transactions_v1',
  SERVICE_OFFERS: 'unity_service_offers_v1',
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
      { 
        id: 'u1', 
        name: 'আয়েশা রহমান',
        username: 'ayesha123',
        phone: '+8801712345678',
        email: 'ayesha@example.com', 
        nidMasked: '****1234', 
        trustScore: 85,
        followers: 124,
        following: 89,
        followersList: ['u2', 'u4'],
        followingList: ['u3'],
        friendRequests: [],
        savedPosts: [],
        achievements: ['trusted_member', 'top_contributor'],
        isOnline: true,
        isVerified: true,
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        unityBalance: 5,
        unityEarned: 0,
        unitySpent: 0
      },
      { 
        id: 'u2', 
        name: 'রফিকুল ইসলাম',
        username: 'rafiq789',
        phone: '+8801898765432',
        email: 'rafiq@example.com', 
        nidMasked: '****6789', 
        trustScore: 72,
        followers: 67,
        following: 45,
        followersList: ['u3'],
        followingList: ['u1'],
        friendRequests: [],
        savedPosts: [],
        achievements: ['early_adopter'],
        isOnline: false,
        isVerified: true,
        joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        unityBalance: 5,
        unityEarned: 0,
        unitySpent: 0
      },
      { 
        id: 'u3', 
        name: 'Sarah Ahmed',
        username: 'sarah456',
        phone: '+8801611223344',
        email: 'sarah@example.com', 
        nidMasked: '****5678', 
        trustScore: 90,
        followers: 201,
        following: 156,
        followersList: ['u1', 'u4'],
        followingList: ['u2'],
        friendRequests: [],
        savedPosts: [],
        achievements: ['verified_educator', 'popular_creator', 'community_leader'],
        isOnline: true,
        isVerified: true,
        joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        unityBalance: 5,
        unityEarned: 0,
        unitySpent: 0
      },
      { 
        id: 'u4', 
        name: 'মোহাম্মদ হাসান',
        username: 'hasan999',
        phone: '+8801555667788',
        email: 'hasan@example.com', 
        nidMasked: '****9876', 
        trustScore: 68,
        followers: 23,
        following: 12,
        followersList: [],
        followingList: ['u1', 'u3'],
        friendRequests: [],
        savedPosts: [],
        achievements: ['helpful_member'],
        isOnline: false,
        isVerified: false,
        joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        unityBalance: 5,
        unityEarned: 0,
        unitySpent: 0
      }
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
        postType: 'text',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        comments: []
      },
      {
        id: 'p2',
        author: { id: 'u3', name: 'Sarah Ahmed' },
        content: 'Python শেখার জন্য কোন অনলাইন কোর্স সবচেয়ে ভালো? শুরুতে কি দিয়ে শুরু করা উচিত?',
        community: 'global',
        postType: 'text',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        comments: []
      },
      {
        id: 'p3',
        author: { id: 'u2', name: 'রফিকুল ইসলাম' },
        content: 'স্থানীয় লাইব্রেরিতে নতুন বই এসেছে। কমিউনিটির সবাই ব্যবহার করতে পারেন।',
        community: 'ward-2',
        postType: 'text',
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