import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, BookOpen, LogIn, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StudyRoom } from '@/hooks/useStudyRooms';
import { cn } from '@/lib/utils';

interface StudyRoomsListProps {
  rooms: StudyRoom[];
  loading: boolean;
  userId: string | null;
  onCreateRoom: (name: string, description: string, topic: string, maxMembers: number) => Promise<any>;
  onJoinRoom: (roomId: string) => Promise<boolean>;
  onSelectRoom: (roomId: string) => void;
}

export function StudyRoomsList({
  rooms,
  loading,
  userId,
  onCreateRoom,
  onJoinRoom,
  onSelectRoom,
}: StudyRoomsListProps) {
  const { t } = useLanguage();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    topic: '',
    maxMembers: '8',
  });

  const handleCreate = async () => {
    if (!newRoom.name.trim()) return;
    
    setCreating(true);
    const result = await onCreateRoom(
      newRoom.name,
      newRoom.description,
      newRoom.topic,
      parseInt(newRoom.maxMembers)
    );
    setCreating(false);
    
    if (result) {
      setCreateDialogOpen(false);
      setNewRoom({ name: '', description: '', topic: '', maxMembers: '8' });
      onSelectRoom(result.id);
    }
  };

  const handleJoin = async (roomId: string) => {
    setJoining(roomId);
    const success = await onJoinRoom(roomId);
    setJoining(null);
    if (success) {
      onSelectRoom(roomId);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t('Study Rooms', 'স্টাডি রুম')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('Learn together with small groups (4-8 members)', 'ছোট গ্রুপে একসাথে শিখুন (৪-৮ জন)')}
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('Create Room', 'রুম তৈরি')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Create Study Room', 'স্টাডি রুম তৈরি করুন')}</DialogTitle>
              <DialogDescription>
                {t('Create a room to study together with others', 'অন্যদের সাথে একসাথে পড়ার জন্য রুম তৈরি করুন')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('Room Name', 'রুমের নাম')} *</Label>
                <Input
                  id="name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('e.g., Web Dev Study Group', 'যেমন: ওয়েব ডেভ স্টাডি গ্রুপ')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">{t('Topic', 'বিষয়')}</Label>
                <Input
                  id="topic"
                  value={newRoom.topic}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder={t('e.g., React, JavaScript, Python', 'যেমন: React, JavaScript, Python')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('Description', 'বিবরণ')}</Label>
                <Textarea
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('What will you study in this room?', 'এই রুমে কী পড়বেন?')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">{t('Max Members', 'সর্বোচ্চ সদস্য')}</Label>
                <Select
                  value={newRoom.maxMembers}
                  onValueChange={(value) => setNewRoom(prev => ({ ...prev, maxMembers: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {t('members', 'জন')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                {t('Cancel', 'বাতিল')}
              </Button>
              <Button onClick={handleCreate} disabled={!newRoom.name.trim() || creating}>
                {creating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('Creating...', 'তৈরি হচ্ছে...')}</>
                ) : (
                  t('Create Room', 'রুম তৈরি')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('No study rooms yet', 'এখনো কোনো স্টাডি রুম নেই')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('Be the first to create a study room!', 'প্রথম স্টাডি রুম তৈরি করুন!')}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Create Room', 'রুম তৈরি')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card 
              key={room.id} 
              className={cn(
                "transition-all hover:shadow-md cursor-pointer",
                room.is_member && "ring-2 ring-primary/20"
              )}
              onClick={() => room.is_member ? onSelectRoom(room.id) : undefined}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">{room.name}</CardTitle>
                  {room.is_member && (
                    <Badge variant="secondary" className="shrink-0">
                      {t('Joined', 'যোগ দিয়েছেন')}
                    </Badge>
                  )}
                </div>
                {room.topic && (
                  <Badge variant="outline" className="w-fit">
                    {room.topic}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="pb-2">
                {room.description && (
                  <CardDescription className="line-clamp-2 mb-3">
                    {room.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {room.members_count || 0}/{room.max_members} {t('members', 'জন')}
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                {room.is_member ? (
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoom(room.id);
                    }}
                  >
                    {t('Enter Room', 'রুমে প্রবেশ করুন')}
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    disabled={
                      !userId || 
                      joining === room.id || 
                      (room.members_count || 0) >= room.max_members
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(room.id);
                    }}
                  >
                    {joining === room.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('Joining...', 'যোগ দিচ্ছে...')}</>
                    ) : (room.members_count || 0) >= room.max_members ? (
                      t('Room Full', 'রুম পূর্ণ')
                    ) : (
                      <><LogIn className="h-4 w-4 mr-2" />{t('Join Room', 'যোগ দিন')}</>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
