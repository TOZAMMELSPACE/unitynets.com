import { memo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserPlus, Users, MessageSquare, Award } from "lucide-react";

const HowItWorksSection = memo(() => {
  const { t } = useLanguage();

  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: t("howItWorks.step1.title", "Create Your Profile"),
      titleBn: "প্রোফাইল তৈরি করুন",
      description: t("howItWorks.step1.description", "Sign up and set up your profile with your interests, skills, and location to connect with your local community."),
      descriptionBn: "সাইন আপ করুন এবং আপনার আগ্রহ, দক্ষতা এবং অবস্থান দিয়ে প্রোফাইল সেট আপ করুন।",
    },
    {
      step: 2,
      icon: Users,
      title: t("howItWorks.step2.title", "Join Your Community"),
      titleBn: "সম্প্রদায়ে যোগ দিন",
      description: t("howItWorks.step2.description", "Discover and connect with people in your area. Join groups, follow neighbors, and build meaningful relationships."),
      descriptionBn: "আপনার এলাকার মানুষদের সাথে সংযুক্ত হন। গ্রুপে যোগ দিন এবং সম্পর্ক তৈরি করুন।",
    },
    {
      step: 3,
      icon: MessageSquare,
      title: t("howItWorks.step3.title", "Share & Learn"),
      titleBn: "শেয়ার করুন ও শিখুন",
      description: t("howItWorks.step3.description", "Post updates, share knowledge, ask questions, and learn from community members through our learning zone."),
      descriptionBn: "আপডেট পোস্ট করুন, জ্ঞান শেয়ার করুন এবং লার্নিং জোনে শিখুন।",
    },
    {
      step: 4,
      icon: Award,
      title: t("howItWorks.step4.title", "Earn Trust & Unity Notes"),
      titleBn: "Trust ও Unity Note অর্জন করুন",
      description: t("howItWorks.step4.description", "Build your reputation through positive interactions. Earn Unity Notes and use them for services within the community."),
      descriptionBn: "ইতিবাচক কার্যকলাপের মাধ্যমে খ্যাতি তৈরি করুন এবং Unity Note অর্জন করুন।",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("howItWorks.title", "How It Works")}
            <span className="block text-lg font-normal text-muted-foreground mt-2">
              কিভাবে কাজ করে
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("howItWorks.subtitle", "Get started in just a few simple steps and become part of a trusted community.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-primary/80 font-medium mb-2">
                  {step.titleBn}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";

export default HowItWorksSection;
