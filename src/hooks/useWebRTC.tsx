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

// ICE servers with STUN and free TURN servers for better connectivity
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // OpenRelay TURN servers (free tier)
  { 
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  { 
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  { 
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
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
  const iceCandidatesQueueRef = useRef<RTCIceCandidate[]>([]);
  const callStartTimeRef = useRef<Date | null>(null);
  const callIdRef = useRef<string | null>(null);
  const isCallConnectedRef = useRef(false);
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

  // Save call to history and add message to chat
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

      // Save to call_history table
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

      // Add message to chat based on call status
      if (status === 'completed' && durationSeconds > 0) {
        // Completed call - show call summary
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            sender_id: callerId,
            type: 'call_summary',
            content: `কল সম্পন্ন - ${durationSeconds} সেকেন্ড`,
            metadata: {
              callType,
              duration: durationSeconds,
              status: 'completed',
            },
          });
        console.log('Call summary message added to chat');
      } else if (status === 'missed' || status === 'no_answer' || status === 'rejected') {
        // Missed/rejected call - show missed call message
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            sender_id: callerId,
            type: 'missed_call',
            content: status === 'rejected' ? 'কল প্রত্যাখ্যান করা হয়েছে' : 'মিসড কল',
            metadata: {
              callType,
              callerId,
              receiverId,
              status,
            },
          });
        console.log('Missed call message added to chat');

        // Send push notification for missed call
        try {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              title: 'মিসড কল',
              body: `আপনি একটি ${callType === 'video' ? 'ভিডিও' : 'ভয়েস'} কল মিস করেছেন`,
              url: '/messages',
              targetUserId: receiverId,
              type: 'missed_call',
            },
          });
          console.log('Missed call push notification sent');
        } catch (pushError) {
          console.error('Error sending missed call push notification:', pushError);
        }
      }
    } catch (error) {
      console.error('Error saving call history:', error);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up WebRTC...');
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
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
    iceCandidatesQueueRef.current = [];
    callStartTimeRef.current = null;
    callIdRef.current = null;
    isCallConnectedRef.current = false;
  }, [localStream]);

  // Send ICE candidate to peer - store in appropriate field based on role
  const sendIceCandidate = useCallback(async (candidate: RTCIceCandidate, callId: string) => {
    try {
      const { data: currentSignal } = await (supabase
        .from('call_signals' as any)
        .select('signal_data, caller_id')
        .eq('id', callId)
        .single() as any);

      const signalData = (currentSignal?.signal_data as any) || {};
      
      // Determine if this user is caller or receiver
      const isCaller = currentSignal?.caller_id === currentUserId;
      
      if (isCaller) {
        // Caller stores in 'candidates'
        const candidates = signalData.candidates || [];
        candidates.push(candidate.toJSON());
        
        await (supabase
          .from('call_signals' as any)
          .update({
            signal_data: { ...signalData, candidates },
            updated_at: new Date().toISOString(),
          })
          .eq('id', callId) as any);
      } else {
        // Receiver stores in 'receiverCandidates'
        const receiverCandidates = signalData.receiverCandidates || [];
        receiverCandidates.push(candidate.toJSON());
        
        await (supabase
          .from('call_signals' as any)
          .update({
            signal_data: { ...signalData, receiverCandidates },
            updated_at: new Date().toISOString(),
          })
          .eq('id', callId) as any);
      }

      console.log('ICE candidate sent (as', isCaller ? 'caller' : 'receiver', '):', candidate.candidate?.substring(0, 50));
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
    }
  }, [currentUserId]);

  // Start call duration timer
  const startCallTimer = useCallback(() => {
    if (callTimerRef.current) return; // Already running
    
    callStartTimeRef.current = new Date();
    isCallConnectedRef.current = true;
    
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    console.log('Call timer started');
  }, []);

  // Initialize peer connection with improved settings
  const createPeerConnection = useCallback((callId: string) => {
    console.log('Creating peer connection for call:', callId);
    
    const pc = new RTCPeerConnection({ 
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all', // Use both STUN and TURN
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });
    
    peerConnectionRef.current = pc;
    callIdRef.current = callId;

    // ICE candidate event
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate.candidate?.substring(0, 50));
        sendIceCandidate(event.candidate, callId);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };

    // Track event - when remote stream is received
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, 'enabled:', event.track.enabled, 'streams:', event.streams.length);
      
      // Track ready state monitoring
      event.track.onunmute = () => {
        console.log('Remote track unmuted:', event.track.kind);
      };
      
      event.track.onmute = () => {
        console.log('Remote track muted:', event.track.kind);
      };
      
      event.track.onended = () => {
        console.log('Remote track ended:', event.track.kind);
      };

      // Always create a new MediaStream with all current tracks
      setRemoteStream(prevStream => {
        const newStream = new MediaStream();
        
        // Add existing tracks from previous stream
        if (prevStream) {
          prevStream.getTracks().forEach(t => {
            if (t.id !== event.track.id) {
              newStream.addTrack(t);
            }
          });
        }
        
        // Add the new track
        newStream.addTrack(event.track);
        
        console.log('Updated remote stream with tracks:', newStream.getTracks().map(t => `${t.kind}: ${t.readyState}`));
        return newStream;
      });
    };
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        // Clear timeout since call connected
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
        }
        
        if (!isCallConnectedRef.current) {
          startCallTimer();
          setCallState(prev => prev ? { ...prev, status: 'connected', startedAt: new Date() } : null);
        }
      } else if (pc.iceConnectionState === 'disconnected') {
        console.log('ICE disconnected, attempting to reconnect...');
        // Don't end immediately, might reconnect
      } else if (pc.iceConnectionState === 'failed') {
        console.log('ICE connection failed');
        toast({
          title: 'কল সংযোগ ব্যর্থ',
          description: 'নেটওয়ার্ক সমস্যা হতে পারে',
          variant: 'destructive',
        });
        endCall();
      }
    };

    // Connection state change
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        if (!isCallConnectedRef.current) {
          startCallTimer();
        }
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (isCallConnectedRef.current) {
          endCall();
        }
      }
    };

    return pc;
  }, [sendIceCandidate, startCallTimer, toast]);

  // End call function - defined early to avoid circular dependency
  const endCall = useCallback(async (status: 'ended' | 'rejected' | 'missed' = 'ended') => {
    const currentCallState = callState;
    const currentCallId = callIdRef.current || currentCallState?.id;

    console.log('Ending call:', currentCallId, 'status:', status);

    if (currentCallId) {
      await (supabase
        .from('call_signals' as any)
        .update({
          status,
          ended_at: new Date().toISOString(),
        })
        .eq('id', currentCallId) as any);

      // Save to call history
      if (currentCallState) {
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
    }

    cleanup();
    setCallState(null);
    onCallEnded?.();
  }, [callState, cleanup, onCallEnded, saveCallHistory]);

  // Start a call
  const startCall = useCallback(async (
    chatId: string,
    receiverId: string,
    callType: 'voice' | 'video'
  ) => {
    if (!currentUserId) return;

    try {
      console.log('Starting call:', { chatId, receiverId, callType });
      
      // Get caller's profile for push notification
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', currentUserId)
        .single();

      // Get user media with specific constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      console.log('Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
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
      console.log('Call signal created:', callId);

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
      const pc = createPeerConnection(callId);

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind);
        pc.addTrack(track, stream);
      });

      // Create and set offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      
      console.log('Created offer:', offer.type);
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete or timeout
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
          // Timeout after 2 seconds
          setTimeout(resolve, 2000);
        }
      });

      // Store offer in database (with gathered ICE candidates in SDP)
      const finalOffer = pc.localDescription;
      await (supabase
        .from('call_signals' as any)
        .update({
          signal_data: { offer: finalOffer },
        })
        .eq('id', callId) as any);

      console.log('Offer stored in database');

      // Send push notification to receiver
      sendCallPushNotification(receiverId, callerProfile?.full_name || 'কেউ', callType);

      // Set call timeout (30 seconds)
      callTimeoutRef.current = setTimeout(async () => {
        const currentStatus = peerConnectionRef.current?.connectionState;
        console.log('Call timeout reached, current status:', currentStatus);
        
        if (!isCallConnectedRef.current) {
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
  }, [currentUserId, createPeerConnection, cleanup, toast, sendCallPushNotification, saveCallHistory, onCallEnded]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!callState?.id || !currentUserId) return;

    console.log('Accepting call:', callState.id);

    // Clear timeout since call is being accepted
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    try {
      // Get user media with specific constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: callState.callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      console.log('Requesting media for answer:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      setLocalStream(stream);

      // Create peer connection
      const pc = createPeerConnection(callState.id);

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind);
        pc.addTrack(track, stream);
      });

      // Get offer from database
      const { data: signalData } = await (supabase
        .from('call_signals' as any)
        .select('signal_data')
        .eq('id', callState.id)
        .single() as any);

      console.log('Got signal data:', signalData?.signal_data ? 'yes' : 'no');

      if (signalData?.signal_data?.offer) {
        // Set remote description (offer)
        console.log('Setting remote description (offer)');
        await pc.setRemoteDescription(new RTCSessionDescription(signalData.signal_data.offer));

        // Add any pending ICE candidates from caller
        if (signalData.signal_data.candidates) {
          console.log('Adding', signalData.signal_data.candidates.length, 'ICE candidates from caller');
          for (const candidate of signalData.signal_data.candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn('Error adding ICE candidate:', e);
            }
          }
        }

        // Create answer
        const answer = await pc.createAnswer();
        console.log('Created answer:', answer.type);
        await pc.setLocalDescription(answer);

        // Wait for ICE gathering
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') {
            resolve();
          } else {
            const checkState = () => {
              if (pc.iceGatheringState === 'complete') {
                pc.removeEventListener('icegatheringstatechange', checkState);
                resolve();
              }
            };
            pc.addEventListener('icegatheringstatechange', checkState);
            setTimeout(resolve, 2000);
          }
        });

        // Wait for ICE gathering to get some candidates
        await new Promise<void>((resolve) => {
          const checkCandidates = () => {
            // Wait until we have at least one candidate or timeout
            setTimeout(resolve, 1500);
          };
          checkCandidates();
        });

        // Update database with answer, status, and receiver's ICE candidates
        const finalAnswer = pc.localDescription;
        
        // Collect receiver's ICE candidates
        const receiverCandidates: RTCIceCandidateInit[] = [];
        
        // Re-fetch signal data to get latest state
        const { data: latestSignalData } = await (supabase
          .from('call_signals' as any)
          .select('signal_data')
          .eq('id', callState.id)
          .single() as any);

        await (supabase
          .from('call_signals' as any)
          .update({
            status: 'accepted',
            started_at: new Date().toISOString(),
            signal_data: {
              ...latestSignalData?.signal_data,
              answer: finalAnswer,
              receiverCandidates: iceCandidatesQueueRef.current.map(c => 
                typeof c.toJSON === 'function' ? c.toJSON() : c
              ),
            },
          })
          .eq('id', callState.id) as any);

        console.log('Answer stored in database with receiver candidates');
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

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
        console.log('Audio track enabled:', track.enabled);
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
        console.log('Video track enabled:', track.enabled);
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [localStream, isVideoOff]);

  // Listen for incoming calls and call updates
  useEffect(() => {
    if (!currentUserId) return;

    console.log('Setting up call signal listeners for user:', currentUserId);

    // Channel for receiving calls (as receiver)
    const receiverChannel = supabase
      .channel(`calls-receiver:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
        },
        async (payload) => {
          const signal = payload.new as any;
          
          // Only process if this user is the receiver
          if (signal.receiver_id !== currentUserId) return;
          
          console.log('Received incoming call signal:', signal.id, signal.status);

          if (signal.status === 'ringing') {
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
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_signals',
        },
        async (payload) => {
          const signal = payload.new as any;
          
          // Handle updates for receiver
          if (signal.receiver_id === currentUserId) {
            console.log('Received signal update (as receiver):', signal.status);
            if (signal.status === 'ended' || signal.status === 'rejected' || signal.status === 'missed' || signal.status === 'no_answer') {
              cleanup();
              setCallState(null);
            }
          }
          
          // Handle updates for caller
          if (signal.caller_id === currentUserId) {
            console.log('Received signal update (as caller):', signal.status);

            if (signal.status === 'accepted' && signal.signal_data?.answer) {
              console.log('Call accepted, setting remote description');
              
              // Clear timeout
              if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
              }

              // Set remote description (answer)
              const pc = peerConnectionRef.current;
              if (pc && pc.signalingState === 'have-local-offer') {
                try {
                  await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data.answer));
                  console.log('Remote description set successfully');

                  // Add any ICE candidates from receiver
                  if (signal.signal_data.receiverCandidates) {
                    console.log('Adding receiver ICE candidates:', signal.signal_data.receiverCandidates.length);
                    for (const candidate of signal.signal_data.receiverCandidates) {
                      try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                      } catch (e) {
                        console.warn('Error adding receiver ICE candidate:', e);
                      }
                    }
                  }

                  setCallState(prev => prev ? { ...prev, status: 'connected', startedAt: new Date() } : null);
                } catch (error) {
                  console.error('Error setting remote description:', error);
                }
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
        }
      )
      .subscribe((status) => {
        console.log('Call signal channel status:', status);
      });

    return () => {
      console.log('Removing call signal channel');
      supabase.removeChannel(receiverChannel);
    };
  }, [currentUserId, cleanup, toast]);

  // Poll for new ICE candidates periodically from the other party
  useEffect(() => {
    if (!callState?.id || !peerConnectionRef.current || !currentUserId) return;

    const pollCandidates = async () => {
      try {
        const { data: signalData } = await (supabase
          .from('call_signals' as any)
          .select('signal_data, caller_id')
          .eq('id', callState.id)
          .single() as any);

        const pc = peerConnectionRef.current;
        if (!pc || !pc.remoteDescription) return;

        // Determine which candidates to poll based on role
        const isCaller = signalData?.caller_id === currentUserId;
        
        // Caller reads receiver's candidates, receiver reads caller's candidates
        const candidatesToAdd = isCaller 
          ? (signalData?.signal_data?.receiverCandidates || [])
          : (signalData?.signal_data?.candidates || []);
        
        for (const candidate of candidatesToAdd) {
          const candidateStr = JSON.stringify(candidate);
          const alreadyAdded = iceCandidatesQueueRef.current.some(
            c => JSON.stringify(c) === candidateStr
          );
          
          if (!alreadyAdded) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              iceCandidatesQueueRef.current.push(candidate);
              console.log('Added polled ICE candidate from', isCaller ? 'receiver' : 'caller');
            } catch (e) {
              // Ignore duplicate candidates
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    };

    // Poll more frequently at the beginning
    const interval = setInterval(pollCandidates, 500);
    return () => clearInterval(interval);
  }, [callState?.id, currentUserId]);

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
