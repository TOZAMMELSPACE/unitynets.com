import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useChat, Chat } from '@/hooks/useChat';
import { usePresence } from '@/hooks/usePresence';
import { ChatList } from '@/components/messages/ChatList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { NewChatDialog } from '@/components/messages/NewChatDialog';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MessagesNew() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { chats, loading, getOrCreateDirectChat, createGroupChat } = useChat(currentUserId);
  usePresence(currentUserId);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleNewChat = () => {
    setIsGroupMode(false);
    setShowNewChatDialog(true);
  };

  const handleNewGroup = () => {
    setIsGroupMode(true);
    setShowNewChatDialog(true);
  };

  const handleCreateDirectChat = async (otherUserId: string) => {
    const chatId = await getOrCreateDirectChat(otherUserId);
    if (chatId) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setSelectedChat(chat);
      }
    }
  };

  const handleCreateGroupChat = async (name: string, memberIds: string[]) => {
    const chatId = await createGroupChat(name, memberIds);
    if (chatId) {
      // Refresh chats and select the new one
      setTimeout(() => {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          setSelectedChat(chat);
        }
      }, 500);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-bengali">মেসেজ দেখতে লগইন করুন</h2>
        <p className="text-muted-foreground text-bengali">
          আপনার কথোপকথন দেখতে এবং মেসেজ পাঠাতে লগইন করুন
        </p>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="wa h-[calc(100vh-8rem)]">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUserId={currentUserId}
            onBack={handleBack}
            onViewProfile={handleViewProfile}
          />
        ) : (
          <ChatList
            chats={chats}
            loading={loading}
            selectedChatId={null}
            currentUserId={currentUserId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onNewGroup={handleNewGroup}
          />
        )}

        <NewChatDialog
          open={showNewChatDialog}
          onClose={() => setShowNewChatDialog(false)}
          currentUserId={currentUserId}
          isGroupMode={isGroupMode}
          onCreateDirectChat={handleCreateDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="wa h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-[hsl(var(--wa-border))] bg-[hsl(var(--wa-sidebar))]">
      {/* Left sidebar - Chat list */}
      <div className="w-[350px] border-r border-border">
        <ChatList
          chats={chats}
          loading={loading}
          selectedChatId={selectedChat?.id || null}
          currentUserId={currentUserId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onNewGroup={handleNewGroup}
        />
      </div>

      {/* Right side - Chat window */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUserId={currentUserId}
            onBack={handleBack}
            onViewProfile={handleViewProfile}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-bengali">UnityNets মেসেজিং</h2>
            <p className="text-muted-foreground max-w-sm text-bengali">
              বাম দিক থেকে একটি চ্যাট নির্বাচন করুন অথবা নতুন কথোপকথন শুরু করুন
            </p>
          </div>
        )}
      </div>

      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        currentUserId={currentUserId}
        isGroupMode={isGroupMode}
        onCreateDirectChat={handleCreateDirectChat}
        onCreateGroupChat={handleCreateGroupChat}
      />
    </div>
  );
}
