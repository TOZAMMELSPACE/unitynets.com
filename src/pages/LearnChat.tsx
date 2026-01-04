import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  BookOpen,
  Lightbulb,
  Code,
  Globe,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learning-chat`;

const suggestedQuestions = [
  { 
    text: "পাইথন প্রোগ্রামিং শিখতে চাই", 
    icon: Code,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    text: "ওয়েব ডেভেলপমেন্ট কিভাবে শুরু করব?", 
    icon: Globe,
    color: "from-purple-500 to-pink-500"
  },
  { 
    text: "AI ও মেশিন লার্নিং বুঝতে চাই", 
    icon: Sparkles,
    color: "from-amber-500 to-orange-500"
  },
  { 
    text: "ইংরেজি শেখার সহজ উপায়", 
    icon: BookOpen,
    color: "from-green-500 to-emerald-500"
  },
  { 
    text: "ফ্রিল্যান্সিং শুরু করতে কি লাগে?", 
    icon: Lightbulb,
    color: "from-rose-500 to-red-500"
  },
  { 
    text: "অনলাইনে নিরাপদ থাকার টিপস", 
    icon: Globe,
    color: "from-teal-500 to-cyan-500"
  },
];

export default function LearnChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
              return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
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
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Learning Buddy - AI শিক্ষা সহায়ক | UnityNets"
        description="Learning Buddy এর সাথে যেকোনো বিষয়ে শিখুন। ফ্রি AI-powered শিক্ষা সহায়ক বাংলায়।"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/learning-zone">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Learning Buddy</h1>
                <p className="text-xs text-muted-foreground">{t("Always here to help", "সবসময় সাহায্যে আছি")}</p>
              </div>
            </div>
          </div>
          
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetChat} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">{t("New Chat", "নতুন চ্যাট")}</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-8rem)]" ref={scrollRef}>
          <div className="container max-w-4xl px-4 py-6">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center animate-pulse">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-background" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {t("Hello! I'm Learning Buddy", "হ্যালো বন্ধু! 👋")}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                  {t(
                    "Ask me anything - I'll help you learn step by step!",
                    "যেকোনো বিষয়ে প্রশ্ন করো — আমি ধাপে ধাপে শিখতে সাহায্য করব!"
                  )}
                </p>

                <div className="w-full max-w-2xl">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Try asking:", "জিজ্ঞাসা করে দেখো:")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.text)}
                        className={cn(
                          "group relative flex items-center gap-3 p-4 rounded-xl",
                          "bg-card border border-border/50 hover:border-primary/30",
                          "text-left transition-all duration-200",
                          "hover:shadow-md hover:-translate-y-0.5"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                          q.color
                        )}>
                          <q.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {q.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6 pb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-4",
                      msg.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    {/* Avatar */}
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

                    {/* Message Content */}
                    <div className={cn(
                      "flex-1 max-w-[85%] md:max-w-[75%]",
                      msg.role === "user" ? "flex flex-col items-end" : ""
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      
                      {/* Actions for assistant messages */}
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(msg.content, i)}
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                {t("Copied", "কপি হয়েছে")}
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                {t("Copy", "কপি")}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
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
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="container max-w-4xl mx-auto"
        >
          <div className="relative flex items-end gap-2 bg-muted/50 rounded-2xl border border-border/50 focus-within:border-primary/50 transition-colors p-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("Ask me anything...", "যেকোনো প্রশ্ন করো...")}
              disabled={isLoading}
              rows={1}
              className="flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-3 px-2"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {t(
              "Learning Buddy can make mistakes. Please verify important info.",
              "Learning Buddy ভুল করতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করে নাও।"
            )}
          </p>
        </form>
      </footer>
    </div>
  );
}
