import { useState, useRef, useEffect } from "react";
import "@/types/speech.d.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Search, 
  Clock,
  BarChart3,
  Award,
  Target,
  Flame,
  Code,
  Globe,
  Users,
  BookMarked,
  Play,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  GraduationCap,
  MessageCircle,
  Mic,
  MicOff,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
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

interface Course {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: number;
  icon: any;
  color: string;
}

interface Book {
  id: string;
  title: string;
  titleBn: string;
  author: string;
  authorBn: string;
  description: string;
  descriptionBn: string;
  chapters: number;
  category: string;
  link: string;
  coverColor: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learning-chat`;

const suggestedQuestions = [
  { text: "পাইথন প্রোগ্রামিং শিখতে চাই", icon: Code, color: "from-blue-500 to-cyan-500" },
  { text: "ওয়েব ডেভেলপমেন্ট কিভাবে শুরু করব?", icon: Globe, color: "from-purple-500 to-pink-500" },
  { text: "AI কিভাবে কাজ করে?", icon: Sparkles, color: "from-amber-500 to-orange-500" },
  { text: "ফ্রিল্যান্সিং শুরু করতে কি লাগে?", icon: Lightbulb, color: "from-green-500 to-emerald-500" },
];

const courses: Course[] = [
  {
    id: "python-basics",
    title: "Python Programming",
    titleBn: "পাইথন প্রোগ্রামিং",
    description: "Learn Python from scratch",
    descriptionBn: "শুরু থেকে পাইথন শিখুন",
    category: "programming",
    difficulty: "beginner",
    duration: "4 weeks",
    lessons: 20,
    icon: Code,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "javascript-web",
    title: "Web Development",
    titleBn: "ওয়েব ডেভেলপমেন্ট",
    description: "Build websites with JS",
    descriptionBn: "JS দিয়ে ওয়েবসাইট বানান",
    category: "programming",
    difficulty: "intermediate",
    duration: "6 weeks",
    lessons: 30,
    icon: Globe,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    titleBn: "ডিজিটাল সাক্ষরতা",
    description: "Essential digital skills",
    descriptionBn: "প্রয়োজনীয় ডিজিটাল দক্ষতা",
    category: "digital-skills",
    difficulty: "beginner",
    duration: "3 weeks",
    lessons: 15,
    icon: Award,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "community-civic",
    title: "Community Skills",
    titleBn: "কমিউনিটি দক্ষতা",
    description: "Civic education basics",
    descriptionBn: "নাগরিক শিক্ষা",
    category: "community",
    difficulty: "beginner",
    duration: "2 weeks",
    lessons: 10,
    icon: Users,
    color: "from-green-500 to-teal-500",
  },
];

const freeBooks: Book[] = [
  {
    id: "manush-na-monushyarupi",
    title: "মানুষ না মনুষ্যরূপী?",
    titleBn: "মানুষ না মনুষ্যরূপী?",
    author: "Md. Tozammel Haque",
    authorBn: "মোঃ তোজাম্মেল হক",
    description: "A sci-fi novel set in future New Earth City",
    descriptionBn: "ভবিষ্যতের নিউ আর্থ সিটিতে সেট করা একটি সাই-ফাই উপন্যাস",
    chapters: 12,
    category: "sci-fi",
    link: "https://sites.google.com/view/tozammelbook/home",
    coverColor: "from-indigo-600 via-purple-600 to-pink-600"
  }
];

export default function PublicLearningZone() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const STORAGE_KEY = "learning_chat_history";
  
  // Chat state - load from localStorage on init
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<typeof window.SpeechRecognition.prototype | null>(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD'; // Bengali language
      
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const streamChat = async (userMessages: Message[]) => {
    const apiMessages = userMessages.map(m => ({ role: m.role, content: m.content }));
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages }),
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

    // Build message content with file info
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
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      await streamChat([...messages, userMsg]);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: FileAttachment[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
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

        // Check file size (max 10MB)
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

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setAttachedFiles([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleEnroll = () => {
    toast({
      title: t("Sign in required", "সাইন ইন প্রয়োজন"),
      description: t("Please sign in to enroll in courses", "কোর্সে ভর্তি হতে সাইন ইন করুন"),
    });
    navigate('/auth?mode=signup');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Learning Zone - ফ্রি শেখার প্ল্যাটফর্ম | AI Learning Buddy"
        description="UnityNets Learning Zone - AI চ্যাটবট দিয়ে যেকোনো বিষয়ে শিখুন। বিনামূল্যে প্রোগ্রামিং, ডিজিটাল দক্ষতা কোর্স।"
        keywords="learning zone, AI chatbot, free courses, programming, Python, JavaScript, digital skills, বাংলা কোর্স"
        canonicalUrl="https://unitynets.com/learning-zone"
      />
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          
          {/* Hero Section with AI Chat */}
          <div className="max-w-4xl mx-auto mb-16">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-0">
                <Sparkles className="w-4 h-4 mr-2" />
                {t("AI-Powered Learning", "AI চালিত শিক্ষা")}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Learning Buddy
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t(
                  "Ask me anything - I'll help you learn step by step in Bengali!",
                  "যেকোনো প্রশ্ন করো — আমি বাংলায় ধাপে ধাপে শিখতে সাহায্য করব!"
                )}
              </p>
            </div>

            {/* Chat Interface */}
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Learning Buddy</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {t("Online - Ready to help", "অনলাইন - সাহায্যে আছি")}
                    </p>
                  </div>
                </div>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetChat} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("New Chat", "নতুন চ্যাট")}</span>
                  </Button>
                )}
              </div>

              {/* Chat Messages */}
              <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">
                      {t("Hello! 👋", "হ্যালো বন্ধু! 👋")}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md">
                      {t(
                        "I can help you learn about any topic. Ask me anything!",
                        "যেকোনো বিষয়ে শিখতে আমাকে জিজ্ঞাসা করো!"
                      )}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(q.text)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl",
                            "bg-muted/50 hover:bg-muted border border-border/50",
                            "text-left transition-all duration-200 hover:shadow-sm"
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                            q.color
                          )}>
                            <q.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm">{q.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex gap-3",
                          msg.role === "user" ? "flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-gradient-to-br from-primary/20 to-accent/20"
                        )}>
                          {msg.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        <div className={cn(
                          "flex-1 max-w-[85%]",
                          msg.role === "user" ? "flex flex-col items-end" : ""
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-3",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          )}>
                            {/* Display attached files */}
                            {msg.files && msg.files.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {msg.files.map((file, fileIdx) => (
                                  <a
                                    key={fileIdx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    {file.type.startsWith('image/') ? (
                                      <img
                                        src={file.url}
                                        alt={file.name}
                                        className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-2 bg-background/20 rounded-lg px-3 py-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                                      </div>
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                          
                          {msg.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 mt-1 text-xs text-muted-foreground"
                              onClick={() => copyToClipboard(msg.content, i)}
                            >
                              {copiedIndex === i ? (
                                <><Check className="h-3 w-3 mr-1" />{t("Copied", "কপি হয়েছে")}</>
                              ) : (
                                <><Copy className="h-3 w-3 mr-1" />{t("Copy", "কপি")}</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3">
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
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-background">
                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
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
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {/* File upload button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="h-11 w-11 shrink-0 rounded-xl"
                    title={t("Attach files", "ফাইল সংযুক্ত করুন")}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("Ask me anything...", "যেকোনো প্রশ্ন করো...")}
                      disabled={isLoading || isListening}
                      rows={1}
                      className="min-h-[44px] max-h-[120px] resize-none pr-12 rounded-xl border-border/50 focus:border-primary/50"
                    />
                  </div>
                  {speechSupported && (
                    <Button 
                      type="button"
                      size="icon"
                      variant={isListening ? "destructive" : "outline"}
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={cn(
                        "h-11 w-11 shrink-0 rounded-xl transition-all",
                        isListening && "animate-pulse"
                      )}
                      title={isListening ? t("Stop listening", "শোনা বন্ধ করুন") : t("Voice input", "ভয়েস ইনপুট")}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                    className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {t("Learning Buddy can make mistakes. Verify important info.", "Learning Buddy ভুল করতে পারে।")}
                </p>
              </div>
            </Card>
          </div>

          {/* Courses Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {t("Free Courses", "ফ্রি কোর্স")}
              </h2>
              <p className="text-muted-foreground">
                {t("Start learning with structured courses", "কাঠামোবদ্ধ কোর্স দিয়ে শেখা শুরু করুন")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                  <Card key={course.id} className="p-5 hover:shadow-lg transition-all group cursor-pointer" onClick={handleEnroll}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                      course.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {t(course.title, course.titleBn)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(course.description, course.descriptionBn)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.lessons} {t("lessons", "লেসন")}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" onClick={handleEnroll} className="gap-2">
                <GraduationCap className="w-4 h-4" />
                {t("View All Courses", "সব কোর্স দেখুন")}
              </Button>
            </div>
          </section>

          {/* Free Books Section */}
          <section className="mb-16">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">{t("Free Reading", "ফ্রি পড়া")}</h2>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{freeBooks[0].titleBn}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("by", "লেখক:")} {freeBooks[0].authorBn}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(freeBooks[0].description, freeBooks[0].descriptionBn)}
                  </p>
                  <a 
                    href={freeBooks[0].link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      {t("Read Now", "পড়ুন")}
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                </div>
                <div className={cn(
                  "w-32 h-44 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                  freeBooks[0].coverColor
                )}>
                  <BookOpen className="w-12 h-12 text-white/80" />
                </div>
              </div>
            </Card>
          </section>

          {/* Stats Section */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{courses.length}+</div>
                <div className="text-sm text-muted-foreground">{t("Free Courses", "ফ্রি কোর্স")}</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-accent">500+</div>
                <div className="text-sm text-muted-foreground">{t("Learners", "শিক্ষার্থী")}</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-muted-foreground">{t("AI Support", "AI সাপোর্ট")}</div>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-muted-foreground">{t("Free Forever", "চিরকাল ফ্রি")}</div>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="p-8 md:p-12 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("Ready to Start Learning?", "শেখা শুরু করতে প্রস্তুত?")}
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                {t(
                  "Join thousands of learners and start your journey today!",
                  "হাজারো শিক্ষার্থীদের সাথে আজই আপনার যাত্রা শুরু করুন!"
                )}
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate('/auth?mode=signup')}
                className="gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                {t("Join Now - It's Free", "এখনই জয়েন করুন - ফ্রি")}
              </Button>
            </Card>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
