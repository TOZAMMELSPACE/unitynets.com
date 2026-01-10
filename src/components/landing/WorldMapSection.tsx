import { memo, useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Users, TrendingUp, MessageSquare, Heart, X, Sparkles, Award, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Extended community data for each location
interface LocationData {
  name: string;
  coordinates: [number, number];
  members: number;
  color: string;
  isHub: boolean;
  flag: string;
  region: string;
  joinedDate: string;
  activeMembers: number;
  postsThisMonth: number;
  topSkills: string[];
  highlights: string[];
  growthRate: number;
}

const memberLocations: LocationData[] = [
  { 
    name: "Bangladesh", 
    coordinates: [90.3563, 23.685], 
    members: 5000, 
    color: "hsl(var(--primary))", 
    isHub: true,
    flag: "🇧🇩",
    region: "South Asia",
    joinedDate: "Jan 2024",
    activeMembers: 3200,
    postsThisMonth: 1250,
    topSkills: ["Web Development", "Graphic Design", "Teaching", "Writing"],
    highlights: ["Founding community", "Most active discussions", "Highest trust scores"],
    growthRate: 45
  },
  { 
    name: "India", 
    coordinates: [78.9629, 20.5937], 
    members: 1200, 
    color: "hsl(var(--primary))", 
    isHub: false,
    flag: "🇮🇳",
    region: "South Asia",
    joinedDate: "Feb 2024",
    activeMembers: 780,
    postsThisMonth: 420,
    topSkills: ["Software Engineering", "Data Science", "Marketing", "Tutoring"],
    highlights: ["Fast growing", "Tech community hub", "Active learners"],
    growthRate: 38
  },
  { 
    name: "Pakistan", 
    coordinates: [69.3451, 30.3753], 
    members: 450, 
    color: "hsl(var(--primary))", 
    isHub: false,
    flag: "🇵🇰",
    region: "South Asia",
    joinedDate: "Mar 2024",
    activeMembers: 290,
    postsThisMonth: 180,
    topSkills: ["Freelancing", "Content Writing", "Video Editing", "SEO"],
    highlights: ["Strong freelancer network", "Creative community"],
    growthRate: 32
  },
  { 
    name: "Nepal", 
    coordinates: [84.124, 28.3949], 
    members: 320, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇳🇵",
    region: "South Asia",
    joinedDate: "Apr 2024",
    activeMembers: 210,
    postsThisMonth: 95,
    topSkills: ["Tourism", "Handicrafts", "Photography", "Language Teaching"],
    highlights: ["Cultural exchange hub", "Adventure community"],
    growthRate: 28
  },
  { 
    name: "Sri Lanka", 
    coordinates: [80.7718, 7.8731], 
    members: 180, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇱🇰",
    region: "South Asia",
    joinedDate: "May 2024",
    activeMembers: 120,
    postsThisMonth: 65,
    topSkills: ["Tea Industry", "Tourism", "IT Services", "Education"],
    highlights: ["Emerging community", "Strong education focus"],
    growthRate: 25
  },
  { 
    name: "UAE", 
    coordinates: [53.8478, 23.4241], 
    members: 800, 
    color: "hsl(var(--primary))", 
    isHub: true,
    flag: "🇦🇪",
    region: "Middle East",
    joinedDate: "Feb 2024",
    activeMembers: 520,
    postsThisMonth: 380,
    topSkills: ["Business", "Finance", "Real Estate", "Hospitality"],
    highlights: ["Expat hub", "Business networking", "High engagement"],
    growthRate: 42
  },
  { 
    name: "Saudi Arabia", 
    coordinates: [45.0792, 23.8859], 
    members: 650, 
    color: "hsl(var(--primary))", 
    isHub: false,
    flag: "🇸🇦",
    region: "Middle East",
    joinedDate: "Mar 2024",
    activeMembers: 410,
    postsThisMonth: 290,
    topSkills: ["Engineering", "Healthcare", "Construction", "Education"],
    highlights: ["Professional network", "Career growth focus"],
    growthRate: 35
  },
  { 
    name: "Qatar", 
    coordinates: [51.1839, 25.3548], 
    members: 280, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇶🇦",
    region: "Middle East",
    joinedDate: "Apr 2024",
    activeMembers: 180,
    postsThisMonth: 120,
    topSkills: ["Sports", "Media", "Construction", "Finance"],
    highlights: ["Sports community", "Media professionals"],
    growthRate: 30
  },
  { 
    name: "Kuwait", 
    coordinates: [47.4818, 29.3117], 
    members: 150, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇰🇼",
    region: "Middle East",
    joinedDate: "May 2024",
    activeMembers: 95,
    postsThisMonth: 55,
    topSkills: ["Oil & Gas", "Banking", "Trading", "Retail"],
    highlights: ["Business focused", "Growing steadily"],
    growthRate: 22
  },
  { 
    name: "Malaysia", 
    coordinates: [101.9758, 4.2105], 
    members: 420, 
    color: "hsl(var(--primary))", 
    isHub: false,
    flag: "🇲🇾",
    region: "Southeast Asia",
    joinedDate: "Mar 2024",
    activeMembers: 270,
    postsThisMonth: 185,
    topSkills: ["Tech", "Halal Industry", "Education", "Tourism"],
    highlights: ["Multicultural hub", "Tech community"],
    growthRate: 33
  },
  { 
    name: "Singapore", 
    coordinates: [103.8198, 1.3521], 
    members: 180, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇸🇬",
    region: "Southeast Asia",
    joinedDate: "Apr 2024",
    activeMembers: 130,
    postsThisMonth: 95,
    topSkills: ["FinTech", "Startups", "Trading", "Consulting"],
    highlights: ["Startup ecosystem", "High-value network"],
    growthRate: 28
  },
  { 
    name: "USA", 
    coordinates: [-95.7129, 37.0902], 
    members: 350, 
    color: "hsl(var(--primary))", 
    isHub: true,
    flag: "🇺🇸",
    region: "North America",
    joinedDate: "Feb 2024",
    activeMembers: 220,
    postsThisMonth: 165,
    topSkills: ["Tech", "Healthcare", "Education", "Business"],
    highlights: ["Diaspora hub", "Professional network", "Mentorship active"],
    growthRate: 40
  },
  { 
    name: "UK", 
    coordinates: [-3.436, 55.3781], 
    members: 280, 
    color: "hsl(var(--primary))", 
    isHub: true,
    flag: "🇬🇧",
    region: "Europe",
    joinedDate: "Feb 2024",
    activeMembers: 185,
    postsThisMonth: 140,
    topSkills: ["Finance", "NHS", "Academia", "Tech"],
    highlights: ["Student community", "Professional growth"],
    growthRate: 36
  },
  { 
    name: "Canada", 
    coordinates: [-106.3468, 56.1304], 
    members: 190, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇨🇦",
    region: "North America",
    joinedDate: "Apr 2024",
    activeMembers: 125,
    postsThisMonth: 85,
    topSkills: ["Immigration", "Tech", "Healthcare", "Education"],
    highlights: ["Immigration support", "Welcoming community"],
    growthRate: 29
  },
  { 
    name: "Australia", 
    coordinates: [133.7751, -25.2744], 
    members: 120, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇦🇺",
    region: "Oceania",
    joinedDate: "May 2024",
    activeMembers: 78,
    postsThisMonth: 45,
    topSkills: ["Mining", "Healthcare", "Education", "IT"],
    highlights: ["New community", "High potential"],
    growthRate: 24
  },
  { 
    name: "Germany", 
    coordinates: [10.4515, 51.1657], 
    members: 95, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇩🇪",
    region: "Europe",
    joinedDate: "Jun 2024",
    activeMembers: 62,
    postsThisMonth: 38,
    topSkills: ["Engineering", "Automotive", "Research", "Manufacturing"],
    highlights: ["Engineering focus", "Research community"],
    growthRate: 20
  },
  { 
    name: "Italy", 
    coordinates: [12.5674, 41.8719], 
    members: 75, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇮🇹",
    region: "Europe",
    joinedDate: "Jul 2024",
    activeMembers: 48,
    postsThisMonth: 28,
    topSkills: ["Fashion", "Food Industry", "Tourism", "Art"],
    highlights: ["Creative community", "Cultural exchange"],
    growthRate: 18
  },
  { 
    name: "Japan", 
    coordinates: [138.2529, 36.2048], 
    members: 85, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇯🇵",
    region: "East Asia",
    joinedDate: "Jun 2024",
    activeMembers: 55,
    postsThisMonth: 32,
    topSkills: ["Technology", "Manufacturing", "Research", "Language Teaching"],
    highlights: ["Tech enthusiasts", "Cultural bridge"],
    growthRate: 22
  },
  { 
    name: "South Korea", 
    coordinates: [127.7669, 35.9078], 
    members: 60, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇰🇷",
    region: "East Asia",
    joinedDate: "Jul 2024",
    activeMembers: 38,
    postsThisMonth: 22,
    topSkills: ["K-Content", "Tech", "Beauty Industry", "Education"],
    highlights: ["K-culture fans", "Tech savvy"],
    growthRate: 25
  },
  { 
    name: "Oman", 
    coordinates: [55.9754, 21.4735], 
    members: 120, 
    color: "hsl(var(--accent))", 
    isHub: false,
    flag: "🇴🇲",
    region: "Middle East",
    joinedDate: "May 2024",
    activeMembers: 78,
    postsThisMonth: 45,
    topSkills: ["Oil & Gas", "Tourism", "Logistics", "Healthcare"],
    highlights: ["Growing community", "Professional focus"],
    growthRate: 23
  },
];

// Connection lines from Bangladesh hub to other countries
const connectionLines: Array<{
  from: [number, number];
  to: [number, number];
  strength: "strong" | "medium" | "light";
}> = [
  { from: [90.3563, 23.685], to: [53.8478, 23.4241], strength: "strong" },
  { from: [90.3563, 23.685], to: [-3.436, 55.3781], strength: "strong" },
  { from: [90.3563, 23.685], to: [-95.7129, 37.0902], strength: "strong" },
  { from: [90.3563, 23.685], to: [78.9629, 20.5937], strength: "strong" },
  { from: [90.3563, 23.685], to: [84.124, 28.3949], strength: "medium" },
  { from: [90.3563, 23.685], to: [80.7718, 7.8731], strength: "medium" },
  { from: [90.3563, 23.685], to: [69.3451, 30.3753], strength: "medium" },
  { from: [90.3563, 23.685], to: [45.0792, 23.8859], strength: "medium" },
  { from: [90.3563, 23.685], to: [51.1839, 25.3548], strength: "light" },
  { from: [90.3563, 23.685], to: [47.4818, 29.3117], strength: "light" },
  { from: [90.3563, 23.685], to: [55.9754, 21.4735], strength: "light" },
  { from: [90.3563, 23.685], to: [101.9758, 4.2105], strength: "medium" },
  { from: [90.3563, 23.685], to: [103.8198, 1.3521], strength: "light" },
  { from: [90.3563, 23.685], to: [138.2529, 36.2048], strength: "light" },
  { from: [90.3563, 23.685], to: [127.7669, 35.9078], strength: "light" },
  { from: [90.3563, 23.685], to: [10.4515, 51.1657], strength: "light" },
  { from: [90.3563, 23.685], to: [12.5674, 41.8719], strength: "light" },
  { from: [90.3563, 23.685], to: [-106.3468, 56.1304], strength: "light" },
  { from: [90.3563, 23.685], to: [133.7751, -25.2744], strength: "light" },
  { from: [53.8478, 23.4241], to: [-3.436, 55.3781], strength: "medium" },
  { from: [-3.436, 55.3781], to: [-95.7129, 37.0902], strength: "medium" },
  { from: [78.9629, 20.5937], to: [53.8478, 23.4241], strength: "medium" },
];

// Country Detail Modal Component
const CountryDetailModal = ({ 
  location, 
  isOpen, 
  onClose 
}: { 
  location: LocationData | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const { t } = useLanguage();
  
  if (!location) return null;

  const engagementRate = Math.round((location.activeMembers / location.members) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl">{location.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                {location.name}
                {location.isHub && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    {t("Major Hub", "প্রধান হাব")}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{location.region}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{location.members.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t("Total Members", "মোট সদস্য")}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{location.activeMembers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t("Active Members", "সক্রিয় সদস্য")}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <MessageSquare className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{location.postsThisMonth}</div>
              <div className="text-xs text-muted-foreground">{t("Posts This Month", "এই মাসে পোস্ট")}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{location.joinedDate}</div>
              <div className="text-xs text-muted-foreground">{t("Joined", "যোগদান")}</div>
            </div>
          </div>

          {/* Engagement & Growth */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t("Community Health", "কমিউনিটি স্বাস্থ্য")}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("Engagement Rate", "এনগেজমেন্ট রেট")}</span>
                <span className="font-medium text-foreground">{engagementRate}%</span>
              </div>
              <Progress value={engagementRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("Monthly Growth", "মাসিক প্রবৃদ্ধি")}</span>
                <span className="font-medium text-green-600">+{location.growthRate}%</span>
              </div>
              <Progress value={location.growthRate} className="h-2" />
            </div>
          </div>

          {/* Top Skills */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              {t("Top Skills", "শীর্ষ দক্ষতা")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {location.topSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Community Highlights */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              {t("Community Highlights", "কমিউনিটি হাইলাইটস")}
            </h4>
            <ul className="space-y-2">
              {location.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Button className="w-full" size="lg">
            {t("Join This Community", "এই কমিউনিটিতে যোগ দিন")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WorldMapSection = () => {
  const { t } = useLanguage();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalMembers = memberLocations.reduce((sum, loc) => sum + loc.members, 0);

  const lineStyles = useMemo(() => ({
    strong: { strokeWidth: 1.5, opacity: 0.6, dashArray: "none" },
    medium: { strokeWidth: 1, opacity: 0.4, dashArray: "4,4" },
    light: { strokeWidth: 0.5, opacity: 0.25, dashArray: "2,4" },
  }), []);

  const handleMarkerClick = (location: LocationData) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Globe className="w-4 h-4" />
            <span>{t("Global Community", "বৈশ্বিক কমিউনিটি")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("United Across the World", "বিশ্বজুড়ে ঐক্যবদ্ধ")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Building bridges of unity from South Asia to every corner of the globe. Click on any country to explore!",
              "দক্ষিণ এশিয়া থেকে বিশ্বের প্রতিটি কোণে ঐক্যের সেতুবন্ধন। এক্সপ্লোর করতে যেকোনো দেশে ক্লিক করুন!"
            )}
          </p>
        </div>

        {/* Map Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow effect behind map */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-3xl opacity-50 rounded-3xl" />
          
          <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-4 md:p-8 shadow-xl">
            {/* CSS for animated lines */}
            <style>{`
              @keyframes flowLine {
                0% { stroke-dashoffset: 20; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
              }
              .animated-line {
                animation: flowLine 2s linear infinite;
              }
              .pulse-line {
                animation: pulseGlow 3s ease-in-out infinite;
              }
              .marker-clickable {
                cursor: pointer;
                transition: transform 0.2s ease;
              }
              .marker-clickable:hover {
                transform: scale(1.2);
              }
            `}</style>
            
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
                center: [60, 25],
              }}
              className="w-full h-auto"
              style={{ maxHeight: "500px" }}
            >
              <defs>
                <linearGradient id="lineGradientPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGradientAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "hsl(var(--muted-foreground)/0.3)", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Animated connection lines */}
              {connectionLines.map((line, index) => {
                const style = lineStyles[line.strength];
                return (
                  <g key={`line-${index}`}>
                    <Line
                      from={line.from}
                      to={line.to}
                      stroke="url(#lineGradientPrimary)"
                      strokeWidth={style.strokeWidth + 2}
                      strokeOpacity={style.opacity * 0.3}
                      strokeLinecap="round"
                      className="pulse-line"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    />
                    <Line
                      from={line.from}
                      to={line.to}
                      stroke="url(#lineGradientAccent)"
                      strokeWidth={style.strokeWidth}
                      strokeOpacity={style.opacity}
                      strokeLinecap="round"
                      strokeDasharray={line.strength === "strong" ? "8,4" : style.dashArray}
                      className={line.strength === "strong" ? "animated-line" : ""}
                      style={{ 
                        animationDelay: `${index * 0.15}s`,
                        filter: line.strength === "strong" ? "url(#glow)" : "none"
                      }}
                    />
                  </g>
                );
              })}

              {/* Member markers */}
              {memberLocations.map((location, index) => (
                <Marker
                  key={location.name}
                  coordinates={location.coordinates}
                  onMouseEnter={() => setHoveredLocation(location.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => handleMarkerClick(location)}
                  className="marker-clickable"
                >
                  {/* Outer pulse ring for hubs */}
                  {location.isHub && (
                    <circle
                      r={Math.min(location.members / 80, 20) + 6}
                      fill="none"
                      stroke={location.color}
                      strokeWidth={1}
                      opacity={0.3}
                      className="animate-ping"
                      style={{ animationDuration: `${2.5 + index * 0.1}s` }}
                    />
                  )}
                  {/* Pulse ring */}
                  <circle
                    r={Math.min(location.members / 100, 15) + 4}
                    fill="none"
                    stroke={location.color}
                    strokeWidth={1.5}
                    opacity={0.4}
                    className="animate-ping"
                    style={{ animationDuration: `${2 + index * 0.2}s` }}
                  />
                  {/* Main dot */}
                  <circle
                    r={Math.min(location.members / 150, 10) + 3}
                    fill={location.color}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    style={{
                      filter: `drop-shadow(0 0 ${location.members > 500 ? 10 : 5}px ${location.color})`,
                    }}
                  />
                  {/* Inner glow */}
                  <circle
                    r={Math.min(location.members / 300, 5) + 1}
                    fill="white"
                    opacity={0.7}
                  />
                  
                  {/* Tooltip */}
                  {hoveredLocation === location.name && (
                    <g>
                      <rect
                        x={-50}
                        y={-55}
                        width={100}
                        height={45}
                        rx={8}
                        fill="hsl(var(--popover))"
                        stroke="hsl(var(--border))"
                        strokeWidth={1}
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
                      />
                      <text
                        textAnchor="middle"
                        y={-35}
                        className="fill-foreground font-semibold"
                        style={{ fontSize: "11px" }}
                      >
                        {location.flag} {location.name}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-20}
                        className="fill-muted-foreground"
                        style={{ fontSize: "9px" }}
                      >
                        {location.members.toLocaleString()} members • Click for details
                      </text>
                    </g>
                  )}
                </Marker>
              ))}
            </ComposableMap>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
                <span className="text-sm text-muted-foreground">{t("Major Hub", "প্রধান হাব")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/30" />
                <span className="text-sm text-muted-foreground">{t("Growing Community", "বর্ধনশীল কমিউনিটি")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded" />
                <span className="text-sm text-muted-foreground">{t("Unity Network", "ঐক্য নেটওয়ার্ক")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats below map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              {memberLocations.length}+
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Countries", "দেশ")}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
              {(totalMembers / 1000).toFixed(0)}K+
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Members", "সদস্য")}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              6
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Continents", "মহাদেশ")}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
              24/7
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Active Community", "সক্রিয় কমিউনিটি")}
            </div>
          </div>
        </div>
      </div>

      {/* Country Detail Modal */}
      <CountryDetailModal
        location={selectedLocation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default memo(WorldMapSection);
