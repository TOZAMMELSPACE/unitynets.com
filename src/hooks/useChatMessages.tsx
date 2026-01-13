import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from './useChat';

export function useChatMessages(chatId: string | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const pageSize = 50;
  const offsetRef = useRef(0);

  const fetchMessages = useCallback(async (reset = true) => {
    if (!chatId || !currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    if (reset) {
      offsetRef.current = 0;
      setHasMore(true);
    }

    try {
      // Use any type temporarily until Supabase types are regenerated
      const { data, error } = await (supabase
        .from('chat_messages' as any)
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offsetRef.current, offsetRef.current + pageSize - 1) as any);

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set((data as any[])?.map((m: any) => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, trust_score')
        .in('user_id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      // Fetch reply-to messages if any
      const replyToIds = (data as any[])?.filter((m: any) => m.reply_to_id).map((m: any) => m.reply_to_id) || [];
      let replyMap = new Map<string, ChatMessage>();
      
      if (replyToIds.length > 0) {
        const { data: replyMessages } = await (supabase
          .from('chat_messages' as any)
          .select('*')
          .in('id', replyToIds) as any);
        
        replyMap = new Map((replyMessages as any[])?.map((m: any) => [m.id, m as ChatMessage]));
      }

      const enrichedMessages = ((data as any[]) || []).map((m: any) => ({
        ...m,
        sender: profileMap.get(m.sender_id),
        reply_to: m.reply_to_id ? replyMap.get(m.reply_to_id) : null,
      })) as ChatMessage[];

      if (reset) {
        setMessages(enrichedMessages.reverse());
      } else {
        setMessages(prev => [...enrichedMessages.reverse(), ...prev]);
      }

      setHasMore(((data as any[])?.length || 0) === pageSize);
      offsetRef.current += (data as any[])?.length || 0;

      // Mark messages as read
      await (supabase.rpc as any)('mark_messages_read', { p_chat_id: chatId });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, currentUserId]);

  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'image' | 'video' | 'voice' | 'file' = 'text',
    metadata: Record<string, unknown> = {},
    replyToId?: string
  ): Promise<ChatMessage | null> => {
    if (!chatId || !currentUserId || !content.trim()) return null;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      chat_id: chatId,
      sender_id: currentUserId,
      type,
      content,
      encrypted_content: null,
      metadata,
      read_by: [currentUserId],
      reactions: {},
      reply_to_id: replyToId || null,
      is_edited: false,
      is_deleted: false,
      is_pinned: false,
      is_forwarded: false,
      created_at: new Date().toISOString(),
      edited_at: null,
      deleted_at: null,
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await (supabase
        .from('chat_messages' as any)
        .insert({
          chat_id: chatId,
          sender_id: currentUserId,
          type,
          content,
          metadata,
          read_by: [currentUserId],
          reply_to_id: replyToId || null,
        })
        .select()
        .single() as any);

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, sender: m.sender } as ChatMessage : m));

      return data as ChatMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return null;
    }
  }, [chatId, currentUserId, toast]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const { error } = await (supabase
        .from('chat_messages' as any)
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId) as any);

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
          : m
      ));
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit message',
        variant: 'destructive',
      });
    }
  }, [currentUserId, toast]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await (supabase
        .from('chat_messages' as any)
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          content: null,
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId) as any);

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, is_deleted: true, content: null }
          : m
      ));
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  }, [currentUserId, toast]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return;

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const currentReactions = message.reactions || {};
      const emojiReactions = currentReactions[emoji] || [];
      
      let newReactions: Record<string, string[]>;
      
      if (emojiReactions.includes(currentUserId)) {
        // Remove reaction
        newReactions = {
          ...currentReactions,
          [emoji]: emojiReactions.filter(id => id !== currentUserId),
        };
      } else {
        // Add reaction
        newReactions = {
          ...currentReactions,
          [emoji]: [...emojiReactions, currentUserId],
        };
      }

      // Clean up empty arrays
      Object.keys(newReactions).forEach(key => {
        if (newReactions[key].length === 0) {
          delete newReactions[key];
        }
      });

      const { error } = await (supabase
        .from('chat_messages' as any)
        .update({ reactions: newReactions })
        .eq('id', messageId) as any);

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reactions: newReactions } : m
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [currentUserId, messages]);

  // Real-time subscription
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    fetchMessages(true);

    const channel = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Don't add if it's from current user (already added optimistically)
          if (newMessage.sender_id === currentUserId) {
            // But update if it exists as temp
            setMessages(prev => {
              const hasTemp = prev.some(m => m.id.startsWith('temp-') && m.sender_id === currentUserId);
              if (hasTemp) {
                return prev.map(m => 
                  m.id.startsWith('temp-') && m.sender_id === currentUserId 
                    ? newMessage 
                    : m
                );
              }
              return prev;
            });
            return;
          }

          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id, full_name, avatar_url, trust_score')
            .eq('user_id', newMessage.sender_id)
            .single();

          setMessages(prev => {
            // Check if message already exists
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, { ...newMessage, sender: profile }];
          });

          // Mark as read if chat is open
          await (supabase.rpc as any)('mark_messages_read', { p_chat_id: chatId });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setMessages(prev => prev.map(m => 
            m.id === updatedMessage.id 
              ? { ...m, ...updatedMessage }
              : m
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId, fetchMessages]);

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMore: () => fetchMessages(false),
    refresh: () => fetchMessages(true),
  };
}
