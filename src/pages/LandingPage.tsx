import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SEOHead from "@/components/SEOHead";

// Lazy load below-the-fold sections for faster initial load
const ContentPreviewSection = lazy(() => import("@/components/landing/ContentPreviewSection"));
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));
const Footer = lazy(() => import("@/components/landing/Footer"));

// Minimal loading placeholder
const SectionLoader = () => (
  <div className="py-8 flex justify-center">
    <div className="animate-pulse h-32 w-full max-w-4xl bg-muted/20 rounded-lg" />
  </div>
);

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
        description="UnityNets - World's trusted community platform. Building bridges of unity from South Asia to the world. Join for skill sharing, learning, and mutual growth."
        keywords="UnityNets, community platform, world community, trust network, Unity Note, global community, skill sharing, learning platform, social network, South Asia"
        canonicalUrl="https://unitynets.com/"
        ogType="website"
      />
      <Navbar />
      <main>
        <HeroSection />
        
        <Suspense fallback={<SectionLoader />}>
          <ContentPreviewSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <CTASection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;
