import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PostForm } from "@/components/PostForm";
import { Feed } from "@/components/Feed";
import { UsersList } from "@/components/UsersList";
import { LocalCommunity } from "@/components/LocalCommunity";
import { LearningZone } from "@/components/LearningZone";
import { Login } from "@/components/Login";
import { User, Post, STORAGE, load, save, initializeData } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Initialize sample data
    initializeData();
    
    // Load data from localStorage
    const savedUsers = load<User[]>(STORAGE.USERS, []);
    const savedPosts = load<Post[]>(STORAGE.POSTS, []);
    const savedCurrentUser = load<User | null>(STORAGE.CURRENT_USER, null);
    
    setUsers(savedUsers);
    setPosts(savedPosts);
    setCurrentUser(savedCurrentUser);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    save(STORAGE.CURRENT_USER, user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    save(STORAGE.CURRENT_USER, null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  const handleRegister = (user: User) => {
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
  };

  const handlePostCreated = (post: Post) => {
    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);
    
    // Increase trust score for posting
    if (currentUser) {
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { ...u, trustScore: Math.min(100, u.trustScore + 2) }
          : u
      );
      const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
      
      setUsers(updatedUsers);
      setCurrentUser(updatedCurrentUser || currentUser);
      save(STORAGE.USERS, updatedUsers);
      save(STORAGE.CURRENT_USER, updatedCurrentUser);
    }
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    );
    setPosts(updatedPosts);
    save(STORAGE.POSTS, updatedPosts);
  };

  if (!currentUser) {
    return (
      <Login 
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Header 
          currentUser={currentUser} 
          onSignOut={handleSignOut} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="card-enhanced p-6">
              <h2 className="text-xl font-semibold mb-2">
                Welcome to UnityNet
              </h2>
              <p className="text-muted-foreground text-bengali">
                এই প্ল্যাটফর্মে আপনি স্থানীয় কমিউনিটির সাথে যুক্ত হতে পারেন, 
                জ্ঞান শেয়ার করতে পারেন এবং নতুন কিছু শিখতে পারেন।
              </p>
            </div>

            {/* Post Form */}
            <PostForm 
              user={currentUser} 
              onPostCreated={handlePostCreated} 
            />

            {/* Feed */}
            <div className="card-enhanced p-6">
              <h3 className="text-lg font-semibold mb-4">Community Feed</h3>
              <Feed 
                posts={posts} 
                onLikePost={handleLikePost} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UsersList 
              users={users} 
              currentUserId={currentUser?.id} 
            />
            
            <LocalCommunity posts={posts} />
            
            <LearningZone user={currentUser} />
            
            {/* Marketplace */}
            <div className="card-enhanced p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                🛍️ Marketplace
              </h3>
              <p className="text-sm text-muted-foreground text-bengali">
                ক্রিয়েটর ও ফ্রিল্যান্সারদের জন্য দ্রুত স্পট। 
                শীঘ্রই আসছে সম্পূর্ণ মার্কেটপ্লেস ইন্টিগ্রেশন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
