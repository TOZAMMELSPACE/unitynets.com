import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Image, MoreVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMessages, Message, Conversation } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceDBProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}

export const ChatInterfaceDB = ({ conversation, currentUserId, onBack }: ChatInterfaceDBProps) => {
  const { messages, fetchMessages, sendMessage, setMessages } = useMessages(currentUserId);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUserId = conversation.participant_1 === currentUserId 
    ? conversation.participant_2 
    : conversation.participant_1;

  useEffect(() => {
    fetchMessages(otherUserId);
  }, [otherUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages for this conversation
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${otherUserId}`
        },
        (payload) => {
          if (payload.new.receiver_id === currentUserId) {
            setMessages((prev: Message[]) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, otherUserId, currentUserId, setMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = await sendMessage(otherUserId, newMessage.trim());
    if (message) {
      setMessages((prev: Message[]) => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    
    // Convert to base64 for now (ideally use Supabase Storage)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const message = await sendMessage(otherUserId, '', imageUrl);
      if (message) {
        setMessages((prev: Message[]) => [...prev, message]);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('bn-BD', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            {conversation.other_user?.avatar_url ? (
              <img 
                src={conversation.other_user.avatar_url} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold">
                {(conversation.other_user?.full_name || 'চ্যাট').charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-bengali">
              {conversation.other_user?.full_name || 'ব্যবহারকারী'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? "টাইপ করছে..." : "অনলাইন"}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="icon">
          <MoreVertical size={20} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.image_url && (
                <img 
                  src={message.image_url} 
                  alt="Shared image" 
                  className="max-w-full h-auto rounded mb-2"
                />
              )}
              
              {message.content && (
                <p className="text-bengali">{message.content}</p>
              )}
              
              <p className={`text-xs mt-1 ${
                message.sender_id === currentUserId 
                  ? 'text-primary-foreground/70' 
                  : 'text-muted-foreground'
              }`}>
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="ছবি পাঠান"
          >
            <Image size={20} />
          </Button>

          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="মেসেজ লিখুন..."
              className="min-h-[40px] max-h-32 resize-none text-bengali"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>

          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || uploading}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
