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
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30 scroll-mt-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {language === "bn" ? "সহজ ধাপগুলো" : "Simple Steps"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === "bn" ? "কিভাবে কাজ করে" : "How It Works"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {language === "bn" 
              ? "মাত্র কয়েকটি সহজ ধাপে শুরু করুন এবং বিশ্বস্ত সম্প্রদায়ের অংশ হয়ে যান।"
              : "Get started in just a few simple steps and become part of a trusted community."}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full hover:-translate-y-2">
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {step.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                    >
                      <feature.icon className="w-3 h-3" />
                      {feature.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
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
