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
  startedAt?: Date;
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

// Call timeout in milliseconds (30 seconds)
const CALL_TIMEOUT_MS = 30000;

export function useWebRTC({ currentUserId, onCallEnded }: UseWebRTCProps) {
  const [callState, setCallState] = useState<CallState | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const callStartTimeRef = useRef<Date | null>(null);
  const { toast } = useToast();

  // Send push notification for incoming call
  const sendCallPushNotification = useCallback(async (
    receiverId: string,
    callerName: string,
    callType: 'voice' | 'video'
  ) => {
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'ইনকামিং কল',
          body: `${callerName} ${callType === 'video' ? 'ভিডিও' : 'ভয়েস'} কল করছে`,
          url: '/messages',
          targetUserId: receiverId,
          type: 'incoming_call',
        },
      });
    } catch (error) {
      console.error('Error sending call push notification:', error);
    }
  }, []);

  // Save call to history
  const saveCallHistory = useCallback(async (
    chatId: string,
    callerId: string,
    receiverId: string,
    callType: 'voice' | 'video',
    status: 'completed' | 'missed' | 'rejected' | 'no_answer',
    startedAt?: Date,
    endedAt?: Date
  ) => {
    try {
      const durationSeconds = startedAt && endedAt 
        ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
        : 0;

      await (supabase
        .from('call_history' as any)
        .insert({
          chat_id: chatId,
          caller_id: callerId,
          receiver_id: receiverId,
          call_type: callType,
          status,
          started_at: startedAt?.toISOString(),
          ended_at: endedAt?.toISOString(),
          duration_seconds: durationSeconds,
        }) as any);

      console.log('Call history saved:', { status, durationSeconds });
    } catch (error) {
      console.error('Error saving call history:', error);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
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
    callStartTimeRef.current = null;
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
        // Clear timeout since call connected
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
        }
        // Record start time
        callStartTimeRef.current = new Date();
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
      // Get caller's profile for push notification
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', currentUserId)
        .single();

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

      // Send push notification to receiver
      sendCallPushNotification(receiverId, callerProfile?.full_name || 'কেউ', callType);

      // Set call timeout (30 seconds)
      callTimeoutRef.current = setTimeout(async () => {
        // If still calling after timeout, mark as no_answer
        if (callState?.status === 'calling' || callState?.status === 'ringing') {
          toast({
            title: 'কল গ্রহণ করা হয়নি',
            description: 'ব্যবহারকারী অফলাইন বা ব্যস্ত',
          });

          // Save as no_answer
          await saveCallHistory(chatId, currentUserId, receiverId, callType, 'no_answer');

          // Update signal status
          await (supabase
            .from('call_signals' as any)
            .update({
              status: 'no_answer',
              ended_at: new Date().toISOString(),
            })
            .eq('id', callId) as any);

          cleanup();
          setCallState(null);
          onCallEnded?.();
        }
      }, CALL_TIMEOUT_MS);

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
  }, [currentUserId, createPeerConnection, cleanup, toast, sendCallPushNotification, saveCallHistory, onCallEnded, callState?.status]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!callState?.id || !currentUserId) return;

    // Clear timeout since call is being accepted
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

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

        setCallState(prev => prev ? { ...prev, status: 'connected', startedAt: new Date() } : null);
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
    const currentCallState = callState;

    if (currentCallState?.id) {
      await (supabase
        .from('call_signals' as any)
        .update({
          status,
          ended_at: new Date().toISOString(),
        })
        .eq('id', currentCallState.id) as any);

      // Save to call history
      const historyStatus = status === 'ended' ? 'completed' : status === 'rejected' ? 'rejected' : 'missed';
      await saveCallHistory(
        currentCallState.chatId,
        currentCallState.callerId,
        currentCallState.receiverId,
        currentCallState.callType,
        historyStatus,
        callStartTimeRef.current || undefined,
        new Date()
      );
    }

    cleanup();
    setCallState(null);
    onCallEnded?.();
  }, [callState, cleanup, onCallEnded, saveCallHistory]);

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
            if (signal.status === 'ended' || signal.status === 'rejected' || signal.status === 'missed' || signal.status === 'no_answer') {
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
            // Clear timeout
            if (callTimeoutRef.current) {
              clearTimeout(callTimeoutRef.current);
              callTimeoutRef.current = null;
            }

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

              setCallState(prev => prev ? { ...prev, status: 'connected', startedAt: new Date() } : null);
            }
          } else if (signal.status === 'rejected' || signal.status === 'ended' || signal.status === 'missed' || signal.status === 'no_answer') {
            cleanup();
            setCallState(null);

            const message = signal.status === 'rejected' 
              ? 'কল প্রত্যাখ্যান করা হয়েছে' 
              : signal.status === 'no_answer'
              ? 'কল গ্রহণ করা হয়নি'
              : 'কল শেষ হয়েছে';

            toast({ title: message });
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
