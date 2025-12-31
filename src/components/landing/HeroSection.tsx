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
      {/* Animated Background - More Vibrant */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8">
        {/* Colorful floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-2xl animate-pulse delay-500" />
        
        {/* Connection lines animation */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <g>
            <circle cx="15%" cy="30%" r="5" fill="hsl(var(--primary))" opacity="0.7">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="85%" cy="25%" r="4" fill="hsl(var(--accent))" opacity="0.6">
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="75%" cy="70%" r="6" fill="hsl(var(--primary))" opacity="0.5">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="25%" cy="75%" r="4" fill="hsl(var(--accent))" opacity="0.7">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50%" cy="20%" r="5" fill="hsl(var(--primary))" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <line x1="15%" y1="30%" x2="50%" y2="20%" stroke="url(#lineGradient)" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
            </line>
            <line x1="50%" y1="20%" x2="85%" y2="25%" stroke="url(#lineGradient)" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite" />
            </line>
            <line x1="85%" y1="25%" x2="75%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="75%" y1="70%" x2="25%" y2="75%" stroke="url(#lineGradient)" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.5s" repeatCount="indefinite" />
            </line>
            <line x1="25%" y1="75%" x2="15%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 to-accent/15 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-fade-in border border-primary/20 shadow-soft">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{t("Bangladesh's Largest Community Platform", "বাংলাদেশের বৃহত্তম কমিউনিটি প্ল্যাটফর্ম")}</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-heading text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">Trust</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="bg-gradient-to-r from-blue-500 via-primary to-blue-500 bg-clip-text text-transparent">Learn</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="bg-gradient-to-r from-accent via-orange-400 to-accent bg-clip-text text-transparent">Unite</span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl mt-2 block text-muted-foreground">
            {t("Stronger Together", "একত্রে শক্তিশালী")}
          </span>
        </h1>

        {/* Subheading */}
        <p className="subheading max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {t(
            "Build Together, Grow Together – Join Bangladesh's largest community platform for skill sharing and mutual development. From South Asia to the world, we dream of uniting everyone.",
            "Build Together, Grow Together – জয়েন করুন বাংলাদেশের বৃহত্তম কমিউনিটি প্ল্যাটফর্মে। দক্ষ আদান-প্রদান ও পারস্পরিক উন্নয়নের জন্য। দক্ষিণ এশিয়া থেকে সারা বিশ্বে, আমরা সবাইকে একত্রিত করার স্বপ্ন দেখি।"
          )}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-elegant hover:shadow-glow transition-all duration-300"
            onClick={() => navigate('/auth?mode=signup')}
          >
            <span>{t("Join Free Now", "এখনই ফ্রি জয়েন করুন")}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 rounded-xl border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            onClick={() => navigate('/auth?mode=login')}
          >
            <span>{t("Already a member? Login", "অলরেডি মেম্বার? লগইন করুন")}</span>
          </Button>
        </div>

        {/* Video Placeholder */}
        <div className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="relative aspect-video bg-gradient-to-br from-card via-card to-secondary/50 rounded-2xl border border-border/50 shadow-elegant overflow-hidden group cursor-pointer hover:shadow-glow transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-accent/10 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-sm text-muted-foreground font-medium">{t("UnityNets Introduction Video (Coming Soon)", "ইউনিটিনেটস পরিচিতি ভিডিও (শীঘ্রই আসছে)")}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-2 text-foreground/80 bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium">{t("10,000+ Active Members", "১০,০০০+ সক্রিয় সদস্য")}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80 bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
            <Globe className="w-5 h-5 text-accent" />
            <span className="font-medium">{t("From Various Countries", "বিভিন্ন দেশ থেকে")}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80 bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
            <Sparkles className="w-5 h-5 text-purple-500" />
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
