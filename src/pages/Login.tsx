import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="h-10 w-10" />
            <span className="text-3xl font-bold font-['Space_Grotesk']">Schedulo</span>
          </div>
          <h1 className="text-4xl font-bold font-['Space_Grotesk'] mb-4 leading-tight">
            Scheduling made effortless
          </h1>
          <p className="text-lg opacity-80">
            Set your availability, share your link, and let others book time with you. No back-and-forth emails.
          </p>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-2 lg:hidden">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-['Space_Grotesk'] text-primary">Schedulo</span>
              </div>
              <CardTitle className="text-2xl font-['Space_Grotesk']">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
