
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ email: "", password: "", confirmPassword: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      await signIn(signInData.email, signInData.password);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setAuthLoading(true);
    
    try {
      await signUp(signUpData.email, signUpData.password);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset link has been sent to your email",
        });
        setForgotPasswordOpen(false);
        setResetEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive",
      });
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-100 rounded-full w-fit">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">AgentHub</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">Manage your policies with ease</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="text-center text-lg sm:text-xl">Welcome</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                  <TabsTrigger value="signin" className="text-xs sm:text-sm">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-xs sm:text-sm">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                          className="pl-10 h-10 text-sm"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          type="password"
                          value={signInData.password}
                          onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                          className="pl-10 h-10 text-sm"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full h-10 text-sm"
                    >
                      {authLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 h-auto p-0"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                          className="pl-10 h-10 text-sm"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                          className="pl-10 h-10 text-sm"
                          placeholder="Create a password"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                          className="pl-10 h-10 text-sm"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={authLoading}
                      className="w-full h-10 text-sm"
                    >
                      {authLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Policy Links Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
            <Link 
              to="/terms-conditions" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/cancellation-refunds" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Cancellation & Refunds
            </Link>
            <Link 
              to="/shipping" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Shipping Policy
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Reset Password</DialogTitle>
            <DialogDescription className="text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={authLoading}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleForgotPassword}
                disabled={authLoading}
                className="flex-1 h-10 text-sm"
              >
                {authLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setResetEmail("");
                }}
                disabled={authLoading}
                className="h-10 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
