import { Phone, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CallState } from '@/hooks/useWebRTC';

interface IncomingCallToastProps {
  callState: CallState;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallToast({ callState, onAccept, onReject }: IncomingCallToastProps) {
  if (!callState.isIncoming || callState.status !== 'ringing') return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-14 h-14">
            <AvatarImage src={callState.callerAvatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {callState.callerName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            {callState.callType === 'video' ? (
              <Video className="w-3 h-3 text-white" />
            ) : (
              <Phone className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-bengali">
            {callState.callerName || 'অজানা'}
          </p>
          <p className="text-sm text-muted-foreground text-bengali">
            {callState.callType === 'video' ? 'ভিডিও কল' : 'ভয়েস কল'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={onReject}
        >
          <X className="w-4 h-4 mr-2" />
          <span className="text-bengali">প্রত্যাখ্যান</span>
        </Button>

        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={onAccept}
        >
          {callState.callType === 'video' ? (
            <Video className="w-4 h-4 mr-2" />
          ) : (
            <Phone className="w-4 h-4 mr-2" />
          )}
          <span className="text-bengali">গ্রহণ</span>
        </Button>
      </div>
    </div>
  );
}
