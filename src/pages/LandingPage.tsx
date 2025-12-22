import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { ContentPreviewSection } from "@/components/landing/ContentPreviewSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { Login } from "@/components/Login";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const state = location.state as { showLogin?: boolean; showSignup?: boolean } | null;
    if (state?.showLogin) {
      setAuthMode('login');
      setShowAuthDialog(true);
      window.history.replaceState({}, document.title);
    } else if (state?.showSignup) {
      setAuthMode('signup');
      setShowAuthDialog(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <ContentPreviewSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <Login 
            onLogin={() => setShowAuthDialog(false)}
            onRegister={() => setShowAuthDialog(false)}
            users={[]}
            defaultMode={authMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
