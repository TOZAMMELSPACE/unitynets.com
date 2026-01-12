import { useState, useEffect, memo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: t("Home", "হোম"), path: "/" },
    { name: t("About", "মিশন"), path: "/about" },
    { name: t("Learning Zone", "লার্নিং জোন"), path: "/learning-zone" },
    { name: t("Donation", "ডোনেশন"), path: "/donation" },
    { name: t("Feed", "ফিড"), path: "/feed" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo-optimized.webp" 
              alt="UnityNets Logo" 
              className="w-10 h-10 rounded-lg group-hover:scale-105 transition-transform"
              fetchPriority="high"
              width={40}
              height={40}
              loading="eager"
              decoding="async"
            />
            <span className="text-xl font-bold text-primary hidden sm:block">UnityNets</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-lg"
              title={t("Switch to Bengali", "Switch to English")}
            >
              <Globe className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Login Button */}
            <Button
              variant="ghost"
              className="hidden sm:flex"
              onClick={() => navigate('/auth?mode=login')}
            >
              {t("Login", "লগইন")}
            </Button>

            {/* Signup Button */}
            <Button
              variant="hero"
              className="hidden sm:flex"
              onClick={() => navigate('/auth?mode=signup')}
            >
              {t("Join Now", "জয়েন করুন")}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-2 px-4 pt-4 border-t border-border mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth?mode=login');
                  }}
                >
                  {t("Login", "লগইন")}
                </Button>
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth?mode=signup');
                  }}
                >
                  {t("Join Now", "জয়েন করুন")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default memo(Navbar);
