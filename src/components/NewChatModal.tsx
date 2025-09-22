import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Chat, STORAGE, load, save } from "@/lib/storage";
import { Search, MessageCircle } from "lucide-react";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onChatCreated: (chat: Chat) => void;
}

export const NewChatModal = ({ open, onClose, currentUser, users, onChatCreated }: NewChatModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.id !== currentUser.id && 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = (otherUser: User) => {
    const existingChats = load<Chat[]>(STORAGE.CHATS, []);
    
    // Check if chat already exists
    const existingChat = existingChats.find(chat => 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(otherUser.id) &&
      chat.participants.length === 2
    );

    if (existingChat) {
      onChatCreated(existingChat);
      onClose();
      return;
    }

    // Create new chat
    const newChat: Chat = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      participants: [currentUser.id, otherUser.id],
      participantNames: [currentUser.name, otherUser.name],
      participantImages: [currentUser.profileImage, otherUser.profileImage].filter(Boolean) as string[],
      isGroup: false,
      unreadCount: 0,
      createdAt: new Date().toISOString()
    };

    const updatedChats = [newChat, ...existingChats];
    save(STORAGE.CHATS, updatedChats);
    
    onChatCreated(newChat);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-bengali">নতুন চ্যাট শুরু করুন</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ব্যবহারকারী খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-bengali"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-bengali">কোন ব্যবহারকারী পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleCreateChat(user)}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-bengali">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Trust Score: {user.trustScore}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};