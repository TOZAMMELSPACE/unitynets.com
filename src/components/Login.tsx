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
import { UserPlus, LogIn, Eye, EyeOff, FileText, Shield, Users, Scale, Lock, Heart, Phone, Globe, Mail, ArrowRight } from "lucide-react";
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

  const features = [
    { icon: Users, title: t("Community Driven", "সম্প্রদায় চালিত"), desc: t("Connect with our community", "আমাদের কমিউনিটিতে সংযুক্ত হন") },
    { icon: Zap, title: t("Unity Notes", "ইউনিটি নোট"), desc: t("Earn by sharing your skills", "দক্ষতা শেয়ার করে আয় করুন") },
    { icon: TrendingUp, title: t("Grow Together", "একসাথে বৃদ্ধি"), desc: t("Learn and build with others", "অন্যদের সাথে শিখুন ও তৈরি করুন") },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[hsl(220,18%,8%)]">
      {/* Left Panel - Minimal Branding */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174,55%,30%)] via-[hsl(174,45%,20%)] to-[hsl(220,18%,10%)]" />
        <div className="absolute inset-0">
          <div className="absolute top-24 left-16 w-72 h-72 bg-[hsl(174,60%,50%)]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[hsl(174,50%,40%)]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-10 lg:px-16 xl:px-20">
          <img src="/logo.png" alt="UnityNets Logo" className="h-12 lg:h-14 w-auto mb-12" />
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-white leading-[1.1] tracking-tight mb-5">
            {t("Trust. Learn.", "Trust. Learn.")} <span className="text-[hsl(174,60%,70%)]">{t("Unite.", "Unite.")}</span>
          </h1>
          <p className="text-base lg:text-lg text-white/65 max-w-md leading-relaxed">
            {t(
              "Join a global community platform for learning, sharing, and growth.",
              "শেখা, শেয়ার ও বৃদ্ধির জন্য একটি বৈশ্বিক কমিউনিটি প্ল্যাটফর্মে যোগ দিন।"
            )}
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-3/5 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-10 min-h-screen md:min-h-0">
        <div className="w-full max-w-md animate-fade-in">
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
