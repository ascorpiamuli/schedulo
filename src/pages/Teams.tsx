import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Eye
} from "lucide-react";

// ============================================
// UNDER DEVELOPMENT BADGE COMPONENT
// ============================================

function UnderDevelopmentBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-amber-500/10 text-amber-600 border-amber-500/20",
        "flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      Under Development
    </Badge>
  );
}

// ============================================
// TYPES & INTERFACES
// ============================================

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'member' | 'guest';
  department?: string;
  title?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinedAt: string;
  lastActive?: string;
  timezone: string;
  location?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  availability?: {
    weekly: {
      day: string;
      slots: { start: string; end: string }[];
    }[];
    overrides: {
      date: string;
      reason: string;
    }[];
  };
  metrics: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    satisfactionRate: number;
    responseTime: number;
    revenue: number;
  };
  permissions: {
    canCreateEvents: boolean;
    canManageBookings: boolean;
    canManageTeam: boolean;
    canViewAnalytics: boolean;
    canAccessSettings: boolean;
  };
  eventTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member' | 'guest';
  department?: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

export interface TeamDepartment {
  id: string;
  name: string;
  description?: string;
  manager?: string;
  memberCount: number;
  color: string;
}

export interface TeamActivity {
  id: string;
  type: 'booking' | 'invite' | 'update' | 'delete' | 'login' | 'settings';
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    firstName: "Stephen",
    lastName: "Muli",
    email: "stephen.muli@sbpgroup.com",
    phone: "+254 712 345 678",
    role: "admin",
    department: "Engineering",
    title: "Lead Developer",
    status: "active",
    joinedAt: "2024-01-15T08:00:00Z",
    lastActive: "2024-01-20T14:30:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Full-stack developer passionate about creating efficient scheduling solutions.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    socialLinks: {
      github: "https://github.com/stephenmuli",
      linkedin: "https://linkedin.com/in/stephenmuli",
      twitter: "https://twitter.com/stephenmuli"
    },
    metrics: {
      totalBookings: 156,
      upcomingBookings: 12,
      completedBookings: 142,
      cancelledBookings: 2,
      satisfactionRate: 98,
      responseTime: 2.4,
      revenue: 12500
    },
    permissions: {
      canCreateEvents: true,
      canManageBookings: true,
      canManageTeam: true,
      canViewAnalytics: true,
      canAccessSettings: true
    },
    eventTypes: ["1", "2", "3"],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z"
  },
  {
    id: "2",
    firstName: "Benedict",
    lastName: "Musyoki",
    email: "benedict.musyoki@sbpgroup.com",
    phone: "+254 723 456 789",
    role: "manager",
    department: "Product",
    title: "Product Manager",
    status: "active",
    joinedAt: "2024-01-20T09:00:00Z",
    lastActive: "2024-01-20T16:15:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Product manager focused on delivering exceptional user experiences.",
    skills: ["Product Strategy", "UX Design", "Agile", "Analytics"],
    socialLinks: {
      linkedin: "https://linkedin.com/in/benedictmusyoki",
      twitter: "https://twitter.com/benedictmusyoki"
    },
    metrics: {
      totalBookings: 89,
      upcomingBookings: 8,
      completedBookings: 81,
      cancelledBookings: 0,
      satisfactionRate: 100,
      responseTime: 1.8,
      revenue: 8900
    },
    permissions: {
      canCreateEvents: true,
      canManageBookings: true,
      canManageTeam: false,
      canViewAnalytics: true,
      canAccessSettings: false
    },
    eventTypes: ["2", "4"],
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T16:15:00Z"
  },
  {
    id: "3",
    firstName: "Pascal",
    lastName: "Ngathike",
    email: "pascal.ngathike@sbpgroup.com",
    phone: "+254 734 567 890",
    role: "manager",
    department: "Operations",
    title: "Operations Director",
    status: "active",
    joinedAt: "2024-01-10T10:00:00Z",
    lastActive: "2024-01-20T15:45:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Operations expert ensuring smooth business processes.",
    skills: ["Operations Management", "Team Leadership", "Process Optimization"],
    socialLinks: {
      linkedin: "https://linkedin.com/in/pascalngathike"
    },
    metrics: {
      totalBookings: 67,
      upcomingBookings: 5,
      completedBookings: 62,
      cancelledBookings: 0,
      satisfactionRate: 99,
      responseTime: 2.1,
      revenue: 6700
    },
    permissions: {
      canCreateEvents: true,
      canManageBookings: true,
      canManageTeam: true,
      canViewAnalytics: true,
      canAccessSettings: false
    },
    eventTypes: ["3", "5"],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-20T15:45:00Z"
  },
  {
    id: "4",
    firstName: "Sarah",
    lastName: "Wanjiku",
    email: "sarah.wanjiku@sbpgroup.com",
    phone: "+254 745 678 901",
    role: "member",
    department: "Engineering",
    title: "Frontend Developer",
    status: "active",
    joinedAt: "2024-01-18T11:00:00Z",
    lastActive: "2024-01-20T13:20:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Frontend developer crafting beautiful and responsive interfaces.",
    skills: ["React", "Vue.js", "Tailwind CSS", "Figma"],
    socialLinks: {
      github: "https://github.com/sarahwanjiku",
      linkedin: "https://linkedin.com/in/sarahwanjiku"
    },
    metrics: {
      totalBookings: 34,
      upcomingBookings: 4,
      completedBookings: 30,
      cancelledBookings: 0,
      satisfactionRate: 100,
      responseTime: 3.2,
      revenue: 3400
    },
    permissions: {
      canCreateEvents: true,
      canManageBookings: true,
      canManageTeam: false,
      canViewAnalytics: false,
      canAccessSettings: false
    },
    eventTypes: ["1", "3"],
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-20T13:20:00Z"
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Omondi",
    email: "david.omondi@sbpgroup.com",
    phone: "+254 756 789 012",
    role: "member",
    department: "Engineering",
    title: "Backend Developer",
    status: "pending",
    joinedAt: "2024-01-19T14:00:00Z",
    timezone: "Africa/Nairobi",
    location: "Kisumu, Kenya",
    bio: "Backend developer specializing in scalable APIs.",
    skills: ["Node.js", "Python", "PostgreSQL", "Redis"],
    metrics: {
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      satisfactionRate: 0,
      responseTime: 0,
      revenue: 0
    },
    permissions: {
      canCreateEvents: false,
      canManageBookings: false,
      canManageTeam: false,
      canViewAnalytics: false,
      canAccessSettings: false
    },
    createdAt: "2024-01-19T14:00:00Z",
    updatedAt: "2024-01-19T14:00:00Z"
  },
  {
    id: "6",
    firstName: "Mary",
    lastName: "Akinyi",
    email: "mary.akinyi@sbpgroup.com",
    phone: "+254 767 890 123",
    role: "member",
    department: "Customer Success",
    title: "Customer Success Manager",
    status: "active",
    joinedAt: "2024-01-16T09:30:00Z",
    lastActive: "2024-01-20T12:10:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Dedicated to ensuring customer satisfaction and success.",
    skills: ["Customer Support", "Communication", "Problem Solving"],
    socialLinks: {
      linkedin: "https://linkedin.com/in/maryakinyi"
    },
    metrics: {
      totalBookings: 123,
      upcomingBookings: 15,
      completedBookings: 118,
      cancelledBookings: 5,
      satisfactionRate: 97,
      responseTime: 1.5,
      revenue: 6150
    },
    permissions: {
      canCreateEvents: true,
      canManageBookings: true,
      canManageTeam: false,
      canViewAnalytics: true,
      canAccessSettings: false
    },
    eventTypes: ["4", "6"],
    createdAt: "2024-01-16T09:30:00Z",
    updatedAt: "2024-01-20T12:10:00Z"
  },
  {
    id: "7",
    firstName: "James",
    lastName: "Mwangi",
    email: "james.mwangi@sbpgroup.com",
    phone: "+254 778 901 234",
    role: "manager",
    department: "Sales",
    title: "Sales Director",
    status: "active",
    joinedAt: "2024-01-12T10:15:00Z",
    lastActive: "2024-01-20T11:30:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Sales leader driving business growth and partnerships.",
    skills: ["Sales Strategy", "Negotiation", "Account Management"],
    socialLinks: {
      linkedin: "https://linkedin.com/in/jamesmwangi"
    },
    metrics: {
      totalBookings: 234,
      upcomingBookings: 25,
      completedBookings: 209,
      cancelledBookings: 0,
      satisfactionRate: 100,
      responseTime: 1.2,
      revenue: 23400
    },
    permissions: {
      canCreateEvents: true,
      canManageBookings: true,
      canManageTeam: true,
      canViewAnalytics: true,
      canAccessSettings: false
    },
    eventTypes: ["2", "5", "7"],
    createdAt: "2024-01-12T10:15:00Z",
    updatedAt: "2024-01-20T11:30:00Z"
  },
  {
    id: "8",
    firstName: "Lucy",
    lastName: "Njeri",
    email: "lucy.njeri@sbpgroup.com",
    phone: "+254 789 012 345",
    role: "guest",
    department: "Marketing",
    title: "Marketing Consultant",
    status: "inactive",
    joinedAt: "2024-01-05T13:45:00Z",
    lastActive: "2024-01-15T16:20:00Z",
    timezone: "Africa/Nairobi",
    location: "Nairobi, Kenya",
    bio: "Marketing consultant specializing in digital strategy.",
    skills: ["Digital Marketing", "SEO", "Content Strategy"],
    socialLinks: {
      linkedin: "https://linkedin.com/in/lucynjeri",
      twitter: "https://twitter.com/lucynjeri"
    },
    metrics: {
      totalBookings: 45,
      upcomingBookings: 0,
      completedBookings: 45,
      cancelledBookings: 0,
      satisfactionRate: 100,
      responseTime: 4.5,
      revenue: 4500
    },
    permissions: {
      canCreateEvents: false,
      canManageBookings: false,
      canManageTeam: false,
      canViewAnalytics: false,
      canAccessSettings: false
    },
    eventTypes: [],
    createdAt: "2024-01-05T13:45:00Z",
    updatedAt: "2024-01-15T16:20:00Z"
  }
];

const MOCK_INVITES: TeamInvite[] = [
  {
    id: "inv1",
    email: "peter.kamau@example.com",
    role: "member",
    department: "Engineering",
    invitedBy: "Stephen Muli",
    invitedAt: "2024-01-19T10:30:00Z",
    expiresAt: "2024-01-26T10:30:00Z",
    status: "pending"
  },
  {
    id: "inv2",
    email: "grace.wambui@example.com",
    role: "member",
    department: "Customer Success",
    invitedBy: "Mary Akinyi",
    invitedAt: "2024-01-18T14:15:00Z",
    expiresAt: "2024-01-25T14:15:00Z",
    status: "pending"
  },
  {
    id: "inv3",
    email: "john.odhiambo@example.com",
    role: "manager",
    department: "Sales",
    invitedBy: "James Mwangi",
    invitedAt: "2024-01-17T09:45:00Z",
    expiresAt: "2024-01-24T09:45:00Z",
    status: "accepted"
  }
];

const MOCK_DEPARTMENTS: TeamDepartment[] = [
  {
    id: "dept1",
    name: "Engineering",
    description: "Software development and infrastructure",
    manager: "Stephen Muli",
    memberCount: 3,
    color: "#1E3A8A"
  },
  {
    id: "dept2",
    name: "Product",
    description: "Product management and design",
    manager: "Benedict Musyoki",
    memberCount: 1,
    color: "#C2410C"
  },
  {
    id: "dept3",
    name: "Operations",
    description: "Business operations and processes",
    manager: "Pascal Ngathike",
    memberCount: 1,
    color: "#059669"
  },
  {
    id: "dept4",
    name: "Customer Success",
    description: "Customer support and success",
    manager: "Mary Akinyi",
    memberCount: 1,
    color: "#D97706"
  },
  {
    id: "dept5",
    name: "Sales",
    description: "Sales and partnerships",
    manager: "James Mwangi",
    memberCount: 1,
    color: "#7C3AED"
  },
  {
    id: "dept6",
    name: "Marketing",
    description: "Marketing and communications",
    manager: null,
    memberCount: 0,
    color: "#EC4899"
  }
];

const MOCK_ACTIVITY: TeamActivity[] = [
  {
    id: "act1",
    type: "booking",
    userId: "1",
    userName: "Stephen Muli",
    action: "Created a new booking",
    details: "30-min consultation with Client A",
    timestamp: "2024-01-20T14:30:00Z"
  },
  {
    id: "act2",
    type: "invite",
    userId: "1",
    userName: "Stephen Muli",
    action: "Invited new team member",
    details: "peter.kamau@example.com (Engineering)",
    timestamp: "2024-01-20T13:15:00Z"
  },
  {
    id: "act3",
    type: "update",
    userId: "2",
    userName: "Benedict Musyoki",
    action: "Updated event type",
    details: "Modified 'Product Demo' duration to 45min",
    timestamp: "2024-01-20T11:45:00Z"
  },
  {
    id: "act4",
    type: "settings",
    userId: "1",
    userName: "Stephen Muli",
    action: "Changed team settings",
    details: "Updated availability hours",
    timestamp: "2024-01-20T10:20:00Z"
  },
  {
    id: "act5",
    type: "login",
    userId: "3",
    userName: "Pascal Ngathike",
    action: "Logged in",
    details: "From IP 192.168.1.100",
    timestamp: "2024-01-20T09:05:00Z"
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getRoleIcon(role: string) {
  switch(role) {
    case 'admin': return <ShieldCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />;
    case 'manager': return <Shield className="h-3.5 w-3.5 text-[#C2410C]" />;
    case 'member': return <UserCheck className="h-3.5 w-3.5 text-green-600" />;
    case 'guest': return <UserX className="h-3.5 w-3.5 text-gray-500" />;
    default: return <UserCog className="h-3.5 w-3.5" />;
  }
}

function getRoleBadgeColor(role: string) {
  switch(role) {
    case 'admin': return "bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20";
    case 'manager': return "bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/20";
    case 'member': return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'guest': return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

function getStatusBadgeColor(status: string) {
  switch(status) {
    case 'active': return "bg-green-500/10 text-green-600 border-green-500/20";
    case 'inactive': return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    case 'pending': return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case 'suspended': return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// ============================================
// INVITE DIALOG COMPONENT (DISABLED)
// ============================================

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "member" | "guest">("member");
  const [department, setDepartment] = useState("");
  const { toast } = useToast();

  const handleUnderDevelopment = () => {
    toast({
      title: "🔧 Under Development",
      description: "Team invites will be available soon!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-xl flex items-center gap-2 text-[#1E3A8A]">
            <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
              <UserPlus className="h-4 w-4 text-[#1E3A8A]" />
            </div>
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They'll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 opacity-60 pointer-events-none">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1E3A8A]">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-[#1E3A8A]">Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger className="focus:ring-[#1E3A8A]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1E3A8A]" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#C2410C]" />
                    <span>Manager</span>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>Member</span>
                  </div>
                </SelectItem>
                <SelectItem value="guest">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-gray-500" />
                    <span>Guest</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-[#1E3A8A]">Department (Optional)</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="focus:ring-[#1E3A8A]/20">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span>{dept.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-[#1E3A8A]/5 rounded-lg p-3 border border-[#1E3A8A]/10">
            <p className="text-xs text-muted-foreground">
              <strong className="text-[#1E3A8A]">Note:</strong> Invitations expire after 7 days. 
              The recipient will need to create an account if they don't have one.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
            Cancel
          </Button>
          <Button onClick={handleUnderDevelopment} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
            <Sparkles className="h-4 w-4 mr-2" />
            Send Invite (Coming Soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MEMBER DETAILS DIALOG (DISABLED)
// ============================================

function MemberDetailsDialog({ 
  member, 
  open, 
  onOpenChange 
}: { 
  member: TeamMember | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();

  if (!member) return null;

  const handleUnderDevelopment = () => {
    toast({
      title: "🔧 Under Development",
      description: "Member management features will be available soon!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden",
        isMobile ? "h-[100dvh] max-w-[100vw] rounded-none" : "max-w-4xl max-h-[90vh] rounded-2xl"
      )}>
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-6 py-4 flex items-center justify-between">
          <DialogHeader className="p-0">
            <DialogTitle className="font-['Space_Grotesk'] text-xl flex items-center gap-2 text-[#1E3A8A]">
              <div className="rounded-lg bg-[#1E3A8A]/10 p-1.5">
                <UserCog className="h-4 w-4 text-[#1E3A8A]" />
              </div>
              Team Member Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <UnderDevelopmentBadge />
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: isMobile ? "calc(100dvh - 80px)" : "calc(90vh - 80px)" }}>
          {/* Member Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
            <Avatar className="h-20 w-20 border-4 border-[#1E3A8A]/20">
              <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xl">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-[#1E3A8A]">
                    {member.firstName} {member.lastName}
                  </h2>
                  <p className="text-muted-foreground">{member.title} • {member.department}</p>
                </div>
                <Badge className={cn("capitalize", getRoleBadgeColor(member.role))}>
                  {getRoleIcon(member.role)}
                  <span className="ml-1">{member.role}</span>
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#1E3A8A]" />
                  <span className="text-muted-foreground">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-[#C2410C]" />
                    <span className="text-muted-foreground">{member.phone}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">{member.location}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={handleUnderDevelopment} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Profile
                </Button>
                <Button size="sm" variant="outline" onClick={handleUnderDevelopment} className="border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Reset Password
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs - Read Only */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-[#1E3A8A]/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Metrics</TabsTrigger>
              <TabsTrigger value="availability" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Availability</TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Bio */}
              {member.bio && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#1E3A8A]">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#1E3A8A]">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#1E3A8A]">Social Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 opacity-60">
                      {member.socialLinks.github && (
                        <a onClick={handleUnderDevelopment} className="text-muted-foreground cursor-not-allowed">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {member.socialLinks.linkedin && (
                        <a onClick={handleUnderDevelopment} className="text-muted-foreground cursor-not-allowed">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.socialLinks.twitter && (
                        <a onClick={handleUnderDevelopment} className="text-muted-foreground cursor-not-allowed">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.socialLinks.instagram && (
                        <a onClick={handleUnderDevelopment} className="text-muted-foreground cursor-not-allowed">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#1E3A8A]">Team Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium">{formatDate(member.joinedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Active</p>
                      <p className="text-sm font-medium">{member.lastActive ? formatDateTime(member.lastActive) : 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timezone</p>
                      <p className="text-sm font-medium">{member.timezone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={cn("text-xs mt-1", getStatusBadgeColor(member.status))}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6 mt-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#1E3A8A]">{member.metrics.totalBookings}</div>
                      <p className="text-xs text-muted-foreground">Total Bookings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#1E3A8A]">{member.metrics.upcomingBookings}</div>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#1E3A8A]">{member.metrics.satisfactionRate}%</div>
                      <p className="text-xs text-muted-foreground">Satisfaction</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#1E3A8A]">${member.metrics.revenue}</div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#1E3A8A]">Booking Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium text-[#1E3A8A]">{member.metrics.completedBookings}</span>
                    </div>
                    <Progress value={(member.metrics.completedBookings / member.metrics.totalBookings) * 100} className="h-2 bg-[#1E3A8A]/10" indicatorClassName="bg-[#1E3A8A]" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Cancelled</span>
                      <span className="font-medium text-[#C2410C]">{member.metrics.cancelledBookings}</span>
                    </div>
                    <Progress value={(member.metrics.cancelledBookings / member.metrics.totalBookings) * 100} className="h-2 bg-[#C2410C]/10" indicatorClassName="bg-[#C2410C]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Response Time</p>
                      <p className="text-lg font-semibold text-[#1E3A8A]">{member.metrics.responseTime}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
                      <p className="text-lg font-semibold text-[#1E3A8A]">{member.metrics.satisfactionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Types */}
              {member.eventTypes && member.eventTypes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-[#1E3A8A]">Event Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {member.eventTypes.map((eventId) => (
                        <div key={eventId} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#1E3A8A]" />
                            <span className="text-sm">Event Type {eventId}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 cursor-not-allowed opacity-50">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="availability" className="space-y-6 mt-6">
              {/* Weekly Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#1E3A8A]">Weekly Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {member.availability?.weekly.map((day) => (
                      <div key={day.day} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-24">{day.day}</span>
                        {day.slots.length > 0 ? (
                          <div className="flex-1 flex gap-2">
                            {day.slots.map((slot, i) => (
                              <Badge key={i} variant="outline" className="bg-[#1E3A8A]/5 border-[#1E3A8A]/20">
                                {slot.start} - {slot.end}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Overrides */}
              {member.availability?.overrides && member.availability.overrides.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-[#1E3A8A]">Date Overrides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {member.availability.overrides.map((override, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CalendarOff className="h-4 w-4 text-[#C2410C]" />
                            <span className="text-sm">{formatDate(override.date)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{override.reason}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#1E3A8A]">Access Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="text-sm">Create Events</span>
                      </div>
                      <Badge className={member.permissions.canCreateEvents ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                        {member.permissions.canCreateEvents ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="text-sm">Manage Bookings</span>
                      </div>
                      <Badge className={member.permissions.canManageBookings ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                        {member.permissions.canManageBookings ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="text-sm">Manage Team</span>
                      </div>
                      <Badge className={member.permissions.canManageTeam ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                        {member.permissions.canManageTeam ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="text-sm">View Analytics</span>
                      </div>
                      <Badge className={member.permissions.canViewAnalytics ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                        {member.permissions.canViewAnalytics ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="text-sm">Access Settings</span>
                      </div>
                      <Badge className={member.permissions.canAccessSettings ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                        {member.permissions.canAccessSettings ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#1E3A8A]">Role Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-[#1E3A8A]/5 rounded-lg">
                      {getRoleIcon(member.role)}
                      <div>
                        <p className="text-sm font-medium capitalize text-[#1E3A8A]">{member.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role === 'admin' && 'Full access to all features and settings'}
                          {member.role === 'manager' && 'Can manage team members and view analytics'}
                          {member.role === 'member' && 'Can create events and manage own bookings'}
                          {member.role === 'guest' && 'Limited access, cannot create events'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Coming Soon Overlay */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
            <Sparkles className="h-5 w-5 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-amber-600">Team Management Features Coming Soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              Full team management functionality is under development.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// TEAM TABLE COMPONENT (DISABLED)
// ============================================

function TeamTable({ 
  members, 
  onViewDetails, 
  onEdit, 
  onToggleStatus,
  onDelete 
}: { 
  members: TeamMember[]; 
  onViewDetails: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onToggleStatus: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}) {
  const { toast } = useToast();

  const handleUnderDevelopment = (action: string) => {
    toast({
      title: "🔧 Under Development",
      description: `${action} will be available soon!`,
    });
  };

  const copyEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    toast({ title: "✅ Copied!", description: "Email copied to clipboard" });
  };

  return (
    <div className="rounded-md border overflow-hidden w-full">
      <Table>
        <TableHeader className="bg-[#1E3A8A]/5">
          <TableRow>
            <TableHead className="w-[200px] text-[#1E3A8A]">Member</TableHead>
            <TableHead className="w-[150px] text-[#1E3A8A]">Role</TableHead>
            <TableHead className="w-[150px] text-[#1E3A8A]">Department</TableHead>
            <TableHead className="w-[100px] text-[#1E3A8A]">Status</TableHead>
            <TableHead className="w-[120px] text-[#1E3A8A]">Joined</TableHead>
            <TableHead className="w-[80px] text-[#1E3A8A]">Bookings</TableHead>
            <TableHead className="w-[80px] text-[#1E3A8A]">Revenue</TableHead>
            <TableHead className="w-[80px] text-right text-[#1E3A8A]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow 
              key={member.id}
              className="cursor-pointer hover:bg-[#1E3A8A]/5 transition-colors"
              onClick={() => onViewDetails(member)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#1E3A8A]">{member.firstName} {member.lastName}</p>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{member.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => copyEmail(e, member.email)}
                      >
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn("capitalize", getRoleBadgeColor(member.role))}>
                  {getRoleIcon(member.role)}
                  <span className="ml-1">{member.role}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{member.department || '—'}</span>
              </TableCell>
              <TableCell>
                <Badge className={cn("text-xs", getStatusBadgeColor(member.status))}>
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{formatDate(member.joinedAt)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{member.metrics.totalBookings}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">${member.metrics.revenue}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnderDevelopment("Edit member");
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit member (Coming Soon)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnderDevelopment("Toggle status");
                          }}
                        >
                          {member.status === 'active' ? (
                            <UserX className="h-3.5 w-3.5 text-[#C2410C]" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.status === 'active' ? 'Deactivate' : 'Activate'} (Coming Soon)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(member)}>
                        <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUnderDevelopment("Edit")}>
                        <Edit className="h-3.5 w-3.5 mr-2" /> Edit (Soon)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleUnderDevelopment("Delete")}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete (Soon)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// TEAM CARD FOR MOBILE VIEW (DISABLED)
// ============================================

function TeamCard({ member, onViewDetails }: { member: TeamMember; onViewDetails: (member: TeamMember) => void }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#1E3A8A]/20"
        onClick={() => onViewDetails(member)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-[#1E3A8A]/20">
              <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A]">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#1E3A8A] truncate">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <Badge className={cn("text-[10px]", getRoleBadgeColor(member.role))}>
                  {member.role}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={cn("text-[10px]", getStatusBadgeColor(member.status))}>
                  {member.status}
                </Badge>
                {member.department && (
                  <Badge variant="outline" className="text-[10px] border-[#1E3A8A]/20">
                    {member.department}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3 text-[#1E3A8A]" />
                  <span>{member.metrics.totalBookings} bookings</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-[#C2410C]" />
                  <span>${member.metrics.revenue}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
  const { toast } = useToast();

  const handlePageChange = (page: number) => {
    onPageChange(page);
    toast({
      title: "🔧 Under Development",
      description: "Pagination will work with real data soon!",
    });
  };

  const handlePageSizeChange = (size: number) => {
    onPageSizeChange(size);
    toast({
      title: "🔧 Under Development",
      description: "Page size selection will work with real data soon!",
    });
  };

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
        <Select value={pageSize.toString()} onValueChange={(v) => handlePageSizeChange(Number(v))}>
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
        <span>of {totalItems} members</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => typeof page === 'number' && handlePageChange(page)}
            disabled={page === '...'}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN TEAM MANAGEMENT PAGE
// ============================================

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState("members");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  // Filter members
  const filteredMembers = useMemo(() => {
    return MOCK_TEAM_MEMBERS.filter((member) => {
      // Search filter
      const searchMatch = search === "" || 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase()) ||
        member.department?.toLowerCase().includes(search.toLowerCase());

      // Role filter
      const roleMatch = roleFilter === "all" || member.role === roleFilter;

      // Status filter
      const statusMatch = statusFilter === "all" || member.status === statusFilter;

      // Department filter
      const departmentMatch = departmentFilter === "all" || member.department === departmentFilter;

      return searchMatch && roleMatch && statusMatch && departmentMatch;
    });
  }, [search, roleFilter, statusFilter, departmentFilter, refreshKey]);

  // Pagination
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, departmentFilter]);

  const handleViewDetails = (member: TeamMember) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  const handleUnderDevelopment = (feature: string) => {
    toast({
      title: "🔧 Under Development",
      description: `${feature} will be available soon!`,
    });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "🔄 Demo Refresh",
      description: "Team data has been refreshed (demo mode)",
    });
  };

  return (
    <div className="space-y-6 pb-8 w-full px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
              Team Management
            </h1>
            <UnderDevelopmentBadge />
          </div>
          <p className="text-muted-foreground mt-1">
            Preview of team management features (under development)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 text-[#1E3A8A]" />
            Refresh (Demo)
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
            onClick={() => setInviteDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[600px] bg-[#1E3A8A]/10">
          <TabsTrigger value="members" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Members</TabsTrigger>
          <TabsTrigger value="invites" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Invites</TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Departments</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">Activity</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          {/* Filters and controls */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-2 border-[#1E3A8A]/20", showFilters && "bg-[#1E3A8A]/5")}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(roleFilter !== "all" || statusFilter !== "all" || departmentFilter !== "all") && (
                    <Badge className="ml-1 h-5 w-5 p-0 bg-[#1E3A8A] text-white rounded-full">
                      {(roleFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (departmentFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>

                <div className="flex items-center gap-1 border rounded-lg p-1 ml-auto sm:ml-0">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-7 w-7", viewMode === "table" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                    onClick={() => setViewMode("table")}
                    disabled={isMobile}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className={cn("h-7 w-7", viewMode === "grid" && "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90")}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20"
                />
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="border-[#1E3A8A]/20">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-[#1E3A8A]">Role</Label>
                          <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="h-9 text-sm border-[#1E3A8A]/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-[#1E3A8A]">Status</Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 text-sm border-[#1E3A8A]/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-[#1E3A8A]">Department</Label>
                          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="h-9 text-sm border-[#1E3A8A]/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              {MOCK_DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                                    <span>{dept.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            setRoleFilter("all");
                            setStatusFilter("all");
                            setDepartmentFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Members count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-[#1E3A8A]">{paginatedMembers.length}</span> of{' '}
              <span className="font-medium text-[#1E3A8A]">{filteredMembers.length}</span> members
              <span className="ml-2 text-xs text-amber-600">(Demo Data)</span>
            </p>
          </div>

          {/* Members display */}
          {paginatedMembers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
                  <div className="relative bg-gradient-to-br from-[#1E3A8A]/10 to-[#C2410C]/5 rounded-full p-4">
                    <Users className="h-12 w-12 text-[#1E3A8A]/60" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1E3A8A]">No members found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Try adjusting your filters or invite new team members.
                </p>
                <Button onClick={() => setInviteDialogOpen(true)} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === "table" && !isMobile ? (
                <TeamTable 
                  members={paginatedMembers}
                  onViewDetails={handleViewDetails}
                  onEdit={() => {}}
                  onToggleStatus={() => {}}
                  onDelete={() => {}}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedMembers.map((member) => (
                    <TeamCard 
                      key={member.id}
                      member={member}
                      onViewDetails={handleViewDetails}
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
                  totalItems={filteredMembers.length}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1E3A8A]">Pending Invitations</CardTitle>
              <UnderDevelopmentBadge />
            </CardHeader>
            <CardContent>
              {MOCK_INVITES.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {MOCK_INVITES.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#1E3A8A]">{invite.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn("text-[10px]", getRoleBadgeColor(invite.role))}>
                            {invite.role}
                          </Badge>
                          {invite.department && (
                            <Badge variant="outline" className="text-[10px] border-[#1E3A8A]/20">
                              {invite.department}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Invited by {invite.invitedBy}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires {formatDate(invite.expiresAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-[#1E3A8A]/20"
                          onClick={() => handleUnderDevelopment("Resend invite")}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleUnderDevelopment("Cancel invite")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_DEPARTMENTS.map((dept) => (
                  <Card key={dept.id} className="border-t-4" style={{ borderTopColor: dept.color }}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" style={{ color: dept.color }} />
                          <h3 className="font-semibold text-[#1E3A8A]">{dept.name}</h3>
                        </div>
                        <Badge style={{ backgroundColor: `${dept.color}20`, color: dept.color, borderColor: `${dept.color}30` }}>
                          {dept.memberCount} members
                        </Badge>
                      </div>
                      {dept.description && (
                        <p className="text-xs text-muted-foreground mb-3">{dept.description}</p>
                      )}
                      {dept.manager && (
                        <div className="flex items-center gap-2 text-xs">
                          <UserCheck className="h-3 w-3 text-[#1E3A8A]" />
                          <span className="text-muted-foreground">Manager:</span>
                          <span className="font-medium text-[#1E3A8A]">{dept.manager}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="p-2 rounded-full bg-[#1E3A8A]/10">
                      {activity.type === 'booking' && <Calendar className="h-4 w-4 text-[#1E3A8A]" />}
                      {activity.type === 'invite' && <UserPlus className="h-4 w-4 text-[#1E3A8A]" />}
                      {activity.type === 'update' && <Edit className="h-4 w-4 text-[#C2410C]" />}
                      {activity.type === 'delete' && <Trash2 className="h-4 w-4 text-destructive" />}
                      {activity.type === 'login' && <UserCheck className="h-4 w-4 text-green-600" />}
                      {activity.type === 'settings' && <Settings2 className="h-4 w-4 text-[#1E3A8A]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#1E3A8A]">{activity.userName}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{activity.action}</p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Mode Notice */}
      <Card className="border-2 border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-600">Demo Mode - Under Development</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Team management features are currently in development. The data shown is for preview purposes only. 
                Full functionality including invites, member management, and permissions will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

      {/* Member Details Dialog */}
      <MemberDetailsDialog 
        member={selectedMember}
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
      />

      {/* Pasbest Ventures Attribution */}
      <div className="mt-8 pt-4 border-t text-center">
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
    </div>
  );
}