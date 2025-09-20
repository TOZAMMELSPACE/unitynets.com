import { useState, useEffect } from "react";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LearningZoneProps {
  user: User | null;
}

export const LearningZone = ({ user }: LearningZoneProps) => {
  const [progress, setProgress] = useState(0);
  const [currentTopic, setCurrentTopic] = useState("Python Basics");
  
  const topics = [
    "Python Basics",
    "Web Development", 
    "Data Science",
    "Mobile Apps",
    "Digital Marketing"
  ];

  useEffect(() => {
    if (user) {
      const key = `lp_${user.id}`;
      const savedProgress = parseInt(localStorage.getItem(key) || '0', 10);
      setProgress(savedProgress);
    }
  }, [user]);

  const advanceLesson = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your learning progress",
        variant: "destructive"
      });
      return;
    }

    const newProgress = Math.min(100, progress + 20);
    setProgress(newProgress);
    
    const key = `lp_${user.id}`;
    localStorage.setItem(key, String(newProgress));
    
    if (newProgress === 100) {
      toast({
        title: "🎉 Congratulations!",
        description: `You've completed ${currentTopic}! Keep learning!`,
      });
      
      // Reset progress and move to next topic
      setTimeout(() => {
        const currentIndex = topics.indexOf(currentTopic);
        const nextTopic = topics[(currentIndex + 1) % topics.length];
        setCurrentTopic(nextTopic);
        setProgress(0);
        localStorage.setItem(key, '0');
      }, 2000);
    } else {
      toast({
        title: "Great progress!",
        description: `${newProgress}% completed in ${currentTopic}`,
      });
    }
  };

  const getProgressColor = () => {
    if (progress >= 80) return "bg-accent";
    if (progress >= 60) return "bg-warning";
    if (progress >= 40) return "bg-primary";
    return "bg-muted-foreground";
  };

  return (
    <div className="card-enhanced p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          AI Learning Zone
        </h3>
        {progress === 100 && (
          <Trophy className="w-6 h-6 text-warning animate-bounce" />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground text-bengali">
              Current Topic: <span className="font-medium text-card-foreground">{currentTopic}</span>
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
          
          <Progress 
            value={progress} 
            className="h-3 mb-3"
          />
          
          <p className="text-xs text-muted-foreground mb-4">
            Progress: {progress}% • {Math.floor(progress / 20)} lessons completed
          </p>
        </div>

        <Button 
          onClick={advanceLesson}
          disabled={progress === 100}
          className="w-full btn-hero"
        >
          {progress === 100 ? "Topic Completed! 🎉" : "Continue Learning"}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center text-bengali">
          {user ? "Progress automatically saved" : "(সেভ করতে সাইন-ইন করুন)"}
        </p>
      </div>
    </div>
  );
};