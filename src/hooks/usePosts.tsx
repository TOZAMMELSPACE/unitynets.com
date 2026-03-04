import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DbPost {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[] | null;
  video_url: string | null;
  community_tag: string | null;
  likes_count: number;
  dislikes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  trust_score: number;
  unity_notes: number;
  created_at: string;
  updated_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
}

export interface PollOption {
  option: string;
  votes: number;
}

export interface PostWithAuthor {
  id: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  community: string;
  postType: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job';
  createdAt: string;
  likes: number;
  dislikes: number;
  views: number;
  location?: string;
  hashtags?: string[];
  pollOptions?: PollOption[];
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  comments: CommentWithAuthor[];
  // Group post fields
  isGroupPost?: boolean;
  groupId?: string;
  groupName?: string;
}

export interface CommentWithAuthor {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: number;
  author: {
    id: string;
    name: string;
  };
}

const POSTS_PER_PAGE = 10;

export const usePosts = (userId?: string, createNotification?: (userId: string, type: string, content: string, postId?: string) => Promise<void>) => {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postsRef = useRef<PostWithAuthor[]>([]);
  
  const fetchPosts = useCallback(async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : postsRef.current.length;
      
      // Fetch regular posts with pagination
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) throw postsError;

      // Fetch group posts (from public groups)
      const { data: groupPostsData, error: groupPostsError } = await supabase
        .from('group_posts')
        .select('*, groups!inner(id, name, is_private)')
        .eq('groups.is_private', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (groupPostsError) {
        console.error('Error fetching group posts:', groupPostsError);
      }

      // Combine both types of posts
      const allPostsData = postsData || [];
      const allGroupPostsData = groupPostsData || [];

      // Check if there are more posts
      setHasMore((allPostsData.length + allGroupPostsData.length) >= POSTS_PER_PAGE);

      if (allPostsData.length === 0 && allGroupPostsData.length === 0) {
        if (reset) {
          setPosts([]);
          postsRef.current = [];
        }
        return;
      }

      // Get unique user IDs from all posts
      const userIds = [...new Set([
        ...allPostsData.map(p => p.user_id),
        ...allGroupPostsData.map(p => p.user_id)
      ])];
      
      // Fetch profiles for post authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map<string, DbProfile>();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Fetch comments for regular posts
      const postIds = allPostsData.map(p => p.id);
      let commentsData: DbComment[] = [];
      if (postIds.length > 0) {
        const { data, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .in('post_id', postIds)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;
        commentsData = data || [];
      }

      // Get unique user IDs from comments
      const commentUserIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Fetch profiles for comment authors (if not already fetched)
      const newUserIds = commentUserIds.filter(id => !profilesMap.has(id));
      if (newUserIds.length > 0) {
        const { data: commentProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', newUserIds);
        
        commentProfiles?.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      // Transform regular posts with author info and comments
      const transformedPosts: PostWithAuthor[] = allPostsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        const postComments = commentsData
          .filter(c => c.post_id === post.id)
          .map(comment => {
            const commentProfile = profilesMap.get(comment.user_id);
            return {
              id: comment.id,
              postId: comment.post_id,
              content: comment.content,
              createdAt: comment.created_at,
              likes: comment.likes_count,
              author: {
                id: comment.user_id,
                name: commentProfile?.full_name || 'Unknown User',
              },
            };
          });

        // Determine post type based on content
        let postType: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job' = 'text';
        if (post.poll_options && Array.isArray(post.poll_options) && post.poll_options.length > 0) {
          postType = 'poll';
        } else if (post.video_url) {
          postType = 'video';
        } else if (post.image_urls && post.image_urls.length > 0) {
          postType = 'image';
        }

        return {
          id: post.id,
          content: post.content,
          images: post.image_urls || undefined,
          videoUrl: post.video_url || undefined,
          community: post.community_tag || 'global',
          postType,
          createdAt: post.created_at,
          likes: post.likes_count,
          dislikes: post.dislikes_count,
          views: post.views_count,
          pollOptions: post.poll_options ? (post.poll_options as unknown as PollOption[]) : undefined,
          author: {
            id: post.user_id,
            name: profile?.full_name || 'Unknown User',
            profileImage: profile?.avatar_url || undefined,
          },
          comments: postComments,
          isGroupPost: false,
        };
      });

      // Transform group posts
      const transformedGroupPosts: PostWithAuthor[] = allGroupPostsData.map((post: any) => {
        const profile = profilesMap.get(post.user_id);
        return {
          id: post.id,
          content: post.content,
          images: post.image_urls || undefined,
          videoUrl: undefined,
          community: 'group',
          postType: (post.image_urls && post.image_urls.length > 0 ? 'image' as const : 'text' as const),
          createdAt: post.created_at,
          likes: post.likes_count,
          dislikes: 0,
          views: 0,
          author: {
            id: post.user_id,
            name: profile?.full_name || 'Unknown User',
            profileImage: profile?.avatar_url || undefined,
          },
          comments: [],
          isGroupPost: true,
          groupId: post.group_id,
          groupName: post.groups?.name || 'Unknown Group',
        };
      });

      // Merge and sort by date
      const allPosts = [...transformedPosts, ...transformedGroupPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (reset) {
        setPosts(allPosts);
        postsRef.current = allPosts;
      } else {
        setPosts(prev => {
          const newPosts = [...prev, ...allPosts];
          postsRef.current = newPosts;
          return newPosts;
        });
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(false);
    }
  }, [loadingMore, hasMore, fetchPosts]);

  const createPost = useCallback(async (
    content: string,
    imageUrls?: string[],
    communityTag?: string,
    videoUrl?: string,
    pollOptions?: PollOption[]
  ) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a post',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Build the insert object with proper typing
      const insertData: {
        user_id: string;
        content: string;
        image_urls: string[] | null;
        video_url: string | null;
        community_tag: string;
        poll_options: unknown;
      } = {
        user_id: userId,
        content,
        image_urls: imageUrls || null,
        video_url: videoUrl || null,
        community_tag: communityTag || 'global',
        poll_options: pollOptions && pollOptions.length > 0 ? pollOptions : null,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;

      // Get user profile for immediate display
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Determine post type
      let newPostType: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job' = 'text';
      if (pollOptions && pollOptions.length > 0) {
        newPostType = 'poll';
      } else if (data.video_url) {
        newPostType = 'video';
      } else if (data.image_urls && data.image_urls.length > 0) {
        newPostType = 'image';
      }

      // Optimistic update - add new post immediately to UI
      const newPost: PostWithAuthor = {
        id: data.id,
        content: data.content,
        images: data.image_urls || undefined,
        videoUrl: data.video_url || undefined,
        community: data.community_tag || 'global',
        postType: newPostType,
        createdAt: data.created_at,
        likes: 0,
        dislikes: 0,
        views: 0,
        pollOptions: pollOptions || undefined,
        author: {
          id: userId,
          name: profileData?.full_name || 'Unknown User',
          profileImage: profileData?.avatar_url || undefined,
        },
        comments: [],
      };

      // Add to start of posts array immediately
      setPosts(prev => {
        const updated = [newPost, ...prev];
        postsRef.current = updated;
        return updated;
      });

      // Send notification to all other users about the new post
      try {
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id')
          .neq('user_id', userId);

        if (allProfiles && allProfiles.length > 0) {
          const notifications = allProfiles.map(profile => ({
            user_id: profile.user_id,
            type: 'new_post',
            from_user_id: userId,
            content: 'নতুন পোস্ট করেছেন',
            post_id: data.id,
          }));

          await supabase.from('notifications').insert(notifications);
        }

        // Send browser push notification
        await supabase.functions.invoke('send-push-notification', {
          body: {
            title: `${profileData?.full_name || 'কেউ'} নতুন পোস্ট করেছেন`,
            body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            url: `/post/${data.id}`,
            postId: data.id,
            excludeUserId: userId
          }
        });
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
        // Don't fail the post creation if notifications fail
      }

      toast({
        title: 'সফল!',
        description: 'পোস্ট তৈরি হয়েছে',
      });
      
      return data;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
      return null;
    }
  }, [userId, fetchPosts]);

  const likePost = useCallback(async (postId: string) => {
    if (!userId) return;

    try {
      // Check if user already liked/disliked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      // Get fresh post data from database
      const { data: freshPost } = await supabase
        .from('posts')
        .select('likes_count, dislikes_count')
        .eq('id', postId)
        .single();

      const currentLikes = freshPost?.likes_count || 0;
      const currentDislikes = freshPost?.dislikes_count || 0;
      const currentPost = posts.find(p => p.id === postId);
      
      let newLikesCount = currentLikes;
      let newDislikesCount = currentDislikes;

      if (existingLike) {
        if (existingLike.is_like) {
          // Already liked, remove like
          await supabase
            .from('post_likes')
            .delete()
            .eq('id', existingLike.id);
          
          newLikesCount = Math.max(0, currentLikes - 1);
          
          await supabase
            .from('posts')
            .update({ likes_count: newLikesCount })
            .eq('id', postId);
        } else {
          // Was dislike, change to like
          await supabase
            .from('post_likes')
            .update({ is_like: true })
            .eq('id', existingLike.id);
          
          newLikesCount = currentLikes + 1;
          newDislikesCount = Math.max(0, currentDislikes - 1);
          
          await supabase
            .from('posts')
            .update({ 
              likes_count: newLikesCount,
              dislikes_count: newDislikesCount
            })
            .eq('id', postId);
        }
      } else {
        // New like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
            is_like: true,
          });
        
        newLikesCount = currentLikes + 1;
        
        await supabase
          .from('posts')
          .update({ likes_count: newLikesCount })
          .eq('id', postId);

        // Create notification for post owner (if not self)
        if (currentPost && currentPost.author.id !== userId && createNotification) {
          await createNotification(currentPost.author.id, 'like', 'আপনার পোস্টে লাইক দিয়েছেন', postId);
        }
      }

      // Update with accurate count from database
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: newLikesCount, dislikes: newDislikesCount }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }, [userId, posts, createNotification]);

  const addComment = useCallback(async (postId: string, content: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile for the comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const newComment: CommentWithAuthor = {
        id: data.id,
        postId: data.post_id,
        content: data.content,
        createdAt: data.created_at,
        likes: 0,
        author: {
          id: userId,
          name: profile?.full_name || 'Unknown User',
        },
      };

      // Create notification for post owner (if not self)
      const post = posts.find(p => p.id === postId);
      if (post && post.author.id !== userId && createNotification) {
        await createNotification(post.author.id, 'comment', 'আপনার পোস্টে কমেন্ট করেছেন', postId);
      }

      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ));

      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      return null;
    }
  }, [userId, posts, createNotification]);

  const likeComment = useCallback(async (commentId: string) => {
    try {
      // Get current likes count
      const { data: comment } = await supabase
        .from('comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

      if (comment) {
        await supabase
          .from('comments')
          .update({ likes_count: comment.likes_count + 1 })
          .eq('id', commentId);

        // Optimistic update
        setPosts(prev => prev.map(post => ({
          ...post,
          comments: post.comments.map(c => 
            c.id === commentId 
              ? { ...c, likes: c.likes + 1 }
              : c
          ),
        })));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  }, []);

  // Track unique view for a post
  const trackView = useCallback(async (postId: string) => {
    try {
      // Generate a device fingerprint for guest users
      const deviceFingerprint = !userId ? 
        `guest_${navigator.userAgent.slice(0, 50)}_${screen.width}x${screen.height}` : null;

      if (userId) {
        // Logged in user - check by user_id
        const { data: existingView } = await supabase
          .from('post_views')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingView) return;

        // Insert new view
        const { error } = await supabase
          .from('post_views')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) return;
      } else {
        // Guest user - check by device fingerprint using localStorage
        const viewedPosts = JSON.parse(localStorage.getItem('viewed_posts') || '[]');
        if (viewedPosts.includes(postId)) return;
        
        // Mark as viewed in localStorage
        viewedPosts.push(postId);
        localStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
      }

      // Increment views count in database
      const { data: postData } = await supabase
        .from('posts')
        .select('views_count')
        .eq('id', postId)
        .single();

      const newViewCount = (postData?.views_count || 0) + 1;

      await supabase
        .from('posts')
        .update({ views_count: newViewCount })
        .eq('id', postId);

      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, views: newViewCount }
          : post
      ));
    } catch (err) {
      console.log('View tracking error:', err);
    }
  }, [userId]);

  // Delete a post
  const deletePost = useCallback(async (postId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      // Remove from local state
      setPosts(prev => {
        const updated = prev.filter(post => post.id !== postId);
        postsRef.current = updated;
        return updated;
      });

      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  }, [userId]);

  // Update a post
  const updatePost = useCallback(async (postId: string, newContent: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setPosts(prev => {
        const updated = prev.map(post => 
          post.id === postId ? { ...post, content: newContent } : post
        );
        postsRef.current = updated;
        return updated;
      });

      return true;
    } catch (err) {
      console.error('Error updating post:', err);
      return false;
    }
  }, [userId]);

  // Vote on a poll option
  const votePoll = useCallback(async (postId: string, optionIndex: number) => {
    if (!userId) {
      toast({
        title: 'লগইন প্রয়োজন',
        description: 'ভোট দিতে হলে প্রথমে লগইন করুন',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if user already voted on this poll
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id, option_index')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingVote) {
        toast({
          title: 'ইতিমধ্যে ভোট দিয়েছেন',
          description: 'আপনি এই পোলে আগেই ভোট দিয়েছেন',
        });
        return false;
      }

      // Get current poll options from database
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('poll_options')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      const pollOptions = postData?.poll_options as unknown as PollOption[];
      if (!pollOptions || !Array.isArray(pollOptions)) return false;

      // Record the vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          post_id: postId,
          user_id: userId,
          option_index: optionIndex,
        });

      if (voteError) throw voteError;

      // Increment vote count for the selected option
      const updatedOptions = pollOptions.map((opt, index) => 
        index === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
      );

      // Update in database
      const { error: updateError } = await supabase
        .from('posts')
        .update({ poll_options: updatedOptions as any })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Update local state
      setPosts(prev => {
        const updated = prev.map(post => 
          post.id === postId ? { ...post, pollOptions: updatedOptions } : post
        );
        postsRef.current = updated;
        return updated;
      });

      toast({
        title: 'ভোট সফল!',
        description: 'আপনার ভোট গ্রহণ করা হয়েছে',
      });

      return true;
    } catch (err) {
      console.error('Error voting on poll:', err);
      toast({
        title: 'ত্রুটি',
        description: 'ভোট দিতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
      return false;
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchPosts,
    loadMore,
    createPost,
    likePost,
    addComment,
    likeComment,
    trackView,
    deletePost,
    updatePost,
    votePoll,
  };
};
