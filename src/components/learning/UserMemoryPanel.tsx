import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Target, 
  BookOpen, 
  Trophy, 
  Plus, 
  X, 
  Loader2,
  Sparkles,
  Heart
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface UserMemory {
  id?: string;
  goals: Array<{ text: string; status?: string; created_at?: string }>;
  learning_interests: string[];
  accomplishments: Array<{ text: string; created_at?: string }>;
  personality_notes?: string;
  last_mood?: string;
  preferences?: Record<string, any>;
}

interface UserMemoryPanelProps {
  userId?: string;
  deviceFingerprint: string;
  isOpen: boolean;
  onClose: () => void;
}

const MEMORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function UserMemoryPanel({ userId, deviceFingerprint, isOpen, onClose }: UserMemoryPanelProps) {
  const { t } = useLanguage();
  const [memory, setMemory] = useState<UserMemory>({
    goals: [],
    learning_interests: [],
    accomplishments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newAccomplishment, setNewAccomplishment] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMemory();
    }
  }, [isOpen, userId, deviceFingerprint]);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${MEMORY_URL}/get-learning-memory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          userId,
          deviceFingerprint
        }),
      });
      
      if (resp.ok) {
        const data = await resp.json();
        if (data.memory) {
          setMemory({
            goals: data.memory.goals || [],
            learning_interests: data.memory.learning_interests || [],
            accomplishments: data.memory.accomplishments || [],
            personality_notes: data.memory.personality_notes,
            last_mood: data.memory.last_mood,
            preferences: data.memory.preferences
          });
        }
      }
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemory = async (updates: Partial<UserMemory>) => {
    try {
      const resp = await fetch(`${MEMORY_URL}/update-learning-memory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          userId,
          deviceFingerprint,
          updates
        }),
      });
      
      if (resp.ok) {
        await fetchMemory();
        toast({
          title: t("Updated!", "আপডেট হয়েছে!"),
          description: t("Your memory has been saved", "তোমার তথ্য সেভ হয়ে গেছে"),
        });
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        title: t("Error", "ত্রুটি"),
        description: t("Failed to update memory", "আপডেট করতে সমস্যা হয়েছে"),
        variant: "destructive"
      });
    }
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    updateMemory({
      goals: [{ text: newGoal, status: 'active', created_at: new Date().toISOString() }]
    });
    setNewGoal("");
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    updateMemory({
      learning_interests: [newInterest]
    });
    setNewInterest("");
  };

  const addAccomplishment = () => {
    if (!newAccomplishment.trim()) return;
    updateMemory({
      accomplishments: [{ text: newAccomplishment, created_at: new Date().toISOString() }]
    });
    setNewAccomplishment("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">
              {t("My Learning Memory", "আমার লার্নিং মেমোরি")}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Goals Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="w-4 h-4 text-green-500" />
                  {t("My Goals", "আমার গোল")}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder={t("Add a new goal...", "নতুন গোল যোগ করো...")}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={addGoal}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {memory.goals.map((goal, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        goal.status === 'completed' 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                          : "bg-muted"
                      )}
                    >
                      <span className="mr-2">{goal.status === 'completed' ? '✅' : '🎯'}</span>
                      {goal.text}
                    </div>
                  ))}
                  {memory.goals.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("No goals yet. Add your first goal!", "এখনো কোনো গোল নেই। তোমার প্রথম গোল যোগ করো!")}
                    </p>
                  )}
                </div>
              </div>

              {/* Learning Interests Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  {t("Learning Interests", "শেখার আগ্রহ")}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder={t("Add a topic you're learning...", "যা শিখছো তা যোগ করো...")}
                    onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={addInterest}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {memory.learning_interests.map((interest, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                    >
                      📚 {interest}
                    </span>
                  ))}
                  {memory.learning_interests.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("No interests added yet", "এখনো কোনো আগ্রহ যোগ হয়নি")}
                    </p>
                  )}
                </div>
              </div>

              {/* Accomplishments Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {t("Accomplishments", "সাফল্য")}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAccomplishment}
                    onChange={(e) => setNewAccomplishment(e.target.value)}
                    placeholder={t("Celebrate an achievement...", "একটা সাফল্য উদযাপন করো...")}
                    onKeyDown={(e) => e.key === 'Enter' && addAccomplishment()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={addAccomplishment}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {memory.accomplishments.slice(-10).reverse().map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-yellow-500/10 text-sm">
                      <span className="mr-2">🏆</span>
                      {item.text}
                    </div>
                  ))}
                  {memory.accomplishments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("No accomplishments yet. You'll get there!", "এখনো কোনো সাফল্য নেই। তুমি পারবে!")}
                    </p>
                  )}
                </div>
              </div>

              {/* Mood Tracking Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Heart className="w-4 h-4 text-pink-500" />
                  {t("Mood Tracking", "মুড ট্র্যাকিং")}
                  <span className="px-2 py-0.5 bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-full text-xs">
                    {t("Auto-detected", "অটো-ডিটেক্টেড")}
                  </span>
                </div>
                
                {memory.last_mood ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {memory.last_mood.includes('😊') ? '😊' : 
                         memory.last_mood.includes('🔥') ? '🔥' :
                         memory.last_mood.includes('😟') ? '😟' :
                         memory.last_mood.includes('😴') ? '😴' :
                         memory.last_mood.includes('😢') ? '😢' :
                         memory.last_mood.includes('😤') ? '😤' :
                         memory.last_mood.includes('😑') ? '😑' :
                         memory.last_mood.includes('🤔') ? '🤔' :
                         memory.last_mood.includes('🌟') ? '🌟' :
                         memory.last_mood.includes('😰') ? '😰' :
                         memory.last_mood.includes('🏆') ? '🏆' :
                         memory.last_mood.includes('🙏') ? '🙏' : '💭'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {memory.last_mood}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t(
                            "Detected from your recent conversation",
                            "তোমার সাম্প্রতিক কথোপকথন থেকে ডিটেক্ট করা হয়েছে"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/50 border border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl opacity-50">💭</div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "No mood detected yet. Chat with Learning Buddy and I'll understand how you're feeling!",
                            "এখনো কোনো মুড ডিটেক্ট হয়নি। Learning Buddy এর সাথে কথা বলো, আমি বুঝে নেব তুমি কেমন আছো!"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t(
                      "AI automatically detects your mood from conversation and adjusts responses accordingly",
                      "AI তোমার কথোপকথন থেকে স্বয়ংক্রিয়ভাবে মুড বুঝে নেয় এবং সে অনুযায়ী উত্তর দেয়"
                    )}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      {t("How Memory Works", "মেমোরি কিভাবে কাজ করে")}
                    </p>
                    <p className="text-muted-foreground">
                      {t(
                        "Learning Buddy remembers your goals, interests, and achievements to give you personalized help. The AI uses this context in every conversation!",
                        "Learning Buddy তোমার গোল, আগ্রহ এবং সাফল্যগুলো মনে রাখে যাতে তোমাকে পার্সোনালাইজড সাহায্য করতে পারে। AI প্রতিটা কথোপকথনে এই context ব্যবহার করে!"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
