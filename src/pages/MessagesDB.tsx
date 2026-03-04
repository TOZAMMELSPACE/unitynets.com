import { useState } from "react";
import { MessageCircle, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatInterfaceDB } from "@/components/ChatInterfaceDB";
import { NewChatModalDB } from "@/components/NewChatModalDB";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessagesDBProps {
  currentUserId: string | null;
}

export default function MessagesDB({ currentUserId }: MessagesDBProps) {
  const { t, language } = useLanguage();
  const { conversations, loading } = useMessages(currentUserId);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const name = conv.other_user?.full_name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp?: string | null) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const mins = Math.floor(diffInHours * 60);
      return language === 'bn' ? `${mins} মিনিট আগে` : `${mins} min ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return language === 'bn' ? `${hours} ঘন্টা আগে` : `${hours} hr ago`;
    } else {
      return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
    }
  };

  const handleChatCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  if (selectedConversation && currentUserId) {
    return (
      <ChatInterfaceDB
        conversation={selectedConversation}
        currentUserId={currentUserId}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  if (!currentUserId) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("Please Login", "লগইন করুন")}</h3>
        <p className="text-muted-foreground">
          {t("Login to view messages", "মেসেজ দেখতে লগইন করুন")}
        </p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("Chats", "চ্যাট")}</h2>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setShowNewChatModal(true)}
          >
            <Plus size={16} />
            {t("New Chat", "নতুন চ্যাট")}
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t("Search chats...", "চ্যাট খুঁজুন...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("Loading...", "লোড হচ্ছে...")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="card-enhanced p-4 hover:bg-muted/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {conv.other_user?.avatar_url ? (
                      <img 
                        src={conv.other_user.avatar_url} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold text-lg">
                        {(conv.other_user?.full_name || t('Chat', 'চ্যাট')).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">
                      {conv.other_user?.full_name || t('User', 'ব্যবহারকারী')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.last_message_at)}
                      </span>
                      {(conv.unread_count || 0) > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message || t("New chat", "নতুন চ্যাট")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredConversations.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("No chats", "কোন চ্যাট নেই")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("Start a new chat and connect with the community", "নতুন চ্যাট শুরু করুন এবং কমিউনিটির সাথে যুক্ত হন")}
          </p>
          <Button 
            className="gap-2"
            onClick={() => setShowNewChatModal(true)}
          >
            <Plus size={16} />
            {t("Start New Chat", "নতুন চ্যাট শুরু করুন")}
          </Button>
        </div>
      )}

      <NewChatModalDB
        open={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUserId={currentUserId}
        onChatCreated={handleChatCreated}
      />
    </main>
  );
}