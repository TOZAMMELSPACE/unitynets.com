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

interface FeedFilterProps {
  onFilterChange: (filters: {
    search: string;
    community: string;
    postType: string;
    sortBy: string;
  }) => void;
}

export const FeedFilter = ({ onFilterChange }: FeedFilterProps) => {
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
            placeholder="পোস্ট, ইউজার বা হ্যাশট্যাগ খুঁজুন..."
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="relative"
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
  );
};