import { useState, useEffect } from "react";
import { User, Post, initializeData, STORAGE, save, load } from "@/lib/storage";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Login } from "@/components/Login";

interface AppLayoutProps {
  children: (props: {
    currentUser: User | null;
    users: User[];
    posts: Post[];
    onSignOut: () => void;
    onLogin: (user: User) => void;
    onRegister: (user: User) => void;
    onPostCreated: (post: Post) => void;
    onLikePost: (postId: string) => void;
  }) => React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    initializeData();
    
    const savedUsers = load<User[]>(STORAGE.USERS, []);
    const savedPosts = load<Post[]>(STORAGE.POSTS, []);
    setUsers(savedUsers);
    setPosts(savedPosts);

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
    <div className="relative min-h-screen pb-20">
      {children({
        currentUser,
        users,
        posts,
        onSignOut: handleSignOut,
        onLogin: handleLogin,
        onRegister: handleRegister,
        onPostCreated: handlePostCreated,
        onLikePost: handleLikePost,
      })}
      <BottomNavigation />
    </div>
  );
};