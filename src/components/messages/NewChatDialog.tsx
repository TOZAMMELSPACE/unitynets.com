import { useState, useEffect } from 'react';
import { Search, Users, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  trust_score: number | null;
  location: string | null;
  bio: string | null;
}

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  isGroupMode: boolean;
  onCreateDirectChat: (userId: string) => void;
  onCreateGroupChat: (name: string, memberIds: string[]) => void;
}

export function NewChatDialog({
  open,
  onClose,
  currentUserId,
  isGroupMode,
  onCreateDirectChat,
  onCreateGroupChat,
}: NewChatDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
    } else {
      setSearchTerm('');
      setSelectedUsers([]);
      setGroupName('');
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, avatar_url, trust_score, location, bio')
        .neq('user_id', currentUserId)
        .order('trust_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (user: Profile) => {
    if (isGroupMode) {
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u.user_id === user.user_id);
        if (isSelected) {
          return prev.filter(u => u.user_id !== user.user_id);
        }
        return [...prev, user];
      });
    } else {
      onCreateDirectChat(user.user_id);
      onClose();
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroupChat(groupName.trim(), selectedUsers.map(u => u.user_id));
      onClose();
    }
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(u => u.user_id === userId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-bengali">
            {isGroupMode ? 'নতুন গ্রুপ তৈরি করুন' : 'নতুন চ্যাট শুরু করুন'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group name input */}
          {isGroupMode && (
            <Input
              placeholder="গ্রুপের নাম..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="text-bengali"
            />
          )}

          {/* Selected users */}
          {isGroupMode && selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Badge
                  key={user.user_id}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <span className="text-bengali">{user.full_name}</span>
                  <button
                    onClick={() => handleUserClick(user)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ব্যবহারকারী খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-bengali"
            />
          </div>

          {/* User list */}
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-bengali">
                কোনো ব্যবহারকারী পাওয়া যায়নি
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map(user => (
                  <div
                    key={user.user_id}
                    onClick={() => handleUserClick(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isUserSelected(user.user_id)
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-bengali">
                          {user.full_name}
                        </span>
                        {user.trust_score && user.trust_score > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {user.trust_score}
                          </Badge>
                        )}
                      </div>
                      {user.location && (
                        <p className="text-sm text-muted-foreground truncate text-bengali">
                          📍 {user.location}
                        </p>
                      )}
                    </div>

                    {isGroupMode && isUserSelected(user.user_id) && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Create group button */}
          {isGroupMode && (
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="w-full text-bengali"
            >
              <Users className="w-4 h-4 mr-2" />
              গ্রুপ তৈরি করুন ({selectedUsers.length} সদস্য)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
