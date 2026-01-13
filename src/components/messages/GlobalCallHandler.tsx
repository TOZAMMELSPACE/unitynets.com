import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebRTC, CallState } from '@/hooks/useWebRTC';
import { CallDialog } from '@/components/messages/CallDialog';
import { IncomingCallToast } from '@/components/messages/IncomingCallToast';

interface GlobalCallHandlerProps {
  currentUserId: string | null;
}

export function GlobalCallHandler({ currentUserId }: GlobalCallHandlerProps) {
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
  } = useWebRTC({ currentUserId });

  // Only show if there's an incoming call and user is not in a chat window
  // (ChatWindow has its own CallDialog)
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

  // Show full dialog for active calls
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
      />
    );
  }

  return null;
}
