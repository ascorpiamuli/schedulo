import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Calendar, 
  ArrowLeft, 
  Shield, 
  Mail, 
  CheckCircle2,
  Sparkles,
  Clock
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for the password reset link",
        });
      }
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/95 to-[#C2410C]/80 p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        
        {/* Grid pattern */}
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
          {/* Logo */}
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
            </div>
            <span className="text-3xl font-bold">
              SBP<span className="text-[#C2410C]">Meet</span>
            </span>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Reset your password
          </h1>
          
          <p className="text-white/80 mb-6">
            We'll send you a secure link to create a new password and get back to scheduling.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Clock className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Avg. reset time</p>
              <p className="text-lg font-bold">&lt; 2 min</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <Shield className="h-5 w-5 mx-auto mb-1 text-[#C2410C]" />
              <p className="text-xs text-white/70">Secure</p>
              <p className="text-lg font-bold">256-bit</p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
              <Shield className="h-3.5 w-3.5 text-[#C2410C]" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-[#C2410C]" />
              <span>24h expiry</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
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
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                  SBPMeet
                </span>
              </div>
              
              <CardTitle className="text-2xl font-bold text-[#1E3A8A] dark:text-white">
                {submitted ? "Check your email" : "Forgot password?"}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {submitted 
                  ? `We've sent a reset link to ${email}`
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>
            
            {!submitted ? (
              <form onSubmit={handleReset}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1E3A8A] dark:text-gray-300">
                      Email address
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

                  {/* Security note */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                      <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        We'll send a secure, one-time link to your email. 
                        This link will expire in 24 hours for your security.
                      </span>
                    </p>
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
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send reset link
                        <Mail className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <Link 
                    to="/login" 
                    className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                {/* Success state */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center py-4"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Reset link sent!
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    We've sent a password reset link to:<br />
                    <strong className="text-[#1E3A8A] dark:text-[#C2410C]">{email}</strong>
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg w-full">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Didn't receive the email? Check your spam folder or 
                        <button 
                          onClick={() => setSubmitted(false)}
                          className="text-[#1E3A8A] dark:text-[#C2410C] font-medium mx-1 hover:underline"
                        >
                          try again
                        </button>
                      </span>
                    </p>
                  </div>
                </motion.div>

                <div className="flex justify-center">
                  <Link 
                    to="/login"
                    className="text-sm text-[#1E3A8A] dark:text-[#C2410C] hover:underline"
                  >
                    Return to sign in
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Attribution */}
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