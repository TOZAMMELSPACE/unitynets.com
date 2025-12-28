import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";

import ContentPreviewSection from "@/components/landing/ContentPreviewSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/SEOHead";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Trust • Learn • Unite"
        description="UnityNets - বাংলাদেশের প্রথম trust-based community platform। স্থানীয় সম্প্রদায়ে যুক্ত হন, জ্ঞান শেয়ার করুন, Unity Note দিয়ে সেবা বিনিময় করুন। Join for local engagement, learning, and building trust."
        keywords="UnityNets, community platform, Bangladesh, বাংলাদেশ, trust network, Unity Note, local community, সম্প্রদায়, civic engagement, learning platform, social network"
        canonicalUrl="https://unitynets.com/"
        ogType="website"
      />
      <Navbar />
      <main>
        <HeroSection />
        
        <ContentPreviewSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
