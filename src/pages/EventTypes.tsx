// EventTypes.tsx - Enhanced with one-time event support
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  useEventTypes, 
  useCreateEventType, 
  useUpdateEventType, 
  useDeleteEventType, 
  EventType,
  CustomField,
  ReminderSettings,
  EventTeamMember
} from "@/hooks/use-event-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Clock, MapPin, DollarSign, Pencil, Trash2, Copy, MoreVertical,
  Video, Phone, Building2, Calendar, Sparkles, AlertCircle, CheckCircle2,
  Shield, Eye, EyeOff, Settings2, X, ChevronDown, Globe, Info,
  LayoutGrid, List, TrendingUp, Users, CalendarRange, BarChart3, Loader2,
  Mail, RefreshCw, ShieldAlert, UserPlus, Users2, CheckSquare,
  Link2, QrCode, Share2, Download, Upload, Filter, Search, Star,
  Award, Target, Zap, Activity, Sun, Moon, Coffee, Gift, HelpCircle,
  ChevronRight, ChevronLeft, ArrowUp, ArrowDown, Menu, Grid, Table as TableIcon,
  Circle, CircleDot, CircleOff, CircleCheck, CircleX, CircleHelp,
  Square, SquareCheck, SquareX, Triangle, Hexagon,
  Bot, Sparkle, PartyPopper, Medal, Trophy, Crown, Gem, Diamond,
  TrendingDown, ArrowUpRight, CalendarCheck, CheckCircle, AlertTriangle,
  Bell, Wifi, WifiOff, VideoOff, Headphones, Mic, MicOff, Monitor,
  MonitorOff, Camera, CameraOff, DownloadCloud, UploadCloud,
  Repeat, RefreshCcw, ExternalLink, Link, Link2Off, Radio, RadioTower,
  User, Users as UsersIcon, Users2 as TeamIcon, UserPlus2, UserMinus2,
  CalendarDays, Clock2, Clock8, Clock9, Clock10, Clock11, Clock12,
  ClockArrowUp, ClockArrowDown, ClockAlert, ClockFading,
  CalendarClock, CalendarPlus, CalendarX, CalendarCheck2,
  CalendarDays as CalendarIcon2, CalendarRange as CalendarRangeIcon
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventTypesBookingCounts } from "@/hooks/use-bookings";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, differenceInMinutes } from "date-fns";

// ============================================
// MEETING PROVIDER OPTIONS
// ============================================
const MEETING_PROVIDERS = [
  { value: "google_meet", label: "Google Meet", icon: Video, color: "text-blue-600", bgColor: "bg-blue-100", description: "Auto-generate Google Meet links" },
  { value: "zoom", label: "Zoom", icon: Video, color: "text-blue-700", bgColor: "bg-blue-100", description: "Generate Zoom meeting links (requires Zoom account)" },
  { value: "microsoft_teams", label: "Microsoft Teams", icon: Video, color: "text-purple-600", bgColor: "bg-purple-100", description: "Generate Teams meeting links" },
  { value: "custom", label: "Custom Link", icon: Link2, color: "text-gray-600", bgColor: "bg-gray-100", description: "Use your own meeting link" },
];

// ============================================
// EVENT TYPES
// ============================================
const EVENT_SCHEDULE_TYPES = [
  { value: "flexible", label: "Flexible - Guests pick time", icon: CalendarDays, description: "Guests choose from your available slots" },
  { value: "one_time", label: "One-Time - Fixed date & time", icon: CalendarCheck2, description: "Single specific date and time (e.g., Feb 23, 7-10 AM)" },
];

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
//============================================

const LOCATION_OPTIONS = [
  { value: "video", label: "Video Call", icon: Video, color: "text-blue-600", bgColor: "bg-blue-100", description: "Zoom, Google Meet, Teams" },
  { value: "phone", label: "Phone Call", icon: Phone, color: "text-orange-600", bgColor: "bg-orange-100", description: "Phone number for call" },
  { value: "in_person", label: "In Person", icon: Building2, color: "text-green-600", bgColor: "bg-green-100", description: "Physical meeting location" },
];

const COLOR_OPTIONS = [
  { value: "#0F172A", name: "Slate 900", text: "text-slate-900" },
  { value: "#1E40AF", name: "Blue 800", text: "text-blue-800" },
  { value: "#B45309", name: "Amber 700", text: "text-amber-700" },
  { value: "#059669", name: "Emerald 600", text: "text-emerald-600" },
  { value: "#7C3AED", name: "Violet 600", text: "text-violet-600" },
  { value: "#DB2777", name: "Pink 600", text: "text-pink-600" },
  { value: "#DC2626", name: "Red 600", text: "text-red-600" },
  { value: "#2563EB", name: "Blue 600", text: "text-blue-600" },
];

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD ($)", symbol: "$", flag: "🇺🇸" },
  { value: "eur", label: "EUR (€)", symbol: "€", flag: "🇪🇺" },
  { value: "gbp", label: "GBP (£)", symbol: "£", flag: "🇬🇧" },
  { value: "kes", label: "KES (KSh)", symbol: "KSh", flag: "🇰🇪" },
  { value: "ngn", label: "NGN (₦)", symbol: "₦", flag: "🇳🇬" },
];

const ATTENDEE_ROLE_OPTIONS = [
  { value: "host", label: "Host", description: "Full control over the event" },
  { value: "co-host", label: "Co-host", description: "Can manage attendees and settings" },
  { value: "presenter", label: "Presenter", description: "Can present but not manage" },
  { value: "observer", label: "Observer", description: "View-only access" },
];

const CUSTOM_FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: "📝" },
  { value: "textarea", label: "Long Text", icon: "📄" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "phone", label: "Phone Number", icon: "📞" },
  { value: "select", label: "Dropdown", icon: "▼" },
  { value: "checkbox", label: "Checkbox", icon: "☑️" },
  { value: "radio", label: "Radio Buttons", icon: "⚪" },
];

const REMINDER_OPTIONS = [
  { value: "15min", label: "15 minutes before", minutes: 15 },
  { value: "1h", label: "1 hour before", minutes: 60 },
  { value: "24h", label: "24 hours before", minutes: 1440 },
  { value: "3d", label: "3 days before", minutes: 4320 },
  { value: "7d", label: "7 days before", minutes: 10080 },
];

// ============================================
// TYPES & INTERFACES
// ============================================

interface OneTimeEventData {
  date: string; // ISO date string
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  duration: number; // Calculated from start_time and end_time for one-time events
  location_type: string;
  location_details: string;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents: number;
  currency: string;
  
  // Multi-attendee fields
  max_attendees: number;
  min_attendees: number;
  allow_additional_guests: boolean;
  guests_can_invite_others: boolean;
  require_approval: boolean;
  team_event: boolean;
  waiting_list_enabled: boolean;
  reminder_settings: Record<string, boolean>;
  custom_fields: CustomField[];
  payment_required_per_attendee: boolean;
  booking_confirmation_message: string;
  cancellation_policy: string;
  show_attendees_to_guests: boolean;
  
  // Schedule type
  schedule_type: 'flexible' | 'one_time';
  
  // One-time event data
  one_time_event: OneTimeEventData | null;
  
  // Meeting link fields
  permanent_meeting_link: string;
  generate_meeting_link: boolean;
  meeting_provider: 'google_meet' | 'zoom' | 'microsoft_teams' | 'custom';
  host_join_first: boolean;
  conference_data?: any; // Store additional conference metadata
}

interface TeamMemberForm {
  user_id: string;
  role: 'host' | 'co-host' | 'presenter' | 'observer';
  is_required: boolean;
  email?: string;
  name?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'red' | 'yellow' | 'slate';
  description?: string;
  progress?: number;
  footer?: string;
  linkTo?: string;
  onClick?: () => void;
}

const defaultForm: FormData = {
  title: "",
  slug: "",
  description: "",
  duration: 30,
  location_type: "video",
  location_details: "",
  color: "#0F172A",
  buffer_before: 0,
  buffer_after: 0,
  is_active: true,
  price_cents: 0,
  currency: "usd",
  
  // Multi-attendee defaults
  max_attendees: 1,
  min_attendees: 1,
  allow_additional_guests: false,
  guests_can_invite_others: false,
  require_approval: false,
  team_event: false,
  waiting_list_enabled: false,
  reminder_settings: {
    '24h': true,
    '1h': false,
    '15min': false
  },
  custom_fields: [],
  payment_required_per_attendee: false,
  booking_confirmation_message: "",
  cancellation_policy: "",
  show_attendees_to_guests: true,
  
  // Schedule type
  schedule_type: 'flexible',
  
  // One-time event data
  one_time_event: null,
  
  // Meeting link defaults
  permanent_meeting_link: "",
  generate_meeting_link: true,
  meeting_provider: 'google_meet',
  host_join_first: true,
  conference_data: null,
};

// ============================================
// UI COMPONENTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 12, stiffness: 100 }
  }
};

// One-Time Event Input Component
const OneTimeEventInput = ({ value, onChange }: { value: OneTimeEventData | null; onChange: (data: OneTimeEventData | null) => void }) => {
  const [date, setDate] = useState<string>(value?.date || format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState<string>(value?.start_time || "09:00");
  const [endTime, setEndTime] = useState<string>(value?.end_time || "10:00");
  const { toast } = useToast();

  // Calculate duration in minutes
  const calculateDuration = () => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    
    return endTotal - startTotal;
  };

  const handleUpdate = () => {
    // Validate time range
    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(`${date}T${startTime}`);
    if (selectedDate < new Date()) {
      toast({
        title: "Invalid date",
        description: "Event date cannot be in the past",
        variant: "destructive"
      });
      return;
    }

    onChange({
      date,
      start_time: startTime,
      end_time: endTime
    });
  };

  useEffect(() => {
    if (date && startTime && endTime) {
      handleUpdate();
    }
  }, [date, startTime, endTime]);

  const duration = calculateDuration();

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <CalendarCheck2 className="h-4 w-4 text-purple-600" />
        <Label className="text-sm font-medium text-purple-900">One-Time Event Details</Label>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Start Time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">End Time</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Duration</Label>
          <div className="h-9 px-3 bg-white rounded-md border flex items-center text-sm">
            {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        </div>
      </div>

      {date && startTime && endTime && (
        <div className="mt-2 p-2 bg-purple-100/50 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700">
            <strong>📅 Event scheduled for:</strong> {new Date(`${date}T${startTime}`).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} from {startTime} to {endTime}
          </p>
          <p className="text-[10px] text-purple-600 mt-1">
            Guests can book this specific time slot. No other times will be available.
          </p>
        </div>
      )}
    </div>
  );
};

// Meeting Link Explanation Component
const MeetingLinkExplanation = ({ maxAttendees, isTeamEvent, generateMeetingLink, meetingProvider, scheduleType }: { 
  maxAttendees: number; 
  isTeamEvent: boolean; 
  generateMeetingLink: boolean;
  meetingProvider: string;
  scheduleType: 'flexible' | 'one_time';
}) => {
  const isOneOnOne = maxAttendees === 1 && !isTeamEvent;
  const isGroupEvent = maxAttendees > 1 || isTeamEvent;
  const providerLabel = MEETING_PROVIDERS.find(p => p.value === meetingProvider)?.label || meetingProvider;

  return (
    <Card className={cn(
      "border-2 overflow-hidden",
      isOneOnOne ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50" : 
      scheduleType === 'one_time' ? "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50" :
      "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "rounded-full p-2",
            isOneOnOne ? "bg-blue-100" : 
            scheduleType === 'one_time' ? "bg-purple-100" : "bg-green-100"
          )}>
            {isOneOnOne ? (
              <User className="h-5 w-5 text-blue-600" />
            ) : scheduleType === 'one_time' ? (
              <CalendarCheck2 className="h-5 w-5 text-purple-600" />
            ) : (
              <CalendarDays className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={cn(
              "font-semibold text-sm mb-2",
              isOneOnOne ? "text-blue-900" : 
              scheduleType === 'one_time' ? "text-purple-900" : "text-green-900"
            )}>
              {isOneOnOne ? "👤 For 1:1 Meetings" : 
               scheduleType === 'one_time' ? "📅 One-Time Event" : 
               "📆 Flexible Group Event"}
            </h4>
            
            {isOneOnOne ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Guest Picks Their Own Time</p>
                    <p className="text-xs text-blue-600">Guests can choose any available time from your calendar. Each booking gets its own unique meeting link.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Video className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Unique Links per Booking</p>
                    <p className="text-xs text-blue-600">Each guest receives their own secure meeting link. Perfect for privacy.</p>
                  </div>
                </div>

                {generateMeetingLink && (
                  <div className="mt-2 p-2 bg-blue-100/50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>🔔 How it works:</strong> When a guest books, we'll automatically generate a unique {providerLabel} link just for them.
                    </p>
                  </div>
                )}
              </div>
            ) : scheduleType === 'one_time' ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <CalendarCheck2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800">Fixed Date & Time</p>
                    <p className="text-xs text-purple-600">You've set a specific date and time (e.g., Feb 23, 2026, 7-10 AM). Guests can only book this exact slot.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Clock9 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800">Perfect for Scheduled Classes</p>
                    <p className="text-xs text-purple-600">Great for workshops, webinars, or lessons that happen at a specific time. All attendees join together.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Link2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800">Single Link for Everyone</p>
                    <p className="text-xs text-purple-600">All attendees use the same meeting link - perfect for group sessions.</p>
                  </div>
                </div>

                {generateMeetingLink && (
                  <div className="mt-2 p-2 bg-purple-100/50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700">
                      <strong>🔔 How it works:</strong> When guests book, we'll give them the same permanent {providerLabel} link. Great for one-time events.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Flexible Group Booking</p>
                    <p className="text-xs text-green-600">Guests can pick from your available time slots, but all use the same meeting link.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Link2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Single Link for Everyone</p>
                    <p className="text-xs text-green-600">Perfect for team meetings where multiple people join the same call.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick comparison table */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-[10px] font-medium text-gray-500 mb-2">Quick Comparison:</p>
          <div className="grid grid-cols-3 gap-1 text-[8px] sm:text-[10px]">
            <div className={cn(
              "p-1 rounded",
              isOneOnOne ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
            )}>
              <p className="font-medium mb-1">1:1 Meetings</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Guest picks time</li>
                <li>• Unique links</li>
                <li>• Private rooms</li>
              </ul>
            </div>
            <div className={cn(
              "p-1 rounded",
              scheduleType === 'one_time' ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
            )}>
              <p className="font-medium mb-1">One-Time</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Fixed time</li>
                <li>• One link for all</li>
                <li>• Perfect for classes</li>
              </ul>
            </div>
            <div className={cn(
              "p-1 rounded",
              scheduleType === 'flexible' && !isOneOnOne ? "bg-green-50 border border-green-200" : "bg-gray-50"
            )}>
              <p className="font-medium mb-1">Flexible</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Guest picks time</li>
                <li>• One link for all</li>
                <li>• Team meetings</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  description,
  progress,
  footer,
  linkTo,
  onClick
}: StatsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const colorClasses = {
    slate: {
      bg: "bg-slate-50 dark:bg-slate-950/30",
      border: "border-slate-200 dark:border-slate-800",
      icon: "bg-slate-500 text-white",
      gradient: "from-slate-500 to-slate-600",
      text: "text-slate-600 dark:text-slate-400",
      progress: "bg-slate-500"
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "bg-blue-500 text-white",
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      progress: "bg-blue-500"
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800",
      icon: "bg-orange-500 text-white",
      gradient: "from-orange-500 to-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      progress: "bg-orange-500"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      icon: "bg-green-500 text-white",
      gradient: "from-green-500 to-green-600",
      text: "text-green-600 dark:text-green-400",
      progress: "bg-green-500"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
      icon: "bg-purple-500 text-white",
      gradient: "from-purple-500 to-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      progress: "bg-purple-500"
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      icon: "bg-red-500 text-white",
      gradient: "from-red-500 to-red-600",
      text: "text-red-600 dark:text-red-400",
      progress: "bg-red-500"
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: "bg-yellow-500 text-white",
      gradient: "from-yellow-500 to-yellow-600",
      text: "text-yellow-600 dark:text-yellow-400",
      progress: "bg-yellow-500"
    }
  };

  const colors = colorClasses[color];
  const Wrapper = linkTo ? Link : onClick ? 'button' : 'div';
  const wrapperProps = linkTo ? { to: linkTo } : onClick ? { onClick } : {};

  return (
    <motion.div
      variants={itemVariants}
      whileHover={!isMobile ? { y: -2 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <Wrapper
        {...wrapperProps}
        className={cn(
          "block rounded-xl border p-4 sm:p-5 transition-all duration-300",
          colors.bg,
          colors.border,
          (onClick || linkTo) && "cursor-pointer active:scale-95 sm:active:scale-100 hover:shadow-lg"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={cn(
              "rounded-lg p-2 sm:p-2.5 shadow-sm transition-transform shrink-0",
              colors.icon,
              isHovered && "scale-110"
            )}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] truncate">{value}</h3>
            </div>
          </div>
          
          {trend && !isMobile && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shrink-0",
              trend.direction === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' :
              trend.direction === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            )}>
              {trend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
              {trend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
              <span>{trend.value}%</span>
              {trend.label && <span className="text-muted-foreground ml-1 hidden sm:inline">{trend.label}</span>}
            </div>
          )}
          
          {trend && isMobile && (
            <Badge variant="outline" className={cn(
              "text-xs",
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-600' : ''
            )}>
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.value}%
            </Badge>
          )}
        </div>

        {description && (
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {progress !== undefined && (
          <div className="mt-3 sm:mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn("font-medium", colors.text)}>{progress}%</span>
            </div>
            <div className="h-1.5 sm:h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", colors.progress)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {footer && (
          <div className="mt-3 sm:mt-4 border-t border-border/50 pt-2 sm:pt-3">
            <p className="text-xs text-muted-foreground">{footer}</p>
          </div>
        )}

        {(onClick || linkTo) && (
          <div className="mt-2 sm:mt-3 flex items-center justify-end">
            <ChevronRight className={cn(
              "h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground transition-transform",
              isHovered && "translate-x-1"
            )} />
          </div>
        )}
      </Wrapper>
    </motion.div>
  );
};

// Helper functions
const getMeetingProviderLabel = (provider: string) => {
  switch(provider) {
    case 'google_meet':
      return 'Google Meet';
    case 'zoom':
      return 'Zoom';
    case 'microsoft_teams':
      return 'Microsoft Teams';
    case 'custom':
      return 'Custom Link';
    default:
      return 'Video Call';
  }
};

const getMeetingProviderIcon = (provider: string) => {
  switch(provider) {
    case 'google_meet':
      return <Video className="h-4 w-4 text-blue-600" />;
    case 'zoom':
      return <Video className="h-4 w-4 text-blue-700" />;
    case 'microsoft_teams':
      return <Video className="h-4 w-4 text-purple-600" />;
    case 'custom':
      return <Link2 className="h-4 w-4 text-gray-600" />;
    default:
      return <Video className="h-4 w-4" />;
  }
};

// Meeting Link Configuration Component
const MeetingLinkConfig = ({ form, setForm, userId }: { form: FormData; setForm: any; userId: string }) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const isOneOnOne = form.max_attendees === 1 && !form.team_event;
  const isGroupEvent = form.max_attendees > 1 || form.team_event;

  const generateMeetingLink = async () => {
    setGenerating(true);
    try {
      // Prepare meeting metadata from event details
      const meetingMetadata = {
        title: form.title || "Meeting Room",
        description: form.description || "Scheduled meeting",
        duration: form.duration,
        hostName: userId,
        eventType: isOneOnOne ? "1-on-1" : "group",
        maxAttendees: form.max_attendees,
        isTeamEvent: form.team_event,
        scheduleType: form.schedule_type,
        oneTimeEvent: form.one_time_event,
        isPermanent: isGroupEvent, // Permanent for group events, unique per booking for 1:1
        conferenceData: {
          ...form.conference_data,
          metadata: {
            eventTitle: form.title,
            eventSlug: form.slug,
            hostJoinFirst: form.host_join_first,
            scheduleType: form.schedule_type,
            oneTimeEvent: form.one_time_event,
            createdAt: new Date().toISOString()
          }
        }
      };

      const { data, error } = await supabase.functions.invoke('create-conference', {
        body: {
          provider: form.meeting_provider,
          title: meetingMetadata.title,
          description: meetingMetadata.description,
          duration: meetingMetadata.duration,
          hostUserId: userId,
          isPermanent: meetingMetadata.isPermanent,
          metadata: meetingMetadata
        }
      });

      if (error) throw error;

      if (data?.meetLink) {
        setForm({ 
          ...form, 
          permanent_meeting_link: data.meetLink,
          conference_data: {
            ...data.conferenceData,
            generatedAt: new Date().toISOString(),
            eventDetails: meetingMetadata,
            isPermanent: isGroupEvent,
            scheduleType: form.schedule_type,
            oneTimeEvent: form.one_time_event
          }
        });
        
        toast({
          title: isGroupEvent ? "✅ Permanent meeting link created" : "✅ Meeting link template created",
          description: isGroupEvent 
            ? `Your ${getMeetingProviderLabel(form.meeting_provider)} link is ready. All attendees will use this link.`
            : `Each booking will get its own unique ${getMeetingProviderLabel(form.meeting_provider)} link.`
        });
      } else if (data?.status === 'coming_soon') {
        toast({
          title: "Coming soon",
          description: data.message,
          variant: "default"
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed to generate link",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const testMeetingLink = () => {
    if (form.permanent_meeting_link) {
      window.open(form.permanent_meeting_link, '_blank');
    }
  };

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RadioTower className="h-4 w-4 text-slate-600" />
          <Label className="text-sm font-medium">Meeting Link Configuration</Label>
        </div>
        <Badge variant="outline" className={cn(
          form.generate_meeting_link ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
        )}>
          {form.generate_meeting_link ? "Auto-generate" : "Manual"}
        </Badge>
      </div>

      {/* Show explanation based on event type */}
      <MeetingLinkExplanation 
        maxAttendees={form.max_attendees} 
        isTeamEvent={form.team_event} 
        generateMeetingLink={form.generate_meeting_link}
        meetingProvider={form.meeting_provider}
        scheduleType={form.schedule_type}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Auto-generate meeting links</span>
          <Switch
            checked={form.generate_meeting_link}
            onCheckedChange={(v) => setForm({ ...form, generate_meeting_link: v })}
          />
        </div>

        {form.generate_meeting_link && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Meeting Provider</Label>
              <Select
                value={form.meeting_provider}
                onValueChange={(v: any) => setForm({ ...form, meeting_provider: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_PROVIDERS.map(provider => {
                    const Icon = provider.icon;
                    return (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", provider.color)} />
                          <span>{provider.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">Host must join first</span>
                <p className="text-[10px] text-muted-foreground">
                  {isOneOnOne 
                    ? "Recommended - ensures you're ready before guest joins" 
                    : "Optional - attendees can wait in lobby"}
                </p>
              </div>
              <Switch
                checked={form.host_join_first}
                onCheckedChange={(v) => setForm({ ...form, host_join_first: v })}
              />
            </div>

            {form.meeting_provider === 'custom' && (
              <div className="space-y-2">
                <Label className="text-xs">Custom Meeting Link</Label>
                <Input
                  value={form.permanent_meeting_link}
                  onChange={(e) => setForm({ ...form, permanent_meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/your-link"
                  className="h-9 text-sm"
                />
                {isGroupEvent && (
                  <p className="text-[10px] text-green-600">
                    This link will be shared with all attendees.
                  </p>
                )}
                {isOneOnOne && (
                  <p className="text-[10px] text-blue-600">
                    This link will be used as a template for generating unique links per booking.
                  </p>
                )}
              </div>
            )}

            {form.meeting_provider !== 'custom' && (
              <div className="space-y-2">
                <Label className="text-xs">
                  {isGroupEvent ? 'Meeting Link' : 'Meeting Link Template'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={form.permanent_meeting_link}
                    onChange={(e) => setForm({ ...form, permanent_meeting_link: e.target.value })}
                    placeholder={isGroupEvent 
                      ? "Click generate to create a meeting link for all attendees" 
                      : "Click generate to create a meeting link template"}
                    className="h-9 text-sm flex-1"
                    readOnly={!form.permanent_meeting_link}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateMeetingLink}
                    disabled={generating || !form.title}
                    className="h-9 gap-1"
                  >
                    {generating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-3 w-3" />
                    )}
                    Generate
                  </Button>
                  {form.permanent_meeting_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testMeetingLink}
                      className="h-9"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {form.permanent_meeting_link && (
              <div className="space-y-2">
                <div className={cn(
                  "flex items-center gap-2 text-xs p-2 rounded",
                  isGroupEvent ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                )}>
                  {isGroupEvent ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="flex-1 truncate">
                    {isGroupEvent 
                      ? "All attendees will use this link" 
                      : "Each booking gets a unique link"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      navigator.clipboard.writeText(form.permanent_meeting_link);
                      toast({ title: "Copied!", description: "Meeting link copied to clipboard" });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Show metadata preview */}
                {form.conference_data && (
                  <div className="text-xs bg-white p-2 rounded border space-y-1">
                    <p className="font-medium text-slate-700 mb-1">Meeting details:</p>
                    <p className="text-muted-foreground">• Title: {form.title}</p>
                    <p className="text-muted-foreground">• Duration: {form.duration} minutes</p>
                    <p className="text-muted-foreground">• Type: {isGroupEvent ? 'Group Event' : '1:1 Meeting'}</p>
                    <p className="text-muted-foreground">• Schedule: {form.schedule_type === 'one_time' ? 'One-Time' : 'Flexible'}</p>
                    {form.one_time_event && (
                      <p className="text-muted-foreground text-[8px]">
                        • Date: {new Date(form.one_time_event.date).toLocaleDateString()} {form.one_time_event.start_time}-{form.one_time_event.end_time}
                      </p>
                    )}
                    {form.host_join_first && (
                      <p className="text-muted-foreground">• Host must join first</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!form.generate_meeting_link && (
          <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <Info className="h-3 w-3 mt-0.5" />
            <span>
              Manual mode: You'll provide your own meeting link or location details. 
              {isGroupEvent 
                ? " Make sure your link can accommodate multiple attendees."
                : " Great for using your personal meeting room."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Guide Card Component
const GuideCard = ({ icon: Icon, title, steps, color = "blue" }: any) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700"
  };

  return (
    <Card className={cn("border-0 shadow-sm", colorClasses[color])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-sm">
          {steps.map((step: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

// Mobile Bottom Navigation
const MobileBottomNav = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Events</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Users className="h-5 w-5" />
          <span className="text-xs">Team</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative">
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            3
          </div>
          <Bell className="h-5 w-5" />
          <span className="text-xs">Alerts</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs">Menu</span>
        </Button>
      </div>
      
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg p-2 mx-2 shadow-lg"
          >
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/events">
                  <Zap className="h-4 w-4" />
                  Events
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/team">
                  <Users className="h-4 w-4" />
                  Team
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/analytics">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/settings">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// GOOGLE CALENDAR CONNECTION COMPONENT
// ============================================

function CalendarConnection({ userId }: { userId: string }) {
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
        .from('user_calendar_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'google')
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
      const { data, error } = await supabase.functions.invoke('get-google-oauth-url', {
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
        .from('user_calendar_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'google');

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
          <div className={cn(
            "p-3 sm:p-4 rounded-2xl",
            isConnected ? "bg-green-100" : "bg-slate-100"
          )}>
            <Calendar className={cn(
              "h-6 w-6 sm:h-8 sm:w-8",
              isConnected ? "text-green-600" : "text-slate-600"
            )} />
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
                  <span className="text-xs sm:text-sm">Connected as {tokenInfo?.email || 'your account'}</span>
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

// ============================================
// TABLE VIEW COMPONENT
// ============================================

function TableView({ events, bookingCounts, onCopy, onEdit, onDuplicate, onToggle, onDelete }: any) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-xs sm:text-sm">Event</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Type</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Duration</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Location</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Meeting</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Price</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Attendees</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Status</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Bookings</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event: EventType & { permanent_meeting_link?: string; schedule_type?: string; one_time_event?: any }) => {
            const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
            const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
            const bookingCount = bookingCounts?.[event.id] || 0;
            const ProviderIcon = MEETING_PROVIDERS.find(p => p.value === event.meeting_provider)?.icon || Video;
            const isOneOnOne = event.max_attendees === 1 && !event.team_event;
            
            return (
              <TableRow key={event.id} className={cn(!event.is_active && "opacity-60")}>
                <TableCell>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{event.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">/{event.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {event.schedule_type === 'one_time' ? (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                      <CalendarCheck2 className="h-2.5 w-2.5 mr-1" />
                      One-Time
                    </Badge>
                  ) : isOneOnOne ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                      <User className="h-2.5 w-2.5 mr-1" />
                      1:1
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                      <Users className="h-2.5 w-2.5 mr-1" />
                      Flexible
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {event.duration}min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <LocationIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span className="text-[10px] sm:text-sm capitalize truncate max-w-[80px] sm:max-w-none">
                      {event.location_type === "in_person" ? "In person" : event.location_type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {event.generate_meeting_link ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <ProviderIcon className={cn(
                              "h-3 w-3",
                              event.meeting_provider === 'google_meet' ? "text-blue-600" :
                              event.meeting_provider === 'zoom' ? "text-blue-700" :
                              event.meeting_provider === 'microsoft_teams' ? "text-purple-600" : "text-gray-600"
                            )} />
                            <span className="text-[10px] sm:text-xs">
                              {MEETING_PROVIDERS.find(p => p.value === event.meeting_provider)?.label.split(' ')[0]}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {isOneOnOne 
                              ? "Unique links per booking" 
                              : "Same link for all attendees"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Manual</span>
                  )}
                </TableCell>
                <TableCell>
                  {(event.price_cents ?? 0) > 0 ? (
                    <span className="text-[10px] sm:text-sm font-medium text-amber-600">
                      {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-sm text-muted-foreground">Free</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                    <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {event.min_attendees}-{event.max_attendees}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={cn(
                      "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                      event.is_active ? "bg-green-500" : "bg-slate-300"
                    )} />
                    <span className="text-[10px] sm:text-sm">
                      {event.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={bookingCount > 0 ? "default" : "secondary"} 
                    className={cn("text-[10px] sm:text-xs px-1.5 py-0.5", bookingCount > 0 && "bg-slate-900")}>
                    {bookingCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8" onClick={() => onCopy(event.slug)}>
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Copy link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                          <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 sm:w-40">
                        <DropdownMenuItem onClick={() => onEdit(event)} className="text-xs sm:text-sm">
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(event)} className="text-xs sm:text-sm">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onToggle(event)} className="text-xs sm:text-sm">
                          {event.is_active ? (
                            <><EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Deactivate</>
                          ) : (
                            <><Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-red-600 text-xs sm:text-sm">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Delete
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
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Get booking counts
  const eventTypeIds = events?.map(e => e.id) || [];
  const { data: bookingCounts, isLoading: countsLoading } = useEventTypesBookingCounts(eventTypeIds);

  // UI State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("0");
  const [showGuide, setShowGuide] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [activeTab, setActiveTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Multi-attendee state
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; email: string; full_name?: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const userId = user?.id;

  // Load available users
  useEffect(() => {
    if (form.team_event) {
      loadUsers();
    }
  }, [form.team_event]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .limit(20);

      if (error) throw error;
      
      setAvailableUsers(data.map(p => ({
        id: p.user_id,
        email: p.email || '',
        full_name: p.full_name
      })));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Update duration when one_time_event changes
  useEffect(() => {
    if (form.one_time_event) {
      const { start_time, end_time } = form.one_time_event;
      const [startHour, startMin] = start_time.split(':').map(Number);
      const [endHour, endMin] = end_time.split(':').map(Number);
      
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;
      const duration = endTotal - startTotal;
      
      if (duration > 0) {
        setForm(f => ({ ...f, duration }));
      }
    }
  }, [form.one_time_event]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    let filtered = [...events];
    
    if (filterStatus === "active") {
      filtered = filtered.filter(e => e.is_active);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(e => !e.is_active);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.slug.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return filtered;
  }, [events, filterStatus, searchQuery]);

  // Statistics with dashboard-style formatting
  const stats = useMemo(() => {
    if (!events) return { 
      total: 0, 
      active: 0, 
      totalBookings: 0,
      totalRevenue: 0,
      avgDuration: 0,
      mostBooked: 'None',
      conversionRate: 0,
      popularTime: '9-11 AM',
      teamEvents: 0,
      autoMeetingEvents: 0,
      groupEvents: 0,
      oneOnOneEvents: 0,
      oneTimeEvents: 0
    };

    const total = events.length;
    const active = events.filter(e => e.is_active).length;
    const totalBookings = Object.values(bookingCounts || {}).reduce((sum, count) => sum + count, 0);
    const totalRevenue = events.reduce((sum, event) => {
      const count = bookingCounts?.[event.id] || 0;
      const price = (event.price_cents || 0) / 100;
      return sum + (count * price);
    }, 0);
    const avgDuration = Math.round(events.reduce((sum, e) => sum + e.duration, 0) / events.length);
    const teamEvents = events.filter(e => e.team_event).length;
    const autoMeetingEvents = events.filter(e => e.generate_meeting_link).length;
    const groupEvents = events.filter(e => e.max_attendees > 1).length;
    const oneOnOneEvents = events.filter(e => e.max_attendees === 1 && !e.team_event).length;
    const oneTimeEvents = events.filter(e => e.schedule_type === 'one_time').length;
    
    let maxBookings = 0;
    let mostBooked = 'None';
    events.forEach(event => {
      const count = bookingCounts?.[event.id] || 0;
      if (count > maxBookings) {
        maxBookings = count;
        mostBooked = event.title;
      }
    });

    const conversionRate = total > 0 ? Math.round((totalBookings / total) * 10) / 10 : 0;

    return {
      total,
      active,
      totalBookings,
      totalRevenue,
      avgDuration,
      mostBooked,
      conversionRate,
      popularTime: '9-11 AM',
      teamEvents,
      autoMeetingEvents,
      groupEvents,
      oneOnOneEvents,
      oneTimeEvents
    };
  }, [events, bookingCounts]);

  // Event Handlers
  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setPriceInput("0");
    setShowAdvanced(false);
    setTeamMembers([]);
    setCustomFields([]);
    setDialogOpen(true);
  };

  const openEdit = (e: EventType & { permanent_meeting_link?: string; meeting_provider?: string; generate_meeting_link?: boolean; schedule_type?: string; one_time_event?: any }) => {
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
      
      max_attendees: e.max_attendees,
      min_attendees: e.min_attendees,
      allow_additional_guests: e.allow_additional_guests || false,
      guests_can_invite_others: e.guests_can_invite_others || false,
      require_approval: e.require_approval || false,
      team_event: e.team_event || false,
      waiting_list_enabled: e.waiting_list_enabled || false,
      reminder_settings: e.reminder_settings || defaultForm.reminder_settings,
      custom_fields: e.custom_fields || [],
      payment_required_per_attendee: e.payment_required_per_attendee || false,
      booking_confirmation_message: e.booking_confirmation_message || "",
      cancellation_policy: e.cancellation_policy || "",
      show_attendees_to_guests: e.show_attendees_to_guests || true,
      
      schedule_type: e.schedule_type || 'flexible',
      one_time_event: e.one_time_event || null,
      
      permanent_meeting_link: e.permanent_meeting_link || "",
      generate_meeting_link: e.generate_meeting_link ?? true,
      meeting_provider: e.meeting_provider || 'google_meet',
      host_join_first: e.host_join_first ?? true,
      conference_data: e.conference_data || null,
    });
    setPriceInput(price.toFixed(2));
    setCustomFields(e.custom_fields || []);
    setTeamMembers(e.team_members?.map(m => ({
      user_id: m.user_id,
      role: m.role,
      is_required: m.is_required
    })) || []);
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

    if (form.min_attendees > form.max_attendees) {
      toast({
        title: "Invalid attendee limits",
        description: "Minimum attendees cannot exceed maximum attendees",
        variant: "destructive"
      });
      return;
    }

    // Validate one-time event data
    if (form.schedule_type === 'one_time' && !form.one_time_event) {
      toast({
        title: "Missing event details",
        description: "Please set the date and time for your one-time event",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const eventData = {
        ...form,
        custom_fields: customFields,
        team_members: teamMembers.length > 0 ? teamMembers : undefined
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...eventData });
        toast({ 
          title: "✅ Event Updated", 
          description: "Your event type has been updated successfully." 
        });
      } else {
        await createMutation.mutateAsync({ ...eventData, user_id: user!.id });
        toast({ 
          title: "✅ Event Created", 
          description: "Your new event type is ready to accept bookings." 
        });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ 
        title: "Event Deleted", 
        description: "Event type has been removed." 
      });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const toggleActive = async (e: EventType) => {
    await updateMutation.mutateAsync({ id: e.id, is_active: !e.is_active });
    toast({
      title: !e.is_active ? "Event Activated" : "Event Deactivated",
    });
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/${userId}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ 
      title: "Link Copied", 
      description: "Booking link copied to clipboard." 
    });
  };

  const duplicateEvent = async (e: EventType) => {
    await createMutation.mutateAsync({
      ...e,
      title: `${e.title} (Copy)`,
      slug: `${e.slug}-copy`,
      user_id: user!.id,
      is_active: false
    });
    toast({ 
      title: "Event Duplicated", 
      description: "A copy has been created (inactive by default)." 
    });
  };

  const handlePriceChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPriceInput(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setForm(f => ({ ...f, price_cents: Math.round(numValue * 100) }));
      }
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { name: `field_${customFields.length + 1}`, label: '', type: 'text', required: false }
    ]);
  };

  const updateCustomField = (index: number, updates: Partial<CustomField>) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    if (updates.label) {
      newFields[index].name = slugify(updates.label);
    }
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { user_id: '', role: 'host', is_required: true }]);
  };

  const updateTeamMember = (index: number, updates: Partial<TeamMemberForm>) => {
    const newMembers = [...teamMembers];
    newMembers[index] = { ...newMembers[index], ...updates };
    setTeamMembers(newMembers);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  if (isLoading || countsLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-6 sm:space-y-8 lg:space-y-10 p-3 sm:p-4 lg:p-6 pb-20 md:pb-6"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-4 sm:p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-black/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
                <div className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-white/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Event Management
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-['Space_Grotesk']">
                  Create & manage your events
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-xl">
                  Set up different ways people can book time with you. From 1:1 calls to one-time events like "Feb 23, 7-10 AM Class".
                  Auto-generate meeting links for seamless video calls.
                </p>
                
                <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <div className="flex -space-x-1 sm:-space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/20 border-2 border-white/10 flex items-center justify-center text-white text-[10px] sm:text-xs">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/60">Trusted by 1,000+ teams</p>
                </div>
              </div>
              
              <Button 
                onClick={openCreate} 
                size={isMobile ? "default" : "lg"}
                className="bg-white text-slate-900 hover:bg-white/90 shadow-xl gap-1 sm:gap-2 px-4 sm:px-6 w-full sm:w-auto text-sm"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Create New Event
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Dashboard-style Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="Total Events"
            value={stats.total}
            icon={Calendar}
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            description={`${stats.active} active · ${stats.total - stats.active} inactive`}
            color="blue"
            progress={Math.round((stats.active / (stats.total || 1)) * 100)}
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Users}
            trend={{ value: 8, direction: 'up', label: 'this month' }}
            description={`Avg ${stats.conversionRate} per event`}
            color="orange"
          />
          <StatsCard
            title="Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 23, direction: 'up', label: 'this quarter' }}
            description="From paid events"
            color="green"
          />
          <StatsCard
            title="One-Time Events"
            value={stats.oneTimeEvents}
            icon={CalendarCheck2}
            trend={{ value: 5, direction: 'up', label: 'new' }}
            description={`${stats.oneTimeEvents} fixed date events`}
            color="purple"
          />
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-amber-100 p-1.5 sm:p-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Duration</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.avgDuration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Most Booked</p>
                  <p className="text-sm sm:text-base font-semibold truncate max-w-[100px]">{stats.mostBooked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Peak Time</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.popularTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-purple-100 p-1.5 sm:p-2">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Conversion</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.conversionRate}/event</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Guide Section */}
        {showGuide && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-slate-50 to-white border p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-900 p-1.5 sm:p-2">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">Quick Start Guide</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowGuide(false)} className="h-7 w-7 sm:h-8 sm:w-8">
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <GuideCard
                icon={Zap}
                title="1. Create an Event"
                color="blue"
                steps={[
                  "Click 'Create New Event' button",
                  "Give it a clear title (e.g., 'Math Class Feb 23')",
                  "Choose event type: 1:1, One-Time, or Flexible",
                  "Add description if needed"
                ]}
              />
              <GuideCard
                icon={Settings2}
                title="2. Configure Settings"
                color="amber"
                steps={[
                  "Set attendee limits",
                  "For one-time: pick date & time (e.g., Feb 23, 7-10 AM)",
                  "Configure meeting links (auto-generate or custom)",
                  "Set price if it's a paid event"
                ]}
              />
              <GuideCard
                icon={Share2}
                title="3. Share & Manage"
                color="green"
                steps={[
                  "Copy your booking link",
                  "Share via email, website, or social",
                  "Track bookings in dashboard",
                  "Edit or duplicate as needed"
                ]}
              />
            </div>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <CalendarCheck2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800">Pro Tip: One-Time Events</p>
                  <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5 sm:mt-1">
                    <strong>Perfect for:</strong> Single classes, workshops, webinars at specific times. 
                    Just set the date (e.g., Feb 23, 2026) and time range (7-10 AM). Duration is auto-calculated.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-full sm:w-auto min-w-[300px] sm:min-w-0">
              <TabsTrigger value="events" className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                My Events
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                <CalendarRange className="h-3 w-3 sm:h-4 sm:w-4" />
                Calendar Sync
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="mt-4 sm:mt-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64 lg:w-72">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 text-sm">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({stats.total})</SelectItem>
                    <SelectItem value="active">Active ({stats.active})</SelectItem>
                    <SelectItem value="inactive">Inactive ({stats.total - stats.active})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-background ml-auto sm:ml-0">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => setViewMode("table")}
                    disabled={isMobile}
                  >
                    <TableIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Events Display */}
            {filteredEvents.length === 0 ? (
              <Card className="text-center py-12 sm:py-16 border-2 border-dashed">
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-slate-200 rounded-full blur-3xl" />
                    <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 relative" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold">No events found</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      {searchQuery 
                        ? "No events match your search. Try different keywords."
                        : filterStatus !== "all" 
                        ? `You don't have any ${filterStatus} events.` 
                        : "Create your first event to start accepting bookings."}
                    </p>
                  </div>
                  <Button onClick={openCreate} size={isMobile ? "default" : "lg"} className="gap-2 bg-slate-900 hover:bg-slate-800 text-sm">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Create Your First Event
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredEvents.map((event) => {
                      const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
                      const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
                      const bookingCount = bookingCounts?.[event.id] || 0;
                      const ProviderIcon = MEETING_PROVIDERS.find(p => p.value === event.meeting_provider)?.icon || Video;
                      const isOneOnOne = event.max_attendees === 1 && !event.team_event;
                      
                      return (
                        <Card key={event.id} className={cn(
                          "group relative overflow-hidden transition-all hover:shadow-lg border-t-4",
                          !event.is_active && "opacity-70"
                        )} style={{ borderTopColor: event.color }}>
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                                  <h3 className="font-semibold text-sm sm:text-lg truncate">{event.title}</h3>
                                </div>
                                <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">/{event.slug}</p>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36 sm:w-40">
                                  <DropdownMenuItem onClick={() => copyLink(event.slug)} className="text-xs sm:text-sm">
                                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Copy link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEdit(event)} className="text-xs sm:text-sm">
                                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicateEvent(event)} className="text-xs sm:text-sm">
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => toggleActive(event)} className="text-xs sm:text-sm">
                                    {event.is_active ? (
                                      <><EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Deactivate</>
                                    ) : (
                                      <><Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Activate</>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-red-600 text-xs sm:text-sm">
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {event.description && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                              <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {event.duration}min
                              </Badge>
                              <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                                <LocationIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 
                                <span className="capitalize">{event.location_type === "in_person" ? "In person" : event.location_type}</span>
                              </Badge>
                              {event.generate_meeting_link && (
                                <Badge variant="secondary" className={cn(
                                  "gap-1 text-[10px] sm:text-xs px-1.5 py-0.5",
                                  event.meeting_provider === 'google_meet' ? "bg-blue-100 text-blue-700" :
                                  event.meeting_provider === 'zoom' ? "bg-blue-100 text-blue-700" :
                                  event.meeting_provider === 'microsoft_teams' ? "bg-purple-100 text-purple-700" :
                                  "bg-gray-100 text-gray-700"
                                )}>
                                  <ProviderIcon className="h-2.5 w-2.5" />
                                  {isOneOnOne ? 'Auto-link' : 'Permalink'}
                                </Badge>
                              )}
                              {event.schedule_type === 'one_time' && event.one_time_event && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
                                  <CalendarCheck2 className="h-2.5 w-2.5" />
                                  {new Date(event.one_time_event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Badge>
                              )}
                              {(event.price_cents ?? 0) > 0 && (
                                <Badge variant="secondary" className="gap-1 bg-amber-100 text-[10px] sm:text-xs px-1.5 py-0.5">
                                  <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 
                                  {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                                </Badge>
                              )}
                              {event.max_attendees > 1 && (
                                <Badge variant="secondary" className="gap-1 bg-blue-100 text-[10px] sm:text-xs px-1.5 py-0.5">
                                  <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  Up to {event.max_attendees}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className={cn(
                                  "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                                  event.is_active ? "bg-green-500" : "bg-slate-300"
                                )} />
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {event.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant={bookingCount > 0 ? "default" : "outline"} 
                                      className={cn("cursor-help text-[10px] sm:text-xs px-1.5 py-0.5", bookingCount > 0 && "bg-slate-900")}>
                                      <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                      {bookingCount}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-[10px] sm:text-xs">{bookingCount} total bookings</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Create Card */}
                    <Card 
                      onClick={openCreate} 
                      className="cursor-pointer border-2 border-dashed hover:border-slate-900 hover:bg-slate-50 transition-all"
                    >
                      <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center min-h-[250px] sm:min-h-[300px]">
                        <div className="rounded-full bg-slate-100 p-3 sm:p-4 mb-3 sm:mb-4">
                          <Plus className="h-5 w-5 sm:h-8 sm:w-8 text-slate-600" />
                        </div>
                        <h3 className="font-semibold text-sm sm:text-lg text-slate-900 mb-1 sm:mb-2">Create New Event</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground max-w-[150px] sm:max-w-[200px]">
                          Add another way for people to book time with you
                        </p>
                        <Badge variant="outline" className="mt-3 sm:mt-4 text-[10px] sm:text-xs">
                          {stats.total} total · {stats.active} active
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              {userId && <CalendarConnection userId={userId} />}
              
              <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="rounded-lg bg-slate-100 p-2 sm:p-3">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-lg mb-1">Why sync your calendar?</h3>
                      <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-sm text-muted-foreground">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>Prevent double-booking - automatically blocks busy times</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>Generate Google Meet links for every video call</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>Send calendar invites to guests with all details</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>See all your meetings in one place</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.totalBookings}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">${stats.totalRevenue.toFixed(0)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.avgDuration}min</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Duration</p>
          </div>
        </motion.div>

        {/* Attribution */}
        <motion.div variants={itemVariants} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 sm:px-4 py-2 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>System healthy</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span>Synced just now</span>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-[10px] sm:text-xs">
              <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              Refresh
            </Button>
          </div>
          <div className="text-[8px] sm:text-[10px] text-muted-foreground/60">
            <a 
              href="https://pasbestventures.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              Pasbest Ventures Limited
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile ? "w-full h-full max-h-full rounded-none" : "max-w-4xl lg:max-w-5xl"
        )}>
          <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white sticky top-0 z-50">
            <DialogHeader className="p-0">
              <DialogTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-slate-100 p-1 sm:p-1.5">
                  {editingId ? <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />}
                </div>
                {editingId ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} className="h-7 w-7 sm:h-8 sm:w-8">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(90vh-120px)]">
            <div className="space-y-6 sm:space-y-8">
              {/* Progress Steps - Hide on mobile */}
              {!isMobile && (
                <div className="flex items-center justify-between">
                  {[1,2,3,4,5].map((step) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                        step === 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {step}
                      </div>
                      {step < 5 && <div className="flex-1 h-0.5 mx-2 bg-slate-200" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: Basic Info */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">1</span>
                  Basic Information
                </h3>
                
                <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Event Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
                      }}
                      placeholder="e.g., Math Class Feb 23 or 30-min Call"
                      className="h-9 sm:h-11 text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Choose a clear, descriptive name for your event
                    </p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">URL Slug <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <span className="text-[10px] sm:text-xs text-muted-foreground bg-slate-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-md sm:rounded-l-md sm:rounded-tr-none border border-b-0 sm:border-r-0 w-full sm:w-auto">
                        {window.location.origin}/{userId ? truncateUserId(userId) : 'user'}/
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                        placeholder="math-class-feb-23"
                        className="rounded-b-md sm:rounded-l-none sm:rounded-r-md h-9 sm:h-11 text-sm w-full"
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      This will be your booking link. Use hyphens instead of spaces.
                    </p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of what this meeting is about..."
                      rows={isMobile ? 2 : 3}
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 2: Event Type & Schedule */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">2</span>
                  Event Type & Schedule
                </h3>
                
                <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Schedule Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {EVENT_SCHEDULE_TYPES.map(type => {
                        const Icon = type.icon;
                        const isSelected = form.schedule_type === type.value;
                        return (
                          <div
                            key={type.value}
                            className={cn(
                              "cursor-pointer rounded-lg border p-3 transition-all",
                              isSelected 
                                ? type.value === 'one_time' 
                                  ? "border-purple-500 bg-purple-50" 
                                  : type.value === 'flexible'
                                    ? form.max_attendees === 1 ? "border-blue-500 bg-blue-50" : "border-green-500 bg-green-50"
                                    : "border-slate-500 bg-slate-50"
                                : "border-slate-200 hover:border-slate-300"
                            )}
                            onClick={() => setForm(f => ({ ...f, schedule_type: type.value as 'flexible' | 'one_time' }))}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={cn(
                                "h-4 w-4",
                                isSelected 
                                  ? type.value === 'one_time' ? "text-purple-600" : type.value === 'flexible' ? (form.max_attendees === 1 ? "text-blue-600" : "text-green-600") : "text-slate-600"
                                  : "text-slate-400"
                              )} />
                              <span className={cn(
                                "text-xs font-medium",
                                isSelected 
                                  ? type.value === 'one_time' ? "text-purple-900" : type.value === 'flexible' ? (form.max_attendees === 1 ? "text-blue-900" : "text-green-900") : "text-slate-900"
                                  : "text-slate-600"
                              )}>
                                {type.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{type.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* One-Time Event Input */}
                  {form.schedule_type === 'one_time' && (
                    <OneTimeEventInput 
                      value={form.one_time_event} 
                      onChange={(data) => setForm(f => ({ ...f, one_time_event: data }))}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Step 3: Meeting Details */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">3</span>
                  Meeting Details
                </h3>
                
                <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Location Type</Label>
                      <Select value={form.location_type} onValueChange={(v) => setForm(f => ({ ...f, location_type: v }))}>
                        <SelectTrigger className="h-9 sm:h-11 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_OPTIONS.map(l => (
                            <SelectItem key={l.value} value={l.value}>
                              <div className="flex items-center gap-2">
                                <l.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">{l.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Location Details</Label>
                      <Input
                        value={form.location_details}
                        onChange={(e) => setForm(f => ({ ...f, location_details: e.target.value }))}
                        placeholder={form.location_type === 'video' ? "Meeting link will be auto-generated" : "Add meeting address or phone number"}
                        className="h-9 sm:h-11 text-sm"
                        disabled={form.location_type === 'video' && form.generate_meeting_link}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 4: Attendee Settings */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">4</span>
                  Attendee Settings
                </h3>
                
                <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Min Attendees</Label>
                      <Input
                        type="number"
                        min={1}
                        max={form.max_attendees}
                        value={form.min_attendees}
                        onChange={(e) => setForm(f => ({ ...f, min_attendees: parseInt(e.target.value) || 1 }))}
                        className="h-9 sm:h-11 text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Minimum people required for this event
                      </p>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Max Attendees</Label>
                      <Input
                        type="number"
                        min={form.min_attendees}
                        max={100}
                        value={form.max_attendees}
                        onChange={(e) => setForm(f => ({ ...f, max_attendees: parseInt(e.target.value) || 1 }))}
                        className="h-9 sm:h-11 text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {form.max_attendees === 1 ? "1:1 meeting" : `Group event (max ${form.max_attendees} people)`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 bg-slate-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Allow Additional Guests</Label>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Let primary guest add more people</p>
                      </div>
                      <Switch
                        checked={form.allow_additional_guests}
                        onCheckedChange={(v) => setForm(f => ({ ...f, allow_additional_guests: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Require Approval</Label>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Manually approve bookings</p>
                      </div>
                      <Switch
                        checked={form.require_approval}
                        onCheckedChange={(v) => setForm(f => ({ ...f, require_approval: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Team Event</Label>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Multiple hosts can be assigned</p>
                      </div>
                      <Switch
                        checked={form.team_event}
                        onCheckedChange={(v) => setForm(f => ({ ...f, team_event: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Waiting List</Label>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Allow people to join when fully booked</p>
                      </div>
                      <Switch
                        checked={form.waiting_list_enabled}
                        onCheckedChange={(v) => setForm(f => ({ ...f, waiting_list_enabled: v }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 5: Meeting Link Configuration */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">5</span>
                  Meeting Link Configuration
                </h3>
                
                <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
                  <MeetingLinkConfig form={form} setForm={setForm} userId={userId || ''} />
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 w-full justify-center py-2 sm:py-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Settings2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  {showAdvanced ? "Hide" : "Show"} advanced options
                  <ChevronDown className={cn("h-3 w-3 sm:h-4 sm:w-4 transition-transform", showAdvanced && "rotate-180")} />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
                    {/* Buffer Times */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Buffer before (minutes)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={form.buffer_before}
                          onChange={(e) => setForm(f => ({ ...f, buffer_before: Number(e.target.value) }))}
                          className="h-9 sm:h-11 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Buffer after (minutes)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={form.buffer_after}
                          onChange={(e) => setForm(f => ({ ...f, buffer_after: Number(e.target.value) }))}
                          className="h-9 sm:h-11 text-sm"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            value={priceInput}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            onBlur={() => {
                              if (priceInput === "" || priceInput === ".") {
                                setPriceInput("0");
                                setForm(f => ({ ...f, price_cents: 0 }));
                              } else {
                                const numValue = parseFloat(priceInput);
                                if (!isNaN(numValue)) {
                                  setPriceInput(numValue.toFixed(2));
                                }
                              }
                            }}
                            className="pl-7 sm:pl-9 h-9 sm:h-11 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Currency</Label>
                        <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                          <SelectTrigger className="h-9 sm:h-11 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <span className="mr-1 sm:mr-2">{c.flag}</span>
                                <span className="text-xs sm:text-sm">{c.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Reminders */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Reminders</Label>
                      <div className="space-y-2 sm:space-y-3 bg-slate-50 p-3 sm:p-4 rounded-lg">
                        {REMINDER_OPTIONS.map(reminder => (
                          <div key={reminder.value} className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-sm">{reminder.label}</span>
                            <Switch
                              checked={form.reminder_settings[reminder.value] || false}
                              onCheckedChange={(v) => setForm(f => ({
                                ...f,
                                reminder_settings: { ...f.reminder_settings, [reminder.value]: v }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Theme */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Color theme</Label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {COLOR_OPTIONS.map(c => (
                          <button
                            key={c.value}
                            className={cn(
                              "h-7 w-7 sm:h-10 sm:w-10 rounded-full transition-all hover:scale-110 border-2",
                              form.color === c.value ? "border-slate-900 scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setForm(f => ({ ...f, color: c.value }))}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Event Status</Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {form.is_active 
                        ? "Active - Guests can book this event" 
                        : "Inactive - This event is hidden from booking"}
                    </p>
                  </div>
                  <Switch 
                    checked={form.is_active} 
                    onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-white flex gap-2 sm:gap-3 sticky bottom-0">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-9 sm:h-11 bg-slate-900 hover:bg-slate-800 text-sm"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Saving...</span>
                </>
              ) : (
                editingId ? "Update Event" : "Create Event"
              )}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9 sm:h-11 px-4 sm:px-8 text-sm">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}