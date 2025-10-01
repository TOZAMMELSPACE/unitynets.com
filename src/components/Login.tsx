import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, LogIn, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

// Signup validation schema
const signupSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9]+$/, "Username must be lowercase letters and numbers only"),
  nid: z.string()
    .length(4, "NID must be exactly 4 digits")
    .regex(/^\d{4}$/, "NID must contain only digits"),
  phone: z.string()
    .regex(/^\+880\d{10}$/, "Phone must be in format +880XXXXXXXXXX"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login validation schema
const loginSchema = z.object({
  usernameOrPhoneOrEmail: z.string().min(1, "This field is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export const Login = ({ users, onLogin, onRegister }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      nid: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrPhoneOrEmail: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Profile picture must be under 2MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast({
          title: "Error",
          description: "Only JPG and PNG images are allowed",
          variant: "destructive"
        });
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview("");
  };

  const onSignupSubmit = (data: SignupFormData) => {
    console.log('Signup form submitted with data:', { 
      username: data.username, 
      phone: data.phone,
      nid: data.nid 
    });

    // Check if username already exists
    const existingUsername = users.find(u => 
      u.username.toLowerCase() === data.username.toLowerCase()
    );
    
    if (existingUsername) {
      console.log('Username already exists:', data.username);
      toast({
        title: "ত্রুটি / Error",
        description: "এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে / Username already exists",
        variant: "destructive"
      });
      return;
    }

    // Check if phone already exists
    const existingPhone = users.find(u => u.phone === data.phone);
    
    if (existingPhone) {
      console.log('Phone already exists:', data.phone);
      toast({
        title: "ত্রুটি / Error",
        description: "এই ফোন নম্বর ইতিমধ্যে নিবন্ধিত / Phone number already registered",
        variant: "destructive"
      });
      return;
    }

    // Check if NID already exists
    const existingNID = users.find(u => u.nidMasked && u.nidMasked.includes(data.nid));
    
    if (existingNID) {
      console.log('NID already exists:', data.nid);
      toast({
        title: "ত্রুটি / Error",
        description: "এই NID ইতিমধ্যে নিবন্ধিত / NID already registered",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: data.fullName.trim(),
      username: data.username.toLowerCase().trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      nidMasked: `****${data.nid}`,
      profileImage: profilePicturePreview || undefined,
      trustScore: 50,
      followers: 0,
      following: 0,
      achievements: ['early_adopter'],
      isOnline: true,
      isVerified: false,
      joinDate: new Date().toISOString()
    };
    
    console.log('Creating new user:', newUser.username);
    
    try {
      onRegister(newUser);
      onLogin(newUser);
      
      console.log('User registered and logged in successfully');
      
      toast({
        title: "সফল! / Success!",
        description: "আপনার একাউন্ট সফলভাবে তৈরি হয়েছে / Your account has been created successfully"
      });
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: "ত্রুটি / Error",
        description: "একাউন্ট তৈরিতে সমস্যা হয়েছে / Error creating account",
        variant: "destructive"
      });
    }
  };

  const onLoginSubmit = (data: LoginFormData) => {
    const identifier = data.usernameOrPhoneOrEmail.toLowerCase().trim();
    
    // Find user by username, phone, or email
    const user = users.find(u => 
      u.username.toLowerCase() === identifier ||
      u.phone === identifier ||
      u.email?.toLowerCase() === identifier
    );
    
    if (user) {
      if (data.rememberMe) {
        localStorage.setItem('unity_remember_user', user.id);
      }
      
      onLogin(user);
      toast({
        title: "Success!",
        description: `Welcome back, ${user.name}!`
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Forgot Password",
      description: "Password reset feature coming soon. Please contact support."
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            UnityNet
          </h1>
          <p className="text-muted-foreground text-bengali">
            Trust • Learn • Unite
          </p>
        </div>

        <Card className="card-enhanced">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isRegistering ? "Create Account" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRegistering ? (
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-bengali">
                    Full Name / সম্পূর্ণ নাম *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="text-bengali"
                    {...signupForm.register("fullName")}
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-bengali">
                    Username / ব্যবহারকারীর নাম *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="lowercase and numbers only"
                    {...signupForm.register("username")}
                  />
                  {signupForm.formState.errors.username && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* NID */}
                <div className="space-y-2">
                  <Label htmlFor="nid" className="text-bengali">
                    National ID (Last 4 digits) / জাতীয় পরিচয়পত্র *
                  </Label>
                  <Input
                    id="nid"
                    type="text"
                    placeholder="Last 4 digits only"
                    maxLength={4}
                    {...signupForm.register("nid")}
                  />
                  {signupForm.formState.errors.nid && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.nid.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-bengali">
                    Phone Number / ফোন নম্বর *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+880XXXXXXXXXX"
                    {...signupForm.register("phone")}
                  />
                  {signupForm.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-bengali">
                    Email Address / ইমেইল (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...signupForm.register("email")}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-bengali">
                    Password / পাসওয়ার্ড *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    {...signupForm.register("password")}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-bengali">
                    Confirm Password / পাসওয়ার্ড নিশ্চিত করুন *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    {...signupForm.register("confirmPassword")}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-bengali">
                    Profile Picture / প্রোফাইল ছবি (Optional, Max 2MB)
                  </Label>
                  {profilePicturePreview ? (
                    <div className="relative w-24 h-24 mx-auto">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <label
                        htmlFor="profilePicture"
                        className="cursor-pointer flex flex-col items-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload JPG/PNG
                        </span>
                      </label>
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full btn-hero">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                {/* Username/Phone/Email */}
                <div className="space-y-2">
                  <Label htmlFor="usernameOrPhoneOrEmail" className="text-bengali">
                    Username / Phone / Email
                  </Label>
                  <Input
                    id="usernameOrPhoneOrEmail"
                    type="text"
                    placeholder="Enter username, phone, or email"
                    className="text-bengali"
                    {...loginForm.register("usernameOrPhoneOrEmail")}
                  />
                  {loginForm.formState.errors.usernameOrPhoneOrEmail && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.usernameOrPhoneOrEmail.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="text-bengali">
                    Password / পাসওয়ার্ড
                  </Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={loginForm.watch("rememberMe")}
                      onCheckedChange={(checked) => 
                        loginForm.setValue("rememberMe", checked as boolean)
                      }
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember Me
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm p-0 h-auto"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button type="submit" className="w-full btn-hero">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  signupForm.reset();
                  loginForm.reset();
                  removeProfilePicture();
                }}
                className="text-sm"
              >
                {isRegistering 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Register"
                }
              </Button>
            </div>

            {/* Demo accounts for testing */}
            {!isRegistering && (
              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 text-bengali">
                  Demo accounts for testing:
                </p>
                <div className="space-y-1 text-xs">
                  {users.slice(0, 2).map(user => (
                    <div key={user.id} className="flex justify-between text-muted-foreground">
                      <span className="text-bengali">Username: {user.username || user.name}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    (Use any password to login with demo accounts)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
