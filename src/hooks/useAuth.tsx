import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export interface AppUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  role?: string;
  trustScore: number;
  unityNotes: number;
  isVerified: boolean;
  isOnline: boolean;
  followers: number;
  following: number;
  achievements: string[];
  joinDate: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      setProfile(data);
      
      // Transform to AppUser format for compatibility
      const transformedUser: AppUser = {
        id: data.user_id,
        name: data.full_name,
        username: data.username || data.full_name.toLowerCase().replace(/\s+/g, ''),
        phone: data.phone || '',
        email: data.email || user?.email,
        profileImage: data.avatar_url || undefined,
        coverImage: data.cover_url || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        role: data.role || 'user',
        trustScore: data.trust_score,
        unityNotes: data.unity_notes,
        isVerified: true,
        isOnline: true,
        followers: 0,
        following: 0,
        achievements: [],
        joinDate: data.created_at,
      };
      
      setAppUser(transformedUser);
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  }, [user?.email]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setAppUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone || '',
        },
      },
    });

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Success!',
      description: 'Your account has been created.',
    });
    
    return { data };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully logged in.',
    });

    return { data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    // Clear local state regardless of API response
    // "Session not found" means already logged out, which is fine
    setUser(null);
    setSession(null);
    setProfile(null);
    setAppUser(null);
    
    // Only show error for actual failures, not "session not found"
    if (error && !error.message.includes('Session not found')) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    return { error: null };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    setProfile(data);
    
    // Update appUser as well
    if (appUser && data) {
      setAppUser({
        ...appUser,
        name: data.full_name,
        username: data.username || data.full_name.toLowerCase().replace(/\s+/g, ''),
        phone: data.phone || '',
        email: data.email || appUser.email,
        profileImage: data.avatar_url || undefined,
        coverImage: data.cover_url || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        role: data.role || 'user',
        trustScore: data.trust_score,
        unityNotes: data.unity_notes,
      });
    }

    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });

    return { data };
  };

  return {
    user,
    session,
    profile,
    appUser,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
  };
};
