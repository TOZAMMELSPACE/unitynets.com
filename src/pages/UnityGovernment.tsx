import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Globe, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  ThumbsUp,
  Share2,
  MessageSquare,
  Award,
  Shield,
  Info,
  Plus,
  MapPin
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProposalDialog } from "@/components/ProposalDialog";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { User } from "@/lib/storage";

interface UnityGovernmentProps {
  currentUser: User;
  users: User[];
  onSignOut: () => void;
}

interface Guideline {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  country: string;
  category: string;
  date: string;
  impact: string;
  impactBn: string;
  votes: number;
  unityReward: number;
  status: "proposed" | "approved" | "ongoing";
  verified: boolean;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export default function UnityGovernment({ currentUser, users, onSignOut }: UnityGovernmentProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null);

  // Mock data
  const guidelines: Guideline[] = [
    {
      id: "1",
      title: "Global Climate Action Initiative",
      titleBn: "বৈশ্বিক জলবায়ু কর্মসূচি",
      description: "Community-driven tree planting program to combat climate change",
      descriptionBn: "জলবায়ু পরিবর্তন মোকাবেলায় কমিউনিটি-চালিত বৃক্ষরোপণ কর্মসূচি",
      country: "Bangladesh",
      category: "Environment",
      date: "2025-10-15",
      impact: "50M People",
      impactBn: "৫০ মিলিয়ন মানুষ",
      votes: 1250,
      unityReward: 10,
      status: "approved",
      verified: true,
      author: {
        name: "Dr. Kamal Ahmed",
        role: "Environmental Minister",
        avatar: ""
      }
    },
    {
      id: "2",
      title: "Universal Healthcare Access",
      titleBn: "সর্বজনীন স্বাস্থ্যসেবা প্রবেশাধিকার",
      description: "Free basic healthcare services through Unity Note system",
      descriptionBn: "ইউনিটি নোট সিস্টেমের মাধ্যমে বিনামূল্যে প্রাথমিক স্বাস্থ্যসেবা",
      country: "Global",
      category: "Health",
      date: "2025-10-20",
      impact: "2B People",
      impactBn: "২ বিলিয়ন মানুষ",
      votes: 3400,
      unityReward: 15,
      status: "ongoing",
      verified: true,
      author: {
        name: "Dr. Sarah Johnson",
        role: "WHO Representative",
        avatar: ""
      }
    },
    {
      id: "3",
      title: "Education for All Initiative",
      titleBn: "সকলের জন্য শিক্ষা উদ্যোগ",
      description: "Time-based teaching exchange using Unity Notes",
      descriptionBn: "ইউনিটি নোট ব্যবহার করে সময়-ভিত্তিক শিক্ষা বিনিময়",
      country: "Bangladesh",
      category: "Education",
      date: "2025-10-18",
      impact: "10M Students",
      impactBn: "১০ মিলিয়ন শিক্ষার্থী",
      votes: 890,
      unityReward: 8,
      status: "proposed",
      verified: false,
      author: {
        name: "Prof. Rashida Begum",
        role: "Education Advocate",
        avatar: ""
      }
    }
  ];

  const filteredGuidelines = guidelines.filter(g => {
    const matchesSearch = language === 'bn' 
      ? g.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.descriptionBn.toLowerCase().includes(searchQuery.toLowerCase())
      : g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry = selectedCountry === "all" || g.country === selectedCountry;
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    
    return matchesSearch && matchesCountry && matchesCategory;
  });

  const stats = {
    totalGuidelines: guidelines.length,
    activeProjects: guidelines.filter(g => g.status === "ongoing").length,
    totalVotes: guidelines.reduce((sum, g) => sum + g.votes, 0),
    notesDistributed: guidelines.reduce((sum, g) => sum + g.unityReward * g.votes, 0)
  };

  const GuidelineCard = ({ guideline }: { guideline: Guideline }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={guideline.author.avatar} />
            <AvatarFallback>{guideline.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {language === 'bn' ? guideline.titleBn : guideline.title}
              </h3>
              {guideline.verified && (
                <Shield className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {guideline.author.name} • {guideline.author.role}
            </p>
          </div>
        </div>
        <Badge variant={
          guideline.status === "approved" ? "default" : 
          guideline.status === "ongoing" ? "secondary" : 
          "outline"
        }>
          {guideline.status === "approved" ? t("Approved", "অনুমোদিত") :
           guideline.status === "ongoing" ? t("Ongoing", "চলমান") :
           t("Proposed", "প্রস্তাবিত")}
        </Badge>
      </div>

      <p className="text-muted-foreground mb-4">
        {language === 'bn' ? guideline.descriptionBn : guideline.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {guideline.country}
        </Badge>
        <Badge variant="outline">{guideline.category}</Badge>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {language === 'bn' ? guideline.impactBn : guideline.impact}
        </Badge>
        <Badge variant="outline" className="gap-1 text-primary">
          <Award className="h-3 w-3" />
          {guideline.unityReward} {t("Unity Notes", "ইউনিটি নোট")}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            {guideline.votes}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              setSelectedGuideline(guideline);
              setShowFeedbackDialog(true);
            }}
          >
            <MessageSquare className="h-4 w-4" />
            {t("Feedback", "মতামত")}
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {t("Unity Government", "ইউনিটি সরকার")}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t(
              "Global Guidance for Unified Humanity",
              "মানবতার ঐক্যবদ্ধ নির্দেশনা"
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("Total Guidelines", "মোট নির্দেশনা")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.totalGuidelines}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("Active Projects", "সক্রিয় প্রকল্প")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.activeProjects}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("Total Votes", "মোট ভোট")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.totalVotes}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("Notes Distributed", "বিতরণ করা নোট")}
              </span>
            </div>
            <p className="text-2xl font-bold">{stats.notesDistributed}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search guidelines...", "নির্দেশনা খুঁজুন...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 rounded-md border bg-background"
            >
              <option value="all">{t("All Countries", "সকল দেশ")}</option>
              <option value="Global">{t("Global", "বৈশ্বিক")}</option>
              <option value="Bangladesh">{t("Bangladesh", "বাংলাদেশ")}</option>
              <option value="USA">USA</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-md border bg-background"
            >
              <option value="all">{t("All Categories", "সকল বিভাগ")}</option>
              <option value="Environment">{t("Environment", "পরিবেশ")}</option>
              <option value="Health">{t("Health", "স্বাস্থ্য")}</option>
              <option value="Education">{t("Education", "শিক্ষা")}</option>
            </select>
            <Button onClick={() => setShowProposalDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("Submit Proposal", "প্রস্তাব জমা দিন")}
            </Button>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              {t("All Guidelines", "সকল নির্দেশনা")}
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t("Approved", "অনুমোদিত")}
            </TabsTrigger>
            <TabsTrigger value="ongoing">
              {t("Ongoing Projects", "চলমান প্রকল্প")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredGuidelines.map(guideline => (
              <GuidelineCard key={guideline.id} guideline={guideline} />
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filteredGuidelines
              .filter(g => g.status === "approved")
              .map(guideline => (
                <GuidelineCard key={guideline.id} guideline={guideline} />
              ))}
          </TabsContent>

          <TabsContent value="ongoing" className="space-y-4">
            {filteredGuidelines
              .filter(g => g.status === "ongoing")
              .map(guideline => (
                <GuidelineCard key={guideline.id} guideline={guideline} />
              ))}
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <Card className="p-6 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {t("Help & FAQ", "সাহায্য ও প্রশ্নোত্তর")}
            </h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>{t("How to submit a proposal?", "কীভাবে প্রস্তাব জমা দেবেন?")}</strong>
              <br />
              {t(
                "Click the 'Submit Proposal' button, fill in the details, and submit for community review.",
                "প্রস্তাব জমা দিন বাটনে ক্লিক করুন, বিস্তারিত পূরণ করুন এবং কমিউনিটি পর্যালোচনার জন্য জমা দিন।"
              )}
            </p>
            <p>
              <strong>{t("How does voting work?", "ভোট কীভাবে কাজ করে?")}</strong>
              <br />
              {t(
                "Use Unity Notes to vote on proposals. 1 Note = 1 Vote. Your vote helps prioritize important initiatives.",
                "প্রস্তাবে ভোট দিতে ইউনিটি নোট ব্যবহার করুন। ১ নোট = ১ ভোট। আপনার ভোট গুরুত্বপূর্ণ উদ্যোগকে অগ্রাধিকার দিতে সাহায্য করে।"
              )}
            </p>
            <p>
              <strong>{t("Can I earn Unity Notes?", "আমি কি ইউনিটি নোট আয় করতে পারি?")}</strong>
              <br />
              {t(
                "Yes! Participate in approved projects, contribute feedback, or help implement guidelines to earn rewards.",
                "হ্যাঁ! অনুমোদিত প্রকল্পে অংশগ্রহণ করুন, মতামত দিন বা নির্দেশনা বাস্তবায়নে সাহায্য করুন পুরস্কার অর্জন করতে।"
              )}
            </p>
          </div>
        </Card>

        <ProposalDialog 
          open={showProposalDialog} 
          onOpenChange={setShowProposalDialog} 
        />
        
        <FeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={setShowFeedbackDialog}
          guideline={selectedGuideline}
        />
    </main>
  );
}
