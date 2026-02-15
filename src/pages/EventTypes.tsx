import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useEventTypes, useCreateEventType, useUpdateEventType, useDeleteEventType, EventType } from "@/hooks/use-event-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Clock, MapPin, DollarSign, Pencil, Trash2, Copy, MoreVertical,
  Video, Phone, Building2, Calendar, Sparkles, AlertCircle, CheckCircle2, Palette,
  Shield, Zap, Eye, EyeOff, Hash, Settings2, X, ChevronDown, Globe, Info,
  Fingerprint, LayoutGrid, List, ArrowUpDown, Filter, TrendingUp, Users,
  CalendarRange, BarChart3, ExternalLink, Loader2, CheckCircle, XCircle,
  Mail, RefreshCw
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEventTypesBookingCounts, useEventTypeBookingStats } from "@/hooks/use-bookings";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// HELPER FUNCTIONS
// ============================================

const truncateUserId = (id: string) => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.slice(0, 4)}...${id.slice(-3)}`;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================
// CONSTANTS & OPTIONS
// ============================================

const LOCATION_OPTIONS = [
  { value: "video", label: "Video Call", icon: Video, color: "text-[#1E3A8A]", bgColor: "bg-[#1E3A8A]/10" },
  { value: "phone", label: "Phone Call", icon: Phone, color: "text-[#C2410C]", bgColor: "bg-[#C2410C]/10" },
  { value: "in_person", label: "In Person", icon: Building2, color: "text-[#1E3A8A]", bgColor: "bg-[#1E3A8A]/10" },
];

const COLOR_OPTIONS = [
  { value: "#1E3A8A", name: "Dark Blue" },
  { value: "#C2410C", name: "Orange Dark" },
  { value: "#2563EB", name: "Blue" },
  { value: "#059669", name: "Emerald" },
  { value: "#D97706", name: "Amber" },
  { value: "#DC2626", name: "Red" },
  { value: "#EC4899", name: "Pink" },
  { value: "#0891B2", name: "Cyan" },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120,150,180,210,240,270,300];

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD ($)", symbol: "$", flag: "🇺🇸" },
  { value: "eur", label: "EUR (€)", symbol: "€", flag: "🇪🇺" },
  { value: "gbp", label: "GBP (£)", symbol: "£", flag: "🇬🇧" },
  { value: "kes", label: "KES (KSh)", symbol: "KSh", flag: "🇰🇪" },
  { value: "ngn", label: "NGN (₦)", symbol: "₦", flag: "🇳🇬" },
];

// ============================================
// TYPES & INTERFACES
// ============================================

interface FormData {
  title: string;
  slug: string;
  description: string;
  duration: number;
  location_type: string;
  location_details: string;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents: number;
  currency: string;
}

const defaultForm: FormData = {
  title: "",
  slug: "",
  description: "",
  duration: 30,
  location_type: "video",
  location_details: "",
  color: "#1E3A8A",
  buffer_before: 0,
  buffer_after: 0,
  is_active: true,
  price_cents: 0,
  currency: "usd",
};

// ============================================
// UI COMPONENTS
// ============================================

function InstructionCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border">
      <Icon className="h-4 w-4 text-[#1E3A8A] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-[#1E3A8A]">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, trend, color = "primary" }: any) {
  const colorMap: any = {
    primary: "#1E3A8A",
    green: "#059669",
    blue: "#2563EB",
    amber: "#D97706"
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[#1E3A8A]">{value}</p>
            {trend && (
              <p className="text-xs text-[#C2410C] mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="rounded-xl p-2.5" style={{ backgroundColor: `${colorMap[color]}10` }}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colorMap[color] }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// GOOGLE CALENDAR CONNECTION COMPONENT
// ============================================

function CalendarConnection({ userId }: { userId: string }) {
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check connection status on mount and after OAuth callback
  useEffect(() => {
    checkConnection();
    
    // Handle OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      toast({
        title: "✅ Calendar Connected!",
        description: "Your Google Calendar has been connected successfully. Events will now sync automatically.",
      });
      checkConnection(); // Refresh connection status
      // Remove query param
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('error') === 'connection_failed') {
      toast({
        title: "❌ Connection Failed",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
      }
    };
  }, [userId]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (tokenInfo?.expires_at) {
      const expiryTime = new Date(tokenInfo.expires_at).getTime();
      const currentTime = new Date().getTime();
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Refresh 5 minutes before expiry (300,000 ms)
      const refreshBuffer = 5 * 60 * 1000;
      const refreshTime = Math.max(timeUntilExpiry - refreshBuffer, 0);
      
      console.log(`⏰ [Calendar] Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
      console.log(`🔄 [Calendar] Auto-refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      
      // Clear any existing timer
      if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
      }
      
      // Set new timer
      const timer = setTimeout(() => {
        console.log('🔄 [Calendar] Auto-refresh triggered');
        refreshToken(true); // silent refresh
      }, refreshTime);
      
      setAutoRefreshTimer(timer);
    }
    
    return () => {
      if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
      }
    };
  }, [tokenInfo?.expires_at]);

  const checkConnection = async () => {
    console.log('🔍 [Calendar] Checking connection for user:', userId);
    setError(null);
    
    try {
      console.log('📡 [Calendar] Querying user_calendar_tokens table...');
      const { data, error } = await supabase
        .from('user_calendar_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .maybeSingle();

      if (error) {
        console.error('❌ [Calendar] Database query error:', error);
        throw error;
      }

      console.log('📦 [Calendar] Query result:', data ? '✅ Token found' : '❌ No token found');
      
      if (data) {
        // Check if token is expired
        const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
        console.log('📊 [Calendar] Token details:', {
          id: data.id,
          created_at: new Date(data.created_at).toLocaleString(),
          expires_at: data.expires_at ? new Date(data.expires_at).toLocaleString() : 'Never',
          isExpired,
          hasRefreshToken: !!data.refresh_token
        });

        // If token is expired, try to refresh automatically
        if (isExpired && data.refresh_token) {
          console.log('🔄 [Calendar] Token expired, attempting auto-refresh...');
          await refreshToken(true);
          return; // refreshToken will update state
        }
      }
      
      setIsConnected(!!data);
      setTokenInfo(data);
    } catch (error: any) {
      console.error('❌ [Calendar] Error checking connection:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (silent = false) => {
    console.log('🔄 [Calendar] Refreshing token...', silent ? '(silent mode)' : '');
    setRefreshing(true);
    
    try {
      // Invoke the refresh-calendar-token edge function
      const { data, error } = await supabase.functions.invoke('refresh-calendar-token', {
        body: { userId }
      });

      if (error) {
        console.error('❌ [Calendar] Refresh error:', error);
        throw error;
      }

      console.log('✅ [Calendar] Token refreshed successfully:', data);

      // Re-check connection to get updated token info
      await checkConnection();
      
      if (!silent) {
        toast({
          title: "✅ Token Refreshed",
          description: "Calendar access token has been refreshed successfully.",
        });
      }
    } catch (error: any) {
      console.error('❌ [Calendar] Token refresh error:', error);
      setError(error.message);
      
      if (!silent) {
        toast({
          title: "❌ Refresh Failed",
          description: error.message || "Failed to refresh token",
          variant: "destructive"
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const connectGoogleCalendar = async () => {
    console.log('🚀 [Calendar] Starting Google Calendar connection...');
    setConnecting(true);
    setError(null);
    
    try {
      console.log('📡 [Calendar] Calling Supabase Edge Function: get-google-oauth-url...');
      
      const { data, error } = await supabase.functions.invoke('get-google-oauth-url', {
        body: { userId }
      });

      console.log('📥 [Calendar] Edge Function response:', {
        hasData: !!data,
        hasError: !!error,
        url: data?.url ? '✅ Received' : '❌ Missing'
      });

      if (error) {
        console.error('❌ [Calendar] Edge Function error:', error);
        throw new Error(error.message || 'Failed to get OAuth URL');
      }

      if (!data || !data.url) {
        console.error('❌ [Calendar] No URL in response:', data);
        throw new Error('No OAuth URL returned from server');
      }

      // Store current URL to return after auth
      localStorage.setItem('calendar_redirect', window.location.pathname);
      console.log('💾 [Calendar] Stored redirect path:', window.location.pathname);

      console.log('➡️ [Calendar] Redirecting to Google OAuth...');
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('❌ [Calendar] Connection error:', error);
      setError(error.message);
      setConnecting(false);
      
      toast({
        title: "❌ Connection failed",
        description: error.message || "Failed to connect Google Calendar",
        variant: "destructive"
      });
    }
  };

  const disconnectCalendar = async () => {
    console.log('🔌 [Calendar] Disconnecting Google Calendar for user:', userId);
    
    try {
      console.log('📡 [Calendar] Deleting token from database...');
      const { error } = await supabase
        .from('user_calendar_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'google');

      if (error) {
        console.error('❌ [Calendar] Disconnect error:', error);
        throw error;
      }

      console.log('✅ [Calendar] Successfully disconnected');
      
      // Clear any auto-refresh timer
      if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer);
        setAutoRefreshTimer(null);
      }
      
      setIsConnected(false);
      setTokenInfo(null);
      setError(null);
      
      toast({
        title: "🔌 Calendar Disconnected",
        description: "Google Calendar has been disconnected. New bookings will not be synced.",
      });
    } catch (error: any) {
      console.error('❌ [Calendar] Disconnect error:', error);
      setError(error.message);
      toast({
        title: "❌ Error",
        description: "Failed to disconnect calendar",
        variant: "destructive"
      });
    }
  };

  const formatTimeUntilExpiry = () => {
    if (!tokenInfo?.expires_at) return 'Unknown';
    
    const expiryTime = new Date(tokenInfo.expires_at).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpiry = expiryTime - currentTime;
    
    if (timeUntilExpiry <= 0) return 'Expired';
    
    const minutes = Math.floor(timeUntilExpiry / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A]" />
            <span className="ml-2 text-sm text-muted-foreground">Checking calendar connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Connection Status Banner */}
        {isConnected ? (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">Calendar Connected</h4>
                <p className="text-xs text-green-600 dark:text-green-400">
                  All new bookings will be automatically synced to your Google Calendar
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                Active
              </Badge>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Calendar Not Connected</h4>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Connect Google Calendar to automatically sync bookings and generate Meet links
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Connection UI */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            isConnected ? "bg-green-500/10" : "bg-[#1E3A8A]/10"
          )}>
            <Calendar className={cn(
              "h-6 w-6",
              isConnected ? "text-green-600" : "text-[#1E3A8A]"
            )} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#1E3A8A] mb-1">Google Calendar Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isConnected 
                ? "Your calendar is connected. When guests book your events, they'll automatically appear with Google Meet links."
                : "Connect to enable automatic calendar sync and video conferencing."}
            </p>

            {isConnected && tokenInfo && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">Connected since:</span>
                  <span className="font-medium text-[#1E3A8A]">{new Date(tokenInfo.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Expires in:</span>
                  <span className="font-medium text-[#1E3A8A]">{formatTimeUntilExpiry()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <RefreshCw className="h-3 w-3 text-[#1E3A8A]" />
                  <span className="text-muted-foreground">Auto-refresh:</span>
                  <span className="font-medium text-[#1E3A8A]">Enabled (5 min before expiry)</span>
                </div>
                {tokenInfo.expires_at && new Date(tokenInfo.expires_at) < new Date() && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Token expired - refreshing automatically...</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {isConnected ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={disconnectCalendar}
                    className="gap-2 border-[#C2410C]/20 text-[#C2410C] hover:bg-[#C2410C]/10"
                  >
                    <XCircle className="h-4 w-4" />
                    Disconnect
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => refreshToken(false)}
                    disabled={refreshing}
                    className="gap-2 text-[#1E3A8A] hover:bg-[#1E3A8A]/10"
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {refreshing ? "Refreshing..." : "Refresh Now"}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={connectGoogleCalendar}
                  disabled={connecting}
                  className="gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Connect Google Calendar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-[#1E3A8A]">Automatic Sync</p>
              <p className="text-xs text-muted-foreground">Bookings appear in your calendar instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Video className="h-4 w-4 text-[#1E3A8A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-[#1E3A8A]">Google Meet Links</p>
              <p className="text-xs text-muted-foreground">Auto-generated for every video call</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-[#C2410C] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-[#1E3A8A]">Email Invites</p>
              <p className="text-xs text-muted-foreground">Guests get calendar invites with links</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// ============================================
// TABLE VIEW COMPONENT
// ============================================

function TableView({ events, bookingCounts, onCopy, onEdit, onDuplicate, onToggle, onDelete }: any) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden w-full">
      <Table>
        <TableHeader className="bg-[#1E3A8A]/5">
          <TableRow>
            <TableHead className="w-[250px] text-[#1E3A8A]">Event</TableHead>
            <TableHead className="w-[100px] text-[#1E3A8A]">Duration</TableHead>
            <TableHead className="w-[120px] text-[#1E3A8A]">Location</TableHead>
            <TableHead className="w-[100px] text-[#1E3A8A]">Price</TableHead>
            <TableHead className="w-[100px] text-[#1E3A8A]">Status</TableHead>
            <TableHead className="w-[80px] text-[#1E3A8A]">Bookings</TableHead>
            <TableHead className="w-[100px] text-right text-[#1E3A8A]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event: EventType) => {
            const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
            const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
            const bookingCount = bookingCounts?.[event.id] || 0;
            
            return (
              <TableRow key={event.id} className={cn(!event.is_active && "opacity-60")}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: event.color }} />
                    <div>
                      <p className="font-medium text-sm text-[#1E3A8A]">{event.title}</p>
                      <p className="text-xs text-muted-foreground">/{event.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs border-[#1E3A8A]/20">
                    <Clock className="h-3 w-3 mr-1 text-[#1E3A8A]" />
                    {event.duration}min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <LocationIcon className="h-3.5 w-3.5" style={{ color: event.location_type === 'phone' ? '#C2410C' : '#1E3A8A' }} />
                    <span className="text-xs capitalize">
                      {event.location_type === "in_person" ? "In person" : event.location_type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {(event.price_cents ?? 0) > 0 ? (
                    <span className="text-xs font-medium text-[#C2410C]">
                      {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Free</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      event.is_active ? "bg-green-500" : "bg-gray-300"
                    )} />
                    <span className="text-xs">
                      {event.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={bookingCount > 0 ? "default" : "secondary"} 
                    className={cn("text-xs", bookingCount > 0 && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}>
                    {bookingCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-[#1E3A8A]" onClick={() => onCopy(event.slug)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Copy booking link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => onEdit(event)} className="text-xs hover:text-[#1E3A8A]">
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(event)} className="text-xs hover:text-[#C2410C]">
                          <Sparkles className="h-3.5 w-3.5 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onToggle(event)} className="text-xs hover:text-[#1E3A8A]">
                          {event.is_active ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 mr-2" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 mr-2" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-xs text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// MAIN EVENTTYPES COMPONENT
// ============================================

export default function EventTypes() {
  const { user } = useAuth();
  const { data: events, isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Get booking counts for all event types
  const eventTypeIds = events?.map(e => e.id) || [];
  const { data: bookingCounts, isLoading: countsLoading } = useEventTypesBookingCounts(eventTypeIds);

  // UI State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("0");
  const [showTips, setShowTips] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [activeTab, setActiveTab] = useState("events");

  const userId = user?.id;

  // ============================================
  // FILTERED & SORTED EVENTS
  // ============================================

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    let filtered = [...events];
    
    // Filter by status
    if (filterStatus === "active") {
      filtered = filtered.filter(e => e.is_active);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(e => !e.is_active);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return filtered;
  }, [events, filterStatus]);

  // ============================================
  // STATISTICS CALCULATION
  // ============================================

  const stats = useMemo(() => {
    if (!events) return { 
      total: 0, 
      active: 0, 
      totalBookings: 0,
      avgBookingsPerEvent: 0,
      mostBooked: null,
      totalRevenue: 0
    };

    const total = events.length;
    const active = events.filter(e => e.is_active).length;
    const totalBookings = Object.values(bookingCounts || {}).reduce((sum, count) => sum + count, 0);
    const avgBookingsPerEvent = total > 0 ? (totalBookings / total).toFixed(1) : 0;
    
    // Find most booked event
    let mostBooked = null;
    let maxBookings = 0;
    events.forEach(event => {
      const count = bookingCounts?.[event.id] || 0;
      if (count > maxBookings) {
        maxBookings = count;
        mostBooked = event.title;
      }
    });

    // Calculate total revenue
    const totalRevenue = events.reduce((sum, event) => {
      const count = bookingCounts?.[event.id] || 0;
      const price = (event.price_cents || 0) / 100;
      return sum + (count * price);
    }, 0);

    return {
      total,
      active,
      totalBookings,
      avgBookingsPerEvent,
      mostBooked: mostBooked || 'None yet',
      totalRevenue
    };
  }, [events, bookingCounts]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setPriceInput("0");
    setShowAdvanced(false);
    setDialogOpen(true);
  };

  const openEdit = (e: EventType) => {
    setEditingId(e.id);
    const price = (e.price_cents || 0) / 100;
    setForm({
      title: e.title,
      slug: e.slug,
      description: e.description || "",
      duration: e.duration,
      location_type: e.location_type,
      location_details: e.location_details || "",
      color: e.color,
      buffer_before: e.buffer_before,
      buffer_after: e.buffer_after,
      is_active: e.is_active,
      price_cents: e.price_cents || 0,
      currency: e.currency,
    });
    setPriceInput(price.toFixed(2));
    setShowAdvanced(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ 
        title: "Missing fields", 
        description: "Title and URL slug are required",
        variant: "destructive" 
      });
      return;
    }
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
        toast({ 
          title: "✅ Event Updated",
          description: "Your event type has been updated successfully." 
        });
      } else {
        await createMutation.mutateAsync({ ...form, user_id: user!.id });
        toast({ 
          title: "✅ Event Created",
          description: "Your new event type is ready to accept bookings." 
        });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ 
        title: "❌ Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ 
        title: "✅ Event Deleted",
        description: "Event type has been removed." 
      });
    } catch (err: any) {
      toast({ 
        title: "❌ Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const toggleActive = async (e: EventType) => {
    await updateMutation.mutateAsync({ id: e.id, is_active: !e.is_active });
    toast({
      title: !e.is_active ? "✅ Event Activated" : "⏸️ Event Deactivated",
      description: !e.is_active 
        ? "Guests can now book this event." 
        : "This event is now hidden from booking.",
    });
  };

  const copyLink = (slug: string) => {
    if (!userId) {
      toast({ 
        title: "❌ Error", 
        description: "User ID not found", 
        variant: "destructive" 
      });
      return;
    }
    const url = `${window.location.origin}/${userId}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ 
      title: "🔗 Link Copied",
      description: "Booking link copied to clipboard." 
    });
  };

  const duplicateEvent = async (e: EventType) => {
    await createMutation.mutateAsync({
      title: `${e.title} (Copy)`,
      slug: `${e.slug}-copy`,
      description: e.description,
      duration: e.duration,
      location_type: e.location_type,
      location_details: e.location_details,
      color: e.color,
      buffer_before: e.buffer_before,
      buffer_after: e.buffer_after,
      price_cents: e.price_cents,
      currency: e.currency,
      user_id: user!.id,
      is_active: false,
    });
    toast({ 
      title: "📋 Event Duplicated",
      description: "A copy has been created (inactive by default)." 
    });
  };

  const handlePriceChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPriceInput(value);
      if (value === "") {
        setForm(f => ({ ...f, price_cents: 0 }));
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setForm(f => ({ ...f, price_cents: Math.round(numValue * 100) }));
        }
      }
    }
  };

  const handlePriceBlur = () => {
    if (priceInput === "" || priceInput === ".") {
      setPriceInput("0");
      setForm(f => ({ ...f, price_cents: 0 }));
    } else {
      const numValue = parseFloat(priceInput);
      if (!isNaN(numValue)) {
        setPriceInput(numValue.toFixed(2));
      }
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading || countsLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A] mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/80 to-[#C2410C]/60 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                <span>Event Management</span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Manage your events
              </h1>
              <p className="text-sm text-white/80 max-w-xl">
                Create and customize how people book time with you. Events sync automatically with Google Calendar when connected.
              </p>
            </div>
            <Button 
              onClick={openCreate} 
              size="lg"
              className="bg-white text-[#1E3A8A] hover:bg-white/90 shadow-lg gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatsCard icon={Calendar} label="Total Events" value={stats.total} color="primary" />
            <StatsCard icon={CheckCircle2} label="Active" value={stats.active} color="green" />
            <StatsCard icon={Users} label="Total Bookings" value={stats.totalBookings} color="blue" />
            <StatsCard icon={DollarSign} label="Est. Revenue" value={`$${stats.totalRevenue.toFixed(0)}+`} color="amber" />
          </div>

          {/* Performance Insights */}
          {stats.totalBookings > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-white/60" />
                    <p className="text-xs text-white/60">Most Popular Event</p>
                  </div>
                  <p className="text-base font-semibold text-white">{stats.mostBooked}</p>
                  <p className="text-xs text-white/60 mt-1">
                    {stats.avgBookingsPerEvent} avg bookings per event
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarRange className="h-4 w-4 text-white/60" />
                    <p className="text-xs text-white/60">Calendar Sync</p>
                  </div>
                  <p className="text-base font-semibold text-white">Google Calendar</p>
                  <p className="text-xs text-white/60 mt-1">
                    Connect in Calendar tab for auto-sync
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-[#1E3A8A]/10">
          <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            <CalendarRange className="h-4 w-4" />
            Calendar Sync
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(v) => setFilterStatus(v as any)}>
                <TabsList className="grid grid-cols-3 w-full sm:w-[300px] bg-[#1E3A8A]/10">
                  <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Active ({stats.active})</TabsTrigger>
                  <TabsTrigger value="inactive" className="text-xs data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Inactive ({stats.total - stats.active})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={cn("h-8 w-8", viewMode === "grid" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="icon"
                  className={cn("h-8 w-8", viewMode === "table" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                  onClick={() => setViewMode("table")}
                  disabled={isMobile}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          {showTips && events && events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-[#1E3A8A]/5 to-[#C2410C]/10 border p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#1E3A8A]" />
                  <h3 className="text-sm font-medium text-[#1E3A8A]">Quick Tips</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowTips(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <InstructionCard 
                  icon={Pencil}
                  title="Clear Titles"
                  desc="Make it obvious what the meeting is for"
                />
                <InstructionCard 
                  icon={Clock}
                  title="Right Duration"
                  desc="30min for quick calls, 60min for deep talks"
                />
                <InstructionCard 
                  icon={CalendarRange}
                  title="Calendar Sync"
                  desc="Connect Google Calendar for auto-sync"
                />
              </div>
            </motion.div>
          )}

          {/* Events Grid/Table */}
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
                  <Calendar className="h-12 w-12 text-[#1E3A8A]/60 relative" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1E3A8A]">No events found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterStatus !== "all" 
                      ? `You don't have any ${filterStatus} events.` 
                      : "Create your first event to start accepting bookings."}
                  </p>
                </div>
                <Button onClick={openCreate} className="gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  <Plus className="h-4 w-4" />
                  Create your first event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {viewMode === "table" && !isMobile ? (
                <TableView 
                  events={filteredEvents}
                  bookingCounts={bookingCounts}
                  onCopy={copyLink}
                  onEdit={openEdit}
                  onDuplicate={duplicateEvent}
                  onToggle={toggleActive}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event) => {
                    const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
                    const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
                    const bookingCount = bookingCounts?.[event.id] || 0;
                    
                    return (
                      <Card key={event.id} className={cn(
                        "group relative overflow-hidden transition-all hover:shadow-lg border-t-4",
                        !event.is_active && "opacity-70"
                      )} style={{ borderTopColor: event.color }}>
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                                <h3 className="font-semibold text-base truncate text-[#1E3A8A]">{event.title}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground font-mono truncate">/{event.slug}</p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => copyLink(event.slug)} className="text-xs hover:text-[#1E3A8A]">
                                  <Copy className="h-3.5 w-3.5 mr-2" /> Copy link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(event)} className="text-xs hover:text-[#1E3A8A]">
                                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateEvent(event)} className="text-xs hover:text-[#C2410C]">
                                  <Sparkles className="h-3.5 w-3.5 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toggleActive(event)} className="text-xs hover:text-[#1E3A8A]">
                                  {event.is_active ? (
                                    <><EyeOff className="h-3.5 w-3.5 mr-2" /> Deactivate</>
                                  ) : (
                                    <><Eye className="h-3.5 w-3.5 mr-2" /> Activate</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-xs text-destructive">
                                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {event.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <Badge variant="secondary" className="gap-1 text-xs py-0.5 border-[#1E3A8A]/20">
                              <Clock className="h-3 w-3 text-[#1E3A8A]" /> {event.duration}min
                            </Badge>
                            <Badge variant="secondary" className="gap-1 text-xs py-0.5 border-[#1E3A8A]/20">
                              <LocationIcon className="h-3 w-3" style={{ color: event.location_type === 'phone' ? '#C2410C' : '#1E3A8A' }} /> 
                              {event.location_type === "in_person" ? "In person" : event.location_type}
                            </Badge>
                            {(event.price_cents ?? 0) > 0 && (
                              <Badge variant="secondary" className="gap-1 text-xs py-0.5 bg-amber-500/10 border-amber-500/20">
                                <DollarSign className="h-3 w-3 text-[#C2410C]" /> 
                                {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                event.is_active ? "bg-green-500" : "bg-gray-300"
                              )} />
                              <span className="text-xs text-muted-foreground">
                                {event.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant={bookingCount > 0 ? "default" : "outline"} 
                                    className={cn("text-xs cursor-help", 
                                      bookingCount > 0 && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white")}>
                                    <Users className="h-3 w-3 mr-1" />
                                    {bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Total bookings for this event</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Create Card */}
                  <Card onClick={openCreate} className="cursor-pointer border-dashed hover:border-[#1E3A8A] hover:bg-[#1E3A8A]/5 transition-all">
                    <CardContent className="p-5 h-full flex flex-col items-center justify-center text-center min-h-[240px]">
                      <div className="rounded-full bg-[#1E3A8A]/10 p-3 mb-3">
                        <Plus className="h-5 w-5 text-[#1E3A8A]" />
                      </div>
                      <h3 className="font-semibold text-sm text-[#1E3A8A]">Create new event</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">
                        Add another way for people to book with you
                      </p>
                      <Badge variant="outline" className="mt-3 text-[10px] border-[#1E3A8A]/20">
                        {stats.total} total · {stats.active} active
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* Calendar Sync Tab */}
        <TabsContent value="calendar" className="mt-6">
          {userId && <CalendarConnection userId={userId} />}
          
          {/* Pasbest Ventures Attribution */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              A product of{" "}
              <a 
                href="https://pasbestventures.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors font-medium"
              >
                Pasbest Ventures Limited
              </a>
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile ? "w-full max-w-full h-full max-h-full rounded-none" : "max-w-2xl"
        )}>
          <div className="border-b px-6 py-4 flex items-center justify-between bg-background sticky top-0 z-50">
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2">
                <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
                  {editingId ? <Pencil className="h-4 w-4 text-[#1E3A8A]" /> : <Plus className="h-4 w-4 text-[#1E3A8A]" />}
                </div>
                <span className="text-sm text-[#1E3A8A]">{editingId ? "Edit event" : "Create new event"}</span>
              </DialogTitle>
            </DialogHeader>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: isMobile ? "calc(100vh - 140px)" : "calc(90vh - 140px)" }}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs">1</span>
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#1E3A8A]">Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
                      }}
                      placeholder="e.g., 30-minute Discovery Call"
                      className="h-10 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-[#1E3A8A]">URL Slug <span className="text-red-500">*</span></Label>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">/</span>
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                        placeholder="30-min-call"
                        className="h-10 rounded-l-none focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground break-all bg-muted/30 p-2 rounded">
                      {window.location.origin}/{userId ? truncateUserId(userId) : 'user'}/{form.slug || 'event'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-[#1E3A8A]">Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of what this meeting is about..."
                      rows={3}
                      className="resize-none focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Meeting Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs">2</span>
                  Meeting Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-[#1E3A8A]">Duration</Label>
                      <Select value={String(form.duration)} onValueChange={(v) => setForm(f => ({ ...f, duration: Number(v) }))}>
                        <SelectTrigger className="h-10 focus:ring-[#1E3A8A]/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map(d => (
                            <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-[#1E3A8A]">Location Type</Label>
                      <Select value={form.location_type} onValueChange={(v) => setForm(f => ({ ...f, location_type: v }))}>
                        <SelectTrigger className="h-10 focus:ring-[#1E3A8A]/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_OPTIONS.map(l => (
                            <SelectItem key={l.value} value={l.value}>
                              <div className="flex items-center gap-2">
                                <l.icon className={cn("h-4 w-4", l.color)} />
                                <span>{l.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-[#1E3A8A]">Location Details</Label>
                    <Input
                      value={form.location_details}
                      onChange={(e) => setForm(f => ({ ...f, location_details: e.target.value }))}
                      placeholder="Add meeting link, address, or phone number"
                      className="h-10 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.location_type === 'video' 
                        ? "For video calls, Google Meet links will be auto-generated when calendar is connected." 
                        : "This location will be shared with guests."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-[#1E3A8A] w-full justify-center py-2.5 border rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                  {showAdvanced ? "Hide" : "Show"} advanced options
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-[#1E3A8A]">Buffer before (minutes)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={form.buffer_before}
                          onChange={(e) => setForm(f => ({ ...f, buffer_before: Number(e.target.value) }))}
                          className="h-10 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-[#1E3A8A]">Buffer after (minutes)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={form.buffer_after}
                          onChange={(e) => setForm(f => ({ ...f, buffer_after: Number(e.target.value) }))}
                          className="h-10 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-[#1E3A8A]">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A8A]" />
                          <Input
                            type="text"
                            value={priceInput}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            onBlur={handlePriceBlur}
                            className="pl-9 h-10 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-[#1E3A8A]">Currency</Label>
                        <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                          <SelectTrigger className="h-10 focus:ring-[#1E3A8A]/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <span className="mr-2">{c.flag}</span>
                                <span>{c.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs">3</span>
                  Appearance & Status
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#1E3A8A]">Color theme</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c.value}
                          className={cn(
                            "h-8 w-8 rounded-full transition-all hover:scale-110",
                            form.color === c.value && "ring-2 ring-[#1E3A8A] ring-offset-2"
                          )}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setForm(f => ({ ...f, color: c.value }))}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-[#1E3A8A]">Event status</Label>
                    <div className="flex items-center gap-3 h-10 px-3 rounded-lg border">
                      <Switch 
                        checked={form.is_active} 
                        onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                        className="data-[state=checked]:bg-[#1E3A8A]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1E3A8A]">{form.is_active ? "Active" : "Inactive"}</p>
                        <p className="text-xs text-muted-foreground">
                          {form.is_active 
                            ? "Guests can book this event" 
                            : "This event is hidden from booking"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Sync Note */}
              <div className="bg-[#1E3A8A]/5 rounded-lg p-4 border border-[#1E3A8A]/10">
                <div className="flex items-start gap-3">
                  <CalendarRange className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-[#1E3A8A] mb-1">Calendar Synchronization</h4>
                    <p className="text-xs text-muted-foreground">
                      When guests book this event, it will automatically appear in your Google Calendar 
                      {form.location_type === 'video' && ' with a Google Meet link generated automatically'}. 
                      Make sure you've connected your calendar in the Calendar Sync tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t px-6 py-4 bg-background flex gap-3 sticky bottom-0">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-10 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  Saving...
                </>
              ) : (
                editingId ? "Update Event" : "Create Event"
              )}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-10 px-6 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}