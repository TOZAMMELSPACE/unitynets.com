import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, Users, Sparkles, BookOpen, Shield, Zap, Award, Heart, MessageSquare, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealStats } from "@/hooks/useRealStats";

const features = [
  {
    icon: Zap,
    title: "লেভেল আপ",
    titleEn: "Level Up",
    desc: "নতুন লেভেল আনলক করো",
    descEn: "Unlock new levels",
    color: "from-accent to-primary",
  },
  {
    icon: BookOpen,
    title: "ফ্রি শিক্ষা",
    titleEn: "Free Learning",
    desc: "হাজারো ফ্রি কোর্স ও নোটস",
    descEn: "Thousands of free courses & notes",
    color: "from-primary to-accent",
  },
  {
    icon: Users,
    title: "কমিউনিটি",
    titleEn: "Community",
    desc: "বিশ্বব্যাপী সংযুক্ত হও",
    descEn: "Connect globally",
    color: "from-success to-accent",
  },
  {
    icon: Shield,
    title: "বিশ্বাস স্কোর",
    titleEn: "Trust Score",
    desc: "বিশ্বস্ততা অর্জন করো",
    descEn: "Earn trust & credibility",
    color: "from-warning to-primary",
  },
  {
    icon: Award,
    title: "ইউনিটি নোট",
    titleEn: "Unity Notes",
    desc: "পয়েন্ট জিতো ও ব্যবহার করো",
    descEn: "Earn & use community points",
    color: "from-primary to-warning",
  },
  {
    icon: Heart,
    title: "সাহায্য করো",
    titleEn: "Help Others",
    desc: "সেবা দাও ও নাও",
    descEn: "Give & receive services",
    color: "from-destructive to-accent",
  },
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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 md:pt-24">
      {/* Soft pink background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side — Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>{t("World Community Platform", "বিশ্ব কমিউনিটি প্ল্যাটফর্ম")}</span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="hero-heading text-foreground mb-2">
                {t("Trust • Learn", "বিশ্বাস • শেখা")}
              </h1>
              <h1 className="hero-heading text-primary mb-0">
                {t("Unite!", "ঐক্য!")} <span className="inline-block animate-bounce">🤝</span>
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
                className="text-base px-8 py-6 rounded-full group bg-gradient-hero shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => navigate('/auth?mode=signup')}
              >
                <span>{t("Get Started", "শুরু করো")}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-6 rounded-full border-border hover:bg-muted transition-all duration-300"
                onClick={() => navigate('/about')}
              >
                <Globe className="w-5 h-5 mr-2" />
                <span>{t("About Us", "আমাদের সম্পর্কে")}</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-6 rounded-full border-border hover:bg-muted transition-all duration-300"
                onClick={() => navigate('/auth?mode=login')}
              >
                <span>{t("Login", "লগইন")}</span>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {isLoading ? "..." : formatStat(activeUsers)}
                </span>
                {t("Members", "সদস্য")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 text-accent" />
                <span className="font-semibold text-foreground">
                  {isLoading ? "..." : formatStat(totalPosts)}
                </span>
                {t("Posts", "পোস্ট")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">100%</span>
                {t("Free", "ফ্রি")}
              </div>
            </div>
          </div>

          {/* Right Side — Feature Carousel Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Decorative star */}
              <div className="absolute -top-4 -right-4 w-14 h-14 bg-warning/20 rounded-2xl flex items-center justify-center rotate-12 z-10">
                <Award className="w-7 h-7 text-warning" />
              </div>

              {/* Main Feature Card */}
              <div className="bg-card rounded-3xl shadow-elegant border border-border/30 p-10 text-center transition-all duration-500">
                {/* Feature Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg transition-all duration-500`}>
                  <FeatureIcon className="w-10 h-10 text-primary-foreground" />
                </div>

                {/* Feature Title */}
                <h3 className="text-2xl font-bold text-foreground mb-3 transition-all duration-500">
                  {language === "bn" ? feature.title : feature.titleEn}
                </h3>

                {/* Feature Description */}
                <p className="text-muted-foreground transition-all duration-500">
                  {language === "bn" ? feature.desc : feature.descEn}
                </p>

                {/* Dots indicator */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === currentFeature
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
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
