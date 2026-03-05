import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Bot, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface StudyRoomAIChatProps {
  roomId: string;
  userId: string | null;
  roomTopic?: string | null;
}

export function StudyRoomAIChat({ roomId, userId, roomTopic }: StudyRoomAIChatProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Fetch AI messages for this room
  const fetchAIMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const { data, error } = await supabase
        .from('study_room_messages')
        .select('*')
        .eq('room_id', roomId)
        .in('message_type', ['ai_request', 'ai_response'])
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) throw error;

      // Fetch profiles for senders
      const userIds = [...new Set((data || []).map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      setMessages(
        (data || []).map(m => ({
          ...m,
          profile: profileMap.get(m.user_id) || { full_name: 'Unknown', avatar_url: null },
        }))
      );
    } catch (error) {
      console.error('Error fetching AI messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Real-time subscription
  useEffect(() => {
    if (!roomId) return;
    fetchAIMessages();

    const channel = supabase
      .channel(`study_room_ai_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as AIMessage;
          if (newMsg.message_type !== 'ai_request' && newMsg.message_type !== 'ai_response') return;
          
          // Don't add if it's from the current streaming session (we already show it)
          if (newMsg.user_id === userId && newMsg.message_type === 'ai_response') return;

          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', newMsg.user_id)
            .single();

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              ...newMsg,
              profile: profile || { full_name: 'Unknown', avatar_url: null },
            }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchAIMessages, userId]);

  const handleSend = async () => {
    if (!input.trim() || sending || !userId || !roomId) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);
    setStreamingContent('');

    try {
      // Save user question to study_room_messages
      const { error: insertError } = await supabase
        .from('study_room_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          content: userMessage,
          message_type: 'ai_request',
        });

      if (insertError) throw insertError;

      // Build conversation history from recent AI messages
      const recentMessages = messages
        .slice(-20)
        .map(m => ({
          role: m.message_type === 'ai_response' ? 'assistant' as const : 'user' as const,
          content: m.content,
        }));

      // Add room context to the current message
      const contextPrefix = roomTopic 
        ? `[Study Room Topic: ${roomTopic}] [Group learning session]\n\n`
        : `[Group learning session]\n\n`;

      // Add current message with context
      recentMessages.push({ role: 'user' as const, content: contextPrefix + userMessage });

      // Call learning-chat edge function
      const response = await supabase.functions.invoke('learning-chat', {
        body: {
          messages: recentMessages,
          userId,
        },
      });

      if (response.error) throw response.error;

      // Handle streaming response
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                setStreamingContent(fullResponse);
              }
            } catch {}
          }
        }
      }

      // Save AI response to study_room_messages
      if (fullResponse) {
        await supabase
          .from('study_room_messages')
          .insert({
            room_id: roomId,
            user_id: userId,
            content: fullResponse,
            message_type: 'ai_response',
          });

        // Add to local state
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          room_id: roomId,
          user_id: userId,
          content: fullResponse,
          message_type: 'ai_response',
          created_at: new Date().toISOString(),
          profile: undefined,
        }]);
      }

      setStreamingContent('');
    } catch (error) {
      console.error('Error sending AI message:', error);
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      {/* AI Chat Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Learning Buddy</p>
          <p className="text-xs text-muted-foreground">
            {t('Shared AI assistant for this room', 'এই রুমের শেয়ার্ড AI সহকারী')}
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-primary ml-auto" />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">
                {t('Ask Learning Buddy together!', 'একসাথে Learning Buddy কে জিজ্ঞেস করুন!')}
              </p>
              <p className="text-xs mt-1">
                {t(
                  'All members can see questions and answers here',
                  'সকল সদস্য এখানে প্রশ্ন ও উত্তর দেখতে পারবেন'
                )}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isAI = msg.message_type === 'ai_response';
            return (
              <div key={msg.id} className={cn("flex gap-3", !isAI && "flex-row-reverse")}>
                {isAI ? (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={msg.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {msg.profile?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[80%]", !isAI && "text-right")}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {isAI ? 'Learning Buddy' : msg.profile?.full_name || 'Unknown'}
                  </p>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm",
                      isAI
                        ? "bg-muted rounded-tl-sm prose prose-sm dark:prose-invert max-w-none"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {isAI ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: bn,
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Streaming response */}
          {streamingContent && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="max-w-[80%]">
                <p className="text-xs text-muted-foreground mb-1">Learning Buddy</p>
                <div className="rounded-2xl rounded-tl-sm px-4 py-2 text-sm bg-muted prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {sending && !streamingContent && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-2 text-sm bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        {!userId ? (
          <p className="text-center text-sm text-muted-foreground">
            {t('Login to chat with AI Buddy', 'AI Buddy র সাথে চ্যাট করতে লগইন করুন')}
          </p>
        ) : (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Ask Learning Buddy...', 'Learning Buddy কে জিজ্ঞেস করুন...')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
