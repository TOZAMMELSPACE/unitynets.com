import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { User, Chat, STORAGE, load } from "@/lib/storage";
import { MessageCircle, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInterface } from "@/components/ChatInterface";
import { NewChatModal } from "@/components/NewChatModal";

interface MessagesProps {
  currentUser: User | null;
  users: User[];
  onSignOut: () => void;
}

export default function Messages({ currentUser, users, onSignOut }: MessagesProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    const savedChats = load<Chat[]>(STORAGE.CHATS, []);
    setChats(savedChats);
  }, []);

  const filteredChats = chats.filter(chat => {
    const otherParticipantName = chat.participantNames.find(name => 
      name !== currentUser?.name
    ) || chat.groupName || '';
    
    return otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} মিনিট আগে`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ঘন্টা আগে`;
    } else {
      return date.toLocaleDateString('bn-BD');
    }
  };

  const handleChatCreated = (chat: Chat) => {
    setSelectedChat(chat);
    const savedChats = load<Chat[]>(STORAGE.CHATS, []);
    setChats(savedChats);
  };

  if (selectedChat) {
    return (
      <ChatInterface
        chat={selectedChat}
        currentUser={currentUser!}
        onBack={() => setSelectedChat(null)}
        users={users}
      />
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header currentUser={currentUser} onSignOut={onSignOut} />
      
      <main className="container mx-auto px-4 max-w-2xl">
        {/* Page Heading with Topics */}
        <div className="card-enhanced p-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-hero bg-clip-text text-transparent">Messages | মেসেজ</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Chats, Inbox, Direct Messaging, Conversations, Group Chats, Online Status
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-bengali">চ্যাট</h2>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => setShowNewChatModal(true)}
            >
              <Plus size={16} />
              নতুন চ্যাট
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="চ্যাট খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-bengali"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredChats.map((chat) => {
            const otherParticipant = users.find(u => 
              chat.participants.find(p => p !== currentUser.id && p === u.id)
            );
            
            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="card-enhanced p-4 hover:bg-muted/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {otherParticipant?.profileImage ? (
                        <img 
                          src={otherParticipant.profileImage} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-semibold text-lg">
                          {(otherParticipant?.name || chat.groupName || 'চ্যাট').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-bengali">
                        {otherParticipant?.name || chat.groupName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground text-bengali">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-bengali truncate">
                      {chat.lastMessage || "নতুন চ্যাট"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-bengali">কোন চ্যাট নেই</h3>
            <p className="text-muted-foreground text-bengali mb-4">
              নতুন চ্যাট শুরু করুন এবং কমিউনিটির সাথে যুক্ত হন
            </p>
            <Button 
              className="gap-2"
              onClick={() => setShowNewChatModal(true)}
            >
              <Plus size={16} />
              নতুন চ্যাট শুরু করুন
            </Button>
          </div>
        )}
      </main>

      <NewChatModal
        open={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUser={currentUser}
        users={users}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}