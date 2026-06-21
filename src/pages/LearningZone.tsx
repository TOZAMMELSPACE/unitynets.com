import { useState, useEffect } from "react";
import newLogoAsset from "@/assets/unitynets-logo-v2.png.asset.json";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Search, 
  Filter,
  Clock,
  BarChart3,
  Award,
  Target,
  Flame,
  TrendingUp,
  Code,
  Globe,
  Users,
  BookMarked,
  Play,
  CheckCircle2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface LearningZoneProps {
  currentUser: User | null;
  onSignOut: () => void;
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
  prerequisites?: string;
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

const courses: Course[] = [
  {
    id: "python-basics",
    title: "Python Programming Basics",
    titleBn: "পাইথন প্রোগ্রামিং বেসিক",
    description: "Learn Python from scratch with hands-on coding exercises",
    descriptionBn: "হাতে-কলমে কোডিং অনুশীলনের মাধ্যমে পাইথন শিখুন",
    category: "programming",
    difficulty: "beginner",
    duration: "4 weeks",
    lessons: 20,
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    prerequisites: "None"
  },
  {
    id: "javascript-web",
    title: "JavaScript & Web Development",
    titleBn: "জাভাস্ক্রিপ্ট এবং ওয়েব ডেভেলপমেন্ট",
    description: "Build interactive websites with JavaScript, HTML, and CSS",
    descriptionBn: "জাভাস্ক্রিপ্ট, HTML এবং CSS দিয়ে ইন্টারঅ্যাক্টিভ ওয়েবসাইট তৈরি করুন",
    category: "programming",
    difficulty: "intermediate",
    duration: "6 weeks",
    lessons: 30,
    icon: Globe,
    color: "from-yellow-500 to-orange-500",
    prerequisites: "Basic HTML/CSS knowledge"
  },
  {
    id: "digital-literacy",
    title: "Digital Literacy & Online Safety",
    titleBn: "ডিজিটাল সাক্ষরতা এবং অনলাইন নিরাপত্তা",
    description: "Master essential digital skills and stay safe online",
    descriptionBn: "প্রয়োজনীয় ডিজিটাল দক্ষতা আয়ত্ত করুন এবং অনলাইনে নিরাপদ থাকুন",
    category: "digital-skills",
    difficulty: "beginner",
    duration: "3 weeks",
    lessons: 15,
    icon: Award,
    color: "from-purple-500 to-pink-500",
    prerequisites: "None"
  },
  {
    id: "community-civic",
    title: "Community Skills & Civic Education",
    titleBn: "কমিউনিটি দক্ষতা এবং নাগরিক শিক্ষা",
    description: "Learn about local governance, rights, and community participation",
    descriptionBn: "স্থানীয় শাসন, অধিকার এবং কমিউনিটি অংশগ্রহণ সম্পর্কে জানুন",
    category: "community",
    difficulty: "beginner",
    duration: "2 weeks",
    lessons: 10,
    icon: Users,
    color: "from-green-500 to-teal-500",
    prerequisites: "None"
  },
  {
    id: "bengali-advanced",
    title: "Advanced Bengali Language & Literature",
    titleBn: "উন্নত বাংলা ভাষা এবং সাহিত্য",
    description: "Enhance your Bengali writing skills and explore literature",
    descriptionBn: "আপনার বাংলা লেখার দক্ষতা বৃদ্ধি করুন এবং সাহিত্য অন্বেষণ করুন",
    category: "language",
    difficulty: "intermediate",
    duration: "5 weeks",
    lessons: 25,
    icon: BookMarked,
    color: "from-red-500 to-rose-500",
    prerequisites: "Basic Bengali reading/writing"
  }
];

const freeBooks: Book[] = [
  {
    id: "manush-na-monushyarupi",
    title: "মানুষ না মনুষ্যরূপী?",
    titleBn: "মানুষ না মনুষ্যরূপী?",
    author: "Md. Tozammel Haque",
    authorBn: "মোঃ তোজাম্মেল হক",
    description: "A sci-fi novel set in future New Earth City, where at age 25, everyone must take a 'Humanity Scan' to determine if they are truly human or just acting like one. Follow Ishan Rahman's journey through 12 chapters exploring humanity, morality, and the fight against inner demons.",
    descriptionBn: "ভবিষ্যতের নিউ আর্থ সিটিতে সেট করা একটি সাই-ফাই উপন্যাস, যেখানে ২৫ বছর বয়সে সবাইকে 'মানবতা স্ক্যান' দিতে হয়। ১২ অধ্যায়ে ইশান রহমানের যাত্রা অনুসরণ করুন—মানবতা, নৈতিকতা এবং অন্তরের শত্রুর বিরুদ্ধে লড়াই।",
    chapters: 12,
    category: "sci-fi",
    link: "https://sites.google.com/view/tozammelbook/home",
    coverColor: "from-indigo-600 via-purple-600 to-pink-600"
  }
];

export default function LearningZone({ currentUser, onSignOut }: LearningZoneProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [loginStreak, setLoginStreak] = useState(3);
  const [weeklyGoal, setWeeklyGoal] = useState(50);

  useEffect(() => {
    if (currentUser) {
      const enrolled = localStorage.getItem(`enrolled_${currentUser.id}`);
      const progress = localStorage.getItem(`course_progress_${currentUser.id}`);
      
      if (enrolled) setEnrolledCourses(JSON.parse(enrolled));
      if (progress) setCourseProgress(JSON.parse(progress));
    }
  }, [currentUser]);

  const handleEnroll = (courseId: string) => {
    if (!currentUser) {
      toast({
        title: t("Sign in required", "সাইন ইন প্রয়োজন"),
        description: t("Please sign in to enroll in courses", "কোর্সে ভর্তি হতে সাইন ইন করুন"),
        variant: "destructive"
      });
      return;
    }

    const newEnrolled = [...enrolledCourses, courseId];
    setEnrolledCourses(newEnrolled);
    localStorage.setItem(`enrolled_${currentUser.id}`, JSON.stringify(newEnrolled));
    
    toast({
      title: t("Enrolled successfully!", "সফলভাবে ভর্তি হয়েছে!"),
      description: t("Start learning now", "এখনই শেখা শুরু করুন"),
    });
  };

  const handleContinue = (courseId: string) => {
    const currentProgress = courseProgress[courseId] || 0;
    const newProgress = Math.min(100, currentProgress + 20);
    
    const updatedProgress = { ...courseProgress, [courseId]: newProgress };
    setCourseProgress(updatedProgress);
    
    if (currentUser) {
      localStorage.setItem(`course_progress_${currentUser.id}`, JSON.stringify(updatedProgress));
    }

    if (newProgress === 100) {
      toast({
        title: "🎉 " + t("Course Completed!", "কোর্স সম্পন্ন!"),
        description: t("Congratulations on completing the course!", "কোর্স সম্পন্ন করার জন্য অভিনন্দন!"),
      });
    } else {
      toast({
        title: t("Great progress!", "দুর্দান্ত অগ্রগতি!"),
        description: `${newProgress}% ${t("completed", "সম্পন্ন")}`,
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.titleBn.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const enrolledCoursesData = courses.filter(c => enrolledCourses.includes(c.id));
  const completedCoursesData = enrolledCoursesData.filter(c => courseProgress[c.id] === 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="card-enhanced p-4 lg:p-6 mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={newLogoAsset.url} 
            alt="UnityNets Logo" 
            className="h-10 lg:h-12 w-auto"
          />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("Learning Zone", "লার্নিং জোন")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("Enhance your skills and grow with the community", "আপনার দক্ষতা বৃদ্ধি করুন এবং কমিউনিটির সাথে বেড়ে উঠুন")}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("Search courses...", "কোর্স খুঁজুন...")}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("Category", "ক্যাটাগরি")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Categories", "সব ক্যাটাগরি")}</SelectItem>
                    <SelectItem value="programming">{t("Programming", "প্রোগ্রামিং")}</SelectItem>
                    <SelectItem value="digital-skills">{t("Digital Skills", "ডিজিটাল দক্ষতা")}</SelectItem>
                    <SelectItem value="community">{t("Community", "কমিউনিটি")}</SelectItem>
                    <SelectItem value="language">{t("Language", "ভাষা")}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("Difficulty", "কঠিনতা")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Levels", "সব লেভেল")}</SelectItem>
                    <SelectItem value="beginner">{t("Beginner", "শুরুর পর্যায়")}</SelectItem>
                    <SelectItem value="intermediate">{t("Intermediate", "মধ্যবর্তী")}</SelectItem>
                    <SelectItem value="advanced">{t("Advanced", "উন্নত")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Free Reading Library */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <BookMarked className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">{t("Free Reading Library", "ফ্রি পড়ার লাইব্রেরি")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("Explore free books and novels from our community", "কমিউনিটি থেকে ফ্রি বই এবং উপন্যাস পড়ুন")}
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {freeBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </Card>

          {/* Course Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">
                {t("All Courses", "সব কোর্স")} ({filteredCourses.length})
              </TabsTrigger>
              <TabsTrigger value="enrolled">
                {t("Enrolled", "ভর্তি")} ({enrolledCoursesData.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t("Completed", "সম্পন্ন")} ({completedCoursesData.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourses.includes(course.id)}
                  progress={courseProgress[course.id]}
                  onEnroll={() => handleEnroll(course.id)}
                  onContinue={() => handleContinue(course.id)}
                />
              ))}
            </TabsContent>

            <TabsContent value="enrolled" className="space-y-4 mt-6">
              {enrolledCoursesData.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={true}
                  progress={courseProgress[course.id]}
                  onEnroll={() => handleEnroll(course.id)}
                  onContinue={() => handleContinue(course.id)}
                />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedCoursesData.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={true}
                  progress={100}
                  onEnroll={() => handleEnroll(course.id)}
                  onContinue={() => handleContinue(course.id)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Progress Dashboard */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t("Your Progress", "আপনার অগ্রগতি")}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("Trust Level", "ট্রাস্ট লেভেল")}</span>
                <span className="font-semibold text-lg text-primary">
                  {currentUser ? Math.round(currentUser.trustScore) : 0}/60
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {t("Login Streak", "লগইন স্ট্রিক")}
                </span>
                <span className="font-semibold">{loginStreak} {t("days", "দিন")}</span>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{t("Weekly Goal", "সাপ্তাহিক লক্ষ্য")}</span>
                  <span className="text-sm font-medium">{weeklyGoal}/100</span>
                </div>
                <Progress value={weeklyGoal} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              {t("Recent Achievements", "সাম্প্রতিক অর্জন")}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  🎯
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("First Course", "প্রথম কোর্স")}</p>
                  <p className="text-xs text-muted-foreground">{t("Enrolled in first course", "প্রথম কোর্সে ভর্তি হয়েছে")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  ⭐
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("Quick Learner", "দ্রুত শিক্ষার্থী")}</p>
                  <p className="text-xs text-muted-foreground">{t("Complete 5 lessons", "৫টি পাঠ সম্পন্ন করুন")}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Community Rank */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-2xl text-primary mb-1">#{currentUser ? 5 : '-'}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Community Rank", "কমিউনিটি র‍্যাঙ্ক")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ 
  course, 
  isEnrolled, 
  progress = 0, 
  onEnroll, 
  onContinue 
}: { 
  course: Course; 
  isEnrolled: boolean; 
  progress?: number;
  onEnroll: () => void;
  onContinue: () => void;
}) {
  const { t, language } = useLanguage();
  const Icon = course.icon;
  const isCompleted = progress === 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "intermediate": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
      case "advanced": return "bg-red-500/20 text-red-700 dark:text-red-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 border-primary/20">
      <div className="flex gap-4">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg">
              {language === "en" ? course.title : course.titleBn}
            </h3>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {language === "en" ? course.description : course.descriptionBn}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className={getDifficultyColor(course.difficulty)}>
              {t(course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1), 
                 course.difficulty === "beginner" ? "শুরুর পর্যায়" : 
                 course.difficulty === "intermediate" ? "মধ্যবর্তী" : "উন্নত")}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {course.duration}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <BookOpen className="w-3 h-3" />
              {course.lessons} {t("lessons", "পাঠ")}
            </Badge>
          </div>
          
          {isEnrolled && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {t("Progress", "অগ্রগতি")}
                </span>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <Button
            onClick={isEnrolled ? onContinue : onEnroll}
            disabled={isCompleted}
            className={isEnrolled ? "btn-hero" : ""}
            variant={isEnrolled ? "default" : "outline"}
            size="sm"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t("Completed", "সম্পন্ন")}
              </>
            ) : isEnrolled ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                {t("Continue Learning", "শেখা চালিয়ে যান")}
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                {t("Enroll Now", "এখনই ভর্তি হন")}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BookCard({ book }: { book: Book }) {
  const { t, language } = useLanguage();

  return (
    <Card className="p-4 hover:shadow-xl transition-all duration-300 border-primary/20 bg-card">
      <div className="flex gap-4">
        {/* Book Cover */}
        <div className={`w-24 h-32 rounded-lg bg-gradient-to-br ${book.coverColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <BookMarked className="w-12 h-12 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="font-bold text-lg mb-1">
              {language === "en" ? book.title : book.titleBn}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("by", "লিখেছেন")} {language === "en" ? book.author : book.authorBn}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {language === "en" ? book.description : book.descriptionBn}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="w-3 h-3" />
              {book.chapters} {t("chapters", "অধ্যায়")}
            </Badge>
            <Badge variant="outline">
              {book.category === "sci-fi" ? t("Sci-Fi", "সাই-ফাই") : book.category}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300">
              {t("Free", "ফ্রি")}
            </Badge>
          </div>
          
          <a
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="btn-hero" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("Read Now", "এখনই পড়ুন")}
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}