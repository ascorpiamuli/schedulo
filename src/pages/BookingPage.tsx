// BookingPage.tsx - Updated to handle all event types properly
import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePublicEventTypeBySlug } from "@/hooks/use-event-types";
import { usePublicProfile } from "@/hooks/use-profiles";
import { usePublicAvailability } from "@/hooks/use-booking";
import { usePublicOverrides } from "@/hooks/use-booking";
import { useExistingBookings } from "@/hooks/use-booking";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, MapPin, DollarSign, 
  ArrowRight, Check, 
  User, Mail, FileText, Video, Phone, Building2,
  Loader2, CheckCircle2, XCircle, CalendarOff,
  Sparkles, Users, ChevronLeft, Shield,
  Zap, Globe, Sun, Moon, Copy, ExternalLink, ChevronDown, ChevronUp,
  Star, Clock3, CreditCard, UserPlus, UserMinus, UserCheck,
  UsersRound, PartyPopper, CalendarCheck, CalendarClock, CalendarX,
  Group, Network, Timer, Hourglass, Gauge, Bell, BellRing,
  Settings2, Share2, Link2, RefreshCw, AlertCircle, Info,
  HelpCircle, BookOpen, Gift, Rocket, Target, ThumbsUp,
  Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Wifi, WifiOff,
  UserCog, Users2, CalendarRange, Clock12, Clock9, Clock10, Clock11,
  CalendarCheck2, CalendarDays
} from "lucide-react";
import { format, addMinutes, startOfDay, addDays, isSameDay, isToday, isTomorrow, differenceInMinutes, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Step = "datetime" | "form" | "confirmed";

interface Attendee {
  id?: string;
  name: string;
  email: string;
  role?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[];
}

interface OneTimeEventData {
  date: string;
  start_time: string;
  end_time: string;
}

// ============================================
// BRANDING CONSTANTS
// ============================================
const BRAND = {
  name: "SBPMeet",
  primary: "#1E3A8A",
  secondary: "#C2410C",
  gradient: "from-[#1E3A8A] to-[#C2410C]",
  lightGradient: "from-[#1E3A8A]/10 to-[#C2410C]/5",
  company: "Pasbest Ventures",
  website: "https://pasbestventures.com",
};

// ============================================
// MEETING PROVIDER ICONS
// ============================================
const getMeetingProviderIcon = (provider: string) => {
  switch(provider) {
    case 'google_meet':
      return <Video className="h-4 w-4 text-blue-600" />;
    case 'zoom':
      return <Video className="h-4 w-4 text-blue-700" />;
    case 'microsoft_teams':
      return <Video className="h-4 w-4 text-purple-600" />;
    default:
      return <Link2 className="h-4 w-4 text-gray-600" />;
  }
};

const getMeetingProviderLabel = (provider: string) => {
  switch(provider) {
    case 'google_meet':
      return 'Google Meet';
    case 'zoom':
      return 'Zoom';
    case 'microsoft_teams':
      return 'Microsoft Teams';
    default:
      return 'Video Call';
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getLocationIcon = (type: string) => {
  switch(type) {
    case 'video': return <Video className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />;
    case 'phone': return <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#C2410C]" />;
    case 'in_person': return <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />;
    default: return <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />;
  }
};

const getLocationLabel = (type: string) => {
  switch(type) {
    case 'video': return 'Video Call';
    case 'phone': return 'Phone Call';
    case 'in_person': return 'In Person';
    default: return type;
  }
};

const formatTimeDisplay = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0);
  return format(date, 'h:mm a');
};

const formatDateDisplay = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMMM d");
};

const getTimeOfDay = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const getTimeIcon = (time: string) => {
  const period = getTimeOfDay(time);
  switch(period) {
    case 'morning': return <Sun className="h-3 w-3 text-amber-500" />;
    case 'afternoon': return <Sun className="h-3 w-3 text-[#C2410C]" />;
    case 'evening': return <Moon className="h-3 w-3 text-[#1E3A8A]" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

const formatCurrency = (amount: number, currency: string = 'usd') => {
  const currencies: Record<string, { symbol: string, position: 'before' | 'after' }> = {
    usd: { symbol: '$', position: 'before' },
    eur: { symbol: '€', position: 'before' },
    gbp: { symbol: '£', position: 'before' },
    kes: { symbol: 'KSh ', position: 'before' },
    ngn: { symbol: '₦', position: 'before' }
  };
  
  const currencyInfo = currencies[currency] || currencies.usd;
  const value = (amount / 100).toFixed(2);
  
  return currencyInfo.position === 'before' 
    ? `${currencyInfo.symbol}${value}`
    : `${value}${currencyInfo.symbol}`;
};

// Google Calendar link generator for multiple attendees
function generateGoogleCalendarLink(
  event: any, 
  startTime: Date, 
  endTime: Date, 
  attendees: Attendee[], 
  hostName: string, 
  meetLink?: string
) {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const text = encodeURIComponent(event.title);
  
  // Format attendee list
  const attendeeList = attendees.map(a => `${a.name} (${a.email})`).join('\n');
  
  const details = encodeURIComponent(
    `Meeting with ${hostName}\n\n${event.description || ''}\n\n${meetLink ? `Join via ${getMeetingProviderLabel(event.meeting_provider)}: ${meetLink}` : ''}\n\nAttendees:\n${attendeeList}`
  );
  const location = encodeURIComponent(meetLink || event.location_details || '');
  const dates = `${startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
  
  // Add attendees to calendar invite
  const attendeesParam = attendees.map(a => `&add=${encodeURIComponent(a.email)}`).join('');
  
  return `${baseUrl}&text=${text}&details=${details}&location=${location}&dates=${dates}${attendeesParam}`;
}

// ============================================
// EVENT TYPE EXPLANATION COMPONENTS
// ============================================

const OneTimeEventDisplay = ({ event }: { event: any }) => {
  if (!event.one_time_event) return null;
  
  const eventDate = new Date(`${event.one_time_event.date}T${event.one_time_event.start_time}`);
  const endTime = new Date(`${event.one_time_event.date}T${event.one_time_event.end_time}`);
  
  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-purple-100 p-2">
          <CalendarCheck2 className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-purple-900 mb-2">
            📅 One-Time Event - Fixed Date & Time
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">
                {format(eventDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-purple-800">
                {format(eventDate, "h:mm a")} - {format(endTime, "h:mm a")} ({event.duration} minutes)
              </span>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              This event happens at a specific time. Just confirm your attendance below.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingLinkExplanation = ({ 
  eventType, 
  meetingProvider, 
  hasPermanentLink 
}: { 
  eventType: 'one_on_one' | 'one_time' | 'flexible';
  meetingProvider: string;
  hasPermanentLink: boolean;
}) => {
  const providerLabel = getMeetingProviderLabel(meetingProvider);
  
  const config = {
    one_on_one: {
      bg: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
      icon: User,
      iconColor: "text-blue-600",
      title: "👤 1:1 Meeting - Unique Link",
      description: "You're booking a 1:1 meeting. After confirmation, we'll generate a unique meeting link just for this booking.",
      note: "🔒 Each booking gets its own private room for security and privacy."
    },
    one_time: {
      bg: "bg-purple-50 border-purple-200",
      iconBg: "bg-purple-100",
      icon: CalendarCheck2,
      iconColor: "text-purple-600",
      title: "📅 One-Time Event - Fixed Time",
      description: "This is a scheduled event at a fixed time. All attendees will use the same meeting link to join.",
      note: hasPermanentLink ? "🔗 Permanent link for all attendees" : "📎 Meeting link will be provided"
    },
    flexible: {
      bg: "bg-green-50 border-green-200",
      iconBg: "bg-green-100",
      icon: Users,
      iconColor: "text-green-600",
      title: "👥 Flexible Group Event",
      description: "You can choose a time that works for you. All attendees will use the same meeting link.",
      note: "👥 Perfect for team meetings where multiple people join the same call."
    }
  };

  const { bg, iconBg, icon: Icon, iconColor, title, description, note } = config[eventType];

  return (
    <div className={cn("p-4 rounded-lg border-2 mb-4", bg)}>
      <div className="flex items-start gap-3">
        <div className={cn("rounded-full p-2", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1" style={{ color: iconColor.replace('text-', 'text-') }}>
            {title}
          </h4>
          <p className="text-xs mb-2" style={{ color: iconColor.replace('text-', 'text-').replace('600', '700') }}>
            {description}
          </p>
          {hasPermanentLink && eventType !== 'one_on_one' && (
            <div className="mt-2 p-2 bg-white rounded border" style={{ borderColor: iconColor.replace('text-', 'border-') }}>
              <p className="text-[10px] font-mono truncate" style={{ color: iconColor }}>
                🔗 Permanent link for all attendees
              </p>
            </div>
          )}
          <p className="text-[10px] mt-1" style={{ color: iconColor }}>
            {note}
          </p>
        </div>
      </div>
    </div>
  );
};

// TimeSlot Component
function TimeSlot({ 
  time, 
  selected, 
  onClick, 
  disabled = false,
  availableSpots,
  maxAttendees,
  isTeamSlot = false,
  teamMembers = []
}: { 
  time: string; 
  selected: boolean; 
  onClick: () => void; 
  disabled?: boolean;
  availableSpots?: number;
  maxAttendees?: number;
  isTeamSlot?: boolean;
  teamMembers?: any[];
}) {
  const period = getTimeOfDay(time);
  const isFull = availableSpots === 0;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: disabled || isFull ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isFull ? 1 : 0.98 }}
            className="w-full relative"
          >
            <Button
              variant={selected ? "default" : "outline"}
              onClick={onClick}
              disabled={disabled || isFull}
              className={cn(
                "w-full h-10 sm:h-12 text-xs sm:text-sm font-medium transition-all relative overflow-hidden group",
                selected 
                  ? "bg-[#1E3A8A] text-white shadow-md hover:bg-[#1E3A8A]/90" 
                  : isFull
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/5 hover:text-[#1E3A8A]",
                disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:scale-100",
                isTeamSlot && "border-l-4 border-l-[#C2410C]"
              )}
            >
              <div className="flex items-center gap-2">
                {getTimeIcon(time)}
                <span>{formatTimeDisplay(time)}</span>
                {isTeamSlot && <UsersRound className="h-3 w-3 ml-1" />}
              </div>
              {selected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute inset-0 bg-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Button>
            
            {/* Availability indicator for group bookings */}
            {!isFull && maxAttendees && maxAttendees > 1 && availableSpots !== undefined && (
              <div className="absolute -top-1 -right-1">
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold",
                  availableSpots === maxAttendees ? "bg-green-500" :
                  availableSpots > maxAttendees / 2 ? "bg-yellow-500" :
                  "bg-orange-500"
                )}>
                  {availableSpots}
                </div>
              </div>
            )}
            
            {/* Full indicator */}
            {isFull && (
              <div className="absolute -top-1 -right-1">
                <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <UserX className="h-2 w-2 text-white" />
                </div>
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          {isTeamSlot ? (
            <div className="text-xs">
              <p className="font-medium mb-1">Team Meeting</p>
              {teamMembers.length > 0 && (
                <p>{teamMembers.length} host{teamMembers.length > 1 ? 's' : ''} available</p>
              )}
            </div>
          ) : isFull ? (
            <p>Fully booked</p>
          ) : maxAttendees && maxAttendees > 1 ? (
            <p>{availableSpots} of {maxAttendees} spot{maxAttendees > 1 ? 's' : ''} available</p>
          ) : (
            <p>{getTimeOfDay(time)} slot</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FeatureCard({ icon: Icon, title, description, color = "primary", badge }: { 
  icon: any; 
  title: string; 
  description: string; 
  color?: string;
  badge?: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -2, x: 2 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-[#1E3A8A]/10 hover:border-[#1E3A8A]/30 transition-all shadow-sm hover:shadow group"
    >
      <div className={cn(
        "p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110",
        color === "primary" ? "bg-[#1E3A8A]/10 text-[#1E3A8A]" : "bg-[#C2410C]/10 text-[#C2410C]"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-medium text-[#1E3A8A]">{title}</p>
          {badge && (
            <Badge className="bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/20 text-[8px] px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

function StatBadge({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            whileHover={{ y: -1 }}
            className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-[#1E3A8A]/10 cursor-help"
          >
            <Icon className="h-3 w-3 text-[#1E3A8A]" />
            <span className="text-xs font-medium">{value}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AttendeeInput({ 
  attendee, 
  index, 
  onUpdate, 
  onRemove,
  canRemove,
  isPrimary = false
}: { 
  attendee: Attendee; 
  index: number; 
  onUpdate: (index: number, field: keyof Attendee, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  isPrimary?: boolean;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex gap-2 items-start"
    >
      <div className="flex-1 space-y-2">
        {isPrimary && (
          <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20 text-xs">
            Primary Attendee
          </Badge>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            placeholder="Name"
            value={attendee.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className="h-9 text-sm"
          />
          <Input
            placeholder="Email"
            type="email"
            value={attendee.email}
            onChange={(e) => onUpdate(index, 'email', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-red-500"
          onClick={() => onRemove(index)}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}

function CustomFieldInput({ 
  field, 
  value, 
  onChange 
}: { 
  field: CustomField; 
  value: string; 
  onChange: (value: string) => void;
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          placeholder={`Enter ${field.name.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="resize-none"
          rows={3}
        />
      );
    
    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.id}
            checked={value === 'true'}
            onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
          />
          <Label htmlFor={field.id}>{field.name}</Label>
        </div>
      );
    
    case 'radio':
      return (
        <RadioGroup value={value} onValueChange={onChange}>
          {field.options?.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${option}`} />
              <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    
    default:
      return (
        <Input
          type="text"
          placeholder={`Enter ${field.name.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] rounded-full p-4 shadow-2xl">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground animate-pulse">Preparing your booking experience...</p>
          <p className="text-xs text-muted-foreground/60">with {BRAND.name}</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#C2410C] to-[#C2410C]/60" />
        <CardContent className="py-12 sm:py-16 text-center px-4 sm:px-6">
          <div className="relative mx-auto w-fit mb-6">
            <div className="absolute inset-0 bg-[#C2410C]/20 rounded-full blur-3xl" />
            <div className="relative bg-[#C2410C]/10 rounded-full p-4">
              <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[#C2410C]" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] mb-3 text-[#1E3A8A]">Event Not Found</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-sm mx-auto">
            {message}
          </p>
          <Button asChild size="lg" className="px-8 w-full sm:w-auto bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
            <Link to="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN BOOKING PAGE COMPONENT
// ============================================

export default function BookingPage() {
  const { username, eventSlug } = useParams<{ username: string; eventSlug: string }>();
  const navigate = useNavigate();
  
  const { data: event, isLoading: eventLoading, error: eventError } = usePublicEventTypeBySlug(username, eventSlug);
  const { data: profile, isLoading: profileLoading } = usePublicProfile(username);
  const { data: availability, isLoading: availabilityLoading } = usePublicAvailability(username);
  const { data: overrides } = usePublicOverrides(username);
  
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("datetime");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: '', email: '' }]);
  const [guestNotes, setGuestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [bookingData, setBookingData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [joinWaitingList, setJoinWaitingList] = useState(false);
  const [waitingListEmail, setWaitingListEmail] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [eventMeetingLink, setEventMeetingLink] = useState<string | null>(null);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: existingBookings } = useExistingBookings(username, dateStr);
  
  // Determine event type
  const isOneOnOne = event?.max_attendees === 1 && !event?.team_event && event?.schedule_type !== 'one_time';
  const isOneTimeEvent = event?.schedule_type === 'one_time' && event?.one_time_event;
  const isFlexibleGroup = event?.max_attendees && event.max_attendees > 1 && !event?.one_time_event && !isOneOnOne;
  
  const needsSingleMeetingLink = (isOneTimeEvent || isFlexibleGroup) && event?.generate_meeting_link;

  // Set the date and time for one-time events
  useEffect(() => {
    if (isOneTimeEvent && event?.one_time_event) {
      const eventDate = new Date(`${event.one_time_event.date}T${event.one_time_event.start_time}`);
      setSelectedDate(eventDate);
      setSelectedTime(event.one_time_event.start_time);
    }
  }, [isOneTimeEvent, event]);

  // Fetch or create meeting link for group events
  useEffect(() => {
    if (needsSingleMeetingLink && event && event.permanent_meeting_link) {
      setEventMeetingLink(event.permanent_meeting_link);
    }
  }, [needsSingleMeetingLink, event]);

  // Fetch team members if this is a team event
  useEffect(() => {
    if (event?.team_event) {
      const fetchTeamMembers = async () => {
        const { data } = await supabase
          .from('event_team_members')
          .select(`
            id,
            user_id,
            role,
            is_required,
            profiles:user_id (
              full_name,
              username,
              avatar_url
            )
          `)
          .eq('event_type_id', event.id);
        
        if (data) {
          setTeamMembers(data);
        }
      };
      
      fetchTeamMembers();
    }
  }, [event]);

  // Generate available dates (for flexible events only)
  const availableDates = useMemo(() => {
    if (!availability || !event || isOneTimeEvent) return [];
    
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    const sixtyDays = addDays(today, 60);
    
    let currentDate = today;
    while (currentDate <= sixtyDays) {
      const dayOfWeek = currentDate.getDay();
      const hasSlot = availability.some((a: any) => a.day_of_week === dayOfWeek);
      
      if (hasSlot) {
        const dateString = format(currentDate, "yyyy-MM-dd");
        const override = overrides?.find((o: any) => o.date === dateString);
        if (!override?.is_blocked) {
          dates.push(new Date(currentDate));
        }
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }, [availability, overrides, event, isOneTimeEvent]);

  // Generate time slots with attendee count awareness (for flexible events only)
  const timeSlots = useMemo(() => {
    if (!selectedDate || !availability || !event || isOneTimeEvent) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const daySlots = availability.filter((a: any) => a.day_of_week === dayOfWeek);
    if (daySlots.length === 0) return [];

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const override = overrides?.find((o: any) => o.date === dateString);
    if (override?.is_blocked) return [];

    const slots: any[] = [];
    const duration = event.duration;
    const now = new Date();
    const maxAttendees = event.max_attendees || 1;

    daySlots.forEach((slot: any) => {
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const [endH, endM] = slot.end_time.split(":").map(Number);
      
      let current = new Date(selectedDate);
      current.setHours(startH, startM, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(endH, endM, 0, 0);

      while (addMinutes(current, duration) <= end) {
        if (format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') || current > now) {
          const timeStr = format(current, "HH:mm");
          const slotEnd = addMinutes(current, duration);
          
          // Check for conflicts and count attendees
          const conflictingBookings = existingBookings?.filter((b: any) => {
            const bStart = new Date(b.start_time);
            const bEnd = new Date(b.end_time);
            return current < bEnd && slotEnd > bStart;
          }) || [];
          
          const bookedAttendees = conflictingBookings.reduce((sum: number, b: any) => 
            sum + (b.current_attendees || 1), 0);
          
          const availableSpots = Math.max(0, maxAttendees - bookedAttendees);
          
          if (availableSpots > 0) {
            slots.push({
              time: timeStr,
              availableSpots,
              isTeamSlot: event.team_event,
              conflictingBookings
            });
          }
        }
        current = addMinutes(current, 30);
      }
    });

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, availability, overrides, event, existingBookings, isOneTimeEvent]);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const handleCopyLink = () => {
    if (bookingData?.meeting_link) {
      navigator.clipboard.writeText(bookingData.meeting_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Meeting link copied to clipboard",
      });
    }
  };

  const handleAddAttendee = () => {
    if (attendees.length < (event?.max_attendees || 10)) {
      setAttendees([...attendees, { name: '', email: '' }]);
    }
  };

  const handleRemoveAttendee = (index: number) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index));
    }
  };

  const handleAttendeeUpdate = (index: number, field: keyof Attendee, value: string) => {
    const updated = [...attendees];
    updated[index] = { ...updated[index], [field]: value };
    setAttendees(updated);
  };

  const handleJoinWaitingList = async () => {
    if (!waitingListEmail || !event) return;
    
    try {
      const { error } = await supabase
        .from('booking_waiting_list')
        .insert({
          event_type_id: event.id,
          email: waitingListEmail,
          name: attendees[0]?.name || null,
          preferred_date: selectedDate,
          preferred_time: selectedTime,
          start_time_range_start: selectedDate ? new Date(selectedDate) : null,
          start_time_range_end: selectedDate ? addDays(new Date(selectedDate), 7) : null,
          expires_at: addDays(new Date(), 30)
        });
      
      if (error) throw error;
      
      toast({
        title: "Added to waiting list!",
        description: "We'll notify you when a spot becomes available.",
      });
      
      setJoinWaitingList(false);
    } catch (err: any) {
      toast({
        title: "Failed to join waiting list",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const validateAttendees = () => {
    const validAttendees = attendees.filter(a => a.name.trim() && a.email.trim());
    if (validAttendees.length < (event?.min_attendees || 1)) {
      toast({
        title: "Not enough attendees",
        description: `This event requires at least ${event?.min_attendees} attendee${event?.min_attendees !== 1 ? 's' : ''}.`,
        variant: "destructive"
      });
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const attendee of validAttendees) {
      if (!emailRegex.test(attendee.email)) {
        toast({
          title: "Invalid email",
          description: `Please enter a valid email for ${attendee.name || 'attendee'}.`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  const generateMeetingLink = async (bookingId: string, startTime: Date, endTime: Date) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-conference', {
        body: {
          provider: event?.meeting_provider || 'google_meet',
          title: event?.title || "Meeting",
          description: event?.description || "",
          duration: event?.duration,
          hostUserId: username,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          attendees: attendees.filter(a => a.name && a.email).map(a => ({
            email: a.email,
            name: a.name
          })),
          isPermanent: false, // Always false for 1:1 - unique per booking
          metadata: {
            bookingId,
            eventTitle: event?.title,
            eventSlug: event?.slug,
            hostName: profile?.full_name,
            hostJoinFirst: event?.host_join_first
          }
        }
      });

      if (error) throw error;
      return data?.meetLink;
    } catch (error) {
      console.error('Error generating meeting link:', error);
      return null;
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !event || !profile) {
      toast({ 
        title: "Missing information", 
        description: "Please select a date and time.", 
        variant: "destructive" 
      });
      return;
    }

    if (!validateAttendees()) return;

    setSubmitting(true);
    
    const validAttendees = attendees.filter(a => a.name.trim() && a.email.trim());
    const [h, m] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);
    
    // For one-time events, use the end time from the event
    let endTime;
    if (isOneTimeEvent && event?.one_time_event) {
      const [endH, endM] = event.one_time_event.end_time.split(":").map(Number);
      endTime = new Date(selectedDate);
      endTime.setHours(endH, endM, 0, 0);
    } else {
      endTime = addMinutes(startTime, event.duration);
    }

    try {
      // For group events and one-time events, use the host's permanent link
      // For 1:1 meetings, we'll generate a unique link after booking
      let meetingLink = null;
      
      if ((isFlexibleGroup || isOneTimeEvent) && event.permanent_meeting_link) {
        meetingLink = event.permanent_meeting_link;
      }

      // Insert the main booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          event_type_id: event.id,
          host_user_id: username,
          guest_name: validAttendees[0].name,
          guest_email: validAttendees[0].email,
          guest_notes: guestNotes || null,
          guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: event.require_approval ? "pending" : "confirmed",
          payment_status: (event.price_cents || 0) > 0 ? "pending" : "none",
          payment_amount_cents: event.price_cents || 0,
          max_attendees: event.max_attendees,
          current_attendees: validAttendees.length,
          meeting_link: meetingLink,
          meeting_provider: event.meeting_provider,
          meeting_settings: {
            team_members: selectedTeamMembers,
            custom_fields: customFieldValues,
            meeting_provider: event.meeting_provider,
            host_join_first: event.host_join_first,
            schedule_type: event.schedule_type,
            one_time_event: event.one_time_event
          }
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // For 1:1 meetings, generate a unique link now
      if (isOneOnOne && event.generate_meeting_link) {
        const uniqueLink = await generateMeetingLink(booking.id, startTime, endTime);
        
        if (uniqueLink) {
          // Update the booking with the unique link
          await supabase
            .from("bookings")
            .update({ meeting_link: uniqueLink })
            .eq('id', booking.id);
          
          meetingLink = uniqueLink;
        }
      }

      // Insert all attendees
      if (validAttendees.length > 0) {
        const attendeeInserts = validAttendees.map((attendee, index) => {
          let role: string;
          
          if (index === 0) {
            role = 'attendee'; // Primary booker
          } else {
            role = 'guest'; // Additional guests
          }

          if (selectedTeamMembers.includes(attendee.email)) {
            role = 'co-host';
          }

          return {
            booking_id: booking.id,
            email: attendee.email,
            name: attendee.name,
            role: role,
            status: 'confirmed',
            added_by: profile.user_id
          };
        });

        const { error: attendeesError } = await supabase
          .from('booking_attendees')
          .insert(attendeeInserts);

        if (attendeesError) {
          console.error('Attendees insertion error:', attendeesError);
        }
      }

      // Insert custom field responses
      if (Object.keys(customFieldValues).length > 0) {
        const customFieldInserts = Object.entries(customFieldValues).map(([fieldName, value]) => ({
          booking_id: booking.id,
          field_name: fieldName,
          field_value: value
        }));

        await supabase
          .from('booking_custom_responses')
          .insert(customFieldInserts);
      }

      // Create calendar events if syncing is enabled
      if (syncToCalendar) {
        try {
          const { data: calendarData } = await supabase.functions.invoke(
            'create-calendar-event',
            {
              body: {
                bookingId: booking.id,
                hostUserId: username,
                eventDetails: {
                  title: event.title,
                  description: event.description || '',
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString(),
                  attendees: validAttendees,
                  locationType: event.location_type,
                  locationDetails: meetingLink || event.location_details,
                  teamMembers: selectedTeamMembers,
                  meetingProvider: event.meeting_provider,
                  isGroupEvent: isFlexibleGroup || isOneTimeEvent,
                  meetingLink: meetingLink,
                  scheduleType: event.schedule_type
                }
              }
            }
          );

          if (calendarData) {
            await supabase
              .from("bookings")
              .update({
                calendar_event_id: calendarData.calendarEventId,
                calendar_html_link: calendarData.calendarHtmlLink,
                conference_data: calendarData.conferenceData
              })
              .eq('id', booking.id);
          }
        } catch (calendarErr) {
          console.error('Calendar error:', calendarErr);
        }
      }

      // Send confirmation emails
      try {
        for (const attendee of validAttendees) {
          await supabase.functions.invoke('send-booking-email', {
            body: {
              type: "confirmation",
              booking: {
                id: booking.id,
                guest_name: attendee.name,
                guest_email: attendee.email,
                host_user_id: username,
                host_name: profile.full_name || 'Host',
                host_email: profile.email,
                event_title: event.title,
                event_description: event.description,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration: event.duration,
                location_type: event.location_type,
                location_details: meetingLink || event.location_details,
                guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                meet_link: meetingLink,
                meeting_provider: event.meeting_provider,
                attendees: validAttendees,
                is_primary: attendee.email === validAttendees[0].email,
                requires_approval: event.require_approval,
                is_group_event: isFlexibleGroup || isOneTimeEvent,
                schedule_type: event.schedule_type
              }
            }
          });
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
      }

      // Fetch updated booking
      const { data: updatedBooking } = await supabase
        .from("bookings")
        .select()
        .eq('id', booking.id)
        .single();

      setBookingData({ ...updatedBooking, meeting_link: meetingLink });
      setStep("confirmed");
      
      toast({
        title: event.require_approval ? "Booking submitted!" : "Booking confirmed!",
        description: isOneOnOne 
          ? "Your unique meeting link has been generated and sent to all attendees."
          : "The meeting link has been shared with all attendees.",
      });

    } catch (err: any) {
      console.error('Booking error:', err);
      toast({ 
        title: "Booking failed", 
        description: err.message || "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = eventLoading || profileLoading || availabilityLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  if (eventError || !event || !profile) {
    return <ErrorState message="This booking link doesn't exist or is no longer available." />;
  }

  const formattedPrice = event.price_cents ? formatCurrency(event.price_cents, event.currency) : null;
  const isTeamEvent = event.team_event;
  const requiresApproval = event.require_approval;
  const hasWaitingList = event.waiting_list_enabled;

  // Determine event type for display
  let eventTypeBadge = null;
  if (isOneOnOne) {
    eventTypeBadge = { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: User, label: "1:1 Meeting" };
  } else if (isOneTimeEvent) {
    eventTypeBadge = { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: CalendarCheck2, label: "One-Time Event" };
  } else if (isFlexibleGroup) {
    eventTypeBadge = { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: Users, label: "Flexible Group" };
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-8 px-3 sm:px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] p-1.5 sm:p-2 rounded-lg shadow-lg">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-lg bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
              {BRAND.name}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full border shadow-sm">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C2410C]" />
            <span>Powered by <span className="font-semibold text-[#1E3A8A]">{BRAND.company}</span></span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-xl sm:rounded-2xl">
                <div className="flex flex-col lg:flex-row">
                  {/* Left column - Event details */}
                  <div className="lg:w-96 xl:w-[400px] p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#1E3A8A]/5 via-[#1E3A8A]/5 to-transparent border-b lg:border-b-0 lg:border-r">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Host/Team info */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-4 border-white dark:border-slate-800 shadow-xl">
                          {profile.avatar_url ? (
                            <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] text-white text-base sm:text-xl">
                              {profile.full_name?.[0] || 'H'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
                            {isTeamEvent ? 'Hosted by team' : 'Hosted by'}
                          </p>
                          <p className="font-bold text-sm sm:text-lg text-[#1E3A8A]">
                            {isTeamEvent ? `${profile.full_name || 'Host'} & team` : profile.full_name || 'Host'}
                          </p>
                          {!isTeamEvent && (
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="truncate max-w-[150px] sm:max-w-none">{profile.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-[#1E3A8A]/20 via-[#C2410C]/20 to-transparent" />

                      {/* Event title with badges */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                            {event.title}
                          </h1>
                          {eventTypeBadge && (
                            <Badge className={cn(eventTypeBadge.bg, eventTypeBadge.text, eventTypeBadge.border)}>
                              <eventTypeBadge.icon className="h-3 w-3 mr-1" />
                              {eventTypeBadge.label}
                            </Badge>
                          )}
                          {isTeamEvent && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                              <UsersRound className="h-3 w-3 mr-1" />
                              Team Event
                            </Badge>
                          )}
                          {requiresApproval && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              <Clock3 className="h-3 w-3 mr-1" />
                              Requires Approval
                            </Badge>
                          )}
                          {event.generate_meeting_link && (isFlexibleGroup || isOneTimeEvent) && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {getMeetingProviderIcon(event.meeting_provider)}
                              <span className="ml-1">One Link for All</span>
                            </Badge>
                          )}
                          {event.generate_meeting_link && isOneOnOne && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {getMeetingProviderIcon(event.meeting_provider)}
                              <span className="ml-1">Auto-generate</span>
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {/* Event details grid */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-[#1E3A8A]/10">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-[#1E3A8A]/10">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Duration</p>
                            <p className="text-xs sm:text-sm font-medium text-[#1E3A8A]">{event.duration} minutes</p>
                          </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-[#1E3A8A]/10">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-[#1E3A8A]/10">
                            {getLocationIcon(event.location_type)}
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Location</p>
                            <p className="text-xs sm:text-sm font-medium text-[#1E3A8A]">
                              {getLocationLabel(event.location_type)}
                              {event.location_type === 'video' && event.generate_meeting_link && (
                                <span className="ml-1 text-[10px] text-green-600">
                                  ({getMeetingProviderLabel(event.meeting_provider)})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {(isFlexibleGroup || isOneTimeEvent) && (
                          <div className="col-span-2 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20">
                              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-purple-600/80">Group Size</p>
                              <p className="text-xs sm:text-sm font-medium text-purple-600">
                                {event.min_attendees} - {event.max_attendees} attendees
                              </p>
                            </div>
                          </div>
                        )}

                        {(event.price_cents || 0) > 0 && (
                          <div className="col-span-2 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-[#C2410C]/10 border border-[#C2410C]/20">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-[#C2410C]/20">
                              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C2410C]" />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-[#C2410C]/80">Price</p>
                              <p className="text-xs sm:text-sm font-medium text-[#C2410C]">
                                {formattedPrice}
                                {event.payment_required_per_attendee && (isFlexibleGroup || isOneTimeEvent) && (
                                  <span className="text-xs text-muted-foreground ml-1">per person</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location Details */}
                      {event.location_details && event.location_type !== 'video' && (
                        <div className="bg-[#1E3A8A]/5 rounded-lg p-3 sm:p-4 border border-[#1E3A8A]/10">
                          <p className="text-[10px] sm:text-xs font-medium text-[#1E3A8A] mb-1 sm:mb-2">📍 Location Details</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{event.location_details}</p>
                        </div>
                      )}

                      {/* Meeting Link Info - Dynamic based on event type */}
                      {event.location_type === 'video' && event.generate_meeting_link && (
                        <MeetingLinkExplanation 
                          eventType={isOneOnOne ? 'one_on_one' : isOneTimeEvent ? 'one_time' : 'flexible'}
                          meetingProvider={event.meeting_provider}
                          hasPermanentLink={!!event.permanent_meeting_link}
                        />
                      )}

                      {/* One-Time Event Display */}
                      {isOneTimeEvent && <OneTimeEventDisplay event={event} />}

                      {/* Team Members (if team event) */}
                      {isTeamEvent && teamMembers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[#1E3A8A]">Team Members</p>
                          <div className="flex flex-wrap gap-2">
                            {teamMembers.map((member) => (
                              <TooltipProvider key={member.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-[#1E3A8A]/10">
                                      <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[8px]">
                                          {member.profiles?.full_name?.[0] || 'T'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs">{member.profiles?.full_name}</span>
                                      {member.is_required && (
                                        <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-[8px] px-1">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Role: {member.role}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-[#1E3A8A]">Features</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs gap-1 hover:bg-[#1E3A8A]/10"
                            onClick={() => setShowAllFeatures(!showAllFeatures)}
                          >
                            {showAllFeatures ? 'Show less' : 'Show all'}
                            {showAllFeatures ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                        
                        <AnimatePresence>
                          {(showAllFeatures ? [
                            { icon: Shield, title: "Secure Booking", description: "Your information is protected", color: "primary", badge: "GDPR" },
                            { icon: Zap, title: "Instant Confirmation", description: requiresApproval ? "Subject to approval" : "Get confirmation immediately", color: "primary" },
                            { icon: Video, title: "Video Ready", description: event.generate_meeting_link ? `Auto-generates ${getMeetingProviderLabel(event.meeting_provider)} links` : "Automatic meeting link generation", color: "primary", badge: "Auto" },
                            { icon: CalendarIcon, title: "Calendar Integration", description: "Event saved to your calendar", color: "primary", badge: "iCal" },
                            { icon: Globe, title: "Timezone Smart", description: "Automatic timezone detection", color: "primary" },
                            { icon: CreditCard, title: "Secure Payments", description: "Pay with M-Pesa or card", color: "secondary", badge: "New" },
                            { icon: Users, title: "Group Booking", description: (isFlexibleGroup || isOneTimeEvent) ? `Up to ${event.max_attendees} attendees` : "1-on-1 meeting", color: "primary" },
                            { icon: BellRing, title: "Reminders", description: "Get notified before the meeting", color: "primary" },
                            { icon: Timer, title: "Buffer Time", description: `${event.buffer_before || 0}min before, ${event.buffer_after || 0}min after`, color: "primary" },
                            { icon: Hourglass, title: "Waiting List", description: hasWaitingList ? "Join if fully booked" : "Book now", color: "primary" },
                          ] : [
                            { icon: Shield, title: "Secure Booking", description: "Your information is protected", color: "primary" },
                            { icon: Zap, title: "Instant Confirmation", description: requiresApproval ? "Subject to approval" : "Get confirmation immediately", color: "primary" },
                            { icon: Video, title: "Video Ready", description: event.generate_meeting_link ? `Auto-generates ${getMeetingProviderLabel(event.meeting_provider)} links` : "Automatic meeting link", color: "primary", badge: "Auto" },
                            { icon: Users, title: "Meeting Type", description: isOneOnOne ? "1:1 Meeting" : isOneTimeEvent ? "One-Time Event" : `Group (${event.min_attendees}-${event.max_attendees})`, color: "primary" },
                          ]).map((feature) => (
                            <motion.div
                              key={feature.title}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FeatureCard
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                color={feature.color}
                                badge={feature.badge}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Stats badges */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <StatBadge icon={Star} value="98%" label="Satisfaction rate" />
                        <StatBadge icon={Users} value="800+" label="Active users" />
                        <StatBadge icon={Clock3} value="<2min" label="Avg response" />
                        {isTeamEvent && (
                          <StatBadge icon={UsersRound} value="Team" label="Team event" />
                        )}
                        {requiresApproval && (
                          <StatBadge icon={Shield} value="Approval" label="Requires approval" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right column - Date & Time selection */}
                  <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {isOneTimeEvent ? (
                      // One-Time Event Display - No selection needed
                      <div className="space-y-6">
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                          <CalendarCheck2 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-purple-900 mb-2">Fixed Date & Time Event</h3>
                          <p className="text-sm text-purple-700 mb-4">
                            This event is scheduled for a specific time. Just confirm your attendance below.
                          </p>
                          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-purple-200">
                            <CalendarIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">
                              {event.one_time_event && format(new Date(`${event.one_time_event.date}T${event.one_time_event.start_time}`), "EEEE, MMMM d, yyyy")}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-purple-200 mt-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">
                              {event.one_time_event?.start_time} - {event.one_time_event?.end_time}
                            </span>
                          </div>
                        </div>
                        
                        {/* Next button for one-time events */}
                        <div className="flex justify-end pt-4">
                          <Button 
                            onClick={() => setStep("form")}
                            size="lg"
                            className="gap-2 px-6 sm:px-10 h-10 sm:h-12 text-sm sm:text-base w-full sm:w-auto bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90 text-white shadow-lg hover:shadow-xl transition-all group"
                          >
                            Continue to Booking
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    ) : availableDates.length === 0 ? (
                      <div className="text-center py-12 sm:py-16">
                        <div className="relative mx-auto w-fit mb-4 sm:mb-6">
                          <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
                          <div className="relative bg-[#1E3A8A]/10 rounded-full p-3 sm:p-4">
                            <CalendarOff className="h-8 w-8 sm:h-12 sm:w-12 text-[#1E3A8A]/60" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-xl font-semibold mb-2 text-[#1E3A8A]">No available dates</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto px-4">
                          This host hasn't set their availability yet. Check back later!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 sm:space-y-8">
                        {/* Calendar for flexible events */}
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#1E3A8A]/10">
                              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />
                            </div>
                            Select a Date
                          </h3>
                          <div className="flex justify-center bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#1E3A8A]/10">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date);
                                setSelectedTime(undefined);
                              }}
                              month={month}
                              onMonthChange={setMonth}
                              disabled={(date) => !isDateAvailable(date)}
                              className="rounded-md w-full"
                              classNames={{
                                months: "w-full",
                                month: "space-y-3 sm:space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-xs sm:text-sm font-semibold text-[#1E3A8A]",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#1E3A8A]/10 rounded-full transition-all",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-8 sm:w-10 font-medium text-[10px] sm:text-xs",
                                row: "flex w-full mt-1 sm:mt-2",
                                cell: "text-center text-xs sm:text-sm p-0 relative",
                                day: cn(
                                  "h-7 w-7 sm:h-9 sm:w-9 p-0 font-normal rounded-full transition-all text-xs sm:text-sm",
                                  "hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]"
                                ),
                                day_selected: "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] hover:text-white focus:bg-[#1E3A8A] focus:text-white font-semibold shadow-lg",
                                day_today: "bg-[#C2410C] text-white font-bold ring-2 ring-[#C2410C]/30 hover:bg-[#C2410C]/90",
                                day_disabled: "text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                                day_outside: "text-muted-foreground/30",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#1E3A8A] shadow-lg shadow-[#1E3A8A]/30" />
                              <span className="text-muted-foreground">Available</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-muted-foreground/30" />
                              <span className="text-muted-foreground">Unavailable</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#C2410C] ring-2 ring-[#C2410C]/30" />
                              <span className="text-muted-foreground">Today</span>
                            </div>
                          </div>
                        </div>

                        {/* Time slots for flexible events */}
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#1E3A8A]/10">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />
                            </div>
                            {selectedDate ? (
                              <span className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span>Available Times for</span>
                                <span className="text-[#C2410C] font-bold">{formatDateDisplay(selectedDate)}</span>
                              </span>
                            ) : (
                              "Select a Date First"
                            )}
                          </h3>
                          
                          {selectedDate ? (
                            <div className="border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 border-[#1E3A8A]/10">
                              {timeSlots.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-full p-2 sm:p-3 w-fit mx-auto mb-3 sm:mb-4 border border-[#1E3A8A]/10">
                                    <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-[#1E3A8A]/50" />
                                  </div>
                                  <p className="font-medium text-sm sm:text-base mb-1 text-[#1E3A8A]">No available times</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {hasWaitingList ? (
                                      <Button
                                        variant="link"
                                        className="text-[#1E3A8A] hover:text-[#C2410C]"
                                        onClick={() => setJoinWaitingList(true)}
                                      >
                                        Join waiting list
                                      </Button>
                                    ) : (
                                      "This day is fully booked. Please select another date."
                                    )}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                                    <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 text-xs border-[#1E3A8A]/20">
                                      {timeSlots.length} slot{timeSlots.length > 1 ? 's' : ''} available
                                    </Badge>
                                    <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20 text-xs">
                                      {event.duration} min meeting
                                      {isFlexibleGroup && ` · ${event.max_attendees} spots max`}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1 sm:pr-2">
                                    {timeSlots.map((slot) => (
                                      <div
                                        key={slot.time}
                                        onMouseEnter={() => setHoveredSlot(slot.time)}
                                        onMouseLeave={() => setHoveredSlot(null)}
                                      >
                                        <TimeSlot
                                          time={slot.time}
                                          selected={selectedTime === slot.time}
                                          onClick={() => {
                                            setSelectedTime(slot.time);
                                            setSelectedSlot(slot);
                                          }}
                                          availableSpots={slot.availableSpots}
                                          maxAttendees={event.max_attendees}
                                          isTeamSlot={slot.isTeamSlot}
                                          teamMembers={teamMembers}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {hoveredSlot && (
                                    <div className="mt-3 text-xs text-center text-muted-foreground bg-white/50 dark:bg-slate-800/50 py-1 px-2 rounded-full">
                                      {getTimeOfDay(hoveredSlot)} slot · {event.duration} minutes
                                      {isFlexibleGroup && selectedSlot?.availableSpots && (
                                        <span> · {selectedSlot.availableSpots} spots left</span>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="border rounded-lg sm:rounded-xl p-8 sm:p-12 text-center bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 border-[#1E3A8A]/10">
                              <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-[#1E3A8A]/30 mx-auto mb-3 sm:mb-4" />
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Pick a date from the calendar to see available time slots
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Next button for flexible events */}
                        {selectedDate && selectedTime && (
                          <div className="flex justify-end pt-2 sm:pt-4">
                            <Button 
                              onClick={() => setStep("form")}
                              size="lg"
                              className="gap-2 sm:gap-3 px-6 sm:px-10 h-10 sm:h-12 text-sm sm:text-base w-full sm:w-auto bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90 text-white shadow-lg hover:shadow-xl transition-all group"
                            >
                              Next
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#1E3A8A] to-[#C2410C]" />
                
                {/* Header */}
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-[#1E3A8A]/5 to-transparent">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white dark:border-slate-800 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] text-white text-sm sm:text-base">
                          {profile.full_name?.[0] || 'H'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {isTeamEvent ? 'Booking with team' : 'Booking with'}
                        </p>
                        <p className="font-semibold text-sm sm:text-lg text-[#1E3A8A]">
                          {isTeamEvent ? `${profile.full_name || 'Host'} & team` : profile.full_name || 'Host'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("datetime")}
                      className="gap-1 sm:gap-2 hover:bg-[#1E3A8A]/10 text-xs sm:text-sm w-full sm:w-auto text-[#1E3A8A]"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      Back
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* Booking summary */}
                  <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[#1E3A8A]/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Date</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#1E3A8A]">
                          {selectedDate ? format(selectedDate, "EEE, MMM d") : ''}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#C2410C]">
                          {selectedTime ? formatTimeDisplay(selectedTime) : ''}
                          {isOneTimeEvent && event?.one_time_event && (
                            <span className="text-xs text-muted-foreground ml-1">
                              - {formatTimeDisplay(event.one_time_event.end_time)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#1E3A8A]">{event.duration} min</p>
                      </div>
                    </div>

                    {/* Available spots indicator */}
                    {isFlexibleGroup && selectedSlot && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          selectedSlot.availableSpots > event.max_attendees! / 2 ? "bg-green-500" :
                          selectedSlot.availableSpots > 0 ? "bg-yellow-500" : "bg-red-500"
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {selectedSlot.availableSpots} of {event.max_attendees} spots available
                        </span>
                      </div>
                    )}

                    {/* Meeting link info for group/one-time events */}
                    {(isFlexibleGroup || isOneTimeEvent) && event.generate_meeting_link && event.permanent_meeting_link && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          {getMeetingProviderIcon(event.meeting_provider)}
                          <span className="text-xs font-medium text-purple-800">
                            One Meeting Link for All Attendees
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-purple-700">
                          <Link2 className="h-3 w-3 shrink-0" />
                          <span className="font-mono truncate">{event.permanent_meeting_link}</span>
                        </div>
                        {event.host_join_first && (
                          <p className="mt-1 text-[8px] text-purple-600">
                            The host will join first. You'll be able to join once they start the meeting.
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Meeting link info for 1:1 meetings */}
                    {isOneOnOne && event.generate_meeting_link && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          {getMeetingProviderIcon(event.meeting_provider)}
                          <span className="text-xs font-medium text-blue-800">
                            Unique Meeting Link for This Booking
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-700">
                          A private {getMeetingProviderLabel(event.meeting_provider)} link will be generated after confirmation.
                        </p>
                      </div>
                    )}
                    
                    {/* Calendar sync toggle */}
                    <div className="mt-4 pt-4 border-t border-[#1E3A8A]/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-[#1E3A8A]" />
                          <span className="text-sm font-medium text-[#1E3A8A]">Add to my calendar</span>
                        </div>
                        <Switch
                          checked={syncToCalendar}
                          onCheckedChange={setSyncToCalendar}
                          className="data-[state=checked]:bg-[#1E3A8A]"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {syncToCalendar 
                          ? "Event will be saved to all attendees' calendars automatically" 
                          : "You'll receive an email confirmation instead"}
                      </p>
                    </div>

                    {/* Location info */}
                    {event.location_type === 'video' && !isFlexibleGroup && !isOneTimeEvent && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                          <span className="text-muted-foreground">
                            {event.generate_meeting_link 
                              ? `${getMeetingProviderLabel(event.meeting_provider)} link will be generated automatically after booking`
                              : "Video meeting link will be provided"}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {event.location_type !== 'video' && event.location_details && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#C2410C] shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{event.location_details}</span>
                        </div>
                      </div>
                    )}

                    {/* Price summary */}
                    {(event.price_cents || 0) > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-[#C2410C]" />
                            <span className="text-sm font-medium text-[#1E3A8A]">
                              {event.payment_required_per_attendee ? 'Price per person' : 'Total price'}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-[#C2410C]">
                            {event.payment_required_per_attendee 
                              ? `${formattedPrice} × ${attendees.filter(a => a.name && a.email).length}`
                              : formattedPrice}
                          </span>
                        </div>
                        {event.payment_required_per_attendee && (
                          <p className="text-xs text-right text-muted-foreground mt-1">
                            Total: {formatCurrency(
                              (event.price_cents || 0) * attendees.filter(a => a.name && a.email).length,
                              event.currency
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Approval notice */}
                    {requiresApproval && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                          <Clock3 className="h-4 w-4" />
                          <span className="text-xs">This booking requires host approval. You'll be notified once confirmed.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendees section */}
                  {(isFlexibleGroup || isOneTimeEvent) && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#1E3A8A]" />
                          <h3 className="text-sm font-semibold text-[#1E3A8A]">
                            Attendees ({attendees.filter(a => a.name && a.email).length}/{event.max_attendees})
                          </h3>
                        </div>
                        {attendees.length < (event.max_attendees || 10) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddAttendee}
                            className="gap-1 text-xs"
                          >
                            <UserPlus className="h-3 w-3" />
                            Add Attendee
                          </Button>
                        )}
                      </div>

                      <AnimatePresence>
                        {attendees.map((attendee, index) => (
                          <AttendeeInput
                            key={index}
                            attendee={attendee}
                            index={index}
                            onUpdate={handleAttendeeUpdate}
                            onRemove={handleRemoveAttendee}
                            canRemove={attendees.length > 1}
                            isPrimary={index === 0}
                          />
                        ))}
                      </AnimatePresence>

                      {event.guests_can_invite_others && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#1E3A8A]/5 p-2 rounded-lg">
                          <Info className="h-3 w-3" />
                          <span>Guests can invite additional attendees after booking</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Team member selection (for team events) */}
                  {isTeamEvent && teamMembers.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4 text-[#1E3A8A]" />
                        <h3 className="text-sm font-semibold text-[#1E3A8A]">Select Team Members</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                              selectedTeamMembers.includes(member.user_id)
                                ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                                : "border-gray-200 hover:border-[#1E3A8A]/30",
                              member.is_required && "bg-gray-50"
                            )}
                            onClick={() => {
                              if (member.is_required) return;
                              setSelectedTeamMembers(prev =>
                                prev.includes(member.user_id)
                                  ? prev.filter(id => id !== member.user_id)
                                  : [...prev, member.user_id]
                              );
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {member.profiles?.full_name?.[0] || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{member.profiles?.full_name}</p>
                              <p className="text-[10px] text-muted-foreground">{member.role}</p>
                            </div>
                            {member.is_required && (
                              <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-[8px]">
                                Required
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom fields */}
                  {event.custom_fields && event.custom_fields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#1E3A8A]">Additional Information</h3>
                      {event.custom_fields.map((field: CustomField) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-xs">
                            {field.name}
                            {field.required && <span className="text-[#C2410C] ml-1">*</span>}
                          </Label>
                          <CustomFieldInput
                            field={field}
                            value={customFieldValues[field.name] || ''}
                            onChange={(value) => setCustomFieldValues(prev => ({
                              ...prev,
                              [field.name]: value
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes field */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs font-medium flex items-center gap-1 text-[#1E3A8A]">
                      <FileText className="h-3 w-3" />
                      Additional notes (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      placeholder="Anything you'd like to share before the meeting"
                      rows={3}
                      className="resize-none text-sm border-2 focus:border-[#1E3A8A]/50"
                    />
                  </div>

                  {/* Confirm button */}
                  <div>
                    <Button
                      onClick={handleBook}
                      size="lg"
                      className="w-full h-10 sm:h-12 text-sm sm:text-base gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90 text-white shadow-lg hover:shadow-xl transition-all group"
                      disabled={
                        submitting ||
                        !attendees.some(a => a.name && a.email) ||
                        ((isFlexibleGroup || isOneTimeEvent) && attendees.filter(a => a.name && a.email).length < (event.min_attendees || 1))
                      }
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          Confirming booking...
                        </>
                      ) : (
                        <>
                          {requiresApproval ? 'Submit for Approval' : 'Confirm Booking'}
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                    By booking, you agree to our{' '}
                    <Link to="/terms" className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors">Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors">Privacy Policy</Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                  <div className="relative mx-auto w-fit mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3 sm:p-4 shadow-xl">
                      <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] mb-2 sm:mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {requiresApproval ? 'Booking Submitted!' : 'Booking Confirmed!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
                    {requiresApproval 
                      ? "Your booking has been submitted for approval. You'll receive an email once confirmed."
                      : isOneOnOne
                        ? "A unique meeting link has been generated and sent to all attendees."
                        : "The meeting link has been shared with all attendees."}
                  </p>

                  <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg sm:rounded-xl p-4 sm:p-6 text-left space-y-3 sm:space-y-4 mb-6 sm:mb-8 border border-[#1E3A8A]/10">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm pb-2 sm:pb-3 border-b border-[#1E3A8A]/10">
                      <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: event.color || "#1E3A8A" }} />
                      <span className="font-semibold text-[#1E3A8A]">{event.title}</span>
                      {isTeamEvent && (
                        <Badge className="bg-purple-100 text-purple-700 text-[8px]">
                          Team Event
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                        <span className="text-xs sm:text-sm">{selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-[#C2410C] shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {selectedTime ? formatTimeDisplay(selectedTime) : ''}
                          {isOneTimeEvent && event?.one_time_event && (
                            <> - {formatTimeDisplay(event.one_time_event.end_time)}</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLocationIcon(event.location_type)}
                        <span className="text-xs sm:text-sm">{getLocationLabel(event.location_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {attendees.filter(a => a.name && a.email).length} attendee
                          {attendees.filter(a => a.name && a.email).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Attendee list */}
                    {attendees.filter(a => a.name && a.email).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Attendees</p>
                        <div className="space-y-1">
                          {attendees.filter(a => a.name && a.email).map((attendee, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <UserCheck className="h-3 w-3 text-green-600" />
                              <span>{attendee.name} ({attendee.email})</span>
                              {idx === 0 && (
                                <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-[8px]">
                                  Primary
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location Details */}
                    {event.location_type !== 'video' && event.location_details && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">📍 Location</p>
                        <p className="text-xs sm:text-sm bg-white dark:bg-slate-800 rounded-lg p-3 border border-[#1E3A8A]/10">
                          {event.location_details}
                        </p>
                      </div>
                    )}

                    {/* Meeting Link */}
                    {event.location_type === 'video' && bookingData?.meeting_link && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center gap-2 mb-2">
                          {getMeetingProviderIcon(event.meeting_provider)}
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {isOneOnOne ? 'Your Unique Meeting Link' : 'Meeting Link (Same for all)'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-[#1E3A8A]/10 text-xs sm:text-xs font-mono truncate">
                            {bookingData.meeting_link}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 gap-1 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                            onClick={handleCopyLink}
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 gap-1 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                            onClick={() => window.open(bookingData.meeting_link, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            Join
                          </Button>
                        </div>
                        {(isFlexibleGroup || isOneTimeEvent) && event.host_join_first && (
                          <p className="mt-1 text-[8px] text-amber-600">
                            The host will join first. You can join once they start the meeting.
                          </p>
                        )}
                        {isOneOnOne && (
                          <p className="mt-1 text-[8px] text-blue-600">
                            This is your private meeting link - don't share it with others.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Calendar sync status */}
                    {bookingData?.calendar_event_id && (
                      <div className="mt-2 text-xs text-center text-green-600 bg-green-50 dark:bg-green-950/30 py-2 px-3 rounded-lg border border-green-200 dark:border-green-900">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />
                        Event added to calendar
                      </div>
                    )}

                    {/* Price confirmation */}
                    {(event.price_cents || 0) > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total charged</span>
                          <span className="text-lg font-bold text-[#C2410C]">
                            {event.payment_required_per_attendee
                              ? formatCurrency(
                                  (event.price_cents || 0) * attendees.filter(a => a.name && a.email).length,
                                  event.currency
                                )
                              : formattedPrice}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Google Calendar Add Button */}
                  {selectedDate && selectedTime && syncToCalendar && !bookingData?.calendar_event_id && (
                    <div className="mb-4 sm:mb-6">
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-xs sm:text-sm border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                        onClick={() => {
                          const [h, m] = selectedTime.split(":").map(Number);
                          const startTime = new Date(selectedDate!);
                          startTime.setHours(h, m, 0, 0);
                          
                          let endTime;
                          if (isOneTimeEvent && event?.one_time_event) {
                            const [endH, endM] = event.one_time_event.end_time.split(":").map(Number);
                            endTime = new Date(selectedDate!);
                            endTime.setHours(endH, endM, 0, 0);
                          } else {
                            endTime = addMinutes(startTime, event.duration);
                          }
                          
                          const calendarUrl = generateGoogleCalendarLink(
                            event,
                            startTime,
                            endTime,
                            attendees.filter(a => a.name && a.email),
                            profile.full_name || 'Host',
                            bookingData?.meeting_link
                          );
                          
                          window.open(calendarUrl, '_blank');
                        }}
                      >
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                        Add to Google Calendar
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button variant="outline" asChild className="flex-1 h-10 sm:h-11 text-xs sm:text-base border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
                      <Link to={`/${username}`}>
                        New Booking
                      </Link>
                    </Button>
                    <Button asChild className="flex-1 h-10 sm:h-11 text-xs sm:text-base bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90">
                      <Link to="/">
                        Done
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting List Dialog */}
        <Dialog open={joinWaitingList} onOpenChange={setJoinWaitingList}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join Waiting List</DialogTitle>
              <DialogDescription>
                Get notified when a spot becomes available for this time slot.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="waitlist-email">Email address</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  placeholder="your@email.com"
                  value={waitingListEmail}
                  onChange={(e) => setWaitingListEmail(e.target.value)}
                />
              </div>
              {selectedDate && selectedTime && (
                <div className="text-sm text-muted-foreground">
                  <p>Selected time: {format(selectedDate, "PPP")} at {formatTimeDisplay(selectedTime)}</p>
                </div>
              )}
              <Button
                onClick={handleJoinWaitingList}
                className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                disabled={!waitingListEmail}
              >
                Join Waiting List
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground">
            A product of{" "}
            <a 
              href={BRAND.website}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors font-medium"
            >
              {BRAND.company}
            </a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}