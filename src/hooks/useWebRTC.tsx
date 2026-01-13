import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CallState {
  id: string | null;
  chatId: string;
  callerId: string;
  receiverId: string;
  callType: 'voice' | 'video';
  status: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  isIncoming: boolean;
  callerName?: string;
  callerAvatar?: string;
}

interface UseWebRTCProps {
  currentUserId: string | null;
  onCallEnded?: () => void;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export function useWebRTC({ currentUserId, onCallEnded }: UseWebRTCProps) {
  const [callState, setCallState] = useState<CallState | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const { toast } = useToast();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    pendingCandidatesRef.current = [];
  }, [localStream]);

  // Initialize peer connection
  const createPeerConnection = useCallback(async (callId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionRef.current = pc;

    pc.onicecandidate = async (event) => {
      if (event.candidate && callId) {
        // Send ICE candidate to peer via database
        const { data: currentSignal } = await (supabase
          .from('call_signals' as any)
          .select('signal_data')
          .eq('id', callId)
          .single() as any);

        const signalData = (currentSignal?.signal_data as any) || {};
        const candidates = signalData.candidates || [];
        candidates.push(event.candidate.toJSON());

        await (supabase
          .from('call_signals' as any)
          .update({
            signal_data: { ...signalData, candidates },
          })
          .eq('id', callId) as any);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        // Start call timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    return pc;
  }, []);

  // Start a call
  const startCall = useCallback(async (
    chatId: string,
    receiverId: string,
    callType: 'voice' | 'video'
  ) => {
    if (!currentUserId) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
      setLocalStream(stream);

      // Create call signal in database
      const { data: callSignal, error } = await (supabase
        .from('call_signals' as any)
        .insert({
          chat_id: chatId,
          caller_id: currentUserId,
          receiver_id: receiverId,
          call_type: callType,
          status: 'ringing',
        })
        .select()
        .single() as any);

      if (error) throw error;

      const callId = callSignal.id;

      // Set call state
      setCallState({
        id: callId,
        chatId,
        callerId: currentUserId,
        receiverId,
        callType,
        status: 'calling',
        isIncoming: false,
      });

      // Create peer connection
      const pc = await createPeerConnection(callId);

      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and set offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Store offer in database
      await (supabase
        .from('call_signals' as any)
        .update({
          signal_data: { offer: offer },
        })
        .eq('id', callId) as any);

      toast({
        title: 'কল করা হচ্ছে...',
        description: callType === 'video' ? 'ভিডিও কল' : 'ভয়েস কল',
      });

    } catch (error) {
      console.error('Error starting call:', error);
      cleanup();
      toast({
        title: 'কল শুরু করা যায়নি',
        description: 'মাইক্রোফোন/ক্যামেরা অ্যাক্সেস দিন',
        variant: 'destructive',
      });
    }
  }, [currentUserId, createPeerConnection, cleanup, toast]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!callState?.id || !currentUserId) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.callType === 'video',
      });
      setLocalStream(stream);

      // Create peer connection
      const pc = await createPeerConnection(callState.id);

      // Add local tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Get offer from database
      const { data: signalData } = await (supabase
        .from('call_signals' as any)
        .select('signal_data')
        .eq('id', callState.id)
        .single() as any);

      if (signalData?.signal_data?.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData.signal_data.offer));

        // Add any pending ICE candidates
        if (signalData.signal_data.candidates) {
          for (const candidate of signalData.signal_data.candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn('Error adding ICE candidate:', e);
            }
          }
        }

        // Create and set answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Update database with answer and status
        await (supabase
          .from('call_signals' as any)
          .update({
            status: 'accepted',
            started_at: new Date().toISOString(),
            signal_data: {
              ...signalData.signal_data,
              answer: answer,
            },
          })
          .eq('id', callState.id) as any);

        setCallState(prev => prev ? { ...prev, status: 'connected' } : null);
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      cleanup();
      toast({
        title: 'কল গ্রহণ করা যায়নি',
        variant: 'destructive',
      });
    }
  }, [callState, currentUserId, createPeerConnection, cleanup, toast]);

  // Reject/End call
  const endCall = useCallback(async (status: 'ended' | 'rejected' | 'missed' = 'ended') => {
    if (callState?.id) {
      await (supabase
        .from('call_signals' as any)
        .update({
          status,
          ended_at: new Date().toISOString(),
        })
        .eq('id', callState.id) as any);
    }

    cleanup();
    setCallState(null);
    onCallEnded?.();
  }, [callState, cleanup, onCallEnded]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [localStream, isVideoOff]);

  // Listen for incoming calls and call updates
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`calls:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_signals',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const signal = payload.new as any;

          if (payload.eventType === 'INSERT' && signal.status === 'ringing') {
            // Incoming call
            const { data: callerProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', signal.caller_id)
              .single();

            setCallState({
              id: signal.id,
              chatId: signal.chat_id,
              callerId: signal.caller_id,
              receiverId: signal.receiver_id,
              callType: signal.call_type,
              status: 'ringing',
              isIncoming: true,
              callerName: callerProfile?.full_name,
              callerAvatar: callerProfile?.avatar_url,
            });

            toast({
              title: 'ইনকামিং কল',
              description: `${callerProfile?.full_name || 'কেউ'} ${signal.call_type === 'video' ? 'ভিডিও' : 'ভয়েস'} কল করছে`,
            });
          } else if (payload.eventType === 'UPDATE') {
            if (signal.status === 'ended' || signal.status === 'rejected' || signal.status === 'missed') {
              cleanup();
              setCallState(null);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_signals',
          filter: `caller_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const signal = payload.new as any;

          if (signal.status === 'accepted' && signal.signal_data?.answer) {
            // Answer received, set remote description
            const pc = peerConnectionRef.current;
            if (pc && pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.answer));

              // Add any ICE candidates
              if (signal.signal_data.candidates) {
                for (const candidate of signal.signal_data.candidates) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  } catch (e) {
                    console.warn('Error adding ICE candidate:', e);
                  }
                }
              }

              setCallState(prev => prev ? { ...prev, status: 'connected' } : null);
            }
          } else if (signal.status === 'rejected' || signal.status === 'ended' || signal.status === 'missed') {
            cleanup();
            setCallState(null);
            toast({
              title: signal.status === 'rejected' ? 'কল প্রত্যাখ্যান করা হয়েছে' : 'কল শেষ হয়েছে',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, cleanup, toast]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    formatDuration,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
