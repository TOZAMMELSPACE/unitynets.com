import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, Award, Users, TrendingUp, Clock, Heart, Target, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@/lib/storage";
import { useState } from "react";

interface ImpactReportProps {
  currentUser: User | null;
  users: User[];
  onSignOut: () => void;
}

export default function ImpactReport({ currentUser }: ImpactReportProps) {
  const { t } = useLanguage();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("6months");

  // Mock data - in real app, this would come from backend
  const impactData = {
    totalPeopleImpacted: 1247,
    totalHoursContributed: 156,
    totalNotesEarned: 284,
    totalNotesSpent: 120,
    projectsCompleted: 23,
    currentStreak: 45,
    communityRank: 12,
    totalUsers: 5000,
  };

  const monthlyImpact = [
    { month: "Jan", people: 150, hours: 20, notes: 35 },
    { month: "Feb", people: 180, hours: 24, notes: 42 },
    { month: "Mar", people: 200, hours: 28, notes: 48 },
    { month: "Apr", people: 220, hours: 30, notes: 52 },
    { month: "May", people: 245, hours: 32, notes: 58 },
    { month: "Jun", people: 252, hours: 22, notes: 49 },
  ];

  const skills = [
    { name: "Leadership", progress: 85, projects: 8 },
    { name: "Communication", progress: 75, projects: 12 },
    { name: "Problem Solving", progress: 90, projects: 15 },
    { name: "Community Building", progress: 70, projects: 10 },
  ];

  const categoryBreakdown = [
    { category: "Health", hours: 45, notes: 80, people: 320, percentage: 25 },
    { category: "Education", hours: 38, notes: 70, people: 280, percentage: 22 },
    { category: "Environment", hours: 35, notes: 65, people: 250, percentage: 20 },
    { category: "Technology", hours: 25, notes: 45, people: 220, percentage: 18 },
    { category: "Others", hours: 13, notes: 24, people: 177, percentage: 15 },
  ];

  const milestones = [
    { title: "First 100 People Impacted", date: "2024-02-15", achieved: true },
    { title: "500 People Milestone", date: "2024-05-20", achieved: true },
    { title: "1000 People Impact", date: "2024-08-10", achieved: true },
    { title: "2000 People Target", date: "2025-01-01", achieved: false },
  ];

  const averageComparison = {
    yourImpact: 1247,
    communityAvg: 850,
    percentageAbove: 47,
  };

  const sentimentData = {
    positive: 82,
    neutral: 15,
    negative: 3,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {t("Personal Impact Report", "ব্যক্তিগত প্রভাব রিপোর্ট")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("Track your contributions and their impact", "আপনার অবদান এবং তাদের প্রভাব ট্র্যাক করুন")}
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">{t("1 Month", "১ মাস")}</SelectItem>
                <SelectItem value="3months">{t("3 Months", "৩ মাস")}</SelectItem>
                <SelectItem value="6months">{t("6 Months", "৬ মাস")}</SelectItem>
                <SelectItem value="1year">{t("1 Year", "১ বছর")}</SelectItem>
                <SelectItem value="all">{t("All Time", "সব সময়")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Categories", "সব ক্যাটাগরি")}</SelectItem>
                <SelectItem value="health">{t("Health", "স্বাস্থ্য")}</SelectItem>
                <SelectItem value="education">{t("Education", "শিক্ষা")}</SelectItem>
                <SelectItem value="environment">{t("Environment", "পরিবেশ")}</SelectItem>
                <SelectItem value="technology">{t("Technology", "প্রযুক্তি")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("People Impacted", "প্রভাবিত মানুষ")}
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{impactData.totalPeopleImpacted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Through your contributions", "আপনার অবদানের মাধ্যমে")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Hours Contributed", "অবদান সময়")}
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{impactData.totalHoursContributed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Of service to community", "সম্প্রদায়ে সেবা")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Unity Notes Earned", "ইউনিটি নোট অর্জিত")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{impactData.totalNotesEarned}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("From your activities", "আপনার কার্যক্রম থেকে")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Projects Completed", "প্রকল্প সম্পন্ন")}
              </CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{impactData.projectsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Successful initiatives", "সফল উদ্যোগ")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">{t("Overview", "সংক্ষিপ্ত")}</TabsTrigger>
            <TabsTrigger value="history">{t("History", "ইতিহাস")}</TabsTrigger>
            <TabsTrigger value="skills">{t("Skills", "দক্ষতা")}</TabsTrigger>
            <TabsTrigger value="comparison">{t("Comparison", "তুলনা")}</TabsTrigger>
            <TabsTrigger value="milestones">{t("Milestones", "মাইলফলক")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Detailed Impact Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    {t("Impact Breakdown", "প্রভাব বিশ্লেষণ")}
                  </CardTitle>
                  <CardDescription>
                    {t("How your time creates impact", "আপনার সময় কীভাবে প্রভাব তৈরি করে")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t(cat.category, cat.category)}</span>
                        <span className="text-sm text-muted-foreground">{cat.percentage}%</span>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{cat.hours}h {t("contributed", "অবদান")}</span>
                        <span>{cat.notes} {t("notes", "নোট")}</span>
                        <span>{cat.people} {t("people", "মানুষ")}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resource Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t("Resource Utilization", "সম্পদ ব্যবহার")}
                  </CardTitle>
                  <CardDescription>
                    {t("Your time and notes allocation", "আপনার সময় ও নোট বন্টন")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("Time Spent", "ব্যয়িত সময়")}</span>
                      <span className="font-medium">{impactData.totalHoursContributed}h</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("Notes Earned", "নোট অর্জিত")}</span>
                      <span className="font-medium">{impactData.totalNotesEarned}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("Notes Spent", "নোট ব্যয়িত")}</span>
                      <span className="font-medium">{impactData.totalNotesSpent}</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t("Available Balance", "উপলব্ধ ব্যালেন্স")}</span>
                      <span className="text-lg font-bold text-primary">
                        {impactData.totalNotesEarned - impactData.totalNotesSpent} {t("Notes", "নোট")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  {t("Community Feedback", "সম্প্রদায়ের মতামত")}
                </CardTitle>
                <CardDescription>
                  {t("Sentiment analysis of your contributions", "আপনার অবদানের সেন্টিমেন্ট বিশ্লেষণ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        {t("Positive", "ইতিবাচক")}
                      </span>
                      <span className="text-sm font-bold">{sentimentData.positive}%</span>
                    </div>
                    <Progress value={sentimentData.positive} className="h-2 bg-green-100">
                      <div className="h-full bg-green-600 transition-all" style={{ width: `${sentimentData.positive}%` }} />
                    </Progress>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-600">
                        {t("Neutral", "নিরপেক্ষ")}
                      </span>
                      <span className="text-sm font-bold">{sentimentData.neutral}%</span>
                    </div>
                    <Progress value={sentimentData.neutral} className="h-2 bg-yellow-100">
                      <div className="h-full bg-yellow-600 transition-all" style={{ width: `${sentimentData.neutral}%` }} />
                    </Progress>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600">
                        {t("Negative", "নেতিবাচক")}
                      </span>
                      <span className="text-sm font-bold">{sentimentData.negative}%</span>
                    </div>
                    <Progress value={sentimentData.negative} className="h-2 bg-red-100">
                      <div className="h-full bg-red-600 transition-all" style={{ width: `${sentimentData.negative}%` }} />
                    </Progress>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historical Progress Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  {t("Historical Progress", "ঐতিহাসিক অগ্রগতি")}
                </CardTitle>
                <CardDescription>
                  {t("Your contribution trends over time", "সময়ের সাথে আপনার অবদান প্রবণতা")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyImpact.map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{month.people} {t("people", "মানুষ")}</span>
                          <span>{month.hours}h</span>
                          <span>{month.notes} {t("notes", "নোট")}</span>
                        </div>
                      </div>
                      <Progress value={(month.people / 300) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t("Skill Development", "দক্ষতা উন্নয়ন")}
                </CardTitle>
                <CardDescription>
                  {t("Skills gained through your contributions", "আপনার অবদানের মাধ্যমে অর্জিত দক্ষতা")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{t(skill.name, skill.name)}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({skill.projects} {t("projects", "প্রকল্প")})
                        </span>
                      </div>
                      <Badge variant="secondary">{skill.progress}%</Badge>
                    </div>
                    <Progress value={skill.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t("Peer Comparison", "সমকক্ষ তুলনা")}
                </CardTitle>
                <CardDescription>
                  {t("How you compare to your community", "আপনার সম্প্রদায়ের সাথে তুলনা")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {averageComparison.percentageAbove}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("Above community average", "সম্প্রদায়ের গড়ের উপরে")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-card border rounded-lg">
                    <span className="text-sm font-medium">{t("Your Impact", "আপনার প্রভাব")}</span>
                    <span className="text-lg font-bold text-primary">
                      {averageComparison.yourImpact.toLocaleString()} {t("people", "মানুষ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 border rounded-lg">
                    <span className="text-sm font-medium">{t("Community Average", "সম্প্রদায়ের গড়")}</span>
                    <span className="text-lg font-bold text-muted-foreground">
                      {averageComparison.communityAvg.toLocaleString()} {t("people", "মানুষ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-card border rounded-lg">
                    <span className="text-sm font-medium">{t("Your Rank", "আপনার র‍্যাংক")}</span>
                    <span className="text-lg font-bold text-primary">
                      #{impactData.communityRank} / {impactData.totalUsers.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {t("Milestones & Achievements", "মাইলফলক ও অর্জন")}
                </CardTitle>
                <CardDescription>
                  {t("Track your major achievements", "আপনার প্রধান অর্জনগুলি ট্র্যাক করুন")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      milestone.achieved ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.achieved ? "bg-primary text-white" : "bg-muted"
                    }`}>
                      {milestone.achieved ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{t(milestone.title, milestone.title)}</h4>
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                    </div>
                    {milestone.achieved ? (
                      <Badge className="bg-primary">{t("Achieved", "অর্জিত")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("In Progress", "চলমান")}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
