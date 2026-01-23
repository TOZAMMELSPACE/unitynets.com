import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface LearningProgress {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  progress_percentage: number;
  lessons_completed: number;
  total_lessons: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_topic: string;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  xp_earned: number;
  created_at: string;
}

export interface LearningStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  quizzes_completed: number;
  courses_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useLearningProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all learning data
  const fetchLearningData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [progressRes, quizRes, statsRes] = await Promise.all([
        supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('learning_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (progressRes.data) setProgress(progressRes.data);
      if (quizRes.data) setQuizResults(quizRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, [user]);

  // Initialize or get user stats
  const ensureStats = async (): Promise<LearningStats | null> => {
    if (!user) return null;

    if (stats) return stats;

    const { data, error } = await supabase
      .from('learning_stats')
      .upsert({
        user_id: user.id,
        total_xp: 0,
        current_level: 1,
        quizzes_completed: 0,
        courses_completed: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (data) {
      setStats(data);
      return data;
    }
    return null;
  };

  // Update course progress
  const updateCourseProgress = async (
    courseId: string,
    courseTitle: string,
    lessonsCompleted: number,
    totalLessons: number
  ) => {
    if (!user) {
      toast({
        title: "সাইন ইন করুন",
        description: "Progress সেভ করতে লগইন করুন",
        variant: "destructive"
      });
      return;
    }

    const progressPercentage = Math.round((lessonsCompleted / totalLessons) * 100);
    const isCompleted = lessonsCompleted >= totalLessons;

    const { data, error } = await supabase
      .from('learning_progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        course_title: courseTitle,
        lessons_completed: lessonsCompleted,
        total_lessons: totalLessons,
        progress_percentage: progressPercentage,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }, { onConflict: 'user_id,course_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return;
    }

    if (data) {
      setProgress(prev => {
        const existing = prev.findIndex(p => p.course_id === courseId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [data, ...prev];
      });

      // Update stats if course completed
      if (isCompleted) {
        await updateStatsOnCourseComplete();
      }
    }

    return data;
  };

  // Save quiz result
  const saveQuizResult = async (
    quizTopic: string,
    quizType: string,
    totalQuestions: number,
    correctAnswers: number
  ) => {
    if (!user) {
      toast({
        title: "সাইন ইন করুন",
        description: "Quiz result সেভ করতে লগইন করুন",
        variant: "destructive"
      });
      return;
    }

    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const xpEarned = Math.round(correctAnswers * 10 + (scorePercentage >= 80 ? 50 : 0));

    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: user.id,
        quiz_topic: quizTopic,
        quiz_type: quizType,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score_percentage: scorePercentage,
        xp_earned: xpEarned
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result:', error);
      return;
    }

    if (data) {
      setQuizResults(prev => [data, ...prev]);
      await updateStatsOnQuizComplete(xpEarned);
      
      toast({
        title: `🎉 +${xpEarned} XP অর্জন!`,
        description: `${scorePercentage}% স্কোর - ${quizTopic}`
      });
    }

    return data;
  };

  // Update stats on quiz complete
  const updateStatsOnQuizComplete = async (xpEarned: number) => {
    const currentStats = await ensureStats();
    if (!currentStats || !user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = currentStats.last_activity_date;
    
    let newStreak = currentStats.current_streak;
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newXp = currentStats.total_xp + xpEarned;
    const newLevel = Math.floor(newXp / 500) + 1;

    const { data } = await supabase
      .from('learning_stats')
      .update({
        total_xp: newXp,
        current_level: newLevel,
        quizzes_completed: currentStats.quizzes_completed + 1,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, currentStats.longest_streak),
        last_activity_date: today
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (data) {
      setStats(data);
      
      if (newLevel > currentStats.current_level) {
        toast({
          title: `🚀 লেভেল আপ!`,
          description: `আপনি এখন লেভেল ${newLevel} এ!`
        });
      }
    }
  };

  // Update stats on course complete
  const updateStatsOnCourseComplete = async () => {
    const currentStats = await ensureStats();
    if (!currentStats || !user) return;

    const { data } = await supabase
      .from('learning_stats')
      .update({
        courses_completed: currentStats.courses_completed + 1,
        total_xp: currentStats.total_xp + 100
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (data) {
      setStats(data);
      toast({
        title: "🎓 কোর্স সম্পন্ন!",
        description: "+100 XP অর্জন করেছেন!"
      });
    }
  };

  return {
    progress,
    quizResults,
    stats,
    loading,
    updateCourseProgress,
    saveQuizResult,
    refetch: fetchLearningData
  };
};
