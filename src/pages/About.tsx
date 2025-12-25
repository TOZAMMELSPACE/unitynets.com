import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Heart, Globe, Users, Target, Sparkles, BookOpen, Shield, Briefcase, Calendar, MessageCircle, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import founderImage from "@/assets/founder.jpg";

const About = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Language Toggle */}
        <div className="fixed top-24 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border-border/50"
          >
            <Languages className="w-4 h-4" />
            {language === "en" ? "বাংলা" : "English"}
          </Button>
        </div>

        {/* Hero Section with Founder Story */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {t("A Dream That Became Reality...", "একটা স্বপ্ন ছিল...")}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("The journey of how UnityNet began", "যেভাবে শুরু হলো UnityNet-এর যাত্রা")}
              </p>
            </div>
          </div>
        </section>

        {/* Founder Section - Expanded */}
        <section className="py-16 md:py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Founder Info Card */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30 rounded-3xl p-8 md:p-12 mb-16">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="relative">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src={founderImage} 
                        alt={t("UnityNet Founder - Md. Tozammel Haque", "UnityNet প্রতিষ্ঠাতা - মো. তোজাম্মেল হক")}
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Journey Intro */}
              <div className="space-y-6 mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  <span>{t("My Story", "আমার গল্প")}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                  {t(
                    "5 years. I've been working as a computer operator for 5 full years.",
                    "৫ বছর। পুরো ৫ বছর ধরে কম্পিউটার অপারেটরের চাকরি করছি।"
                  )}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t(
                    "1.6 years ago, I came to Dhaka with a dream. I thought maybe something would happen here. Something would change.",
                    "১.৬ বছর আগে স্বপ্ন নিয়ে ঢাকায় এসেছিলাম। ভেবেছিলাম হয়তো এখানে কিছু হবে। কিছু একটা বদলাবে।"
                  )}
                </p>
              </div>

              {/* The Reality */}
              <div className="bg-card border border-border/30 rounded-2xl p-8 md:p-10 mb-12">
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
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>{t("That dream still lives...", "সেই স্বপ্নটা এখনো আছে...")}</span>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                    {t(
                      "I remember dreaming of a different world. A place where people would give time to each other. Where there is trust, love, and empathy.",
                      "মনে আছে, একসময় স্বপ্ন দেখতাম একটা ভিন্ন পৃথিবীর। এমন একটা জায়গার, যেখানে মানুষ মানুষের জন্য সময় দেবে। যেখানে বিশ্বাস আছে, ভালোবাসা আছে, সহানুভূতি আছে।"
                    )}
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                    {t(
                      "A platform that wouldn't be toxic like today's social media. Where:",
                      "এমন একটা প্ল্যাটফর্মের, যেটা আজকের দিনের সোশ্যাল মিডিয়ার মতো বিষাক্ত হবে না। যেখানে:"
                    )}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-foreground">
                        {t(
                          "Instead of negativity, there will be ",
                          "নেগেটিভিটির বদলে থাকবে "
                        )}
                        <strong>{t("positivity", "পজিটিভিটি")}</strong>
                      </p>
                    </div>
                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                      <p className="text-foreground">
                        {t(
                          "Instead of hatred, there will be ",
                          "হিংসার বদলে থাকবে "
                        )}
                        <strong>{t("love", "ভালোবাসা")}</strong>
                      </p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-foreground">
                        {t(
                          "Instead of hate, there will be ",
                          "ঘৃণার বদলে থাকবে "
                        )}
                        <strong>{t("cooperation", "সহযোগিতা")}</strong>
                      </p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-foreground">
                        {t(
                          "Instead of cringe content, there will be ",
                          "ক্রিন্জ কনটেন্টের বদলে থাকবে "
                        )}
                        <strong>{t("knowledge & creativity", "জ্ঞান ও সৃষ্টিশীলতা")}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-foreground leading-relaxed text-lg font-medium">
                    {t(
                      "A place where good people will become better. And those who are on the wrong path will gradually change. Become good.",
                      "এমন একটা জায়গা, যেখানে ভালো মানুষ আরও ভালো হবে। আর যারা খারাপ পথে হাঁটছে, তারাও এসে একটু একটু করে বদলে যাবে। ভালো হবে।"
                    )}
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed text-lg mt-6">
                    {t(
                      "Trust in humanity will return. Morality will grow. Society will slowly become beautiful. This dream burned in my heart. Every day.",
                      "মানুষের প্রতি মানুষের বিশ্বাস ফিরে আসবে। নৈতিকতা বাড়বে। সমাজ একটু একটু করে সুন্দর হবে। এই স্বপ্নটা আমার বুকে জ্বলত। প্রতিদিন।"
                    )}
                  </p>
                </div>
              </div>

              {/* The Decision */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-10 mb-12">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {t("Then one day...", "তারপর একদিন...")}
                </h3>
                <p className="text-foreground leading-relaxed text-lg mb-6">
                  {t(
                    "I decided - what's the point of just dreaming? Between work, staying up night after night, with a tired body - I started working.",
                    "সিদ্ধান্ত নিলাম - শুধু স্বপ্ন দেখে কী হবে? কাজের ফাঁকে ফাঁকে, রাতের পর রাত জেগে, ক্লান্ত শরীর নিয়ে - শুরু করলাম কাজ।"
                  )}
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">{t("No team", "কোনো টিম নেই")}</p>
                  </div>
                  <div className="text-center p-4">
                    <span className="text-3xl mb-2 block">💰</span>
                    <p className="text-muted-foreground">{t("No funding", "কোনো ফান্ডিং নেই")}</p>
                  </div>
                  <div className="text-center p-4">
                    <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">{t("No big connections", "কোনো বড় কানেকশন নেই")}</p>
                  </div>
                </div>
                <p className="text-primary font-bold text-xl text-center">
                  {t(
                    "But there is a dream. And the determination to make that dream come true.",
                    "কিন্তু আছে একটা স্বপ্ন। আর সেই স্বপ্নকে সত্যি করার জেদ।"
                  )}
                </p>
              </div>

              {/* UnityNet Introduction */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {t("And so, gradually I built —", "আর তাই, ধীরে ধীরে তৈরি করে ফেলেছি —")}
                </h2>
                <p className="text-5xl md:text-6xl font-bold text-primary mb-8">
                  UnityNet
                </p>
              </div>

              {/* Features */}
              <div className="mb-16">
                <h3 className="text-xl font-semibold text-foreground mb-8 text-center">
                  {t("A platform where:", "একটা প্ল্যাটফর্ম যেখানে:")}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-card border border-border/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("Report Local Issues", "স্থানীয় সমস্যা রিপোর্ট")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Ward-based issue reporting system", "ওয়ার্ড বেসড সমস্যা রিপোর্টিং সিস্টেম")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("AI Learning Zone", "AI Learning Zone")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Learn new skills with AI assistance", "নতুন স্কিল শিখুন AI-এর সাহায্যে")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("Community Connect", "কমিউনিটি কানেক্ট")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Connect with people in your area", "আপনার এলাকার মানুষদের সাথে যুক্ত হন")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("Trust Score", "ট্রাস্ট স্কোর")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Find trustworthy people easily", "বিশ্বস্ত মানুষ খুঁজে পান সহজেই")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("Job Opportunities", "চাকরির সুযোগ")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Local job board & opportunities", "লোকাল জব বোর্ড ও সুযোগ")}</p>
                  </div>
                  
                  <div className="bg-card border border-border/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t("Events", "ইভেন্ট")}</h4>
                    <p className="text-sm text-muted-foreground">{t("Local events & programs", "স্থানীয় ইভেন্ট ও অনুষ্ঠান")}</p>
                  </div>
                </div>
                
                <p className="text-center text-muted-foreground mt-8 text-lg">
                  {t(
                    "A complete ecosystem — just for your community.",
                    "মানে একটা সম্পূর্ণ ইকোসিস্টেম — শুধু আপনার কমিউনিটির জন্য।"
                  )}
                </p>
              </div>

              {/* Why */}
              <div className="bg-card border border-border/30 rounded-2xl p-8 md:p-10 mb-12">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {t("Why did I build this?", "কেন বানালাম?")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
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
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 md:p-12 text-center mb-12">
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
                <p className="text-foreground text-lg mb-8">
                  {t(
                    "I don't know how many will see this post. But if even one person sees it and thinks",
                    "আমি জানি না এই পোস্ট কতজন দেখবে। কিন্তু যদি একজনও দেখে এবং মনে করে"
                  )}
                  <span className="text-primary font-bold"> "{t("I can do it too", "আমিও পারি")}"</span> — {t("then I've won.", "তাহলেই জিতে গেছি।")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="default" size="lg" onClick={() => navigate('/', { state: { showSignup: true } })}>
                    <Heart className="w-5 h-5 mr-2" />
                    {t("Join the Journey", "যাত্রায় যোগ দিন")}
                  </Button>
                  <Button variant="outline" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {t("Contact Me", "যোগাযোগ করুন")}
                  </Button>
                </div>
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
