// Bookings.tsx - Enhanced with proper event type support and team bookings
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useBookings, useCancelBooking, useBooking, Booking } from "@/hooks/use-bookings";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Clock, Mail, User, MapPin, Search, XCircle, MessageSquare, 
  ArrowLeft, Phone, Video, Building2, Copy, CheckCircle, AlertCircle,
  Share2, MoreVertical, ChevronRight, CalendarDays, ExternalLink, Loader2,
  Filter, Download, Eye, Trash2, RefreshCw, Grid3x3, List, Table2,
  X, ChevronLeft, Link2, Clipboard, Check, ExternalLink as LinkIcon,
  ChevronsLeft, ChevronsRight, ChevronFirst, ChevronLast,
  TrendingUp, Users, DollarSign, ArrowUp, ArrowDown, Star, Award,
  BarChart3, PieChart, LineChart, Activity, CalendarCheck, CalendarX,
  Clock3, Clock4, Clock5, Clock6, Clock7, Clock8, Clock9, Clock10,
  Clock11, Clock12, Clock1, Clock2, Clock3 as ClockIcon,
  Sunrise, Sunset, Moon, Sun, Coffee, Pizza, Burger, Beer, Wine,
  GlassWater, Utensils, Cake, Candy, IceCream, Cookie, Apple, Orange,
  Banana, Grape, Cherry, Lemon, Avocado, Egg, Milk, Bread, Sandwich,
  Soup, Salad, Sushi, Fish, Shrimp, Meat, Chicken, Croissant, Donut,
  Popcorn, Sparkles, Zap, Bell, BellRing, Menu, Settings2, Home,
  LogOut, HelpCircle, Info, AlertTriangle, CheckSquare, Square,
  Circle, CircleDot, CircleCheck, CircleX, CircleHelp,
  Bot, Sparkle, PartyPopper, Medal, Trophy, Crown, Gem, Diamond,
  Wallet, CreditCard, Receipt, ShoppingBag, ShoppingCart, Package,
  Box, Archive, ArchiveX, ArchiveRestore, File, FileText, FileSpreadsheet,
  FileImage, FileVideo, FileAudio, FileArchive, FileCode, FileJson,
  FileType, FileSpreadsheetIcon, Folder, FolderOpen, FolderPlus,
  FolderMinus, FolderTree, FolderClosed, FolderGit, FolderGit2,
  FolderHeart, FolderCog, FolderKey, FolderLock, FolderUnlock,
  FolderSearch, FolderSearch2, FolderSymlink, FolderSync, FolderUp,
  FolderDown, FolderInput, FolderOutput, FolderArchive, FolderArchiveRestore,
  FolderX, FolderCheck, FolderClock, FolderCloud, FolderCode, FolderDiff,
  FolderDot, FolderKanban, FolderOpenDot, FolderRoot, FolderTreeIcon,
  FolderUpIcon, FolderDownIcon, CalendarCheck2, CalendarDays as CalendarDaysIcon,
  CalendarRange, CalendarClock as CalendarClockIcon, UsersRound, UserCheck,
  UserPlus, UserMinus, UserCog, Users2, Building, Building2 as BuildingIcon,
  Shield, ShieldCheck, ShieldAlert, RadioTower, Wifi, WifiOff,
  Mic, MicOff, Camera, CameraOff, Volume2, VolumeX,
  Headphones, HeadphonesOff, Monitor, MonitorOff
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO, differenceInDays, differenceInHours, isThisWeek, isThisMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// ============================================
// MEETING PROVIDER CONFIGURATION
// ============================================

const MEETING_PROVIDERS = {
  google_meet: {
    label: "Google Meet",
    icon: Video,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    lightBg: "bg-blue-50",
    textColor: "text-blue-700"
  },
  zoom: {
    label: "Zoom",
    icon: Video,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    lightBg: "bg-blue-50",
    textColor: "text-blue-800"
  },
  microsoft_teams: {
    label: "Microsoft Teams",
    icon: Video,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50",
    textColor: "text-purple-700"
  },
  custom: {
    label: "Custom Link",
    icon: Link2,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    lightBg: "bg-gray-50",
    textColor: "text-gray-700"
  }
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
    lightBg: "bg-blue-50"
  },
  organization: {
    label: "Organization",
    icon: Users,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    lightBg: "bg-green-50"
  },
  department: {
    label: "Department",
    icon: Building2,
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50"
  }
};

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

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTime12(iso: string) {
  return format(new Date(iso), "h:mm a");
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d, yyyy");
}

function formatFullDate(iso: string) {
  return format(new Date(iso), "EEEE, MMMM d, yyyy");
}

function getLocationIcon(type: string) {
  switch(type) {
    case 'video': return <Video className="h-3.5 w-3.5 text-[#1E3A8A]" />;
    case 'phone': return <Phone className="h-3.5 w-3.5 text-[#C2410C]" />;
    case 'in_person': return <Building2 className="h-3.5 w-3.5 text-[#1E3A8A]" />;
    default: return <MapPin className="h-3.5 w-3.5 text-[#1E3A8A]" />;
  }
}

function getLocationLabel(type: string) {
  switch(type) {
    case 'video': return 'Video Call';
    case 'phone': return 'Phone Call';
    case 'in_person': return 'In Person';
    default: return type;
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getMeetingProviderInfo(provider: string) {
  return MEETING_PROVIDERS[provider as keyof typeof MEETING_PROVIDERS] || MEETING_PROVIDERS.google_meet;
}

function getMeetingProviderIcon(provider: string) {
  const info = getMeetingProviderInfo(provider);
  const Icon = info.icon;
  return <Icon className={cn("h-4 w-4", info.color)} />;
}

function getMeetingProviderLabel(provider: string) {
  return getMeetingProviderInfo(provider).label;
}

function getScopeConfig(scope: string) {
  return SCOPE_CONFIG[scope as keyof typeof SCOPE_CONFIG] || SCOPE_CONFIG.personal;
}

function getScopeIcon(scope: string) {
  const config = getScopeConfig(scope);
  const Icon = config.icon;
  return <Icon className={cn("h-4 w-4", config.textColor)} />;
}

function getScopeBadge(scope: string) {
  const config = getScopeConfig(scope);
  return cn(config.bgColor, config.textColor, config.borderColor);
}

function getHourIcon(hour: number) {
  const icons = {
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
  const IconComponent = icons[hour as keyof typeof icons] || Clock;
  return <IconComponent className="h-3 w-3" />;
}

function getScheduleTypeIcon(type: string) {
  switch(type) {
    case 'one_time':
      return <CalendarCheck2 className="h-3 w-3 text-purple-600" />;
    case 'flexible':
    default:
      return <CalendarDaysIcon className="h-3 w-3 text-green-600" />;
  }
}

function getScheduleTypeLabel(type: string) {
  switch(type) {
    case 'one_time':
      return 'One-Time';
    case 'flexible':
      return 'Flexible';
    default:
      return type;
  }
}

function getPopularTimeSlot(bookings: Booking[]) {
  if (!bookings || bookings.length === 0) return '9-11 AM';
  
  const hourCounts: Record<number, number> = {};
  
  bookings.forEach(booking => {
    const hour = new Date(booking.start_time).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  let maxCount = 0;
  let popularHour = 9;
  
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      popularHour = parseInt(hour);
    }
  });
  
  const startHour = popularHour;
  const endHour = popularHour + 1;
  
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };
  
  return `${formatHour(startHour)}-${formatHour(endHour)}`;
}

// ============================================
// STATS CARD COMPONENT
// ============================================

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
  onClick?: () => void;
  linkTo?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  description,
  progress,
  footer,
  onClick,
  linkTo
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

  if (isMobile) {
    return (
      <motion.div
        variants={itemVariants}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="w-full"
      >
        <Wrapper
          {...wrapperProps}
          className={cn(
            "block rounded-xl border p-3 transition-all duration-300",
            colors.bg,
            colors.border,
            (onClick || linkTo) && "cursor-pointer active:scale-95"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={cn(
                "rounded-lg p-2 shadow-sm shrink-0",
                colors.icon
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-['Space_Grotesk'] truncate">{value}</h3>
                  {trend && (
                    <span className={cn(
                      "text-[10px] font-medium whitespace-nowrap",
                      trend.direction === 'up' ? 'text-green-600' : 
                      trend.direction === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                      {trend.direction === 'up' && '↑'}
                      {trend.direction === 'down' && '↓'}
                      {trend.value}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {(onClick || linkTo) && (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>

          {description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2 border-t pt-2">
              {description}
            </p>
          )}

          {progress !== undefined && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn("font-medium", colors.text)}>{progress}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
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
            <div className="mt-2 border-t border-border/50 pt-2">
              <p className="text-[10px] text-muted-foreground">{footer}</p>
            </div>
          )}
        </Wrapper>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
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
          (onClick || linkTo) && "cursor-pointer hover:shadow-lg"
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
          
          {trend && (
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

// ============================================
// MOBILE BOTTOM NAVIGATION
// ============================================

const MobileBottomNav = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Upcoming</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Clock className="h-5 w-5" />
          <span className="text-xs">Past</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative">
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            3
          </div>
          <XCircle className="h-5 w-5" />
          <span className="text-xs">Cancelled</span>
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
                <a href="/dashboard">
                  <Home className="h-4 w-4" />
                  Dashboard
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <a href="/dashboard/events">
                  <Zap className="h-4 w-4" />
                  Events
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <a href="/dashboard/team">
                  <Users className="h-4 w-4" />
                  Team
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <a href="/dashboard/availability">
                  <Clock className="h-4 w-4" />
                  Availability
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <a href="/dashboard/settings">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MEETING LINK COMPONENT
// ============================================

function MeetingLinkDisplay({ link, provider = 'google_meet', label = "Meeting Link", isPermanent = false }: { link?: string | null; provider?: string; label?: string; isPermanent?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const providerInfo = getMeetingProviderInfo(provider);
  const Icon = providerInfo.icon;

  if (!link) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Meeting link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", providerInfo.color)} />
        <p className="text-xs font-medium text-muted-foreground">
          {providerInfo.label} {label}
          {isPermanent && <span className="ml-1 text-green-600">(Permanent)</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted/30 rounded-lg p-2 sm:p-3 border text-xs sm:text-sm font-mono truncate text-[#1E3A8A]">
          {link}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 h-8 sm:h-9 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                ) : (
                  <Clipboard className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy meeting link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 h-8 sm:h-9 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                onClick={() => window.open(link, '_blank')}
              >
                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                <span className="hidden sm:inline">Join</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open meeting link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ============================================
// CALENDAR EVENT LINK COMPONENT
// ============================================

function CalendarEventLink({ calendarHtmlLink }: { calendarHtmlLink?: string | null }) {
  if (!calendarHtmlLink) return null;

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">Calendar Event</p>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
        onClick={() => window.open(calendarHtmlLink, '_blank')}
      >
        <ExternalLink className="h-3 w-3 text-[#1E3A8A]" />
        View in Google Calendar
      </Button>
    </div>
  );
}

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

function Pagination({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, totalItems }: PaginationProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const getPageNumbers = () => {
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Showing</span>
        <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-16 text-xs border-[#1E3A8A]/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={size.toString()} className="text-xs">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>of {totalItems} bookings</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8 text-xs",
              currentPage === page ? "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90" : "border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
            )}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// BOOKING DETAILS MODAL - Enhanced with full event type support
// ============================================

function BookingDetailsModal({ 
  bookingId, 
  open, 
  onOpenChange 
}: { 
  bookingId: string | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { data: booking, isLoading, error } = useBooking(bookingId || undefined);
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCancel = async () => {
    if (!booking) return;
    try {
      await cancelMutation.mutateAsync(booking.id);
      toast({ 
        title: "✅ Booking cancelled", 
        description: "The booking has been successfully cancelled."
      });

      onOpenChange(false);
      setShowCancelConfirm(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Get meeting provider info
  const meetingProvider = booking?.meeting_provider || booking?.event_types?.meeting_provider || 'google_meet';
  const providerInfo = getMeetingProviderInfo(meetingProvider);
  const ProviderIcon = providerInfo.icon;

  // Get scope info
  const scope = booking?.event_types?.scope || 'personal';
  const scopeConfig = getScopeConfig(scope);
  const ScopeIcon = scopeConfig.icon;

  // Determine if this is a team event
  const isTeamEvent = scope === 'organization' || scope === 'department';
  const isOneTimeEvent = booking?.event_types?.schedule_type === 'one_time';
  const isPermanentLink = booking?.event_types?.permanent_meeting_link === booking?.meeting_link;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden",
          "w-full",
          isMobile ? "h-[100dvh] max-w-[100vw] rounded-none" : "max-w-4xl max-h-[90vh] rounded-2xl"
        )}
      >
        {isLoading ? (
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-72" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
              <Skeleton className="h-32 sm:h-40" />
              <Skeleton className="h-32 sm:h-40" />
            </div>
          </div>
        ) : error || !booking ? (
          <div className="py-12 sm:py-16 text-center px-4">
            <AlertCircle className="h-12 sm:h-16 w-12 sm:w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[#1E3A8A]">Booking not found</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
            <Button size={isMobile ? "default" : "lg"} onClick={() => onOpenChange(false)} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">Close</Button>
          </div>
        ) : (
          <>
            {/* Colored header strip */}
            <div 
              className="h-1.5 sm:h-2 w-full shrink-0" 
              style={{ 
                background: `linear-gradient(90deg, ${booking.event_types?.color || '#1E3A8A'}, ${booking.event_types?.color || '#1E3A8A'}80, ${booking.event_types?.color || '#1E3A8A'}20)` 
              }} 
            />

            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full hover:bg-muted" 
                  onClick={() => onOpenChange(false)}
                >
                  <ChevronLeft className="h-4 w-4 sm:hidden" />
                  <X className="hidden sm:block h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold font-['Space_Grotesk'] truncate text-[#1E3A8A]">
                      {booking.event_types?.title || "Meeting"}
                    </h2>
                    <Badge className={cn("text-[10px]", getScopeBadge(scope))}>
                      <ScopeIcon className="h-2.5 w-2.5 mr-1" />
                      {scopeConfig.label}
                    </Badge>
                    {isOneTimeEvent && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
                        <CalendarCheck2 className="h-2.5 w-2.5 mr-1" />
                        One-Time
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    with {booking.guest_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Badge 
                  variant={booking.status === 'confirmed' ? 'default' : 'destructive'}
                  className={cn(
                    "capitalize px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm whitespace-nowrap",
                    booking.status === 'confirmed' && "bg-green-500/10 text-green-600 border-green-500/20"
                  )}
                >
                  {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 hidden sm:inline" />}
                  {booking.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted">
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 sm:w-40">
                    <DropdownMenuItem onClick={() => copyToClipboard(booking.id)} className="cursor-pointer text-sm hover:text-[#1E3A8A]">
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer text-sm hover:text-[#1E3A8A]">
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Print
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-sm hover:text-[#1E3A8A]">
                      <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Scrollable content */}
            <div 
              className={cn(
                "overflow-y-auto overscroll-contain",
                "p-3 sm:p-4 md:p-6 lg:p-8",
                "space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8"
              )} 
              style={{ 
                maxHeight: isMobile ? "calc(100dvh - 120px)" : "calc(90vh - 140px)"
              }}
            >
              {/* Event Type Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("text-xs", getScopeBadge(scope))}>
                  <ScopeIcon className="h-3 w-3 mr-1" />
                  {scopeConfig.label}
                </Badge>
                {isTeamEvent && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    <UsersRound className="h-3 w-3 mr-1" />
                    Team Event
                  </Badge>
                )}
                {isOneTimeEvent && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                    <CalendarCheck2 className="h-3 w-3 mr-1" />
                    Fixed Date
                  </Badge>
                )}
                {booking.event_types?.require_approval && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                    <Clock3 className="h-3 w-3 mr-1" />
                    Pending Approval
                  </Badge>
                )}
              </div>

              {/* Meeting Provider Info */}
              {booking.event_types?.location_type === 'video' && (
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border", providerInfo.lightBg, providerInfo.borderColor)}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className={cn("p-2 sm:p-2.5 rounded-lg sm:rounded-xl", providerInfo.bgColor)}>
                      <ProviderIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", providerInfo.color)} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Meeting Provider</p>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1E3A8A]">{providerInfo.label}</p>
                    </div>
                  </div>
                  
                  {booking.meeting_settings && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {booking.meeting_settings.host_join_first && (
                        <Badge variant="outline" className={cn("justify-center", providerInfo.borderColor)}>
                          Host joins first
                        </Badge>
                      )}
                      {booking.meeting_settings.is_group_event && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 justify-center">
                          <Users className="h-3 w-3 mr-1" />
                          Group Event
                        </Badge>
                      )}
                      {isPermanentLink && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 justify-center">
                          <Link2 className="h-3 w-3 mr-1" />
                          Permanent Link
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Meeting Link Section */}
              {booking.event_types?.location_type === 'video' && booking.meeting_link && (
                <div className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-[#1E3A8A]/20">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                      <ProviderIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", providerInfo.color)} />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-[#1E3A8A]">{providerInfo.label} Link</p>
                  </div>
                  <MeetingLinkDisplay 
                    link={booking.meeting_link} 
                    provider={meetingProvider}
                    label="Meeting Link" 
                    isPermanent={isPermanentLink}
                  />
                  
                  <Button
                    className="w-full mt-3 gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                    size={isMobile ? "default" : "lg"}
                    onClick={() => window.open(booking.meeting_link!, '_blank')}
                  >
                    <ProviderIcon className="h-4 w-4" />
                    Join {providerInfo.label} Now
                  </Button>
                </div>
              )}

              {/* Date & Time Card */}
              <div className="bg-gradient-to-br from-[#1E3A8A]/5 via-[#1E3A8A]/5 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    {isOneTimeEvent ? (
                      <CalendarCheck2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {isOneTimeEvent ? 'Fixed Date & Time' : 'Date & Time'}
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1E3A8A]">{formatFullDate(booking.start_time)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-background/50">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium">Starts</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{formatTime12(booking.start_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-background/50">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium">Ends</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{formatTime12(booking.end_time)}</p>
                    </div>
                  </div>
                </div>
                
                {booking.event_types?.duration && (
                  <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    Duration: {booking.event_types.duration} minutes
                    {isOneTimeEvent && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] ml-2">
                        Fixed Time
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Guest Information Card */}
              <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#1E3A8A]">Guest Information</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-[#1E3A8A]/20 shrink-0">
                    <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-base sm:text-lg">
                      {getInitials(booking.guest_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 sm:space-y-3 flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
                        <p className="text-sm sm:text-base font-medium text-[#1E3A8A] break-words">{booking.guest_name}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                        <a 
                          href={`mailto:${booking.guest_email}`} 
                          className="text-sm sm:text-base text-[#1E3A8A] hover:text-[#C2410C] inline-flex items-center gap-1 break-all"
                        >
                          {booking.guest_email}
                          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        </a>
                      </div>
                    </div>
                    {booking.guest_timezone && (
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Timezone</p>
                        <p className="text-sm sm:text-base text-[#1E3A8A] break-words">{booking.guest_timezone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#1E3A8A]">Location</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-background text-[#1E3A8A] shrink-0">
                    {getLocationIcon(booking.event_types?.location_type || 'video')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-[#1E3A8A] capitalize">
                      {getLocationLabel(booking.event_types?.location_type || 'video')}
                    </p>
                    {booking.event_types?.location_type !== 'video' && booking.event_types?.location_details && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{booking.event_types.location_details}</p>
                    )}
                    {booking.event_types?.location_type === 'video' && booking.meeting_link && (
                      <div className="mt-2">
                        <MeetingLinkDisplay 
                          link={booking.meeting_link} 
                          provider={meetingProvider}
                          label="Meeting Link" 
                          isPermanent={isPermanentLink}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendar Event Link */}
                {booking.calendar_html_link && (
                  <CalendarEventLink calendarHtmlLink={booking.calendar_html_link} />
                )}
              </div>

              {/* Guest Notes */}
              {booking.guest_notes && (
                <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-[#1E3A8A]">Guest Notes</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30">
                    <p className="text-xs sm:text-sm leading-relaxed break-words">"{booking.guest_notes}"</p>
                  </div>
                </div>
              )}

              {/* Conference Data */}
              {booking.conference_data && (
                <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 bg-blue-50/50 dark:bg-blue-950/10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600">
                      <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-blue-700">Conference Details</p>
                      <p className="text-xs text-muted-foreground">Meeting created successfully</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#1E3A8A]">Booking Timeline</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 mt-1.5" />
                      <div className="absolute top-4 bottom-0 w-0.5 bg-border h-full" />
                    </div>
                    <div className="flex-1 pb-3 sm:pb-4">
                      <p className="text-sm sm:text-base font-medium text-[#1E3A8A]">Booking Created</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  {booking.status === 'cancelled' && booking.cancelled_at && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive mt-1.5" />
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium text-[#1E3A8A]">Booking Cancelled</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(booking.cancelled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-2 sm:h-4" />
            </div>

            {/* Footer with cancel button */}
            {new Date(booking.start_time) > new Date() && booking.status === 'confirmed' && (
              <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 sm:p-4 md:p-6 shrink-0">
                <div className="max-w-3xl mx-auto">
                  {showCancelConfirm ? (
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm text-center text-destructive font-medium">
                        Are you sure you want to cancel this booking?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="destructive" 
                          size={isMobile ? "default" : "lg"}
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="flex-1 gap-2"
                        >
                          {cancelMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Yes, cancel
                        </Button>
                        <Button 
                          variant="outline" 
                          size={isMobile ? "default" : "lg"}
                          onClick={() => setShowCancelConfirm(false)}
                          className="flex-1 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                        >
                          No, go back
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button 
                        variant="destructive" 
                        size={isMobile ? "default" : "lg"}
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={cancelMutation.isPending}
                        className="w-full gap-2 h-10 sm:h-12 text-sm sm:text-base"
                      >
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        Cancel this booking
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2 hidden sm:block">
                        This action cannot be undone. The guest will be notified via email.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// BOOKINGS TABLE (DESKTOP)
// ============================================

function BookingsTable({ bookings, onCancel, onRowClick }: { 
  bookings: Booking[]; 
  onCancel: (b: Booking) => void;
  onRowClick: (id: string) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const copyMeetingLink = (e: React.MouseEvent, id: string, link: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast({ title: "✅ Copied!", description: "Meeting link copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-md border overflow-hidden w-full">
      <Table>
        <TableHeader className="bg-[#1E3A8A]/5">
          <TableRow>
            <TableHead className="w-[100px] text-[#1E3A8A]">Date</TableHead>
            <TableHead className="w-[70px] text-[#1E3A8A]">Time</TableHead>
            <TableHead className="w-[150px] text-[#1E3A8A]">Event</TableHead>
            <TableHead className="w-[70px] text-[#1E3A8A]">Scope</TableHead>
            <TableHead className="w-[140px] text-[#1E3A8A]">Guest</TableHead>
            <TableHead className="w-[60px] text-[#1E3A8A]">Dur.</TableHead>
            <TableHead className="w-[80px] text-[#1E3A8A]">Location</TableHead>
            <TableHead className="w-[70px] text-[#1E3A8A]">Provider</TableHead>
            <TableHead className="w-[150px] text-[#1E3A8A]">Meeting Link</TableHead>
            <TableHead className="w-[70px] text-[#1E3A8A]">Status</TableHead>
            <TableHead className="w-[50px] text-right text-[#1E3A8A]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const startDate = new Date(booking.start_time);
            const isUpcoming = startDate > new Date() && booking.status === 'confirmed';
            const meetingProvider = booking.meeting_provider || booking.event_types?.meeting_provider || 'google_meet';
            const providerInfo = getMeetingProviderInfo(meetingProvider);
            const ProviderIcon = providerInfo.icon;
            const scope = booking.event_types?.scope || 'personal';
            const scopeConfig = getScopeConfig(scope);
            const ScopeIcon = scopeConfig.icon;
            const isOneTimeEvent = booking.event_types?.schedule_type === 'one_time';
            const isPermanentLink = booking.event_types?.permanent_meeting_link === booking.meeting_link;
            
            return (
              <TableRow 
                key={booking.id}
                className="cursor-pointer hover:bg-[#1E3A8A]/5 transition-colors"
                onClick={() => onRowClick(booking.id)}
              >
                <TableCell className="font-medium text-sm whitespace-nowrap">
                  {formatDate(booking.start_time)}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatTime12(booking.start_time)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium font-['Space_Grotesk'] text-[#1E3A8A] truncate max-w-[100px]">
                        {booking.event_types?.title || "Meeting"}
                      </span>
                      {isOneTimeEvent && (
                        <CalendarCheck2 className="h-3 w-3 text-purple-600 shrink-0" />
                      )}
                    </div>
                    {booking.event_types?.color && (
                      <div className="flex items-center gap-1">
                        <div 
                          className="h-2 w-2 rounded-full shrink-0" 
                          style={{ backgroundColor: booking.event_types.color }}
                        />
                        <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                          {booking.event_types.title?.substring(0, 15)}...
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("text-[10px] px-1.5 py-0", getScopeBadge(scope))}>
                    <ScopeIcon className="h-2.5 w-2.5 mr-1" />
                    {scope === 'personal' ? 'Per' : scope === 'organization' ? 'Org' : 'Dept'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 max-w-[120px]">
                    <div className="text-sm font-medium text-[#1E3A8A] truncate">{booking.guest_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{booking.guest_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 border-[#1E3A8A]/20">
                    {booking.event_types?.duration || 30} min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getLocationIcon(booking.event_types?.location_type || 'video')}
                    <span className="text-[10px] capitalize text-[#1E3A8A]">
                      {booking.event_types?.location_type === 'video' ? 'Video' : 
                       booking.event_types?.location_type === 'phone' ? 'Phone' : 'In person'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.event_types?.location_type === 'video' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <ProviderIcon className={cn("h-3 w-3", providerInfo.color)} />
                            <span className="text-[10px]">{providerInfo.label.split(' ')[0]}</span>
                            {isPermanentLink && (
                              <span className="text-[8px] text-green-600 ml-0.5">●</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{providerInfo.label}{isPermanentLink ? ' (Permanent Link)' : ''}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell>
                  {booking.event_types?.location_type === 'video' && booking.meeting_link ? (
                    <div className="flex items-center gap-1 max-w-[130px]">
                      <div className="flex-1 truncate">
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {booking.meeting_link.replace(/^https?:\/\//, '').substring(0, 15)}...
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0 hover:text-[#1E3A8A]"
                              onClick={(e) => copyMeetingLink(e, booking.id, booking.meeting_link!)}
                            >
                              {copiedId === booking.id ? (
                                <Check className="h-2.5 w-2.5 text-[#1E3A8A]" />
                              ) : (
                                <Clipboard className="h-2.5 w-2.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy link</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0 hover:text-[#1E3A8A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(booking.meeting_link!, '_blank');
                              }}
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Join</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={booking.status === 'confirmed' ? 'outline' : 'destructive'}
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      booking.status === 'confirmed' && "bg-green-500/10 text-green-600 border-green-500/20"
                    )}
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isUpcoming && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancel(booking);
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cancel booking</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
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
// BOOKING CARD FOR MOBILE VIEW
// ============================================

function BookingCard({ booking, onCancel, onClick }: { booking: Booking; onCancel: (b: Booking) => void; onClick: () => void }) {
  const event = booking.event_types;
  const startDate = new Date(booking.start_time);
  const isUpcoming = startDate > new Date() && booking.status === 'confirmed';
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const meetingProvider = booking.meeting_provider || event?.meeting_provider || 'google_meet';
  const providerInfo = getMeetingProviderInfo(meetingProvider);
  const ProviderIcon = providerInfo.icon;
  const scope = event?.scope || 'personal';
  const scopeConfig = getScopeConfig(scope);
  const ScopeIcon = scopeConfig.icon;
  const isOneTimeEvent = event?.schedule_type === 'one_time';
  const isPermanentLink = event?.permanent_meeting_link === booking.meeting_link;

  const copyMeetingLink = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Meeting link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-[#1E3A8A]/20"
        onClick={onClick}
      >
        <div className="h-1" style={{ backgroundColor: event?.color || "#1E3A8A" }} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1 flex-wrap">
              <Badge 
                variant={booking.status === 'confirmed' ? 'outline' : 'destructive'}
                className={cn(
                  "text-[10px] px-2 py-0",
                  booking.status === 'confirmed' && "bg-green-500/10 text-green-600 border-green-500/20"
                )}
              >
                {booking.status}
              </Badge>
              <Badge className={cn("text-[8px] px-1.5 py-0", getScopeBadge(scope))}>
                <ScopeIcon className="h-2 w-2 mr-0.5" />
                {scope === 'personal' ? 'Personal' : scope === 'organization' ? 'Org' : 'Dept'}
              </Badge>
              {isOneTimeEvent && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[8px] px-1.5 py-0">
                  <CalendarCheck2 className="h-2 w-2 mr-0.5" />
                  Fixed
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatDate(booking.start_time)}
            </span>
          </div>

          <h3 className="font-semibold text-base mb-2 truncate font-['Space_Grotesk'] text-[#1E3A8A]">
            {event?.title || "Meeting"}
          </h3>

          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0 text-[#1E3A8A]" />
              <span>{formatTime12(booking.start_time)}</span>
              {event?.duration && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 border-[#1E3A8A]/20">
                  {event.duration}min
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0 text-[#1E3A8A]" />
              <span className="truncate text-[#1E3A8A] max-w-[150px]">{booking.guest_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getLocationIcon(event?.location_type || 'video')}
              <span className="capitalize">{getLocationLabel(event?.location_type || 'video')}</span>
              {event?.location_type === 'video' && (
                <ProviderIcon className={cn("h-3 w-3", providerInfo.color)} />
              )}
            </div>
          </div>

          {/* Meeting Link Preview */}
          {event?.location_type === 'video' && booking.meeting_link && (
            <div className={cn("mt-2 mb-3 p-2 rounded-lg border", providerInfo.lightBg, providerInfo.borderColor)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <ProviderIcon className={cn("h-3 w-3", providerInfo.color)} />
                  <span className={cn("text-[10px] font-medium truncate", providerInfo.color)}>
                    {providerInfo.label}
                  </span>
                  {isPermanentLink && (
                    <span className="text-[8px] text-green-600">●</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-[#1E3A8A]"
                          onClick={(e) => copyMeetingLink(e, booking.meeting_link!)}
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-[#1E3A8A]" />
                          ) : (
                            <Clipboard className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-[#1E3A8A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(booking.meeting_link!, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Join meeting</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}

          {isUpcoming && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-destructive hover:text-destructive gap-1 text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(booking);
              }}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// MAIN BOOKINGS PAGE
// ============================================

export default function Bookings() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: bookings, isLoading, refetch, error } = useBookings(tab, search);
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // If there's a bookingId in the URL, show the modal
  useEffect(() => {
    if (bookingId) {
      setSelectedBookingId(bookingId);
      setModalOpen(true);
    }
  }, [bookingId]);

  const filtered = bookings || [];

  // Calculate pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBookings = filtered.slice(startIndex, endIndex);

  // Reset to first page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, search]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const upcoming = bookings?.filter(b => b.status === 'confirmed' && new Date(b.start_time) > now) || [];
    const past = bookings?.filter(b => b.status === 'confirmed' && new Date(b.start_time) < now) || [];
    const cancelled = bookings?.filter(b => b.status === 'cancelled') || [];
    
    const thisWeek = bookings?.filter(b => 
      isWithinInterval(new Date(b.start_time), { start: weekStart, end: weekEnd })
    ) || [];
    
    const totalRevenue = past.reduce((acc, b) => 
      acc + (b.event_types?.price_cents || 0), 0
    ) / 100;
    
    const avgDuration = upcoming.reduce((acc, b) => 
      acc + (b.event_types?.duration || 0), 0
    ) / (upcoming.length || 1);
    
    const completionRate = past.length > 0 && (past.length + cancelled.length) > 0
      ? Math.round((past.length / (past.length + cancelled.length)) * 100)
      : 0;
    
    const nextBooking = upcoming.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )[0];
    
    const popularTime = getPopularTimeSlot(bookings || []);
    
    // Count by scope
    const personalEvents = bookings?.filter(b => b.event_types?.scope === 'personal').length || 0;
    const organizationEvents = bookings?.filter(b => b.event_types?.scope === 'organization').length || 0;
    const departmentEvents = bookings?.filter(b => b.event_types?.scope === 'department').length || 0;
    
    // Count by meeting provider
    const providerCounts: Record<string, number> = {};
    bookings?.forEach(b => {
      const provider = b.meeting_provider || b.event_types?.meeting_provider || 'google_meet';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });
    
    // Count one-time events
    const oneTimeEvents = bookings?.filter(b => b.event_types?.schedule_type === 'one_time').length || 0;
    
    return {
      total: bookings?.length || 0,
      upcoming: upcoming.length,
      past: past.length,
      cancelled: cancelled.length,
      thisWeek: thisWeek.length,
      totalRevenue,
      avgDuration,
      completionRate,
      nextBooking: nextBooking ? formatDate(nextBooking.start_time) : 'None',
      nextBookingTime: nextBooking ? formatTime12(nextBooking.start_time) : '',
      popularTime,
      conversionRate: Math.round((past.length / (bookings?.length || 1)) * 100) || 0,
      personalEvents,
      organizationEvents,
      departmentEvents,
      oneTimeEvents,
      providerCounts
    };
  }, [bookings]);

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelMutation.mutateAsync(cancelDialog.id);
      toast({ 
        title: "✅ Booking cancelled", 
        description: "The booking has been successfully cancelled."
      });
      setCancelDialog(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedBookingId(id);
    setModalOpen(true);
    window.history.pushState({}, '', `/dashboard/bookings/${id}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookingId(null);
    window.history.pushState({}, '', '/dashboard/bookings');
  };

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load bookings</h3>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your scheduled meetings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 text-[#1E3A8A]" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
            <Download className="h-4 w-4 text-[#1E3A8A]" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Dashboard-style Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total Bookings"
          value={stats.total}
          icon={CalendarCheck}
          trend={{ value: 12, direction: 'up', label: 'vs last month' }}
          description={`${stats.upcoming} upcoming · ${stats.past} past`}
          color="blue"
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeek}
          icon={CalendarDays}
          trend={{ value: 8, direction: 'up', label: 'this week' }}
          description={`Next: ${stats.nextBooking} ${stats.nextBookingTime}`}
          color="orange"
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 23, direction: 'up', label: 'this month' }}
          description={`Avg $${(stats.totalRevenue / (stats.past || 1)).toFixed(2)} per booking`}
          color="green"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={Award}
          trend={{ value: 5, direction: 'up', label: 'improved' }}
          description={`${stats.cancelled} cancelled · ${stats.oneTimeEvents} one-time`}
          color="purple"
          progress={stats.completionRate}
        />
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-sm sm:text-base font-semibold">{Math.round(stats.avgDuration)} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Conversion</p>
                <p className="text-sm sm:text-base font-semibold">{stats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-amber-100 p-1.5 sm:p-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
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
                <CalendarCheck2 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">One-Time</p>
                <p className="text-sm sm:text-base font-semibold">{stats.oneTimeEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Type Breakdown */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-1.5">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Personal Events</p>
                <p className="text-lg font-semibold text-blue-600">{stats.personalEvents}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {stats.total > 0 ? Math.round((stats.personalEvents / stats.total) * 100) : 0}%
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-1.5">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Organization Events</p>
                <p className="text-lg font-semibold text-green-600">{stats.organizationEvents}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {stats.total > 0 ? Math.round((stats.organizationEvents / stats.total) * 100) : 0}%
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-1.5">
                <Building2 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department Events</p>
                <p className="text-lg font-semibold text-purple-600">{stats.departmentEvents}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {stats.total > 0 ? Math.round((stats.departmentEvents / stats.total) * 100) : 0}%
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and controls */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px] bg-[#1E3A8A]/10">
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Upcoming ({stats.upcoming})
              </TabsTrigger>
              <TabsTrigger value="past" className="text-xs sm:text-sm data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Past ({stats.past})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Cancelled ({stats.cancelled})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="icon"
                      className={cn("h-7 w-7", viewMode === "table" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                      onClick={() => setViewMode("table")}
                      disabled={isMobile}
                    >
                      <Table2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Table view (desktop only)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      className={cn("h-7 w-7", viewMode === "grid" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Grid view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
          <Input
            placeholder="Search by name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20 h-9 sm:h-10 text-sm"
          />
        </div>
      </motion.div>

      {/* Bookings display */}
      <motion.div 
        variants={itemVariants}
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {isLoading ? (
          <div className={cn(
            "grid gap-4 w-full",
            viewMode === "grid" && !isMobile ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed w-full">
            <CardContent className="flex flex-col items-center py-12 sm:py-16 text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
                <div className="relative bg-gradient-to-br from-[#1E3A8A]/10 to-[#C2410C]/5 rounded-full p-3 sm:p-4">
                  <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-[#1E3A8A]/60" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#1E3A8A]">
                {tab === "upcoming" ? "No upcoming bookings" : 
                 tab === "past" ? "No past bookings" : "No cancelled bookings"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4 sm:mb-6">
                {tab === "upcoming" 
                  ? "Share your booking link to start receiving appointments." 
                  : "Bookings will appear here once you have them."}
              </p>
              <Button asChild size={isMobile ? "sm" : "default"} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Link to="/dashboard/events">Create Event Type</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "table" && !isMobile ? (
              <div className="w-full overflow-x-auto">
                <BookingsTable 
                  bookings={paginatedBookings} 
                  onCancel={setCancelDialog}
                  onRowClick={handleRowClick}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                {paginatedBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id}
                    booking={booking}
                    onCancel={setCancelDialog}
                    onClick={() => handleRowClick(booking.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={totalItems}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Booking Details Modal */}
      <BookingDetailsModal 
        bookingId={selectedBookingId}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(o) => !o && setCancelDialog(null)}>
        <DialogContent className="max-w-sm mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl text-[#1E3A8A]">Cancel booking?</DialogTitle>
            <DialogDescription className="space-y-2 text-sm sm:text-base">
              <p>
                This will cancel the booking with <strong className="text-[#1E3A8A]">{cancelDialog?.guest_name}</strong>.
              </p>
              {cancelDialog && (
                <p className="text-xs sm:text-sm bg-muted/50 p-2 sm:p-3 rounded-lg text-[#1E3A8A]">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 text-[#1E3A8A]" />
                  {formatFullDate(cancelDialog.start_time)} at {formatTime12(cancelDialog.start_time)}
                </p>
              )}
              <p className="text-destructive font-medium text-xs sm:text-sm">
                This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending} className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Yes, cancel booking</span>
              )}
            </Button>
            <Button variant="outline" onClick={() => setCancelDialog(null)} className="flex-1 text-xs sm:text-sm h-9 sm:h-10 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
              Keep booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.total}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.upcoming}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Upcoming</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">${stats.totalRevenue.toFixed(0)}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.oneTimeEvents}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">One-Time</p>
        </div>
      </motion.div>

      {/* Pasbest Ventures Attribution */}
      <motion.div variants={itemVariants} className="mt-4 pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <a 
            href="https://pasbestventures.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors font-medium"
          >
            Pasbest Ventures Limited
          </a>
        </p>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      <style jsx>{`
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