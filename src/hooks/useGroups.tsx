import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  category: string;
  is_private: boolean;
  created_by: string;
  members_count: number;
  posts_count: number;
  is_official: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export function useGroups(userId: string | null) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [myMemberships, setMyMemberships] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all public groups
  const fetchGroups = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('members_count', { ascending: false });

      if (error) throw error;
      setGroups((data as Group[]) || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, []);

  // Fetch user's memberships
  const fetchMyMemberships = useCallback(async () => {
    if (!userId) {
      setMyMemberships([]);
      setMyGroups([]);
      return;
    }

    try {
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('*')
        .eq('user_id', userId);

      if (membershipError) throw membershipError;
      setMyMemberships((memberships as GroupMember[]) || []);

      // Get the groups user is member of
      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map(m => m.group_id);
        const { data: userGroups, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) throw groupsError;
        setMyGroups((userGroups as Group[]) || []);
      } else {
        setMyGroups([]);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  }, [userId]);

  // Join a group
  const joinGroup = async (groupId: string) => {
    if (!userId) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "গ্রুপে যোগ দিতে প্রথমে লগইন করুন",
        variant: "destructive"
      });
      return false;
    }

    setJoiningGroupId(groupId);

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "আপনি ইতিমধ্যে সদস্য",
            description: "আপনি এই গ্রুপে আগেই যোগ দিয়েছেন",
          });
        } else {
          throw error;
        }
        return false;
      }

      // Create notification for group join
      const group = groups.find(g => g.id === groupId);
      if (group && group.created_by !== '00000000-0000-0000-0000-000000000000') {
        await supabase.from('notifications').insert({
          user_id: group.created_by,
          from_user_id: userId,
          type: 'group_join',
          content: `একজন নতুন সদস্য "${group.name}" গ্রুপে যোগ দিয়েছেন`
        });
      }

      toast({
        title: "সফল!",
        description: "আপনি সফলভাবে গ্রুপে যোগ দিয়েছেন",
      });

      // Refresh data
      await Promise.all([fetchGroups(), fetchMyMemberships()]);
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "ত্রুটি",
        description: "গ্রুপে যোগ দিতে সমস্যা হয়েছে",
        variant: "destructive"
      });
      return false;
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Leave a group
  const leaveGroup = async (groupId: string) => {
    if (!userId) return false;

    setJoiningGroupId(groupId);

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "আপনি গ্রুপ থেকে বের হয়েছেন",
      });

      // Refresh data
      await Promise.all([fetchGroups(), fetchMyMemberships()]);
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "ত্রুটি",
        description: "গ্রুপ থেকে বের হতে সমস্যা হয়েছে",
        variant: "destructive"
      });
      return false;
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Check if user is member of a group
  const isMember = (groupId: string) => {
    return myMemberships.some(m => m.group_id === groupId);
  };

  // Get user's role in a group
  const getMemberRole = (groupId: string) => {
    const membership = myMemberships.find(m => m.group_id === groupId);
    return membership?.role || null;
  };

  // Create a new group
  const createGroup = async (groupData: {
    name: string;
    description: string;
    category: string;
    is_private: boolean;
    cover_url?: string;
  }) => {
    if (!userId) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "গ্রুপ তৈরি করতে প্রথমে লগইন করুন",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically add creator as admin
      await supabase.from('group_members').insert({
        group_id: data.id,
        user_id: userId,
        role: 'admin'
      });

      toast({
        title: "সফল!",
        description: "আপনার গ্রুপ তৈরি হয়েছে",
      });

      await Promise.all([fetchGroups(), fetchMyMemberships()]);
      return data as Group;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "ত্রুটি",
        description: "গ্রুপ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGroups(), fetchMyMemberships()]);
      setLoading(false);
    };
    loadData();
  }, [fetchGroups, fetchMyMemberships]);

  return {
    groups,
    myGroups,
    myMemberships,
    loading,
    joiningGroupId,
    joinGroup,
    leaveGroup,
    isMember,
    getMemberRole,
    createGroup,
    refetch: () => Promise.all([fetchGroups(), fetchMyMemberships()])
  };
}
