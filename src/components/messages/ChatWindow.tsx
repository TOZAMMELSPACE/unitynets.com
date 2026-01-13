import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Users, Pin, Bell, BellOff, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Chat, ChatMessage } from '@/hooks/useChat';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useWebRTC } from '@/hooks/useWebRTC';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { CallDialog } from './CallDialog';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface ChatWindowProps {
  chat: Chat;
  currentUserId: string;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
}

export function ChatWindow({
  chat,
  currentUserId,
  onBack,
  onViewProfile,
}: ChatWindowProps) {
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editMessage, setEditMessage] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    sendMessage,
    editMessage: saveEdit,
    deleteMessage,
    addReaction,
  } = useChatMessages(chat.id, currentUserId);

  const { typingUsers, handleTyping, stopTyping } = useTypingIndicator(chat.id, currentUserId);

  // WebRTC for voice/video calls
  const {
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
  } = useWebRTC({ currentUserId });

  // Get other user ID for direct chats
  const getOtherUserId = () => {
    if (chat.type === 'direct' && chat.other_user) {
      return chat.other_user.user_id;
    }
    return null;
  };

  // Start voice call
  const handleVoiceCall = () => {
    const otherUserId = getOtherUserId();
    if (otherUserId) {
      startCall(chat.id, otherUserId, 'voice');
    }
  };

  // Start video call
  const handleVideoCall = () => {
    const otherUserId = getOtherUserId();
    if (otherUserId) {
      startCall(chat.id, otherUserId, 'video');
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatName = () => {
    if (chat.type === 'group') {
      return chat.group_name || 'গ্রুপ';
    }
    return chat.other_user?.full_name || 'ব্যবহারকারী';
  };

  const getChatAvatar = () => {
    if (chat.type === 'group') {
      return chat.group_avatar_url;
    }
    return chat.other_user?.avatar_url;
  };

  const getStatusText = () => {
    if (typingUsers.length > 0) {
      if (typingUsers.length === 1) {
        return `${typingUsers[0].full_name} টাইপ করছে...`;
      }
      return `${typingUsers.length} জন টাইপ করছে...`;
    }

    if (chat.type === 'group') {
      const count = chat.participants?.length || 0;
      return `${count} জন সদস্য`;
    }

    if (chat.other_user?.is_online) {
      return 'অনলাইন';
    }

    if (chat.other_user?.last_seen) {
      return `সর্বশেষ দেখা ${formatDistanceToNow(new Date(chat.other_user.last_seen), { addSuffix: true, locale: bn })}`;
    }

    return '';
  };

  const handleSend = async (
    content: string,
    type?: 'text' | 'image' | 'video' | 'voice' | 'file',
    metadata?: Record<string, unknown>,
    replyToId?: string
  ) => {
    stopTyping();
    await sendMessage(content, type, metadata, replyToId);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
    setEditMessage(null);
  };

  const handleEdit = (message: ChatMessage) => {
    setEditMessage(message);
    setReplyTo(null);
  };

  const handleSaveEdit = async (messageId: string, content: string) => {
    await saveEdit(messageId, content);
    setEditMessage(null);
  };

  const handleForward = (message: ChatMessage) => {
    // TODO: Implement forward modal
    console.log('Forward message:', message);
  };

  // Group messages by sender and time
  const groupedMessages = messages.reduce((groups, message, index) => {
    const prev = messages[index - 1];
    const showAvatar = !prev || 
      prev.sender_id !== message.sender_id ||
      new Date(message.created_at).getTime() - new Date(prev.created_at).getTime() > 60000;
    
    groups.push({ message, showAvatar });
    return groups;
  }, [] as { message: ChatMessage; showAvatar: boolean }[]);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--wa-chat))]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[hsl(var(--wa-border))] bg-[hsl(var(--wa-sidebar))]">
        <Button size="icon" variant="ghost" onClick={onBack} className="md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => chat.type === 'direct' && chat.other_user && onViewProfile(chat.other_user.user_id)}
        >
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={getChatAvatar() || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {chat.type === 'group' ? (
                  <Users className="w-5 h-5" />
                ) : (
                  getChatName().charAt(0)
                )}
              </AvatarFallback>
            </Avatar>
            {chat.type === 'direct' && chat.other_user?.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate text-bengali">{getChatName()}</h3>
              {chat.other_user?.trust_score && chat.other_user.trust_score > 0 && (
                <Badge variant="secondary" className="text-xs">
                  ⭐ {chat.other_user.trust_score}
                </Badge>
              )}
            </div>
            <p className={`text-sm truncate text-bengali ${
              typingUsers.length > 0 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {chat.type === 'direct' && (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                title="ভয়েস কল"
                onClick={handleVoiceCall}
                disabled={!!callState}
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                title="ভিডিও কল"
                onClick={handleVideoCall}
                disabled={!!callState}
              >
                <Video className="w-5 h-5" />
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {chat.type === 'group' && (
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-bengali">সদস্য দেখুন</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Pin className="w-4 h-4 mr-2" />
                <span className="text-bengali">পিন করুন</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellOff className="w-4 h-4 mr-2" />
                <span className="text-bengali">মিউট করুন</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {chat.type === 'group' ? (
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-bengali">গ্রুপ ছাড়ুন</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="text-bengali">চ্যাট মুছুন</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 wa-chat-wallpaper p-4" ref={scrollRef}>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={getChatAvatar() || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {chat.type === 'group' ? (
                    <Users className="w-8 h-8" />
                  ) : (
                    getChatName().charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-semibold text-lg text-bengali">{getChatName()}</h3>
            {chat.other_user?.trust_score && (
              <Badge variant="secondary" className="mt-2">
                ⭐ ট্রাস্ট স্কোর: {chat.other_user.trust_score}
              </Badge>
            )}
            <p className="text-muted-foreground mt-2 text-bengali">
              কথোপকথন শুরু করুন
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedMessages.map(({ message, showAvatar }) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                showAvatar={showAvatar}
                currentUserId={currentUserId}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={deleteMessage}
                onReact={addReaction}
                onForward={handleForward}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground text-bengali">
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <span className="ml-2">
            {typingUsers.length === 1
              ? `${typingUsers[0].full_name} টাইপ করছে...`
              : `${typingUsers.length} জন টাইপ করছে...`}
          </span>
        </div>
      )}

      {/* Input */}
      <MessageInput
        chatId={chat.id}
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        editMessage={editMessage}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditMessage(null)}
        onSaveEdit={handleSaveEdit}
        disabled={loading}
      />

      {/* Call Dialog */}
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
        otherUserName={chat.other_user?.full_name}
        otherUserAvatar={chat.other_user?.avatar_url || undefined}
      />
    </div>
  );
}
