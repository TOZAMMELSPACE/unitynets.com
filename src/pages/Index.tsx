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

  const handleFilterChange = (filters: {
    search: string;
    community: string;
    postType: string;
    sortBy: string;
  }) => {
    // In a real app, this would filter posts based on filters
    console.log('Filter change:', filters);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
        <Header 
          currentUser={currentUser} 
          onSignOut={onSignOut}
          onCreatePost={() => handleCreatePost('text')}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
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