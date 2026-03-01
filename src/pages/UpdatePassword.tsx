// pages/UpdatePassword.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UpdatePassword() {
  // State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [debugInfo, setDebugInfo] = useState<any>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  // Log component mount
  useEffect(() => {
    console.log("🔵 [UpdatePassword] Component mounted");
    console.log("🔹 Full URL:", window.location.href);
    console.log("🔹 Search params:", window.location.search);
    console.log("🔹 Hash:", window.location.hash);
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    urlParams.forEach((value, key) => {
      params[key] = value;
      console.log(`🔹 URL param - ${key}:`, value);
    });

    // Parse hash parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashParamsObj: Record<string, string> = {};
    hashParams.forEach((value, key) => {
      hashParamsObj[key] = value;
      console.log(`🔹 Hash param - ${key}:`, value);
    });

    setDebugInfo({
      urlParams: params,
      hashParams: hashParamsObj,
      fullUrl: window.location.href,
      hash: window.location.hash
    });
  }, []);

  // Check session and determine if we're in recovery mode
  useEffect(() => {
    console.log("🔵 [UpdatePassword] Starting session check...");
    
    const checkRecoveryMode = async () => {
      try {
        // First, check for errors in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorCode = hashParams.get('error_code');
        
        if (errorCode === 'otp_expired') {
          console.log("❌ [UpdatePassword] Expired token detected");
          setIsRecoveryMode(false);
          setSessionChecked(true);
          toast({
            title: "Link Expired",
            description: "This password reset link has expired. Please request a new one.",
            variant: "destructive",
          });
          return;
        }

        // Check for recovery indicators in URL
        const hasRecoveryInHash = window.location.hash.includes('type=recovery');
        const hasAccessToken = window.location.hash.includes('access_token');
        const hasRefreshToken = window.location.hash.includes('refresh_token');
        
        console.log("🔹 URL analysis:", {
          hasRecoveryInHash,
          hasAccessToken,
          hasRefreshToken,
          hash: window.location.hash
        });

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ [UpdatePassword] Session error:", error);
        }

        console.log("🔹 Session data:", session ? {
          hasSession: true,
          email: session.user?.email,
          aud: session.user?.aud,
          expiresAt: session.expires_at
        } : "No session");

        // DETERMINE IF WE'RE IN RECOVERY MODE
        // Multiple conditions to check:
        const isRecovery = 
          hasRecoveryInHash || // URL has type=recovery in hash
          hasAccessToken || // URL has access_token (fresh from email)
          (session && window.location.hash.length > 0) || // Has session AND hash (from recovery)
          session?.user?.aud === 'authenticated' && hasRefreshToken; // Authenticated with refresh token

        if (isRecovery) {
          console.log("✅ [UpdatePassword] RECOVERY MODE DETECTED");
          setIsRecoveryMode(true);
          
          // CRITICAL: Do NOT redirect to dashboard. Stay on this page.
        } else if (session) {
          // User is logged in but not from recovery - redirect to dashboard
          console.log("⚠️ [UpdatePassword] Regular session detected, redirecting to dashboard");
          navigate('/dashboard');
          return;
        } else {
          console.log("❌ [UpdatePassword] No recovery session found");
          setIsRecoveryMode(false);
        }

        setSessionChecked(true);
        console.log("✅ [UpdatePassword] Session check complete, recovery mode:", isRecovery);

      } catch (err) {
        console.error("❌ [UpdatePassword] Unexpected error:", err);
        setIsRecoveryMode(false);
        setSessionChecked(true);
      }
    };

    checkRecoveryMode();

    // Listen for auth state changes
    console.log("🔵 [UpdatePassword] Setting up auth state listener...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 [UpdatePassword] Auth event:", event, session?.user?.email);

      if (event === 'PASSWORD_RECOVERY') {
        console.log("✅ [UpdatePassword] PASSWORD_RECOVERY event - recovery mode confirmed");
        setIsRecoveryMode(true);
        setSessionChecked(true);
      } else if (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery')) {
        console.log("✅ [UpdatePassword] SIGNED_IN from recovery link");
        setIsRecoveryMode(true);
        setSessionChecked(true);
      } else if (event === 'SIGNED_IN' && !isRecoveryMode) {
        // Regular sign-in, not from recovery
        console.log("🔹 [UpdatePassword] Regular sign-in detected");
        // Don't redirect immediately - let the checkRecoveryMode handle it
      }
    });

    return () => {
      console.log("🔵 [UpdatePassword] Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Check password strength
  useEffect(() => {
    console.log("🔵 [UpdatePassword] Password changed, checking strength...");
    const newStrength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    
    console.log("🔹 Password strength:", {
      length: password.length,
      ...newStrength,
      metRequirements: Object.values(newStrength).filter(Boolean).length
    });

    setPasswordStrength(newStrength);
  }, [password]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 [UpdatePassword] Update password form submitted");

    // Validate passwords match
    if (password !== confirmPassword) {
      console.error("❌ [UpdatePassword] Passwords don't match");
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    // Check password strength
    const strengthValues = Object.values(passwordStrength);
    const metCount = strengthValues.filter(Boolean).length;
    
    if (metCount < 3) {
      console.error("❌ [UpdatePassword] Password too weak");
      toast({
        title: "Weak password",
        description: "Please choose a stronger password (min 8 chars, mix of letters, numbers & symbols)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("🔵 [UpdatePassword] Attempting to update password...");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ [UpdatePassword] Update failed:", error);
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("✅ [UpdatePassword] Password updated successfully");
        
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated. Please log in with your new password.",
        });

        // Sign out after successful update
        await supabase.auth.signOut();
        console.log("✅ [UpdatePassword] User signed out");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          console.log("🔵 [UpdatePassword] Redirecting to login");
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("❌ [UpdatePassword] Unexpected error:", error);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const strengthPercentage = Object.values(passwordStrength).filter(Boolean).length * 20;
  const strengthColor = 
    strengthPercentage <= 40 ? "bg-red-500" :
    strengthPercentage <= 60 ? "bg-yellow-500" :
    strengthPercentage <= 80 ? "bg-blue-500" : "bg-green-500";

  // Loading state while checking session
  if (!sessionChecked) {
    console.log("🔵 [UpdatePassword] Rendering loading state");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    );
  }

  // Not in recovery mode - show error
  if (!isRecoveryMode) {
    console.log("⚠️ [UpdatePassword] Not in recovery mode, showing error");
    
    // Check if there was an expired token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              {errorDescription?.replace(/\+/g, ' ') || "This password reset link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Please request a new password reset link.
              </AlertDescription>
            </Alert>

            {/* Debug info - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-60">
                <p className="font-bold mb-2">Debug Info:</p>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/forgot-password")}
            >
              Request New Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  console.log("✅ [UpdatePassword] Rendering password update form");
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/95 to-[#C2410C]/80 p-8 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white text-center max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Calendar className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold font-['Space_Grotesk']">SBPMeet</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Create New Password</h2>
          <p className="text-lg text-white/80 mb-8">
            Choose a strong password that you don't use on other sites.
          </p>

          {/* Security features */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-green-400/30 p-2 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-sm text-left">256-bit encryption</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-blue-400/30 p-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm text-left">Password strength meter</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-xs text-white/70">Companies trust us</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-xs text-white/70">Support available</div>
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
                Update password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#1E3A8A] dark:text-gray-300">
                    New password
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
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength meter */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Password strength</span>
                      <span className="font-medium">
                        {strengthPercentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>
                    
                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.length ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.length ? "text-green-600" : "text-gray-400"}>
                          8+ characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.uppercase ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.uppercase ? "text-green-600" : "text-gray-400"}>
                          Uppercase
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.lowercase ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.lowercase ? "text-green-600" : "text-gray-400"}>
                          Lowercase
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.number ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.number ? "text-green-600" : "text-gray-400"}>
                          Number
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.special ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.special ? "text-green-600" : "text-gray-400"}>
                          Special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#1E3A8A] dark:text-gray-300">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                {/* Security note */}
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Make sure your password is unique and not used on other sites for maximum security.
                    </span>
                  </p>
                </div>

                {/* Debug info - only in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40">
                    <p className="font-bold mb-2">Debug Info:</p>
                    <pre>{JSON.stringify({
                      isRecoveryMode,
                      sessionChecked,
                      passwordLength: password.length,
                      passwordStrength: Object.values(passwordStrength).filter(Boolean).length,
                      hash: debugInfo.hash,
                      hashParams: debugInfo.hashParams
                    }, null, 2)}</pre>
                  </div>
                )}
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
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Update password
                      <Lock className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
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