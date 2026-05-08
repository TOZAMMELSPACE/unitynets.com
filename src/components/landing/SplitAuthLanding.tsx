import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, Globe2, Users, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SplitAuthLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing info", description: "Please enter your email and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back!", description: "You are now signed in." });
    navigate("/home");
  };

  const handleGoogle = async () => {
    setOauthLoading("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (error) {
      setOauthLoading(null);
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    }
  };

  const handleFacebook = () => {
    toast({
      title: "Coming soon",
      description: "Facebook login will be available shortly. Please use email or Google.",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(220,40%,4%)] text-white flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT: Branding */}
      <section className="relative lg:w-1/2 min-h-[40vh] lg:min-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 lg:py-12 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,50%,8%)] via-[hsl(215,60%,6%)] to-black" />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-[hsl(195,100%,50%)]/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10rem] right-[-6rem] w-[32rem] h-[32rem] rounded-full bg-[hsl(220,90%,55%)]/25 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute block w-1 h-1 rounded-full bg-cyan-300/60 animate-pulse"
              style={{
                top: `${(i * 53) % 100}%`,
                left: `${(i * 37) % 100}%`,
                animationDelay: `${(i % 6) * 0.4}s`,
                animationDuration: `${3 + (i % 4)}s`,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="UnityNets" className="h-10 w-auto" />
          <span className="text-lg font-semibold tracking-tight">UnityNets</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-xl py-10 lg:py-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs text-white/70">A global community platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Trust.{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Learn.
            </span>{" "}
            Unite.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/65 max-w-md leading-relaxed">
            A global community where people connect, learn skills, and grow together.
          </p>

          {/* Floating glass cards */}
          <div className="hidden lg:block relative mt-10 h-44">
            <div className="absolute top-0 left-0 w-64 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
                <div>
                  <p className="text-xs font-semibold">Aanya from India</p>
                  <p className="text-[10px] text-white/50">Just shared a skill</p>
                </div>
              </div>
              <p className="text-xs text-white/70">"Learned web design from a member in Brazil today."</p>
            </div>
            <div
              className="absolute top-12 left-56 w-60 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 shadow-2xl animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Globe2 className="w-4 h-4 text-cyan-300" />
                <p className="text-xs font-semibold">120+ countries</p>
              </div>
              <p className="text-[11px] text-white/60">Connecting in real time</p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative z-10 flex flex-wrap gap-2.5">
          {[
            { icon: ShieldCheck, label: "100% Free" },
            { icon: Users, label: "Community Driven" },
            { icon: Globe2, label: "Global Members" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-white/80"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-300" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT: Auth */}
      <section className="relative lg:w-1/2 min-h-screen flex items-center justify-center px-5 sm:px-8 py-10 bg-[hsl(220,40%,4%)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(220,50%,10%),transparent_60%)]" />

        <div className="relative w-full max-w-md">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] p-6 sm:p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-white/55 mt-1">Log in to continue to UnityNets</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-white/70">Email or username</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-400/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-white/70">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10 focus-visible:ring-cyan-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[hsl(220,40%,8%)] font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
              </Button>

              <div className="text-center">
                <Link to="/auth?mode=login" className="text-xs text-cyan-300/80 hover:text-cyan-200">
                  Forgot password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] uppercase tracking-wider text-white/40">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social */}
            <div className="space-y-2.5">
              <button
                onClick={handleGoogle}
                disabled={!!oauthLoading}
                className="w-full h-11 rounded-xl bg-white text-gray-800 font-medium flex items-center justify-center gap-2.5 hover:bg-white/90 transition-all shadow-sm disabled:opacity-60"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>
              <button
                onClick={handleFacebook}
                className="w-full h-11 rounded-xl bg-[#1877F2] text-white font-medium flex items-center justify-center gap-2.5 hover:bg-[#166FE0] transition-all shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>

            {/* Create account */}
            <Link
              to="/auth?mode=signup"
              className="mt-4 w-full h-11 rounded-xl border border-cyan-400/30 text-cyan-200 font-medium flex items-center justify-center hover:bg-cyan-400/10 transition-all"
            >
              Create New Account
            </Link>
          </div>

          <p className="mt-5 text-center text-[11px] text-white/40">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-white/60 hover:text-white">Terms</Link> &{" "}
            <Link to="/terms" className="text-white/60 hover:text-white">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SplitAuthLanding;
