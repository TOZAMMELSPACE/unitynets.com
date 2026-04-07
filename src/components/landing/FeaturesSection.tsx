import { memo } from "react";
import { Shield, BookOpen, Users, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t("Trust", "বিশ্বাস"),
      description: t(
        "A safe community where every voice is heard and every member is valued.",
        "একটি নিরাপদ কমিউনিটি যেখানে প্রতিটি কণ্ঠস্বর শোনা হয় এবং প্রতিটি সদস্যের মূল্য দেওয়া হয়।"
      ),
      gradient: "from-primary to-accent",
      glowColor: "hsl(var(--primary) / 0.15)",
    },
    {
      icon: BookOpen,
      title: t("Learn", "শিক্ষা"),
      description: t(
        "Thousands of free educational notes and skill sharing opportunities.",
        "হাজারো বিনামূল্যে শিক্ষামূলক নোটস এবং দক্ষতা বিনিময়। এখানে শেখা ও শেখানো দুটোই সম্মানের।"
      ),
      gradient: "from-accent to-success",
      glowColor: "hsl(var(--accent) / 0.15)",
    },
    {
      icon: Users,
      title: t("Unite", "ঐক্য"),
      description: t(
        "Building a united community from South Asia to the entire world.",
        "দক্ষিণ এশিয়া থেকে শুরু করে পুরো বিশ্ব জুড়ে একটি ঐক্যবদ্ধ সম্প্রদায় গড়ার স্বপ্ন নিয়ে এগিয়ে যাচ্ছি।"
      ),
      gradient: "from-success to-primary",
      glowColor: "hsl(var(--success) / 0.15)",
    },
    {
      icon: Heart,
      title: t("Impact", "প্রভাব"),
      description: t(
        "See real stories of lives changing through our community.",
        "দেখুন কিভাবে আমাদের কমিউনিটির মাধ্যমে মানুষের জীবন বদলে যাচ্ছে। সত্যিকারের গল্প, সত্যিকারের পরিবর্তন।"
      ),
      gradient: "from-warning to-primary",
      glowColor: "hsl(var(--warning) / 0.15)",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(var(--primary)/0.06),transparent)]" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-20" style={{ opacity: 0, animation: "fade-in 0.6s ease-out 0.1s forwards" }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 backdrop-blur-sm mb-6">
            {t("Our Pillars", "আমাদের ভিত্তি")}
          </div>
          <h2 className="section-header mb-5 text-3xl md:text-4xl">
            {t("Why Join Us?", "কেন আমাদের সাথে যোগ দিবেন?")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            {t(
              "UnityNets is not just a platform, it's a family where every member matters",
              "ইউনিটিনেটস শুধু একটি প্ল্যাটফর্ম নয়, এটি একটি পরিবার যেখানে প্রতিটি সদস্য গুরুত্বপূর্ণ"
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card/50 backdrop-blur-xl border border-border/30 rounded-3xl p-9 hover:shadow-glow hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              style={{
                opacity: 0,
                animation: `fade-in 0.5s ease-out ${200 + index * 120}ms forwards`,
              }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: feature.glowColor }}
              />
              
              {/* Top accent line */}
              <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

              {/* Icon with gradient bg */}
              <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-7 group-hover:scale-110 group-hover:shadow-glow transition-all duration-400`}>
                <feature.icon className="w-8 h-8 text-primary-foreground drop-shadow" />
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Corner decoration */}
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/10 rounded-br-xl group-hover:border-primary/30 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(FeaturesSection);
