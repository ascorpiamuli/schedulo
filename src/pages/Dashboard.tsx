// Dashboard.tsx - Enhanced responsive dashboard with comprehensive stats
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import CalendarView from "@/components/dashboard/CalendarView";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  ChevronDown,
  DollarSign,
  Percent,
  Target,
  Award,
  PieChart,
  LineChart,
  Download,
  Upload,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MessageSquare,
  Link2,
  QrCode,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Twitch,
  Slack,
  Zoom,
  Google,
  Apple,
  Microsoft,
  Github,
  Gitlab,
  Figma,
  Notion,
  Trello,
  Jira,
  Confluence,
  Salesforce,
  Hubspot,
  Mailchimp,
  Stripe,
  Paypal,
  Bitcoin,
  Wallet,
  CreditCard,
  Receipt,
  TrendingDown,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  AlertTriangle,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Umbrella,
  Droplet,
  TreePine,
  Flower2,
  Leaf,
  Pizza,
  Burger,
  Beer,
  Wine,
  GlassWater,
  Utensils,
  Cake,
  Candy,
  IceCream,
  Cookie,
  Apple,
  Orange,
  Banana,
  Grape,
  Cherry,
  Lemon,
  Avocado,
  Egg,
  Milk,
  Bread,
  Sandwich,
  Soup,
  Salad,
  Sushi,
  Fish,
  Shrimp,
  Meat,
  Chicken,
  Croissant,
  Donut,
  Popcorn,
  Home
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useBookings } from "@/hooks/use-bookings";
import { useEventTypes } from "@/hooks/use-event-types";
import { useTeamMembers } from "@/hooks/use-team-management";
import { format, isThisWeek, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays, formatDistance, formatRelative, subDays, addDays, isWithinInterval, isPast, isFuture, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

// Types
interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  guest_email: string;
  guest_notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  event_types: {
    title: string;
    duration: number;
    color: string;
    price_cents?: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  progress?: number;
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'red' | 'yellow';
  onClick?: () => void;
  linkTo?: string;
  footer?: string;
}

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

// Stat Card Component - Enhanced for mobile
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  progress, 
  color = 'blue',
  onClick,
  linkTo,
  footer
}: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const colorClasses = {
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

// Quick Action Card - Mobile optimized
const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = 'blue',
  badge,
  onClick
}: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
  };

  const Wrapper = href ? Link : onClick ? 'button' : 'div';
  const wrapperProps = href ? { to: href } : onClick ? { onClick } : {};

  return (
    <motion.div
      whileHover={!isMobile ? { y: -2 } : {}}
      whileTap={isMobile ? { scale: 0.98 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Wrapper
        {...wrapperProps}
        className={cn(
          "relative block overflow-hidden rounded-xl bg-gradient-to-br p-4 sm:p-5 text-white shadow-lg transition-all",
          colorClasses[color],
          isHovered && !isMobile && "shadow-xl"
        )}
      >
        <div className="absolute right-0 top-0 h-20 sm:h-24 w-20 sm:w-24 translate-x-6 sm:translate-x-8 -translate-y-6 sm:-translate-y-8 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-0 h-12 sm:h-16 w-12 sm:w-16 -translate-x-3 sm:-translate-x-4 translate-y-3 sm:translate-y-4 rounded-full bg-black/10" />
        
        <div className="relative">
          <div className="mb-2 sm:mb-3 flex items-center justify-between">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white/90" />
            {badge && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs px-1.5 py-0.5">
                {badge}
              </Badge>
            )}
          </div>
          
          <h4 className="text-base sm:text-lg font-semibold font-['Space_Grotesk']">{title}</h4>
          <p className="mt-1 text-xs sm:text-sm text-white/80 line-clamp-2">{description}</p>
          
          <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs sm:text-sm font-medium">
            <span>Get started</span>
            <ChevronRight className={cn(
              "h-3 w-3 sm:h-4 sm:w-4 transition-transform",
              isHovered && "translate-x-1"
            )} />
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
};

// Activity Feed Item - Mobile optimized
const ActivityItem = ({ activity }: { activity: any }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'booking_created':
        return <CalendarCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      case 'booking_cancelled':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
      case 'payment_received':
        return <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      case 'team_invite':
        return <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />;
      case 'event_created':
        return <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />;
      default:
        return <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 hover:bg-muted/50 transition-colors"
    >
      <div className="rounded-full bg-muted p-1.5 sm:p-2 shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium truncate">{activity.title}</p>
          {activity.metadata?.amount && (
            <Badge variant="outline" className="text-green-600 text-xs shrink-0">
              +${activity.metadata.amount}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">
          {formatDistance(parseISO(activity.created_at), new Date(), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
};

// Upcoming Booking Card - Mobile optimized
const UpcomingBookingCard = ({ booking }: { booking: Booking }) => {
  const startTime = parseISO(booking.start_time);
  const isToday_ = isToday(startTime);
  const isTomorrow_ = isTomorrow(startTime);
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      <Link to={`/dashboard/bookings/${booking.id}`}>
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
          <div 
            className="h-1 w-full" 
            style={{ backgroundColor: booking.event_types?.color || "#1E3A8A" }}
          />
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                    {booking.event_types?.title}
                  </h4>
                  <Badge variant={isToday_ ? "default" : "outline"} className="text-[10px] sm:text-xs px-1.5 py-0 h-5">
                    {isToday_ ? 'Today' : isTomorrow_ ? 'Tomorrow' : format(startTime, 'MMM d')}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{booking.guest_name}</p>
                
                <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>{format(startTime, 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{booking.event_types?.duration} min</span>
                  </div>
                  {booking.event_types?.price_cents && booking.event_types.price_cents > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>${(booking.event_types.price_cents / 100).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {booking.guest_notes && (
                  <p className="mt-2 text-[10px] sm:text-xs text-muted-foreground line-clamp-1 border-t pt-2">
                    "{booking.guest_notes}"
                  </p>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

// Metric Card for detailed stats - Mobile optimized
const MetricCard = ({ label, value, change, icon: Icon, color = 'blue' }: any) => (
  <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={cn(
        "rounded-lg p-1.5 sm:p-2",
        color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
        color === 'green' && "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
        color === 'orange' && "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
      )}>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1 sm:gap-2">
          <span className="text-sm sm:text-lg font-bold truncate">{value}</span>
          {change && (
            <span className={cn(
              "text-[10px] sm:text-xs shrink-0",
              change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);


export function MobileBottomNav() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => handleNavigation("/dashboard")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => handleNavigation("/dashboard/events")}
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs">Events</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative"
          onClick={() => handleNavigation("/dashboard/bookings")}
        >

          <Clock className="h-5 w-5" />
          <span className="text-xs">Bookings</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => handleNavigation("/dashboard/team")}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Team</span>
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/availability")}
              >
                <Calendar className="h-4 w-4" />
                Availability
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/analytics")}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/settings")}
              >
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/members")}
              >
                <Users className="h-4 w-4" />
                Members
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default function Dashboard() {
  const { user } = useAuth();
  const { data: upcoming, isLoading: upcomingLoading } = useBookings("upcoming");
  const { data: past, isLoading: pastLoading } = useBookings("past");
  const { data: eventTypes, isLoading: eventTypesLoading } = useEventTypes();
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const [copied, setCopied] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  // Memoized calculations
  const allBookings = useMemo(() => [...(upcoming || []), ...(past || [])], [upcoming, past]);
  
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const thisWeekBookings = upcoming?.filter(b => 
      isWithinInterval(parseISO(b.start_time), { start: weekStart, end: weekEnd })
    ).length || 0;
    
    const totalRevenue = past?.reduce((acc, b) => 
      acc + (b.event_types?.price_cents || 0), 0
    ) || 0;
    
    const avgDuration = upcoming?.reduce((acc, b) => 
      acc + (b.event_types?.duration || 0), 0
    ) / (upcoming?.length || 1) || 0;
    
    const completionRate = past && past.length > 0 && allBookings.length > 0
      ? Math.round((past.length / allBookings.length) * 100)
      : 0;
    
    const responseTime = 2.5; // This would come from actual data
    
    return {
      totalBookings: allBookings.length,
      upcomingCount: upcoming?.length || 0,
      pastCount: past?.length || 0,
      thisWeekCount: thisWeekBookings,
      totalRevenue: totalRevenue / 100, // Convert cents to dollars
      avgDuration,
      completionRate,
      responseTime,
      eventTypesCount: eventTypes?.length || 0,
      teamCount: teamMembers?.length || 0,
      activeTeam: teamMembers?.filter(m => m.status === 'active').length || 0
    };
  }, [upcoming, past, allBookings, eventTypes, teamMembers]);

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

  // Sample activity data - replace with real data
  const recentActivity = [
    {
      id: 1,
      type: 'booking_created',
      title: 'New booking confirmed',
      description: 'Sarah Johnson booked 30-min Discovery Call',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'payment_received',
      title: 'Payment received',
      description: '$150 for Strategy Session with Mike Ross',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      metadata: { amount: 150 }
    },
    {
      id: 3,
      type: 'team_invite',
      title: 'Team invitation accepted',
      description: 'Alex Chen joined as Senior Developer',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'event_created',
      title: 'New event type created',
      description: 'Team Meeting (60 min) added',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  if (upcomingLoading || pastLoading || eventTypesLoading || teamLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600/40" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">Loading your dashboard...</p>
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
        {/* Welcome Header - Mobile Optimized */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] tracking-tight">
              Welcome back,
              <span className="block text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-blue-600 via-blue-600/80 to-orange-600/60 bg-clip-text text-transparent">
                {user?.user_metadata?.full_name?.split(' ')[0] || "there"}
              </span>
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {stats.thisWeekCount > 0 
                ? `You have ${stats.thisWeekCount} session${stats.thisWeekCount > 1 ? 's' : ''} scheduled this week.`
                : "Your calendar is open for business. Share your booking link to get started."}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className="flex-1 sm:flex-initial gap-1 sm:gap-2 bg-white dark:bg-gray-900 text-sm"
              onClick={copyBookingLink}
            >
              {copied ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="inline">{copied ? 'Copied!' : isMobile ? 'Copy' : 'Copy link'}</span>
            </Button>
            <Button 
              size={isMobile ? "default" : "lg"} 
              className="flex-1 sm:flex-initial gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white text-sm" 
              asChild
            >
              <Link to="/dashboard/events">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="inline">{isMobile ? 'Create' : 'Create event'}</span>
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Key Stats Grid - Responsive columns */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            description={!isMobile ? "All-time bookings across all event types" : undefined}
            icon={CalendarCheck}
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            progress={75}
            color="blue"
            linkTo="/dashboard/bookings"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingCount}
            description={!isMobile ? `${stats.thisWeekCount} this week · Next: ${upcoming?.[0]?.guest_name || 'None'}` : undefined}
            icon={Clock}
            trend={{ value: stats.upcomingCount > 0 ? 8 : 0, direction: stats.upcomingCount > 0 ? 'up' : 'neutral' }}
            progress={Math.min((stats.upcomingCount / 20) * 100, 100)}
            color="orange"
            linkTo="/dashboard/bookings?filter=upcoming"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            description={!isMobile ? "Total earnings from paid bookings" : undefined}
            icon={DollarSign}
            trend={{ value: 23, direction: 'up', label: 'this quarter' }}
            progress={68}
            color="green"
            linkTo="/dashboard/billing"
          />
          <StatCard
            title="Team"
            value={stats.teamCount}
            description={!isMobile ? `${stats.activeTeam} active members · ${eventTypes?.filter(et => et.team_event).length || 0} team events` : undefined}
            icon={Users}
            trend={{ value: 15, direction: 'up' }}
            progress={Math.min((stats.teamCount / 10) * 100, 100)}
            color="purple"
            linkTo="/dashboard/team"
          />
        </motion.div>

        {/* Quick Actions Grid - Scrollable on mobile */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold font-['Space_Grotesk']">Quick Actions</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm">
              View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <QuickActionCard
              title="Create Event"
              description="Set up a new meeting type"
              icon={Zap}
              href="/dashboard/events"
              color="blue"
              badge="New"
            />
            <QuickActionCard
              title="Invite Team"
              description="Add team members to collaborate"
              icon={UserPlus}
              href="/dashboard/team/invitations"
              color="orange"
            />
            <QuickActionCard
              title="Set Availability"
              description="Define your working hours"
              icon={Clock}
              href="/dashboard/availability"
              color="green"
            />
            <QuickActionCard
              title="View Analytics"
              description="Track your performance"
              icon={BarChart3}
              href="/dashboard/team/analytics"
              color="purple"
            />
          </div>
        </motion.div>

        {/* Main Content Tabs - Mobile scrollable tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <div className="relative">
              <TabsList className="inline-flex w-full sm:w-auto overflow-x-auto hide-scrollbar p-1 h-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg">
                            Calendar Overview
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Your upcoming schedule
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTimeRange('week')} 
                            className={cn(
                              "text-xs h-8 px-2 sm:px-3",
                              timeRange === 'week' && "bg-muted"
                            )}
                          >
                            Week
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTimeRange('month')} 
                            className={cn(
                              "text-xs h-8 px-2 sm:px-3",
                              timeRange === 'month' && "bg-muted"
                            )}
                          >
                            Month
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <CalendarView bookings={allBookings} />
                    </CardContent>
                  </Card>

                  {/* Upcoming Bookings List */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg">
                        Upcoming Bookings
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Your next scheduled meetings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
                      {upcoming && upcoming.length > 0 ? (
                        upcoming.slice(0, isMobile ? 3 : 5).map((booking) => (
                          <UpcomingBookingCard key={booking.id} booking={booking} />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                          <div className="rounded-full bg-muted p-2 sm:p-3 mb-2 sm:mb-3">
                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">No upcoming bookings</p>
                          <Button variant="link" size="sm" className="mt-1 sm:mt-2 text-xs" asChild>
                            <Link to="/dashboard/availability">Set your availability</Link>
                          </Button>
                        </div>
                      )}
                      
                      {upcoming && upcoming.length > (isMobile ? 3 : 5) && (
                        <Button variant="ghost" className="w-full gap-1 text-xs sm:text-sm" asChild>
                          <Link to="/dashboard/bookings">
                            View all {upcoming.length} bookings
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  {/* Profile Card */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-orange-600 text-white text-sm sm:text-lg">
                            {user?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {user?.user_metadata?.full_name || 'User'}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
                          <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 flex-wrap">
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-[10px] sm:text-xs px-1.5 py-0">
                              {stats.upcomingCount} upcoming
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-[10px] sm:text-xs px-1.5 py-0">
                              {stats.completionRate}% complete
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3 sm:my-4" />

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Booking link</span>
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 text-xs" onClick={copyBookingLink}>
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-muted p-1.5 sm:p-2">
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <p className="text-[10px] sm:text-xs truncate">{bookingLink}</p>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-1 sm:gap-2">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8 sm:h-9" asChild>
                          <Link to="/dashboard/settings">
                            <Settings2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            Settings
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8 sm:h-9" asChild>
                          <Link to={`/${user?.user_metadata?.username || 'book'}`} target="_blank">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            Preview
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Metrics */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                      <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base">
                        Quick Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Event types</span>
                        <span className="font-semibold">{stats.eventTypesCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Avg. duration</span>
                        <span className="font-semibold">{Math.round(stats.avgDuration)} min</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Response time</span>
                        <span className="font-semibold">{stats.responseTime} hrs</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Completion rate</span>
                        <span className="font-semibold">{stats.completionRate}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Event Types */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                      <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base">
                        Popular Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
                      {eventTypes?.slice(0, isMobile ? 3 : 4).map((event) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <div 
                              className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0" 
                              style={{ backgroundColor: event.color }}
                            />
                            <span className="text-xs sm:text-sm truncate">{event.title}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 shrink-0">
                            {event.duration} min
                          </Badge>
                        </div>
                      ))}
                      <Button variant="link" size="sm" className="w-full text-xs sm:text-sm" asChild>
                        <Link to="/dashboard/events">Manage events →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg">
                    Full Schedule
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Complete view of all your bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <CalendarView bookings={allBookings} fullWidth />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg">
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Latest actions and updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-1 sm:space-y-2">
                      {recentActivity.slice(0, isMobile ? 3 : 4).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </CardContent>
                    <CardFooter className="p-4 sm:p-6 pt-0">
                      <Button variant="ghost" size="sm" className="w-full gap-1 text-xs sm:text-sm">
                        View all activity
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                      <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base">
                        Activity Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-4">
                      <MetricCard
                        label="Bookings today"
                        value={upcoming?.filter(b => isToday(parseISO(b.start_time))).length || 0}
                        change={25}
                        icon={CalendarCheck}
                        color="blue"
                      />
                      <MetricCard
                        label="This week"
                        value={stats.thisWeekCount}
                        change={12}
                        icon={TrendingUp}
                        color="green"
                      />
                      <MetricCard
                        label="Response rate"
                        value="94%"
                        change={-2}
                        icon={Activity}
                        color="orange"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg">
                      Booking Trends
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your scheduling patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-60 sm:h-80 flex items-center justify-center border-2 border-dashed rounded-lg mx-4 sm:mx-6 mb-4 sm:mb-6">
                    <div className="text-center">
                      <LineChart className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground/30" />
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                        Analytics chart coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg">
                      Peak Hours
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      When you're most booked
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-60 sm:h-80 flex items-center justify-center border-2 border-dashed rounded-lg mx-4 sm:mx-6 mb-4 sm:mb-6">
                    <div className="text-center">
                      <PieChart className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground/30" />
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                        Distribution chart coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer Stats - Responsive grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.totalBookings}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.upcomingCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">{stats.eventTypesCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Event Types</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.teamCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Team Members</p>
          </div>
        </motion.div>

        {/* Attribution */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 sm:px-4 py-2 text-[10px] sm:text-xs text-muted-foreground">
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

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}