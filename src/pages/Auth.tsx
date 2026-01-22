import { Login } from "@/components/Login";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { User } from "@/lib/storage";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get mode from URL query param (?mode=signup or ?mode=login)
  const mode = searchParams.get('mode') as 'login' | 'signup' | null;
  const defaultMode = mode === 'signup' ? 'signup' : 'login';
  const redirect = searchParams.get('redirect');
  const action = searchParams.get('action');

  // Handle pending community post and redirect after login
  useEffect(() => {
    const handlePendingPost = async () => {
      if (!loading && user) {
        // Check for pending community post from Learning Zone
        const pendingPost = sessionStorage.getItem('pending_community_post');
        
        if (pendingPost && action === 'post') {
          try {
            const { data, error } = await supabase
              .from('posts')
              .insert({
                user_id: user.id,
                content: pendingPost,
                community_tag: 'learning',
              })
              .select()
              .single();

            if (error) throw error;

            sessionStorage.removeItem('pending_community_post');
            
            toast({
              title: "পোস্ট হয়েছে!",
              description: "আপনার প্রশ্ন কমিউনিটিতে শেয়ার হয়েছে",
            });
            
            navigate(`/post/${data.id}`);
            return;
          } catch (error) {
            console.error('Error creating pending post:', error);
            sessionStorage.removeItem('pending_community_post');
          }
        }
        
        // Default redirect
        if (redirect === 'home') {
          navigate('/home');
        } else {
          navigate('/home');
        }
      }
    };

    handlePendingPost();
  }, [user, loading, navigate, redirect, action]);

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
        description="Join UnityNets - a trust-based community platform starting from South Asia. Create your account to connect with global communities, share knowledge, and build trust."
        keywords="UnityNets login, sign up, create account, register, community platform, South Asia, global"
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
