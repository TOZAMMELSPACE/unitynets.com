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

export interface PostWithAuthor {
  id: string;
  content: string;
  images?: string[];
  videoUrl?: string;
  community: string;
  postType: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job';
  createdAt: string;
  likes: number;
  dislikes: number;
  views: number;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  comments: CommentWithAuthor[];
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
      
      // Fetch posts with pagination
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) throw postsError;

      // Check if there are more posts
      setHasMore(postsData?.length === POSTS_PER_PAGE);

      if (!postsData || postsData.length === 0) {
        if (reset) {
          setPosts([]);
          postsRef.current = [];
        }
        return;
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      
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

      // Fetch comments for all posts
      const postIds = postsData.map(p => p.id);
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get unique user IDs from comments
      const commentUserIds = [...new Set((commentsData || []).map(c => c.user_id))];
      
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

      // Transform posts with author info and comments
      const transformedPosts: PostWithAuthor[] = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        const postComments = (commentsData || [])
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

        return {
          id: post.id,
          content: post.content,
          images: post.image_urls || undefined,
          videoUrl: post.video_url || undefined,
          community: post.community_tag || 'global',
          postType: post.video_url ? 'video' as const : (post.image_urls && post.image_urls.length > 0 ? 'image' as const : 'text' as const),
          createdAt: post.created_at,
          likes: post.likes_count,
          dislikes: post.dislikes_count,
          views: post.views_count,
          author: {
            id: post.user_id,
            name: profile?.full_name || 'Unknown User',
            profileImage: profile?.avatar_url || undefined,
          },
          comments: postComments,
        };
      });

      if (reset) {
        setPosts(transformedPosts);
        postsRef.current = transformedPosts;
      } else {
        setPosts(prev => {
          const newPosts = [...prev, ...transformedPosts];
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
    videoUrl?: string
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
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          image_urls: imageUrls || null,
          video_url: videoUrl || null,
          community_tag: communityTag || 'global',
        })
        .select()
        .single();

      if (error) throw error;

      // Get user profile for immediate display
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Optimistic update - add new post immediately to UI
      const newPost: PostWithAuthor = {
        id: data.id,
        content: data.content,
        images: data.image_urls || undefined,
        videoUrl: data.video_url || undefined,
        community: data.community_tag || 'global',
        postType: data.video_url ? 'video' : (data.image_urls && data.image_urls.length > 0 ? 'image' : 'text'),
        createdAt: data.created_at,
        likes: 0,
        dislikes: 0,
        views: 0,
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

      const currentPost = posts.find(p => p.id === postId);
      
      if (existingLike) {
        if (existingLike.is_like) {
          // Already liked, remove like
          await supabase
            .from('post_likes')
            .delete()
            .eq('id', existingLike.id);
          
          // Decrement likes count
          await supabase
            .from('posts')
            .update({ likes_count: Math.max(0, (currentPost?.likes || 1) - 1) })
            .eq('id', postId);
        } else {
          // Was dislike, change to like
          await supabase
            .from('post_likes')
            .update({ is_like: true })
            .eq('id', existingLike.id);
          
          // Increment likes, decrement dislikes
          await supabase
            .from('posts')
            .update({ 
              likes_count: (currentPost?.likes || 0) + 1,
              dislikes_count: Math.max(0, (currentPost?.dislikes || 1) - 1)
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
        
        // Increment likes count
        const currentPost = posts.find(p => p.id === postId);
        await supabase
          .from('posts')
          .update({ likes_count: (currentPost?.likes || 0) + 1 })
          .eq('id', postId);

        // Create notification for post owner (if not self)
        if (currentPost && currentPost.author.id !== userId && createNotification) {
          await createNotification(currentPost.author.id, 'like', 'আপনার পোস্টে লাইক দিয়েছেন', postId);
        }
      }

      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }, [userId, posts]);

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
    if (!userId) return;

    try {
      // First check if user already viewed this post
      const { data: existingView } = await supabase
        .from('post_views')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      // If already viewed, don't do anything
      if (existingView) return;

      // Insert new view
      const { error } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      // If successful (new view), increment the views count
      if (!error) {
        // Get current count from database to be accurate
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
      }
    } catch (err) {
      // Silently fail - duplicate view is expected behavior
      console.log('View tracking error:', err);
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
  };
};
