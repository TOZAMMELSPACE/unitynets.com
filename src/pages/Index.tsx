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
import { Button } from "@/components/ui/button";
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
  socialActions: any;
  setUsers: (users: User[]) => void;
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
  socialActions,
  setUsers,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
        <Header 
          currentUser={currentUser} 
          onSignOut={onSignOut}
          onCreatePost={() => handleCreatePost('text')}
          onSearch={handleSearch}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Welcome Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50" />
              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Welcome to UnityNet
                    </h1>
                    <p className="text-muted-foreground text-bengali text-sm sm:text-base leading-relaxed">
                      এই প্ল্যাটফর্মে আপনি স্থানীয় কমিউনিটির সাথে যুক্ত হতে পারেন, 
                      জ্ঞান শেয়ার করতে পারেন এবং নতুন কিছু শিখতে পারেন।
                    </p>
                  </div>
                  {currentUser && (
                    <div className="flex items-center gap-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {Math.round(currentUser.trustScore)}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium text-bengali mt-1">ট্রাস্ট স্কোর</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Form */}
            {showPostForm && currentUser && (
              <div id="post-form" className="animate-fade-in">
                <EnhancedPostForm 
                  user={currentUser}
                  initialPostType={selectedPostType}
                  onPostCreated={(post) => {
                    onPostCreated(post);
                    setShowPostForm(false);
                  }} 
                />
              </div>
            )}

            {/* Enhanced Feed */}
            <div className="animate-fade-in">
              <EnhancedFeed 
                posts={posts} 
                currentUser={currentUser!}
                onLikePost={onLikePost}
                onDislikePost={handleDislikePost}
                onAddComment={onAddComment}
                onLikeComment={onLikeComment}
                onVotePoll={handleVotePoll}
                onSavePost={socialActions.toggleSavePost}
                isPostSaved={socialActions.isPostSaved}
              />
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-4 sm:space-y-6">
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