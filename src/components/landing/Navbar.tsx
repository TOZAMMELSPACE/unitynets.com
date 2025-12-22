import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const navLinks = [
  { name: "হোম", nameEn: "Home", path: "/" },
  { name: "মিশন", nameEn: "About", path: "/about" },
  { name: "ইউনিটি নোটস", nameEn: "Unity Notes", path: "/unity-note" },
  { name: "লার্নিং জোন", nameEn: "Learning Zone", path: "/learning-zone" },
  { name: "ফিড", nameEn: "Feed", path: "/home" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
              src="/logo.jpg" 
              alt="UnityNets Logo" 
              className="w-10 h-10 rounded-lg group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold text-primary hidden sm:block">UnityNets</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-bengali ${
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
              className="hidden sm:flex text-bengali"
              onClick={() => navigate('/', { state: { showLogin: true } })}
            >
              লগইন
            </Button>

            {/* Signup Button */}
            <Button
              variant="hero"
              className="hidden sm:flex text-bengali"
              onClick={() => navigate('/', { state: { showSignup: true } })}
            >
              জয়েন করুন
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
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-bengali ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name} <span className="text-muted-foreground/60">/ {link.nameEn}</span>
                </Link>
              ))}
              <div className="flex gap-2 px-4 pt-4 border-t border-border mt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-bengali"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/', { state: { showLogin: true } });
                  }}
                >
                  লগইন
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 text-bengali"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/', { state: { showSignup: true } });
                  }}
                >
                  জয়েন করুন
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
