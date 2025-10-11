import { useState, useCallback } from 'react';
import { User, Notification, Activity, STORAGE, save, load } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export const useSocial = (currentUser: User | null, users: User[], setUsers: (users: User[]) => void) => {
  // Follow a user
  const followUser = useCallback((targetUserId: string) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        // Add to current user's following list
        const followingList = [...(user.followingList || []), targetUserId];
        return { 
          ...user, 
          following: user.following + 1,
          followingList 
        };
      }
      if (user.id === targetUserId) {
        // Add to target user's followers list
        const followersList = [...(user.followersList || []), currentUser.id];
        return { 
          ...user, 
          followers: user.followers + 1,
          followersList 
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    // Create notification
    createNotification({
      userId: targetUserId,
      type: 'follow',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserImage: currentUser.profileImage,
      content: 'আপনাকে ফলো করেছেন'
    });
    
    toast({
      title: "সফল!",
      description: "ইউজারকে ফলো করা হয়েছে",
    });
  }, [currentUser, users, setUsers]);

  // Unfollow a user
  const unfollowUser = useCallback((targetUserId: string) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        // Remove from current user's following list
        const followingList = (user.followingList || []).filter(id => id !== targetUserId);
        return { 
          ...user, 
          following: Math.max(0, user.following - 1),
          followingList 
        };
      }
      if (user.id === targetUserId) {
        // Remove from target user's followers list
        const followersList = (user.followersList || []).filter(id => id !== currentUser.id);
        return { 
          ...user, 
          followers: Math.max(0, user.followers - 1),
          followersList 
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    toast({
      title: "সফল!",
      description: "ইউজারকে আনফলো করা হয়েছে",
    });
  }, [currentUser, users, setUsers]);

  // Send friend request
  const sendFriendRequest = useCallback((targetUserId: string) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === targetUserId) {
        const friendRequests = [...(user.friendRequests || []), currentUser.id];
        return { ...user, friendRequests };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    // Create notification
    createNotification({
      userId: targetUserId,
      type: 'friend_request',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserImage: currentUser.profileImage,
      content: 'আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন'
    });
    
    toast({
      title: "সফল!",
      description: "ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে",
    });
  }, [currentUser, users, setUsers]);

  // Accept friend request
  const acceptFriendRequest = useCallback((requestUserId: string) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        // Remove from friend requests and add to followers/following
        const friendRequests = (user.friendRequests || []).filter(id => id !== requestUserId);
        const followersList = [...(user.followersList || []), requestUserId];
        const followingList = [...(user.followingList || []), requestUserId];
        return { 
          ...user, 
          friendRequests,
          followersList,
          followingList,
          followers: user.followers + 1,
          following: user.following + 1
        };
      }
      if (user.id === requestUserId) {
        // Add to followers/following
        const followersList = [...(user.followersList || []), currentUser.id];
        const followingList = [...(user.followingList || []), currentUser.id];
        return { 
          ...user,
          followersList,
          followingList,
          followers: user.followers + 1,
          following: user.following + 1
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    // Create notification
    createNotification({
      userId: requestUserId,
      type: 'friend_accept',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserImage: currentUser.profileImage,
      content: 'আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন'
    });
    
    toast({
      title: "সফল!",
      description: "ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে",
    });
  }, [currentUser, users, setUsers]);

  // Reject friend request
  const rejectFriendRequest = useCallback((requestUserId: string) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        const friendRequests = (user.friendRequests || []).filter(id => id !== requestUserId);
        return { ...user, friendRequests };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    toast({
      title: "প্রত্যাখ্যান করা হয়েছে",
      description: "ফ্রেন্ড রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে",
    });
  }, [currentUser, users, setUsers]);

  // Check if following a user
  const isFollowing = useCallback((targetUserId: string) => {
    if (!currentUser) return false;
    return (currentUser.followingList || []).includes(targetUserId);
  }, [currentUser]);

  // Check if friend request sent
  const hasSentFriendRequest = useCallback((targetUserId: string) => {
    if (!currentUser) return false;
    const targetUser = users.find(u => u.id === targetUserId);
    return (targetUser?.friendRequests || []).includes(currentUser.id);
  }, [currentUser, users]);

  // Create notification
  const createNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const notifications = load<Notification[]>(STORAGE.NOTIFICATIONS, []);
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    notifications.unshift(newNotification);
    save(STORAGE.NOTIFICATIONS, notifications);
  };

  // Save/unsave post
  const toggleSavePost = useCallback((postId: string) => {
    if (!currentUser) return;
    
    const savedPosts = currentUser.savedPosts || [];
    const isSaved = savedPosts.includes(postId);
    
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        const newSavedPosts = isSaved 
          ? savedPosts.filter(id => id !== postId)
          : [...savedPosts, postId];
        return { ...user, savedPosts: newSavedPosts };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    toast({
      title: isSaved ? "সরানো হয়েছে" : "সংরক্ষিত!",
      description: isSaved ? "পোস্ট সেভ থেকে সরানো হয়েছে" : "পোস্ট সংরক্ষণ করা হয়েছে",
    });
  }, [currentUser, users, setUsers]);

  // Check if post is saved
  const isPostSaved = useCallback((postId: string) => {
    if (!currentUser) return false;
    return (currentUser.savedPosts || []).includes(postId);
  }, [currentUser]);

  return {
    followUser,
    unfollowUser,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    isFollowing,
    hasSentFriendRequest,
    toggleSavePost,
    isPostSaved,
    createNotification
  };
};
