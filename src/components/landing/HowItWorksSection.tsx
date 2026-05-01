import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserPlus, Users, MessageSquare, Award, Shield, Heart, BookOpen, Coins } from "lucide-react";

const HowItWorksSection = memo(() => {
  const { t, language } = useLanguage();

  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: language === "bn" ? "প্রোফাইল তৈরি করুন" : "Create Your Profile",
      description: language === "bn"
        ? "ইমেইল বা ফোন নম্বর দিয়ে সাইন আপ করুন। আপনার আগ্রহ, দক্ষতা এবং অবস্থান যোগ করুন।"
        : "Sign up with your email or phone number. Add your interests, skills, and location to help connect with like-minded people in your community.",
      features: [
        { icon: Shield, text: language === "bn" ? "সুরক্ষিত প্রোফাইল" : "Secure Profile" },
        { icon: Heart, text: language === "bn" ? "আগ্রহ যোগ করুন" : "Add Interests" },
      ],
      gradient: "from-primary to-accent",
      glowColor: "hsl(var(--primary) / 0.18)",
    },
    {
      step: 2,
      icon: Users,
      title: language === "bn" ? "সম্প্রদায়ে যোগ দিন" : "Join Your Community",
      description: language === "bn"
        ? "প্রতিবেশীদের খুঁজুন, স্থানীয় গ্রুপে যোগ দিন এবং সমমনা মানুষদের সাথে সংযুক্ত হন।"
        : "Discover neighbors, join local groups, and connect with people who share your interests. Build meaningful relationships within your community.",
      features: [
        { icon: Users, text: language === "bn" ? "স্থানীয় গ্রুপ" : "Local Groups" },
        { icon: Heart, text: language === "bn" ? "বন্ধু বানান" : "Make Friends" },
      ],
      gradient: "from-accent to-success",
      glowColor: "hsl(var(--accent) / 0.18)",
    },
    {
      step: 3,
      icon: BookOpen,
      title: language === "bn" ? "শেয়ার করুন ও শিখুন" : "Share & Learn",
      description: language === "bn"
        ? "জ্ঞান শেয়ার করুন, প্রশ্ন করুন এবং লার্নিং জোনে অভিজ্ঞদের কাছ থেকে শিখুন।"
        : "Share your knowledge, ask questions, and learn from experienced community members through our Learning Zone and discussion forums.",
      features: [
        { icon: BookOpen, text: language === "bn" ? "লার্নিং জোন" : "Learning Zone" },
        { icon: MessageSquare, text: language === "bn" ? "আলোচনা ফোরাম" : "Discussion Forums" },
      ],
      gradient: "from-success to-primary",
      glowColor: "hsl(var(--success) / 0.18)",
    },
    {
      step: 4,
      icon: Coins,
      title: language === "bn" ? "ইউনিটি নোট অর্জন করুন" : "Earn Unity Notes",
      description: language === "bn"
        ? "সম্প্রদায়ে অবদান রাখুন এবং ইউনিটি নোট অর্জন করুন। সেবা বিনিময়ে ব্যবহার করুন।"
        : "Contribute positively to the community and earn Unity Notes. Use them to exchange services, get help, or support local initiatives.",
      features: [
        { icon: Award, text: language === "bn" ? "বিশ্বাস স্কোর" : "Trust Score" },
        { icon: Coins, text: language === "bn" ? "সেবা বিনিময়" : "Service Exchange" },
      ],
      gradient: "from-warning to-primary",
      glowColor: "hsl(var(--warning) / 0.18)",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 md:py-28 bg-background scroll-mt-20 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20" style={{ opacity: 0, animation: "fade-in 0.6s ease-out 0.1s forwards" }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 backdrop-blur-sm mb-6">
            {language === "bn" ? "সহজ ধাপগুলো" : "Simple Steps"}
          </div>
          <h2 className="section-header mb-5 text-3xl md:text-4xl">
            {language === "bn" ? "কিভাবে কাজ করে" : "How It Works"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            {language === "bn"
              ? "মাত্র কয়েকটি সহজ ধাপে শুরু করুন এবং বিশ্বস্ত সম্প্রদায়ের অংশ হয়ে যান।"
              : "Get started in just a few simple steps and become part of a trusted community."}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group"
              style={{ opacity: 0, animation: `fade-in 0.5s ease-out ${200 + index * 120}ms forwards` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent z-0" />
              )}

              <div className="relative bg-card/50 backdrop-blur-xl border border-border/30 rounded-3xl p-7 hover:shadow-glow hover:-translate-y-2 transition-all duration-500 h-full overflow-hidden">
                {/* Hover glow */}
                <div
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: step.glowColor }}
                />

                {/* Top accent line */}
                <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                {/* Step number badge */}
                <div className={`absolute -top-3 -left-3 w-11 h-11 bg-gradient-to-br ${step.gradient} text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-glow ring-4 ring-background group-hover:scale-110 transition-transform duration-300 z-10`}>
                  {step.step}
                </div>

                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 mt-2 group-hover:scale-110 group-hover:shadow-glow transition-all duration-400`}>
                  <step.icon className="w-8 h-8 text-primary-foreground drop-shadow" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {step.description}
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {step.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/50 backdrop-blur-sm border border-border/30 rounded-full text-xs text-muted-foreground"
                    >
                      <feature.icon className="w-3 h-3" />
                      {feature.text}
                    </span>
                  ))}
                </div>

                {/* Corner decoration */}
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/10 rounded-br-xl group-hover:border-primary/30 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14" style={{ opacity: 0, animation: "fade-in 0.6s ease-out 800ms forwards" }}>
          <p className="text-muted-foreground text-lg">
            {language === "bn"
              ? "আজই যোগ দিন এবং আপনার সম্প্রদায়ের সাথে সংযুক্ত হন!"
              : "Join today and start connecting with your community!"}
          </p>
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";

export default HowItWorksSection;
