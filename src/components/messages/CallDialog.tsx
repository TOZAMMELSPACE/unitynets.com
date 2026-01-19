import { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { CallState } from '@/hooks/useWebRTC';

interface CallDialogProps {
  callState: CallState | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  formatDuration: (seconds: number) => string;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  otherUserName?: string;
  otherUserAvatar?: string;
}

export function CallDialog({
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  callDuration,
  formatDuration,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
  otherUserName,
  otherUserAvatar,
}: CallDialogProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Try to play audio (handles autoplay policy)
  const tryPlayAudio = useCallback(async () => {
    if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
      try {
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;
        await remoteAudioRef.current.play();
        setAudioBlocked(false);
        console.log('Audio playback started successfully');
      } catch (e) {
        console.log('Audio autoplay blocked, will try on user interaction');
        setAudioBlocked(true);
      }
    }
  }, []);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('Setting local video stream');
      localVideoRef.current.srcObject = localStream;
      // Local video is muted to prevent echo - this is correct
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(e => console.log('Local video play error:', e));
    }
  }, [localStream]);

  // Set remote video/audio stream - CRITICAL: audio must NOT be muted
  useEffect(() => {
    if (remoteStream) {
      console.log('Remote stream received with tracks:', remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      const videoTracks = remoteStream.getVideoTracks();
      const audioTracks = remoteStream.getAudioTracks();
      
      setHasRemoteVideo(videoTracks.length > 0 && videoTracks[0].enabled);
      
      // Set video element - IMPORTANT: do NOT mute remote video
      if (remoteVideoRef.current) {
        console.log('Setting remote video stream');
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = false; // Ensure remote video is NOT muted
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.play().catch(e => {
          console.log('Remote video play error:', e);
        });
      }
      
      // Set separate audio element for reliable audio playback - THIS IS CRITICAL FOR HEARING THE OTHER PERSON
      if (remoteAudioRef.current && audioTracks.length > 0) {
        console.log('Setting remote audio stream, tracks:', audioTracks.map(t => `enabled: ${t.enabled}, readyState: ${t.readyState}`));
        remoteAudioRef.current.srcObject = remoteStream;
        tryPlayAudio();
      }
    }
  }, [remoteStream, tryPlayAudio]);

  // Track remote video availability
  useEffect(() => {
    if (!remoteStream) return;
    
    const videoTrack = remoteStream.getVideoTracks()[0];
    if (videoTrack) {
      const handleMute = () => setHasRemoteVideo(false);
      const handleUnmute = () => setHasRemoteVideo(true);
      
      videoTrack.addEventListener('mute', handleMute);
      videoTrack.addEventListener('unmute', handleUnmute);
      
      return () => {
        videoTrack.removeEventListener('mute', handleMute);
        videoTrack.removeEventListener('unmute', handleUnmute);
      };
    }
  }, [remoteStream]);

  if (!callState) return null;

  const isVideoCall = callState.callType === 'video';
  const isConnected = callState.status === 'connected';
  const isRinging = callState.status === 'ringing';
  const isCalling = callState.status === 'calling';

  const displayName = callState.isIncoming
    ? callState.callerName || 'অজানা'
    : otherUserName || 'ব্যবহারকারী';

  const displayAvatar = callState.isIncoming
    ? callState.callerAvatar
    : otherUserAvatar;

  return (
    <Dialog open={!!callState} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="relative h-[500px] flex flex-col">
          {/* Audio element for remote audio - MUST NOT be muted */}
          <audio 
            ref={remoteAudioRef} 
            autoPlay 
            playsInline 
            className="hidden"
            // Do NOT add muted attribute here - remote audio must be heard
          />

          {/* Video area */}
          {isVideoCall && isConnected && hasRemoteVideo ? (
            <>
              {/* Remote video (full screen) - NOT muted for audio */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                // IMPORTANT: Do NOT add muted here - we need to hear the remote user
                className="absolute inset-0 w-full h-full object-cover bg-zinc-900"
              />

              {/* Local video (picture-in-picture) - muted to prevent echo */}
              <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden bg-zinc-800 shadow-lg border border-zinc-700 z-10">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted // Local video MUST be muted to prevent echo
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                    <VideoOff className="w-8 h-8 text-zinc-500" />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Voice call or connecting state */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {/* Hidden video refs for voice calls to still receive streams - remote NOT muted */}
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
              
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary/30">
                  <AvatarImage src={displayAvatar || undefined} />
                  <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Pulsing ring for calling/ringing */}
                {(isCalling || isRinging) && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse" />
                  </>
                )}
                
                {/* Connected indicator */}
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-white">
                {displayName}
              </h2>

              <p className="mt-2 text-zinc-400">
                {isRinging && callState.isIncoming && 'ইনকামিং কল...'}
                {isCalling && 'কল করা হচ্ছে...'}
                {isConnected && (
                  <span className="text-green-400 font-mono text-lg">
                    {formatDuration(callDuration)}
                  </span>
                )}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {isVideoCall ? 'ভিডিও কল' : 'ভয়েস কল'}
              </p>
            </div>
          )}

          {/* Call controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {isRinging && callState.isIncoming ? (
              /* Incoming call controls */
              <div className="flex items-center justify-center gap-8">
                <Button
                  size="lg"
                  variant="destructive"
                  className="w-16 h-16 rounded-full"
                  onClick={onReject}
                >
                  <PhoneOff className="w-7 h-7" />
                </Button>

                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
                  onClick={onAccept}
                >
                  {isVideoCall ? (
                    <Video className="w-7 h-7" />
                  ) : (
                    <Phone className="w-7 h-7" />
                  )}
                </Button>
              </div>
            ) : (
              /* Active call controls */
              <div className="flex items-center justify-center gap-4">
                {/* Audio blocked indicator - tap to enable */}
                {audioBlocked && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-14 h-14 rounded-full bg-yellow-500/20 border-yellow-500 animate-pulse"
                    onClick={tryPlayAudio}
                    title="অডিও চালু করতে ক্লিক করুন"
                  >
                    <Volume2 className="w-6 h-6 text-yellow-500" />
                  </Button>
                )}

                <Button
                  size="lg"
                  variant={isMuted ? 'destructive' : 'secondary'}
                  className="w-14 h-14 rounded-full"
                  onClick={onToggleMute}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </Button>

                {isVideoCall && (
                  <Button
                    size="lg"
                    variant={isVideoOff ? 'destructive' : 'secondary'}
                    className="w-14 h-14 rounded-full"
                    onClick={onToggleVideo}
                  >
                    {isVideoOff ? (
                      <VideoOff className="w-6 h-6" />
                    ) : (
                      <Video className="w-6 h-6" />
                    )}
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="destructive"
                  className="w-14 h-14 rounded-full"
                  onClick={onEnd}
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
