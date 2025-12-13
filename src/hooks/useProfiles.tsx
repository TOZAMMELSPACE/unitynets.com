import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  role: string | null;
  username: string | null;
  trust_score: number;
  unity_notes: number;
  created_at: string;
  updated_at: string;
}

// Transform to legacy User format for compatibility
export interface LegacyUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string;
  nidMasked: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  role?: string;
  trustScore: number;
  followers: number;
  following: number;
  followersList?: string[];
  followingList?: string[];
  friendRequests?: string[];
  savedPosts?: string[];
  achievements: string[];
  isOnline: boolean;
  isVerified: boolean;
  joinDate: string;
  unityBalance?: number;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<LegacyUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProfiles(data || []);

      // Transform to legacy user format
      const legacyUsers: LegacyUser[] = (data || []).map(profile => ({
        id: profile.user_id,
        name: profile.full_name,
        username: profile.username || profile.full_name.toLowerCase().replace(/\s+/g, ''),
        phone: profile.phone || '',
        email: profile.email || undefined,
        nidMasked: '****',
        profileImage: profile.avatar_url || undefined,
        coverImage: profile.cover_url || undefined,
        bio: profile.bio || undefined,
        location: profile.location || undefined,
        role: profile.role || 'user',
        trustScore: profile.trust_score,
        followers: 0,
        following: 0,
        followersList: [],
        followingList: [],
        friendRequests: [],
        savedPosts: [],
        achievements: [],
        isOnline: false,
        isVerified: true,
        joinDate: profile.created_at,
        unityBalance: profile.unity_notes,
      }));

      setUsers(legacyUsers);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    users,
    loading,
    fetchProfiles,
    setUsers,
  };
};
