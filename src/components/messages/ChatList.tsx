import { useState } from 'react';
import { Search, Plus, Users, Pin, Check, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Chat } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  selectedChatId: string | null;
  currentUserId: string | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
}

export function ChatList({
  chats,
  loading,
  selectedChatId,
  currentUserId,
  onSelectChat,
  onNewChat,
  onNewGroup,
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat => {
    const name = chat.type === 'group' 
      ? chat.group_name 
      : chat.other_user?.full_name;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.group_name || 'গ্রুপ';
    }
    return chat.other_user?.full_name || 'ব্যবহারকারী';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.group_avatar_url;
    }
    return chat.other_user?.avatar_url;
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.last_message) return 'নতুন কথোপকথন';
    
    if (chat.last_message.is_deleted) return 'এই মেসেজটি মুছে ফেলা হয়েছে';
    
    const prefix = chat.last_message.sender_id === currentUserId ? 'আপনি: ' : '';
    
    switch (chat.last_message.type) {
      case 'image':
        return `${prefix}📷 ছবি`;
      case 'video':
        return `${prefix}🎥 ভিডিও`;
      case 'voice':
        return `${prefix}🎤 ভয়েস মেসেজ`;
      case 'file':
        return `${prefix}📎 ফাইল`;
      case 'call_started':
        return `${prefix}📞 কল শুরু হয়েছে`;
      case 'call_ended':
        return `${prefix}📞 কল শেষ হয়েছে`;
      default:
        return `${prefix}${chat.last_message.content?.slice(0, 30) || ''}${(chat.last_message.content?.length || 0) > 30 ? '...' : ''}`;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: bn });
    } catch {
      return '';
    }
  };

  const getMessageStatus = (chat: Chat) => {
    if (!chat.last_message || chat.last_message.sender_id !== currentUserId) return null;
    
    const readBy = chat.last_message.read_by || [];
    const isRead = readBy.length > 1; // More than just sender
    
    return isRead ? (
      <CheckCheck className="w-4 h-4 text-primary" />
    ) : (
      <Check className="w-4 h-4 text-muted-foreground" />
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-bengali">চ্যাট</h2>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={onNewGroup} title="নতুন গ্রুপ">
              <Users className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onNewChat} title="নতুন চ্যাট">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="চ্যাট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-bengali"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-bengali">কোনো চ্যাট নেই</p>
              <p className="text-sm text-bengali mt-1">নতুন চ্যাট শুরু করুন</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedChatId === chat.id ? 'bg-muted' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getChatAvatar(chat) || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.type === 'group' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        getChatName(chat).charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online indicator for direct chats */}
                  {chat.type === 'direct' && chat.other_user?.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate text-bengali">
                        {getChatName(chat)}
                      </span>
                      {chat.other_user?.trust_score && chat.other_user.trust_score > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          ⭐ {chat.other_user.trust_score}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {chat.last_message && getMessageStatus(chat)}
                      {chat.last_message && (
                        <span>{getTimeAgo(chat.last_message.created_at)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate text-bengali">
                      {getLastMessagePreview(chat)}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {chat.unread_count && chat.unread_count > 0 && (
                        <div className="min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                          {chat.unread_count > 99 ? '99+' : chat.unread_count}
                        </div>
                      )}
                      
                      {chat.participants?.find(p => p.user_id === currentUserId)?.is_pinned && (
                        <Pin className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
