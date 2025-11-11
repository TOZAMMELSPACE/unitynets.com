import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Moon, 
  Sun, 
  Plus, 
  Search, 
  Filter, 
  Home, 
  Globe, 
  TrendingUp, 
  Calendar,
  Briefcase,
  X
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface HeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  onCreatePost?: () => void;
  onFilterChange?: (filters: {
    search: string;
    community: string;
    postType: string;
    sortBy: string;
  }) => void;
}

export const Header = ({ currentUser, onSignOut, onCreatePost, onFilterChange }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [community, setCommunity] = useState("all");
  const [postType, setPostType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleFilterChange = () => {
    if (onFilterChange) {
      onFilterChange({
        search,
        community,
        postType,
        sortBy
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCommunity("all");
    setPostType("all");
    setSortBy("recent");
    if (onFilterChange) {
      onFilterChange({
        search: "",
        community: "all",
        postType: "all",
        sortBy: "recent"
      });
    }
  };

  const activeFiltersCount = [
    search,
    community !== "all" ? community : null,
    postType !== "all" ? postType : null,
    sortBy !== "recent" ? sortBy : null
  ].filter(Boolean).length;

  return (
    <header className="card-enhanced p-2 lg:p-4 mb-4 lg:mb-6">
      <div className="flex flex-col gap-3 lg:gap-4">
        {/* Top Row: Logo + Create Post + Theme + Profile + Sign Out */}
        <div className="flex flex-nowrap items-center gap-1 lg:gap-3">
          {/* UnityNet Logo with Slogan */}
          <div className="flex flex-col mr-1 lg:mr-4 flex-shrink-0">
            <h1 className="text-sm lg:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
              UnityNet
            </h1>
            <p className="hidden lg:block text-xs text-muted-foreground text-bengali -mt-1">
              একত্রে শক্তিশালী
            </p>
          </div>

          {/* Create Post Button */}
          {currentUser && onCreatePost && (
            <Button
              onClick={onCreatePost}
              className="btn-hero flex items-center gap-1 px-2 py-1 lg:px-4 lg:py-2 shadow-elegant hover:shadow-glow transition-all duration-300 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline text-xs lg:text-base">
                {t("New Post", "নতুন পোস্ট")}
              </span>
            </Button>
          )}
          
          {/* Welcome Text */}
          <div className="hidden md:flex flex-col flex-1 min-w-0">
            <h2 className="text-base lg:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              Welcome to UnityNet
            </h2>
            <p className="text-xs text-muted-foreground text-bengali truncate">
              এই প্ল্যাটফর্মে আপনি স্থানীয় কমিউনিটির সাথে যুক্ত হতে পারেন, জ্ঞান শেয়ার করতে পারেন এবং নতুন কিছু শিখতে পারেন।
            </p>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-3 ml-auto flex-shrink-0">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-6 w-6 lg:h-8 lg:w-8 p-0 hover:bg-primary/10 bg-gradient-to-r from-primary/5 to-accent/10 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 flex-shrink-0"
            >
              <Sun className="h-3 w-3 lg:h-4 lg:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
              <Moon className="absolute h-3 w-3 lg:h-4 lg:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* Profile and Sign Out */}
            {currentUser ? (
              <>
                <div className="text-right bg-gradient-to-r from-primary/15 to-accent/20 px-1.5 py-1 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl border border-primary/30 shadow-elegant hover:shadow-glow transition-all duration-300 backdrop-blur-sm flex-shrink-0">
                  <div className="font-bold text-primary text-[10px] lg:text-lg truncate max-w-[60px] lg:max-w-none">{currentUser.name}</div>
                  <div className="trust-score text-[8px] lg:text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                    {Math.round(currentUser.trustScore)}
                  </div>
                </div>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-primary/5 to-accent/10 text-[10px] lg:text-sm px-2 py-1 lg:px-4 lg:py-2 flex-shrink-0 h-6 lg:h-9"
                >
                  {t("Sign Out", "আউট")}
                </Button>
              </>
            ) : (
              <div className="text-muted-foreground text-xs lg:text-sm">
                {t("Sign In", "সাইন ইন")}
              </div>
            )}
          </div>
        </div>

        {/* Welcome Text - Mobile Only */}
        <div className="md:hidden w-full pt-2 border-t border-primary/10">
          <h2 className="text-lg font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to UnityNet
          </h2>
          <p className="text-xs text-muted-foreground text-bengali leading-relaxed">
            এই প্ল্যাটফর্মে আপনি স্থানীয় কমিউনিটির সাথে যুক্ত হতে পারেন, জ্ঞান শেয়ার করতে পারেন এবং নতুন কিছু শিখতে পারেন।
          </p>
        </div>

        {/* Search and Filters */}
        {onFilterChange && (
          <div className="w-full space-y-3 pt-3 border-t border-primary/10">
            {/* Search and filter button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleFilterChange();
                  }}
                  placeholder="পোস্ট, ইউজার বা হ্যাশট্যাগ খুঁজুন..."
                  className="pl-10 bg-muted/20 border-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative border-primary/30 hover:bg-primary/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                ফিল্টার
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Quick filter buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={community === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCommunity("all");
                  handleFilterChange();
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                সব
              </Button>
              <Button
                variant={community === "global" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCommunity("global");
                  handleFilterChange();
                }}
              >
                <Globe className="w-4 h-4 mr-2" />
                গ্লোবাল
              </Button>
              <Button
                variant={sortBy === "trending" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSortBy("trending");
                  handleFilterChange();
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                ট্রেন্ডিং
              </Button>
              <Button
                variant={postType === "event" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPostType("event");
                  handleFilterChange();
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                ইভেন্ট
              </Button>
              <Button
                variant={postType === "job" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPostType("job");
                  handleFilterChange();
                }}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                কাজ
              </Button>
            </div>

            {/* Advanced filters */}
            {isFilterOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
                <Select value={community} onValueChange={setCommunity}>
                  <SelectTrigger>
                    <SelectValue placeholder="কমিউনিটি" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব কমিউনিটি</SelectItem>
                    <SelectItem value="global">🌍 Global</SelectItem>
                    <SelectItem value="ward-1">🏘️ Ward-1</SelectItem>
                    <SelectItem value="ward-2">🏘️ Ward-2</SelectItem>
                    <SelectItem value="ward-3">🏘️ Ward-3</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger>
                    <SelectValue placeholder="পোস্ট টাইপ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ধরনের পোস্ট</SelectItem>
                    <SelectItem value="text">📝 টেক্সট</SelectItem>
                    <SelectItem value="image">🖼️ ছবি</SelectItem>
                    <SelectItem value="video">🎥 ভিডিও</SelectItem>
                    <SelectItem value="poll">📊 পোল</SelectItem>
                    <SelectItem value="event">🎟️ ইভেন্ট</SelectItem>
                    <SelectItem value="job">💼 কাজ</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="সাজানো" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">সর্বশেষ</SelectItem>
                    <SelectItem value="trending">ট্রেন্ডিং</SelectItem>
                    <SelectItem value="popular">জনপ্রিয়</SelectItem>
                    <SelectItem value="most_liked">বেশি লাইক</SelectItem>
                    <SelectItem value="most_commented">বেশি কমেন্ট</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Active filters and clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <Badge variant="secondary">
                      খোঁজ: "{search}"
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => {
                        setSearch("");
                        handleFilterChange();
                      }} />
                    </Badge>
                  )}
                  {community !== "all" && (
                    <Badge variant="secondary">
                      {community === "global" ? "গ্লোবাল" : community}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => {
                        setCommunity("all");
                        handleFilterChange();
                      }} />
                    </Badge>
                  )}
                  {postType !== "all" && (
                    <Badge variant="secondary">
                      {postType === "text" ? "টেক্সট" : 
                       postType === "image" ? "ছবি" :
                       postType === "event" ? "ইভেন্ট" : 
                       postType === "job" ? "কাজ" : postType}
                      <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => {
                        setPostType("all");
                        handleFilterChange();
                      }} />
                    </Badge>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  পরিষ্কার করুন
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};