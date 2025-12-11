import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, LogIn, Eye, EyeOff, FileText, Shield, Users, Scale, Lock, Heart, AlertTriangle, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

// Simple signup schema - only essential fields
const signupSchema = z.object({
  fullName: z.string().min(2, "নাম দিন"),
  phone: z.string()
    .regex(/^01\d{9}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  password: z.string().min(6, "কমপক্ষে ৬ অক্ষর"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "পাসওয়ার্ড মিলছে না",
  path: ["confirmPassword"],
});

// Login schema
const loginSchema = z.object({
  phone: z.string().min(1, "ফোন নম্বর দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export const Login = ({ users, onLogin, onRegister }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const termsContent = [
    { icon: FileText, title: "সেবার শর্তাবলী", titleEn: "Terms of Service", content: "UnityNets প্ল্যাটফর্ম ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন। এটি একটি সম্প্রদায়-ভিত্তিক প্ল্যাটফর্ম যেখানে সদস্যরা পারস্পরিক সহযোগিতার মাধ্যমে সেবা আদান-প্রদান করে।" },
    { icon: Shield, title: "গোপনীয়তা নীতি", titleEn: "Privacy Policy", content: "আপনার ব্যক্তিগত তথ্য সুরক্ষিত থাকবে। আমরা আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না। শুধুমাত্র প্ল্যাটফর্ম পরিচালনার জন্য প্রয়োজনীয় তথ্য সংগ্রহ করা হয়।" },
    { icon: Users, title: "সম্প্রদায় নির্দেশিকা", titleEn: "Community Guidelines", content: "সকল সদস্যকে সম্মান করুন। হয়রানি, ঘৃণামূলক বক্তব্য, বা অবৈধ কার্যকলাপ সম্পূর্ণ নিষিদ্ধ। ইতিবাচক এবং সহায়ক পরিবেশ বজায় রাখুন।" },
    { icon: Scale, title: "Unity Note নীতি", titleEn: "Unity Note Policy", content: "১ ঘণ্টা সেবা = ১ Unity Note। এই সময়-ভিত্তিক মুদ্রা ব্যবস্থা সকলের সময়ের সমান মূল্য নিশ্চিত করে। Unity Note শুধুমাত্র প্ল্যাটফর্মের মধ্যে ব্যবহারযোগ্য।" },
    { icon: Lock, title: "নিরাপত্তা", titleEn: "Security", content: "আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন। সন্দেহজনক কার্যকলাপ রিপোর্ট করুন। অন্যের সাথে পাসওয়ার্ড শেয়ার করবেন না।" },
    { icon: Heart, title: "সেবা মান", titleEn: "Service Quality", content: "প্রতিশ্রুত সেবা সততার সাথে প্রদান করুন। মানসম্মত কাজ করুন। সময়মতো সেবা দিন এবং প্রয়োজনে যোগাযোগ বজায় রাখুন।" },
    { icon: AlertTriangle, title: "বিরোধ নিষ্পত্তি", titleEn: "Dispute Resolution", content: "কোনো সমস্যা হলে প্রথমে পারস্পরিক আলোচনায় সমাধান করুন। সমাধান না হলে প্ল্যাটফর্ম সহায়তা টিমের সাথে যোগাযোগ করুন।" },
    { icon: Phone, title: "যোগাযোগ", titleEn: "Contact", content: "যেকোনো প্রশ্ন বা সমস্যায় আমাদের সাথে যোগাযোগ করুন: support@unitynets.com। আমরা ২৪-৪৮ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।" },
  ];

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSignupSubmit = (data: SignupFormData) => {
    const formattedPhone = `+880${data.phone.substring(1)}`;
    
    // Check if phone already exists
    const existingPhone = users.find(u => u.phone === formattedPhone);
    
    if (existingPhone) {
      toast({
        title: "ত্রুটি",
        description: "এই ফোন নম্বর ইতিমধ্যে নিবন্ধিত",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: data.fullName.trim(),
      username: data.phone.toLowerCase(),
      phone: formattedPhone,
      nidMasked: "****0000",
      trustScore: 50,
      followers: 0,
      following: 0,
      achievements: ['early_adopter'],
      isOnline: true,
      isVerified: false,
      joinDate: new Date().toISOString()
    };
    try {
      onRegister(newUser);
      onLogin(newUser);
      
      toast({
        title: "স্বাগতম! 🎉",
        description: "আপনার একাউন্ট তৈরি হয়েছে"
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "একাউন্ট তৈরিতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const onLoginSubmit = (data: LoginFormData) => {
    const formattedPhone = data.phone.startsWith('01') 
      ? `+880${data.phone.substring(1)}`
      : data.phone;
    
    const user = users.find(u => 
      u.phone === formattedPhone || 
      u.phone === data.phone ||
      u.username === data.phone.toLowerCase()
    );
    
    if (user) {
      onLogin(user);
      toast({
        title: "স্বাগতম!",
        description: `${user.name}, আপনাকে স্বাগতম`
      });
    } else {
      toast({
        title: "ত্রুটি",
        description: "ফোন নম্বর বা পাসওয়ার্ড ভুল",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">U</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            UnityNets
          </h1>
          <p className="text-sm text-muted-foreground">
            একত্রে শক্তিশালী
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Tab Switch */}
            <div className="flex mb-6 bg-muted rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                  !isRegistering 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                লগইন
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                  isRegistering 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                নিবন্ধন
              </button>
            </div>

            {isRegistering ? (
              /* Signup Form */
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    আপনার নাম
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="সম্পূর্ণ নাম লিখুন"
                    className="h-11"
                    {...signupForm.register("fullName")}
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-xs text-destructive">
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    মোবাইল নম্বর
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="h-11"
                    {...signupForm.register("phone")}
                  />
                  {signupForm.formState.errors.phone && (
                    <p className="text-xs text-destructive">
                      {signupForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    পাসওয়ার্ড
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="h-11 pr-10"
                      {...signupForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    পাসওয়ার্ড নিশ্চিত করুন
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="আবার পাসওয়ার্ড লিখুন"
                    className="h-11"
                    {...signupForm.register("confirmPassword")}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms Link - View before signup */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border/50 mb-2">
                  <p className="text-xs text-center text-muted-foreground mb-2">
                    নিবন্ধনের আগে অনুগ্রহ করে আমাদের শর্তাবলী পড়ুন
                  </p>
                  <Link 
                    to="/terms" 
                    className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    📜 শর্তাবলী দেখুন / View Terms & Conditions
                  </Link>
                </div>

                <Button type="submit" className="w-full h-11" size="lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  নিবন্ধন করুন
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  নিবন্ধন করে আপনি আমাদের{" "}
                  <button 
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    শর্তাবলী
                  </button>{" "}
                  মেনে নিচ্ছেন
                </p>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="loginPhone" className="text-sm font-medium">
                    মোবাইল নম্বর
                  </Label>
                  <Input
                    id="loginPhone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="h-11"
                    {...loginForm.register("phone")}
                  />
                  {loginForm.formState.errors.phone && (
                    <p className="text-xs text-destructive">
                      {loginForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="loginPassword" className="text-sm font-medium">
                    পাসওয়ার্ড
                  </Label>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="আপনার পাসওয়ার্ড"
                      className="h-11 pr-10"
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => toast({ title: "শীঘ্রই আসছে", description: "পাসওয়ার্ড রিসেট ফিচার শীঘ্রই আসছে" })}
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>

                <Button type="submit" className="w-full h-11" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  লগইন করুন
                </Button>

                {/* Demo Account Info */}
                <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-center text-muted-foreground mb-2">
                    ডেমো একাউন্ট দিয়ে প্রবেশ করুন
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => {
                        loginForm.setValue("phone", "+8801712345678");
                        loginForm.setValue("password", "demo123");
                      }}
                    >
                      রহিম
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => {
                        loginForm.setValue("phone", "+8801898765432");
                        loginForm.setValue("password", "demo123");
                      }}
                    >
                      করিম
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © ২০২৪ UnityNets • Trust • Learn • Unite
        </p>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              শর্তাবলী / Terms & Conditions
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-center font-medium">
                  UnityNets - একত্রে শক্তিশালী
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  সর্বশেষ আপডেট: ডিসেম্বর ২০২৪
                </p>
              </div>

              {termsContent.map((section, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <section.icon className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">
                      {section.title} <span className="text-muted-foreground font-normal">/ {section.titleEn}</span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}

              <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                <p className="text-sm text-center">
                  ✅ উপরের শর্তাবলী পড়ে বুঝে নিবন্ধন করুন
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  By registering, you agree to all terms above
                </p>
              </div>
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowTerms(false)}
            >
              বন্ধ করুন
            </Button>
            <Link to="/terms" className="flex-1">
              <Button className="w-full" onClick={() => setShowTerms(false)}>
                সম্পূর্ণ পড়ুন
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
