// pages/Departments.tsx
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  useDepartments,
  useDepartmentDetails,
  useDepartmentAnalytics,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useUpdateDepartmentMembers,
  useAvailableMembers,
  useAllMembers,
  useCheckDepartmentName,
  DepartmentWithStats,
  DepartmentDetails,
  DepartmentAnalytics,
  AvailableMember
} from "@/hooks/use-departments";
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
  Building2,
  Users,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  Grid3x3,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
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
  UserCog,
  UserX,
  UserCheck,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Clock,
  Loader2,
  Check,
  X,
  Palette,
  Paintbrush,
  Home,
  FolderTree,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  Menu,
  BellRing,
  HelpCircle,
  Info,
  ArrowUp,
  ArrowDown
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

const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return '?';
};

const getRoleIcon = (role: string) => {
  switch(role) {
    case 'admin': return <ShieldCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />;
    case 'manager': return <Shield className="h-3.5 w-3.5 text-[#C2410C]" />;
    case 'member': return <UserCheck className="h-3.5 w-3.5 text-green-600" />;
    case 'guest': return <UserX className="h-3.5 w-3.5 text-gray-500" />;
    default: return <UserCog className="h-3.5 w-3.5" />;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch(role) {
    case 'admin': return "bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20";
    case 'manager': return "bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/20";
    case 'member': return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'guest': return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getStatusBadgeColor = (status: string) => {
  switch(status) {
    case 'active': return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'inactive': return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    case 'pending': return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case 'suspended': return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};

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
  onClick?: () => void;
}

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  description,
  progress,
  onClick
}: StatsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "bg-blue-500 text-white",
      text: "text-blue-600 dark:text-blue-400",
      progress: "bg-blue-500"
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800",
      icon: "bg-orange-500 text-white",
      text: "text-orange-600 dark:text-orange-400",
      progress: "bg-orange-500"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      icon: "bg-green-500 text-white",
      text: "text-green-600 dark:text-green-400",
      progress: "bg-green-500"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
      icon: "bg-purple-500 text-white",
      text: "text-purple-600 dark:text-purple-400",
      progress: "bg-purple-500"
    },
    slate: {
      bg: "bg-slate-50 dark:bg-slate-950/30",
      border: "border-slate-200 dark:border-slate-800",
      icon: "bg-slate-500 text-white",
      text: "text-slate-600 dark:text-slate-400",
      progress: "bg-slate-500"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={!isMobile && onClick ? { y: -2 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 sm:p-5 transition-all duration-300",
        colors.bg,
        colors.border,
        onClick && "cursor-pointer active:scale-95 hover:shadow-lg"
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
            trend.direction === 'up' ? 'bg-green-100 text-green-700' :
            trend.direction === 'down' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          )}>
            {trend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
            {trend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
            <span>{trend.value}%</span>
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
    </motion.div>
  );
};

// ============================================
// CREATE/EDIT DEPARTMENT DIALOG
// ============================================

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: DepartmentWithStats | null;
  onSave: (data: {
    name: string;
    description?: string;
    color?: string;
    manager_id?: string;
  }) => void;
  isLoading?: boolean;
}

function DepartmentDialog({ open, onOpenChange, department, onSave, isLoading }: DepartmentDialogProps) {
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");
  const [color, setColor] = useState(department?.color || "#1E3A8A");
  const [managerId, setManagerId] = useState<string>(department?.manager_id || "none");
  const [nameError, setNameError] = useState<string | null>(null);
  
  const { data: members } = useAllMembers();
  const checkName = useCheckDepartmentName();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Predefined color options
  const colorOptions = [
    { value: "#1E3A8A", label: "Navy Blue" },
    { value: "#C2410C", label: "Burnt Orange" },
    { value: "#059669", label: "Emerald Green" },
    { value: "#7C3AED", label: "Purple" },
    { value: "#DC2626", label: "Red" },
    { value: "#D97706", label: "Amber" },
    { value: "#0891B2", label: "Cyan" },
    { value: "#6B7280", label: "Gray" },
  ];

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description || "");
      setColor(department.color || "#1E3A8A");
      setManagerId(department.manager_id || "none");
    } else {
      setName("");
      setDescription("");
      setColor("#1E3A8A");
      setManagerId("none");
    }
    setNameError(null);
  }, [department, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError("Department name is required");
      return;
    }

    // Check if name is available (for new departments)
    if (!department) {
      const isAvailable = await checkName.mutateAsync({ 
        name: name.trim() 
      });
      if (!isAvailable) {
        setNameError("Department name already exists");
        return;
      }
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      manager_id: managerId === "none" ? undefined : managerId,
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
              {department ? <Edit className="h-4 w-4 text-[#1E3A8A]" /> : <Plus className="h-4 w-4 text-[#1E3A8A]" />}
            </div>
            {department ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {department 
              ? "Update department information and settings."
              : "Create a new department to organize your team members."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          {/* Name Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm text-[#1E3A8A]">
              Department Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Engineering, Sales, Marketing"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              className={cn(
                "h-9 sm:h-10 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20",
                nameError && "border-red-500 focus:border-red-500"
              )}
            />
            {nameError && (
              <p className="text-[10px] sm:text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm text-[#1E3A8A]">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What does this department do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20 sm:h-24 text-sm resize-none focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm text-[#1E3A8A]">Department Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "h-8 sm:h-10 rounded-md border-2 transition-all flex items-center justify-center",
                    color === option.value 
                      ? "border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20" 
                      : "border-transparent hover:border-gray-200"
                  )}
                  style={{ backgroundColor: option.value }}
                >
                  {color === option.value && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Manager Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="manager" className="text-xs sm:text-sm text-[#1E3A8A]">
              Department Manager
            </Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger className="h-9 sm:h-10 text-sm focus:ring-[#1E3A8A]/20">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        {member.avatar_url ? (
                          <AvatarImage src={member.avatar_url} />
                        ) : (
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.full_name, member.email)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-xs sm:text-sm">
                        {member.full_name || member.email}
                      </span>
                      <Badge className={cn("ml-auto text-[8px] sm:text-[10px]", getRoleBadgeColor(member.role))}>
                        {member.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Manager will have department oversight and analytics access.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5 text-sm h-9 sm:h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !name.trim()} 
            className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm h-9 sm:h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                <span>{department ? "Updating..." : "Creating..."}</span>
              </>
            ) : (
              <>
                {department ? <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
                <span>{department ? "Update Department" : "Create Department"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DEPARTMENT DETAILS DIALOG
// ============================================

interface DepartmentDetailsDialogProps {
  department: DepartmentWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (dept: DepartmentWithStats) => void;
  onDelete?: (deptId: string) => void;
  onManageMembers?: (dept: DepartmentWithStats) => void;
}

function DepartmentDetailsDialog({ 
  department, 
  open, 
  onOpenChange,
  onEdit,
  onDelete,
  onManageMembers
}: DepartmentDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: details, isLoading } = useDepartmentDetails(department?.id || null);
  const { data: analytics } = useDepartmentAnalytics(); // Add this hook
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();

  if (!department) return null;

  // Get analytics for this specific department
  const departmentAnalytics = analytics?.find(a => a.department_id === department.id);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "Copied!", description: "Email copied to clipboard" });
  };

  // Calculate derived metrics
  const avgBookingsPerEvent = departmentAnalytics?.total_events 
    ? ((departmentAnalytics.total_bookings || 0) / departmentAnalytics.total_events).toFixed(1)
    : 0;

  const memberActivityRate = departmentAnalytics?.total_members
    ? Math.round(((departmentAnalytics.active_members || 0) / departmentAnalytics.total_members) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden",
        isMobile ? "h-[100dvh] max-w-[100vw] rounded-none" : "max-w-4xl max-h-[90vh] rounded-2xl"
      )}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <DialogHeader className="p-0">
            <DialogTitle className="font-['Space_Grotesk'] text-base sm:text-xl flex items-center gap-2">
              <div 
                className="rounded-lg p-1.5"
                style={{ backgroundColor: `${department.color}20` }}
              >
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: department.color }} />
              </div>
              {department.name}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {department.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-1 sm:gap-2">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(department)} className="h-7 w-7 sm:h-8 sm:w-8">
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-7 w-7 sm:h-8 sm:w-8">
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6" style={{ maxHeight: isMobile ? "calc(100dvh - 80px)" : "calc(90vh - 80px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
            </div>
          ) : (
            <>
              {/* Department Header Stats - Now with Real Data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-[#1E3A8A]" />
                    <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk']">
                      {departmentAnalytics?.total_members || details?.members?.length || 0}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Members</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-[#C2410C]" />
                    <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk']">
                      {details?.members?.filter(m => m.role === 'admin' || m.role === 'manager').length || 0}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Leads</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-green-600" />
                    <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk']">
                      {departmentAnalytics?.total_events || 0}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Total Events</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-purple-600" />
                    <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk']">
                      {memberActivityRate}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Active Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full bg-[#1E3A8A]/10 h-auto p-1">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="members" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    Members ({details?.members?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Manager Card - Keep as is */}
                  {details?.manager ? (
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />
                          Department Manager
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-[#1E3A8A]/20">
                            {details.manager.avatar_url ? (
                              <AvatarImage src={details.manager.avatar_url} />
                            ) : (
                              <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A]">
                                {getInitials(details.manager.full_name, details.manager.email)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium font-['Space_Grotesk'] text-sm sm:text-base truncate">
                              {details.manager.full_name || "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{details.manager.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={cn("text-[8px] sm:text-[10px]", getRoleBadgeColor(details.manager.role))}>
                                {details.manager.role}
                              </Badge>
                              {details.manager.title && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {details.manager.title}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => details.manager?.email && handleCopyEmail(details.manager.email)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-4 sm:p-6 text-center">
                        <UserCog className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm font-medium">No Manager Assigned</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assign a manager to oversee this department
                        </p>
                        {onEdit && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => onEdit(department)}
                          >
                            Assign Manager
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Department Info - Keep as is */}
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                      <CardTitle className="text-xs sm:text-sm font-medium">Department Information</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{formatDate(department.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">{formatRelativeTime(department.updated_at)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Department ID</span>
                        <span className="font-medium font-mono text-[10px] sm:text-xs">{department.id.slice(0, 8)}...</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Members Tab - Keep as is */}
                  <Card>
                    <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xs sm:text-sm font-medium">Team Members</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">
                          {details?.members?.length || 0} members in this department
                        </CardDescription>
                      </div>
                      {onManageMembers && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 sm:h-8 text-xs"
                          onClick={() => onManageMembers(department)}
                        >
                          <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                          Manage
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                      {details?.members && details.members.length > 0 ? (
                        <div className="space-y-2">
                          {details.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                                  {member.avatar_url ? (
                                    <AvatarImage src={member.avatar_url} />
                                  ) : (
                                    <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-[10px] sm:text-xs">
                                      {getInitials(member.full_name, member.email)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium font-['Space_Grotesk'] text-xs sm:text-sm truncate">
                                    {member.full_name || "Unnamed"}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-[8px] sm:text-[10px]", getRoleBadgeColor(member.role))}>
                                  {member.role}
                                </Badge>
                                {member.title && (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                                    {member.title}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <Users className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <p className="text-sm font-medium">No members yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add team members to this department
                          </p>
                          {onManageMembers && (
                            <Button 
                              size="sm" 
                              className="mt-3 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                              onClick={() => onManageMembers(department)}
                            >
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Add Members
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Analytics Tab - Now with Real Data */}
                  <Card>
                    <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                      <CardTitle className="text-xs sm:text-sm font-medium">Performance Overview</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">
                        Department metrics and activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                      {departmentAnalytics ? (
                        <div className="space-y-4">
                          {/* Event Breakdown */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#1E3A8A]/5 rounded-lg p-3">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Team Events</p>
                              <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-[#1E3A8A]">
                                {departmentAnalytics.team_events || 0}
                              </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Personal Events</p>
                              <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">
                                {departmentAnalytics.personal_events || 0}
                              </p>
                            </div>
                          </div>

                          {/* Booking Stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Team Bookings</p>
                              <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">
                                {departmentAnalytics.team_bookings || 0}
                              </p>
                            </div>
                            <div className="bg-[#C2410C]/5 rounded-lg p-3">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Personal Bookings</p>
                              <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-[#C2410C]">
                                {departmentAnalytics.personal_bookings || 0}
                              </p>
                            </div>
                          </div>

                          {/* Completion Rate */}
                          <div className="bg-[#1E3A8A]/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Completion Rate</p>
                              <p className="text-xs sm:text-sm font-bold text-[#1E3A8A]">
                                {departmentAnalytics.completion_rate || 0}%
                              </p>
                            </div>
                            <Progress value={departmentAnalytics.completion_rate || 0} className="h-2" />
                          </div>

                          {/* Average Bookings */}
                          <div className="bg-[#1E3A8A]/5 rounded-lg p-3">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Average Bookings per Event</p>
                            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-[#1E3A8A]">
                              {avgBookingsPerEvent}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[200px] sm:h-[250px] flex items-center justify-center border-2 border-dashed border-[#1E3A8A]/20 rounded-lg">
                          <div className="text-center">
                            <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              No analytics data available yet
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="rounded-full bg-[#1E3A8A]/10 p-2 w-fit mx-auto mb-2">
                            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                          </div>
                          <p className="text-base sm:text-lg font-bold font-['Space_Grotesk']">
                            {departmentAnalytics?.total_events || 0}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Events</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <div className="text-center">
                          <div className="rounded-full bg-green-600/10 p-2 w-fit mx-auto mb-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <p className="text-base sm:text-lg font-bold font-['Space_Grotesk']">
                            {departmentAnalytics?.total_bookings || 0}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Total Bookings</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Member Activity */}
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs sm:text-sm font-medium">Member Activity</p>
                        <Badge variant="outline" className={cn(
                          memberActivityRate > 0 ? "bg-green-50 text-green-700" : "bg-gray-50"
                        )}>
                          {memberActivityRate}% active
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="text-muted-foreground">Active Members</span>
                          <span className="font-medium">{departmentAnalytics?.active_members || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="text-muted-foreground">Total Members</span>
                          <span className="font-medium">{departmentAnalytics?.total_members || 0}</span>
                        </div>
                        <Progress value={memberActivityRate} className="h-2 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Footer Actions - Keep as is */}
        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 flex justify-between">
          <div className="flex gap-2">
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 sm:h-9 text-xs"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${department.name}?`)) {
                    onDelete(department.id);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// ============================================
// MANAGE MEMBERS DIALOG
// ============================================

interface ManageMembersDialogProps {
  department: DepartmentWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (memberIds: string[]) => void;
  isLoading?: boolean;
}

function ManageMembersDialog({ department, open, onOpenChange, onSave, isLoading }: ManageMembersDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: availableMembers, isLoading: membersLoading } = useAvailableMembers(department?.name);
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (department && availableMembers) {
      // Pre-select members already in this department
      const currentMemberIds = availableMembers
        .filter(m => m.department === department.name)
        .map(m => m.id);
      setSelectedMembers(currentMemberIds);
    }
  }, [department, availableMembers]);

  const filteredMembers = useMemo(() => {
    return (availableMembers || []).filter(member => {
      return (
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [availableMembers, searchQuery]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAll = () => {
    setSelectedMembers(filteredMembers.map(m => m.id));
  };

  const deselectAll = () => {
    setSelectedMembers([]);
  };

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        isMobile ? "w-[95vw] rounded-xl p-4" : "sm:max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl flex items-center gap-2 text-[#1E3A8A]">
            <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
              <UserPlus className="h-4 w-4 text-[#1E3A8A]" />
            </div>
            Manage Members - {department.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Select team members to add to this department. Members can belong to one department at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 sm:h-10 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll} className="h-9 sm:h-10 text-xs">
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll} className="h-9 sm:h-10 text-xs">
              Clear
            </Button>
          </div>

          {/* Members List */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A]" />
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="divide-y">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-[#1E3A8A]/5 transition-colors cursor-pointer",
                      selectedMembers.includes(member.id) && "bg-[#1E3A8A]/5"
                    )}
                    onClick={() => toggleMember(member.id)}
                  >
                    <div className="flex items-center justify-center w-5">
                      {selectedMembers.includes(member.id) ? (
                        <CheckCircle className="h-4 w-4 text-[#1E3A8A]" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-300" />
                      )}
                    </div>
                    
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs">
                          {getInitials(member.full_name, member.email)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-['Space_Grotesk'] text-xs sm:text-sm truncate">
                          {member.full_name || "Unnamed"}
                        </p>
                        {member.department === department.name && (
                          <Badge variant="outline" className="text-[8px] sm:text-[10px] border-[#1E3A8A]/20 bg-[#1E3A8A]/5">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[8px] sm:text-[10px]", getRoleBadgeColor(member.role))}>
                        {member.role}
                      </Badge>
                      {member.title && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                          {member.title}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium">No members found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? "Try a different search" : "No available members to add"}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-[#1E3A8A]/5 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              <span className="font-medium text-[#1E3A8A]">{selectedMembers.length}</span> members selected
              {selectedMembers.length > 0 && (
                <>
                  {" "}({selectedMembers.filter(id => 
                    availableMembers?.find(m => m.id === id)?.department === department.name
                  ).length} current,{" "}
                  {selectedMembers.filter(id => 
                    availableMembers?.find(m => m.id === id)?.department !== department.name
                  ).length} new)
                </>
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5 text-sm h-9 sm:h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(selectedMembers)} 
            disabled={isLoading} 
            className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-sm h-9 sm:h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MOBILE BOTTOM NAVIGATION
// ============================================

const MobileBottomNav = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Building2 className="h-5 w-5" />
          <span className="text-xs">Departments</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Users className="h-5 w-5" />
          <span className="text-xs">Team</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative">
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            3
          </div>
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs">Analytics</span>
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
                  <CalendarDays className="h-4 w-4" />
                  Events
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
// MAIN DEPARTMENTS PAGE
// ============================================

export default function Departments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showManageMembersDialog, setShowManageMembersDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentWithStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Hooks
  const { data: departments, isLoading: deptsLoading, refetch: refetchDepartments } = useDepartments();
  const { data: analytics, isLoading: analyticsLoading } = useDepartmentAnalytics();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const updateMembers = useUpdateDepartmentMembers();

  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departments?.filter(dept => {
      return dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             dept.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             dept.manager_name?.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];
  }, [departments, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const totalDepts = departments?.length || 0;
    const totalMembers = departments?.reduce((sum, dept) => sum + (dept.member_count || 0), 0) || 0;
    const avgMembers = totalDepts > 0 ? Math.round(totalMembers / totalDepts) : 0;
    const deptsWithManager = departments?.filter(d => d.manager_id).length || 0;

    return {
      totalDepts,
      totalMembers,
      avgMembers,
      deptsWithManager,
      coverage: totalDepts > 0 ? Math.round((deptsWithManager / totalDepts) * 100) : 0
    };
  }, [departments]);

  const handleCreateDepartment = async (data: any) => {
    try {
      await createDepartment.mutateAsync(data);
      setShowCreateDialog(false);
    } catch (error) {
      // Error is handled in hook
    }
  };

  const handleUpdateDepartment = async (data: any) => {
    if (!selectedDepartment) return;
    try {
      await updateDepartment.mutateAsync({
        id: selectedDepartment.id,
        ...data
      });
      setShowEditDialog(false);
      setSelectedDepartment(null);
    } catch (error) {
      // Error is handled in hook
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    try {
      await deleteDepartment.mutateAsync(deptId);
      if (selectedDepartment?.id === deptId) {
        setShowDetailsDialog(false);
        setSelectedDepartment(null);
      }
    } catch (error) {
      // Error is handled in hook
    }
  };

  const handleManageMembers = async (memberIds: string[]) => {
    if (!selectedDepartment) return;
    try {
      await updateMembers.mutateAsync({
        departmentId: selectedDepartment.id,
        memberIds
      });
      setShowManageMembersDialog(false);
      refetchDepartments();
    } catch (error) {
      // Error is handled in hook
    }
  };

  const isLoading = deptsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full border-4 border-[#1E3A8A]/20 border-t-[#1E3A8A] animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-[#1E3A8A]/40" />
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#1E3A8A] font-['Space_Grotesk']">Loading departments...</p>
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
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
                Departments
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                {stats.totalDepts} departments • {stats.totalMembers} team members
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
              
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                size={isMobile ? "sm" : "default"} 
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs sm:text-sm h-8 sm:h-10"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Department</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 sm:mt-4">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 w-full h-9 sm:h-10 text-sm border-[#1E3A8A]/20 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Contentvite] connecting... client:495:9
[vite] connected. client:618:15
Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools react-dom.development.js:29895:17
🔍 useDepartmentAnalytics - Starting fetch for user: 57f5a204-1ef0-432f-a541-28c0c272fa1b use-departments.ts:214:15
📊 useDepartmentAnalytics - Fetching team member for user: 57f5a204-1ef0-432f-a541-28c0c272fa1b use-departments.ts:223:17
Cookie “__cf_bm” has been rejected for invalid domain. websocket
✅ useDepartmentAnalytics - Team member found: 
Object { organization_id: "53473465-b74b-47b4-b4dc-eddedcb62bc9", user_id: "57f5a204-1ef0-432f-a541-28c0c272fa1b" }
​
organization_id: "53473465-b74b-47b4-b4dc-eddedcb62bc9"
​
user_id: "57f5a204-1ef0-432f-a541-28c0c272fa1b"
​
<prototype>: Object { … }
use-departments.ts:250:17
📊 useDepartmentAnalytics - Calling get_department_analytics RPC with org_id: 53473465-b74b-47b4-b4dc-eddedcb62bc9 use-departments.ts:256:17
⏱️ useDepartmentAnalytics - RPC call took 478.00ms use-departments.ts:265:17
📦 useDepartmentAnalytics - Raw data from database: 
Object { hasData: true, dataLength: 1, rawData: (1) […] }
​
dataLength: 1
​
hasData: true
​
rawData: Array [ {…} ]
​
<prototype>: Object { … }
use-departments.ts:285:17
📊 useDepartmentAnalytics - Raw record 1: 
Object { department_id: "73ee2e1f-ced8-4a4d-bf67-ce72b54c7876", department_name: "Information Technology", department_color: "#D97706", total_members: 1, active_members: 1, total_events: 7, team_events: 1, personal_events: 6, total_bookings: 45, team_bookings: 0, … }
​
active_members: 1
​
completion_rate: 100
​
department_color: "#D97706"
​
department_id: "73ee2e1f-ced8-4a4d-bf67-ce72b54c7876"
​
department_name: "Information Technology"
​
personal_bookings: 45
​
personal_events: 6
​
team_bookings: 0
​
team_events: 1
​
total_bookings: 45
​
total_events: 7
​
total_members: 1
​
types: Object { total_members: "number", active_members: "number", total_events: "number", … }
​
<prototype>: Object { … }
use-departments.ts:298:19
🔄 useDepartmentAnalytics - Transforming data... use-departments.ts:324:17
✅ useDepartmentAnalytics - Transformed record 1: 
Object { department_id: "73ee2e1f-ced8-4a4d-bf67-ce72b54c7876", department_name: "Information Technology", department_color: "#D97706", total_members: 1, active_members: 1, total_events: 7, team_events: 1, personal_events: 6, total_bookings: 45, team_bookings: 0, … }
​
active_members: 1
​
completion_rate: 100
​
department_color: "#D97706"
​
department_id: "73ee2e1f-ced8-4a4d-bf67-ce72b54c7876"
​
department_name: "Information Technology"
​
personal_bookings: 45
​
personal_events: 6
​
team_bookings: 0
​
team_events: 1
​
total_bookings: 45
​
total_events: 7
​
total_members: 1
​
<prototype>: Object { … }
use-departments.ts:343:21
📊 useDepartmentAnalytics - Transformation complete: 
Object { originalCount: 1, transformedCount: 1, departments: (1) […] }
​
departments: Array [ {…} ]
​
originalCount: 1
​
transformedCount: 1
​
<prototype>: Object { … }
use-departments.ts:350:17

​

 */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatsCard
            title="Total Departments"
            value={stats.totalDepts}
            icon={Building2}
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            description={`${stats.deptsWithManager} with managers`}
            color="blue"
            progress={stats.coverage}
          />
          <StatsCard
            title="Team Members"
            value={stats.totalMembers}
            icon={Users}
            trend={{ value: 8, direction: 'up', label: 'across depts' }}
            description={`Avg ${stats.avgMembers} per dept`}
            color="green"
          />
          <StatsCard
            title="With Managers"
            value={stats.deptsWithManager}
            icon={UserCheck}
            trend={{ value: stats.coverage, direction: 'up', label: 'coverage' }}
            description={`${stats.coverage}% of departments`}
            color="orange"
          />
          <StatsCard
            title="Active Rate"
            value="94%"
            icon={TrendingUp}
            trend={{ value: 5, direction: 'up', label: 'this week' }}
            description="Average member activity"
            color="purple"
          />
        </motion.div>

        {/* Departments View */}
        {filteredDepartments.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 py-8 sm:py-12">
              <CardContent className="text-center">
                <div className="rounded-full bg-[#1E3A8A]/10 p-3 sm:p-4 w-fit mx-auto mb-3 sm:mb-4">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-[#1E3A8A]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold font-['Space_Grotesk'] text-[#1E3A8A] mb-2">No departments yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                  Create your first department to start organizing your team members.
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  size={isMobile ? "sm" : "default"} 
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-xs sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Create Your First Department
                </Button>
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
                      <TableHead className="text-xs sm:text-sm">Department</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Manager</TableHead>
                      <TableHead className="text-xs sm:text-sm text-center">Members</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Created</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDepartments.map((dept) => (
                      <TableRow 
                        key={dept.id} 
                        className="cursor-pointer hover:bg-[#1E3A8A]/5 border-[#1E3A8A]/10"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div 
                              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${dept.color}20` }}
                            >
                              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: dept.color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium font-['Space_Grotesk'] text-[#1E3A8A] text-xs sm:text-sm truncate">
                                {dept.name}
                              </p>
                              {dept.description && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[200px]">
                                  {dept.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {dept.manager_name ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                                {dept.manager_avatar ? (
                                  <AvatarImage src={dept.manager_avatar} />
                                ) : (
                                  <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-[8px] sm:text-[10px]">
                                    {getInitials(dept.manager_name, dept.manager_email)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">{dept.manager_name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{dept.manager_email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-[#1E3A8A]/5 border-[#1E3A8A]/20">
                            {dept.member_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                          {formatRelativeTime(dept.created_at)}
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
                                setSelectedDepartment(dept);
                                setShowDetailsDialog(true);
                              }} className="text-xs sm:text-sm">
                                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDepartment(dept);
                                setShowEditDialog(true);
                              }} className="text-xs sm:text-sm">
                                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDepartment(dept);
                                setShowManageMembersDialog(true);
                              }} className="text-xs sm:text-sm">
                                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                Manage Members
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 text-xs sm:text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
                                    handleDeleteDepartment(dept.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
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
            {paginatedDepartments.map((dept) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedDepartment(dept);
                  setShowDetailsDialog(true);
                }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 hover:shadow-lg transition-all hover:border-[#1E3A8A]/30 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center">
                      <div 
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${dept.color}20` }}
                      >
                        <Building2 className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: dept.color }} />
                      </div>
                      
                      <h3 className="font-bold font-['Space_Grotesk'] text-[#1E3A8A] text-sm sm:text-base truncate">
                        {dept.name}
                      </h3>
                      
                      {dept.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {dept.description}
                        </p>
                      )}

                      <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                        <Badge variant="outline" className="bg-[#1E3A8A]/5 border-[#1E3A8A]/20">
                          <Users className="h-3 w-3 mr-1" />
                          {dept.member_count || 0}
                        </Badge>
                        {dept.manager_name && (
                          <Badge variant="outline" className="bg-green-500/5 border-green-500/20">
                            <UserCheck className="h-3 w-3 mr-1 text-green-600" />
                            Has Manager
                          </Badge>
                        )}
                      </div>

                      {dept.manager_name && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E3A8A]/10">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                              {dept.manager_avatar ? (
                                <AvatarImage src={dept.manager_avatar} />
                              ) : (
                                <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-[8px] sm:text-[10px]">
                                  {getInitials(dept.manager_name, dept.manager_email)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-medium truncate">{dept.manager_name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">Manager</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
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
        {/* Analytics Section */}
        {analytics && analytics.length > 0 && (
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-[#1E3A8A] mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Department Analytics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {analytics.slice(0, 3).map((stat) => (
                <Card key={stat.department_id} className="bg-white/80 backdrop-blur-sm border-[#1E3A8A]/10 hover:shadow-md transition-all">
                  <CardContent className="p-3 sm:p-4">
                    {/* Header with Department Info */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${stat.department_color || '#1E3A8A'}20` }}
                      >
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: stat.department_color || '#1E3A8A' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium font-['Space_Grotesk'] text-sm sm:text-base truncate">
                          {stat.department_name || 'Unnamed Department'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[8px] sm:text-[10px]">
                            👥 {stat.total_members || 0} members
                          </Badge>
                          <Badge variant="outline" className="text-[8px] sm:text-[10px]">
                            📊 {stat.team_events || 0} team
                          </Badge>
                          {(stat.personal_events || 0) > 0 && (
                            <Badge variant="outline" className="text-[8px] sm:text-[10px] border-purple-200 bg-purple-50/50">
                              ✨ {stat.personal_events || 0} personal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk'] text-[#1E3A8A]">
                          {stat.completion_rate || 0}%
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground">completion</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk'] text-[#C2410C]">
                          {stat.total_bookings || 0}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground">bookings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk'] text-green-600">
                          {stat.total_events || 0}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground">events</p>
                      </div>
                    </div>

                    {/* Progress Bar for Event Completion */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[8px] sm:text-[10px]">
                        <span className="text-muted-foreground">Event completion rate</span>
                        <span className="font-medium">{stat.completion_rate || 0}%</span>
                      </div>
                      <Progress value={stat.completion_rate || 0} className="h-1" />
                    </div>

                    {/* Detailed Stats Row */}
                    <div className="mt-3 pt-2 border-t border-[#1E3A8A]/10 grid grid-cols-2 gap-2 text-[8px] sm:text-[10px]">
                      <div>
                        <p className="text-muted-foreground">Team bookings</p>
                        <p className="font-medium">{stat.team_bookings || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Personal bookings</p>
                        <p className="font-medium">{stat.personal_bookings || 0}</p>
                      </div>
                    </div>

                    {/* Active Members Indicator */}
                    <div className="mt-2 flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${stat.active_members > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                        {stat.active_members || 0} active of {stat.total_members || 0} members
                      </span>
                    </div>

                    {/* Event Breakdown */}
                    <div className="mt-2 flex items-center justify-between text-[8px] sm:text-[10px]">
                      <span className="text-muted-foreground">Team events:</span>
                      <span className="font-medium">{stat.team_events || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] sm:text-[10px]">
                      <span className="text-muted-foreground">Personal events:</span>
                      <span className="font-medium">{stat.personal_events || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.totalDepts}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Departments</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">{stats.totalMembers}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.avgMembers}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Members/Dept</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.coverage}%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Manager Coverage</p>
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
      <DepartmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreateDepartment}
        isLoading={createDepartment.isLoading}
      />

      <DepartmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        department={selectedDepartment}
        onSave={handleUpdateDepartment}
        isLoading={updateDepartment.isLoading}
      />

      <DepartmentDetailsDialog
        department={selectedDepartment}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onEdit={(dept) => {
          setSelectedDepartment(dept);
          setShowEditDialog(true);
          setShowDetailsDialog(false);
        }}
        onDelete={handleDeleteDepartment}
        onManageMembers={(dept) => {
          setSelectedDepartment(dept);
          setShowManageMembersDialog(true);
          setShowDetailsDialog(false);
        }}
      />

      <ManageMembersDialog
        department={selectedDepartment}
        open={showManageMembersDialog}
        onOpenChange={setShowManageMembersDialog}
        onSave={handleManageMembers}
        isLoading={updateMembers.isLoading}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* CSS - removed the jsx attribute */}
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