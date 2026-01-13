import { useEffect, useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface CallHistoryItem {
  id: string;
  chat_id: string;
  caller_id: string;
  receiver_id: string;
  call_type: 'voice' | 'video';
  status: 'completed' | 'missed' | 'rejected' | 'no_answer';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  created_at: string;
  caller_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
  receiver_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface CallHistoryProps {
  chatId: string;
  currentUserId: string;
}

export function CallHistory({ chatId, currentUserId }: CallHistoryProps) {
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const { data, error } = await (supabase
          .from('call_history' as any)
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(50) as any);

        if (error) throw error;

        // Fetch profiles for each call
        const enrichedCalls = await Promise.all(
          (data || []).map(async (call: any) => {
            const [callerRes, receiverRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('user_id', call.caller_id)
                .single(),
              supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('user_id', call.receiver_id)
                .single(),
            ]);

            return {
              ...call,
              caller_profile: callerRes.data,
              receiver_profile: receiverRes.data,
            };
          })
        );

        setCalls(enrichedCalls);
      } catch (error) {
        console.error('Error fetching call history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();

    // Subscribe to new calls
    const channel = supabase
      .channel(`call-history:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_history',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchCallHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} সেকেন্ড`;
    return `${mins} মিনিট ${secs} সেকেন্ড`;
  };

  const getCallIcon = (call: CallHistoryItem) => {
    const isOutgoing = call.caller_id === currentUserId;
    const isMissed = call.status === 'missed' || call.status === 'no_answer';
    const isRejected = call.status === 'rejected';

    if (isMissed || isRejected) {
      return <PhoneMissed className="w-4 h-4 text-destructive" />;
    }

    if (isOutgoing) {
      return <PhoneOutgoing className="w-4 h-4 text-primary" />;
    }

    return <PhoneIncoming className="w-4 h-4 text-success" />;
  };

  const getCallLabel = (call: CallHistoryItem) => {
    const isOutgoing = call.caller_id === currentUserId;

    switch (call.status) {
      case 'completed':
        return isOutgoing ? 'আউটগোয়িং কল' : 'ইনকামিং কল';
      case 'missed':
        return isOutgoing ? 'কল করা হয়েছে' : 'মিসড কল';
      case 'no_answer':
        return isOutgoing ? 'উত্তর দেয়নি' : 'মিসড কল';
      case 'rejected':
        return isOutgoing ? 'কল প্রত্যাখ্যান' : 'কল প্রত্যাখ্যান করা হয়েছে';
      default:
        return 'কল';
    }
  };

  const getOtherUser = (call: CallHistoryItem) => {
    const isOutgoing = call.caller_id === currentUserId;
    return isOutgoing ? call.receiver_profile : call.caller_profile;
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground text-bengali">
        কল হিস্ট্রি লোড হচ্ছে...
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-bengali">কোনো কল হিস্ট্রি নেই</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y divide-border">
        {calls.map((call) => {
          const otherUser = getOtherUser(call);
          const isMissed = call.status === 'missed' || call.status === 'no_answer' || call.status === 'rejected';

          return (
            <div
              key={call.id}
              className={`flex items-center gap-3 p-3 ${isMissed ? 'bg-destructive/5' : ''}`}
            >
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {otherUser?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              {/* Call info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getCallIcon(call)}
                  <span className={`font-medium text-bengali ${isMissed ? 'text-destructive' : ''}`}>
                    {getCallLabel(call)}
                  </span>
                  {call.call_type === 'video' && (
                    <Video className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: bn })}
                  </span>
                  {call.duration_seconds > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-bengali">{formatDuration(call.duration_seconds)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
