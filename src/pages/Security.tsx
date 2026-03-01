"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  User,
  Users,
  Globe,
  Server,
  Database,
  Cloud,
  FileText,
  LogOut,
  Terminal,
  Code,
  QrCode,
  Copy,
  Trash2,
  Edit,
  MoreHorizontal,
  ArrowRight,
  Check,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  ShieldX,
  KeyRound,
  KeySquare,
  KeyIcon,
  FingerprintIcon,
  ScanFace,
  ScanLine,
  ScanEye,
  ScanSearch,
  Scan,
  QrCode as QrCodeIcon,
  Smartphone as SmartphoneIcon,
  Mail as MailIcon,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneOff,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Network,
  Radio,
  Satellite,
  Radar,
  RadioTower,
  Antenna,
  Waves,
  Zap,
  ZapOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryWarning,
  Power,
  PowerOff,
  PowerCircle,
  CirclePower,
  CircleSlash,
  CircleOff,
  CircleDot,
  CircleEllipsis,
  CircleCheck,
  CircleX,
  CircleAlert,
  CircleHelp,
  CircleDollarSign,
  CircleEuro,
  CirclePound,
  CircleYen,
  CircleFadingPlus,
  CircleMinus,
  CircleDivide,
  CircleEqual,
  CircleSlash2,
  CircleUser,
  CircleUserRound,
  CircleUsers,
  CircleGauge,
  CircleParking,
  CircleParkingOff,
  CircleParkingCircle,
  CircleParkingSquare,
  CircleParkingSquareOff
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress as ProgressCustom } from "@/components/ui/progress";

// Types for security data
interface SecurityEvent {
  id: string;
  type: "login" | "logout" | "password_change" | "settings_change" | "permission_change" | "failed_login" | "api_key_created" | "api_key_revoked";
  description: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  browser: string;
  status: "success" | "warning" | "error";
  user?: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
  status: "active" | "expired" | "revoked";
}

interface TwoFactorMethod {
  id: string;
  type: "app" | "sms" | "email" | "hardware";
  name: string;
  enabled: boolean;
  default: boolean;
  lastUsed?: string;
}

interface SecurityScore {
  overall: number;
  password: number;
  twoFactor: number;
  sessions: number;
  apiKeys: number;
  permissions: number;
}

export default function Security() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Mock security data
  const securityScore: SecurityScore = {
    overall: 85,
    password: 90,
    twoFactor: 0,
    sessions: 100,
    apiKeys: 80,
    permissions: 95
  };

  const recentEvents: SecurityEvent[] = [
    {
      id: "evt_1",
      type: "login",
      description: "Successful login",
      timestamp: "2024-02-15T09:30:00Z",
      ip: "192.168.1.100",
      location: "New York, USA",
      device: "MacBook Pro",
      browser: "Chrome 121",
      status: "success",
      user: "john@example.com"
    },
    {
      id: "evt_2",
      type: "password_change",
      description: "Password changed",
      timestamp: "2024-02-14T14:20:00Z",
      ip: "192.168.1.100",
      location: "New York, USA",
      device: "MacBook Pro",
      browser: "Chrome 121",
      status: "success"
    },
    {
      id: "evt_3",
      type: "failed_login",
      description: "Failed login attempt",
      timestamp: "2024-02-13T22:15:00Z",
      ip: "203.0.113.45",
      location: "Unknown",
      device: "Unknown",
      browser: "Unknown",
      status: "error"
    },
    {
      id: "evt_4",
      type: "api_key_created",
      description: "New API key created",
      timestamp: "2024-02-12T11:00:00Z",
      ip: "192.168.1.100",
      location: "New York, USA",
      device: "MacBook Pro",
      browser: "Chrome 121",
      status: "success"
    },
    {
      id: "evt_5",
      type: "settings_change",
      description: "Security settings updated",
      timestamp: "2024-02-11T16:45:00Z",
      ip: "192.168.1.100",
      location: "New York, USA",
      device: "MacBook Pro",
      browser: "Chrome 121",
      status: "success"
    }
  ];

  const activeSessions: ActiveSession[] = [
    {
      id: "sess_1",
      device: "MacBook Pro",
      browser: "Chrome 121",
      location: "New York, USA",
      ip: "192.168.1.100",
      lastActive: "2024-02-15T09:35:00Z",
      current: true
    },
    {
      id: "sess_2",
      device: "iPhone 15",
      browser: "Safari",
      location: "New York, USA",
      ip: "192.168.1.101",
      lastActive: "2024-02-15T08:20:00Z",
      current: false
    },
    {
      id: "sess_3",
      device: "iPad Pro",
      browser: "Safari",
      location: "New York, USA",
      ip: "192.168.1.102",
      lastActive: "2024-02-14T22:10:00Z",
      current: false
    }
  ];

  const apiKeys: ApiKey[] = [
    {
      id: "key_1",
      name: "Production API Key",
      key: "sk_live_••••••••••••••••",
      createdAt: "2024-01-15T10:00:00Z",
      lastUsed: "2024-02-15T08:30:00Z",
      expiresAt: "2025-01-15T10:00:00Z",
      permissions: ["read:bookings", "write:bookings", "read:events"],
      status: "active"
    },
    {
      id: "key_2",
      name: "Development API Key",
      key: "sk_test_••••••••••••••••",
      createdAt: "2024-02-01T14:20:00Z",
      lastUsed: "2024-02-14T16:45:00Z",
      permissions: ["read:bookings", "read:events"],
      status: "active"
    },
    {
      id: "key_3",
      name: "Analytics Integration",
      key: "sk_live_••••••••••••••••",
      createdAt: "2023-11-20T09:15:00Z",
      lastUsed: "2024-02-10T11:30:00Z",
      expiresAt: "2024-02-20T09:15:00Z",
      permissions: ["read:analytics"],
      status: "expired"
    }
  ];

  const twoFactorMethods: TwoFactorMethod[] = [
    {
      id: "2fa_1",
      type: "app",
      name: "Authenticator App",
      enabled: false,
      default: false
    },
    {
      id: "2fa_2",
      type: "sms",
      name: "SMS (•••••••1234)",
      enabled: false,
      default: false
    },
    {
      id: "2fa_3",
      type: "email",
      name: "Email (j•••@example.com)",
      enabled: false,
      default: false
    }
  ];

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "login":
        return <LogOut className="h-4 w-4 text-green-500" />;
      case "logout":
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case "password_change":
        return <Key className="h-4 w-4 text-blue-500" />;
      case "settings_change":
        return <Settings className="h-4 w-4 text-purple-500" />;
      case "permission_change":
        return <Shield className="h-4 w-4 text-orange-500" />;
      case "failed_login":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "api_key_created":
        return <KeyRound className="h-4 w-4 text-indigo-500" />;
      case "api_key_revoked":
        return <KeySquare className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Success</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Failed</Badge>;
      default:
        return null;
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Security</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              Security Center
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your account security, authentication methods, and access controls
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Security Score Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <ShieldCheck className="h-6 w-6" />
                <h2 className="text-2xl font-semibold">Security Score</h2>
              </div>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-5xl font-bold">{securityScore.overall}</span>
                <span className="text-xl text-blue-200">/100</span>
              </div>
              <p className="text-blue-100 max-w-md">
                Your account security is good. Enable 2FA to improve your score.
              </p>
            </div>
            <div className="w-full md:w-64 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Password Strength</span>
                  <span>{securityScore.password}%</span>
                </div>
                <Progress value={securityScore.password} className="h-2 bg-blue-300" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Two-Factor Auth</span>
                  <span>{securityScore.twoFactor}%</span>
                </div>
                <Progress value={securityScore.twoFactor} className="h-2 bg-blue-300" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Active Sessions</span>
                  <span>{securityScore.sessions}%</span>
                </div>
                <Progress value={securityScore.sessions} className="h-2 bg-blue-300" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>API Keys</span>
                  <span>{securityScore.apiKeys}%</span>
                </div>
                <Progress value={securityScore.apiKeys} className="h-2 bg-blue-300" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Key className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your password</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Smartphone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enable 2FA</h3>
                    <p className="text-sm text-muted-foreground">Add two-factor authentication</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Security Checkup</h3>
                    <p className="text-sm text-muted-foreground">Review security settings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two-Factor Authentication Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-purple-600" />
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </div>
                <Badge variant="outline" className={twoFactorEnabled ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                  {twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {twoFactorMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {method.type === "app" && <Smartphone className="h-5 w-5 text-blue-500" />}
                      {method.type === "sms" && <MessageSquare className="h-5 w-5 text-green-500" />}
                      {method.type === "email" && <Mail className="h-5 w-5 text-orange-500" />}
                      {method.type === "hardware" && <Key className="h-5 w-5 text-purple-500" />}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.lastUsed && (
                          <p className="text-xs text-muted-foreground">
                            Last used: {new Date(method.lastUsed).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.default && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Default</Badge>
                      )}
                      <Switch 
                        checked={method.enabled}
                        onCheckedChange={() => {}}
                        disabled
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" disabled>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Two-Factor Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <CardTitle>Recent Security Events</CardTitle>
                </div>
                <Button variant="ghost" size="sm" disabled>
                  View All
                </Button>
              </div>
              <CardDescription>
                Latest security-related activity on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{event.description}</p>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.location} · {event.device} · {event.browser}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          {/* Password Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                <CardTitle>Password</CardTitle>
              </div>
              <CardDescription>
                Manage your password and password preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Password strength</span>
                  <span className="text-green-600">Strong</span>
                </div>
                <Progress value={90} className="h-2" />
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Contains uppercase & lowercase
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Contains numbers
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Contains special characters
                  </li>
                </ul>
              </div>

              <Button className="w-full" disabled>
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-purple-600" />
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </div>
                <Switch 
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                  disabled
                />
              </div>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="font-medium">Two-factor authentication is enabled</span>
                    </div>
                  </div>
                  
                  {twoFactorMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {method.type === "app" && <Smartphone className="h-5 w-5 text-blue-500" />}
                        {method.type === "sms" && <MessageSquare className="h-5 w-5 text-green-500" />}
                        {method.type === "email" && <Mail className="h-5 w-5 text-orange-500" />}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          {method.lastUsed && (
                            <p className="text-xs text-muted-foreground">
                              Last used: {new Date(method.lastUsed).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.default && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Default</Badge>
                        )}
                        <Button variant="ghost" size="sm" disabled>Configure</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="p-4 bg-purple-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Protect your account with 2FA</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Two-factor authentication adds an extra layer of security by requiring 
                    a verification code in addition to your password.
                  </p>
                  <Button disabled>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active sessions across all devices
                  </CardDescription>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-full">
                        {session.device.includes("iPhone") ? (
                          <Smartphone className="h-5 w-5" />
                        ) : session.device.includes("iPad") ? (
                          <Tablet className="h-5 w-5" />
                        ) : (
                          <Laptop className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} · {session.location} · {session.ip}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: {new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-red-600" disabled>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for programmatic access
                  </CardDescription>
                </div>
                <Button disabled>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{key.name}</h3>
                      </div>
                      <Badge className={
                        key.status === "active" ? "bg-green-100 text-green-700" :
                        key.status === "expired" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {key.status}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Key:</span>
                        <code className="bg-muted px-2 py-1 rounded flex-1 font-mono">
                          {showApiKey[key.id] ? key.key : "••••••••••••••••"}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleApiKeyVisibility(key.id)}
                          disabled
                        >
                          {showApiKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" disabled>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Created:</span>
                        <span>{new Date(key.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {key.lastUsed && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-24">Last used:</span>
                          <span>{new Date(key.lastUsed).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {key.expiresAt && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-24">Expires:</span>
                          <span className={new Date(key.expiresAt) < new Date() ? "text-red-600" : ""}>
                            {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Permissions:</span>
                        <div className="flex gap-1 flex-wrap">
                          {key.permissions.map((perm, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {key.status === "active" && (
                      <div className="flex gap-2 mt-4 pt-2 border-t">
                        <Button variant="outline" size="sm" disabled>
                          Edit Permissions
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Rotate
                        </Button>
                        <Button variant="destructive" size="sm" disabled>
                          <Trash2 className="h-3 w-3 mr-2" />
                          Revoke
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit-log" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>
                    Complete history of security-related events
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <span>{event.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>{event.device}</TableCell>
                      <TableCell>{event.ip}</TableCell>
                      <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-muted-foreground">
                  Showing 5 of 50 events
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Recommendations */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            <CardTitle>Security Recommendations</CardTitle>
          </div>
          <CardDescription className="text-yellow-700">
            Improve your account security with these suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Fingerprint className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Enable Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700" disabled>
                Enable Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Key className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Review API Key Permissions</p>
                  <p className="text-sm text-muted-foreground">
                    Some API keys have broad permissions
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" disabled>
                Review
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Active Sessions Review</p>
                  <p className="text-sm text-muted-foreground">
                    You have 3 active sessions across devices
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" disabled>
                View Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          <Lock className="h-3 w-3 inline mr-1" />
          All security features are encrypted and follow industry best practices · 
          <Button variant="link" className="text-xs h-auto p-0 mx-1" disabled>
            Security Documentation
          </Button>
          ·
          <Button variant="link" className="text-xs h-auto p-0 mx-1" disabled>
            Privacy Policy
          </Button>
        </p>
      </div>
    </div>
  );
}

// Additional icons needed
const Laptop = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </svg>
);

const Tablet = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <line x1="12" x2="12.01" y1="18" y2="18" />
  </svg>
);