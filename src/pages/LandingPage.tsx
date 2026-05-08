import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SplitAuthLanding from "@/components/landing/SplitAuthLanding";
import SEOHead from "@/components/SEOHead";

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
    <>
      <SEOHead
        title="UnityNets — Trust. Learn. Unite."
        description="A global community where people connect, learn skills, and grow together. 100% free. Join UnityNets today."
        keywords="UnityNets, login, sign up, global community, learn skills, trust network"
        canonicalUrl="https://unitynets.com/"
        ogType="website"
      />
      <SplitAuthLanding />
    </>
  );
};

export default LandingPage;
