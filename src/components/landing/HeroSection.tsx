import { memo, useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, Users, Sparkles, TrendingUp, MessageSquare, Heart, Award, Calendar, Loader2, ZoomIn, ZoomOut, RotateCcw, Move, Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLocationStats, AggregatedLocation } from "@/hooks/useLocationStats";

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

export const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Zoom and pan state
  const [position, setPosition] = useState({ coordinates: [60, 20] as [number, number], zoom: 1 });
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Fetch real location data from database
  const { locations: realLocations, totalMembers: realTotalMembers, countriesCount, loading, hasData } = useLocationStats();
  
  // Smooth zoom to location animation
  const animateToLocation = useCallback((coordinates: [number, number], targetZoom: number = 3, onComplete?: () => void) => {
    setIsAnimating(true);
    
    const startCoords = position.coordinates;
    const startZoom = position.zoom;
    const duration = 800; // ms
    const startTime = Date.now();
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      
      const newCoords: [number, number] = [
        startCoords[0] + (coordinates[0] - startCoords[0]) * eased,
        startCoords[1] + (coordinates[1] - startCoords[1]) * eased
      ];
      const newZoom = startZoom + (targetZoom - startZoom) * eased;
      
      setPosition({ coordinates: newCoords, zoom: newZoom });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [position.coordinates, position.zoom]);
  
  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }, [position.zoom]);

  const handleZoomOut = useCallback(() => {
    if (position.zoom <= 0.5) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }, [position.zoom]);

  const handleReset = useCallback(() => {
    setIsAnimating(true);
    const startCoords = position.coordinates;
    const startZoom = position.zoom;
    const targetCoords: [number, number] = [60, 20];
    const targetZoom = 1;
    const duration = 600;
    const startTime = Date.now();
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      
      const newCoords: [number, number] = [
        startCoords[0] + (targetCoords[0] - startCoords[0]) * eased,
        startCoords[1] + (targetCoords[1] - startCoords[1]) * eased
      ];
      const newZoom = startZoom + (targetZoom - startZoom) * eased;
      
      setPosition({ coordinates: newCoords, zoom: newZoom });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [position.coordinates, position.zoom]);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    if (!isAnimating) {
      setPosition(pos);
    }
  }, [isAnimating]);

  // Merge real data with fallback data
  const displayLocations = useMemo(() => {
    if (!hasData) {
      return memberLocations;
    }

    const merged: LocationData[] = [];
    const seenNames = new Set<string>();

    realLocations.forEach(realLoc => {
      const fallback = memberLocations.find(m => m.name === realLoc.name);
      seenNames.add(realLoc.name);
      
      merged.push({
        name: realLoc.name,
        coordinates: realLoc.coordinates,
        members: realLoc.members,
        color: realLoc.color,
        isHub: realLoc.isHub,
        flag: realLoc.flag,
        region: realLoc.region,
        joinedDate: fallback?.joinedDate || "2024",
        activeMembers: fallback?.activeMembers || Math.floor(realLoc.members * 0.65),
        postsThisMonth: fallback?.postsThisMonth || Math.floor(realLoc.members * 0.3),
        topSkills: fallback?.topSkills || ["Community Building", "Networking"],
        highlights: fallback?.highlights || ["Active community members"],
        growthRate: fallback?.growthRate || 20,
      });
    });

    return merged;
  }, [realLocations, hasData]);

  const totalMembers = hasData ? realTotalMembers : memberLocations.reduce((sum, loc) => sum + loc.members, 0);
  const displayCountriesCount = hasData ? countriesCount : memberLocations.length;

  const lineStyles = useMemo(() => ({
    strong: { strokeWidth: 1.5, opacity: 0.5, dashArray: "none" },
    medium: { strokeWidth: 1, opacity: 0.35, dashArray: "4,4" },
    light: { strokeWidth: 0.5, opacity: 0.2, dashArray: "2,4" },
  }), []);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const filtered = displayLocations.filter(loc =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.region.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  }, [displayLocations]);

  const handleSearchSelect = useCallback((location: LocationData) => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
    setSelectedLocation(location);
    animateToLocation(location.coordinates, 4, () => {
      setIsModalOpen(true);
    });
  }, [animateToLocation]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return !prev;
    });
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // Close search on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen]);

  const handleMarkerClick = (location: LocationData) => {
    setSelectedLocation(location);
    // Animate zoom to the clicked location, then open modal
    animateToLocation(location.coordinates, 4, () => {
      setIsModalOpen(true);
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* World Map Background - More visible */}
      <div className="absolute inset-0">
        {/* Lighter gradient overlay for better map visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 z-10 pointer-events-none" />
        
        {/* CSS for animated lines */}
        <style>{`
          @keyframes flowLine {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.5; }
          }
          @keyframes floatUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes floatUpDelay1 {
            0%, 10% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes floatUpDelay2 {
            0%, 20% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes floatUpDelay3 {
            0%, 30% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes floatUpDelay4 {
            0%, 40% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animated-line {
            animation: flowLine 2s linear infinite;
          }
          .pulse-line {
            animation: pulseGlow 3s ease-in-out infinite;
          }
          .float-up {
            animation: floatUp 0.8s ease-out forwards;
          }
          .float-up-1 {
            animation: floatUpDelay1 1s ease-out forwards;
          }
          .float-up-2 {
            animation: floatUpDelay2 1.2s ease-out forwards;
          }
          .float-up-3 {
            animation: floatUpDelay3 1.4s ease-out forwards;
          }
          .float-up-4 {
            animation: floatUpDelay4 1.6s ease-out forwards;
          }
          .marker-clickable {
            cursor: pointer;
            transition: transform 0.2s ease;
          }
          .marker-clickable:hover {
            transform: scale(1.2);
          }
        `}</style>
        
        {/* Map - More visible with zoom/pan */}
        <div className="absolute inset-0 opacity-90">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 180,
            }}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id="heroLineGradientPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="heroLineGradientAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              </linearGradient>
              <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              minZoom={0.5}
              maxZoom={8}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--primary)/0.15)"
                      stroke="hsl(var(--primary)/0.4)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "hsl(var(--primary)/0.25)", outline: "none", cursor: "grab" },
                        pressed: { outline: "none", cursor: "grabbing" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Animated connection lines */}
              {connectionLines.map((line, index) => {
                const style = lineStyles[line.strength];
                return (
                  <g key={`hero-line-${index}`}>
                    <Line
                      from={line.from}
                      to={line.to}
                      stroke="url(#heroLineGradientPrimary)"
                      strokeWidth={(style.strokeWidth + 1.5) / position.zoom}
                      strokeOpacity={style.opacity * 0.4}
                      strokeLinecap="round"
                      className="pulse-line"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    />
                    <Line
                      from={line.from}
                      to={line.to}
                      stroke="url(#heroLineGradientAccent)"
                      strokeWidth={style.strokeWidth / position.zoom}
                      strokeOpacity={style.opacity * 1.2}
                      strokeLinecap="round"
                      strokeDasharray={line.strength === "strong" ? "8,4" : style.dashArray}
                      className={line.strength === "strong" ? "animated-line" : ""}
                      style={{ 
                        animationDelay: `${index * 0.15}s`,
                        filter: line.strength === "strong" ? "url(#heroGlow)" : "none"
                      }}
                    />
                  </g>
                );
              })}

              {/* Member markers */}
              {displayLocations.map((location, index) => (
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
                      r={(Math.min(location.members / 100, 16) + 4) / position.zoom}
                      fill="none"
                      stroke={location.color}
                      strokeWidth={1.5 / position.zoom}
                      opacity={0.35}
                      className="animate-ping"
                      style={{ animationDuration: `${2.5 + index * 0.1}s` }}
                    />
                  )}
                  {/* Pulse ring */}
                  <circle
                    r={(Math.min(location.members / 120, 12) + 3) / position.zoom}
                    fill="none"
                    stroke={location.color}
                    strokeWidth={1.5 / position.zoom}
                    opacity={0.45}
                    className="animate-ping"
                    style={{ animationDuration: `${2 + index * 0.2}s` }}
                  />
                  {/* Main dot - larger and more visible */}
                  <circle
                    r={(Math.min(location.members / 150, 10) + 3) / position.zoom}
                    fill={location.color}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    style={{
                      filter: `drop-shadow(0 0 ${location.members > 500 ? 12 : 6}px ${location.color})`,
                    }}
                  />
                  {/* Inner glow */}
                  <circle
                    r={(Math.min(location.members / 300, 5) + 1.5) / position.zoom}
                    fill="white"
                    opacity={0.7}
                  />
                  
                  {/* Tooltip */}
                  {hoveredLocation === location.name && (
                    <g transform={`scale(${1 / position.zoom})`}>
                      <rect
                        x={-55}
                        y={-60}
                        width={110}
                        height={50}
                        rx={8}
                        fill="hsl(var(--popover))"
                        stroke="hsl(var(--border))"
                        strokeWidth={1}
                        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                      />
                      <text
                        textAnchor="middle"
                        y={-38}
                        className="fill-foreground font-semibold"
                        style={{ fontSize: "11px" }}
                      >
                        {location.flag} {location.name}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-22}
                        className="fill-muted-foreground"
                        style={{ fontSize: "9px" }}
                      >
                        {location.members.toLocaleString()} members
                      </text>
                    </g>
                  )}
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
        
        {/* Search Controls */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-30 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={toggleSearch}
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </Button>
            
            {isSearchOpen && (
              <div className="relative animate-fade-in">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("Search country or region...", "দেশ বা অঞ্চল খুঁজুন...")}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-56 md:w-72 bg-background/95 backdrop-blur-sm border-border shadow-lg pl-3 pr-8"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto w-56 md:w-72 animate-fade-in">
              {searchResults.map((location) => (
                <button
                  key={location.name}
                  onClick={() => handleSearchSelect(location)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3 border-b border-border/50 last:border-b-0"
                >
                  <span className="text-xl">{location.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{location.name}</div>
                    <div className="text-xs text-muted-foreground">{location.region} • {location.members.toLocaleString()} members</div>
                  </div>
                  {location.isHub && (
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full">Hub</span>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {isSearchOpen && searchQuery.length > 0 && searchResults.length === 0 && (
            <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 w-56 md:w-72 animate-fade-in">
              <p className="text-sm text-muted-foreground text-center">
                {t("No countries found", "কোন দেশ পাওয়া যায়নি")}
              </p>
            </div>
          )}
        </div>
        
        {/* Zoom Controls */}
        <div className="absolute bottom-24 right-4 md:bottom-32 md:right-8 z-30 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={handleZoomIn}
            disabled={position.zoom >= 8}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={handleZoomOut}
            disabled={position.zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Pan instruction hint */}
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 flex items-center gap-2 text-xs text-muted-foreground bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
          <Move className="w-3 h-3" />
          <span>{t("Drag to pan", "টেনে আনুন")}</span>
        </div>
      </div>

      {/* Floating Content */}
      <div className="relative z-20 container mx-auto px-4 py-20 md:py-28 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-md text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border border-primary/30 shadow-lg float-up">
          <Globe className="w-4 h-4 text-primary" />
          <span>🌍 {t("World Community Platform", "বিশ্ব কমিউনিটি প্ল্যাটফর্ম")}</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
        </div>

        {/* Main Heading */}
        <h1 className="hero-heading text-foreground mb-6 float-up-1 drop-shadow-lg">
          <span className="text-primary">Trust</span>
          <span className="text-muted-foreground mx-2 md:mx-3">•</span>
          <span className="text-accent">Learn</span>
          <span className="text-muted-foreground mx-2 md:mx-3">•</span>
          <span className="text-primary">Unite</span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl mt-3 block text-foreground/90">
            {t("Stronger Together", "একত্রে শক্তিশালী")}
          </span>
        </h1>

        {/* Subheading */}
        <p className="subheading max-w-3xl mx-auto mb-10 text-foreground/80 float-up-2 drop-shadow-sm">
          {t(
            "Build Together, Grow Together – Join the world's most trusted community platform for skill sharing and mutual growth. Building bridges of unity from South Asia to the world.",
            "Build Together, Grow Together – জয়েন করুন বিশ্বের সবচেয়ে বিশ্বস্ত কমিউনিটি প্ল্যাটফর্মে। দক্ষতা শেয়ার ও পারস্পরিক উন্নয়নের জন্য। দক্ষিণ এশিয়া থেকে সারা বিশ্বে ঐক্যের সেতুবন্ধন।"
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 float-up-3">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl group bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/auth?mode=signup')}
          >
            <span>{t("Join Free Now", "এখনই ফ্রি জয়েন করুন")}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 rounded-xl border-2 bg-background/70 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/auth?mode=login')}
          >
            <span>{t("Already a member? Login", "অলরেডি মেম্বার? লগইন করুন")}</span>
          </Button>
        </div>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 float-up-4">
          <div className="flex items-center gap-2 text-foreground bg-background/70 backdrop-blur-md px-5 py-3 rounded-full border border-border/50 shadow-lg hover:scale-105 transition-transform">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {totalMembers >= 1000 ? `${(totalMembers / 1000).toFixed(1)}K+` : `${totalMembers}+`} {t("Members", "সদস্য")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground bg-background/70 backdrop-blur-md px-5 py-3 rounded-full border border-border/50 shadow-lg hover:scale-105 transition-transform">
            <Globe className="w-5 h-5 text-accent" />
            <span className="font-semibold">{displayCountriesCount}+ {t("Countries", "দেশে")}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground bg-background/70 backdrop-blur-md px-5 py-3 rounded-full border border-border/50 shadow-lg hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">{t("Unity Network", "ঐক্য নেটওয়ার্ক")}</span>
          </div>
        </div>

        {/* Map interaction hint */}
        <p className="text-sm text-muted-foreground mt-8 float-up-4">
          {t("Click on any country marker to explore community details", "কমিউনিটির বিস্তারিত দেখতে যেকোনো দেশে ক্লিক করুন")}
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex items-start justify-center p-2 bg-background/50 backdrop-blur-sm">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
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

export default memo(HeroSection);
