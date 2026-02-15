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
  Eye, 
  EyeOff,
  Clock,
  CreditCard,
  Users,
  Star,
  Zap,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        toast({ 
          title: "Login failed", 
          description: error.message, 
          variant: "destructive" 
        });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({ 
        title: "Login failed", 
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
          {/* Logo with animation - IDENTICAL to signup page */}
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
            Welcome back to
            <br />
            <span className="text-[#C2410C]">smart scheduling</span>
          </h1>
          
          <p className="text-white/80 mb-6">
            Eliminate the back-and-forth. Share your link, accept payments, 
            and fill your calendar automatically.
          </p>

          {/* Stats bar - similar to signup but different metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Users className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Active Users</p>
              <p className="text-lg font-bold">800+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Clock className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Hours Saved</p>
              <p className="text-lg font-bold">10k+</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <CreditCard className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Processed</p>
              <p className="text-lg font-bold">$2M+</p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 mb-6">
            {[
              { icon: <Zap className="h-4 w-4" />, text: "One-click scheduling with payments" },
              { icon: <CheckCircle2 className="h-4 w-4" />, text: "Two-way calendar sync" },
              { icon: <Star className="h-4 w-4" />, text: "98% customer satisfaction" }
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
              <span>14-day free trial</span>
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
            <p className="text-xs text-white/80 mt-1 font-medium">— Stephen Muli, Pasbest Ventures Limited</p>
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
              {/* Mobile logo - IDENTICAL to signup page */}
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
                Welcome back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A] dark:text-gray-400 dark:hover:text-[#C2410C] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-[#1E3A8A] hover:text-[#C2410C] font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full gap-2 h-11 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-lg shadow-[#1E3A8A]/25" 
                  size="lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* OAuth Buttons - DISABLED (Placeholders for future implementation) */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={true}
                    className="h-11 border-2 border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed relative"
                    title="Coming soon"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Google</span>
                    <span className="absolute -top-2 -right-2 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={true}
                    className="h-11 border-2 border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed relative"
                    title="Coming soon"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">Microsoft</span>
                    <span className="absolute -top-2 -right-2 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  </Button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-[#1E3A8A] font-medium hover:text-[#C2410C] hover:underline transition-colors">
                    Sign up
                  </Link>
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  By signing in, you agree to our{" "}
                  <a href="/terms" className="hover:text-[#C2410C] transition-colors">Terms</a>{" "}
                  and{" "}
                  <a href="/privacy" className="hover:text-[#C2410C] transition-colors">Privacy Policy</a>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Pasbest Ventures Limited attribution */}
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-8">
            A product of{" "}
            <a 
              href="https://pasbestventures.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#C2410C] transition-colors font-medium"
            >
              Pasbest Ventures Limited
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}