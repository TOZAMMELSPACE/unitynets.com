import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Plus, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface HeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  onCreatePost?: () => void;
  onSearch?: (query: string) => void;
}

export const Header = ({ currentUser, onSignOut, onCreatePost, onSearch }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
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
    <header className="card-enhanced p-3 lg:p-4 mb-4 lg:mb-6">
      <div className="flex flex-col gap-3 lg:gap-4">
        {/* Top Row: Create Post + Theme + Profile */}
        <div className="flex justify-between items-center gap-2">
          {/* Create Post Button */}
          {currentUser && onCreatePost && (
            <Button
              onClick={onCreatePost}
              className="btn-hero flex items-center gap-2 px-3 py-2 lg:px-4 shadow-elegant hover:shadow-glow transition-all duration-300 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline text-sm lg:text-base">
                {t("New Post", "নতুন পোস্ট")}
              </span>
            </Button>
          )}
          
          <div className="flex items-center gap-2 lg:gap-3 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0 hover:bg-primary/10 bg-gradient-to-r from-primary/5 to-accent/10 border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 flex-shrink-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {currentUser ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="text-right bg-gradient-to-r from-primary/15 to-accent/20 px-2 py-2 lg:px-4 lg:py-3 rounded-xl border border-primary/30 shadow-elegant hover:shadow-glow transition-all duration-300 backdrop-blur-sm">
                  <div className="font-bold text-primary text-sm lg:text-lg truncate max-w-[100px] lg:max-w-none">{currentUser.name}</div>
                  <div className="trust-score text-xs lg:text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                    {t("Trust", "ট্রাস্ট")}: {Math.round(currentUser.trustScore)}
                  </div>
                </div>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-primary/5 to-accent/10 text-xs lg:text-sm flex-shrink-0"
                >
                  {t("Sign Out", "সাইন আউট")}
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                {t("Sign In", "সাইন ইন করুন")}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar - Full Width on Mobile */}
        {onSearch && (
          <div className="w-full">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("Search... (posts, users, topics)", "খুঁজুন... (পোস্ট, ইউজার, টপিক)")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/20 border-primary/20 focus:border-primary/40 transition-all w-full text-sm lg:text-base"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};