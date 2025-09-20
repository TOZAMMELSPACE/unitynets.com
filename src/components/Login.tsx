import { useState } from "react";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export const Login = ({ users, onLogin, onRegister }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nid: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.nid.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.nid.length < 4) {
      toast({
        title: "Error", 
        description: "NID must be at least 4 characters",
        variant: "destructive"
      });
      return;
    }

    if (isRegistering) {
      // Check if user already exists
      const existingUser = users.find(u => 
        u.name.toLowerCase() === formData.name.toLowerCase() || 
        u.nidMasked.includes(formData.nid.slice(-4))
      );
      
      if (existingUser) {
        toast({
          title: "Error",
          description: "User with this name or NID already exists",
          variant: "destructive"
        });
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        nidMasked: `****${formData.nid.slice(-4)}`,
        trustScore: 50 // Starting trust score
      };
      
      onRegister(newUser);
      onLogin(newUser);
      
      toast({
        title: "Welcome to UnityNet!",
        description: "Your account has been created successfully"
      });
    } else {
      // Login existing user
      const user = users.find(u => 
        u.name.toLowerCase() === formData.name.toLowerCase() && 
        u.nidMasked.includes(formData.nid.slice(-4))
      );
      
      if (user) {
        onLogin(user);
        toast({
          title: "Welcome back!",
          description: `Signed in as ${user.name}`
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid name or NID. Try registering first.",
          variant: "destructive"
        });
      }
    }
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-bengali">
                  Full Name / নাম
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-bengali"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nid" className="text-bengali">
                  National ID (Last 4 digits) / জাতীয় পরিচয়পত্র
                </Label>
                <Input
                  id="nid"
                  type="text"
                  placeholder="Enter last 4 digits"
                  maxLength={10}
                  value={formData.nid}
                  onChange={(e) => setFormData(prev => ({ ...prev, nid: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full btn-hero">
                {isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm"
              >
                {isRegistering 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Register"
                }
              </Button>
            </div>

            {/* Demo users for testing */}
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 text-bengali">
                Demo accounts for testing:
              </p>
              <div className="space-y-1 text-xs">
                {users.slice(0, 2).map(user => (
                  <div key={user.id} className="flex justify-between text-muted-foreground">
                    <span className="text-bengali">{user.name}</span>
                    <span>{user.nidMasked.slice(-4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};