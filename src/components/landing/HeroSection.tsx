import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Globe, Users, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background - Peaceful Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Soft peaceful orbs - calming blues and teals */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/12 to-primary/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 to-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        {/* Gentle wave pattern */}
        <svg className="absolute bottom-0 left-0 w-full h-40 opacity-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="peaceWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" fill="url(#peaceWave)" />
        </svg>
        
        {/* Peaceful connection circles */}
        <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="peaceLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g>
            <circle cx="15%" cy="30%" r="5" fill="hsl(var(--primary))" opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="85%" cy="25%" r="4" fill="hsl(var(--accent))" opacity="0.4">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="75%" cy="70%" r="5" fill="hsl(var(--primary))" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="25%" cy="75%" r="4" fill="hsl(var(--accent))" opacity="0.5">
              <animate attributeName="opacity" values="0.4;0.6;0.4" dur="4.5s" repeatCount="indefinite" />
            </circle>
            <line x1="15%" y1="30%" x2="85%" y2="25%" stroke="url(#peaceLine)" strokeWidth="1">
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="5s" repeatCount="indefinite" />
            </line>
            <line x1="85%" y1="25%" x2="75%" y2="70%" stroke="url(#peaceLine)" strokeWidth="1">
              <animate attributeName="opacity" values="0.2;0.3;0.2" dur="6s" repeatCount="indefinite" />
            </line>
            <line x1="75%" y1="70%" x2="25%" y2="75%" stroke="url(#peaceLine)" strokeWidth="1">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="25%" y1="75%" x2="15%" y2="30%" stroke="url(#peaceLine)" strokeWidth="1">
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="5.5s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-fade-in border border-primary/20 shadow-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>🌍 {t("World Community Platform", "বিশ্ব কমিউনিটি প্ল্যাটফর্ম")}</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-heading text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="text-primary">Trust</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-accent">Learn</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-primary">Unite</span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl mt-2 block text-muted-foreground">
            {t("Stronger Together", "একত্রে শক্তিশালী")}
          </span>
        </h1>

        {/* Subheading */}
        <p className="subheading max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {t(
            "Build Together, Grow Together – Join the world's most trusted community platform for skill sharing and mutual growth. Building bridges of unity from South Asia to the world.",
            "Build Together, Grow Together – জয়েন করুন বিশ্বের সবচেয়ে বিশ্বস্ত কমিউনিটি প্ল্যাটফর্মে। দক্ষতা শেয়ার ও পারস্পরিক উন্নয়নের জন্য। দক্ষিণ এশিয়া থেকে সারা বিশ্বে ঐক্যের সেতুবন্ধন।"
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl group bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/auth?mode=signup')}
          >
            <span>{t("Join Free Now", "এখনই ফ্রি জয়েন করুন")}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 rounded-xl border-2 border-primary/25 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300"
            onClick={() => navigate('/auth?mode=login')}
          >
            <span>{t("Already a member? Login", "অলরেডি মেম্বার? লগইন করুন")}</span>
          </Button>
        </div>

        {/* Video Placeholder */}
        <div className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="relative aspect-video bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-sm text-muted-foreground font-medium">{t("UnityNets Introduction Video (Coming Soon)", "ইউনিটিনেটস পরিচিতি ভিডিও (শীঘ্রই আসছে)")}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-2 text-foreground/80 bg-card px-4 py-2 rounded-full border border-border/50 shadow-sm">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium">{t("10,000+ Active Members", "১০,০০০+ সক্রিয় সদস্য")}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80 bg-card px-4 py-2 rounded-full border border-border/50 shadow-sm">
            <Globe className="w-5 h-5 text-accent" />
            <span className="font-medium">{t("50+ Countries Worldwide", "৫০+ দেশে বিস্তৃত")}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80 bg-card px-4 py-2 rounded-full border border-border/50 shadow-sm">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium">{t("50,000+ Unity Notes", "৫০,০০০+ ইউনিটি নোটস")}</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default memo(HeroSection);
