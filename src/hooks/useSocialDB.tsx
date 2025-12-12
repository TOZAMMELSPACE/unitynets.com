import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  from_user_id: string;
  content: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
  from_user_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useSocialDB = (currentUserId: string | null) => {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch follows
  const fetchFollows = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const [followingRes, followersRes] = await Promise.all([
        supabase.from('follows').select('following_id').eq('follower_id', currentUserId),
        supabase.from('follows').select('follower_id').eq('following_id', currentUserId)
      ]);

      setFollowing(followingRes.data?.map(f => f.following_id) || []);
      setFollowers(followersRes.data?.map(f => f.follower_id) || []);
    } catch (error) {
      console.error('Error fetching follows:', error);
    }
  }, [currentUserId]);

  // Follow user
  const followUser = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });

      if (error) throw error;

      // Create notification
      await createNotification(targetUserId, 'follow', 'আপনাকে ফলো করেছেন');

      setFollowing(prev => [...prev, targetUserId]);
      toast({ title: "সফল!", description: "ইউজারকে ফলো করা হয়েছে" });
    } catch (error) {
      console.error('Error following user:', error);
      toast({ title: "ত্রুটি", description: "ফলো করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  }, [currentUserId]);

  // Unfollow user
  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setFollowing(prev => prev.filter(id => id !== targetUserId));
      toast({ title: "সফল!", description: "আনফলো করা হয়েছে" });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }, [currentUserId]);

  // Check if following
  const isFollowing = useCallback((targetUserId: string) => {
    return following.includes(targetUserId);
  }, [following]);

  // Send friend request
  const sendFriendRequest = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({ sender_id: currentUserId, receiver_id: targetUserId, status: 'pending' });

      if (error) throw error;

      await createNotification(targetUserId, 'friend_request', 'আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন');

      setSentRequests(prev => [...prev, targetUserId]);
      toast({ title: "সফল!", description: "ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে" });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({ title: "ত্রুটি", description: "রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে", variant: "destructive" });
    }
  }, [currentUserId]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (requestId: string, senderId: string) => {
    if (!currentUserId) return;
    
    try {
      // Update request status
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      // Create mutual follows
      await supabase.from('follows').insert([
        { follower_id: currentUserId, following_id: senderId },
        { follower_id: senderId, following_id: currentUserId }
      ]);

      await createNotification(senderId, 'friend_accept', 'আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন');

      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      setFollowing(prev => [...prev, senderId]);
      setFollowers(prev => [...prev, senderId]);
      
      toast({ title: "সফল!", description: "ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে" });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  }, [currentUserId]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return;
    
    try {
      await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      toast({ title: "প্রত্যাখ্যান", description: "ফ্রেন্ড রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে" });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  }, [currentUserId]);

  // Check if friend request sent
  const hasSentFriendRequest = useCallback((targetUserId: string) => {
    return sentRequests.includes(targetUserId);
  }, [sentRequests]);

  // Fetch friend requests
  const fetchFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const [receivedRes, sentRes] = await Promise.all([
        supabase
          .from('friend_requests')
          .select('*')
          .eq('receiver_id', currentUserId)
          .eq('status', 'pending'),
        supabase
          .from('friend_requests')
          .select('receiver_id')
          .eq('sender_id', currentUserId)
          .eq('status', 'pending')
      ]);

      // Fetch sender profiles
      const requestsWithProfiles = await Promise.all(
        (receivedRes.data || []).map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', req.sender_id)
            .single();
          return { ...req, sender_profile: profile || undefined };
        })
      );

      setFriendRequests(requestsWithProfiles);
      setSentRequests(sentRes.data?.map(r => r.receiver_id) || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }, [currentUserId]);

  // Create notification
  const createNotification = async (userId: string, type: string, content: string, postId?: string) => {
    if (!currentUserId) return;
    
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        from_user_id: currentUserId,
        content,
        post_id: postId || null
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch sender profiles
      const notificationsWithProfiles = await Promise.all(
        (data || []).map(async (notif) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', notif.from_user_id)
            .single();
          return { ...notif, from_user_profile: profile || undefined };
        })
      );

      setNotifications(notificationsWithProfiles);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUserId]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  }, []);

  // Save/unsave post
  const toggleSavePost = useCallback(async (postId: string) => {
    if (!currentUserId) return;
    
    const isSaved = savedPosts.includes(postId);
    
    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', currentUserId)
          .eq('post_id', postId);
        setSavedPosts(prev => prev.filter(id => id !== postId));
        toast({ title: "সরানো হয়েছে", description: "পোস্ট সেভ থেকে সরানো হয়েছে" });
      } else {
        await supabase
          .from('saved_posts')
          .insert({ user_id: currentUserId, post_id: postId });
        setSavedPosts(prev => [...prev, postId]);
        toast({ title: "সংরক্ষিত!", description: "পোস্ট সংরক্ষণ করা হয়েছে" });
      }
    } catch (error) {
      console.error('Error toggling save post:', error);
    }
  }, [currentUserId, savedPosts]);

  // Check if post is saved
  const isPostSaved = useCallback((postId: string) => {
    return savedPosts.includes(postId);
  }, [savedPosts]);

  // Fetch saved posts
  const fetchSavedPosts = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const { data } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', currentUserId);

      setSavedPosts(data?.map(s => s.post_id) || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  }, [currentUserId]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      Promise.all([
        fetchFollows(),
        fetchFriendRequests(),
        fetchNotifications(),
        fetchSavedPosts()
      ]).finally(() => setLoading(false));
    }
  }, [currentUserId, fetchFollows, fetchFriendRequests, fetchNotifications, fetchSavedPosts]);

  return {
    following,
    followers,
    friendRequests,
    notifications,
    savedPosts,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    hasSentFriendRequest,
    toggleSavePost,
    isPostSaved,
    markNotificationRead,
    createNotification,
    fetchNotifications
  };
};
