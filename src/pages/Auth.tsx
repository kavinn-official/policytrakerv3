import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, ArrowLeft, User, Phone, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from '@/assets/logo.png';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    mobileNumber: ""
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium tracking-wide">Securely loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      if (!error) {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.mobileNumber && signUpData.mobileNumber.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Error",
        description: "Mobile number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setAuthLoading(true);

    try {
      await signUp(signUpData.email, signUpData.password, {
        full_name: signUpData.fullName.trim(),
        mobile_number: signUpData.mobileNumber.replace(/\D/g, '')
      });
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
    <>
      <SEOHead
        title="Login & Sign Up - Agent Policy Tracker | Start Free Today"
        description="Sign in or create your free Policy Tracker.in account. Start managing insurance policies, sending WhatsApp reminders, and tracking renewals. Free forever plan available."
        canonicalPath="/auth"
        keywords="policy tracker login, insurance software signup, agent policy tracker register, create account free"
      />

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans">

        {/* Left Side: Branding & Value Props (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-12 text-white relative overflow-hidden">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]"></div>
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity w-fit">
              <div className="bg-white p-2 rounded-xl">
                <img src={logo} alt="Policy Tracker.in" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Policy Tracker.in</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg mt-16 mb-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Insurance Business</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-10">
              Join India's leading platform for insurance agents. Manage policies, automate renewals, and track commissions all in one secure place.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Smart Automation</h3>
                  <p className="text-slate-400 text-sm mt-1">Automated WhatsApp reminders and OCR-powered data entry.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300 shrink-0">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Boost Productivity</h3>
                  <p className="text-slate-400 text-sm mt-1">Complete your administrative tasks 10x faster.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Bank-Grade Security</h3>
                  <p className="text-slate-400 text-sm mt-1">Your client data is encrypted and securely backed up daily.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-300">
                  <User className="w-5 h-5 opacity-50" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                +1.5k
              </div>
            </div>
            <p className="text-sm text-slate-400">Trusted by over <strong className="text-white">1,500+ agents</strong> across India.</p>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex flex-col h-full bg-white relative">

          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Policy Tracker.in" className="h-7 w-7" />
              <span className="text-lg font-bold text-slate-900">Policy Tracker</span>
            </Link>
          </div>

          <div className="absolute top-6 left-6 hidden lg:block">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto w-full">
            <div className="w-full max-w-sm xl:max-w-md mx-auto">

              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 mt-2">Sign in to your account or create a new one to get started.</p>
              </div>

              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100/80 rounded-xl">
                      <TabsTrigger
                        value="signin"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all text-sm font-medium py-2.5"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all text-sm font-medium py-2.5"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
                      <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2.5">
                          <Label htmlFor="signin-email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                              id="signin-email"
                              type="email"
                              value={signInData.email}
                              onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl shadow-sm text-base"
                              placeholder="agent@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="signin-password" className="text-sm font-semibold text-slate-700">Password</Label>
                            <Button
                              variant="link"
                              type="button"
                              onClick={() => setForgotPasswordOpen(true)}
                              className="text-sm text-indigo-600 hover:text-indigo-700 h-auto p-0 font-medium"
                            >
                              Forgot password?
                            </Button>
                          </div>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                              id="signin-password"
                              type="password"
                              value={signInData.password}
                              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-xl shadow-sm text-base"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all mt-6"
                        >
                          {authLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Signing In...</span>
                            </div>
                          ) : "Sign In to Dashboard"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-fullname" className="text-sm font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                              id="signup-fullname"
                              type="text"
                              value={signUpData.fullName}
                              onChange={(e) => {
                                const cleanedValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                setSignUpData({ ...signUpData, fullName: cleanedValue });
                              }}
                              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all rounded-xl text-sm"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-mobile" className="text-sm font-semibold text-slate-700">Mobile Number</Label>
                          <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                              id="signup-mobile"
                              type="tel"
                              inputMode="numeric"
                              value={signUpData.mobileNumber}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
                                setSignUpData({ ...signUpData, mobileNumber: digits });
                              }}
                              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all rounded-xl text-sm"
                              placeholder="9876543210"
                              maxLength={10}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></Label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                              id="signup-email"
                              type="email"
                              value={signUpData.email}
                              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all rounded-xl text-sm"
                              placeholder="agent@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password <span className="text-rose-500">*</span></Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                              <Input
                                id="signup-password"
                                type="password"
                                value={signUpData.password}
                                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all rounded-xl text-sm"
                                placeholder="••••••••"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm-password" className="text-sm font-semibold text-slate-700">Confirm <span className="text-rose-500">*</span></Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                              <Input
                                id="signup-confirm-password"
                                type="password"
                                value={signUpData.confirmPassword}
                                onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                                className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all rounded-xl text-sm"
                                placeholder="••••••••"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all pt-1 mt-6"
                        >
                          {authLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Creating Account...</span>
                            </div>
                          ) : "Create Free Account"}
                        </Button>
                        <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
                          By creating an account, you agree to our <br className="hidden sm:block" />
                          <Link to="/terms-conditions" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                        </p>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Footer Links */}
          <div className="lg:hidden p-4 border-t border-slate-100 bg-slate-50 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
              <Link to="/terms-conditions" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">Terms</Link>
              <Link to="/privacy" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">Privacy</Link>
              <Link to="/contact" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Reset Password</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-2">
              Enter your email address and we'll send you a secure link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-semibold text-slate-700">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="agent@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={authLoading}
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setResetEmail("");
                }}
                disabled={authLoading}
                className="flex-1 h-11 rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleForgotPassword}
                disabled={authLoading}
                className="flex-1 h-11 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {authLoading ? "Sending..." : "Send Link"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;