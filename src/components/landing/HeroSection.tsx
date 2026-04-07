import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, Users, Sparkles, BookOpen, Shield, Zap, Award, Heart, MessageSquare, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealStats } from "@/hooks/useRealStats";

const features = [
  { icon: Zap, title: "লেভেল আপ", titleEn: "Level Up", desc: "নতুন লেভেল আনলক করো", descEn: "Unlock new levels", color: "from-accent to-primary" },
  { icon: BookOpen, title: "ফ্রি শিক্ষা", titleEn: "Free Learning", desc: "হাজারো ফ্রি কোর্স ও নোটস", descEn: "Thousands of free courses & notes", color: "from-primary to-accent" },
  { icon: Users, title: "কমিউনিটি", titleEn: "Community", desc: "বিশ্বব্যাপী সংযুক্ত হও", descEn: "Connect globally", color: "from-success to-accent" },
  { icon: Shield, title: "বিশ্বাস স্কোর", titleEn: "Trust Score", desc: "বিশ্বস্ততা অর্জন করো", descEn: "Earn trust & credibility", color: "from-warning to-primary" },
  { icon: Award, title: "ইউনিটি নোট", titleEn: "Unity Notes", desc: "পয়েন্ট জিতো ও ব্যবহার করো", descEn: "Earn & use community points", color: "from-primary to-warning" },
  { icon: Heart, title: "সাহায্য করো", titleEn: "Help Others", desc: "সেবা দাও ও নাও", descEn: "Give & receive services", color: "from-destructive to-accent" },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { activeUsers, totalPosts, isLoading } = useRealStats();
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatStat = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return `${num}+`;
  };

  const feature = features[currentFeature];
  const FeatureIcon = feature.icon;

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-20 md:pt-24">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
      
      {/* Animated floating orbs */}
      <div className="absolute top-16 right-[10%] w-72 h-72 bg-primary/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute bottom-10 left-[5%] w-64 h-64 bg-accent/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side */}
          <div className="space-y-8" style={{ opacity: 0, animation: "fade-in 0.7s ease-out 0.1s forwards" }}>
            {/* Glowing Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-medium border border-primary/20 backdrop-blur-sm shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{t("World Community Platform", "বিশ্ব কমিউনিটি প্ল্যাটফর্ম")}</span>
            </div>

            {/* Heading with gradient text */}
            <div>
              <h1 className="hero-heading text-foreground mb-2">
                {t("Trust • Learn", "বিশ্বাস • শেখা")}
              </h1>
              <h1 className="hero-heading mb-0" style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-glow)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {t("Unite!", "ঐক্য!")} <span className="inline-block animate-bounce" style={{ WebkitTextFillColor: "initial" }}>🤝</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t(
                "Your trusted community — share skills, learn for free, earn Unity Notes, and grow together with people from around the world!",
                "তোমার বিশ্বস্ত কমিউনিটি — দক্ষতা শেয়ার করো, ফ্রিতে শেখো, ইউনিটি নোট জিতো, আর সারা বিশ্বের মানুষের সাথে একসাথে বেড়ে ওঠো!"
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-full group bg-gradient-hero shadow-glow hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] hover:-translate-y-1 transition-all duration-400"
                onClick={() => navigate('/auth?mode=signup')}
              >
                <span>{t("Get Started", "শুরু করো")}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-6 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                onClick={() => navigate('/about')}
              >
                <Globe className="w-5 h-5 mr-2" />
                <span>{t("About Us", "আমাদের সম্পর্কে")}</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-6 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                onClick={() => navigate('/auth?mode=login')}
              >
                <span>{t("Login", "লগইন")}</span>
              </Button>
            </div>

            {/* Stats with glass cards */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: Users, value: isLoading ? "..." : formatStat(activeUsers), label: t("Members", "সদস্য"), color: "text-primary" },
                { icon: FileText, value: isLoading ? "..." : formatStat(totalPosts), label: t("Posts", "পোস্ট"), color: "text-accent" },
                { icon: Sparkles, value: "100%", label: t("Free", "ফ্রি"), color: "text-primary" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-card/40 backdrop-blur-sm border border-border/20 rounded-xl px-4 py-2.5 shadow-soft">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="font-semibold text-foreground text-sm">{stat.value}</span>
                  <span className="text-muted-foreground text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side — Premium Feature Card */}
          <div className="flex justify-center lg:justify-end" style={{ opacity: 0, animation: "fade-in 0.7s ease-out 0.3s forwards" }}>
            <div className="relative w-full max-w-md">
              {/* Glow behind card */}
              <div className="absolute inset-4 bg-primary/10 rounded-3xl blur-[40px]" />

              {/* Decorative badge */}
              <div className="absolute -top-5 -right-5 w-16 h-16 bg-warning/15 backdrop-blur-sm border border-warning/20 rounded-2xl flex items-center justify-center rotate-12 z-10 shadow-lg">
                <Award className="w-8 h-8 text-warning" />
              </div>

              {/* Main Card with glassmorphism */}
              <div className="relative bg-card/70 backdrop-blur-xl rounded-3xl shadow-elegant border border-border/30 p-10 text-center transition-all duration-500 hover:shadow-glow hover:-translate-y-1">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />
                
                <div className="relative z-10">
                  {/* Feature Icon with glow */}
                  <div className={`w-22 h-22 mx-auto mb-7 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-glow transition-all duration-500`}
                    style={{ width: "5.5rem", height: "5.5rem" }}>
                    <FeatureIcon className="w-11 h-11 text-primary-foreground drop-shadow-lg" />
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 transition-all duration-500">
                    {language === "bn" ? feature.title : feature.titleEn}
                  </h3>

                  <p className="text-muted-foreground transition-all duration-500">
                    {language === "bn" ? feature.desc : feature.descEn}
                  </p>

                  {/* Dots */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          index === currentFeature
                            ? "w-8 bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                            : "w-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating element */}
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary/10 backdrop-blur-sm border border-primary/15 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: "3s" }}>
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(HeroSection);
