import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Heart, Globe, Users, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="hero-heading text-foreground mb-6 text-bengali">
              আমাদের মিশন ও স্বপ্ন
            </h1>
            <p className="subheading max-w-3xl mx-auto text-bengali">
              দক্ষিণ এশিয়া থেকে সারা বিশ্বে — আমরা সবাইকে একত্রিত করতে চাই
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
                <div>
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Target className="w-4 h-4" />
                    <span className="text-bengali">আমাদের মিশন</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-bengali">
                    বিশ্বাস, শিক্ষা ও ঐক্যের মাধ্যমে পরিবর্তন
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-bengali">
                    ইউনিটিনেটস এমন একটি প্ল্যাটফর্ম যেখানে মানুষ তাদের জ্ঞান, দক্ষতা ও অভিজ্ঞতা ভাগ করে নেয়।
                    আমরা বিশ্বাস করি যে একসাথে কাজ করলে আমরা আরও শক্তিশালী হই।
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 flex items-center justify-center">
                  <Globe className="w-32 h-32 text-primary/50" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card border border-border/30 rounded-xl p-6 text-center">
                  <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-bengali">সম্প্রদায়</h3>
                  <p className="text-sm text-muted-foreground text-bengali">সবাইকে একত্রিত করা</p>
                </div>
                <div className="bg-card border border-border/30 rounded-xl p-6 text-center">
                  <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-bengali">ভালোবাসা</h3>
                  <p className="text-sm text-muted-foreground text-bengali">পারস্পরিক সম্মান ও যত্ন</p>
                </div>
                <div className="bg-card border border-border/30 rounded-xl p-6 text-center">
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-bengali">উন্নয়ন</h3>
                  <p className="text-sm text-muted-foreground text-bengali">একসাথে বেড়ে ওঠা</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4 text-bengali">আজই আমাদের সাথে যোগ দিন</h2>
            <Button variant="hero" size="lg" onClick={() => navigate('/', { state: { showSignup: true } })}>
              <span className="text-bengali">ফ্রি রেজিস্ট্রেশন</span>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
