import { useState, useEffect } from "react";
import { User, Post, Comment, STORAGE, save, load, initializeData } from "@/lib/storage";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LeftSidebar } from "@/components/LeftSidebar";
import { Login } from "@/components/Login";
import { useSocial } from "@/hooks/useSocial";

interface AppLayoutProps {
  children: (props: {
    currentUser: User | null;
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
    setUsers: (users: User[]) => void;
  }) => React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [createPostTrigger, setCreatePostTrigger] = useState<(() => void) | null>(null);

  const socialActions = useSocial(currentUser, users, setUsers);

  useEffect(() => {
    initializeData();
    
    const savedUsers = load<User[]>(STORAGE.USERS, []);
    const savedPosts = load<Post[]>(STORAGE.POSTS, []);
    const savedComments = load<Comment[]>(STORAGE.COMMENTS, []);
    setUsers(savedUsers);
    setPosts(savedPosts);
    setComments(savedComments);

    const savedUser = localStorage.getItem(STORAGE.CURRENT_USER);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    save(STORAGE.CURRENT_USER, user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE.CURRENT_USER);
  };

  const handleRegister = (user: User) => {
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    handleLogin(user);
  };

  const handlePostCreated = (post: Post) => {
    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);

    // Update user trust score
    if (currentUser) {
      const updatedUser = { ...currentUser, trustScore: currentUser.trustScore + 2 };
      setCurrentUser(updatedUser);
      save(STORAGE.CURRENT_USER, updatedUser);

      const updatedUsers = users.map(u => 
        u.id === currentUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      save(STORAGE.USERS, updatedUsers);
    }
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, likes: (post.likes || 0) + 1 }
        : post
    );
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!currentUser) return;

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

    // Update post with comment
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    );
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);

    // Update user trust score for commenting
    const updatedUser = { ...currentUser, trustScore: currentUser.trustScore + 1 };
    setCurrentUser(updatedUser);
    save(STORAGE.CURRENT_USER, updatedUser);

    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
  };

  const handleLikeComment = (commentId: string) => {
    const updatedComments = comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    );
    setComments(updatedComments);
    save(STORAGE.COMMENTS, updatedComments);

    // Update posts with updated comments
    const updatedPosts = posts.map(post => ({
      ...post,
      comments: post.comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    }));
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    save(STORAGE.CURRENT_USER, updatedUser);

    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);

    // Update posts with new user name and profile image
    const updatedPosts = posts.map(post => 
      post.author.id === updatedUser.id 
        ? { ...post, author: { ...post.author, name: updatedUser.name, profileImage: updatedUser.profileImage } }
        : post
    );
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);
  };

  const handleCreatePost = () => {
    // Trigger the child component's create post function
    if (createPostTrigger) {
      createPostTrigger();
    }
  };

  const registerCreatePostTrigger = (trigger: () => void) => {
    setCreatePostTrigger(() => trigger);
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={users}
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      <LeftSidebar onCreatePost={handleCreatePost} />
      
      {/* Main content area */}
      <div className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {children({
          currentUser,
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
          setUsers,
        })}
      </div>
      
      {/* Mobile bottom navigation */}
      <BottomNavigation />
    </div>
  );
};