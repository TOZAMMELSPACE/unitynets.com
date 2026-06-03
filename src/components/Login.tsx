import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, LogIn, Eye, EyeOff, FileText, Shield, Users, Scale, Lock, Heart, Phone, Globe, Mail, ArrowRight, Sparkles, GraduationCap, HandHeart, Quote } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  defaultMode?: 'login' | 'signup';
}

// Schema functions that accept language
const createSignupSchema = (isEnglish: boolean) => z.object({
  fullName: z.string().min(2, isEnglish ? "Please enter your name" : "নাম দিন"),
  email: z.string().email(isEnglish ? "Please enter a valid email" : "সঠিক ইমেইল দিন"),
  phone: z.string().optional(),
  password: z.string().min(6, isEnglish ? "Minimum 6 characters" : "কমপক্ষে ৬ অক্ষর"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: isEnglish ? "Passwords do not match" : "পাসওয়ার্ড মিলছে না",
  path: ["confirmPassword"],
});

const createLoginSchema = (isEnglish: boolean) => z.object({
  email: z.string().email(isEnglish ? "Please enter a valid email" : "সঠিক ইমেইল দিন"),
  password: z.string().min(1, isEnglish ? "Please enter password" : "পাসওয়ার্ড দিন"),
});

type SignupFormData = z.infer<ReturnType<typeof createSignupSchema>>;
type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export const Login = ({ users, onLogin, onRegister, defaultMode = 'login' }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(defaultMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | 'google' | 'apple'>(null);
  const { language, toggleLanguage, t } = useLanguage();

  const isEnglish = language === "en";

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      setOauthLoading(provider);
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/home`,
      });
      if (result.error) {
        toast({ title: t("Error", "ত্রুটি"), description: result.error.message ?? "OAuth failed", variant: "destructive" });
        setOauthLoading(null);
      }
      // if redirected, browser leaves the page
    } catch (e) {
      toast({ title: t("Error", "ত্রুটি"), description: "OAuth failed", variant: "destructive" });
      setOauthLoading(null);
    }
  };

  // Memoize schemas based on language
  const signupSchema = useMemo(() => createSignupSchema(isEnglish), [isEnglish]);
  const loginSchema = useMemo(() => createLoginSchema(isEnglish), [isEnglish]);

  const termsContent = [
    { icon: FileText, title: "সেবার শর্তাবলী", titleEn: "Terms of Service", content: isEnglish ? "By using the UnityNets platform, you agree to these terms." : "UnityNets প্ল্যাটফর্ম ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন।" },
    { icon: Shield, title: "গোপনীয়তা নীতি", titleEn: "Privacy Policy", content: isEnglish ? "Your personal information will be protected." : "আপনার ব্যক্তিগত তথ্য সুরক্ষিত থাকবে।" },
    { icon: Users, title: "সম্প্রদায় নির্দেশিকা", titleEn: "Community Guidelines", content: isEnglish ? "Respect all members of the community." : "সকল সদস্যকে সম্মান করুন।" },
    { icon: Scale, title: "Unity Note নীতি", titleEn: "Unity Note Policy", content: isEnglish ? "1 hour of service = 1 Unity Note." : "১ ঘণ্টা সেবা = ১ Unity Note।" },
    { icon: Lock, title: "নিরাপত্তা", titleEn: "Security", content: isEnglish ? "Use a strong password." : "শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।" },
    { icon: Heart, title: "সেবা মান", titleEn: "Service Quality", content: isEnglish ? "Provide promised services honestly." : "প্রতিশ্রুত সেবা সততার সাথে প্রদান করুন।" },
  ];

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: { full_name: data.fullName.trim(), phone: data.phone || '' },
        },
      });
      if (error) {
        toast({ title: t("Error", "ত্রুটি"), description: error.message.includes('already registered') ? t("This email is already registered", "এই ইমেইল ইতিমধ্যে নিবন্ধিত") : error.message, variant: "destructive" });
        return;
      }
      toast({ title: t("Welcome! 🎉", "স্বাগতম! 🎉"), description: t("Your account has been created", "আপনার একাউন্ট তৈরি হয়েছে") });
    } catch {
      toast({ title: t("Error", "ত্রুটি"), description: t("Failed to create account", "একাউন্ট তৈরিতে সমস্যা"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) {
        toast({ title: t("Error", "ত্রুটি"), description: t("Invalid email or password", "ইমেইল বা পাসওয়ার্ড ভুল"), variant: "destructive" });
        return;
      }
      toast({ title: t("Welcome!", "স্বাগতম!"), description: t("You have successfully logged in", "আপনি সফলভাবে লগইন করেছেন") });
    } catch {
      toast({ title: t("Error", "ত্রুটি"), description: t("Login failed", "লগইন ব্যর্থ"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-[hsl(220,18%,8%)] md:overflow-hidden">
      {/* Left Panel - Glass Editorial Branding */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 relative overflow-hidden md:h-screen bg-[#032121] text-white border-r border-emerald-900/30">
        {/* Atmospheric blurs */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-teal-600/15 blur-[120px] rounded-full" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16,185,129,0.06) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full w-full px-10 lg:px-14 xl:px-20 py-12 lg:py-16">
          {/* Logo + Badge */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/40 blur-xl rounded-full" />
                <img src="/logo.png" alt="UnityNets" className="relative h-10 lg:h-11 w-auto" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                A free global community
              </span>
            </div>
          </div>

          {/* Headline + Description */}
          <div className="mt-14 mb-10">
            <h1
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Trust.<br />
              Learn.{" "}
              <span
                className="italic"
                style={{
                  background: 'linear-gradient(135deg, hsl(174,75%,65%), hsl(160,70%,60%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Unite.
              </span>
            </h1>
            <p
              className="text-base lg:text-lg text-emerald-100/65 leading-[1.7] max-w-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Where curious minds meet kind hearts. Share what you know, learn what you love.
            </p>
          </div>

          {/* Value Pills */}
          <div className="flex flex-wrap gap-2.5 mb-auto">
            {[
              { icon: GraduationCap, label: "Learn Skills" },
              { icon: HandHeart, label: "Share Trust" },
              { icon: Users, label: "Connect Globally" },
            ].map((item, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors flex items-center gap-2 group"
              >
                <item.icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white/90">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Quote className="w-7 h-7 text-emerald-500/50 mb-3" />
            <p className="text-[15px] lg:text-base font-medium leading-[1.65] italic text-emerald-50/95">
              "This is the first place online that actually feels like a community — kind, real, and global."
            </p>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm border-2 border-emerald-900/50">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Aisha R.</p>
                  <p className="text-[11px] text-emerald-400/80 mt-0.5">Student • Nairobi</p>
                </div>
              </div>
              <div className="flex -space-x-2 opacity-80">
                <div className="w-6 h-6 rounded-full bg-orange-400/80 border border-[#032121]" />
                <div className="w-6 h-6 rounded-full bg-purple-400/80 border border-[#032121]" />
                <div className="w-6 h-6 rounded-full bg-emerald-400/80 border border-[#032121]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div
        className="w-full md:w-3/5 lg:w-1/2 flex md:items-start lg:items-center justify-center p-6 sm:p-8 lg:p-10 md:h-screen md:overflow-y-auto pb-[40vh] md:pb-10"
        onFocusCapture={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            // Wait for mobile keyboard to appear, then bring field into view
            window.setTimeout(() => {
              target.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 300);
          }
        }}
      >
        <div className="w-full max-w-md animate-fade-in py-2 md:py-6">
          {/* Mobile Logo + Tagline only */}
          <div className="md:hidden mb-8 text-center">
            <img src="/logo.png" alt="UnityNets Logo" className="h-12 w-auto mx-auto mb-5" />
            <h1 className="text-2xl font-display font-bold text-[hsl(220,10%,95%)] leading-tight">
              {t("Trust. Learn.", "Trust. Learn.")} <span className="text-[hsl(174,55%,55%)]">{t("Unite.", "Unite.")}</span>
            </h1>
            <p className="text-sm text-[hsl(220,10%,55%)] mt-2 max-w-xs mx-auto">
              {t("Join a global community for learning, sharing, and growth.", "শেখা, শেয়ার ও বৃদ্ধির জন্য কমিউনিটিতে যোগ দিন।")}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-end mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1.5 sm:gap-2 bg-[hsl(220,15%,14%)] border border-[hsl(220,15%,20%)] hover:bg-[hsl(220,15%,18%)] text-[hsl(220,10%,75%)] rounded-full px-3 sm:px-4 h-8 sm:h-9"
            >
              <Globe className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[hsl(174,55%,50%)]" />
              <span className="text-xs sm:text-sm">{language === "en" ? "বাংলা" : "EN"}</span>
            </Button>
          </div>

          {/* Welcome Text */}
          <div className="mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[hsl(220,10%,95%)] mb-1.5 sm:mb-2">
              {isRegistering ? t("Create Account", "অ্যাকাউন্ট তৈরি করুন") : t("Welcome Back", "স্বাগতম")}
            </h2>
            <p className="text-sm sm:text-base text-[hsl(220,10%,55%)]">
              {isRegistering 
                ? t("Join our community today", "আজই আমাদের কমিউনিটিতে যোগ দিন") 
                : t("Sign in to continue to UnityNets", "UnityNets এ চালিয়ে যেতে সাইন ইন করুন")}
            </p>
          </div>

          {/* Tab Switch */}
          <div className="flex mb-5 sm:mb-7 bg-[hsl(220,15%,12%)] rounded-lg sm:rounded-xl p-1 border border-[hsl(220,15%,18%)]">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                !isRegistering 
                  ? 'bg-[hsl(174,55%,45%)] text-[hsl(220,18%,10%)] shadow-lg' 
                  : 'text-[hsl(220,10%,50%)] hover:text-[hsl(220,10%,70%)]'
              }`}
            >
              <LogIn className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              {t("Login", "লগইন")}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                isRegistering 
                  ? 'bg-[hsl(174,55%,45%)] text-[hsl(220,18%,10%)] shadow-lg' 
                  : 'text-[hsl(220,10%,50%)] hover:text-[hsl(220,10%,70%)]'
              }`}
            >
              <UserPlus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              {t("Register", "নিবন্ধন")}
            </button>
          </div>

          {/* Forms */}
          <div className="bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,18%)] rounded-xl sm:rounded-2xl p-4 sm:p-6">
            {isRegistering ? (
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[hsl(220,10%,80%)]">{t("Full Name", "পুরো নাম")}</Label>
                  <Input
                    placeholder={t("Enter your name", "আপনার নাম লিখুন")}
                    className="h-11 bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                    {...signupForm.register("fullName")}
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-xs text-[hsl(0,72%,55%)]">{signupForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-[hsl(220,10%,80%)]">{t("Email", "ইমেইল")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-[hsl(220,10%,40%)]" />
                    <Input
                      type="email"
                      placeholder={t("your@email.com", "আপনার@ইমেইল.com")}
                      className="h-10 sm:h-11 text-sm pl-9 sm:pl-10 bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-lg sm:rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                      {...signupForm.register("email")}
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-[hsl(0,72%,55%)]">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-[hsl(220,10%,80%)]">{t("Mobile (Optional)", "মোবাইল (ঐচ্ছিক)")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-[hsl(220,10%,40%)]" />
                    <Input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="h-10 sm:h-11 text-sm pl-9 sm:pl-10 bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-lg sm:rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                      {...signupForm.register("phone")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium text-[hsl(220,10%,80%)]">{t("Password", "পাসওয়ার্ড")}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="h-10 sm:h-11 text-sm pr-10 bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-lg sm:rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                        {...signupForm.register("password")}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)]">
                        {showPassword ? <EyeOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-xs text-[hsl(0,72%,55%)]">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium text-[hsl(220,10%,80%)]">{t("Confirm", "নিশ্চিত করুন")}</Label>
                    <Input
                      type="password"
                      placeholder="••••••"
                      className="h-10 sm:h-11 text-sm bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-lg sm:rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                      {...signupForm.register("confirmPassword")}
                    />
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-[hsl(0,72%,55%)]">{signupForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold bg-[hsl(174,55%,45%)] hover:bg-[hsl(174,55%,40%)] text-[hsl(220,18%,10%)] shadow-lg shadow-[hsl(174,55%,45%)]/20 transition-all hover:-translate-y-0.5 group mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-[hsl(220,18%,10%)] border-t-transparent" /> : (
                    <>{t("Create Account", "অ্যাকাউন্ট তৈরি করুন")}<ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>

                <p className="text-[10px] sm:text-xs text-center text-[hsl(220,10%,45%)] pt-2">
                  {t("By registering you agree to our", "নিবন্ধন করে আপনি আমাদের")}{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-[hsl(174,55%,50%)] hover:underline font-medium">
                    {t("Terms & Conditions", "শর্তাবলী ও নীতিমালা")}
                  </button>
                  {" "}{t("and", "এবং")}{" "}
                  <a href="https://unitynets.com/terms" target="_blank" rel="noopener noreferrer" className="text-[hsl(174,55%,50%)] hover:underline font-medium">
                    {t("Privacy Policy", "গোপনীয়তা নীতি")}
                  </a>
                </p>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-[hsl(220,10%,80%)]">{t("Email", "ইমেইল")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-[hsl(220,10%,40%)]" />
                    <Input
                      type="email"
                      placeholder={t("your@email.com", "আপনার@ইমেইল.com")}
                      className="h-10 sm:h-11 text-sm pl-9 sm:pl-10 bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-lg sm:rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                      {...loginForm.register("email")}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-[hsl(0,72%,55%)]">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs sm:text-sm font-medium text-[hsl(220,10%,80%)]">{t("Password", "পাসওয়ার্ড")}</Label>
                    <button type="button" className="text-[10px] sm:text-xs text-[hsl(174,55%,50%)] hover:underline" onClick={() => toast({ title: t("Coming Soon", "শীঘ্রই আসছে") })}>
                      {t("Forgot?", "ভুলে গেছেন?")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-[hsl(220,10%,40%)]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-10 sm:h-11 text-sm pl-9 sm:pl-10 pr-10 bg-[hsl(220,15%,8%)] border-[hsl(220,15%,20%)] text-[hsl(220,10%,95%)] placeholder:text-[hsl(220,10%,40%)] rounded-lg sm:rounded-xl focus:border-[hsl(174,55%,45%)] focus:ring-1 focus:ring-[hsl(174,55%,45%)]/30"
                      {...loginForm.register("password")}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)]">
                      {showPassword ? <EyeOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-[hsl(0,72%,55%)]">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold bg-[hsl(174,55%,45%)] hover:bg-[hsl(174,55%,40%)] text-[hsl(220,18%,10%)] shadow-lg shadow-[hsl(174,55%,45%)]/20 transition-all hover:-translate-y-0.5 group mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-[hsl(220,18%,10%)] border-t-transparent" /> : (
                    <>{t("Sign In", "সাইন ইন করুন")}<ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[hsl(220,15%,18%)]" />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[hsl(220,10%,45%)]">
                {t("or continue with", "অথবা এর সাথে চালিয়ে যান")}
              </span>
              <div className="flex-1 h-px bg-[hsl(220,15%,18%)]" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full h-12 rounded-[14px] bg-transparent border border-white/[0.08] hover:bg-white/[0.03] hover:border-white/[0.14] transition-all flex items-center justify-center gap-3 text-sm font-medium text-[hsl(220,10%,90%)] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {oauthLoading === 'google' ? t("Connecting…", "সংযোগ হচ্ছে…") : t("Continue with Google", "Google দিয়ে চালিয়ে যান")}
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={!!oauthLoading}
                className="w-full h-12 rounded-[14px] bg-transparent border border-white/[0.08] hover:bg-white/[0.03] hover:border-white/[0.14] transition-all flex items-center justify-center gap-3 text-sm font-medium text-[hsl(220,10%,90%)] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {oauthLoading === 'apple' ? t("Connecting…", "সংযোগ হচ্ছে…") : t("Continue with Apple", "Apple দিয়ে চালিয়ে যান")}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-[10px] sm:text-xs text-[hsl(220,10%,40%)]">
              © 2025 UnityNets. {t("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}
            </p>
          </div>
        </div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-lg rounded-2xl bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[hsl(220,10%,95%)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[hsl(174,55%,50%)]" />
              {t("Terms & Conditions", "শর্তাবলী")}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-3">
              {termsContent.map((section, index) => (
                <div key={index} className="p-4 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,15%,16%)]">
                  <div className="flex items-center gap-2 mb-2">
                    <section.icon className="w-4 h-4 text-[hsl(174,55%,50%)]" />
                    <h3 className="font-semibold text-[hsl(220,10%,90%)]">{language === "en" ? section.titleEn : section.title}</h3>
                  </div>
                  <p className="text-sm text-[hsl(220,10%,55%)]">{section.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
