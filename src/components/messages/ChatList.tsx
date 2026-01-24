import { useMemo, useState } from 'react';
import { Search, Plus, Users, Pin, Check, CheckCheck, RefreshCw, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Chat, ChatLoadError } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  error?: ChatLoadError | null;
  onRetry?: () => void;
  selectedChatId: string | null;
  currentUserId: string | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
}

export function ChatList({
  chats,
  loading,
  error,
  onRetry,
  selectedChatId,
  currentUserId,
  onSelectChat,
  onNewChat,
  onNewGroup,
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { language, t } = useLanguage();

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const name = chat.type === 'group' ? chat.group_name : chat.other_user?.full_name;
      return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [chats, searchTerm]);

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.group_name || t('Group', 'গ্রুপ');
    }
    return chat.other_user?.full_name || t('User', 'ব্যবহারকারী');
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.group_avatar_url;
    }
    return chat.other_user?.avatar_url;
  };

  const getLastMessagePreview = (chat: Chat) => {
    if (!chat.last_message) return t('New conversation', 'নতুন কথোপকথন');

    if (chat.last_message.is_deleted) return t('This message was deleted', 'এই মেসেজটি মুছে ফেলা হয়েছে');

    const prefix = chat.last_message.sender_id === currentUserId ? `${t('You', 'আপনি')}: ` : '';

    switch (chat.last_message.type) {
      case 'image':
        return `${prefix}📷 ${t('Image', 'ছবি')}`;
      case 'video':
        return `${prefix}🎥 ${t('Video', 'ভিডিও')}`;
      case 'voice':
        return `${prefix}🎤 ${t('Voice message', 'ভয়েস মেসেজ')}`;
      case 'file':
        return `${prefix}📎 ${t('File', 'ফাইল')}`;
      case 'call_started':
        return `${prefix}📞 ${t('Call started', 'কল শুরু হয়েছে')}`;
      case 'call_ended':
        return `${prefix}📞 ${t('Call ended', 'কল শেষ হয়েছে')}`;
      default:
        return `${prefix}${chat.last_message.content?.slice(0, 30) || ''}${(chat.last_message.content?.length || 0) > 30 ? '...' : ''}`;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: language === 'bn' ? bn : enUS });
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
          {[1, 2, 3, 4, 5].map((i) => (
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
    <div className="flex flex-col h-full bg-[hsl(var(--wa-sidebar))]">
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--wa-border))] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('Chats', 'চ্যাট')}</h2>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={onNewGroup} title={t('New Group', 'নতুন গ্রুপ')}>
              <Users className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onNewChat} title={t('New Chat', 'নতুন চ্যাট')}>
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('Search chats...', 'চ্যাট খুঁজুন...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-premium rounded-full bg-background/70"
          />
        </div>
      </div>

      {/* Error banner */}
      {error ? (
        <div className="px-4 pt-4">
          <Alert variant="destructive" className="border-[hsl(var(--wa-border))]">
            <AlertTitle>{t('Failed to load chats', 'চ্যাট লোড হয়নি')}</AlertTitle>
            <AlertDescription>
              {error.message}
              {error.code ? <span className="ml-2 opacity-80">(code: {error.code})</span> : null}
            </AlertDescription>

            <div className="mt-3 flex items-center gap-2">
              {onRetry ? (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span>{t('Retry', 'আবার চেষ্টা')}</span>
                </Button>
              ) : null}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Info className="w-4 h-4 mr-2" />
                    <span>{t('Details', 'বিস্তারিত')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{t('Error Details', 'এরর বিস্তারিত')}</DialogTitle>
                    <DialogDescription>
                      {t('Copy this information and send it to us for quick resolution.', 'নিচের তথ্যটা কপি করে আমাকে পাঠালে দ্রুত ঠিক করতে পারবো।')}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3">
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(JSON.stringify(error, null, 2));
                          } catch {
                            // ignore
                          }
                        }}
                      >
                        <span>{t('Copy', 'কপি')}</span>
                      </Button>
                    </div>

                    <pre className="max-h-[50vh] overflow-auto rounded-lg bg-muted p-3 text-xs">{JSON.stringify(error, null, 2)}</pre>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Alert>
        </div>
      ) : null}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-[hsl(var(--wa-border))]">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('No chats yet', 'কোনো চ্যাট নেই')}</p>
              <p className="text-sm mt-1">{t('Start a new chat', 'নতুন চ্যাট শুরু করুন')}</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-l-4 border-transparent transition-colors hover:bg-background/60 ${
                  selectedChatId === chat.id ? 'bg-background/70 border-primary pl-3' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getChatAvatar(chat) || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.type === 'group' ? <Users className="w-5 h-5" /> : getChatName(chat).charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Online indicator for direct chats */}
                  {chat.type === 'direct' && chat.other_user?.is_online ? (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                  ) : null}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{getChatName(chat)}</span>
                      {chat.other_user?.trust_score && chat.other_user.trust_score > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          ⭐ {chat.other_user.trust_score}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {chat.last_message ? getMessageStatus(chat) : null}
                      {chat.last_message ? <span>{getTimeAgo(chat.last_message.created_at)}</span> : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{getLastMessagePreview(chat)}</p>

                    <div className="flex items-center gap-2">
                      {chat.unread_count && chat.unread_count > 0 ? (
                        <div className="min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                          {chat.unread_count > 99 ? '99+' : chat.unread_count}
                        </div>
                      ) : null}

                      {chat.participants?.find((p) => p.user_id === currentUserId)?.is_pinned ? (
                        <Pin className="w-3 h-3 text-muted-foreground" />
                      ) : null}
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
