import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  FileText, 
  MessageCircle, 
  Plus, 
  Crown,
  Loader2,
  Pin,
  Sparkles,
  Bot
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StudyRoom, StudyRoomMember, StudyRoomMessage, StudyRoomNote } from '@/hooks/useStudyRooms';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudyRoomDetailProps {
  room: StudyRoom | null;
  members: StudyRoomMember[];
  messages: StudyRoomMessage[];
  notes: StudyRoomNote[];
  loading: boolean;
  userId: string | null;
  onBack: () => void;
  onSendMessage: (content: string, type?: 'text' | 'note' | 'quiz' | 'system') => Promise<boolean>;
  onAddNote: (title: string, content: string) => Promise<boolean>;
  onRequestQuiz: (topic: string) => void;
}

export function StudyRoomDetail({
  room,
  members,
  messages,
  notes,
  loading,
  userId,
  onBack,
  onSendMessage,
  onAddNote,
  onRequestQuiz,
}: StudyRoomDetailProps) {
  const { t } = useLanguage();
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [addingNote, setAddingNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Check if message starts with @ai
  const isAIRequest = (text: string) => {
    return text.trim().toLowerCase().startsWith('@ai ') || text.trim().toLowerCase() === '@ai';
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending || aiLoading) return;
    
    const text = messageInput.trim();
    setMessageInput('');

    if (isAIRequest(text)) {
      // AI request flow
      const aiQuestion = text.replace(/^@ai\s*/i, '').trim();
      if (!aiQuestion) return;

      setAiLoading(true);
      setStreamingContent('');

      try {
        // Save user's AI question as ai_request
        await supabase.from('study_room_messages').insert({
          room_id: room!.id,
          user_id: userId!,
          content: aiQuestion,
          message_type: 'ai_request',
        });

        // Build conversation history from recent messages
        const recentAIMessages = messages
          .filter(m => m.message_type === 'ai_request' || m.message_type === 'ai_response')
          .slice(-20)
          .map(m => ({
            role: m.message_type === 'ai_response' ? 'assistant' as const : 'user' as const,
            content: m.content,
          }));

        const contextPrefix = room?.topic 
          ? `[Study Room: ${room.name}] [Topic: ${room.topic}] [Group learning session]\n\n`
          : `[Study Room: ${room?.name}] [Group learning session]\n\n`;

        recentAIMessages.push({ role: 'user' as const, content: contextPrefix + aiQuestion });

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const response = await fetch(`${supabaseUrl}/functions/v1/learning-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({ messages: recentAIMessages, userId }),
        });

        if (!response.ok) throw new Error(`AI error: ${response.status}`);

        // Stream response
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
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

        // Save AI response
        if (fullResponse) {
          await supabase.from('study_room_messages').insert({
            room_id: room!.id,
            user_id: userId!,
            content: fullResponse,
            message_type: 'ai_response',
          });
        }
      } catch (error) {
        console.error('Error calling AI:', error);
      } finally {
        setAiLoading(false);
        setStreamingContent('');
      }
    } else {
      // Normal message
      setSending(true);
      await onSendMessage(text);
      setSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    setAddingNote(true);
    const success = await onAddNote(newNote.title, newNote.content);
    setAddingNote(false);
    if (success) {
      setNoteDialogOpen(false);
      setNewNote({ title: '', content: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('Room not found', 'রুম পাওয়া যায়নি')}</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('Back to Rooms', 'রুমে ফিরুন')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{room.name}</h2>
          {room.topic && (
            <Badge variant="outline" className="mt-1">{room.topic}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{members.length}/{room.max_members}</span>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chat" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="gap-1 text-xs">
            <MessageCircle className="h-4 w-4" />
            {t('Chat', 'চ্যাট')}
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1 text-xs">
            <FileText className="h-4 w-4" />
            {t('Notes', 'নোট')}
            {notes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{notes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1 text-xs">
            <Users className="h-4 w-4" />
            {t('Members', 'সদস্য')}
          </TabsTrigger>
        </TabsList>

        {/* Unified Chat Tab (Members + AI together) */}
        <TabsContent value="chat" className="flex-1 mt-4">
          <Card className="h-[500px] flex flex-col">
            {/* AI hint banner */}
            <div className="px-4 py-2 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                {t(
                  'Type @ai before your message to ask Learning Buddy (e.g. "@ai explain React hooks")',
                  '@ai লিখে প্রশ্ন করুন Learning Buddy কে (যেমন: "@ai React hooks বোঝাও")'
                )}
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && !streamingContent ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('No messages yet. Start the conversation!', 'এখনো কোনো মেসেজ নেই। কথা শুরু করুন!')}</p>
                    <p className="text-xs mt-2">
                      {t(
                        'Chat with members or use @ai to ask Learning Buddy',
                        'সদস্যদের সাথে চ্যাট করুন অথবা @ai দিয়ে Learning Buddy কে জিজ্ঞেস করুন'
                      )}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.user_id === userId;
                    const isAI = msg.message_type === 'ai_response';
                    const isAIReq = msg.message_type === 'ai_request';

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          isAI ? "" : isOwn ? "flex-row-reverse" : ""
                        )}
                      >
                        {/* Avatar */}
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

                        <div className={cn("max-w-[80%]", !isAI && isOwn && "text-right")}>
                          <p className="text-xs text-muted-foreground mb-1">
                            {isAI ? (
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-primary" />
                                Learning Buddy
                              </span>
                            ) : (
                              msg.profile?.full_name || 'Unknown'
                            )}
                          </p>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 text-sm",
                              isAI
                                ? "bg-muted rounded-tl-sm prose prose-sm dark:prose-invert max-w-none"
                                : isAIReq
                                  ? "bg-primary/10 border border-primary/20 rounded-tr-sm"
                                  : isOwn
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-muted rounded-tl-sm",
                              msg.message_type === 'quiz' && "bg-amber-500/10 border border-amber-500/20",
                              msg.message_type === 'system' && "bg-blue-500/10 border border-blue-500/20 text-center"
                            )}
                          >
                            {isAIReq && (
                              <span className="text-xs text-primary font-medium">@ai </span>
                            )}
                            {msg.message_type === 'quiz' && (
                              <Sparkles className="h-4 w-4 inline mr-1 text-amber-500" />
                            )}
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
                  })
                )}

                {/* Streaming AI response */}
                {streamingContent && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[80%]">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Learning Buddy
                      </p>
                      <div className="rounded-2xl rounded-tl-sm px-4 py-2 text-sm bg-muted prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamingContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {aiLoading && !streamingContent && (
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

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('Message or @ai to ask AI...', 'মেসেজ অথবা @ai দিয়ে AI কে জিজ্ঞেস করুন...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending || aiLoading}
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sending || aiLoading}>
                  {sending || aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add Note', 'নোট যোগ করুন')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('Add Shared Note', 'শেয়ার্ড নোট যোগ করুন')}</DialogTitle>
                    <DialogDescription>
                      {t('Share notes with your study room members', 'স্টাডি রুমের সদস্যদের সাথে নোট শেয়ার করুন')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="noteTitle">{t('Title', 'শিরোনাম')}</Label>
                      <Input
                        id="noteTitle"
                        value={newNote.title}
                        onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('e.g., React Hooks Summary', 'যেমন: React Hooks সারাংশ')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noteContent">{t('Content', 'বিষয়বস্তু')}</Label>
                      <Textarea
                        id="noteContent"
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        placeholder={t('Write your notes here...', 'এখানে নোট লিখুন...')}
                        rows={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                      {t('Cancel', 'বাতিল')}
                    </Button>
                    <Button onClick={handleAddNote} disabled={!newNote.title.trim() || !newNote.content.trim() || addingNote}>
                      {addingNote ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('Adding...', 'যোগ হচ্ছে...')}</>
                      ) : (
                        t('Add Note', 'নোট যোগ করুন')
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {notes.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {t('No notes yet. Add the first note!', 'এখনো কোনো নোট নেই। প্রথম নোট যোগ করুন!')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {note.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                          <CardTitle className="text-base">{note.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {note.profile?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{note.profile?.full_name}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: bn })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar>
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback>{member.profile?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.profile?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Joined', 'যোগ দিয়েছেন')}{' '}
                        {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true, locale: bn })}
                      </p>
                    </div>
                    {member.role === 'admin' && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
