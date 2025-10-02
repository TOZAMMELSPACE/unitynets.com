import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Plus, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";

interface HeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  onCreatePost?: () => void;
  onSearch?: (query: string) => void;
}

export const Header = ({ currentUser, onSignOut, onCreatePost, onSearch }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="card-enhanced p-4 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Create Post Button */}
        {currentUser && onCreatePost && (
          <Button
            onClick={onCreatePost}
            className="btn-hero flex items-center gap-2 px-4 py-2 shadow-elegant hover:shadow-glow transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-bengali">নতুন পোস্ট</span>
          </Button>
        )}

        {/* Search Bar */}
        {onSearch && (
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="খুঁজুন... (পোস্ট, ইউজার, টপিক)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-bengali bg-muted/20 border-primary/20 focus:border-primary/40 transition-all"
              />
            </form>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 hover:bg-primary/10 bg-gradient-to-r from-primary/5 to-accent/10 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right bg-gradient-to-r from-primary/15 to-accent/20 px-4 py-3 rounded-xl border border-primary/30 shadow-elegant hover:shadow-glow transition-all duration-300 backdrop-blur-sm">
                <div className="font-bold text-bengali text-primary text-lg">{currentUser.name}</div>
                <div className="trust-score text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ট্রাস্ট: {Math.round(currentUser.trustScore)}
                </div>
              </div>
              <Button
                onClick={onSignOut}
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-sm hover:shadow-md transition-all duration-300 text-bengali bg-gradient-to-r from-primary/5 to-accent/10"
              >
                সাইন আউট
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground text-bengali">সাইন ইন করুন</div>
          )}
        </div>
      </div>
    </header>
  );
};