// pages/TeamManagement.tsx - Complete with proper loading indicators and enhanced UX
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  useTeamMembers, 
  useTeamInvites, 
  useDepartments, 
  useTeamActivity,
  useCreateInvite,
  useResendInvite,
  useCancelInvite,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useCurrentUserPermissions,
  useOrganization,
  useTeamMemberOptions,
  useDepartmentOptions,
  TeamMember,
  TeamInvite,
  Department,
  TeamRole,
  TeamStatus
} from "@/hooks/use-team-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  Clock,
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Settings2,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  CalendarDays,
  MessageSquare,
  Link2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Grid3x3,
  Table as TableIcon,
  UserCog,
  UserX,
  UserCheck,
  Briefcase,
  Building2,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Sparkles,
  Zap,
  Loader2,
  CalendarOff,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Minus,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Bell,
  BellOff,
  Clock3,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Coffee,
  Home,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Headphones,
  HeadphonesOff,
  PenTool,
  Pen,
  Eraser,
  Palette,
  Paintbrush,
  PaintBucket,
  Droplet,
  Flame,
  Snowflake,
  Wind,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  SunSnow,
  MoonStar,
  Sparkle,
  PartyPopper,
  Gift,
  CreditCard,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  Wallet,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Package,
  Box,
  Archive,
  ArchiveX,
  ArchiveRestore,
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileJson,
  FileType,
  FileSpreadsheetIcon,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderTree,
  FolderClosed,
  FolderGit,
  FolderGit2,
  FolderHeart,
  FolderCog,
  FolderKey,
  FolderLock,
  FolderUnlock,
  FolderSearch,
  FolderSearch2,
  FolderSymlink,
  FolderSync,
  FolderUp,
  FolderDown,
  FolderInput,
  FolderOutput,
  FolderArchive,
  FolderArchiveRestore,
  FolderX,
  FolderCheck,
  FolderClock,
  FolderCloud,
  FolderCode,
  FolderDiff,
  FolderDot,
  FolderKanban,
  FolderOpenDot,
  FolderRoot,
  FolderTreeIcon,
  FolderUpIcon,
  FolderDownIcon,
  Activity,
  ArrowUp,
  ArrowDown,
  Menu,
  BellRing,
  CheckSquare,
  Square,
  HelpCircle,
  Info,
  Building,
  UsersRound,
  UserCog2,
  UserPlus2,
  UserMinus2,
  UserCheck2,
  UserX2,
  Users2,
  UsersRoundIcon,
  BuildingIcon,
  FolderTreeIcon as FolderTreeIcon2,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CalendarX2,
  CalendarPlus,
  CalendarMinus,
  CalendarSearch,
  CalendarDaysIcon,
  CalendarCheck2 as CalendarCheck2Icon
} from "lucide-react";

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
// UTILITY FUNCTIONS
// ============================================

const getInitials = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return '?';
};

const getRoleIcon = (role: TeamRole) => {
  switch(role) {
    case 'admin': return <ShieldCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />;
    case 'manager': return <Shield className="h-3.5 w-3.5 text-[#C2410C]" />;
    case 'member': return <UserCheck className="h-3.5 w-3.5 text-green-600" />;
    case 'guest': return <UserX className="h-3.5 w-3.5 text-gray-500" />;
    default: return <UserCog className="h-3.5 w-3.5" />;
  }
};

const getRoleBadgeColor = (role: TeamRole) => {
  switch(role) {
    case 'admin': return "bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20";
    case 'manager': return "bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/20";
    case 'member': return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'guest': return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getStatusBadgeColor = (status: TeamStatus) => {
  switch(status) {
    case 'active': return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'inactive': return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    case 'pending': return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case 'suspended': return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};
const formatRelativeTime = (dateString: string) => {
 

  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return "Invalid date";


  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // ==========================
  // FIX FOR FUTURE TIMESTAMPS
  // ==========================
  if (diffInSeconds < 0) {
    console.log("⚠️ Future timestamp detected. Returning formatted date.");
    return formatDate(date); // your existing function
  }

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  const result = formatDate(date);
  console.log("➡️ Returned:", result);
  return result;
};

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoadingSpinner = ({ size = 'md', color = 'text-[#1E3A8A]', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn(
      "animate-spin",
      sizeClasses[size],
      color,
      className
    )} />
  );
};

// ============================================
// LOADING BUTTON COMPONENT
// ============================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

const LoadingButton = ({ 
  loading, 
  loadingText, 
  children, 
  variant = 'default',
  size = 'default',
  icon,
  disabled,
  className,
  ...props 
}: LoadingButtonProps) => {
  const isIconOnly = size === 'icon';
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        "relative transition-all duration-200",
        loading && "cursor-not-allowed opacity-80",
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size={isIconOnly ? 'sm' : 'sm'} color={variant === 'default' ? 'text-white' : undefined} />
          {!isIconOnly && loadingText && <span>{loadingText}</span>}
          {!isIconOnly && !loadingText && children}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon}
          {children}
        </div>
      )}
    </Button>
  );
};

// ============================================
// SKELETON LOADER COMPONENTS
// ============================================

const TableRowSkeleton = () => (
  <TableRow className="border-[#1E3A8A]/10">
    <TableCell>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#1E3A8A]/10 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#1E3A8A]/10 rounded animate-pulse" />
          <div className="h-3 w-24 bg-[#1E3A8A]/5 rounded animate-pulse" />
        </div>
      </div>
    </TableCell>
    <TableCell className="hidden sm:table-cell">
      <div className="h-6 w-20 bg-[#1E3A8A]/10 rounded-full animate-pulse" />
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <div className="h-4 w-24 bg-[#1E3A8A]/10 rounded animate-pulse" />
    </TableCell>
    <TableCell>
      <div className="h-6 w-16 bg-[#1E3A8A]/10 rounded-full animate-pulse" />
    </TableCell>
    <TableCell className="hidden lg:table-cell">
      <div className="h-4 w-20 bg-[#1E3A8A]/10 rounded animate-pulse" />
    </TableCell>
    <TableCell className="text-right">
      <div className="h-8 w-8 bg-[#1E3A8A]/10 rounded ml-auto animate-pulse" />
    </TableCell>
  </TableRow>
);

const GridCardSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10">
    <CardContent className="p-4 sm:p-6">
      <div className="text-center">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#1E3A8A]/10 mx-auto animate-pulse" />
        <div className="mt-2 sm:mt-3 space-y-2">
          <div className="h-5 w-32 bg-[#1E3A8A]/10 rounded mx-auto animate-pulse" />
          <div className="h-4 w-40 bg-[#1E3A8A]/5 rounded mx-auto animate-pulse" />
        </div>
        <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">
          <div className="h-6 w-16 bg-[#1E3A8A]/10 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-[#1E3A8A]/10 rounded-full animate-pulse" />
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E3A8A]/10">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-[#1E3A8A]/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-[#1E3A8A]/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatsCardSkeleton = () => (
  <Card className="bg-white/50 backdrop-blur-sm border-[#1E3A8A]/10">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#1E3A8A]/10 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-[#1E3A8A]/10 rounded animate-pulse" />
          <div className="h-6 w-16 bg-[#1E3A8A]/10 rounded animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// STATS CARD COMPONENT (Dashboard Style)
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
  loading?: boolean;
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
  linkTo,
  loading
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

  const colors = colorClasses[color] || colorClasses.blue;
  const Wrapper = linkTo ? 'a' : onClick ? 'button' : 'div';
  const wrapperProps = linkTo ? { href: linkTo } : onClick ? { onClick } : {};

  if (loading) {
    return <StatsCardSkeleton />;
  }

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
// INVITE DIALOG COMPONENT - FIXED
// ============================================

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: { email: string; role: TeamRole; department?: string }) => void;
  departments?: Department[];
  isLoading?: boolean;
}

function InviteDialog({ open, onOpenChange, onInvite, departments, isLoading }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [department, setDepartment] = useState<string>("none");
  const [emailError, setEmailError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("member");
      setDepartment("none");
      setEmailError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }

    onInvite({ 
      email, 
      role, 
      department: department === "none" ? undefined : department 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        isMobile ? "w-[95vw] rounded-xl p-4" : "sm:max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl flex items-center gap-2 text-[#1E3A8A]">
            <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
              <UserPlus className="h-4 w-4 text-[#1E3A8A]" />
            </div>
            Invite Team Member
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Send an invitation to join {departments ? 'your organization' : 'your team'}. They'll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          {/* Email Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm text-[#1E3A8A]">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              className={cn(
                "h-9 sm:h-10 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20",
                emailError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              )}
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-[10px] sm:text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="role" className="text-xs sm:text-sm text-[#1E3A8A]">Role</Label>
            <Select value={role} onValueChange={(v: TeamRole) => setRole(v)} disabled={isLoading}>
              <SelectTrigger className="h-9 sm:h-10 text-sm focus:ring-[#1E3A8A]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium">Admin</span>
                      <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Full access to all features</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C2410C]" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium">Manager</span>
                      <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Can manage team and view analytics</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium">Member</span>
                      <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Can create events and manage own bookings</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="guest">
                  <div className="flex items-center gap-2">
                    <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium">Guest</span>
                      <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Limited access, cannot create events</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Field */}
          {departments && departments.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="department" className="text-xs sm:text-sm text-[#1E3A8A]">Department (Optional)</Label>
              <Select value={department} onValueChange={setDepartment} disabled={isLoading}>
                <SelectTrigger className="h-9 sm:h-10 text-sm focus:ring-[#1E3A8A]/20">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="text-xs sm:text-sm">{dept.name}</span>
                        {dept.member_count !== undefined && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto">
                            {dept.member_count}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Note */}
          <div className="bg-[#1E3A8A]/5 rounded-lg p-2 sm:p-3 border border-[#1E3A8A]/10">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              <strong className="text-[#1E3A8A]">Note:</strong> Invitations expire after 7 days. 
              The recipient will need to create an account if they don't have one.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5 text-sm h-9 sm:h-10"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={isLoading}
            loadingText="Sending..."
            className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm h-9 sm:h-10"
            icon={<Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          >
            Send Invite
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MEMBER DETAILS DIALOG COMPONENT - ENHANCED
// ============================================

interface MemberDetailsDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (memberId: string, data: any) => void;
  onRemove?: (memberId: string) => void;
  canEdit?: boolean;
  departments?: Department[];
  isUpdating?: boolean;
  isRemoving?: boolean;
}

function MemberDetailsDialog({ 
  member, 
  open, 
  onOpenChange, 
  onUpdate,
  onRemove,
  canEdit,
  departments,
  isUpdating,
  isRemoving
}: MemberDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setEditForm({
        role: member.role,
        department: member.department || "",
        title: member.title || "",
        phone: member.phone || "",
        location: member.location || "",
        bio: member.bio || "",
        timezone: member.timezone,
        notification_preferences: member.notification_preferences || {
          sms: true,
          push: true,
          email: true
        },
        social_links: member.social_links || {}
      });
    }
  }, [member]);

  if (!member) return null;

  const handleCopyEmail = () => {
    if (member.email) {
      navigator.clipboard.writeText(member.email);
      toast({ title: "✅ Copied!", description: "Email copied to clipboard" });
    }
  };

  const handleSave = () => {
    if (onUpdate && member) {
      onUpdate(member.id, editForm);
      setIsEditing(false);
    }
  };

  const handleRemove = () => {
    if (onRemove && member && window.confirm('Are you sure you want to remove this team member?')) {
      onRemove(member.id);
      onOpenChange(false);
    }
  };

  const getDepartmentColor = (deptName: string) => {
    return departments?.find(d => d.name === deptName)?.color || '#94a3b8';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden",
        isMobile ? "h-[100dvh] max-w-[100vw] rounded-none" : "max-w-4xl max-h-[90vh] rounded-2xl"
      )}>
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <DialogHeader className="p-0">
            <DialogTitle className="font-['Space_Grotesk'] text-base sm:text-xl flex items-center gap-2 text-[#1E3A8A]">
              <div className="rounded-lg bg-[#1E3A8A]/10 p-1 sm:p-1.5">
                <UserCog className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1E3A8A]" />
              </div>
              Team Member Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-1 sm:gap-2">
            {canEdit && !isEditing && (
              <LoadingButton 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)} 
                className="h-7 w-7 sm:h-8 sm:w-8"
                loading={isUpdating}
                icon={<Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              />
            )}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-7 w-7 sm:h-8 sm:w-8">
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6" style={{ maxHeight: isMobile ? "calc(100dvh - 80px)" : "calc(90vh - 80px)" }}>
          {/* Member Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start mb-6 sm:mb-8">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-[#1E3A8A]/20 shrink-0">
              {member.avatar_url ? (
                <AvatarImage src={member.avatar_url} alt={member.full_name || ''} />
              ) : (
                <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-base sm:text-xl">
                  {getInitials(member.full_name?.split(' ')[0], member.full_name?.split(' ')[1], member.email)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-[#1E3A8A] truncate">
                      {member.full_name || 'Unnamed'}
                    </h2>
                    <Badge className={cn("capitalize text-xs", getRoleBadgeColor(member.role))}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{member.role}</span>
                    </Badge>
                    <Badge className={getStatusBadgeColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {member.department ? (
                      <>
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getDepartmentColor(member.department) }} />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {member.department}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">No department assigned</p>
                    )}
                    {member.title && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-xs sm:text-sm text-muted-foreground">{member.title}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 sm:gap-2 text-xs h-8 sm:h-9"
                    onClick={handleCopyEmail}
                  >
                    <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Copy Email</span>
                    <span className="sm:hidden">Copy</span>
                  </Button>
                  {canEdit && (
                    <LoadingButton
                      size="sm"
                      variant="destructive"
                      className="gap-1 sm:gap-2 text-xs h-8 sm:h-9"
                      onClick={handleRemove}
                      loading={isRemoving}
                      loadingText=""
                      icon={<Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                    >
                      <span className="hidden sm:inline">Remove</span>
                    </LoadingButton>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4">
                {member.email && (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                    <span className="text-muted-foreground truncate max-w-[150px] sm:max-w-none">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#C2410C] shrink-0" />
                    <span className="text-muted-foreground">{member.phone}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                    <span className="text-muted-foreground">{member.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 shrink-0" />
                  <span className="text-muted-foreground truncate max-w-[120px] sm:max-w-none">{member.timezone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full bg-[#1E3A8A]/10 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Metrics
              </TabsTrigger>
              <TabsTrigger value="availability" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Availability
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {/* Bio Section */}
              {member.bio && (
                <Card>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                    <CardTitle className="text-xs sm:text-sm font-medium">About</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Contact & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                    <CardTitle className="text-xs sm:text-sm font-medium">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">{member.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{member.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{member.location || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Timezone</span>
                      <span className="font-medium">{member.timezone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                    <CardTitle className="text-xs sm:text-sm font-medium">Work Information</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium flex items-center gap-1">
                        {member.department ? (
                          <>
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getDepartmentColor(member.department) }} />
                            {member.department}
                          </>
                        ) : 'Not assigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium">{member.title || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium">{formatDate(member.joined_at || member.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="font-medium">{member.last_active ? formatRelativeTime(member.last_active) : 'Never'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Links */}
              {member.social_links && Object.keys(member.social_links).length > 0 && (
                <Card>
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                    <CardTitle className="text-xs sm:text-sm font-medium">Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {member.social_links.github && (
                        <a href={member.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-[#1E3A8A]">
                          <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">GitHub</span>
                        </a>
                      )}
                      {member.social_links.linkedin && (
                        <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-[#1E3A8A]">
                          <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">LinkedIn</span>
                        </a>
                      )}
                      {member.social_links.twitter && (
                        <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-[#1E3A8A]">
                          <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Twitter</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="text-center">
                      <div className="rounded-full bg-[#1E3A8A]/10 p-2 sm:p-3 w-fit mx-auto mb-2 sm:mb-3">
                        <Calendar className="h-3 w-3 sm:h-5 sm:w-5 text-[#1E3A8A]" />
                      </div>
                      <p className="text-base sm:text-2xl font-bold font-['Space_Grotesk']">0</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Events Created</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="text-center">
                      <div className="rounded-full bg-[#C2410C]/10 p-2 sm:p-3 w-fit mx-auto mb-2 sm:mb-3">
                        <Users className="h-3 w-3 sm:h-5 sm:w-5 text-[#C2410C]" />
                      </div>
                      <p className="text-base sm:text-2xl font-bold font-['Space_Grotesk']">0</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Total Attendees</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="text-center">
                      <div className="rounded-full bg-green-600/10 p-2 sm:p-3 w-fit mx-auto mb-2 sm:mb-3">
                        <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <p className="text-base sm:text-2xl font-bold font-['Space_Grotesk']">0%</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Attendance Rate</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="text-center">
                      <div className="rounded-full bg-purple-600/10 p-2 sm:p-3 w-fit mx-auto mb-2 sm:mb-3">
                        <Star className="h-3 w-3 sm:h-5 sm:w-5 text-purple-600" />
                      </div>
                      <p className="text-base sm:text-2xl font-bold font-['Space_Grotesk']">0</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Rating</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart Placeholder */}
              <Card>
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Performance Overview</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">Events created and attendance rate over time</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="h-[150px] sm:h-[200px] flex items-center justify-center border-2 border-dashed border-[#1E3A8A]/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">No data available yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {/* Working Hours - This would come from the availability table */}
              <Card>
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Working Hours</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">Regular availability schedule</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium">Monday - Friday</span>
                      <span className="text-muted-foreground">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium">Saturday</span>
                      <span className="text-muted-foreground">Unavailable</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium">Sunday</span>
                      <span className="text-muted-foreground">Unavailable</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Off */}
              <Card>
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Upcoming Time Off</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">Scheduled leaves and holidays</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="text-center py-4 sm:py-6 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                    <p className="text-xs sm:text-sm">No time off scheduled</p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card>
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Current Status</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <div className={cn(
                        "h-8 w-8 sm:h-12 sm:w-12 rounded-full flex items-center justify-center",
                        member.status === 'active' ? "bg-green-500/20" : "bg-gray-500/20"
                      )}>
                        <div className={cn(
                          "h-2 w-2 sm:h-3 sm:w-3 rounded-full",
                          member.status === 'active' ? "bg-green-500 animate-pulse" : "bg-gray-500"
                        )} />
                      </div>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-medium font-['Space_Grotesk'] capitalize text-green-600">
                        {member.status}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {member.status === 'active' ? 'Currently available' : 'Currently unavailable'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {/* Recent Activity Feed - Would come from team_activity table */}
              <Card>
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                    <p className="text-xs sm:text-sm">No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN TEAM MANAGEMENT PAGE COMPONENT
// ============================================

export default function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<TeamRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TeamStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<{
    type: 'invite' | 'resend' | 'cancel' | 'update' | 'remove' | null;
    id?: string;
  }>({ type: null });

  // Fetch data from hooks
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useTeamMembers();
  const { data: invites, isLoading: invitesLoading, refetch: refetchInvites } = useTeamInvites();
  const { data: departments, isLoading: deptsLoading } = useDepartments();
  const { data: activity, isLoading: activityLoading } = useTeamActivity();
  const { data: permissions, isLoading: permissionsLoading } = useCurrentUserPermissions();
  const { data: organization, isLoading: orgLoading } = useOrganization();
  
  // Mutations
  const createInvite = useCreateInvite();
  const resendInvite = useResendInvite();
  const cancelInvite = useCancelInvite();
  const updateMember = useUpdateTeamMember();
  const removeMember = useRemoveTeamMember();

  const canInvite = permissions?.canInvite ?? false;
  const canManage = permissions?.canManage ?? false;
  const isAdmin = permissions?.isAdmin ?? false;

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return members?.filter(member => {
      const matchesSearch = 
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || 
        (departmentFilter === "unassigned" && !member.department) ||
        member.department === departmentFilter;
      
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    }) || [];
  }, [members, searchQuery, roleFilter, statusFilter, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const totalMembers = members?.length || 0;
    const activeMembers = members?.filter(m => m.status === 'active').length || 0;
    const pendingInvites = invites?.length || 0;
    const totalDepartments = departments?.length || 0;
    const unassignedMembers = members?.filter(m => !m.department).length || 0;
    const activePercentage = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    return {
      totalMembers,
      activeMembers,
      pendingInvites,
      totalDepartments,
      unassignedMembers,
      activePercentage
    };
  }, [members, invites, departments]);

  // Handle invite
  const handleInvite = async (data: { email: string; role: TeamRole; department?: string }) => {
    setActionLoading({ type: 'invite' });
    try {
      await createInvite.mutateAsync(data);
      toast({
        title: "✅ Invitation sent",
        description: `Invitation sent to ${data.email}`,
      });
      refetchInvites();
      setShowInviteDialog(false);
    } catch (error) {
      toast({
        title: "❌ Failed to send invitation",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading({ type: null });
    }
  };

  // Handle resend invite
  const handleResendInvite = async (inviteId: string) => {
    setActionLoading({ type: 'resend', id: inviteId });
    try {
      await resendInvite.mutateAsync(inviteId);
      toast({
        title: "✅ Invite resent",
        description: "Invitation has been resent",
      });
    } catch (error) {
      toast({
        title: "❌ Failed to resend",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading({ type: null });
    }
  };

  // Handle cancel invite
  const handleCancelInvite = async (inviteId: string) => {
    setActionLoading({ type: 'cancel', id: inviteId });
    try {
      await cancelInvite.mutateAsync(inviteId);
      toast({
        title: "✅ Invite cancelled",
        description: "Invitation has been cancelled",
      });
      refetchInvites();
    } catch (error) {
      toast({
        title: "❌ Failed to cancel",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading({ type: null });
    }
  };

  // Handle member update
  const handleUpdateMember = async (memberId: string, data: any) => {
    setActionLoading({ type: 'update', id: memberId });
    try {
      await updateMember.mutateAsync({ memberId, ...data });
      toast({
        title: "✅ Member updated",
        description: "Team member information has been updated",
      });
      refetchMembers();
    } catch (error) {
      toast({
        title: "❌ Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading({ type: null });
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    setActionLoading({ type: 'remove', id: memberId });
    try {
      await removeMember.mutateAsync(memberId);
      toast({
        title: "✅ Member removed",
        description: "Team member has been removed",
      });
      refetchMembers();
    } catch (error) {
      toast({
        title: "❌ Removal failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading({ type: null });
    }
  };

  const isLoading = membersLoading || invitesLoading || deptsLoading || permissionsLoading || orgLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full border-4 border-[#1E3A8A]/20 border-t-[#1E3A8A] animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#1E3A8A]/40" />
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#1E3A8A] font-['Space_Grotesk']">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] pb-20 md:pb-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm border-b border-[#1E3A8A]/10 sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] text-[#1E3A8A] flex items-center gap-2">
                <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                Team Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                {organization?.name || 'No organization'} • {filteredMembers.length} team {filteredMembers.length === 1 ? 'member' : 'members'}
                {stats.unassignedMembers > 0 && ` • ${stats.unassignedMembers} unassigned`}
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                className="h-8 w-8 sm:h-9 sm:w-9 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
              >
                {viewMode === "table" ? <Grid3x3 className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
              </Button>
              
              {canInvite && (
                <LoadingButton 
                  onClick={() => setShowInviteDialog(true)} 
                  size={isMobile ? "sm" : "default"} 
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs sm:text-sm h-8 sm:h-10"
                  icon={<UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  loading={actionLoading.type === 'invite'}
                  loadingText="Inviting..."
                >
                  <span className="hidden sm:inline">Invite Member</span>
                  <span className="sm:hidden">Invite</span>
                </LoadingButton>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 w-full h-9 sm:h-10 text-sm border-[#1E3A8A]/20 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-9 sm:h-10 text-xs sm:text-sm border-[#1E3A8A]/20">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-9 sm:h-10 text-xs sm:text-sm border-[#1E3A8A]/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-9 sm:h-10 text-xs sm:text-sm border-[#1E3A8A]/20">
                  <SelectValue placeholder="Dept" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Depts</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {departments?.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                        {dept.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Dashboard-style Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            description={`${stats.activeMembers} active members`}
            color="blue"
            progress={stats.activePercentage}
          />
          <StatsCard
            title="Active Now"
            value={stats.activeMembers}
            icon={UserCheck}
            trend={{ value: 8, direction: 'up', label: 'this week' }}
            description={`${stats.activePercentage}% of team active`}
            color="green"
          />
          <StatsCard
            title="Pending Invites"
            value={stats.pendingInvites}
            icon={Mail}
            trend={{ value: stats.pendingInvites > 0 ? 2 : 0, direction: stats.pendingInvites > 0 ? 'up' : 'neutral' }}
            description={`${stats.pendingInvites} awaiting response`}
            color="orange"
          />
          <StatsCard
            title="Departments"
            value={stats.totalDepartments}
            icon={Building2}
            trend={{ value: 5, direction: 'up', label: 'new dept' }}
            description={`${stats.unassignedMembers} unassigned members`}
            color="purple"
          />
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-white/50 backdrop-blur-sm border-[#1E3A8A]/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5 sm:p-2">
                  <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Admins</p>
                  <p className="text-sm sm:text-base font-semibold">{members?.filter(m => m.role === 'admin').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border-[#1E3A8A]/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-[#C2410C]/10 p-1.5 sm:p-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-[#C2410C]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Managers</p>
                  <p className="text-sm sm:text-base font-semibold">{members?.filter(m => m.role === 'manager').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border-[#1E3A8A]/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-green-600/10 p-1.5 sm:p-2">
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Members</p>
                  <p className="text-sm sm:text-base font-semibold">{members?.filter(m => m.role === 'member').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border-[#1E3A8A]/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-gray-500/10 p-1.5 sm:p-2">
                  <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Guests</p>
                  <p className="text-sm sm:text-base font-semibold">{members?.filter(m => m.role === 'guest').length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members View */}
        {membersLoading ? (
          // Loading Skeletons
          viewMode === "table" ? (
            <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-[#1E3A8A]/10">
                      <TableHead className="text-xs sm:text-sm">Member</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Department</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Last Active</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <GridCardSkeleton key={i} />
              ))}
            </div>
          )
        ) : filteredMembers.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 py-8 sm:py-12">
              <CardContent className="text-center">
                <div className="rounded-full bg-[#1E3A8A]/10 p-3 sm:p-4 w-fit mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#1E3A8A]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold font-['Space_Grotesk'] text-[#1E3A8A] mb-2">No team members yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                  {canInvite 
                    ? "Get started by inviting your first team member to join your organization."
                    : "There are no team members to display. Contact an administrator to get invited."}
                </p>
                {canInvite && (
                  <LoadingButton 
                    onClick={() => setShowInviteDialog(true)} 
                    size={isMobile ? "sm" : "default"} 
                    className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs sm:text-sm"
                    icon={<UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    loading={actionLoading.type === 'invite'}
                    loadingText="Inviting..."
                  >
                    Invite Your First Member
                  </LoadingButton>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : viewMode === "table" ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-[#1E3A8A]/10">
                      <TableHead className="text-xs sm:text-sm">Member</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Department</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Last Active</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        className="cursor-pointer hover:bg-[#1E3A8A]/5 border-[#1E3A8A]/10"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberDetails(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-[#1E3A8A]/20 shrink-0">
                              {member.avatar_url ? (
                                <AvatarImage src={member.avatar_url} alt={member.full_name || ''} />
                              ) : (
                                <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs sm:text-sm">
                                  {getInitials(member.full_name?.split(' ')[0], member.full_name?.split(' ')[1], member.email)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium font-['Space_Grotesk'] text-[#1E3A8A] text-xs sm:text-sm truncate">
                                {member.full_name || 'Unnamed'}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={cn("capitalize text-[10px] sm:text-xs", getRoleBadgeColor(member.role))}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1 hidden sm:inline">{member.role}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {member.department ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full" style={{ 
                                backgroundColor: departments?.find(d => d.name === member.department)?.color ?? '#94a3b8' 
                              }} />
                              <span className="text-xs sm:text-sm truncate max-w-[100px]">{member.department}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px] sm:text-xs border-gray-200 text-muted-foreground">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize text-[10px] sm:text-xs whitespace-nowrap", getStatusBadgeColor(member.status))}>
                            {member.status === 'active' && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
                            {member.status === 'pending' && <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
                            {member.status === 'inactive' && <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
                            {member.status === 'suspended' && <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
                            <span className="hidden sm:inline">{member.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-xs sm:text-sm">{member.last_active ? formatRelativeTime(member.last_active) : 'Never'}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{member.last_active ? formatDateTime(member.last_active) : 'No activity recorded'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMember(member);
                                setShowMemberDetails(true);
                              }} className="text-xs sm:text-sm">
                                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {canManage && (
                                <>
                                  <DropdownMenuItem className="text-xs sm:text-sm">
                                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 text-xs sm:text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Are you sure you want to remove ${member.full_name || member.email}?`)) {
                                        handleRemoveMember(member.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Grid View
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {paginatedMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedMember(member);
                  setShowMemberDetails(true);
                }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 hover:shadow-lg transition-all hover:border-[#1E3A8A]/30 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center">
                      <div className="relative">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto border-4 border-[#1E3A8A]/20 group-hover:border-[#1E3A8A]/40 transition-all">
                          {member.avatar_url ? (
                            <AvatarImage src={member.avatar_url} alt={member.full_name || ''} />
                          ) : (
                            <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-base sm:text-xl">
                              {getInitials(member.full_name?.split(' ')[0], member.full_name?.split(' ')[1], member.email)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0">
                          <Badge className={cn("capitalize text-[8px] sm:text-[10px]", getStatusBadgeColor(member.status))}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <h3 className="mt-2 sm:mt-3 font-bold font-['Space_Grotesk'] text-[#1E3A8A] text-sm sm:text-base truncate">
                        {member.full_name || 'Unnamed'}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</p>
                      
                      <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                        <Badge className={cn("capitalize text-[8px] sm:text-xs", getRoleBadgeColor(member.role))}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{member.role}</span>
                        </Badge>
                        {member.department ? (
                          <Badge variant="outline" className="text-[8px] sm:text-xs border-[#1E3A8A]/20">
                            {member.department}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] sm:text-xs border-gray-200 text-muted-foreground">
                            Unassigned
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="text-muted-foreground">Last active</span>
                          <span className="font-medium truncate max-w-[100px]">
                            {member.last_active ? formatRelativeTime(member.last_active) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {!membersLoading && filteredMembers.length > 0 && totalPages > 1 && (
          <motion.div variants={itemVariants} className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </p>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-[60px] sm:w-[80px] h-7 sm:h-8 text-xs border-[#1E3A8A]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-7 w-7 sm:h-8 sm:w-8 border-[#1E3A8A]/20"
              >
                <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 sm:h-8 sm:w-8 border-[#1E3A8A]/20"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-[#1E3A8A]/5 rounded-md border border-[#1E3A8A]/10">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 sm:h-8 sm:w-8 border-[#1E3A8A]/20"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-7 w-7 sm:h-8 sm:w-8 border-[#1E3A8A]/20"
              >
                <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Pending Invites Section */}
        {!invitesLoading && invites && invites.length > 0 && (
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-[#1E3A8A] mb-3 sm:mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              Pending Invitations
              {actionLoading.type === 'resend' && (
                <LoadingSpinner size="sm" className="ml-2" />
              )}
            </h2>
            <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-[#1E3A8A]/10">
                      <TableHead className="text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Department</TableHead>
                      <TableHead className="text-xs sm:text-sm">Invited</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Expires</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id} className="border-[#1E3A8A]/10">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{invite.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={cn("capitalize text-[10px] sm:text-xs", getRoleBadgeColor(invite.role))}>
                            {getRoleIcon(invite.role)}
                            <span className="ml-1">{invite.role}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{invite.department || '—'}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-xs sm:text-sm">{formatRelativeTime(invite.created_at)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{formatDateTime(invite.created_at)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {invite.expires_at && (
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {formatRelativeTime(invite.expires_at)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <LoadingButton
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResendInvite(invite.id)}
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              loading={actionLoading.type === 'resend' && actionLoading.id === invite.id}
                              icon={<RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                            />
                            <LoadingButton
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelInvite(invite.id)}
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              loading={actionLoading.type === 'cancel' && actionLoading.id === invite.id}
                              icon={<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading state for invites */}
        {invitesLoading && (
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8">
            <div className="h-6 w-40 bg-[#1E3A8A]/10 rounded animate-pulse mb-4" />
            <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#1E3A8A]/10 animate-pulse" />
                        <div className="h-4 w-32 bg-[#1E3A8A]/10 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-16 bg-[#1E3A8A]/10 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.totalMembers}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Members</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">{stats.activeMembers}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.pendingInvites}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.totalDepartments}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Departments</p>
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
      </div>

      {/* Dialogs */}
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInvite={handleInvite}
        departments={departments}
        isLoading={actionLoading.type === 'invite'}
      />

      <MemberDetailsDialog
        member={selectedMember}
        open={showMemberDetails}
        onOpenChange={setShowMemberDetails}
        onUpdate={handleUpdateMember}
        onRemove={handleRemoveMember}
        canEdit={canManage}
        departments={departments}
        isUpdating={actionLoading.type === 'update' && actionLoading.id === selectedMember?.id}
        isRemoving={actionLoading.type === 'remove' && actionLoading.id === selectedMember?.id}
      />



      {/* CSS */}
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