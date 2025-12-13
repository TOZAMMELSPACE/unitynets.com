import { useState, useEffect } from "react";
import { User, Post, Comment, STORAGE, save, load, initializeData } from "@/lib/storage";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LeftSidebar } from "@/components/LeftSidebar";
import { Login } from "@/components/Login";
import { useSocial } from "@/hooks/useSocial";
import { GlobalHeader } from "@/components/GlobalHeader";
import { useAuth } from "@/hooks/useAuth";
import { usePosts, PostWithAuthor } from "@/hooks/usePosts";
import { useProfiles, LegacyUser } from "@/hooks/useProfiles";
import { useSocialDB } from "@/hooks/useSocialDB";

interface AppLayoutProps {
  children: (props: {
    currentUser: User | null;
    currentUserId: string | null;
    users: User[];
    posts: Post[];
    comments: Comment[];
    onSignOut: () => void;
    onLogin: (user: User) => void;
    onRegister: (user: User) => void;
    onPostCreated: (post: Post) => void;
    onLikePost: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    onLikeComment: (commentId: string) => void;
    onUpdateProfile: (user: User) => void;
    onCreatePost?: () => void;
    registerCreatePostTrigger?: (trigger: () => void) => void;
    socialActions: ReturnType<typeof useSocial>;
    socialDB: ReturnType<typeof useSocialDB>;
    setUsers: (users: User[]) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
  }) => React.ReactNode;
}

// Transform PostWithAuthor to legacy Post format
const transformToLegacyPost = (post: PostWithAuthor): Post => ({
  id: post.id,
  author: post.author,
  content: post.content,
  images: post.images,
  videoUrl: post.videoUrl,
  community: post.community,
  postType: post.postType,
  createdAt: post.createdAt,
  likes: post.likes,
  dislikes: post.dislikes,
  views: post.views,
  comments: post.comments.map(c => ({
    id: c.id,
    postId: c.postId,
    author: c.author,
    content: c.content,
    createdAt: c.createdAt,
    likes: c.likes,
  })),
});

// Transform LegacyUser to User format
const transformToUser = (profile: LegacyUser): User => ({
  id: profile.id,
  name: profile.name,
  username: profile.username,
  phone: profile.phone,
  email: profile.email,
  nidMasked: profile.nidMasked,
  profileImage: profile.profileImage,
  bio: profile.bio,
  location: profile.location,
  trustScore: profile.trustScore,
  followers: profile.followers,
  following: profile.following,
  followersList: profile.followersList,
  followingList: profile.followingList,
  friendRequests: profile.friendRequests,
  savedPosts: profile.savedPosts,
  achievements: profile.achievements,
  isOnline: profile.isOnline,
  isVerified: profile.isVerified,
  joinDate: profile.joinDate,
  unityBalance: profile.unityBalance,
});

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, appUser, loading: authLoading, signOut } = useAuth();
  const socialDB = useSocialDB(user?.id || null);
  const { posts: dbPosts, createPost, likePost, addComment, likeComment, loadMore, hasMore, loadingMore, loading: postsLoading } = usePosts(user?.id, socialDB.createNotification);
  const { users: dbUsers, setUsers: setDbUsers, loading: usersLoading } = useProfiles();
  
  const [createPostTrigger, setCreatePostTrigger] = useState<(() => void) | null>(null);
  
  // Also keep local storage for backwards compatibility during transition
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Transform appUser to legacy User format
  const currentUser: User | null = appUser ? {
    id: appUser.id,
    name: appUser.name,
    username: appUser.username,
    phone: appUser.phone,
    email: appUser.email,
    nidMasked: '****',
    profileImage: appUser.profileImage,
    bio: appUser.bio,
    location: appUser.location,
    trustScore: appUser.trustScore,
    followers: appUser.followers,
    following: appUser.following,
    achievements: appUser.achievements,
    isOnline: appUser.isOnline,
    isVerified: appUser.isVerified,
    joinDate: appUser.joinDate,
    unityBalance: appUser.unityNotes,
  } : null;

  // Use DB users when logged in (user exists), otherwise use local users
  const users: User[] = user 
    ? dbUsers.map(transformToUser)
    : localUsers;

  // Use DB posts when logged in (user exists), otherwise use local posts
  const posts: Post[] = user 
    ? dbPosts.map(transformToLegacyPost)
    : localPosts;

  const socialActions = useSocial(currentUser, users, (updatedUsers) => {
    setLocalUsers(updatedUsers);
  });

  useEffect(() => {
    // Only initialize local data when not logged in (for demo purposes)
    if (!user) {
      initializeData();
      
      const savedUsers = load<User[]>(STORAGE.USERS, []);
      const savedPosts = load<Post[]>(STORAGE.POSTS, []);
      const savedComments = load<Comment[]>(STORAGE.COMMENTS, []);
      setLocalUsers(savedUsers);
      setLocalPosts(savedPosts);
      setComments(savedComments);
    }
  }, [user]);

  const handleLogin = (user: User) => {
    // This is now handled by useAuth
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRegister = (user: User) => {
    // This is now handled by useAuth
  };

  const handlePostCreated = async (post: Post) => {
    if (user) {
      // Save to database
      await createPost(
        post.content,
        post.images,
        post.community,
        post.videoUrl
      );
    } else {
      // Fallback to local storage
      const updatedPosts = [post, ...localPosts];
      setLocalPosts(updatedPosts);
      save(STORAGE.POSTS, updatedPosts);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (user) {
      await likePost(postId);
    } else {
      // Fallback to local
      const updatedPosts = localPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: (post.likes || 0) + 1 }
          : post
      );
      setLocalPosts(updatedPosts);
      save(STORAGE.POSTS, updatedPosts);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (user && currentUser) {
      await addComment(postId, content);
    } else if (currentUser) {
      // Fallback to local
      const newComment: Comment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        postId,
        author: { id: currentUser.id, name: currentUser.name },
        content,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      save(STORAGE.COMMENTS, updatedComments);

      const updatedPosts = localPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      );
      setLocalPosts(updatedPosts);
      save(STORAGE.POSTS, updatedPosts);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (user) {
      await likeComment(commentId);
    } else {
      // Fallback to local
      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      );
      setComments(updatedComments);
      save(STORAGE.COMMENTS, updatedComments);

      const updatedPosts = localPosts.map(post => ({
        ...post,
        comments: post.comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        )
      }));
      setLocalPosts(updatedPosts);
      save(STORAGE.POSTS, updatedPosts);
    }
  };

  const handleUpdateProfile = (updatedUser: User) => {
    // Update local state
    const updatedUsers = localUsers.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setLocalUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
  };

  const handleCreatePost = () => {
    if (createPostTrigger) {
      createPostTrigger();
    }
  };

  const registerCreatePostTrigger = (trigger: () => void) => {
    setCreatePostTrigger(() => trigger);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={localUsers}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      <LeftSidebar onCreatePost={handleCreatePost} />
      
      {/* Main content area */}
      <div className="w-full lg:pl-64 min-h-screen pb-20 lg:pb-0">
        {/* Global Header - same on all pages */}
        <GlobalHeader 
          currentUser={currentUser!} 
          onSignOut={handleSignOut}
          onCreatePost={handleCreatePost}
        />
        
        {/* Page Content */}
        {children({
            currentUser,
            currentUserId: user?.id || null,
            users,
            posts,
            comments,
            onSignOut: handleSignOut,
            onLogin: handleLogin,
            onRegister: handleRegister,
            onPostCreated: handlePostCreated,
            onLikePost: handleLikePost,
            onAddComment: handleAddComment,
            onLikeComment: handleLikeComment,
            onUpdateProfile: handleUpdateProfile,
            onCreatePost: handleCreatePost,
            registerCreatePostTrigger,
            socialActions,
            socialDB,
            setUsers: setLocalUsers,
            onLoadMore: loadMore,
            hasMore: user ? hasMore : false,
            loadingMore: user ? loadingMore : false,
          })}
      </div>
      
      {/* Mobile bottom navigation */}
      <BottomNavigation />
    </div>
  );
};
