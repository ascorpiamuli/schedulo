// pages/TeamCalendar.tsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useBookings, useCurrentTeamMember } from "@/hooks/use-bookings";
import { useEventTypes } from "@/hooks/use-event-types";
import { useDepartments, useTeamMembers } from "@/hooks/use-team-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Building2,
  User,
  Clock,
  MapPin,
  Video,
  Phone,
  Mail,
  X,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Filter,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  Clock3,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Coffee,
  Pizza,
  Utensils,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Award,
  Trophy,
  Crown,
  Sparkles,
  Zap,
  Bell,
  BellRing,
  Settings2,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  Link2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Menu,
  Grid3x3,
  List,
  Table2,
  Calendar as CalendarIcon2,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  Clock1,
  Clock2,
  Clock3 as ClockIcon3,
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfDay, endOfDay, isWithinInterval, differenceInMinutes, setHours, setMinutes, getHours, getMinutes } from "date-fns";

// ============================================
// TYPES
// ============================================

type CalendarView = "month" | "week" | "day" | "agenda";
type EventScope = "personal" | "organization" | "department";
type EventType = "booking" | "event_type" | "availability" | "holiday";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  scope: EventScope;
  color: string;
  description?: string;
  location?: string;
  location_type?: string;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  }>;
  host?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  eventTypeId?: string;
  bookingId?: string;
  departmentId?: string;
  departmentName?: string;
  organizationId?: string;
  status?: "confirmed" | "cancelled" | "pending";
  meetingLink?: string;
  meetingProvider?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  metadata?: any;
}

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  department: string | null;
  color?: string;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 12, stiffness: 100 },
  },
};

// ============================================
// SCOPE CONFIGURATION
// ============================================

const SCOPE_CONFIG = {
  personal: {
    label: "Personal",
    icon: User,
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    lightBg: "bg-blue-50",
    darkBg: "bg-blue-900/20",
    gradient: "from-blue-500 to-blue-600",
  },
  organization: {
    label: "Organization",
    icon: Users,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    lightBg: "bg-green-50",
    darkBg: "bg-green-900/20",
    gradient: "from-green-500 to-green-600",
  },
  department: {
    label: "Department",
    icon: Building2,
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50",
    darkBg: "bg-purple-900/20",
    gradient: "from-purple-500 to-purple-600",
  },
};

// ============================================
// EVENT TYPE CONFIGURATION
// ============================================

const EVENT_TYPE_CONFIG = {
  booking: {
    label: "Booking",
    icon: CalendarCheck,
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-100",
    textColor: "text-blue-700",
  },
  event_type: {
    label: "Available",
    icon: CalendarDays,
    bgColor: "bg-green-500",
    lightBg: "bg-green-100",
    textColor: "text-green-700",
  },
  availability: {
    label: "Available",
    icon: Clock,
    bgColor: "bg-emerald-500",
    lightBg: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  holiday: {
    label: "Holiday",
    icon: Coffee,
    bgColor: "bg-orange-500",
    lightBg: "bg-orange-100",
    textColor: "text-orange-700",
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getTimeIcon = (hour: number) => {
  const icons: Record<number, any> = {
    0: Clock12,
    1: Clock1,
    2: Clock2,
    3: Clock3,
    4: Clock4,
    5: Clock5,
    6: Clock6,
    7: Clock7,
    8: Clock8,
    9: Clock9,
    10: Clock10,
    11: Clock11,
    12: Clock12,
    13: Clock1,
    14: Clock2,
    15: Clock3,
    16: Clock4,
    17: Clock5,
    18: Clock6,
    19: Clock7,
    20: Clock8,
    21: Clock9,
    22: Clock10,
    23: Clock11,
  };
  const Icon = icons[hour] || Clock;
  return <Icon className="h-3 w-3" />;
};

const getLocationIcon = (type?: string) => {
  switch (type) {
    case "video":
      return <Video className="h-3.5 w-3.5" />;
    case "phone":
      return <Phone className="h-3.5 w-3.5" />;
    case "in_person":
      return <MapPin className="h-3.5 w-3.5" />;
    default:
      return <MapPin className="h-3.5 w-3.5" />;
  }
};

const getScopeConfig = (scope: EventScope) => {
  return SCOPE_CONFIG[scope] || SCOPE_CONFIG.personal;
};

const getEventTypeConfig = (type: EventType) => {
  return EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.booking;
};

const formatEventTime = (date: Date) => {
  return format(date, "h:mm a");
};

const formatEventDate = (date: Date) => {
  return format(date, "MMM d, yyyy");
};

const isSameEvent = (event1: CalendarEvent, event2: CalendarEvent) => {
  return event1.id === event2.id;
};

// ============================================
// EVENT CARD COMPONENT
// ============================================

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
  className?: string;
}

function EventCard({ event, onClick, compact = false, className }: EventCardProps) {
  const scopeConfig = getScopeConfig(event.scope);
  const ScopeIcon = scopeConfig.icon;
  const eventTypeConfig = getEventTypeConfig(event.type);
  const TypeIcon = eventTypeConfig.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity",
                event.type === "booking" ? "text-white" : "text-gray-700",
                className
              )}
              style={{ backgroundColor: event.color }}
              onClick={() => onClick?.(event)}
            >
              <div className="flex items-center gap-1">
                <TypeIcon className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{event.title}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded" style={{ backgroundColor: event.color }}>
                  <TypeIcon className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatEventTime(event.start)} - {formatEventTime(event.end)}
                  </p>
                </div>
              </div>
              {event.host && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Host:</span> {event.host.name}
                </div>
              )}
              {event.location && (
                <div className="text-xs flex items-center gap-1">
                  {getLocationIcon(event.location_type)}
                  <span className="text-muted-foreground">{event.location}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md bg-white dark:bg-gray-900",
        className
      )}
      style={{ borderLeftWidth: "4px", borderLeftColor: event.color }}
      onClick={() => onClick?.(event)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className="h-3.5 w-3.5 shrink-0" style={{ color: event.color }} />
            <h4 className="text-sm font-medium truncate font-['Space_Grotesk']">{event.title}</h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              {formatEventTime(event.start)} - {formatEventTime(event.end)}
            </span>
          </div>
          {event.host && (
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-5 w-5">
                {event.host.avatar ? (
                  <AvatarImage src={event.host.avatar} alt={event.host.name} />
                ) : (
                  <AvatarFallback className="text-[8px] bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    {getInitials(event.host.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{event.host.name}</span>
            </div>
          )}
        </div>
        <Badge className={cn("text-[8px] px-1 py-0", scopeConfig.lightBg, scopeConfig.textColor, scopeConfig.borderColor)}>
          <ScopeIcon className="h-2 w-2 mr-0.5" />
          {scopeConfig.label.slice(0, 3)}
        </Badge>
      </div>
    </motion.div>
  );
}

// ============================================
// EVENT DETAILS MODAL
// ============================================

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EventDetailsModal({ event, open, onOpenChange }: EventDetailsModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!event) return null;

  const scopeConfig = getScopeConfig(event.scope);
  const ScopeIcon = scopeConfig.icon;
  const eventTypeConfig = getEventTypeConfig(event.type);
  const TypeIcon = eventTypeConfig.icon;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinMeeting = () => {
    if (event.meetingLink) {
      window.open(event.meetingLink, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl",
              isMobile ? "max-h-[90vh]" : ""
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with color strip */}
            <div className="h-2" style={{ backgroundColor: event.color }} />

            {/* Header content */}
            <div className="p-4 sm:p-6 border-b flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${event.color}20` }}>
                  <TypeIcon className="h-5 w-5" style={{ color: event.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] truncate">
                      {event.title}
                    </h2>
                    <Badge className={cn("text-xs", scopeConfig.lightBg, scopeConfig.textColor, scopeConfig.borderColor)}>
                      <ScopeIcon className="h-3 w-3 mr-1" />
                      {scopeConfig.label}
                    </Badge>
                    <Badge className={cn("text-xs", eventTypeConfig.lightBg, eventTypeConfig.textColor)}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {eventTypeConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatEventDate(event.start)} • {formatEventTime(event.start)} - {formatEventTime(event.end)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Host info */}
              {event.host && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Host</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {event.host.avatar ? (
                        <AvatarImage src={event.host.avatar} alt={event.host.name} />
                      ) : (
                        <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A]">
                          {getInitials(event.host.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#1E3A8A]">{event.host.name}</p>
                      <a
                        href={`mailto:${event.host.email}`}
                        className="text-xs text-muted-foreground hover:text-[#1E3A8A] flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {event.host.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Attendees ({event.attendees.length})
                  </h3>
                  <div className="space-y-2">
                    {event.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {attendee.avatar ? (
                            <AvatarImage src={attendee.avatar} alt={attendee.name} />
                          ) : (
                            <AvatarFallback className="text-[8px] bg-[#1E3A8A]/10 text-[#1E3A8A]">
                              {getInitials(attendee.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{attendee.email}</p>
                        </div>
                        {attendee.role && (
                          <Badge variant="outline" className="text-[10px]">
                            {attendee.role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Location</h3>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-background">
                      {getLocationIcon(event.location_type)}
                    </div>
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
              )}

              {/* Meeting Link */}
              {event.meetingLink && (
                <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-xl p-4 border border-[#1E3A8A]/20">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Meeting Link</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                      <Link2 className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                      <span className="text-xs font-mono truncate flex-1">{event.meetingLink}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copyToClipboard(event.meetingLink!)}
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={handleJoinMeeting}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button onClick={handleJoinMeeting} className="w-full gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Description</h3>
                  <p className="text-sm whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              {/* Metadata */}
              {event.metadata && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Additional Details</h3>
                  <pre className="text-xs whitespace-pre-wrap bg-background p-2 rounded-lg">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t bg-muted/20">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {event.bookingId && (
                  <Button variant="default" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90" asChild>
                    <a href={`/dashboard/bookings/${event.bookingId}`}>View Booking Details</a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// CALENDAR HEADER
// ============================================

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  filters?: {
    scope: EventScope | "all";
    setScope: (scope: EventScope | "all") => void;
    department: string | "all";
    setDepartment: (dept: string | "all") => void;
    teamMember: string | "all";
    setTeamMember: (member: string | "all") => void;
  };
  departments?: Array<{ name: string; color: string }>;
  teamMembers?: TeamMember[];
}

function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onRefresh,
  isLoading,
  filters,
  departments,
  teamMembers,
}: CalendarHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const getDateRangeText = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week": {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
      }
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "agenda":
        return format(currentDate, "MMMM yyyy");
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
            Team Calendar
          </h1>
          <Badge variant="outline" className="text-xs">
            Beta
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 text-[#1E3A8A]", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
            <Download className="h-4 w-4 text-[#1E3A8A]" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
            <Share2 className="h-4 w-4 text-[#1E3A8A]" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday} className="border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
            Today
          </Button>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#1E3A8A]/5"
                    onClick={onPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#1E3A8A]/5"
                    onClick={onNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold font-['Space_Grotesk'] text-[#1E3A8A] ml-2">
            {getDateRangeText()}
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "month" ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-8 w-8", view === "month" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                    onClick={() => onViewChange("month")}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Month</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "week" ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-8 w-8", view === "week" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                    onClick={() => onViewChange("week")}
                  >
                    <CalendarRange className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Week</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "day" ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-8 w-8", view === "day" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                    onClick={() => onViewChange("day")}
                  >
                    <CalendarIcon2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Day</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "agenda" ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-8 w-8", view === "agenda" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                    onClick={() => onViewChange("agenda")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Agenda</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Filters */}
          {filters && (
            <div className="flex items-center gap-2 ml-auto">
              <Select value={filters.scope} onValueChange={filters.setScope}>
                <SelectTrigger className="w-[110px] h-8 text-xs border-[#1E3A8A]/20">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>

              {filters.scope === "department" && departments && (
                <Select value={filters.department} onValueChange={filters.setDepartment}>
                  <SelectTrigger className="w-[130px] h-8 text-xs border-[#1E3A8A]/20">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.name} value={dept.name}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                          {dept.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {teamMembers && teamMembers.length > 0 && (
                <Select value={filters.teamMember} onValueChange={filters.setTeamMember}>
                  <SelectTrigger className="w-[130px] h-8 text-xs border-[#1E3A8A]/20">
                    <SelectValue placeholder="Team Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-4 w-4">
                            {member.avatar_url ? (
                              <AvatarImage src={member.avatar_url} alt={member.full_name || ""} />
                            ) : (
                              <AvatarFallback className="text-[6px] bg-[#1E3A8A]/10 text-[#1E3A8A]">
                                {getInitials(member.full_name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="truncate max-w-[80px]">{member.full_name || member.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MONTH VIEW
// ============================================

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  filters?: {
    scope: EventScope | "all";
    department: string | "all";
    teamMember: string | "all";
  };
}

function MonthView({ currentDate, events, onEventClick, filters }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters?.scope !== "all" && event.scope !== filters.scope) return false;
      if (filters?.department !== "all" && event.departmentName !== filters.department) return false;
      if (filters?.teamMember !== "all" && event.host?.id !== filters.teamMember) return false;
      return true;
    });
  }, [events, filters]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.start, day));
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 divide-x divide-y">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-1 transition-colors",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isTodayDate && "bg-blue-50/50 dark:bg-blue-950/20"
              )}
            >
              <div className="flex items-center justify-between p-1">
                <span
                  className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isTodayDate && "bg-[#1E3A8A] text-white"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 max-h-[80px] overflow-y-auto hide-scrollbar">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} onClick={onEventClick} compact />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[8px] text-center text-muted-foreground py-0.5 bg-muted/30 rounded">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// WEEK VIEW
// ============================================

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  filters?: {
    scope: EventScope | "all";
    department: string | "all";
    teamMember: string | "all";
  };
}

function WeekView({ currentDate, events, onEventClick, filters }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters?.scope !== "all" && event.scope !== filters.scope) return false;
      if (filters?.department !== "all" && event.departmentName !== filters.department) return false;
      if (filters?.teamMember !== "all" && event.host?.id !== filters.teamMember) return false;
      return true;
    });
  }, [events, filters]);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return filteredEvents.filter((event) => {
      const eventStart = event.start;
      const eventEnd = event.end;
      const eventHour = eventStart.getHours();
      
      return (
        isSameDay(eventStart, day) &&
        eventHour === hour &&
        eventStart >= day &&
        eventEnd <= endOfDay(day)
      );
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 border-r bg-muted/50"></div>
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              "p-2 text-center border-r last:border-r-0",
              isToday(day) && "bg-blue-50/50 dark:bg-blue-950/20"
            )}
          >
            <div className="text-sm font-medium">{format(day, "EEE")}</div>
            <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="relative max-h-[600px] overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 min-h-[60px] border-b last:border-b-0">
            {/* Time label */}
            <div className="p-1 border-r bg-muted/20 flex items-start justify-end">
              <span className="text-xs font-medium text-muted-foreground sticky top-0">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </span>
            </div>

            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDayAndHour(day, hour);
              
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={cn(
                    "p-1 border-r last:border-r-0 relative",
                    isToday(day) && "bg-blue-50/30 dark:bg-blue-950/10"
                  )}
                >
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="absolute inset-x-0 mx-1 cursor-pointer"
                      style={{
                        top: `${(event.start.getMinutes() / 60) * 100}%`,
                        height: `${(differenceInMinutes(event.end, event.start) / 60) * 100}%`,
                        minHeight: "20px",
                      }}
                    >
                      <EventCard event={event} onClick={onEventClick} compact />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DAY VIEW
// ============================================

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  filters?: {
    scope: EventScope | "all";
    department: string | "all";
    teamMember: string | "all";
  };
}

function DayView({ currentDate, events, onEventClick, filters }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters?.scope !== "all" && event.scope !== filters.scope) return false;
      if (filters?.department !== "all" && event.departmentName !== filters.department) return false;
      if (filters?.teamMember !== "all" && event.host?.id !== filters.teamMember) return false;
      return isSameDay(event.start, currentDate);
    });
  }, [events, currentDate, filters]);

  const getEventsForHour = (hour: number) => {
    return filteredEvents.filter((event) => {
      const eventHour = event.start.getHours();
      return eventHour === hour;
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b bg-muted/20">
        <h3 className="text-lg font-semibold font-['Space_Grotesk'] text-[#1E3A8A]">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </h3>
        <p className="text-sm text-muted-foreground">{filteredEvents.length} events</p>
      </div>

      {/* Time slots */}
      <div className="relative max-h-[600px] overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          
          return (
            <div key={hour} className="flex border-b last:border-b-0 min-h-[80px]">
              {/* Time label */}
              <div className="w-20 p-2 bg-muted/20 flex items-start justify-end border-r">
                <span className="text-xs font-medium text-muted-foreground sticky top-0">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </span>
              </div>

              {/* Events */}
              <div className="flex-1 p-1 relative">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="absolute inset-x-1"
                    style={{
                      top: `${(event.start.getMinutes() / 60) * 100}%`,
                      height: `${(differenceInMinutes(event.end, event.start) / 60) * 100}%`,
                      minHeight: "30px",
                    }}
                  >
                    <EventCard event={event} onClick={onEventClick} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// AGENDA VIEW
// ============================================

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  filters?: {
    scope: EventScope | "all";
    department: string | "all";
    teamMember: string | "all";
  };
}

function AgendaView({ currentDate, events, onEventClick, filters }: AgendaViewProps) {
  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (filters?.scope !== "all" && event.scope !== filters.scope) return false;
      if (filters?.department !== "all" && event.departmentName !== filters.department) return false;
      if (filters?.teamMember !== "all" && event.host?.id !== filters.teamMember) return false;
      return event.start >= startOfMonth(currentDate) && event.start <= endOfMonth(currentDate);
    });

    // Group by date
    const grouped: Record<string, CalendarEvent[]> = {};
    filtered.forEach((event) => {
      const dateKey = format(event.start, "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });

    // Sort by date
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, events]) => ({
        date: parseISO(date),
        events: events.sort((a, b) => a.start.getTime() - b.start.getTime()),
      }));
  }, [events, currentDate, filters]);

  return (
    <div className="space-y-4">
      {filteredEvents.map(({ date, events }) => (
        <Card key={format(date, "yyyy-MM-dd")} className="overflow-hidden">
          <CardHeader className="py-3 bg-muted/20">
            <CardTitle className="text-sm font-medium font-['Space_Grotesk'] text-[#1E3A8A]">
              {format(date, "EEEE, MMMM d, yyyy")}
              {isToday(date) && <Badge className="ml-2 text-[8px] bg-green-500">Today</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onClick={onEventClick} />
            ))}
          </CardContent>
        </Card>
      ))}

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground">
              There are no events scheduled for this period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// LEGEND
// ============================================

interface LegendProps {
  onScopeToggle?: (scope: EventScope) => void;
  activeScopes?: EventScope[];
}

function Legend({ onScopeToggle, activeScopes = ["personal", "organization", "department"] }: LegendProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Legend</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-3">
          {Object.entries(SCOPE_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeScopes.includes(key as EventScope);
            
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-opacity",
                  !isActive && "opacity-50"
                )}
                onClick={() => onScopeToggle?.(key as EventScope)}
              >
                <div className={cn("p-1 rounded", config.lightBg)}>
                  <Icon className={cn("h-3 w-3", config.textColor)} />
                </div>
                <span className="text-xs">{config.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            
            return (
              <div key={key} className="flex items-center gap-2 px-2 py-1 rounded-lg">
                <div className={cn("p-1 rounded", config.lightBg)}>
                  <Icon className={cn("h-3 w-3", config.textColor)} />
                </div>
                <span className="text-xs">{config.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN TEAM CALENDAR COMPONENT
// ============================================

export default function TeamCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    scope: "all" as EventScope | "all",
    department: "all" as string,
    teamMember: "all" as string,
  });
  const [activeScopes, setActiveScopes] = useState<EventScope[]>(["personal", "organization", "department"]);

  // Fetch data
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings("upcoming");
  const { data: eventTypes, isLoading: eventTypesLoading } = useEventTypes();
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();
  const { data: teamMember } = useCurrentTeamMember();
  const { data: departments } = useDepartments();

  const isLoading = bookingsLoading || eventTypesLoading || membersLoading;

  // Transform bookings to calendar events
  const calendarEvents = useMemo((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add bookings
    if (bookings) {
      bookings.forEach((booking) => {
        if (booking.status === "cancelled") return;

        const host = teamMembers?.find((m) => m.user_id === booking.host_user_id);
        const scope = booking.event_types?.scope as EventScope || "personal";

        events.push({
          id: `booking-${booking.id}`,
          title: booking.event_types?.title || "Meeting",
          start: parseISO(booking.start_time),
          end: parseISO(booking.end_time),
          type: "booking",
          scope,
          color: booking.event_types?.color || "#1E3A8A",
          description: booking.guest_notes || undefined,
          location: booking.event_types?.location_details || undefined,
          location_type: booking.event_types?.location_type,
          attendees: [
            {
              id: booking.guest_email,
              name: booking.guest_name,
              email: booking.guest_email,
            },
          ],
          host: host
            ? {
                id: host.user_id,
                name: host.full_name || host.email || "Unknown",
                email: host.email || "",
                avatar: host.avatar_url || undefined,
              }
            : undefined,
          eventTypeId: booking.event_type_id,
          bookingId: booking.id,
          departmentId: booking.event_types?.department_id || undefined,
          departmentName: booking.event_types?.department_id
            ? departments?.find((d) => d.id === booking.event_types?.department_id)?.name
            : undefined,
          organizationId: booking.event_types?.organization_id || undefined,
          status: booking.status as any,
          meetingLink: booking.meeting_link || undefined,
          meetingProvider: booking.meeting_provider || undefined,
        });
      });
    }

    // Add event types as available slots (optional)
    if (eventTypes && false) { // Disabled by default
      eventTypes.forEach((et) => {
        if (et.scope === "personal" && et.user_id !== user?.id) return;

        const scope = et.scope as EventScope;

        events.push({
          id: `event-type-${et.id}`,
          title: `${et.title} (Available)`,
          start: new Date(), // This would need actual availability data
          end: new Date(),
          type: "event_type",
          scope,
          color: et.color || "#10B981",
          description: et.description || undefined,
          location: et.location_details || undefined,
          location_type: et.location_type,
          host: teamMembers?.find((m) => m.user_id === et.user_id)
            ? {
                id: et.user_id,
                name: teamMembers.find((m) => m.user_id === et.user_id)?.full_name || "Unknown",
                email: teamMembers.find((m) => m.user_id === et.user_id)?.email || "",
              }
            : undefined,
          eventTypeId: et.id,
          departmentId: et.department_id || undefined,
          organizationId: et.organization_id || undefined,
        });
      });
    }

    return events;
  }, [bookings, eventTypes, teamMembers, departments, user?.id]);

  // Navigation handlers
  const handlePrev = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleRefresh = () => {
    refetchBookings();
    toast({
      title: "Refreshed",
      description: "Calendar data has been updated",
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleScopeToggle = (scope: EventScope) => {
    setActiveScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  // Filter events based on active scopes
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((event) => activeScopes.includes(event.scope));
  }, [calendarEvents, activeScopes]);

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-[#1E3A8A]/20 border-t-[#1E3A8A] animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#1E3A8A]/40" />
            </div>
          </div>
          <p className="mt-4 text-sm text-[#1E3A8A] font-['Space_Grotesk']">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8 w-full px-4 sm:px-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        filters={{
          scope: filters.scope,
          setScope: (scope) => setFilters((prev) => ({ ...prev, scope })),
          department: filters.department,
          setDepartment: (dept) => setFilters((prev) => ({ ...prev, department: dept })),
          teamMember: filters.teamMember,
          setTeamMember: (member) => setFilters((prev) => ({ ...prev, teamMember: member })),
        }}
        departments={departments?.map((d) => ({ name: d.name, color: d.color }))}
        teamMembers={teamMembers}
      />

      {/* Calendar Views */}
      <motion.div variants={itemVariants} key={view} className="min-h-[600px]">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            filters={filters}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            filters={filters}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            filters={filters}
          />
        )}
        {view === "agenda" && (
          <AgendaView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            filters={filters}
          />
        )}
      </motion.div>

      {/* Legend */}
      <Legend onScopeToggle={handleScopeToggle} activeScopes={activeScopes} />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* CSS for hiding scrollbars */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}