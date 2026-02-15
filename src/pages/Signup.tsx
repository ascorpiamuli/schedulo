import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Calendar, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff,
  Clock,
  CreditCard,
  Video,
  Zap,
  Star,
  Users
} from "lucide-react";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate password on change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Check password length
    if (newPassword.length > 0 && newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
    
    // Check if confirm password matches when it exists
    if (confirmPassword) {
      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  // Validate confirm password on change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    
    // Check if passwords match
    if (password !== newConfirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Final validation before submit
  const validateForm = () => {
    let isValid = true;
    
    if (!fullName.trim()) {
      toast({ title: "Validation Error", description: "Full name is required", variant: "destructive" });
      isValid = false;
    }
    
    if (!email.trim()) {
      toast({ title: "Validation Error", description: "Email is required", variant: "destructive" });
      isValid = false;
    }
    
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation first
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            username: email.split("@")[0] || "No username"// Simple username generation from email 
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast({ 
          title: "Signup failed", 
          description: error.message, 
          variant: "destructive" 
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link to verify your account.",
        });
        // Clear form
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        // Navigate to login
        navigate("/login");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({ 
        title: "Signup failed", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side — SBPMeet branding - Smarter design */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/95 to-[#C2410C]/80 p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C2410C] rounded-full blur-3xl opacity-20" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-white relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 shadow-2xl"
        >
          {/* Logo with animation */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-[#C2410C] to-[#C2410C]/80 p-3 rounded-2xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#C2410C] rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#C2410C] rounded-full" />
            </div>
            <span className="text-3xl font-bold">
              SBP<span className="text-[#C2410C]">Meet</span>
            </span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Start scheduling in
            <br />
            <span className="text-[#C2410C]">minutes, for free</span>
          </h1>
          
          <p className="text-white/80 mb-6">
            Create your free account, set your availability, and share your personal booking link with anyone.
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Users className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Active Users</p>
              <p className="text-lg font-bold">800+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Meetings</p>
              <p className="text-lg font-bold">1.5k+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Star className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Rating</p>
              <p className="text-lg font-bold">4.9/5</p>
            </div>
          </div>

          {/* Feature list with icons */}
          <div className="space-y-3 mb-6">
            {[
              { icon: <Zap className="h-4 w-4" />, text: "Unlimited bookings on free plan" },
              { icon: <Clock className="h-4 w-4" />, text: "Calendar sync with Google & Outlook" },
              { icon: <CreditCard className="h-4 w-4" />, text: "M-Pesa & Stripe payments ready" },
              { icon: <Video className="h-4 w-4" />, text: "14-day Pro trial included" }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-white/80 bg-white/5 rounded-lg p-2 backdrop-blur-sm"
              >
                <div className="text-[#C2410C]">{feature.icon}</div>
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators with badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
              <Shield className="h-3.5 w-3.5 text-[#C2410C]" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-[#C2410C]" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
              <span className="text-[#C2410C]">⭐</span>
              <span>98% satisfaction</span>
            </div>
          </div>

          {/* Testimonial snippet */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 pt-4 border-t border-white/20"
          >
            <p className="text-xs text-white/60 italic">
              "SBPMeet has transformed how we schedule client meetings. The M-Pesa integration is a game-changer!"
            </p>
            <p className="text-xs text-white/80 mt-1 font-medium">— Stephen Muli, Pasbest Ventures</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-900">
            <CardHeader className="space-y-1">
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] p-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#C2410C] rounded-full animate-pulse" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                  SBPMeet
                </span>
              </div>
              
              <CardTitle className="text-2xl font-bold text-[#1E3A8A] dark:text-white">
                Create your account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Get started with SBPMeet for free
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[#1E3A8A] dark:text-gray-300">
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1E3A8A] dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#1E3A8A] dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className={`h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] pr-10 ${
                        passwordError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A] dark:text-gray-400 dark:hover:text-[#C2410C] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#1E3A8A] dark:text-gray-300">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      className={`h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] pr-10 ${
                        confirmPasswordError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A] dark:text-gray-400 dark:hover:text-[#C2410C] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                {/* Password strength indicator */}
                {password && password.length >= 6 && !passwordError && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-full rounded-full ${
                        password.length >= 12 ? 'bg-green-500' : 
                        password.length >= 8 ? 'bg-[#C2410C]' : 
                        'bg-[#1E3A8A]'
                      }`} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {password.length >= 12 ? 'Strong password' : 
                       password.length >= 8 ? 'Good password' : 
                       'Fair password'}
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full gap-2 h-11 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-lg shadow-[#1E3A8A]/25" 
                  size="lg" 
                  disabled={
                    loading || 
                    !!passwordError || 
                    !!confirmPasswordError || 
                    password.length < 6 || 
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {/* OAuth Placeholder */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400">
                      Or sign up with
                    </span>
                  </div>
                </div>

                {/* OAuth Buttons Placeholder */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={true}
                    className="h-11 border-2 border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    title="Coming soon"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                    <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">Soon</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={true}
                    className="h-11 border-2 border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    title="Coming soon"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Microsoft
                    <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">Soon</span>
                  </Button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#1E3A8A] font-medium hover:text-[#C2410C] hover:underline transition-colors">
                    Sign in
                  </Link>
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  By signing up, you agree to our{" "}
                  <a href="/terms" className="hover:text-[#C2410C] transition-colors">Terms</a>{" "}
                  and{" "}
                  <a href="/privacy" className="hover:text-[#C2410C] transition-colors">Privacy Policy</a>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* SBP Group attribution */}
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-8">
            A product of{" "}
            <a 
              href="https://sbpgroup.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#C2410C] transition-colors font-medium"
            >
              Pasbest Ventures
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}