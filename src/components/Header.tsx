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
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          {/* Top Row: Logo + Actions */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                Unity<span className="text-primary">Net</span>
              </h1>
              <span className="hidden md:inline-block text-sm text-muted-foreground font-medium">
                Trust • Learn • Unite
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Create Post */}
              {currentUser && onCreatePost && (
                <Button
                  onClick={onCreatePost}
                  variant="hero"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("New Post", "নতুন পোস্ট")}</span>
                </Button>
              )}
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              {/* User Profile */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-foreground">{currentUser.name}</span>
                    <span className="text-xs text-primary font-medium">
                      Score: {Math.round(currentUser.trustScore)}
                    </span>
                  </div>
                  <Button
                    onClick={onSignOut}
                    variant="outline"
                    size="sm"
                  >
                    {t("Sign Out", "সাইন আউট")}
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t("Sign In", "সাইন ইন")}
                </span>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          {onFilterChange && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      handleFilterChange();
                    }}
                    placeholder="Search posts, users, or hashtags..."
                    className="pl-11 h-11 bg-muted/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="relative h-11 px-4 rounded-xl"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All", icon: Home, filter: "community" },
                  { key: "global", label: "Global", icon: Globe, filter: "community" },
                  { key: "trending", label: "Trending", icon: TrendingUp, filter: "sort" },
                  { key: "event", label: "Events", icon: Calendar, filter: "type" },
                  { key: "job", label: "Jobs", icon: Briefcase, filter: "type" },
                ].map((item) => {
                  const isActive = 
                    (item.filter === "community" && community === item.key) ||
                    (item.filter === "sort" && sortBy === item.key) ||
                    (item.filter === "type" && postType === item.key);
                  
                  return (
                    <Button
                      key={item.key}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        if (item.filter === "community") setCommunity(item.key);
                        if (item.filter === "sort") setSortBy(item.key);
                        if (item.filter === "type") setPostType(item.key);
                        handleFilterChange();
                      }}
                      className="rounded-full"
                    >
                      <item.icon className="w-4 h-4 mr-1.5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              {/* Advanced Filters Panel */}
              {isFilterOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50 animate-fade-in">
                  <Select value={community} onValueChange={(v) => { setCommunity(v); handleFilterChange(); }}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0">
                      <SelectValue placeholder="Community" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Communities</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="ward-1">Ward-1</SelectItem>
                      <SelectItem value="ward-2">Ward-2</SelectItem>
                      <SelectItem value="ward-3">Ward-3</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={postType} onValueChange={(v) => { setPostType(v); handleFilterChange(); }}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0">
                      <SelectValue placeholder="Post Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="poll">Poll</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="job">Job</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v) => { setSortBy(v); handleFilterChange(); }}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="most_liked">Most Liked</SelectItem>
                      <SelectItem value="most_commented">Most Commented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Active:</span>
                  <div className="flex flex-wrap gap-2">
                    {search && (
                      <Badge variant="secondary" className="gap-1 rounded-full">
                        "{search}"
                        <X className="w-3 h-3 cursor-pointer" onClick={() => { setSearch(""); handleFilterChange(); }} />
                      </Badge>
                    )}
                    {community !== "all" && (
                      <Badge variant="secondary" className="gap-1 rounded-full">
                        {community}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => { setCommunity("all"); handleFilterChange(); }} />
                      </Badge>
                    )}
                    {postType !== "all" && (
                      <Badge variant="secondary" className="gap-1 rounded-full">
                        {postType}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => { setPostType("all"); handleFilterChange(); }} />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};