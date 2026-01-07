import { useState, useRef, useEffect } from "react";
import "@/types/speech.d.ts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Search,
  Code,
  Globe,
  GraduationCap,
  Menu
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";

interface FileAttachment {
  name: string;
  url: string;
  type: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  files?: FileAttachment[];
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learning-chat`;

const suggestedQuestions = [
  { text: "পাইথন প্রোগ্রামিং শিখতে চাই", icon: Code, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { text: "ওয়েব ডেভেলপমেন্ট কিভাবে শুরু করব?", icon: Globe, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { text: "AI কিভাবে কাজ করে?", icon: Sparkles, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { text: "ফ্রিল্যান্সিং শুরু করতে কি লাগে?", icon: Lightbulb, color: "bg-green-500/10 text-green-600 dark:text-green-400" },
];

export default function PublicLearningZone() {
  const { t } = useLanguage();
  
  const STORAGE_KEY = "learning_chat_history";
  const CURRENT_SESSION_KEY = "current_session_id";
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  
  // Sessions state
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<typeof window.SpeechRecognition.prototype | null>(null);

  // Check for Web Speech API support
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsSupported(true);
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: t("Microphone Access Required", "মাইক্রোফোন অ্যাক্সেস প্রয়োজন"),
            description: t("Please allow microphone access to use voice input", "ভয়েস ইনপুট ব্যবহার করতে মাইক্রোফোন অ্যাক্সেস দিন"),
            variant: "destructive"
          });
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [t]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const speakText = (text: string, index: number) => {
    if (!ttsSupported) return;
    
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const bengaliVoice = voices.find(voice => 
      voice.lang.startsWith('bn') || voice.lang.includes('Bengali')
    );
    if (bengaliVoice) {
      utterance.voice = bengaliVoice;
    }
    
    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    
    window.speechSynthesis.speak(utterance);
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Load sessions on mount
  useEffect(() => {
    loadSavedSessions();
  }, []);

  const getDeviceFingerprint = () => {
    const nav = window.navigator;
    const screen = window.screen;
    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    return btoa(fingerprint).slice(0, 32);
  };

  const loadSavedSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const fingerprint = getDeviceFingerprint();
      const { data, error } = await supabase
        .from('learning_chat_sessions')
        .select('*')
        .eq('device_fingerprint', fingerprint)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      const sessions = (data || []).map(d => ({
        id: d.id,
        title: d.title,
        created_at: d.created_at,
        messages: d.messages as unknown as Message[]
      }));
      setSavedSessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const streamChat = async (userMessages: Message[], imageUrls?: string[]) => {
    const apiMessages = userMessages.map(m => ({ role: m.role, content: m.content }));
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages, imageUrls }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date().toISOString() }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string, files?: FileAttachment[]) => {
    if ((!text.trim() && (!files || files.length === 0)) || isLoading) return;

    let messageContent = text.trim();
    if (files && files.length > 0) {
      const fileDescriptions = files.map(f => {
        if (f.type.startsWith('image/')) {
          return `[ছবি আপলোড করা হয়েছে: ${f.name}]`;
        } else if (f.type === 'application/pdf') {
          return `[PDF ফাইল আপলোড করা হয়েছে: ${f.name}]`;
        } else if (f.type.includes('word') || f.type.includes('document')) {
          return `[Word ডকুমেন্ট আপলোড করা হয়েছে: ${f.name}]`;
        }
        return `[ফাইল আপলোড করা হয়েছে: ${f.name}]`;
      }).join('\n');
      messageContent = messageContent ? `${messageContent}\n\n${fileDescriptions}` : fileDescriptions;
    }

    const userMsg: Message = { 
      role: "user", 
      content: messageContent, 
      timestamp: new Date().toISOString(),
      files: files
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    // Auto-save session after first message
    if (messages.length === 0) {
      autoSaveSession(newMessages, messageContent);
    }

    try {
      const imageUrls = files?.filter(f => f.type.startsWith('image/')).map(f => f.url);
      await streamChat(newMessages, imageUrls && imageUrls.length > 0 ? imageUrls : undefined);
      
      // Update session after response
      if (currentSessionId) {
        updateSessionMessages();
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: error instanceof Error ? error.message : "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveSession = async (msgs: Message[], firstMessage: string) => {
    try {
      const fingerprint = getDeviceFingerprint();
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');

      const { data, error } = await supabase
        .from('learning_chat_sessions')
        .insert([{
          title,
          messages: JSON.parse(JSON.stringify(msgs)),
          device_fingerprint: fingerprint
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSessionId(data.id);
      loadSavedSessions();
    } catch (error) {
      console.error('Error auto-saving session:', error);
    }
  };

  const updateSessionMessages = async () => {
    if (!currentSessionId) return;
    
    try {
      const currentMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      await supabase
        .from('learning_chat_sessions')
        .update({ 
          messages: currentMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSessionId);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: FileAttachment[] = [];

    try {
      for (const file of Array.from(files)) {
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: t("Invalid file type", "অবৈধ ফাইল টাইপ"),
            description: t("Only images, PDF and Word files are allowed", "শুধুমাত্র ছবি, PDF এবং Word ফাইল অনুমোদিত"),
            variant: "destructive"
          });
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: t("File too large", "ফাইল অনেক বড়"),
            description: t("Maximum file size is 10MB", "সর্বোচ্চ ফাইল সাইজ ১০MB"),
            variant: "destructive"
          });
          continue;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('learning-chat-files')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: t("Upload failed", "আপলোড ব্যর্থ"),
            description: error.message,
            variant: "destructive"
          });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('learning-chat-files')
          .getPublicUrl(data.path);

        newFiles.push({
          name: file.name,
          url: urlData.publicUrl,
          type: file.type
        });
      }

      if (newFiles.length > 0) {
        setAttachedFiles(prev => [...prev, ...newFiles]);
        toast({
          title: t("Files attached", "ফাইল সংযুক্ত হয়েছে"),
          description: t(`${newFiles.length} file(s) ready to send`, `${newFiles.length}টি ফাইল পাঠানোর জন্য প্রস্তুত`)
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: t("Upload error", "আপলোড এরর"),
        description: t("Something went wrong", "কিছু সমস্যা হয়েছে"),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, attachedFiles.length > 0 ? attachedFiles : undefined);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setAttachedFiles([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
    setSidebarMobileOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session.messages));
    setSidebarMobileOpen(false);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('learning_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        startNewChat();
      }
      
      toast({
        title: t("Deleted", "ডিলিট হয়েছে"),
        description: t("Session deleted successfully", "সেশন সফলভাবে ডিলিট হয়েছে"),
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: t("Error", "ত্রুটি"),
        description: t("Failed to delete session", "সেশন ডিলিট করতে ব্যর্থ"),
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const filteredSessions = savedSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = new Date(session.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = t("Today", "আজ");
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = t("Yesterday", "গতকাল");
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groupKey = t("Previous 7 Days", "গত ৭ দিন");
    } else {
      groupKey = t("Older", "আগের");
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-border/50">
        <Button
          onClick={startNewChat}
          variant="outline"
          className="w-full justify-start gap-2 h-10"
        >
          <Plus className="h-4 w-4" />
          {t("New chat", "নতুন চ্যাট")}
        </Button>
      </div>
      
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Search chats...", "চ্যাট খুঁজুন...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      
      {/* Sessions List */}
      <ScrollArea className="flex-1 px-2">
        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? t("No chats found", "কোনো চ্যাট পাওয়া যায়নি")
                : t("No chat history", "চ্যাট হিস্ট্রি নেই")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {Object.entries(groupedSessions).map(([group, sessions]) => (
              <div key={group}>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={cn(
                        "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                        currentSessionId === session.id 
                          ? "bg-muted" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm truncate">{session.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => deleteSession(session.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Learning Buddy</p>
            <p className="text-xs text-muted-foreground">{t("Free", "ফ্রি")}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <SEOHead
        title="Learning Buddy - AI শেখার সঙ্গী | UnityNets"
        description="AI চ্যাটবট দিয়ে যেকোনো বিষয়ে বাংলায় শিখুন। প্রোগ্রামিং, ডিজিটাল দক্ষতা, ফ্রিল্যান্সিং।"
        keywords="AI chatbot, learning, programming, Python, JavaScript, digital skills, বাংলা, শেখা"
        canonicalUrl="https://unitynets.com/learning-zone"
      />
      
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex flex-col border-r border-border/50 bg-muted/30 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <SidebarContent />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border/50 transform transition-transform duration-300 md:hidden",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setSidebarMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
            
            <h1 className="text-lg font-semibold">Learning Buddy</h1>
          </div>
          
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={startNewChat} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">{t("New Chat", "নতুন চ্যাট")}</span>
            </Button>
          )}
        </header>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="max-w-2xl w-full text-center">
                <h2 className="text-3xl md:text-4xl font-semibold mb-8">
                  {t("What can I help with?", "কিভাবে সাহায্য করতে পারি?")}
                </h2>
                
                {/* Input Box */}
                <div className="relative mb-6">
                  <div className="bg-muted/50 rounded-2xl border border-border/50 p-2">
                    {/* Attached files preview */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 px-2">
                        {attachedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-background rounded-lg px-2 py-1 text-xs">
                            {getFileIcon(file.type)}
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachedFile(idx)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-end gap-2">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      {/* Attach button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploading}
                        className="h-10 w-10 shrink-0 rounded-xl"
                      >
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Paperclip className="h-5 w-5" />
                        )}
                      </Button>
                      
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("Ask anything", "যেকোনো প্রশ্ন করো")}
                        disabled={isLoading || isListening}
                        rows={1}
                        className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                      />
                      
                      {speechSupported && (
                        <Button
                          type="button"
                          size="icon"
                          variant={isListening ? "destructive" : "ghost"}
                          onClick={toggleListening}
                          disabled={isLoading}
                          className={cn(
                            "h-10 w-10 shrink-0 rounded-xl",
                            isListening && "animate-pulse"
                          )}
                        >
                          {isListening ? (
                            <MicOff className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => sendMessage(input, attachedFiles.length > 0 ? attachedFiles : undefined)}
                        disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                        className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                  {suggestedQuestions.map((q, i) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.text)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl text-left",
                          "bg-muted/50 hover:bg-muted border border-border/30",
                          "transition-all duration-200 hover:shadow-sm"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg", q.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{q.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <ScrollArea className="h-full" ref={scrollRef}>
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-4", msg.role === "user" && "flex-row-reverse")}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user" 
                        ? "bg-primary" 
                        : "bg-gradient-to-br from-primary/20 to-accent/20"
                    )}>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <div className={cn("flex-1 space-y-2", msg.role === "user" && "flex flex-col items-end")}>
                      {/* File attachments */}
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {msg.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-xs">
                              {file.type.startsWith('image/') ? (
                                <img 
                                  src={file.url} 
                                  alt={file.name} 
                                  className="h-16 w-16 object-cover rounded"
                                />
                              ) : (
                                <>
                                  {getFileIcon(file.type)}
                                  <span>{file.name}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className={cn(
                        "rounded-2xl px-4 py-3 max-w-[85%]",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({ className, children, ...props }) => {
                                  const isInline = !className;
                                  if (isInline) {
                                    return (
                                      <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <pre className="bg-muted-foreground/10 rounded-lg p-3 overflow-x-auto my-2">
                                      <code className={cn("text-xs font-mono", className)} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                },
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ children, href }) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                                    {children}
                                  </a>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full border-collapse text-xs">{children}</table>
                                  </div>
                                ),
                                th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted font-semibold">{children}</th>,
                                td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                      </div>
                      
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground"
                            onClick={() => copyToClipboard(msg.content, i)}
                          >
                            {copiedIndex === i ? (
                              <><Check className="h-3 w-3 mr-1" />{t("Copied", "কপি হয়েছে")}</>
                            ) : (
                              <><Copy className="h-3 w-3 mr-1" />{t("Copy", "কপি")}</>
                            )}
                          </Button>
                          {ttsSupported && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 px-2 text-xs",
                                speakingIndex === i ? "text-primary" : "text-muted-foreground"
                              )}
                              onClick={() => speakText(msg.content, i)}
                            >
                              {speakingIndex === i ? (
                                <><VolumeX className="h-3 w-3 mr-1" />{t("Stop", "থামাও")}</>
                              ) : (
                                <><Volume2 className="h-3 w-3 mr-1" />{t("Listen", "শুনুন")}</>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {t("Thinking...", "ভাবছি...")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {/* Input Area (when messages exist) */}
        {messages.length > 0 && (
          <div className="border-t border-border/50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-muted/50 rounded-2xl border border-border/50 p-2">
                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 px-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-background rounded-lg px-2 py-1 text-xs">
                        {getFileIcon(file.type)}
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachedFile(idx)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input, attachedFiles.length > 0 ? attachedFiles : undefined);
                  }}
                  className="flex items-end gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="h-10 w-10 shrink-0 rounded-xl"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("Message Learning Buddy...", "Learning Buddy কে মেসেজ করো...")}
                    disabled={isLoading || isListening}
                    rows={1}
                    className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  
                  {speechSupported && (
                    <Button
                      type="button"
                      size="icon"
                      variant={isListening ? "destructive" : "ghost"}
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-xl",
                        isListening && "animate-pulse"
                      )}
                    >
                      {isListening ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    size="icon"
                    disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                    className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {t("Learning Buddy can make mistakes. Verify important info.", "Learning Buddy ভুল করতে পারে।")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
