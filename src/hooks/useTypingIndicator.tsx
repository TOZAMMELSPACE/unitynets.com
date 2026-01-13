import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

export function useTypingIndicator(chatId: string | null, currentUserId: string | null) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!chatId || !currentUserId) return;
    
    // Prevent unnecessary updates
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;

    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            chat_id: chatId,
            user_id: currentUserId,
            is_typing: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'chat_id,user_id',
          });

        // Auto-stop typing after 5 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 5000);
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('chat_id', chatId)
          .eq('user_id', currentUserId);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [chatId, currentUserId]);

  const handleTyping = useCallback(() => {
    setTyping(true);
    
    // Reset timeout on each keystroke
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  }, [setTyping]);

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    // Fetch current typing users
    const fetchTypingUsers = async () => {
      const { data: typingData } = await supabase
        .from('typing_indicators')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', currentUserId);

      if (typingData && typingData.length > 0) {
        const userIds = typingData.map(t => t.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        setTypingUsers(profiles || []);
      } else {
        setTypingUsers([]);
      }
    };

    fetchTypingUsers();

    // Subscribe to typing changes
    const channel = supabase
      .channel(`typing-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedUserId = (payload.old as { user_id: string }).user_id;
            setTypingUsers(prev => prev.filter(u => u.user_id !== deletedUserId));
          } else {
            const typingUserId = (payload.new as { user_id: string }).user_id;
            if (typingUserId === currentUserId) return;

            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, full_name, avatar_url')
              .eq('user_id', typingUserId)
              .single();

            if (profile) {
              setTypingUsers(prev => {
                if (prev.some(u => u.user_id === profile.user_id)) return prev;
                return [...prev, profile];
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      // Clean up typing status when leaving
      setTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId, setTyping]);

  return {
    typingUsers,
    handleTyping,
    stopTyping: () => setTyping(false),
  };
}
