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
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [debugInfo, setDebugInfo] = useState<any>({}); // For logging

  const navigate = useNavigate();
  const { toast } = useToast();

  // Log component mount
  useEffect(() => {
    console.log("🔵 [UpdatePassword] Component mounted");
    console.log("🔹 URL:", window.location.href);
    console.log("🔹 Search params:", window.location.search);
    
    // Log all URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    urlParams.forEach((value, key) => {
      params[key] = value;
      console.log(`🔹 URL param - ${key}:`, value);
    });
    setDebugInfo(prev => ({ ...prev, urlParams: params }));

    // Log hash fragment (might contain tokens)
    if (window.location.hash) {
      console.log("🔹 URL hash:", window.location.hash);
      setDebugInfo(prev => ({ ...prev, hash: window.location.hash }));
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    console.log("🔵 [UpdatePassword] Starting session check...");
    
    const checkSession = async () => {
      try {
        console.log("🔹 Attempting to get session from Supabase...");
        const startTime = performance.now();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        const endTime = performance.now();
        console.log(`⏱️ [UpdatePassword] getSession took ${(endTime - startTime).toFixed(2)}ms`);

        if (error) {
          console.error("❌ [UpdatePassword] Session error:", {
            message: error.message,
            status: error.status,
            name: error.name
          });
          setDebugInfo(prev => ({ ...prev, sessionError: error }));
        }

        console.log("🔹 Session data:", session ? {
          hasSession: true,
          userId: session.user?.id,
          email: session.user?.email,
          expiresAt: session.expires_at ? new Date(session.expires_at).toISOString() : null,
          isExpired: session.expires_at ? session.expires_at < Date.now() / 1000 : null
        } : {
          hasSession: false,
          message: "No active session found"
        });

        // Log all session properties for debugging
        if (session) {
          console.log("🔹 Full session object:", {
            access_token: session.access_token ? `${session.access_token.substring(0, 20)}...` : null,
            refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : null,
            expires_in: session.expires_in,
            expires_at: session.expires_at,
            token_type: session.token_type,
            user: {
              id: session.user.id,
              email: session.user.email,
              email_confirmed_at: session.user.email_confirmed_at,
              last_sign_in_at: session.user.last_sign_in_at,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
              app_metadata: session.user.app_metadata,
              user_metadata: session.user.user_metadata,
              factors: session.user.factors,
              identities: session.user.identities?.map(i => ({
                provider: i.provider,
                id: i.id,
                created_at: i.created_at,
                updated_at: i.updated_at
              }))
            }
          });
          setDebugInfo(prev => ({ ...prev, session }));
        }

        // Check if this is a password recovery session
        // In Supabase, recovery sessions are identified by the recovery token or specific flags
        const isRecoverySession = session?.user?.app_metadata?.provider === 'email' && 
                                  window.location.hash?.includes('type=recovery');

        console.log("🔹 Is recovery session:", isRecoverySession);
        
        if (session) {
          // Check for recovery flags in various places
          const hasRecoveryInHash = window.location.hash?.includes('type=recovery');
          const hasRecoveryInSearch = window.location.search?.includes('type=recovery');
          const hasRecoveryToken = window.location.hash?.includes('access_token') && 
                                   window.location.hash?.includes('refresh_token');
          
          console.log("🔹 Recovery indicators:", {
            hasRecoveryInHash,
            hasRecoveryInSearch,
            hasRecoveryToken,
            appMetadata: session.user?.app_metadata
          });

          // If there's a session from a password reset link, it's a recovery session
          if (hasRecoveryInHash || hasRecoveryInSearch || hasRecoveryToken) {
            console.log("✅ [UpdatePassword] Recovery session detected");
            setHasRecoverySession(true);
          } else {
            // Check if this is a fresh session from a recovery link
            const isFreshRecovery = session.user?.email_confirmed_at && 
                                   !session.user?.confirmed_at && 
                                   window.location.hash?.length > 0;
            
            if (isFreshRecovery) {
              console.log("✅ [UpdatePassword] Fresh recovery session detected");
              setHasRecoverySession(true);
            } else {
              console.log("⚠️ [UpdatePassword] Session exists but not recovery");
              setHasRecoverySession(false);
            }
          }
        } else {
          console.log("❌ [UpdatePassword] No session found");
          setHasRecoverySession(false);
        }

        setSessionChecked(true);
        console.log("✅ [UpdatePassword] Session check complete");

      } catch (err) {
        console.error("❌ [UpdatePassword] Unexpected error during session check:", err);
        setDebugInfo(prev => ({ ...prev, sessionCheckError: err }));
        setSessionChecked(true);
        setHasRecoverySession(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    console.log("🔵 [UpdatePassword] Setting up auth state listener...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 [UpdatePassword] Auth state changed:", {
        event,
        hasSession: !!session,
        sessionUser: session?.user?.email,
        timestamp: new Date().toISOString()
      });

      // Log all possible auth events
      const authEvents = [
        'SIGNED_IN',
        'SIGNED_OUT',
        'TOKEN_REFRESHED',
        'USER_UPDATED',
        'PASSWORD_RECOVERY',
        'INITIAL_SESSION'
      ];
      
      if (authEvents.includes(event)) {
        console.log(`✅ [UpdatePassword] Auth event: ${event}`);
      }

      if (event === 'PASSWORD_RECOVERY') {
        console.log("✅ [UpdatePassword] Password recovery event detected");
        setHasRecoverySession(true);
      }

      // Log session details on any auth change
      if (session) {
        console.log("🔹 Session after auth change:", {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: session.expires_at,
          provider: session.user.app_metadata?.provider
        });
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
      passwordLength: password.length,
      ...newStrength,
      metRequirements: Object.values(newStrength).filter(Boolean).length,
      timestamp: new Date().toISOString()
    });

    setPasswordStrength(newStrength);
  }, [password]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 [UpdatePassword] Update password form submitted");
    console.log("🔹 Form data:", {
      passwordLength: password.length,
      confirmPasswordLength: confirmPassword.length,
      passwordsMatch: password === confirmPassword,
      timestamp: new Date().toISOString()
    });

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
    console.log("🔹 Password strength check:", {
      metRequirements: metCount,
      required: 3,
      passed: metCount >= 3,
      details: passwordStrength
    });

    if (metCount < 3) {
      console.error("❌ [UpdatePassword] Password too weak");
      toast({
        title: "Weak password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("🔵 [UpdatePassword] Attempting to update password...");

    try {
      const startTime = performance.now();
      console.log("🔹 Calling supabase.auth.updateUser...");

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      const endTime = performance.now();
      console.log(`⏱️ [UpdatePassword] updateUser took ${(endTime - startTime).toFixed(2)}ms`);

      if (error) {
        console.error("❌ [UpdatePassword] Update failed:", {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });

        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("✅ [UpdatePassword] Password updated successfully");
        console.log("🔹 Attempting to sign out user...");

        toast({
          title: "Password updated",
          description: "Your password has been successfully updated",
        });

        // Sign out after successful update
        const signOutStart = performance.now();
        await supabase.auth.signOut();
        const signOutEnd = performance.now();
        
        console.log(`⏱️ [UpdatePassword] signOut took ${(signOutEnd - signOutStart).toFixed(2)}ms`);
        console.log("✅ [UpdatePassword] User signed out, redirecting to login in 2 seconds");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          console.log("🔵 [UpdatePassword] Redirecting to login page");
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ [UpdatePassword] Unexpected error during update:", {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("🔵 [UpdatePassword] Update process completed");
    }
  };

  const strengthPercentage = Object.values(passwordStrength).filter(Boolean).length * 20;
  const strengthColor = 
    strengthPercentage <= 40 ? "bg-red-500" :
    strengthPercentage <= 60 ? "bg-yellow-500" :
    strengthPercentage <= 80 ? "bg-blue-500" : "bg-green-500";

  // Loading state while checking session
  if (!sessionChecked) {
    console.log("🔵 [UpdatePassword] Rendering loading state (session not checked)");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    );
  }

  // No recovery session - show error
  if (!hasRecoverySession) {
    console.log("⚠️ [UpdatePassword] Rendering error state (no recovery session)");
    console.log("🔹 Debug info:", debugInfo);

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
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
              onClick={() => {
                console.log("🔵 [UpdatePassword] Navigating to forgot-password page");
                navigate("/forgot-password");
              }}
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
          
          <h2 className="text-3xl font-bold mb-4">Update Your Password</h2>
          <p className="text-lg text-white/80 mb-8">
            Create a strong, unique password to secure your account.
          </p>

          {/* Security features */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-green-400/30 p-2 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-sm text-left">End-to-end encryption</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="bg-blue-400/30 p-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm text-left">2-factor authentication ready</p>
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
                      onChange={(e) => {
                        console.log("🔹 Password input changed, length:", e.target.value.length);
                        setPassword(e.target.value);
                      }}
                      required
                      className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log("🔹 Toggle password visibility:", !showPassword);
                        setShowPassword(!showPassword);
                      }}
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
                      onChange={(e) => {
                        console.log("🔹 Confirm password input changed, length:", e.target.value.length);
                        setConfirmPassword(e.target.value);
                      }}
                      required
                      className="h-11 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log("🔹 Toggle confirm password visibility:", !showConfirmPassword);
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
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
                      hasRecoverySession,
                      sessionChecked,
                      passwordLength: password.length,
                      passwordStrength: Object.values(passwordStrength).filter(Boolean).length,
                      urlParams: debugInfo.urlParams,
                      hash: debugInfo.hash
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
                  onClick={() => console.log("🔹 Update password button clicked")}
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