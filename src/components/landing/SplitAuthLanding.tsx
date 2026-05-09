import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sparkles,
  Globe2,
  Users,
  ShieldCheck,
  Loader2,
  GraduationCap,
  Coins,
  Heart,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRealStats } from "@/hooks/useRealStats";

const SplitAuthLanding = () => {
  const navigate = useNavigate();
  const stats = useRealStats();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Register state
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rShowPassword, setRShowPassword] = useState(false);
  const [rLoading, setRLoading] = useState(false);

  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rEmail || !rPassword) {
      toast({ title: "Missing info", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    if (rPassword.length < 6) {
      toast({ title: "Weak password", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setRLoading(true);
    const { error } = await supabase.auth.signUp({
      email: rEmail,
      password: rPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { full_name: rName },
      },
    });
    setRLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Check your inbox",
      description: "We sent you a verification email to finish creating your account.",
    });
  };

  const handleOAuth = async (provider: "google" | "facebook" | "apple" | "linkedin_oidc") => {
    if (provider === "linkedin_oidc" || provider === "facebook" || provider === "apple") {
      // Not configured by default — gracefully attempt and fall back
    }
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (error) {
      setOauthLoading(null);
      toast({
        title: "Coming soon",
        description: `${provider.replace("_oidc", "")} sign-in will be enabled shortly.`,
      });
    }
  };

  const features = [
    { icon: Users, label: "Community Driven", desc: "Built by members, for members." },
    { icon: GraduationCap, label: "Skill Sharing", desc: "Learn from a global network." },
    { icon: Coins, label: "Unity Notes Rewards", desc: "1 hour of service = 1 Note." },
    { icon: Globe2, label: "Global Collaboration", desc: "120+ countries connected." },
  ];

  return (
    <div className="min-h-screen w-full bg-[hsl(220,40%,4%)] text-white flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT: Branding */}
      <section className="relative lg:w-1/2 min-h-[55vh] lg:min-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-10 lg:py-14 overflow-hidden">
        {/* Cinematic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,55%,9%)] via-[hsl(215,65%,5%)] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(195,100%,50%)/0.18,transparent_55%)]" />
        <div className="absolute -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-cyan-400/20 blur-[140px] animate-pulse" />
        <div
          className="absolute bottom-[-12rem] right-[-8rem] w-[36rem] h-[36rem] rounded-full bg-blue-600/25 blur-[160px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-300/10 blur-3xl" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(195,100%,80%) 1px, transparent 1px), linear-gradient(90deg, hsl(195,100%,80%) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute block rounded-full bg-cyan-300/70 animate-pulse"
              style={{
                width: i % 3 === 0 ? 3 : 1.5,
                height: i % 3 === 0 ? 3 : 1.5,
                top: `${(i * 47) % 100}%`,
                left: `${(i * 31) % 100}%`,
                animationDelay: `${(i % 7) * 0.35}s`,
                animationDuration: `${3 + (i % 5)}s`,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="UnityNets" className="h-10 w-auto drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
          <span className="text-lg font-semibold tracking-tight">UnityNets</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-xl py-10 lg:py-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs text-white/70">A trusted global community</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
            Trust,{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Learn,
            </span>{" "}
            Unite
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/65 max-w-lg leading-relaxed">
            Join a trusted global community for learning, collaboration, meaningful connections, and shared growth.
          </p>

          {/* Feature glass cards */}
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-lg">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-4 hover:bg-white/[0.06] hover:border-cyan-400/30 transition-all"
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                  <p className="text-sm font-semibold">{label}</p>
                </div>
                <p className="text-[11px] text-white/55 leading-snug">{desc}</p>
              </div>
            ))}
          </div>

          {/* Floating UI previews — desktop only */}
          <div className="hidden xl:block relative mt-10 h-32">
            <div className="absolute top-0 left-0 w-60 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-3 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
                <div>
                  <p className="text-[11px] font-semibold">Aanya · India</p>
                  <p className="text-[9px] text-white/50">Shared a skill</p>
                </div>
              </div>
              <p className="text-[11px] text-white/70">"Learned web design from Brazil today."</p>
            </div>
            <div
              className="absolute top-8 left-52 w-56 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-3 shadow-2xl animate-fade-in"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-cyan-300" />
                <p className="text-[11px] font-semibold">Live conversations</p>
              </div>
              <p className="text-[10px] text-white/55">Members chatting in real time</p>
            </div>
            <div
              className="absolute top-2 left-[26rem] w-48 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-3 shadow-2xl animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                <p className="text-[11px] font-semibold">Growing daily</p>
              </div>
              <p className="text-[10px] text-white/55">New members worldwide</p>
            </div>
          </div>
        </div>

        {/* Live social proof */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <Users className="w-4 h-4 text-cyan-300" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{stats.isLoading ? "—" : `${stats.activeUsers}+`}</p>
              <p className="text-[10px] text-white/50">Active Members</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <Heart className="w-4 h-4 text-cyan-300" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{stats.isLoading ? "—" : `${stats.totalPosts}+`}</p>
              <p className="text-[10px] text-white/50">Shared Posts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <TrendingUp className="w-4 h-4 text-cyan-300" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Growing</p>
              <p className="text-[10px] text-white/50">Daily</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">100%</p>
              <p className="text-[10px] text-white/50">Free Forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: Auth */}
      <section className="relative lg:w-1/2 min-h-screen flex items-center justify-center px-5 sm:px-8 py-12 bg-[hsl(220,40%,4%)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(220,50%,11%),transparent_60%)]" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] p-6 sm:p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight">Welcome Back</h2>
              <p className="text-sm text-white/55 mt-1.5">Sign in to continue to UnityNets</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-white/[0.04] border border-white/10 p-1 h-11 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-blue-500 data-[state=active]:text-[hsl(220,40%,8%)] data-[state=active]:shadow-md text-white/70"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-blue-500 data-[state=active]:text-[hsl(220,40%,8%)] data-[state=active]:shadow-md text-white/70"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-white/70">Email</Label>
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

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-white/65">
                      <Checkbox
                        checked={remember}
                        onCheckedChange={(v) => setRemember(!!v)}
                        className="border-white/20 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400 data-[state=checked]:text-[hsl(220,40%,8%)]"
                      />
                      Remember me
                    </label>
                    <Link to="/auth?mode=login" className="text-cyan-300/80 hover:text-cyan-200">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[hsl(220,40%,8%)] font-semibold shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rname" className="text-xs text-white/70">Full name</Label>
                    <Input
                      id="rname"
                      type="text"
                      placeholder="Your name"
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-400/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="remail" className="text-xs text-white/70">Email</Label>
                    <Input
                      id="remail"
                      type="email"
                      placeholder="you@example.com"
                      value={rEmail}
                      onChange={(e) => setREmail(e.target.value)}
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-400/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rpassword" className="text-xs text-white/70">Password</Label>
                    <div className="relative">
                      <Input
                        id="rpassword"
                        type={rShowPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={rPassword}
                        onChange={(e) => setRPassword(e.target.value)}
                        className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10 focus-visible:ring-cyan-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setRShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {rShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={rLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[hsl(220,40%,8%)] font-semibold shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    {rLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] uppercase tracking-wider text-white/40">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="h-11 rounded-xl bg-white text-gray-800 font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-sm disabled:opacity-60 text-sm"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google
              </button>

              <button
                onClick={() => handleOAuth("linkedin_oidc")}
                disabled={!!oauthLoading}
                className="h-11 rounded-xl bg-[#0A66C2] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#0958A8] transition-all shadow-sm disabled:opacity-60 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
                </svg>
                LinkedIn
              </button>

              <button
                onClick={() => handleOAuth("facebook")}
                disabled={!!oauthLoading}
                className="h-11 rounded-xl bg-[#1877F2] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#166FE0] transition-all shadow-sm disabled:opacity-60 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
                </svg>
                Facebook
              </button>

              <button
                onClick={() => handleOAuth("apple")}
                disabled={!!oauthLoading}
                className="h-11 rounded-xl bg-black text-white font-medium flex items-center justify-center gap-2 hover:bg-black/80 transition-all shadow-sm border border-white/10 disabled:opacity-60 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 12.04c-.03-3.02 2.47-4.47 2.58-4.55-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.59 1.1-.95 0-2.41-1.07-3.96-1.04-2.04.03-3.92 1.18-4.97 3-2.12 3.68-.54 9.12 1.52 12.11 1.01 1.46 2.21 3.1 3.78 3.04 1.52-.06 2.09-.98 3.93-.98 1.83 0 2.36.98 3.97.95 1.64-.03 2.68-1.49 3.68-2.96 1.16-1.7 1.64-3.35 1.66-3.43-.04-.02-3.18-1.22-3.22-4.84zM14.16 3.36c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.71 1.35.1 2.74-.69 3.58-1.7z"/>
                </svg>
                Apple
              </button>
            </div>

            <p className="mt-6 text-center text-[11px] text-white/45 leading-relaxed">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-white/70 hover:text-white underline-offset-2 hover:underline">Terms</Link>{" "}
              &{" "}
              <Link to="/terms" className="text-white/70 hover:text-white underline-offset-2 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SplitAuthLanding;
