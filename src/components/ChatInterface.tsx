import { useState, useEffect, useRef } from "react";
import { Chat, Message, User, STORAGE, load, save } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Image, Smile, MoreVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInterfaceProps {
  chat: Chat;
  currentUser: User;
  onBack: () => void;
  users: User[];
}

export const ChatInterface = ({ chat, currentUser, onBack, users }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherParticipant = users.find(u => 
    chat.participants.find(p => p !== currentUser.id && p === u.id)
  );

  useEffect(() => {
    const allMessages = load<Message[]>(STORAGE.MESSAGES, []);
    const chatMessages = allMessages.filter(m => m.chatId === chat.id);
    setMessages(chatMessages);

    // Mark messages as read
    const updatedMessages = allMessages.map(m => 
      m.chatId === chat.id && m.senderId !== currentUser.id 
        ? { ...m, isRead: true }
        : m
    );
    save(STORAGE.MESSAGES, updatedMessages);

    // Update chat unread count
    const chats = load<Chat[]>(STORAGE.CHATS, []);
    const updatedChats = chats.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    );
    save(STORAGE.CHATS, updatedChats);
  }, [chat.id, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      chatId: chat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Save message
    const allMessages = load<Message[]>(STORAGE.MESSAGES, []);
    const updatedMessages = [...allMessages, message];
    save(STORAGE.MESSAGES, updatedMessages);
    setMessages(prev => [...prev, message]);

    // Update chat
    const chats = load<Chat[]>(STORAGE.CHATS, []);
    const updatedChats = chats.map(c => 
      c.id === chat.id 
        ? { 
            ...c, 
            lastMessage: newMessage.trim(),
            lastMessageTime: new Date().toISOString(),
            unreadCount: c.participants.filter(p => p !== currentUser.id).length
          }
        : c
    );
    save(STORAGE.CHATS, updatedChats);

    setNewMessage("");

    // Simulate auto reply after 2 seconds
    if (otherParticipant) {
      setTimeout(() => {
        const autoReply: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          chatId: chat.id,
          senderId: otherParticipant.id,
          senderName: otherParticipant.name,
          content: getAutoReply(newMessage.trim()),
          type: 'text',
          createdAt: new Date().toISOString(),
          isRead: false
        };

        const allMessages = load<Message[]>(STORAGE.MESSAGES, []);
        const updatedMessages = [...allMessages, autoReply];
        save(STORAGE.MESSAGES, updatedMessages);
        setMessages(prev => [...prev, autoReply]);

        const chats = load<Chat[]>(STORAGE.CHATS, []);
        const updatedChats = chats.map(c => 
          c.id === chat.id 
            ? { 
                ...c, 
                lastMessage: autoReply.content,
                lastMessageTime: autoReply.createdAt,
              }
            : c
        );
        save(STORAGE.CHATS, updatedChats);
      }, 2000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const message: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        chatId: chat.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: `ফাইল পাঠানো হয়েছে: ${file.name}`,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: e.target?.result as string,
        fileName: file.name,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      const allMessages = load<Message[]>(STORAGE.MESSAGES, []);
      const updatedMessages = [...allMessages, message];
      save(STORAGE.MESSAGES, updatedMessages);
      setMessages(prev => [...prev, message]);
    };
    reader.readAsDataURL(file);
  };

  const getAutoReply = (message: string): string => {
    const bengaliReplies = [
      "ধন্যবাদ! আমি বুঝতে পেরেছি।",
      "অবশ্যই! আমি এটি নিয়ে কাজ করব।",
      "খুবই ভালো প্রস্তাব। চলুন এগিয়ে যাই।",
      "আপনার সাথে কাজ করতে খুশি লাগছে।",
      "এটি দারুণ আইডিয়া! আরো জানান।"
    ];
    
    return bengaliReplies[Math.floor(Math.random() * bengaliReplies.length)];
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
            {otherParticipant?.profileImage ? (
              <img 
                src={otherParticipant.profileImage} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold">
                {(otherParticipant?.name || chat.groupName || 'চ্যাট').charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-bengali">
              {otherParticipant?.name || chat.groupName}
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
            className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.senderId === currentUser.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.type === 'image' && message.fileUrl && (
                <img 
                  src={message.fileUrl} 
                  alt="Shared image" 
                  className="max-w-full h-auto rounded mb-2"
                />
              )}
              
              {message.type === 'file' && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-background/10 rounded">
                  <Paperclip size={16} />
                  <span className="text-sm">{message.fileName}</span>
                </div>
              )}
              
              <p className="text-bengali">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === currentUser.id 
                  ? 'text-primary-foreground/70' 
                  : 'text-muted-foreground'
              }`}>
                {formatTime(message.createdAt)}
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
            onChange={handleFileUpload}
            accept="image/*,application/pdf,.doc,.docx"
            className="hidden"
          />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
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

          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};