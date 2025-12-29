import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Heart, Globe, Users, Target, Sparkles, BookOpen, Shield, Briefcase, Calendar, MessageCircle, Languages, Send, Mail, User, Code, DollarSign, Lightbulb, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import founderImage from "@/assets/founder.jpg";

const About = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contributionType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contributionTypes = [
    { id: "investor", icon: DollarSign, label: t("Investor", "ইনভেস্টর"), labelBn: "ইনভেস্টর" },
    { id: "mentor", icon: Lightbulb, label: t("Mentor", "মেন্টর"), labelBn: "মেন্টর" },
    { id: "developer", icon: Code, label: t("Developer", "ডেভেলপার"), labelBn: "ডেভেলপার" },
    { id: "volunteer", icon: Heart, label: t("Volunteer", "ভলান্টিয়ার"), labelBn: "ভলান্টিয়ার" },
    { id: "other", icon: Users, label: t("Other", "অন্যান্য"), labelBn: "অন্যান্য" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: t("Please fill all fields", "সব ফিল্ড পূরণ করুন"),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission - in production, this would send to a backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: t("Message sent successfully!", "মেসেজ সফলভাবে পাঠানো হয়েছে!"),
      description: t("Thank you for reaching out. I'll get back to you soon.", "যোগাযোগ করার জন্য ধন্যবাদ। শীঘ্রই আপনার সাথে যোগাযোগ করব।")
    });
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", contributionType: "", message: "" });
      setIsSubmitted(false);
    }, 3000);
  };
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About UnityNets - আমাদের গল্প"
        description="UnityNets প্রতিষ্ঠাতা Md. Tozammel Haque এর গল্প। জানুন কিভাবে একটি স্বপ্ন থেকে বাংলাদেশের প্রথম trust-based community platform তৈরি হলো। Learn about our mission and vision."
        keywords="UnityNets founder, Tozammel Haque, about UnityNets, community platform Bangladesh, mission vision, প্রতিষ্ঠাতা"
        canonicalUrl="https://unitynets.com/about"
        ogType="profile"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "Person",
            "name": "Md. Tozammel Haque",
            "jobTitle": "Founder & Builder",
            "worksFor": {
              "@type": "Organization",
              "name": "UnityNets"
            }
          }
        }}
      />
      <Navbar />
      <main className="pt-20">
        {/* Language Toggle */}
        <div className="fixed top-24 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-background backdrop-blur-sm border border-border shadow-sm hover:bg-muted"
          >
            <Languages className="w-4 h-4 text-primary" />
            {language === "en" ? "বাংলা" : "English"}
          </Button>
        </div>

        {/* Hero Section with Founder Story */}
        <section className="py-8 md:py-10 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                {t("A Dream That Became Reality...", "একটা স্বপ্ন ছিল...")}
              </h1>
              <p className="text-base text-muted-foreground">
                {t("The journey of how UnityNets began", "যেভাবে শুরু হলো UnityNets-এর যাত্রা")}
              </p>
            </div>
          </div>
        </section>

        {/* Founder Section - Expanded */}
        <section className="py-6 md:py-8 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Founder Info Card */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30 rounded-2xl p-5 md:p-8 mb-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="relative">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src={founderImage} 
                        alt={t("UnityNets Founder - Md. Tozammel Haque", "UnityNets প্রতিষ্ঠাতা - মো. তোজাম্মেল হক")}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg">
                      <span className="font-semibold">{t("Founder", "প্রতিষ্ঠাতা")}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                      <Heart className="w-4 h-4" />
                      <span>{t("About the Founder", "প্রতিষ্ঠাতা সম্পর্কে")}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      Md. Tozammel Haque
                    </h2>
                    
                    <p className="text-xl text-primary font-semibold">
                      {t("Founder & Builder, UnityNets", "প্রতিষ্ঠাতা ও বিল্ডার, ইউনিটিনেটস")}
                    </p>
                    
                    <div className="space-y-4 text-muted-foreground">
                      <p className="text-lg leading-relaxed">
                        {t(
                          "I'm not a corporate CEO. I don't have a degree from a prestigious university. I am a builder—someone who rose from real life.",
                          "আমি কোনো কর্পোরেট সিইও নই। আমি কোনো বড় ইউনিভার্সিটির ডিগ্রি নিয়ে বসে নেই। আমি একজন বিল্ডার—যে বাস্তব জীবন থেকে উঠে এসেছে।"
                        )}
                      </p>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="pt-4 border-t border-border/30 space-y-3">
                      <a 
                        href="mailto:tozammelbusiness@gmail.com" 
                        className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <span>tozammelbusiness@gmail.com</span>
                      </a>
                      <a 
                        href="tel:+8801650282332" 
                        className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <span>+880 1650-282332</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Journey Intro */}
              <div className="space-y-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  <span>{t("My Story", "আমার গল্প")}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  {t(
                    "5 years. I've been working as a computer operator for 5 full years.",
                    "৫ বছর। পুরো ৫ বছর ধরে কম্পিউটার অপারেটরের চাকরি করছি।"
                  )}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    "1.6 years ago, I came to Dhaka with a dream. I thought maybe something would happen here. Something would change.",
                    "১.৬ বছর আগে স্বপ্ন নিয়ে ঢাকায় এসেছিলাম। ভেবেছিলাম হয়তো এখানে কিছু হবে। কিছু একটা বদলাবে।"
                  )}
                </p>
              </div>

              {/* The Reality */}
              <div className="bg-card border border-border/30 rounded-xl p-5 md:p-6 mb-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  {t("Reality is Different", "বাস্তবতা অন্যরকম")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  {t(
                    "10 AM to 9 PM. Every day. Same routine. Same faces. Same dreamless days. Sometimes I feel like I'm getting lost in this crowd. Those dreams that once burned in my eyes are fading away.",
                    "সকাল ১০টা থেকে রাত ৯টা। প্রতিদিন। একই রুটিন। একই চেহারা। একই স্বপ্নহীন দিন। কখনো কখনো মনে হয়, আমি হারিয়ে যাচ্ছি এই ভিড়ে। হারিয়ে যাচ্ছে সেই স্বপ্নগুলো, যেগুলো একদিন চোখে জ্বলত।"
                  )}
                </p>
                <p className="text-primary font-semibold text-xl">
                  {t("But no. I didn't stop.", "কিন্তু না। আমি থেমে যাইনি।")}
                </p>
              </div>

              {/* The Dream */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>{t("That dream still lives...", "সেই স্বপ্নটা এখনো আছে...")}</span>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t(
                      "I remember dreaming of a different world. A place where people would give time to each other. Where there is trust, love, and empathy.",
                      "মনে আছে, একসময় স্বপ্ন দেখতাম একটা ভিন্ন পৃথিবীর। এমন একটা জায়গার, যেখানে মানুষ মানুষের জন্য সময় দেবে। যেখানে বিশ্বাস আছে, ভালোবাসা আছে, সহানুভূতি আছে।"
                    )}
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t(
                      "A platform that wouldn't be toxic like today's social media. Where:",
                      "এমন একটা প্ল্যাটফর্মের, যেটা আজকের দিনের সোশ্যাল মিডিয়ার মতো বিষাক্ত হবে না। যেখানে:"
                    )}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        {t(
                          "Instead of negativity, there will be ",
                          "নেগেটিভিটির বদলে থাকবে "
                        )}
                        <strong>{t("positivity", "পজিটিভিটি")}</strong>
                      </p>
                    </div>
                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        {t(
                          "Instead of hatred, there will be ",
                          "হিংসার বদলে থাকবে "
                        )}
                        <strong>{t("love", "ভালোবাসা")}</strong>
                      </p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        {t(
                          "Instead of hate, there will be ",
                          "ঘৃণার বদলে থাকবে "
                        )}
                        <strong>{t("cooperation", "সহযোগিতা")}</strong>
                      </p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        {t(
                          "Instead of cringe content, there will be ",
                          "ক্রিন্জ কনটেন্টের বদলে থাকবে "
                        )}
                        <strong>{t("knowledge & creativity", "জ্ঞান ও সৃষ্টিশীলতা")}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-foreground leading-relaxed font-medium">
                    {t(
                      "A place where good people will become better. And those who are on the wrong path will gradually change. Become good.",
                      "এমন একটা জায়গা, যেখানে ভালো মানুষ আরও ভালো হবে। আর যারা খারাপ পথে হাঁটছে, তারাও এসে একটু একটু করে বদলে যাবে। ভালো হবে।"
                    )}
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    {t(
                      "Trust in humanity will return. Morality will grow. Society will slowly become beautiful. This dream burned in my heart. Every day.",
                      "মানুষের প্রতি মানুষের বিশ্বাস ফিরে আসবে। নৈতিকতা বাড়বে। সমাজ একটু একটু করে সুন্দর হবে। এই স্বপ্নটা আমার বুকে জ্বলত। প্রতিদিন।"
                    )}
                  </p>
                </div>
              </div>

              {/* The Decision */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-5 md:p-6 mb-6">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {t("Then one day...", "তারপর একদিন...")}
                </h3>
                <p className="text-foreground leading-relaxed mb-4">
                  {t(
                    "I decided - what's the point of just dreaming? Between work, staying up night after night, with a tired body - I started working.",
                    "সিদ্ধান্ত নিলাম - শুধু স্বপ্ন দেখে কী হবে? কাজের ফাঁকে ফাঁকে, রাতের পর রাত জেগে, ক্লান্ত শরীর নিয়ে - শুরু করলাম কাজ।"
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2">
                    <Users className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-muted-foreground text-sm">{t("No team", "কোনো টিম নেই")}</p>
                  </div>
                  <div className="text-center p-2">
                    <span className="text-xl mb-1 block">💰</span>
                    <p className="text-muted-foreground text-sm">{t("No funding", "কোনো ফান্ডিং নেই")}</p>
                  </div>
                  <div className="text-center p-2">
                    <Globe className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-muted-foreground text-sm">{t("No big connections", "কোনো বড় কানেকশন নেই")}</p>
                  </div>
                </div>
                <p className="text-primary font-bold text-lg text-center">
                  {t(
                    "But there is a dream. And the determination to make that dream come true.",
                    "কিন্তু আছে একটা স্বপ্ন। আর সেই স্বপ্নকে সত্যি করার জেদ।"
                  )}
                </p>
              </div>

              {/* UnityNets Introduction */}
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  {t("And so, gradually I built —", "আর তাই, ধীরে ধীরে তৈরি করে ফেলেছি —")}
                </h2>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  UnityNets
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                  {t("A platform where:", "একটা প্ল্যাটফর্ম যেখানে:")}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-card border border-border/30 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{t("Report Local Issues", "স্থানীয় সমস্যা রিপোর্ট")}</h4>
                    <p className="text-xs text-muted-foreground">{t("Ward-based issue reporting system", "ওয়ার্ড বেসড সমস্যা রিপোর্টিং সিস্টেম")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{t("AI Learning Zone", "AI Learning Zone")}</h4>
                    <p className="text-xs text-muted-foreground">{t("Learn new skills with AI assistance", "নতুন স্কিল শিখুন AI-এর সাহায্যে")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{t("Community Connect", "কমিউনিটি কানেক্ট")}</h4>
                    <p className="text-xs text-muted-foreground">{t("Connect with people in your area", "আপনার এলাকার মানুষদের সাথে যুক্ত হন")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{t("Trust Score", "ট্রাস্ট স্কোর")}</h4>
                    <p className="text-xs text-muted-foreground">{t("Find trustworthy people easily", "বিশ্বস্ত মানুষ খুঁজে পান সহজেই")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{t("Job Opportunities", "চাকরির সুযোগ")}</h4>
                    <p className="text-xs text-muted-foreground">{t("Local job board & opportunities", "লোকাল জব বোর্ড ও সুযোগ")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{t("Events", "ইভেন্ট")}</h4>
                    <p className="text-xs text-muted-foreground">{t("Local events & programs", "স্থানীয় ইভেন্ট ও অনুষ্ঠান")}</p>
                  </div>
                </div>
                
                <p className="text-center text-muted-foreground mt-4 text-sm">
                  {t(
                    "A complete ecosystem — just for your community.",
                    "মানে একটা সম্পূর্ণ ইকোসিস্টেম — শুধু আপনার কমিউনিটির জন্য।"
                  )}
                </p>
              </div>

              {/* Why */}
              <div className="bg-card border border-border/30 rounded-xl p-5 md:p-6 mb-6">
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {t("Why did I build this?", "কেন বানালাম?")}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  {t(
                    "Because there are thousands of people like me — who are stuck. Who have dreams but no path.",
                    "কারণ আমার মতো হাজারো মানুষ আছে — যারা আটকে আছে। যাদের স্বপ্ন আছে কিন্তু পথ নেই।"
                  )}
                </p>
                <p className="text-foreground leading-relaxed text-lg">
                  <strong>{t("The truth?", "সত্যি কথা?")}</strong> {t(
                    "I don't know if this will succeed. I have no money, no team, no connections.",
                    "আমি জানি না এটা সফল হবে কিনা। আমার কাছে টাকা নেই, টিম নেই, কানেকশন নেই।"
                  )}
                  <span className="text-primary font-bold"> {t("But I haven't given up.", "কিন্তু হাল ছাড়িনি।")}</span>
                </p>
              </div>

              {/* Call for Help */}
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 md:p-10 text-center mb-10">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {t("I'm writing this because:", "এই পোস্টটা লিখছি কারণ:")}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-background/50 rounded-xl p-4">
                    <p className="text-foreground">
                      {t("Maybe an ", "হয়তো কোনো ")}
                      <strong>{t("investor", "ইনভেস্টর")}</strong>
                      {t(" will see this", " দেখবে")}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4">
                    <p className="text-foreground">
                      {t("Maybe a ", "হয়তো কোনো ")}
                      <strong>{t("mentor", "মেন্টর")}</strong>
                      {t(" will help", " সাহায্য করবে")}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4">
                    <p className="text-foreground">
                      {t("Maybe someone will ", "হয়তো কেউ ")}
                      <strong>{t("join the team", "টিমে জয়েন")}</strong>
                      {t("", " করবে")}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4">
                    <p className="text-foreground">
                      {t(
                        "Or maybe someone like me will understand — ",
                        "অথবা হয়তো আমার মতো আরেকজন বুঝবে — "
                      )}
                      <strong>{t("they are not alone", "সে একা নয়")}</strong>
                    </p>
                  </div>
                </div>
                <p className="text-foreground text-lg">
                  {t(
                    "I don't know how many will see this post. But if even one person sees it and thinks",
                    "আমি জানি না এই পোস্ট কতজন দেখবে। কিন্তু যদি একজনও দেখে এবং মনে করে"
                  )}
                  <span className="text-primary font-bold"> "{t("I can do it too", "আমিও পারি")}"</span> — {t("then I've won.", "তাহলেই জিতে গেছি।")}
                </p>
              </div>

              {/* Contact Form Section */}
              <div id="contact" className="bg-card border border-border/30 rounded-2xl p-6 md:p-10 mb-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <MessageCircle className="w-4 h-4" />
                    <span>{t("Get in Touch", "যোগাযোগ করুন")}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {t("Join This Journey", "এই যাত্রায় সহযোগী হন")}
                  </h3>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    {t(
                      "Want to contribute, invest, mentor, or just say hello? Fill out the form below and let's build something amazing together.",
                      "কন্ট্রিবিউট করতে চান, ইনভেস্ট করতে চান, মেন্টর হতে চান, অথবা শুধু হ্যালো বলতে চান? নিচের ফর্মটি পূরণ করুন এবং একসাথে অসাধারণ কিছু তৈরি করি।"
                    )}
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-2">
                      {t("Thank You!", "ধন্যবাদ!")}
                    </h4>
                    <p className="text-muted-foreground">
                      {t("Your message has been received. I'll get back to you soon.", "আপনার মেসেজ পেয়েছি। শীঘ্রই যোগাযোগ করব।")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                    {/* Contribution Type Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        {t("How would you like to contribute?", "আপনি কীভাবে সহযোগিতা করতে চান?")}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {contributionTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, contributionType: type.id })}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              formData.contributionType === type.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <type.icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {t("Your Name", "আপনার নাম")} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder={t("Enter your name", "আপনার নাম লিখুন")}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {t("Email Address", "ইমেইল অ্যাড্রেস")} *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder={t("Enter your email", "আপনার ইমেইল লিখুন")}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("Your Message", "আপনার মেসেজ")} *
                      </label>
                      <Textarea
                        placeholder={t(
                          "Tell me about yourself and how you'd like to contribute to this journey...",
                          "নিজের সম্পর্কে বলুন এবং এই যাত্রায় কীভাবে সহযোগিতা করতে চান..."
                        )}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className="resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {t("Sending...", "পাঠানো হচ্ছে...")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          {t("Send Message", "মেসেজ পাঠান")}
                        </span>
                      )}
                    </Button>

                    {/* Alternative Contact */}
                    <div className="text-center pt-4 border-t border-border/30">
                      <p className="text-muted-foreground text-sm mb-3">
                        {t("Or reach me directly at:", "অথবা সরাসরি যোগাযোগ করুন:")}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <a
                          href="mailto:tozammelbusiness@gmail.com"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          tozammelbusiness@gmail.com
                        </a>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Final Message */}
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg mb-4">
                  {t(
                    "If you want to help — my DM is open.",
                    "আর যদি কেউ সাহায্য করতে চায় — আমার DM খোলা আছে।"
                  )}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {t("Together we can build a better community.", "একসাথে আমরা একটা সুন্দর কমিউনিটি গড়ে তুলতে পারি।")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
