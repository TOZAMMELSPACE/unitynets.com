import { Login } from "@/components/Login";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { User } from "@/lib/storage";
import { SEOHead } from "@/components/SEOHead";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get mode from URL query param (?mode=signup or ?mode=login)
  const mode = searchParams.get('mode') as 'login' | 'signup' | null;
  const defaultMode = mode === 'signup' ? 'signup' : 'login';

  // Redirect to home feed if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  const handleLogin = (user: User) => {
    // Handled by useAuth
  };

  const handleRegister = (user: User) => {
    // Handled by useAuth
  };

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
        title={defaultMode === 'signup' ? "Sign Up - Create Account" : "Login - Sign In"}
        description="Join UnityNets - বাংলাদেশের প্রথম trust-based community platform। Create your account to connect with local communities, share knowledge, and build trust."
        keywords="UnityNets login, sign up, create account, register, community platform, বাংলাদেশ"
        canonicalUrl="https://unitynets.com/auth"
        noIndex={true}
      />
      <Login 
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={[]}
        defaultMode={defaultMode}
      />
    </>
  );
};

export default Auth;
