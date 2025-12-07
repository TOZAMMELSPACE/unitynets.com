import { useState, useEffect } from "react";
import { EnhancedPostForm } from "@/components/EnhancedPostForm";
import { EnhancedFeed } from "@/components/EnhancedFeed";
import { UsersList } from "@/components/UsersList";
import { LocalCommunity } from "@/components/LocalCommunity";
import { LearningZone } from "@/components/LearningZone";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LocalEvents } from "@/components/LocalEvents";
import { JobBoard } from "@/components/JobBoard";
import { GamificationPanel } from "@/components/GamificationPanel";
import { FeedFilter } from "@/components/FeedFilter";
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

  useEffect(() => {
    if (registerCreatePostTrigger) {
      registerCreatePostTrigger(() => handleCreatePost('text'));
    }
  }, [registerCreatePostTrigger]);

  const handleCreatePost = (type: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job') => {
    setSelectedPostType(type);
    setShowPostForm(true);
    setTimeout(() => {
      document.getElementById('post-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDislikePost = (postId: string) => {
    console.log('Dislike post:', postId);
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    console.log('Vote on poll:', postId, 'option:', optionIndex);
  };

  const handleFilterChange = (filters: {
    search: string;
    community: string;
    postType: string;
    sortBy: string;
  }) => {
    console.log('Filter change:', filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Feed Filter */}
        <div className="mb-6">
          <FeedFilter onFilterChange={handleFilterChange} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
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

            {/* Feed */}
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

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
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
          </aside>
        </div>
      </main>

      {/* FAB */}
      {currentUser && (
        <FloatingActionButton 
          onCreatePost={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Index;