import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CalendarConnectionProps {
  userId: string;
}

export function CalendarConnection({ userId }: CalendarConnectionProps) {
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, [userId]);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("user_calendar_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", "google")
        .maybeSingle();

      if (error) throw error;

      setIsConnected(!!data);
      setTokenInfo(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-google-oauth-url", {
        body: { userId }
      });

      if (error) throw error;
      window.location.href = data.url;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectCalendar = async () => {
    try {
      const { error } = await supabase
        .from("user_calendar_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("provider", "google");

      if (error) throw error;

      setIsConnected(false);
      setTokenInfo(null);
      toast({
        title: "Calendar disconnected",
        description: "Google Calendar has been disconnected."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
          <span className="text-sm text-muted-foreground">Checking calendar connection...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className={cn("p-3 sm:p-4 rounded-2xl", isConnected ? "bg-green-100" : "bg-slate-100")}>
            <Calendar className={cn("h-6 w-6 sm:h-8 sm:w-8", isConnected ? "text-green-600" : "text-slate-600")} />
          </div>

          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold mb-1">Google Calendar</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              {isConnected
                ? "Your calendar is connected. Bookings will sync automatically with Google Meet links."
                : "Connect to automatically sync bookings and generate Meet links."}
            </p>

            {isConnected ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs sm:text-sm">Connected as {tokenInfo?.email || "your account"}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={disconnectCalendar}
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  Disconnect Calendar
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectGoogleCalendar}
                disabled={connecting}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm h-9 sm:h-10"
              >
                {connecting ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm border border-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}