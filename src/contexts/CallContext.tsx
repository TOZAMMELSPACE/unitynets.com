import { createContext, useContext, ReactNode } from 'react';
import { useWebRTC, CallState } from '@/hooks/useWebRTC';

interface CallContextType {
  callState: CallState | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  formatDuration: (seconds: number) => string;
  startCall: (chatId: string, receiverId: string, callType: 'voice' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: (status?: 'ended' | 'rejected' | 'missed') => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

interface CallProviderProps {
  children: ReactNode;
  currentUserId: string | null;
}

export function CallProvider({ children, currentUserId }: CallProviderProps) {
  const webRTC = useWebRTC({ currentUserId });

  return (
    <CallContext.Provider value={webRTC}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall(): CallContextType {
  const context = useContext(CallContext);
  if (!context) {
    // Return a no-op version if not within provider
    return {
      callState: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isVideoOff: false,
      callDuration: 0,
      formatDuration: (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`,
      startCall: async () => {},
      acceptCall: async () => {},
      endCall: async () => {},
      toggleMute: () => {},
      toggleVideo: () => {},
    };
  }
  return context;
}
