import { useState } from 'react';
import { Check, CheckCheck, MoreVertical, Reply, Forward, Trash2, Edit, Pin, Smile, Phone, PhoneMissed, Video, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChatMessage } from '@/hooks/useChat';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId: string;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onForward: (message: ChatMessage) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onForward,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'p', { locale: bn });
  };

  const renderContent = () => {
    if (message.is_deleted) {
      return (
        <span className="italic text-muted-foreground text-bengali">
          এই মেসেজটি মুছে ফেলা হয়েছে
        </span>
      );
    }

    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={message.content || (message.metadata as { url?: string })?.url}
              alt="Shared image"
              className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.content || (message.metadata as { url?: string })?.url, '_blank')}
            />
            {(message.metadata as { caption?: string })?.caption && (
              <p className="mt-2 text-sm text-bengali">{(message.metadata as { caption?: string }).caption}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="max-w-xs">
            <video
              src={message.content || (message.metadata as { url?: string })?.url}
              controls
              className="rounded-lg max-w-full"
            />
          </div>
        );

      case 'voice':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <audio
              src={message.content || (message.metadata as { url?: string })?.url}
              controls
              className="max-w-full"
            />
          </div>
        );

      case 'file':
        const metadata = message.metadata as { fileName?: string; fileSize?: number; url?: string };
        return (
          <a
            href={message.content || metadata?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              📎
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-bengali">
                {metadata?.fileName || 'ফাইল'}
              </p>
              {metadata?.fileSize && (
                <p className="text-xs text-muted-foreground">
                  {(metadata.fileSize / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </a>
        );

      case 'call_started':
      case 'call_ended':
        return (
          <div className="flex items-center gap-2 text-bengali">
            <span>📞</span>
            <span>{message.type === 'call_started' ? 'কল শুরু হয়েছে' : 'কল শেষ হয়েছে'}</span>
          </div>
        );

      case 'missed_call': {
        const callMeta = message.metadata as { callType?: string; callerId?: string; duration?: number };
        const isMissedByMe = callMeta?.callerId !== currentUserId;
        return (
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isMissedByMe ? 'bg-destructive/10' : 'bg-muted/50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMissedByMe ? 'bg-destructive/20' : 'bg-muted'}`}>
              <PhoneMissed className={`w-5 h-5 ${isMissedByMe ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium text-bengali ${isMissedByMe ? 'text-destructive' : ''}`}>
                {isMissedByMe ? 'মিসড কল' : 'কল গ্রহণ করা হয়নি'}
              </p>
              <p className="text-xs text-muted-foreground text-bengali">
                {callMeta?.callType === 'video' ? 'ভিডিও কল' : 'ভয়েস কল'}
              </p>
            </div>
          </div>
        );
      }

      case 'call_summary': {
        const summaryMeta = message.metadata as { callType?: string; duration?: number; status?: string };
        const durationSecs = summaryMeta?.duration || 0;
        const mins = Math.floor(durationSecs / 60);
        const secs = durationSecs % 60;
        const durationText = mins > 0 ? `${mins} মিনিট ${secs} সেকেন্ড` : `${secs} সেকেন্ড`;
        
        return (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-success/10">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              {summaryMeta?.callType === 'video' ? (
                <Video className="w-5 h-5 text-success" />
              ) : (
                <Phone className="w-5 h-5 text-success" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-success text-bengali">কল সম্পন্ন</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-bengali">{durationText}</span>
              </div>
            </div>
          </div>
        );
      }

      case 'system':
        return (
          <span className="text-muted-foreground text-bengali">{message.content}</span>
        );

      default:
        return <span className="whitespace-pre-wrap text-bengali">{message.content}</span>;
    }
  };

  const renderReactions = () => {
    const reactions = message.reactions || {};
    const reactionEntries = Object.entries(reactions).filter(([_, users]) => users.length > 0);
    
    if (reactionEntries.length === 0) return null;

    return (
      <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {reactionEntries.map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => onReact(message.id, emoji)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
              users.includes(currentUserId)
                ? 'bg-primary/20 border border-primary/30'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderReadStatus = () => {
    if (!isOwn) return null;
    
    const readBy = message.read_by || [];
    const isRead = readBy.length > 1;
    
    return isRead ? (
      <CheckCheck className="w-3.5 h-3.5 text-primary" />
    ) : (
      <Check className="w-3.5 h-3.5 text-muted-foreground" />
    );
  };

  // System messages and call messages are centered
  if (message.type === 'system' || message.type === 'missed_call' || message.type === 'call_summary' || message.type === 'call_started' || message.type === 'call_ended') {
    return (
      <div className="flex justify-center py-2">
        <div className={`px-4 py-2 rounded-xl text-sm ${
          message.type === 'system' 
            ? 'bg-muted/50 rounded-full text-muted-foreground' 
            : ''
        }`}>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && showAvatar ? (
        <Avatar className="w-8 h-8 mt-auto">
          <AvatarImage src={message.sender?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {message.sender?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      ) : !isOwn ? (
        <div className="w-8" />
      ) : null}

      {/* Message container */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Reply preview */}
        {message.reply_to && !message.reply_to.is_deleted && (
          <div
            className={`text-xs px-3 py-1.5 mb-1 rounded-lg border-l-2 ${
              isOwn ? 'bg-primary/5 border-primary' : 'bg-muted/50 border-muted-foreground'
            }`}
          >
            <p className="font-medium text-bengali">{message.reply_to.sender?.full_name}</p>
            <p className="text-muted-foreground truncate text-bengali">
              {message.reply_to.content?.slice(0, 50)}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isOwn
              ? 'wa-bubble-out rounded-br-md'
              : 'wa-bubble-in rounded-bl-md'
          }`}
        >
          {/* Sender name for group chats */}
          {!isOwn && showAvatar && message.sender && (
            <p className="text-xs font-medium mb-1 text-primary text-bengali">
              {message.sender.full_name}
              {message.sender.trust_score && message.sender.trust_score > 0 && (
                <span className="ml-2 opacity-70">⭐ {message.sender.trust_score}</span>
              )}
            </p>
          )}

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className={`flex items-center gap-1.5 mt-1 text-xs text-muted-foreground ${
            isOwn ? 'justify-end' : ''
          }`}>
            {message.is_edited && (
              <span className="text-bengali">সম্পাদিত</span>
            )}
            {message.is_forwarded && (
              <span className="text-bengali">ফরওয়ার্ড</span>
            )}
            <span>{formatTime(message.created_at)}</span>
            {renderReadStatus()}
          </div>
        </div>

        {/* Reactions */}
        {renderReactions()}

        {/* Action buttons */}
        {showActions && !message.is_deleted && (
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/* Quick reactions */}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="w-7 h-7">
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top">
                <div className="flex gap-1">
                  {QUICK_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onReact(message.id, emoji)}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => onReply(message)}>
              <Reply className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="w-7 h-7">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={() => onForward(message)}>
                  <Forward className="w-4 h-4 mr-2" />
                  <span className="text-bengali">ফরওয়ার্ড</span>
                </DropdownMenuItem>
                {isOwn && message.type === 'text' && (
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    <Edit className="w-4 h-4 mr-2" />
                    <span className="text-bengali">সম্পাদনা</span>
                  </DropdownMenuItem>
                )}
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span className="text-bengali">মুছে ফেলুন</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
