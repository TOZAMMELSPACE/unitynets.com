import { useState, useEffect, lazy, Suspense } from "react";
import { EnhancedPostForm } from "@/components/EnhancedPostForm";
import { EnhancedFeed } from "@/components/EnhancedFeed";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FeedFilter } from "@/components/FeedFilter";
import { Skeleton } from "@/components/ui/skeleton";
import AdSense from "@/components/AdSense";
import EzoicAd from "@/components/EzoicAd";

import { User, Post } from "@/lib/storage";

// Lazy load sidebar widgets
const GamificationPanel = lazy(() => import("@/components/GamificationPanel").then(m => ({ default: m.GamificationPanel })));
const UsersList = lazy(() => import("@/components/UsersList").then(m => ({ default: m.UsersList })));
const LocalEvents = lazy(() => import("@/components/LocalEvents").then(m => ({ default: m.LocalEvents })));
const JobBoard = lazy(() => import("@/components/JobBoard").then(m => ({ default: m.JobBoard })));
const LocalCommunity = lazy(() => import("@/components/LocalCommunity").then(m => ({ default: m.LocalCommunity })));

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
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onTrackView?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
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
  onLoadMore,
  hasMore,
  loadingMore,
  onTrackView,
  onDeletePost,
}: IndexProps) => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<'text' | 'image' | 'video' | 'poll' | 'event' | 'job'>('text');
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

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

  const handleFilterChange = (filters: { search: string; community: string; postType: string; sortBy: string }) => {
    let result = [...posts];
    
    // Search filter
    if (filters.search) {
      result = result.filter(post => 
        post.content.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.author.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Community filter
    if (filters.community !== "all") {
      result = result.filter(post => post.community === filters.community);
    }
    
    // Post type filter
    if (filters.postType !== "all") {
      result = result.filter(post => post.postType === filters.postType);
    }
    
    // Sort
    if (filters.sortBy === "trending" || filters.sortBy === "popular") {
      result.sort((a, b) => b.likes - a.likes);
    } else if (filters.sortBy === "most_commented") {
      result.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    setFilteredPosts(result);
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* Feed Filter - Below Header */}
      <div className="mb-4">
        <FeedFilter onFilterChange={handleFilterChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
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
              posts={filteredPosts} 
              currentUser={currentUser!}
              onLikePost={onLikePost}
              onDislikePost={handleDislikePost}
              onAddComment={onAddComment}
              onLikeComment={onLikeComment}
              onVotePoll={handleVotePoll}
              onSavePost={socialActions.toggleSavePost}
              isPostSaved={socialActions.isPostSaved}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onTrackView={onTrackView}
              onDeletePost={onDeletePost}
            />
          </div>
        </div>

        {/* Right Sidebar - All Widgets (Lazy Loaded) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          {/* Ezoic Top Banner */}
          <EzoicAd 
            placeholderId={101} 
            className="rounded-xl overflow-hidden"
          />
          
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
            {currentUser && (
              <GamificationPanel user={currentUser} users={users} />
            )}
          </Suspense>
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <UsersList users={users} currentUserId={currentUser?.id} />
          </Suspense>
          
          {/* Ezoic Mid Banner */}
          <EzoicAd 
            placeholderId={102} 
            className="rounded-xl overflow-hidden"
          />
          
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
            <LocalEvents posts={posts} onCreateEvent={() => handleCreatePost('event')} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
            <JobBoard posts={posts} onCreateJob={() => handleCreatePost('job')} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
            <LocalCommunity posts={posts} />
          </Suspense>
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