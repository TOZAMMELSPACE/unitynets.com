import { Login } from "@/components/Login";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { User } from "@/lib/storage";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
    <Login 
      onLogin={handleLogin}
      onRegister={handleRegister}
      users={[]}
    />
  );
};

export default Auth;
