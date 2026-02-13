// Dashboard.tsx - Ultra-responsive with mobile-optimized calendar
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalendarView from "@/components/dashboard/CalendarView";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  Users,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Copy,
  Check,
  BarChart3,
  Zap,
  Shield,
  Bell,
  Settings2,
  Video,
  MapPin,
  Coffee,
  Star,
  Activity,
  ArrowRight,
  Globe,
  CalendarCheck,
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useBookings } from "@/hooks/use-bookings";
import { format, isThisWeek, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

// Enhanced animations
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15, stiffness: 100 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    }
  }
};

// Mobile-Optimized Calendar Component
const MobileCalendarView = ({ bookings }: { bookings: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.start_time), date)
    );
  };

  const selectedBookings = getBookingsForDate(selectedDate);
  const hasBookings = (date: Date) => getBookingsForDate(date).length > 0;

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium">
          {format(startOfWeek(currentDate), "MMM d")} - {format(endOfWeek(currentDate), "MMM d, yyyy")}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days - Horizontal Scrollable on Mobile */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday_ = isToday(day);
          const dayBookings = getBookingsForDate(day);
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center min-w-[60px] p-2 rounded-xl transition-all",
                isSelected 
                  ? "bg-primary text-white shadow-lg" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <span className="text-[10px] font-medium uppercase">
                {format(day, "EEE")}
              </span>
              <span className={cn(
                "text-lg font-bold font-['Space_Grotesk']",
                isSelected && "text-white"
              )}>
                {format(day, "d")}
              </span>
              {dayBookings.length > 0 && (
                <span className={cn(
                  "text-[8px] mt-0.5 px-1.5 py-0.5 rounded-full",
                  isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                )}>
                  {dayBookings.length}
                </span>
              )}
              {isToday_ && !isSelected && (
                <span className="text-[8px] mt-0.5 text-muted-foreground">
                  Today
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Date Bookings */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold font-['Space_Grotesk']">
            {format(selectedDate, "EEEE, MMMM d")}
          </h4>
          <span className="text-[10px] text-muted-foreground">
            {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {selectedBookings.length > 0 ? (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {selectedBookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/dashboard/bookings/${booking.id}`}
                className="block"
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all"
                >
                  <div 
                    className="h-2 w-2 rounded-full mt-1.5"
                    style={{ backgroundColor: booking.event_types?.color || "#7C3AED" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {booking.event_types?.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {booking.guest_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{format(new Date(booking.start_time), "h:mm a")}</span>
                      <span>·</span>
                      <span>{booking.event_types?.duration} min</span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
            <div className="rounded-full bg-muted p-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              No bookings for this day
            </p>
            <Button 
              size="sm" 
              variant="link" 
              className="mt-1 h-auto p-0 text-[10px]"
              asChild
            >
              <Link to="/dashboard/availability">
                Check availability
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Add Button - Mobile Floating Action */}
      <div className="sticky bottom-4 flex justify-center lg:hidden">
        <Button 
          size="sm"
          className="rounded-full shadow-lg gap-1.5 h-9 px-4"
          asChild
        >
          <Link to="/dashboard/events">
            <Plus className="h-3.5 w-3.5" />
            <span>Create</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Desktop Calendar View Wrapper
const DesktopCalendarView = ({ bookings }: { bookings: any[] }) => (
  <div className="hidden lg:block">
    <CalendarView bookings={bookings} />
  </div>
);

// Responsive stat card
const StatCard = ({ stat, index }: { stat: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      variants={fadeUpVariants}
      custom={index}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-300`}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        
        <CardContent className="relative p-3 sm:p-4 lg:p-5">
          <div className="flex items-start justify-between">
            <motion.div 
              className={`relative rounded-xl bg-gradient-to-br ${stat.gradient} p-1.5 sm:p-2 lg:p-2.5 shadow-lg`}
              animate={{ scale: isHovered ? 1.1 : 1 }}
            >
              <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
            </motion.div>
            
            {stat.trend && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-1 py-0.5 sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1 text-[8px] sm:text-[9px] lg:text-xs font-medium backdrop-blur-sm",
                stat.trend === 'up' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted/50 text-muted-foreground'
              )}>
                {stat.trend === 'up' && <ArrowUpRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />}
                {stat.change}
              </span>
            )}
          </div>
          
          <div className="mt-2 sm:mt-3 lg:mt-4">
            <p className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-muted-foreground/80 uppercase tracking-wider">
              {stat.label}
            </p>
            <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
              <motion.p 
                className="text-lg sm:text-xl lg:text-2xl font-bold font-['Space_Grotesk'] tracking-tight"
                animate={{ scale: isHovered ? 1.05 : 1 }}
              >
                {stat.value}
              </motion.p>
              <span className="text-[8px] sm:text-[9px] lg:text-xs font-medium text-muted-foreground/70">
                {stat.unit}
              </span>
            </div>
            
            <div className="mt-2 sm:mt-3 lg:mt-4 h-1 lg:h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stat.value / (stat.max || 20)) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            
            <p className="mt-1.5 sm:mt-2 text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground/60 line-clamp-1">
              {stat.insight}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: upcoming } = useBookings("upcoming");
  const { data: past } = useBookings("past");
  const [copied, setCopied] = useState(false);

  const allConfirmed = useMemo(() => [...(upcoming || []), ...(past || [])], [upcoming, past]);
  const thisWeekCount = useMemo(
    () => upcoming?.filter((b) => isThisWeek(new Date(b.start_time))).length || 0,
    [upcoming]
  );
  const nextBooking = useMemo(() => upcoming?.[0], [upcoming]);

  const stats = [
    { 
      label: "This week", 
      value: thisWeekCount, 
      max: 20,
      unit: "sessions",
      icon: CalendarCheck, 
      gradient: "from-blue-600/20 via-indigo-600/20 to-purple-600/20",
      change: "+12%",
      trend: "up",
      insight: `${thisWeekCount > 0 ? thisWeekCount + ' sessions' : 'No sessions'}`
    },
    { 
      label: "Upcoming", 
      value: upcoming?.length || 0, 
      max: 15,
      unit: "bookings",
      icon: Clock, 
      gradient: "from-amber-600/20 via-orange-600/20 to-rose-600/20",
      change: upcoming?.length ? `${upcoming.length} active` : "None",
      trend: "neutral",
      insight: upcoming?.length ? `Next: ${upcoming[0]?.guest_name}` : 'Ready to book'
    },
    { 
      label: "Total bookings", 
      value: allConfirmed.length, 
      max: 50,
      unit: "total",
      icon: BarChart3, 
      gradient: "from-emerald-600/20 via-teal-600/20 to-cyan-600/20",
      change: `+${past?.length || 0}`,
      trend: "neutral",
      insight: `${((past?.length || 0) / (allConfirmed.length || 1) * 100).toFixed(0)}% completion`
    },
  ];

  const bookingLink = `${window.location.origin}/${user?.user_metadata?.username || 'book'}`;
  
  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRelativeDay = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-3 sm:space-y-4 lg:space-y-6 pb-24 lg:pb-6"
    >
      {/* Hero Section - Ultra Responsive */}
      <motion.div 
        variants={fadeUpVariants}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 sm:p-4 lg:p-6 border border-primary/10"
      >
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 h-32 w-32 sm:h-40 sm:w-40 animate-pulse-slow rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-40 w-40 sm:h-56 sm:w-56 animate-pulse-slower rounded-full bg-blue-500/20 blur-3xl" />
        </div>
        
        <div className="relative flex flex-col lg:flex-row items-start justify-between gap-3 lg:gap-6">
          <div className="w-full lg:flex-1">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-2 sm:mb-3 lg:mb-4 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1.5 text-[8px] sm:text-[9px] lg:text-xs font-medium text-primary backdrop-blur-sm border border-primary/20"
            >
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
              <span className="hidden xs:inline">Intelligent Scheduling</span>
              <span className="xs:hidden">Dashboard</span>
            </motion.div>
            
            <h1 className="font-['Space_Grotesk'] text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight">
              Welcome back
              <span className="mt-0.5 block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent">
                {user?.user_metadata?.full_name?.split(' ')[0] || "there"}
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block ml-1"
                >
                  ✦
                </motion.span>
              </span>
            </h1>
            
            <p className="mt-1 sm:mt-2 lg:mt-3 max-w-2xl text-[10px] sm:text-xs lg:text-sm text-muted-foreground/90 leading-relaxed">
              {thisWeekCount > 0 
                ? `${thisWeekCount} session${thisWeekCount > 1 ? 's' : ''} this week`
                : "Your calendar is open. Share your link."}
            </p>
            
            {/* Quick actions - Mobile Optimized */}
            <div className="mt-3 sm:mt-4 lg:mt-5 flex flex-row items-center gap-1.5 sm:gap-2 lg:gap-3">
              <Button 
                size="sm"
                className="group relative gap-1 sm:gap-1.5 lg:gap-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white shadow-md hover:shadow-lg text-[10px] sm:text-xs h-7 sm:h-8 lg:h-10 px-2 sm:px-3 lg:px-4"
                asChild
              >
                <Link to="/dashboard/events">
                  <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 transition-transform group-hover:scale-110" />
                  <span className="hidden xs:inline">Create event</span>
                  <span className="xs:hidden">Create</span>
                </Link>
              </Button>
              
              <Button 
                size="sm"
                variant="outline" 
                className="gap-1 sm:gap-1.5 lg:gap-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 text-[10px] sm:text-xs h-7 sm:h-8 lg:h-10 px-2 sm:px-3 lg:px-4"
                onClick={copyBookingLink}
              >
                {copied ? (
                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                )}
                <span className="hidden xs:inline">{copied ? "Copied!" : "Copy link"}</span>
                <span className="xs:hidden">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Next Booking Card - Responsive */}
          {nextBooking && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full lg:w-80 shrink-0 mt-2 lg:mt-0"
            >
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background via-background/95 to-background/90 shadow-lg lg:shadow-xl backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                
                <CardContent className="relative p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 lg:mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 sm:px-2 sm:py-0.5 lg:px-2.5 lg:py-1 text-[8px] sm:text-[9px] lg:text-xs font-medium text-primary">
                      <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />
                      Next
                    </span>
                    <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-medium text-muted-foreground/70">
                      #{nextBooking.id.slice(-4)}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3">
                    <motion.div 
                      className="relative shrink-0 mt-0.5"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div 
                        className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full ring-3 sm:ring-4" 
                        style={{ 
                          backgroundColor: nextBooking.event_types?.color || "#7C3AED",
                          boxShadow: `0 0 10px ${nextBooking.event_types?.color}40`
                        }} 
                      />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-['Space_Grotesk'] text-xs sm:text-sm lg:text-base font-bold leading-tight truncate">
                        {nextBooking.event_types?.title}
                      </h3>
                      
                      <div className="mt-1 sm:mt-1.5 lg:mt-2 space-y-0.5 sm:space-y-1">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] lg:text-xs">
                          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{nextBooking.guest_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] lg:text-xs">
                          <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-primary shrink-0">
                            {getRelativeDay(new Date(nextBooking.start_time))}
                          </span>
                          <span className="text-muted-foreground hidden xs:inline">·</span>
                          <span className="font-medium truncate hidden xs:inline">
                            {format(new Date(nextBooking.start_time), "h:mm a")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:mt-3 lg:mt-4">
                        <Button 
                          asChild 
                          size="sm"
                          className="w-full gap-1 bg-primary/90 hover:bg-primary h-6 sm:h-7 lg:h-8 text-[8px] sm:text-[9px] lg:text-xs"
                        >
                          <Link to={`/dashboard/bookings/${nextBooking.id}`}>
                            <span>View details</span>
                            <ArrowRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid - Responsive columns */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4"
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </motion.div>

      {/* Smart Insights - Responsive */}
      <motion.div variants={fadeUpVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent shadow-lg">
          <CardContent className="relative p-3 sm:p-4 lg:p-5">
            <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3">
                <div className="rounded-lg bg-primary/10 p-1 sm:p-1.5 lg:p-2">
                  <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Space_Grotesk'] text-[10px] sm:text-xs lg:text-sm font-semibold">Smart Insights</h3>
                  <p className="mt-0.5 text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground max-w-md">
                    {upcoming?.length > 5 
                      ? "Consider blocking focus time" 
                      : upcoming?.length > 2
                      ? "Good momentum! Share your link"
                      : "Your calendar is open"}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="h-6 sm:h-7 lg:h-8 gap-1 text-[8px] sm:text-[9px] lg:text-xs w-full xs:w-auto">
                <Settings2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
                <span>Configure</span>
              </Button>
            </div>
            
            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {[
                { label: "Best time", value: "Tue 2-4", icon: Star, color: "text-amber-500" },
                { label: "Peak day", value: "Wed", icon: TrendingUp, color: "text-emerald-500" },
                { label: "Response", value: "< 2h", icon: Zap, color: "text-blue-500" },
                { label: "No-show", value: "4.2%", icon: AlertCircle, color: "text-rose-500" },
              ].map((insight) => (
                <div key={insight.label} className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 rounded-lg bg-background/50 p-1.5 sm:p-2 backdrop-blur-sm">
                  <insight.icon className={`h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 ${insight.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[7px] sm:text-[8px] lg:text-[10px] text-muted-foreground truncate">{insight.label}</p>
                    <p className="text-[8px] sm:text-[9px] lg:text-xs font-semibold truncate">{insight.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - Responsive grid */}
      <motion.div variants={fadeUpVariants}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
          <h2 className="font-['Space_Grotesk'] text-xs sm:text-sm lg:text-base font-semibold">Quick actions</h2>
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground">
            <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5" />
            <span className="hidden xs:inline">Booking:</span>
            <Button variant="link" className="h-auto p-0 text-[8px] sm:text-[9px] lg:text-xs text-primary" asChild>
              <Link to={`/${user?.user_metadata?.username || 'book'}`}>
                {bookingLink.replace(/^https?:\/\//, '').substring(0, 15)}...
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3">
          <QuickActionButton
            to="/dashboard/events"
            icon={Plus}
            title="Create event"
            desc="New"
            gradient
          />
          <QuickActionButton
            to="/dashboard/availability"
            icon={Clock}
            title="Set hours"
            desc="Availability"
          />
          <QuickActionButton
            to="/dashboard/bookings"
            icon={CalendarDays}
            title="Bookings"
            desc={`${upcoming?.length || 0} upcoming`}
          />
          <QuickActionButton
            to="/dashboard/analytics"
            icon={BarChart3}
            title="Analytics"
            desc="Metrics"
          />
        </div>
      </motion.div>

      {/* Calendar & Bookings Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {/* Calendar - Mobile Optimized */}
        <motion.div variants={fadeUpVariants} className="lg:col-span-2">
          <Card className="relative overflow-hidden border-0 shadow-lg h-full">
            <div className="absolute right-0 top-0 h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-0 pt-2 sm:pt-3 lg:pt-4 px-3 sm:px-4 lg:px-5">
              <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <div className="rounded-lg bg-primary/10 p-1 sm:p-1.5">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-primary" />
                </div>
                <CardTitle className="font-['Space_Grotesk'] text-[10px] sm:text-xs lg:text-sm font-semibold">
                  Schedule
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] lg:text-xs h-5 sm:h-6 lg:h-7 px-1.5 sm:px-2">
                <Link to="/dashboard/bookings">
                  <span className="hidden xs:inline">View all</span>
                  <span className="xs:hidden">All</span>
                  <ChevronRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3" />
                </Link>
              </Button>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-4 lg:p-5 pt-1 sm:pt-2">
              {/* Mobile Calendar - Shows on small screens */}
              <div className="lg:hidden">
                <MobileCalendarView bookings={allConfirmed} />
              </div>
              
              {/* Desktop Calendar - Shows on large screens */}
              <div className="hidden lg:block">
                <CalendarView bookings={allConfirmed} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Bookings - Mobile Optimized */}
        <motion.div variants={fadeUpVariants}>
          <Card className="relative h-full overflow-hidden border-0 shadow-lg">
            <div className="absolute left-0 top-0 h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-br-full" />
            
            <CardHeader className="pb-0 pt-2 sm:pt-3 lg:pt-4 px-3 sm:px-4 lg:px-5">
              <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                <div className="rounded-lg bg-primary/10 p-1 sm:p-1.5">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-primary" />
                </div>
                <CardTitle className="font-['Space_Grotesk'] text-[10px] sm:text-xs lg:text-sm font-semibold flex items-center">
                  Upcoming
                  {upcoming && upcoming.length > 0 && (
                    <span className="ml-1 sm:ml-1.5 lg:ml-2 rounded-full bg-primary/10 px-1 py-0.5 text-[7px] sm:text-[8px] lg:text-[10px] font-medium text-primary">
                      {upcoming.length}
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-4 lg:p-5 pt-1 sm:pt-2">
              {!upcoming || upcoming.length === 0 ? (
                <EmptyState copied={copied} copyBookingLink={copyBookingLink} />
              ) : (
                <UpcomingList 
                  upcoming={upcoming} 
                  getRelativeDay={getRelativeDay}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Footer status - hidden on mobile */}
      <motion.div 
        variants={fadeUpVariants}
        className="hidden lg:flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>System healthy</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Synced just now</span>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-normal">
            Refresh
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quick Action Button Component - Ultra Responsive
const QuickActionButton = ({ to, icon: Icon, title, desc, gradient }: any) => (
  <motion.div 
    whileHover={{ y: -1 }} 
    whileTap={{ scale: 0.98 }} 
    className="w-full"
  >
    <Button 
      asChild 
      variant={gradient ? "default" : "outline"}
      className={cn(
        "h-auto w-full justify-start gap-1.5 sm:gap-2 lg:gap-3 p-1.5 sm:p-2 lg:p-2.5 text-left transition-all duration-300",
        gradient ? "bg-gradient-to-r from-primary to-primary/90 shadow-sm hover:shadow-md" : "border bg-background/50 backdrop-blur-sm hover:bg-primary/5"
      )}
    >
      <Link to={to}>
        <div className={cn(
          "rounded-lg p-1 sm:p-1.5",
          gradient ? "bg-white/20" : "bg-muted"
        )}>
          <Icon className={cn(
            "h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5",
            gradient ? "text-white" : "text-foreground"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-[9px] sm:text-[10px] lg:text-xs font-semibold truncate",
            gradient && "text-white"
          )}>{title}</p>
          <p className={cn(
            "text-[7px] sm:text-[8px] lg:text-[10px] truncate",
            gradient ? "text-white/80" : "text-muted-foreground"
          )}>{desc}</p>
        </div>
        <ChevronRight className={cn(
          "h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 shrink-0",
          gradient ? "text-white/60" : "text-muted-foreground"
        )} />
      </Link>
    </Button>
  </motion.div>
);

// Empty State Component - Responsive
const EmptyState = ({ copied, copyBookingLink }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 text-center"
  >
    <div className="relative mb-2 sm:mb-3 lg:mb-4">
      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-lg sm:blur-xl" />
      <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-2 sm:p-2.5 lg:p-3">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary/60" />
      </div>
    </div>
    <h3 className="font-['Space_Grotesk'] text-[10px] sm:text-xs lg:text-sm font-semibold">
      No upcoming bookings
    </h3>
    <p className="mt-0.5 sm:mt-1 max-w-xs text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground px-2">
      Share your booking link to start scheduling.
    </p>
    <div className="mt-3 sm:mt-4 lg:mt-5 flex w-full flex-col gap-1.5 sm:gap-2">
      <Button size="sm" className="w-full gap-1 text-[8px] sm:text-[9px] lg:text-xs h-6 sm:h-7 lg:h-8" onClick={copyBookingLink}>
        {copied ? <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
        {copied ? "Copied!" : "Copy booking link"}
      </Button>
      <Button variant="outline" size="sm" className="w-full gap-1 text-[8px] sm:text-[9px] lg:text-xs h-6 sm:h-7 lg:h-8" asChild>
        <Link to="/dashboard/availability">
          <Settings2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          Configure
        </Link>
      </Button>
    </div>
  </motion.div>
);

// Upcoming List Component - Responsive
const UpcomingList = ({ upcoming, getRelativeDay }: any) => (
  <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
    {upcoming.slice(0, 4).map((booking: any, index: number) => (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        whileTap={{ scale: 0.98 }}
        className="group relative"
      >
        <Link to={`/dashboard/bookings/${booking.id}`}>
          <div className="relative flex items-start gap-1.5 sm:gap-2 lg:gap-3 rounded-lg p-1.5 sm:p-2 transition-all duration-300 hover:bg-muted/50">
            <div className="relative shrink-0 mt-0.5">
              <div 
                className="absolute inset-0 animate-ping rounded-full opacity-20" 
                style={{ backgroundColor: booking.event_types?.color || "#7C3AED" }}
              />
              <div 
                className="relative h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5 rounded-full ring-2 sm:ring-3" 
                style={{ 
                  backgroundColor: booking.event_types?.color || "#7C3AED",
                  boxShadow: `0 0 0 2px ${booking.event_types?.color}20`
                }} 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="truncate text-[9px] sm:text-[10px] lg:text-xs font-semibold">
                    {booking.event_types?.title}
                  </p>
                  <p className="mt-0.5 text-[7px] sm:text-[8px] lg:text-[10px] text-muted-foreground truncate">
                    {booking.guest_name}
                  </p>
                </div>
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-medium text-primary shrink-0 ml-1">
                  {getRelativeDay(new Date(booking.start_time))}
                </span>
              </div>
              
              <div className="mt-0.5 flex items-center gap-1 text-[7px] sm:text-[8px] lg:text-[10px] text-muted-foreground">
                <Clock className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5" />
                <span>{format(new Date(booking.start_time), "h:mm a")}</span>
                <span>·</span>
                <span>{booking.event_types?.duration} min</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    ))}
    
    {upcoming.length > 4 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          variant="ghost" 
          asChild 
          className="mt-0.5 sm:mt-1 w-full gap-1 bg-gradient-to-r from-primary/5 to-transparent text-primary hover:from-primary/10 hover:to-primary/5 h-5 sm:h-6 lg:h-7 text-[7px] sm:text-[8px] lg:text-[10px]"
        >
          <Link to="/dashboard/bookings">
            View {upcoming.length - 4} more
            <ChevronRight className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5" />
          </Link>
        </Button>
      </motion.div>
    )}
  </div>
);