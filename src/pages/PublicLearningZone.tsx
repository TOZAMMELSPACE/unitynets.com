import { useState } from "react";
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
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate, Link } from "react-router-dom";

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
  },
  {
    id: "mobile-app",
    title: "Mobile App Development",
    titleBn: "মোবাইল অ্যাপ ডেভেলপমেন্ট",
    description: "Build mobile apps using React Native",
    descriptionBn: "React Native ব্যবহার করে মোবাইল অ্যাপ তৈরি করুন",
    category: "programming",
    difficulty: "advanced",
    duration: "8 weeks",
    lessons: 40,
    icon: Code,
    color: "from-indigo-500 to-purple-500",
    prerequisites: "JavaScript knowledge"
  }
];

const freeBooks: Book[] = [
  {
    id: "manush-na-monushyarupi",
    title: "মানুষ না মনুষ্যরূপী?",
    titleBn: "মানুষ না মনুষ্যরূপী?",
    author: "Md. Tozammel Haque",
    authorBn: "মোঃ তোজাম্মেল হক",
    description: "A sci-fi novel set in future New Earth City, where at age 25, everyone must take a 'Humanity Scan' to determine if they are truly human or just acting like one.",
    descriptionBn: "ভবিষ্যতের নিউ আর্থ সিটিতে সেট করা একটি সাই-ফাই উপন্যাস, যেখানে ২৫ বছর বয়সে সবাইকে 'মানবতা স্ক্যান' দিতে হয়।",
    chapters: 12,
    category: "sci-fi",
    link: "https://sites.google.com/view/tozammelbook/home",
    coverColor: "from-indigo-600 via-purple-600 to-pink-600"
  }
];

const CourseCard = ({ course, onEnroll }: { course: Course; onEnroll: () => void }) => {
  const { t } = useLanguage();
  const Icon = course.icon;
  
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center shrink-0`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{t(course.title, course.titleBn)}</h3>
            <p className="text-sm text-muted-foreground">{t(course.description, course.descriptionBn)}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {course.duration}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.lessons} {t("lessons", "লেসন")}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                course.difficulty === "beginner" ? "text-green-600 border-green-600" :
                course.difficulty === "intermediate" ? "text-yellow-600 border-yellow-600" :
                "text-red-600 border-red-600"
              }`}
            >
              {t(
                course.difficulty === "beginner" ? "Beginner" : 
                course.difficulty === "intermediate" ? "Intermediate" : "Advanced",
                course.difficulty === "beginner" ? "শুরুর পর্যায়" : 
                course.difficulty === "intermediate" ? "মধ্যবর্তী" : "উন্নত"
              )}
            </Badge>
          </div>
          
          <Button onClick={onEnroll} className="w-full sm:w-auto">
            <Play className="w-4 h-4 mr-2" />
            {t("Enroll Now", "ভর্তি হন")}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const BookCard = ({ book }: { book: Book }) => {
  const { t } = useLanguage();
  
  return (
    <Card className="p-4 hover:shadow-lg transition-all">
      <div className="flex gap-4">
        <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${book.coverColor} flex items-center justify-center shrink-0`}>
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold">{t(book.title, book.titleBn)}</h4>
          <p className="text-sm text-muted-foreground">{t(book.author, book.authorBn)}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{t(book.description, book.descriptionBn)}</p>
          
          <a 
            href={book.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("Read Now", "পড়ুন")}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default function PublicLearningZone() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const handleEnroll = () => {
    toast({
      title: t("Sign in required", "সাইন ইন প্রয়োজন"),
      description: t("Please sign in to enroll in courses", "কোর্সে ভর্তি হতে সাইন ইন করুন"),
    });
    navigate('/auth?mode=signup');
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.titleBn.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <>
      {/* AI Learning Chat Button */}
      <Link to="/learn-chat">
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-5 shadow-lg bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-300 gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden sm:inline">{t("Ask AI", "AI জিজ্ঞাসা")}</span>
        </Button>
      </Link>
      <div className="min-h-screen bg-background">
      <SEOHead
        title="Learning Zone - ফ্রি শেখার প্ল্যাটফর্ম"
        description="UnityNets Learning Zone - বিনামূল্যে প্রোগ্রামিং, ডিজিটাল দক্ষতা, এবং কমিউনিটি কোর্স শিখুন। Free courses on Python, JavaScript, digital literacy and more."
        keywords="learning zone, free courses, programming, Python, JavaScript, digital skills, বাংলা কোর্স, ফ্রি শেখা, UnityNets"
        canonicalUrl="https://unitynets.com/learning-zone"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Course",
          "provider": {
            "@type": "Organization",
            "name": "UnityNets"
          },
          "isAccessibleForFree": true,
          "inLanguage": ["bn", "en"]
        }}
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("Free Learning Platform", "ফ্রি লার্নিং প্ল্যাটফর্ম")}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("Learning Zone", "লার্নিং জোন")}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Enhance your skills with free courses and resources from the UnityNets community",
                "UnityNets কমিউনিটি থেকে বিনামূল্যে কোর্স এবং রিসোর্স দিয়ে আপনার দক্ষতা বৃদ্ধি করুন"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Search and Filters */}
              <Card className="p-6">
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

              {/* Courses List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t("Available Courses", "উপলব্ধ কোর্স")} ({filteredCourses.length})
                </h2>
                
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                  />
                ))}
              </div>

              {/* Free Books */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-center gap-3 mb-6">
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {t("Platform Stats", "প্ল্যাটফর্ম স্ট্যাটস")}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Total Courses", "মোট কোর্স")}</span>
                    <span className="font-bold text-xl text-primary">{courses.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Active Learners", "সক্রিয় শিক্ষার্থী")}</span>
                    <span className="font-bold text-xl text-primary">500+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Free Books", "ফ্রি বই")}</span>
                    <span className="font-bold text-xl text-primary">{freeBooks.length}</span>
                  </div>
                </div>
              </Card>

              {/* Achievements Preview */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  {t("Earn Badges", "ব্যাজ অর্জন করুন")}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t("First Course", "প্রথম কোর্স")}</p>
                      <p className="text-xs text-muted-foreground">{t("Complete your first course", "প্রথম কোর্স সম্পন্ন করুন")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t("7 Day Streak", "৭ দিনের স্ট্রিক")}</p>
                      <p className="text-xs text-muted-foreground">{t("Learn for 7 days straight", "টানা ৭ দিন শিখুন")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t("Course Master", "কোর্স মাস্টার")}</p>
                      <p className="text-xs text-muted-foreground">{t("Complete 5 courses", "৫টি কোর্স সম্পন্ন করুন")}</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" onClick={() => navigate('/auth?mode=signup')}>
                  {t("Join to Start Learning", "শেখা শুরু করতে জয়েন করুন")}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
    </>
  );
}
