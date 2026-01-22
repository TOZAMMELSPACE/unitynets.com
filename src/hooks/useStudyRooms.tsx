import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface StudyRoom {
  id: string;
  name: string;
  description: string | null;
  topic: string | null;
  max_members: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members_count?: number;
  is_member?: boolean;
}

export interface StudyRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface StudyRoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'note' | 'quiz' | 'system';
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface StudyRoomNote {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function useStudyRooms(userId: string | null) {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      // Fetch all active rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (roomsError) throw roomsError;

      // Fetch member counts for each room
      const roomsWithCounts = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { count } = await supabase
            .from('study_room_members')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id);

          let isMember = false;
          if (userId) {
            const { data: memberData } = await supabase
              .from('study_room_members')
              .select('id')
              .eq('room_id', room.id)
              .eq('user_id', userId)
              .single();
            isMember = !!memberData;
          }

          return {
            ...room,
            members_count: count || 0,
            is_member: isMember,
          };
        })
      );

      setRooms(roomsWithCounts);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (name: string, description: string, topic: string, maxMembers: number = 8) => {
    if (!userId) {
      toast({
        title: t('Login Required', 'লগইন প্রয়োজন'),
        description: t('Please login to create a study room', 'স্টাডি রুম তৈরি করতে লগইন করুন'),
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('study_rooms')
        .insert({
          name,
          description,
          topic,
          max_members: maxMembers,
          created_by: userId,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('study_room_members')
        .insert({
          room_id: roomData.id,
          user_id: userId,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast({
        title: t('Room Created!', 'রুম তৈরি হয়েছে!'),
        description: t('Your study room is ready', 'আপনার স্টাডি রুম প্রস্তুত'),
      });

      fetchRooms();
      return roomData;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: t('Error', 'ত্রুটি'),
        description: t('Failed to create room', 'রুম তৈরি করতে ব্যর্থ'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!userId) {
      toast({
        title: t('Login Required', 'লগইন প্রয়োজন'),
        description: t('Please login to join a study room', 'স্টাডি রুম যোগ দিতে লগইন করুন'),
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check room capacity
      const room = rooms.find(r => r.id === roomId);
      if (room && room.members_count && room.members_count >= room.max_members) {
        toast({
          title: t('Room Full', 'রুম পূর্ণ'),
          description: t('This room has reached maximum capacity', 'এই রুমে সর্বোচ্চ সদস্য হয়ে গেছে'),
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('study_room_members')
        .insert({
          room_id: roomId,
          user_id: userId,
          role: 'member',
        });

      if (error) throw error;

      toast({
        title: t('Joined!', 'যোগ দিয়েছেন!'),
        description: t('You have joined the study room', 'আপনি স্টাডি রুমে যোগ দিয়েছেন'),
      });

      fetchRooms();
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: t('Error', 'ত্রুটি'),
        description: t('Failed to join room', 'রুমে যোগ দিতে ব্যর্থ'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('study_room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: t('Left Room', 'রুম ছেড়েছেন'),
        description: t('You have left the study room', 'আপনি স্টাডি রুম ছেড়ে দিয়েছেন'),
      });

      fetchRooms();
      return true;
    } catch (error) {
      console.error('Error leaving room:', error);
      return false;
    }
  };

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    refreshRooms: fetchRooms,
  };
}

export function useStudyRoomDetail(roomId: string | null, userId: string | null) {
  const { t } = useLanguage();
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [members, setMembers] = useState<StudyRoomMember[]>([]);
  const [messages, setMessages] = useState<StudyRoomMessage[]>([]);
  const [notes, setNotes] = useState<StudyRoomNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return;

    try {
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('study_room_members')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Fetch profiles for members
      const memberIds = (membersData || []).map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', memberIds);

      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      setMembers(
        (membersData || []).map(m => ({
          ...m,
          role: m.role as 'admin' | 'member',
          profile: profileMap.get(m.user_id) || { full_name: 'Unknown', avatar_url: null },
        }))
      );

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('study_room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Fetch profiles for message senders
      const senderIds = [...new Set((messagesData || []).map(m => m.user_id))];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', senderIds);

      const senderMap = new Map(
        (senderProfiles || []).map(p => [p.user_id, p])
      );

      setMessages(
        (messagesData || []).map(m => ({
          ...m,
          message_type: m.message_type as 'text' | 'note' | 'quiz' | 'system',
          profile: senderMap.get(m.user_id) || { full_name: 'Unknown', avatar_url: null },
        }))
      );

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('study_room_notes')
        .select('*')
        .eq('room_id', roomId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      const noteUserIds = [...new Set((notesData || []).map(n => n.user_id))];
      const { data: noteProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', noteUserIds);

      const noteProfileMap = new Map(
        (noteProfiles || []).map(p => [p.user_id, p])
      );

      setNotes(
        (notesData || []).map(n => ({
          ...n,
          profile: noteProfileMap.get(n.user_id) || { full_name: 'Unknown', avatar_url: null },
        }))
      );
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!roomId) return;

    fetchRoomDetails();

    const channel = supabase
      .channel(`study_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMessage = payload.new as StudyRoomMessage;
          
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', newMessage.user_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMessage,
            message_type: newMessage.message_type as 'text' | 'note' | 'quiz' | 'system',
            profile: profile || { full_name: 'Unknown', avatar_url: null },
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchRoomDetails]);

  const sendMessage = async (content: string, messageType: 'text' | 'note' | 'quiz' | 'system' = 'text') => {
    if (!roomId || !userId || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('study_room_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: content.trim(),
          message_type: messageType,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('Error', 'ত্রুটি'),
        description: t('Failed to send message', 'মেসেজ পাঠাতে ব্যর্থ'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const addNote = async (title: string, content: string) => {
    if (!roomId || !userId) return false;

    try {
      const { error } = await supabase
        .from('study_room_notes')
        .insert({
          room_id: roomId,
          user_id: userId,
          title,
          content,
        });

      if (error) throw error;

      toast({
        title: t('Note Added!', 'নোট যোগ হয়েছে!'),
        description: t('Your note has been shared with the room', 'আপনার নোট রুমে শেয়ার হয়েছে'),
      });

      fetchRoomDetails();
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: t('Error', 'ত্রুটি'),
        description: t('Failed to add note', 'নোট যোগ করতে ব্যর্থ'),
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    room,
    members,
    messages,
    notes,
    loading,
    sendMessage,
    addNote,
    refreshRoom: fetchRoomDetails,
  };
}
