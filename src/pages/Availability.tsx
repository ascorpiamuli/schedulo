import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAvailability,
  useAvailabilityOverrides,
  useSaveAvailability,
  useCreateOverride,
  useDeleteOverride,
  DAYS,
} from "@/hooks/use-availability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Plus, 
  Trash2, 
  CalendarOff, 
  Save, 
  Check, 
  AlertCircle,
  Sparkles,
  Zap,
  Copy,
  Settings2,
  Coffee,
  Sun,
  Moon,
  Timer,
  RefreshCw,
  CalendarDays,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Menu,
  Bell,
  BarChart3,
  Activity,
  Award,
  Target,
  Clock3,
  Hourglass,
  Coffee as CoffeeIcon,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Clock4,
  Clock8,
  Clock12,
  Clock1,
  Clock2,
  Clock3 as Clock3Icon,
  Clock4 as Clock4Icon,
  Clock5,
  Clock6,
  Clock7,
  Clock8 as Clock8Icon,
  Clock9,
  Clock10,
  Clock11,
  Clock12 as Clock12Icon
} from "lucide-react";
import { format, differenceInDays, differenceInHours, isToday, isTomorrow, addDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================
// CONSTANTS & UTILITIES
// ============================================

// Generate time options in 30-min increments
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function getTimeIcon(time: string) {
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return <Sun className="h-3 w-3 text-amber-500" />;
  if (hour < 17) return <Sun className="h-3 w-3 text-[#C2410C]" />;
  return <Moon className="h-3 w-3 text-[#1E3A8A]" />;
}

function getHourIcon(hour: number) {
  const icons = {
    0: Clock12Icon,
    1: Clock1,
    2: Clock2,
    3: Clock3Icon,
    4: Clock4Icon,
    5: Clock5,
    6: Clock6,
    7: Clock7,
    8: Clock8Icon,
    9: Clock9,
    10: Clock10,
    11: Clock11,
    12: Clock12Icon,
    13: Clock1,
    14: Clock2,
    15: Clock3Icon,
    16: Clock4Icon,
    17: Clock5,
    18: Clock6,
    19: Clock7,
    20: Clock8Icon,
    21: Clock9,
    22: Clock10,
    23: Clock11,
  };
  const IconComponent = icons[hour as keyof typeof icons] || Clock;
  return <IconComponent className="h-3 w-3" />;
}

interface DaySlot {
  enabled: boolean;
  ranges: { start: string; end: string }[];
}

type WeekSchedule = DaySlot[];

const DEFAULT_SCHEDULE: WeekSchedule = DAYS.map((_, i) => ({
  enabled: i >= 1 && i <= 5,
  ranges: i >= 1 && i <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
}));

const PRESETS = [
  { name: "Standard", icon: Clock, schedule: DAYS.map((_, i) => i >= 1 && i <= 5), color: "blue" },
  { name: "Full week", icon: CalendarDays, schedule: DAYS.map(() => true), color: "green" },
  { name: "Weekends", icon: Coffee, schedule: DAYS.map((_, i) => i === 0 || i === 6), color: "orange" },
  { name: "Custom", icon: Settings2, schedule: DAYS.map(() => false), color: "purple" },
];

// Animation variants
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
// UI COMPONENTS
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
  const Wrapper = linkTo ? 'a' : onClick ? 'button' : 'div';
  const wrapperProps = linkTo ? { href: linkTo } : onClick ? { onClick } : {};

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
              <span className="text-muted-foreground">Coverage</span>
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

// Mobile Bottom Navigation
const MobileBottomNav = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Clock className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <CalendarOff className="h-5 w-5" />
          <span className="text-xs">Overrides</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative">
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            2
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
                <a href="/dashboard">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <a href="/dashboard/events">
                  <Calendar className="h-4 w-4" />
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
// MAIN AVAILABILITY COMPONENT
// ============================================

export default function Availability() {
  const { data: slots, isLoading } = useAvailability();
  const { data: overrides } = useAvailabilityOverrides();
  const saveMutation = useSaveAvailability();
  const createOverride = useCreateOverride();
  const deleteOverride = useDeleteOverride();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [dirty, setDirty] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [overrideReason, setOverrideReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Standard");
  const [showTimeTips, setShowTimeTips] = useState(true);
  const [activeTab, setActiveTab] = useState("schedule");

  // Load existing availability into state
  useEffect(() => {
    if (slots && slots.length > 0) {
      const newSchedule: WeekSchedule = DAYS.map(() => ({ enabled: false, ranges: [] }));
      slots.forEach((s) => {
        newSchedule[s.day_of_week].enabled = true;
        newSchedule[s.day_of_week].ranges.push({
          start: s.start_time.substring(0, 5),
          end: s.end_time.substring(0, 5),
        });
      });
      setSchedule(newSchedule);
      setDirty(false);
    }
  }, [slots]);

  const toggleDay = (day: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[day] = {
        enabled: !copy[day].enabled,
        ranges: !copy[day].enabled ? [{ start: "09:00", end: "17:00" }] : [],
      };
      return copy;
    });
    setDirty(true);
  };

  const updateRange = (day: number, idx: number, field: "start" | "end", value: string) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[day] = {
        ...copy[day],
        ranges: copy[day].ranges.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
      };
      return copy;
    });
    setDirty(true);
  };

  const addRange = (day: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      const lastEnd = copy[day].ranges.at(-1)?.end || "09:00";
      const nextStart = lastEnd;
      const nextEnd = TIME_OPTIONS.find(t => t > nextStart) || "17:00";
      copy[day] = { 
        ...copy[day], 
        ranges: [...copy[day].ranges, { start: nextStart, end: nextEnd }] 
      };
      return copy;
    });
    setDirty(true);
  };

  const removeRange = (day: number, idx: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[day] = { ...copy[day], ranges: copy[day].ranges.filter((_, i) => i !== idx) };
      if (copy[day].ranges.length === 0) copy[day].enabled = false;
      return copy;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    const flatSlots = schedule.flatMap((day, dayIdx) =>
      day.enabled
        ? day.ranges.map((r) => ({ day_of_week: dayIdx, start_time: r.start, end_time: r.end }))
        : []
    );
    try {
      await saveMutation.mutateAsync(flatSlots);
      setDirty(false);
      toast({ 
        title: "Availability saved!", 
        description: "Your schedule has been updated.",
        icon: <Check className="h-4 w-4" />
      });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const handleAddOverride = async () => {
    if (!selectedDate) return;
    try {
      await createOverride.mutateAsync({
        date: format(selectedDate, "yyyy-MM-dd"),
        is_blocked: true,
        start_time: null,
        end_time: null,
        reason: overrideReason || null,
      });
      toast({ 
        title: "Date blocked", 
        description: overrideReason || "This date is now unavailable.",
        icon: <CalendarOff className="h-4 w-4" />
      });
      setOverrideDialogOpen(false);
      setSelectedDate(undefined);
      setOverrideReason("");
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.name);
    const newSchedule: WeekSchedule = DAYS.map((_, i) => ({
      enabled: preset.schedule[i],
      ranges: preset.schedule[i] ? [{ start: "09:00", end: "17:00" }] : [],
    }));
    setSchedule(newSchedule);
    setDirty(true);
  };

  const copyScheduleLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/availability`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard" });
  };

  const getTotalWeeklyHours = () => {
    return schedule.reduce((total, day) => {
      if (!day.enabled) return total;
      return total + day.ranges.reduce((dayTotal, range) => {
        const start = parseInt(range.start.split(":")[0]) + parseInt(range.start.split(":")[1]) / 60;
        const end = parseInt(range.end.split(":")[0]) + parseInt(range.end.split(":")[1]) / 60;
        return dayTotal + (end - start);
      }, 0);
    }, 0);
  };

  const getPeakDay = () => {
    const dayHours = schedule.map((day, index) => ({
      day: DAYS[index],
      hours: day.enabled ? day.ranges.reduce((total, range) => {
        const start = parseInt(range.start.split(":")[0]) + parseInt(range.start.split(":")[1]) / 60;
        const end = parseInt(range.end.split(":")[0]) + parseInt(range.end.split(":")[1]) / 60;
        return total + (end - start);
      }, 0) : 0
    }));
    return dayHours.reduce((max, day) => day.hours > max.hours ? day : max, dayHours[0]);
  };

  const getUtilizationRate = () => {
    const totalPossible = 24 * 7; // 168 hours per week
    const actual = getTotalWeeklyHours();
    return Math.round((actual / totalPossible) * 100);
  };

  const stats = {
    weeklyHours: getTotalWeeklyHours().toFixed(1),
    availableDays: schedule.filter(d => d.enabled).length,
    overridesCount: overrides?.length || 0,
    utilizationRate: getUtilizationRate(),
    peakDay: getPeakDay(),
    avgSessionLength: 60, // This would come from actual data
    nextOverride: overrides?.length > 0 
      ? format(new Date(overrides[0].date + "T00:00:00"), "MMM d")
      : "None",
    efficiency: Math.min(Math.round((getTotalWeeklyHours() / 40) * 100), 100),
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-5 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6"
      >
        {/* Premium Hero Section */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#1E3A8A]/10 via-[#1E3A8A]/5 to-transparent p-4 sm:p-5 lg:p-6 border border-[#1E3A8A]/10"
        >
          <div className="absolute inset-0">
            <div className="absolute -right-20 -top-20 h-40 w-40 animate-pulse-slow rounded-full bg-[#1E3A8A]/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-56 w-56 animate-pulse-slower rounded-full bg-[#C2410C]/20 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#1E3A8A]/15 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-[#1E3A8A] backdrop-blur-sm border border-[#1E3A8A]/20"
                >
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Availability Settings
                </motion.div>
                
                <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#1E3A8A]">
                  When are you available?
                </h1>
                
                <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                  Set your regular weekly hours and block specific dates for holidays or time off.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1.5 text-xs h-9 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                  onClick={copyScheduleLink}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#1E3A8A]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  disabled={!dirty || saveMutation.isPending}
                  className="gap-1.5 bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] text-white shadow-md hover:shadow-lg text-xs sm:text-sm h-9"
                >
                  {saveMutation.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{saveMutation.isPending ? "Saving..." : "Save changes"}</span>
                </Button>
              </div>
            </div>

            {/* Dashboard-style Stats Cards */}
            <div className="mt-4 sm:mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatsCard
                title="Weekly Hours"
                value={`${stats.weeklyHours}h`}
                icon={Clock}
                trend={{ value: 8, direction: 'up', label: 'vs last week' }}
                description={`${stats.availableDays} days available`}
                color="blue"
                progress={stats.utilizationRate}
              />
              <StatsCard
                title="Peak Day"
                value={stats.peakDay.day}
                icon={TrendingUp}
                trend={{ value: 12, direction: 'up', label: 'most booked' }}
                description={`${stats.peakDay.hours.toFixed(1)} hours`}
                color="orange"
              />
              <StatsCard
                title="Overrides"
                value={stats.overridesCount}
                icon={CalendarOff}
                trend={{ value: stats.overridesCount > 0 ? 2 : 0, direction: stats.overridesCount > 0 ? 'up' : 'neutral' }}
                description={`Next: ${stats.nextOverride}`}
                color="purple"
              />
              <StatsCard
                title="Efficiency"
                value={`${stats.efficiency}%`}
                icon={Zap}
                trend={{ value: 5, direction: 'up', label: 'optimized' }}
                description={`${stats.avgSessionLength}min avg session`}
                color="green"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                  <CalendarCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Available Days</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.availableDays}/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Utilization</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.utilizationRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-amber-100 p-1.5 sm:p-2">
                  <Hourglass className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Session</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.avgSessionLength}min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-purple-100 p-1.5 sm:p-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Productivity</p>
                  <p className="text-sm sm:text-base font-semibold">High</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="overrides" className="gap-2">
              <CalendarOff className="h-4 w-4" />
              Overrides
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Weekly Schedule Section */}
        <motion.div 
          variants={itemVariants}
          className={cn(activeTab !== "schedule" && isMobile && "hidden")}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-[#1E3A8A]/5 to-transparent rounded-bl-full" />
            
            <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
                    <Clock className="h-4 w-4 text-[#1E3A8A]" />
                  </div>
                  <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold text-[#1E3A8A]">
                    Weekly hours
                  </CardTitle>
                  {dirty && (
                    <Badge variant="outline" className="ml-2 text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">
                      Unsaved
                    </Badge>
                  )}
                </div>

                {/* Quick Presets - Desktop */}
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Templates:</span>
                  {PRESETS.map((preset) => (
                    <motion.button
                      key={preset.name}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all",
                        activePreset === preset.name
                          ? "bg-[#1E3A8A] text-white shadow-md"
                          : "bg-muted/50 hover:bg-muted text-foreground"
                      )}
                    >
                      <preset.icon className="h-3.5 w-3.5" />
                      <span>{preset.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Presets - Mobile */}
              <div className="mt-3 lg:hidden">
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((preset) => (
                    <motion.button
                      key={preset.name}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg p-2 transition-all",
                        activePreset === preset.name
                          ? "bg-[#1E3A8A] text-white shadow-md"
                          : "bg-muted/50 hover:bg-muted text-foreground"
                      )}
                    >
                      <preset.icon className="h-3.5 w-3.5" />
                      <span className="text-[10px]">{preset.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-5 pt-2">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {DAYS.map((day, i) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex flex-col gap-3 pb-4 border-b last:border-0 last:pb-0",
                        i === DAYS.length - 1 ? "border-0" : "border-border/50"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-32">
                          <Switch 
                            checked={schedule[i].enabled} 
                            onCheckedChange={() => toggleDay(i)}
                            className="data-[state=checked]:bg-[#1E3A8A]"
                          />
                          <span className={cn(
                            "text-xs sm:text-sm font-medium flex-1",
                            schedule[i].enabled ? "text-[#1E3A8A]" : "text-muted-foreground"
                          )}>
                            {day}
                          </span>
                        </div>
                        
                        {schedule[i].enabled ? (
                          <div className="flex-1 flex flex-col gap-2 sm:pl-0 pl-9">
                            <AnimatePresence mode="popLayout">
                              {schedule[i].ranges.map((r, rIdx) => (
                                <motion.div
                                  key={rIdx}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex flex-col xs:flex-row items-start xs:items-center gap-2 bg-muted/30 p-2 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 w-full xs:w-auto">
                                    {getTimeIcon(r.start)}
                                    <Select 
                                      value={r.start} 
                                      onValueChange={(v) => updateRange(i, rIdx, "start", v)}
                                    >
                                      <SelectTrigger className="w-full xs:w-24 h-8 text-xs border-[#1E3A8A]/20 focus:ring-[#1E3A8A]/20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {TIME_OPTIONS.map((t) => (
                                          <SelectItem key={t} value={t} className="text-xs">
                                            {formatTime(t)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <span className="text-xs text-muted-foreground hidden xs:inline">→</span>
                                  
                                  <div className="flex items-center gap-2 w-full xs:w-auto">
                                    {getTimeIcon(r.end)}
                                    <Select 
                                      value={r.end} 
                                      onValueChange={(v) => updateRange(i, rIdx, "end", v)}
                                    >
                                      <SelectTrigger className="w-full xs:w-24 h-8 text-xs border-[#1E3A8A]/20 focus:ring-[#1E3A8A]/20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {TIME_OPTIONS.map((t) => (
                                          <SelectItem key={t} value={t} className="text-xs">
                                            {formatTime(t)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 shrink-0 ml-auto xs:ml-0 hover:text-[#C2410C]"
                                    onClick={() => removeRange(i, rIdx)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-fit gap-1.5 text-xs h-7 mt-1 text-[#1E3A8A] hover:text-[#C2410C]"
                              onClick={() => addRange(i)}
                            >
                              <Plus className="h-3 w-3" /> 
                              <span>Add time</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-9 sm:pl-0">
                            <CalendarOff className="h-3.5 w-3.5" />
                            <span>Unavailable</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Time range summary - Mobile */}
                      {schedule[i].enabled && schedule[i].ranges.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-9 sm:hidden">
                          {schedule[i].ranges.map((r, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[8px] px-1.5 py-0 border-[#1E3A8A]/20">
                              {formatTime(r.start)} - {formatTime(r.end)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Date Overrides Section */}
        <motion.div 
          variants={itemVariants}
          className={cn(activeTab !== "overrides" && isMobile && "hidden")}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute left-0 top-0 h-24 w-24 bg-gradient-to-br from-[#C2410C]/5 to-transparent rounded-br-full" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
                  <CalendarOff className="h-4 w-4 text-[#1E3A8A]" />
                </div>
                <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold text-[#1E3A8A]">
                  Date overrides
                </CardTitle>
                {overrides && overrides.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    {overrides.length}
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 h-8 text-xs border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                onClick={() => setOverrideDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" /> 
                <span className="hidden xs:inline">Block date</span>
                <span className="xs:hidden">Block</span>
              </Button>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-5 pt-2">
              {!overrides || overrides.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 sm:py-10 text-center"
                >
                  <div className="relative mb-3 sm:mb-4">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-[#1E3A8A]/20 blur-xl" />
                    <div className="relative rounded-full bg-gradient-to-br from-[#1E3A8A]/20 to-[#C2410C]/5 p-3 sm:p-4">
                      <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#1E3A8A]/60" />
                    </div>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-xs sm:text-sm font-semibold text-[#1E3A8A]">
                    No blocked dates
                  </h3>
                  <p className="mt-1 max-w-xs text-[10px] sm:text-xs text-muted-foreground px-4">
                    Block specific dates for holidays, time off, or special events.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 gap-1.5 text-xs h-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                    onClick={() => setOverrideDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Block a date
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {overrides.map((o, index) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 backdrop-blur-sm hover:bg-muted/30 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-rose-500/10 p-1.5 shrink-0">
                              <CalendarOff className="h-3.5 w-3.5 text-rose-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-[#1E3A8A]">
                                {format(new Date(o.date + "T00:00:00"), "EEE, MMM d, yyyy")}
                              </p>
                              {o.reason && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-[250px] mt-0.5">
                                  {o.reason}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-rose-600">
                                  <CalendarOff className="h-2.5 w-2.5" />
                                  Blocked
                                </span>
                                {isPast(new Date(o.date + "T00:00:00")) && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-slate-600">
                                    Past
                                  </span>
                                )}
                                {isToday(new Date(o.date + "T00:00:00")) && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-green-600">
                                    Today
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                            onClick={() => deleteOverride.mutate(o.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips & Insights */}
        {showTimeTips && (
          <motion.div 
            variants={itemVariants}
            className="hidden lg:block"
          >
            <Card className="border-0 bg-gradient-to-br from-[#1E3A8A]/5 via-[#1E3A8A]/5 to-transparent shadow-lg">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[#1E3A8A]/10 p-2">
                      <Zap className="h-4 w-4 text-[#1E3A8A]" />
                    </div>
                    <div>
                      <h3 className="font-['Space_Grotesk'] text-xs sm:text-sm font-semibold text-[#1E3A8A]">
                        Availability insights
                      </h3>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground max-w-md">
                        {schedule.filter(d => d.enabled).length === 0 
                          ? "You haven't set any availability yet. Start by enabling some days above."
                          : getTotalWeeklyHours() > 40
                          ? "You're available for over 40 hours per week. Consider taking breaks between meetings to avoid burnout."
                          : getTotalWeeklyHours() < 20
                          ? "Your availability is limited. Try adding more hours to increase booking potential."
                          : stats.utilizationRate > 50
                          ? "Great coverage! Your schedule is well-balanced for maximum productivity."
                          : "Your schedule looks balanced. Consider adding peak hours to optimize bookings."}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-[10px] text-muted-foreground">Peak: {stats.peakDay.day}s {stats.peakDay.hours.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] text-muted-foreground">Avg: {(getTotalWeeklyHours() / 7).toFixed(1)}h/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 gap-1 text-[10px] sm:text-xs hover:text-[#1E3A8A]"
                    onClick={() => setShowTimeTips(false)}
                  >
                    Hide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mobile Save Bar */}
        {dirty && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl p-4 shadow-lg lg:hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#1E3A8A]">Unsaved changes</p>
                <p className="text-[10px] text-muted-foreground">Your availability hasn't been saved</p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending}
                size="sm"
                className="gap-1.5 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              >
                {saveMutation.isPending ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </motion.div>
        )}

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.weeklyHours}h</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Weekly Hours</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.availableDays}/7</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active Days</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">{stats.overridesCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Overrides</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.efficiency}%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Efficiency</p>
          </div>
        </motion.div>

        {/* Pasbest Ventures Attribution */}
        <motion.div variants={itemVariants} className="mt-4 pt-4 border-t text-center">
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
        </motion.div>
      </motion.div>

      {/* Block date dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl p-4 sm:p-6">
          <DialogHeader className="space-y-2 pb-2">
            <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl flex items-center gap-2 text-[#1E3A8A]">
              <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
                <CalendarOff className="h-4 w-4 text-[#1E3A8A]" />
              </div>
              Block a date
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg border border-border/50 bg-background p-2"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#1E3A8A]/10",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-8 w-8 sm:h-9 sm:w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A] rounded-md",
                  day_selected: "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] hover:text-white focus:bg-[#1E3A8A] focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs sm:text-sm text-[#1E3A8A]">Reason (optional)</Label>
              <div className="relative">
                <Input
                  id="reason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Holiday, vacation, conference"
                  className="pl-8 text-xs sm:text-sm h-9 sm:h-10 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                />
                <AlertCircle className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A8A]" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                This helps you remember why this date is blocked
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button 
                onClick={handleAddOverride} 
                className="flex-1 gap-1.5 text-xs sm:text-sm h-9 sm:h-10 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                disabled={!selectedDate || createOverride.isPending}
              >
                {createOverride.isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CalendarOff className="h-4 w-4" />
                    Block this date
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOverrideDialogOpen(false)}
                className="h-9 sm:h-10 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}