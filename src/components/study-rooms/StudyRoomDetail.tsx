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
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StudyRoom, StudyRoomMember, StudyRoomMessage, StudyRoomNote } from '@/hooks/useStudyRooms';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

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
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [addingNote, setAddingNote] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;
    
    setSending(true);
    const success = await onSendMessage(messageInput.trim());
    setSending(false);
    
    if (success) {
      setMessageInput('');
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

  const handleQuizRequest = () => {
    if (!quizTopic.trim()) return;
    onRequestQuiz(quizTopic);
    onSendMessage(`🎯 কুইজ রিকোয়েস্ট: ${quizTopic} নিয়ে একটা MCQ Quiz দাও`, 'quiz');
    setQuizTopic('');
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
        <p className="text-muted-foreground">
          {t('Room not found', 'রুম পাওয়া যায়নি')}
        </p>
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
            <Badge variant="outline" className="mt-1">
              {room.topic}
            </Badge>
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
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('Chat', 'চ্যাট')}
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('Notes', 'নোট')}
            {notes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {notes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            {t('Members', 'সদস্য')}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 mt-4">
          <Card className="h-[500px] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('No messages yet. Start the conversation!', 'এখনো কোনো মেসেজ নেই। কথা শুরু করুন!')}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.user_id === userId;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          isOwn && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={msg.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {msg.profile?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-[70%]", isOwn && "text-right")}>
                          <p className="text-xs text-muted-foreground mb-1">
                            {msg.profile?.full_name || 'Unknown'}
                          </p>
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 text-sm",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted rounded-tl-sm",
                              msg.message_type === 'quiz' && "bg-amber-500/10 border border-amber-500/20",
                              msg.message_type === 'system' && "bg-blue-500/10 border border-blue-500/20 text-center"
                            )}
                          >
                            {msg.message_type === 'quiz' && (
                              <Sparkles className="h-4 w-4 inline mr-1 text-amber-500" />
                            )}
                            {msg.content}
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
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('Type a message...', 'মেসেজ লিখুন...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending}
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-2">
                <div className="flex-1 flex gap-2">
                  <Input
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder={t('Quiz topic...', 'কুইজ টপিক...')}
                    className="text-xs h-8"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleQuizRequest}
                    disabled={!quizTopic.trim()}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('Quiz', 'কুইজ')}
                  </Button>
                </div>
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
                    <Button 
                      onClick={handleAddNote} 
                      disabled={!newNote.title.trim() || !newNote.content.trim() || addingNote}
                    >
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
                          {note.is_pinned && (
                            <Pin className="h-4 w-4 text-primary" />
                          )}
                          <CardTitle className="text-base">{note.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={note.profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {note.profile?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {note.profile?.full_name}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                          locale: bn,
                        })}
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
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Avatar>
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.profile?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('Joined', 'যোগ দিয়েছেন')}{' '}
                        {formatDistanceToNow(new Date(member.joined_at), {
                          addSuffix: true,
                          locale: bn,
                        })}
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
