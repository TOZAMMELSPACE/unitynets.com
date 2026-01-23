import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Star, Flame, BookOpen, Target, 
  TrendingUp, Award, Zap, Calendar
} from "lucide-react";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { useAuth } from "@/hooks/useAuth";

export const ProgressDashboard = () => {
  const { user } = useAuth();
  const { progress, quizResults, stats, loading } = useLearningProgress();

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Progress ট্র্যাক করুন</h3>
          <p className="text-muted-foreground">
            আপনার Learning Journey দেখতে সাইন ইন করুন
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  const xpToNextLevel = stats ? (stats.current_level * 500) - stats.total_xp : 500;
  const levelProgress = stats ? ((stats.total_xp % 500) / 500) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats?.total_xp || 0}</p>
            <p className="text-xs text-muted-foreground">মোট XP</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">লেভেল {stats?.current_level || 1}</p>
            <p className="text-xs text-muted-foreground">{xpToNextLevel} XP বাকি</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">{stats?.current_streak || 0} দিন</p>
            <p className="text-xs text-muted-foreground">স্ট্রিক 🔥</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{stats?.quizzes_completed || 0}</p>
            <p className="text-xs text-muted-foreground">কুইজ সম্পন্ন</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            লেভেল {stats?.current_level || 1} → {(stats?.current_level || 1) + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.total_xp || 0} / {(stats?.current_level || 1) * 500} XP
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses" className="text-sm">
            <BookOpen className="w-4 h-4 mr-1" />
            কোর্স
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="text-sm">
            <Target className="w-4 h-4 mr-1" />
            কুইজ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4 space-y-3">
          {progress.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  এখনো কোনো কোর্স শুরু করেননি
                </p>
              </CardContent>
            </Card>
          ) : (
            progress.map(course => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{course.course_title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {course.lessons_completed}/{course.total_lessons} লেসন
                      </p>
                    </div>
                    {course.is_completed ? (
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        <Award className="w-3 h-3 mr-1" />
                        সম্পন্ন
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {course.progress_percentage}%
                      </Badge>
                    )}
                  </div>
                  <Progress value={course.progress_percentage} className="h-2" />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4 space-y-3">
          {quizResults.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  এখনো কোনো কুইজ দেননি
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  AI Chat এ কুইজ চাইলে এখানে দেখাবে!
                </p>
              </CardContent>
            </Card>
          ) : (
            quizResults.map(quiz => (
              <Card key={quiz.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{quiz.quiz_topic}</h4>
                      <p className="text-xs text-muted-foreground">
                        {quiz.correct_answers}/{quiz.total_questions} সঠিক • {quiz.quiz_type.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={quiz.score_percentage >= 80 ? "default" : "secondary"}
                      >
                        {quiz.score_percentage}%
                      </Badge>
                      <p className="text-xs text-primary mt-1">+{quiz.xp_earned} XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(quiz.created_at).toLocaleDateString('bn-BD')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Achievements */}
      {stats && (stats.longest_streak >= 7 || stats.quizzes_completed >= 10 || stats.courses_completed >= 1) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4" />
              অ্যাচিভমেন্টস
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.longest_streak >= 7 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                🔥 সাপ্তাহিক যোদ্ধা
              </Badge>
            )}
            {stats.quizzes_completed >= 10 && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                🧠 কুইজ মাস্টার
              </Badge>
            )}
            {stats.courses_completed >= 1 && (
              <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                🎓 কোর্স সম্পন্নকারী
              </Badge>
            )}
            {stats.current_level >= 5 && (
              <Badge variant="outline" className="bg-warning/10 text-warning">
                ⭐ এলিট লার্নার
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
