import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import MinimalHero from "@/components/landing/MinimalHero";
import SEOHead from "@/components/SEOHead";

const SocialProofBar = lazy(() => import("@/components/landing/SocialProofBar"));
const WhyUnitySection = lazy(() => import("@/components/landing/WhyUnitySection"));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection"));
const MinimalFooter = lazy(() => import("@/components/landing/MinimalFooter"));

const SectionLoader = () => (
  <div className="py-8 flex justify-center">
    <div className="animate-pulse h-24 w-full max-w-4xl bg-muted/20 rounded-lg" />
  </div>
);

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/home");
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
        title="Trust. Learn. Unite. — UnityNets"
        description="Join the world community. A free global platform where people share knowledge, build trust, and grow together. 100% free. No ads."
        keywords="UnityNets, world community, learn skills, trust network, global community, free learning, social platform"
        canonicalUrl="https://unitynets.com/"
        ogType="website"
      />
      <Navbar />
      <main>
        <MinimalHero />
        <Suspense fallback={<SectionLoader />}>
          <SocialProofBar />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <WhyUnitySection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FinalCTASection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionLoader />}>
        <MinimalFooter />
      </Suspense>
    </div>
  );
};

export default LandingPage;
