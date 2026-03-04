import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'call_started' | 'call_ended' | 'system';
  content: string | null;
  encrypted_content: string | null;
  metadata: Record<string, unknown>;
  read_by: string[];
  reactions: Record<string, string[]>;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  is_forwarded: boolean;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender?: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    trust_score: number | null;
  };
  reply_to?: ChatMessage | null;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  group_name: string | null;
  group_avatar_url: string | null;
  group_description: string | null;
  created_at: string;
  updated_at: string;
  participants?: ChatParticipant[];
  last_message?: ChatMessage | null;
  other_user?: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    trust_score: number | null;
    is_online: boolean;
    last_seen: string | null;
  };
  unread_count?: number;
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'owner';
  muted_until: string | null;
  is_pinned: boolean;
  unread_count: number;
  last_read_at: string | null;
  joined_at: string;
  profile?: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    trust_score: number | null;
    is_online: boolean;
    last_seen: string | null;
  };
}

export interface ChatLoadError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
  raw?: unknown;
}

export function useChat(currentUserId: string | null) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ChatLoadError | null>(null);
  const lastToastKeyRef = useRef<string | null>(null);
  const { toast } = useToast();

  const fetchChats = useCallback(async () => {
    if (!currentUserId) {
      setChats([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get all chat participations for current user
      const { data: participations, error: partError } = await (supabase
        .from('chat_participants' as any)
        .select('chat_id, unread_count, is_pinned')
        .eq('user_id', currentUserId) as any);

      if (partError) throw partError;

      if (!participations || participations.length === 0) {
        setChats([]);
        setError(null);
        lastToastKeyRef.current = null;
        return;
      }

      const chatIds = (participations as any[]).map((p: any) => p.chat_id);

      // Get chats
      const { data: chatsData, error: chatsError } = await (supabase
        .from('chats' as any)
        .select('*')
        .in('id', chatIds)
        .order('updated_at', { ascending: false }) as any);

      if (chatsError) throw chatsError;

      // For each chat, get participants and last message
      const enrichedChats = await Promise.all(
        ((chatsData as any[]) || []).map(async (chat: any) => {
          // Get participants
          const { data: chatParticipants } = await (supabase
            .from('chat_participants' as any)
            .select('*')
            .eq('chat_id', chat.id) as any);

          // Get last message
          const { data: lastMessageData } = await (supabase
            .from('chat_messages' as any)
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() as any);

          // For direct chats, get the other user's profile
          let otherUser = null;
          const participation = (participations as any[]).find((p: any) => p.chat_id === chat.id);

          if (chat.type === 'direct') {
            const otherParticipant = (chatParticipants as any[])?.find(
              (p: any) => p.user_id !== currentUserId
            );

            if (otherParticipant) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, user_id, full_name, avatar_url, trust_score, is_online, last_seen')
                .eq('user_id', otherParticipant.user_id)
                .single();

              otherUser = profileData;
            }
          }

          // Get profiles for all participants
          const participantsWithProfiles = await Promise.all(
            ((chatParticipants as any[]) || []).map(async (p: any) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, user_id, full_name, avatar_url, trust_score, is_online, last_seen')
                .eq('user_id', p.user_id)
                .single();

              return { ...p, profile: profileData };
            })
          );

          return {
            ...chat,
            participants: participantsWithProfiles,
            last_message: lastMessageData,
            other_user: otherUser,
            unread_count: participation?.unread_count || 0,
          } as Chat;
        })
      );

      // Sort: pinned first, then by updated_at
      enrichedChats.sort((a, b) => {
        const aPinned = (participations as any[]).find((p: any) => p.chat_id === a.id)?.is_pinned || false;
        const bPinned = (participations as any[]).find((p: any) => p.chat_id === b.id)?.is_pinned || false;

        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      setChats(enrichedChats);
      setError(null);
      lastToastKeyRef.current = null;
    } catch (err: any) {
      console.error('Error fetching chats:', err);

      const errorInfo: ChatLoadError = {
        message: err?.message || 'Failed to load chats',
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        status: err?.status,
        raw: err,
      };

      setError(errorInfo);

      const toastKey = `${errorInfo.code ?? ''}:${errorInfo.status ?? ''}:${errorInfo.message}:${errorInfo.details ?? ''}`;
      if (lastToastKeyRef.current !== toastKey) {
        lastToastKeyRef.current = toastKey;
        toast({
          title: 'চ্যাট লোড হয়নি',
          description: errorInfo.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId, toast]);

  const getOrCreateDirectChat = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('get_or_create_direct_chat', {
        other_user_id: otherUserId,
      });

      if (rpcError) throw rpcError;

      await fetchChats();
      return data;
    } catch (err) {
      console.error('Error creating chat:', err);
      toast({
        title: 'Error',
        description: 'Failed to create chat',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentUserId, fetchChats, toast]);

  const createGroupChat = useCallback(async (
    groupName: string,
    memberIds: string[]
  ): Promise<string | null> => {
    if (!currentUserId) return null;

    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('create_group_chat', {
        p_group_name: groupName,
        p_member_ids: memberIds,
      });

      if (rpcError) throw rpcError;

      await fetchChats();
      return data;
    } catch (err) {
      console.error('Error creating group chat:', err);
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentUserId, fetchChats, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUserId) return;

    fetchChats();

    const channel = supabase
      .channel(`chats-updates:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchChats]);

  const clearError = useCallback(() => {
    setError(null);
    lastToastKeyRef.current = null;
  }, []);

  return {
    chats,
    loading,
    error,
    clearError,
    fetchChats,
    getOrCreateDirectChat,
    createGroupChat,
  };
}

