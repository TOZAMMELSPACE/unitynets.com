import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePresence(currentUserId: string | null) {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!currentUserId) return;

    try {
      await supabase
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        } as any)
        .eq('user_id', currentUserId);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    // Set online when component mounts
    updatePresence(true);

    // Heartbeat to keep presence alive
    heartbeatIntervalRef.current = setInterval(() => {
      updatePresence(true);
    }, 30000); // Every 30 seconds

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(true);
      } else {
        updatePresence(false);
      }
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Set offline when component unmounts
      updatePresence(false);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUserId, updatePresence]);

  return { updatePresence };
}
