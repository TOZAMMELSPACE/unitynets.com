import { useState, useEffect } from "react";
import { EnhancedPostForm } from "@/components/EnhancedPostForm";
import { EnhancedFeed } from "@/components/EnhancedFeed";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { GamificationPanel } from "@/components/GamificationPanel";
import { UsersList } from "@/components/UsersList";
import { LocalEvents } from "@/components/LocalEvents";
import { JobBoard } from "@/components/JobBoard";
import { LocalCommunity } from "@/components/LocalCommunity";
import { LearningZone } from "@/components/LearningZone";
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

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {currentUser && (
            <GamificationPanel user={currentUser} users={users} />
          )}
          <UsersList users={users} currentUserId={currentUser?.id} />
        </aside>

        {/* Main Feed */}
        <div className="lg:col-span-6 space-y-6">
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

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          {currentUser && (
            <LearningZone user={currentUser} />
          )}
          <LocalEvents posts={posts} onCreateEvent={() => handleCreatePost('event')} />
          <JobBoard posts={posts} onCreateJob={() => handleCreatePost('job')} />
          <LocalCommunity posts={posts} />
        </aside>
      </div>

      {/* FAB */}
      {currentUser && (
        <FloatingActionButton 
          onCreatePost={handleCreatePost}
        />
      )}
    </main>
  );
};

export default Index;