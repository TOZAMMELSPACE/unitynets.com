import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { EnhancedPostForm } from "@/components/EnhancedPostForm";
import { EnhancedFeed } from "@/components/EnhancedFeed";
import { UsersList } from "@/components/UsersList";
import { LocalCommunity } from "@/components/LocalCommunity";
import { LearningZone } from "@/components/LearningZone";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LocalEvents } from "@/components/LocalEvents";
import { JobBoard } from "@/components/JobBoard";
import { GamificationPanel } from "@/components/GamificationPanel";
import { User, Post } from "@/lib/storage";

interface IndexProps {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  onSignOut: () => void;
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onPostCreated: (post: Post) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onCreatePost?: () => void;
  registerCreatePostTrigger?: (trigger: () => void) => void;
}

const Index = ({
  currentUser,
  users,
  posts,
  onSignOut,
  onPostCreated,
  onLikePost,
  onAddComment,
  onLikeComment,
  onCreatePost,
  registerCreatePostTrigger,
}: IndexProps) => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<'text' | 'image' | 'video' | 'poll' | 'event' | 'job'>('text');

  // Connect sidebar create post button to show post form
  useEffect(() => {
    if (registerCreatePostTrigger) {
      registerCreatePostTrigger(() => handleCreatePost('text'));
    }
  }, [registerCreatePostTrigger]);

  const handleCreatePost = (type: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job') => {
    setSelectedPostType(type);
    setShowPostForm(true);
    // Scroll to post form
    setTimeout(() => {
      document.getElementById('post-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDislikePost = (postId: string) => {
    // In a real app, this would update the post's dislike count
    console.log('Dislike post:', postId);
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    // In a real app, this would update the poll option votes
    console.log('Vote on poll:', postId, 'option:', optionIndex);
  };

  const handleSearch = (query: string) => {
    // In a real app, this would filter posts based on search query
    console.log('Search query:', query);
    // For now, we can show filtered results
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Header 
          currentUser={currentUser} 
          onSignOut={onSignOut}
          onCreatePost={() => handleCreatePost('text')}
          onSearch={handleSearch}
        />

        {/* Page Heading with Topics */}
        <div className="card-enhanced p-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-hero bg-clip-text text-transparent">Home | হোম</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Dashboard, Recent Updates, Suggested Content, Community Feed, Events & Jobs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card */}
            <div className="card-enhanced p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Welcome to UnityNet
                  </h2>
                  <p className="text-muted-foreground text-bengali">
                    এই প্ল্যাটফর্মে আপনি স্থানীয় কমিউনিটির সাথে যুক্ত হতে পারেন, 
                    জ্ঞান শেয়ার করতে পারেন এবং নতুন কিছু শিখতে পারেন।
                  </p>
                </div>
                {currentUser && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(currentUser.trustScore)}
                    </div>
                    <div className="text-xs text-muted-foreground">ট্রাস্ট স্কোর</div>
                  </div>
                )}
              </div>
            </div>

            {/* Post Form */}
            {(showPostForm || !currentUser) && currentUser && (
              <div id="post-form">
                <EnhancedPostForm 
                  user={currentUser} 
                  onPostCreated={(post) => {
                    onPostCreated(post);
                    setShowPostForm(false);
                  }} 
                />
              </div>
            )}

            {/* Enhanced Feed */}
            <EnhancedFeed 
              posts={posts} 
              currentUser={currentUser!}
              onLikePost={onLikePost}
              onDislikePost={handleDislikePost}
              onAddComment={onAddComment}
              onLikeComment={onLikeComment}
              onVotePoll={handleVotePoll}
            />
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Gamification Panel */}
            {currentUser && (
              <GamificationPanel 
                user={currentUser} 
                users={users}
              />
            )}
            
            <UsersList 
              users={users} 
              currentUserId={currentUser?.id} 
            />
            
            <LocalEvents 
              posts={posts}
              onCreateEvent={() => handleCreatePost('event')}
            />
            
            <JobBoard 
              posts={posts}
              onCreateJob={() => handleCreatePost('job')}
            />
            
            <LocalCommunity posts={posts} />
            
            <LearningZone user={currentUser} />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {currentUser && (
        <FloatingActionButton 
          onCreatePost={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Index;