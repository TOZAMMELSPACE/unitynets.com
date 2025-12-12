import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  image_url: string | null;
  is_read: boolean | null;
  created_at: string;
}

export const useMessages = (currentUserId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all conversations for current user
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch profile info for other participants
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.participant_1 === currentUserId 
            ? conv.participant_2 
            : conv.participant_1;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', otherUserId)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', currentUserId)
            .eq('sender_id', otherUserId)
            .eq('is_read', false);

          return {
            ...conv,
            other_user: profile ? {
              id: profile.user_id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            } : undefined,
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [currentUserId]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string, imageUrl?: string) => {
    if (!currentUserId) return null;
    
    try {
      // Insert the message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: content || null,
          image_url: imageUrl || null,
          is_read: false
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Update or create conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${currentUserId},participant_2.eq.${receiverId}),and(participant_1.eq.${receiverId},participant_2.eq.${currentUserId})`)
        .single();

      if (existingConv) {
        await supabase
          .from('conversations')
          .update({
            last_message: content || '📷 ছবি',
            last_message_at: new Date().toISOString()
          })
          .eq('id', existingConv.id);
      } else {
        await supabase
          .from('conversations')
          .insert({
            participant_1: currentUserId,
            participant_2: receiverId,
            last_message: content || '📷 ছবি',
            last_message_at: new Date().toISOString()
          });
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ পাঠাতে সমস্যা হয়েছে",
        variant: "destructive"
      });
      return null;
    }
  }, [currentUserId]);

  // Create or get conversation
  const getOrCreateConversation = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return null;
    
    try {
      // Check for existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${currentUserId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${currentUserId})`)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: currentUserId,
          participant_2: otherUserId
        })
        .select()
        .single();

      if (error) throw error;
      return newConv;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [currentUserId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    getOrCreateConversation,
    setMessages
  };
};
