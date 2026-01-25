import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Home, 
  Globe, 
  TrendingUp, 
  GraduationCap,
  Calendar,
  Briefcase,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedFilterProps {
  onFilterChange: (filters: {
    search: string;
    community: string;
    postType: string;
    sortBy: string;
  }) => void;
}

export const FeedFilter = ({ onFilterChange }: FeedFilterProps) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [community, setCommunity] = useState("all");
  const [postType, setPostType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      search,
      community,
      postType,
      sortBy
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCommunity("all");
    setPostType("all");
    setSortBy("recent");
    onFilterChange({
      search: "",
      community: "all",
      postType: "all",
      sortBy: "recent"
    });
  };

  const activeFiltersCount = [
    search,
    community !== "all" ? community : null,
    postType !== "all" ? postType : null,
    sortBy !== "recent" ? sortBy : null
  ].filter(Boolean).length;

  return (
    <div className="card-enhanced p-4 space-y-4">
      {/* Search and quick filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            placeholder={t("Search posts, users or hashtags...", "পোস্ট, ইউজার বা হ্যাশট্যাগ খুঁজুন...")}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          {t("Filter", "ফিল্টার")}
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
          {t("All", "সব")}
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
          {t("Global", "গ্লোবাল")}
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
          {t("Trending", "ট্রেন্ডিং")}
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
          {t("Event", "ইভেন্ট")}
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
          {t("Job", "কাজ")}
        </Button>
      </div>

      {/* Advanced filters */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
          <Select value={community} onValueChange={setCommunity}>
            <SelectTrigger>
              <SelectValue placeholder={t("Community", "কমিউনিটি")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Communities", "সব কমিউনিটি")}</SelectItem>
              <SelectItem value="global">🌍 {t("Global", "গ্লোবাল")}</SelectItem>
              <SelectItem value="ward-1">🏘️ Ward-1</SelectItem>
              <SelectItem value="ward-2">🏘️ Ward-2</SelectItem>
              <SelectItem value="ward-3">🏘️ Ward-3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue placeholder={t("Post Type", "পোস্ট টাইপ")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Post Types", "সব ধরনের পোস্ট")}</SelectItem>
              <SelectItem value="text">📝 {t("Text", "টেক্সট")}</SelectItem>
              <SelectItem value="image">🖼️ {t("Image", "ছবি")}</SelectItem>
              <SelectItem value="video">🎥 {t("Video", "ভিডিও")}</SelectItem>
              <SelectItem value="poll">📊 {t("Poll", "পোল")}</SelectItem>
              <SelectItem value="event">🎟️ {t("Event", "ইভেন্ট")}</SelectItem>
              <SelectItem value="job">💼 {t("Job", "কাজ")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder={t("Sort By", "সাজানো")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("Latest", "সর্বশেষ")}</SelectItem>
              <SelectItem value="trending">{t("Trending", "ট্রেন্ডিং")}</SelectItem>
              <SelectItem value="popular">{t("Popular", "জনপ্রিয়")}</SelectItem>
              <SelectItem value="most_liked">{t("Most Liked", "বেশি লাইক")}</SelectItem>
              <SelectItem value="most_commented">{t("Most Commented", "বেশি কমেন্ট")}</SelectItem>
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
                {t("Search", "খোঁজ")}: "{search}"
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => {
                  setSearch("");
                  handleFilterChange();
                }} />
              </Badge>
            )}
            {community !== "all" && (
              <Badge variant="secondary">
                {community === "global" ? t("Global", "গ্লোবাল") : community}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => {
                  setCommunity("all");
                  handleFilterChange();
                }} />
              </Badge>
            )}
            {postType !== "all" && (
              <Badge variant="secondary">
                {postType === "text" ? t("Text", "টেক্সট") : 
                 postType === "image" ? t("Image", "ছবি") :
                 postType === "event" ? t("Event", "ইভেন্ট") : 
                 postType === "job" ? t("Job", "কাজ") : postType}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => {
                  setPostType("all");
                  handleFilterChange();
                }} />
              </Badge>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            {t("Clear", "পরিষ্কার করুন")}
          </Button>
        </div>
      )}
    </div>
  );
};