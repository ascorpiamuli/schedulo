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
  XCircle
} from "lucide-react";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check password strength
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    // Check password strength
    const strengthValues = Object.values(passwordStrength);
    if (strengthValues.filter(Boolean).length < 3) {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated",
        });
        
        // Redirect to login after successful update
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
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

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/95 to-[#C2410C]/80 p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        
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
            Create new password
          </h1>
          
          <p className="text-white/80 mb-6">
            Choose a strong password that you don't use on other sites.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="h-4 w-4 text-[#C2410C]" />
              <span className="text-sm">256-bit encryption</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle2 className="h-4 w-4 text-[#C2410C]" />
              <span className="text-sm">Password strength meter</span>
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