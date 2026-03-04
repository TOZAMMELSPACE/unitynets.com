import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCall } from '@/contexts/CallContext';
import { CallDialog } from '@/components/messages/CallDialog';
import { IncomingCallToast } from '@/components/messages/IncomingCallToast';

interface GlobalCallHandlerProps {
  currentUserId: string | null;
}

export function GlobalCallHandler({ currentUserId }: GlobalCallHandlerProps) {
  const [otherUserInfo, setOtherUserInfo] = useState<{ name?: string; avatar?: string }>({});
  
  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    formatDuration,
    acceptCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  // Fetch other user info when call state changes
  useEffect(() => {
    const fetchOtherUserInfo = async () => {
      if (!callState || !currentUserId) return;

      const otherUserId = callState.isIncoming ? callState.callerId : callState.receiverId;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', otherUserId)
        .single();

      if (profile) {
        setOtherUserInfo({
          name: profile.full_name,
          avatar: profile.avatar_url || undefined,
        });
      }
    };

    if (callState) {
      // Use caller info if available for incoming calls
      if (callState.isIncoming && callState.callerName) {
        setOtherUserInfo({
          name: callState.callerName,
          avatar: callState.callerAvatar,
        });
      } else {
        fetchOtherUserInfo();
      }
    } else {
      setOtherUserInfo({});
    }
  }, [callState, currentUserId]);

  // Don't render anything if no call state
  if (!callState) return null;

  // Show toast for incoming calls when not in active call
  if (callState.isIncoming && callState.status === 'ringing') {
    return (
      <IncomingCallToast
        callState={callState}
        onAccept={acceptCall}
        onReject={() => endCall('rejected')}
      />
    );
  }

  // Show full dialog for active calls (calling or connected)
  if (callState.status === 'calling' || callState.status === 'connected') {
    return (
      <CallDialog
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        callDuration={callDuration}
        formatDuration={formatDuration}
        onAccept={acceptCall}
        onReject={() => endCall('rejected')}
        onEnd={() => endCall('ended')}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        otherUserName={otherUserInfo.name}
        otherUserAvatar={otherUserInfo.avatar}
      />
    );
  }

  return null;
}
