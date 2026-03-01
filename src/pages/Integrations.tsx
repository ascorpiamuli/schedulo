"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Video,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Zap,
  Shield,
  Users,
  Clock,
  Download,
  Upload,
  Link2,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Bell,
  Headphones,
  BookOpen,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Check,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  QrCode,
  Webhook,
  Database,
  Cloud,
  Server,
  Code,
  Terminal,
  Box,
  Layers,
  Grid,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  HelpCircle,
  FileText,
  Clock3,
  CalendarDays,
  Users2,
  Building2,
  Briefcase,
  Heart,
  ThumbsUp,
  Star,
  Award,
  Gift,
  Percent,
  Wallet,
  Landmark,
  Bitcoin,
  Apple,
  Chrome,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedinIcon,
  Youtube as YoutubeIcon,
  Twitter as TwitterIcon,
  Github as GithubIcon,
  Slack,
  Zoom,
  MessageCircle,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Video as VideoIcon,
  Calendar as CalendarIcon,
  Map,
  Compass,
  Navigation,
  Wind,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Umbrella,
  Thermometer,
  Droplet,
  Waves,
  Mountain,
  TreePine,
  Flower,
  Leaf,
  Apple as AppleIcon,
  Coffee,
  Pizza,
  Utensils,
  Wine,
  Beer,
  Cocktail,
  Cake,
  Candy,
  Cookie,
  IceCream
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

// Types for integrations
interface Integration {
  id: string;
  name: string;
  description: string;
  category: "calendar" | "video" | "payment" | "crm" | "email" | "analytics" | "storage" | "communication" | "social" | "automation";
  icon: React.ElementType;
  color: string;
  bgColor: string;
  status: "connected" | "available" | "coming-soon" | "popular";
  connected?: boolean;
  popular?: boolean;
  featured?: boolean;
  setupSteps?: string[];
  permissions?: string[];
}

interface ConnectedIntegration extends Integration {
  connectedAt: string;
  lastSync?: string;
  settings?: Record<string, any>;
}

export default function Integrations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data for connected integrations
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your availability and events with Google Calendar",
      category: "calendar",
      icon: Calendar,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "connected",
      connected: true,
      popular: true,
      connectedAt: "2024-01-15T10:30:00Z",
      lastSync: "2024-02-15T14:23:00Z",
      featured: true,
      permissions: ["Read/write calendar", "View free/busy"],
      setupSteps: ["Authorize access", "Select calendars to sync", "Configure sync direction"]
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Generate Zoom meeting links automatically for your events",
      category: "video",
      icon: Video,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "connected",
      connected: true,
      popular: true,
      connectedAt: "2024-01-20T09:15:00Z",
      lastSync: "2024-02-15T10:00:00Z",
      permissions: ["Create meetings", "View meeting details"],
      setupSteps: ["Connect Zoom account", "Configure default settings", "Set meeting options"]
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept payments for paid events and subscriptions",
      category: "payment",
      icon: CreditCard,
      color: "purple",
      bgColor: "bg-purple-100",
      status: "connected",
      connected: true,
      connectedAt: "2024-02-01T14:20:00Z",
      lastSync: "2024-02-15T09:30:00Z",
      permissions: ["Process payments", "View transactions", "Manage refunds"],
      setupSteps: ["Connect Stripe account", "Set up webhook", "Configure payment methods"]
    }
  ]);

  // All available integrations
  const allIntegrations: Integration[] = [
    // Calendar Integrations
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your availability and events with Google Calendar",
      category: "calendar",
      icon: Calendar,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "popular",
      popular: true,
      featured: true
    },
    {
      id: "outlook-calendar",
      name: "Outlook Calendar",
      description: "Connect with Microsoft Outlook calendar",
      category: "calendar",
      icon: Calendar,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "apple-calendar",
      name: "Apple Calendar",
      description: "Sync with iCloud calendar",
      category: "calendar",
      icon: Calendar,
      color: "gray",
      bgColor: "bg-gray-100",
      status: "coming-soon"
    },
    {
      id: "caldav",
      name: "CalDAV",
      description: "Connect any CalDAV-compatible calendar",
      category: "calendar",
      icon: Calendar,
      color: "orange",
      bgColor: "bg-orange-100",
      status: "coming-soon"
    },

    // Video Conferencing
    {
      id: "zoom",
      name: "Zoom",
      description: "Generate Zoom meeting links automatically",
      category: "video",
      icon: Video,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "popular",
      popular: true,
      featured: true
    },
    {
      id: "google-meet",
      name: "Google Meet",
      description: "Create Google Meet links for your events",
      category: "video",
      icon: Video,
      color: "green",
      bgColor: "bg-green-100",
      status: "available"
    },
    {
      id: "microsoft-teams",
      name: "Microsoft Teams",
      description: "Generate Teams meeting links",
      category: "video",
      icon: Video,
      color: "purple",
      bgColor: "bg-purple-100",
      status: "available"
    },
    {
      id: "webex",
      name: "Webex",
      description: "Connect with Cisco Webex",
      category: "video",
      icon: Video,
      color: "red",
      bgColor: "bg-red-100",
      status: "coming-soon"
    },
    {
      id: "whereby",
      name: "Whereby",
      description: "Embed Whereby rooms in your events",
      category: "video",
      icon: Video,
      color: "teal",
      bgColor: "bg-teal-100",
      status: "coming-soon"
    },

    // Payment Gateways
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept payments and manage subscriptions",
      category: "payment",
      icon: CreditCard,
      color: "purple",
      bgColor: "bg-purple-100",
      status: "popular",
      popular: true,
      featured: true
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Accept PayPal payments",
      category: "payment",
      icon: DollarSign,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "square",
      name: "Square",
      description: "Process payments with Square",
      category: "payment",
      icon: CreditCard,
      color: "green",
      bgColor: "bg-green-100",
      status: "available"
    },
    {
      id: "razorpay",
      name: "Razorpay",
      description: "Indian payment gateway",
      category: "payment",
      icon: CreditCard,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "coming-soon"
    },
    {
      id: "paddle",
      name: "Paddle",
      description: "Global payment processing",
      category: "payment",
      icon: CreditCard,
      color: "red",
      bgColor: "bg-red-100",
      status: "coming-soon"
    },

    // CRM Integrations
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Sync contacts and deals with HubSpot",
      category: "crm",
      icon: Users,
      color: "orange",
      bgColor: "bg-orange-100",
      status: "popular",
      popular: true
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Enterprise CRM integration",
      category: "crm",
      icon: Building2,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "pipedrive",
      name: "Pipedrive",
      description: "Sales pipeline integration",
      category: "crm",
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-100",
      status: "available"
    },
    {
      id: "zoho-crm",
      name: "Zoho CRM",
      description: "Connect with Zoho CRM",
      category: "crm",
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "coming-soon"
    },

    // Email Marketing
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Sync contacts and automate email campaigns",
      category: "email",
      icon: Mail,
      color: "yellow",
      bgColor: "bg-yellow-100",
      status: "popular",
      popular: true
    },
    {
      id: "convertkit",
      name: "ConvertKit",
      description: "Email marketing for creators",
      category: "email",
      icon: Mail,
      color: "green",
      bgColor: "bg-green-100",
      status: "available"
    },
    {
      id: "activecampaign",
      name: "ActiveCampaign",
      description: "Email marketing & automation",
      category: "email",
      icon: Mail,
      color: "orange",
      bgColor: "bg-orange-100",
      status: "available"
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Transactional email service",
      category: "email",
      icon: Mail,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "brevo",
      name: "Brevo (Sendinblue)",
      description: "Email & SMS marketing",
      category: "email",
      icon: Mail,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "coming-soon"
    },

    // Analytics
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track event performance and conversions",
      category: "analytics",
      icon: BarChart3,
      color: "orange",
      bgColor: "bg-orange-100",
      status: "popular",
      popular: true
    },
    {
      id: "mixpanel",
      name: "Mixpanel",
      description: "Product analytics and user tracking",
      category: "analytics",
      icon: PieChart,
      color: "purple",
      bgColor: "bg-purple-100",
      status: "available"
    },
    {
      id: "amplitude",
      name: "Amplitude",
      description: "Advanced product analytics",
      category: "analytics",
      icon: Activity,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "hotjar",
      name: "Hotjar",
      description: "Heatmaps and user feedback",
      category: "analytics",
      icon: Eye,
      color: "red",
      bgColor: "bg-red-100",
      status: "coming-soon"
    },

    // Communication
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and updates in Slack",
      category: "communication",
      icon: MessageSquare,
      color: "purple",
      bgColor: "bg-purple-100",
      status: "popular",
      popular: true,
      featured: true
    },
    {
      id: "discord",
      name: "Discord",
      description: "Send notifications to Discord channels",
      category: "communication",
      icon: MessageCircle,
      color: "indigo",
      bgColor: "bg-indigo-100",
      status: "available"
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Bot notifications via Telegram",
      category: "communication",
      icon: MessageSquare,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Send booking confirmations via WhatsApp",
      category: "communication",
      icon: Phone,
      color: "green",
      bgColor: "bg-green-100",
      status: "coming-soon"
    },

    // Social Media
    {
      id: "twitter",
      name: "Twitter/X",
      description: "Share events and updates on Twitter",
      category: "social",
      icon: Twitter,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Post events to LinkedIn",
      category: "social",
      icon: Linkedin,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Connect with Facebook events",
      category: "social",
      icon: Facebook,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "coming-soon"
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Share to Instagram stories",
      category: "social",
      icon: Instagram,
      color: "pink",
      bgColor: "bg-pink-100",
      status: "coming-soon"
    },

    // Storage & File Management
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Store and share files with Google Drive",
      category: "storage",
      icon: Cloud,
      color: "green",
      bgColor: "bg-green-100",
      status: "available"
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "File storage and sharing",
      category: "storage",
      icon: Cloud,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },
    {
      id: "onedrive",
      name: "OneDrive",
      description: "Microsoft cloud storage",
      category: "storage",
      icon: Cloud,
      color: "blue",
      bgColor: "bg-blue-100",
      status: "available"
    },

    // Automation
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 3000+ apps via Zapier",
      category: "automation",
      icon: Zap,
      color: "orange",
      bgColor: "bg-orange-100",
      status: "popular",
      popular: true,
      featured: true
    },
    {
      id: "make",
      name: "Make (Integromat)",
      description: "Visual automation platform",
      category: "automation",
      icon: Layers,
      color: "purple",
      bgColor: "bg-purple-100",
      status: "available"
    },
    {
      id: "n8n",
      name: "n8n",
      description: "Self-hosted automation",
      category: "automation",
      icon: Code,
      color: "red",
      bgColor: "bg-red-100",
      status: "coming-soon"
    },

    // Webhooks & API
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Send real-time data to any URL",
      category: "automation",
      icon: Webhook,
      color: "gray",
      bgColor: "bg-gray-100",
      status: "available",
      featured: true
    },
    {
      id: "api",
      name: "REST API",
      description: "Full API access for custom integrations",
      category: "automation",
      icon: Code,
      color: "gray",
      bgColor: "bg-gray-100",
      status: "available"
    }
  ];

  const categories = [
    { id: "all", label: "All", icon: Grid },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "video", label: "Video", icon: Video },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "crm", label: "CRM", icon: Users },
    { id: "email", label: "Email", icon: Mail },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "social", label: "Social", icon: Twitter },
    { id: "storage", label: "Storage", icon: Cloud },
    { id: "automation", label: "Automation", icon: Zap }
  ];

  // Filter integrations based on search and category
  const filteredIntegrations = allIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get connected integration IDs
  const connectedIds = connectedIntegrations.map(i => i.id);

  const handleConnect = (integrationId: string) => {
    // This would be implemented when the feature is live
    console.log("Connect integration:", integrationId);
  };

  const handleDisconnect = (integrationId: string) => {
    setConnectedIntegrations(prev => prev.filter(i => i.id !== integrationId));
  };

  const handleConfigure = (integrationId: string) => {
    console.log("Configure integration:", integrationId);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Connect your favorite tools and services to enhance your scheduling experience
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <AlertTitle className="text-purple-800 font-semibold">Integrations Coming Soon!</AlertTitle>
        <AlertDescription className="text-purple-700">
          We're building a comprehensive integration ecosystem. Here's a preview of what's coming.
        </AlertDescription>
      </Alert>

      {/* Connected Integrations Section */}
      {connectedIntegrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Connected Integrations</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connectedIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="border-2 border-green-100">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${integration.bgColor} rounded-lg`}>
                          <Icon className={`h-5 w-5 text-${integration.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleConfigure(integration.id)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {integration.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigure(integration.id)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <Layers className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Featured Integrations */}
      {searchQuery === "" && selectedCategory === "all" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Integrations</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {allIntegrations.filter(i => i.featured).map((integration) => {
              const Icon = integration.icon;
              const isConnected = connectedIds.includes(integration.id);
              return (
                <Card key={integration.id} className="relative overflow-hidden group hover:shadow-lg transition-all">
                  {integration.popular && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${integration.bgColor} rounded-lg`}>
                        <Icon className={`h-5 w-5 text-${integration.color}-600`} />
                      </div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      {integration.permissions?.slice(0, 2).map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={isConnected ? "secondary" : "default"}
                      onClick={() => isConnected ? handleConfigure(integration.id) : handleConnect(integration.id)}
                      disabled={integration.status === "coming-soon"}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          Connected
                        </>
                      ) : integration.status === "coming-soon" ? (
                        "Coming Soon"
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Integrations Grid/List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedCategory === "all" ? "All Integrations" : `${categories.find(c => c.id === selectedCategory)?.label} Integrations`}
        </h2>
        
        {viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon;
              const isConnected = connectedIds.includes(integration.id);
              return (
                <Card key={integration.id} className="relative hover:shadow-md transition-all">
                  {integration.popular && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-[10px] h-5">
                      Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 ${integration.bgColor} rounded-lg`}>
                        <Icon className={`h-4 w-4 text-${integration.color}-600`} />
                      </div>
                      <CardTitle className="text-sm">{integration.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {integration.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    {isConnected ? (
                      <div className="flex items-center justify-between w-full">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleConfigure(integration.id)}>
                          Configure
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleConnect(integration.id)}
                        disabled={integration.status === "coming-soon"}
                      >
                        {integration.status === "coming-soon" ? "Coming Soon" : "Connect"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Integration</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntegrations.map((integration) => {
                  const Icon = integration.icon;
                  const isConnected = connectedIds.includes(integration.id);
                  return (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 ${integration.bgColor} rounded-lg`}>
                            <Icon className={`h-4 w-4 text-${integration.color}-600`} />
                          </div>
                          <span className="font-medium">{integration.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {integration.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground truncate">
                          {integration.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        {isConnected ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                            Connected
                          </Badge>
                        ) : integration.status === "coming-soon" ? (
                          <Badge variant="outline" className="bg-gray-100">
                            Coming Soon
                          </Badge>
                        ) : integration.popular ? (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">
                            Popular
                          </Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isConnected ? (
                          <Button variant="ghost" size="sm" onClick={() => handleConfigure(integration.id)}>
                            Configure
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleConnect(integration.id)}
                            disabled={integration.status === "coming-soon"}
                          >
                            Connect
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Category Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {categories.slice(1).map(category => {
          const count = allIntegrations.filter(i => i.category === category.id).length;
          const connected = connectedIntegrations.filter(i => i.category === category.id).length;
          const Icon = category.icon;
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCategory(category.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{category.label}</p>
                      <p className="text-xs text-muted-foreground">{count} integrations</p>
                    </div>
                  </div>
                  {connected > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {connected} connected
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Developer Section */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Code className="h-5 w-5 text-blue-400" />
                <h3 className="text-xl font-semibold">Build your own integration</h3>
              </div>
              <p className="text-gray-300 max-w-2xl">
                Use our REST API and webhooks to create custom integrations. 
                Full documentation and SDKs available for developers.
              </p>
              <div className="flex gap-4 pt-2 justify-center md:justify-start">
                <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100" disabled>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Docs
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700" disabled>
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                REST API
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                Webhooks
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                SDKs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          <Lock className="h-3 w-3 inline mr-1" />
          All connections are encrypted and secure · 
          <Button variant="link" className="text-xs h-auto p-0 mx-1" disabled>
            Privacy Policy
          </Button>
          ·
          <Button variant="link" className="text-xs h-auto p-0 mx-1" disabled>
            Security
          </Button>
        </p>
      </div>
    </div>
  );
}

// Helper component for Select
const Select = ({ value, onValueChange, children }: any) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
};

const SelectTrigger = ({ children, className }: any) => {
  return <div className={className}>{children}</div>;
};

const SelectValue = ({ placeholder }: any) => {
  return <span>{placeholder}</span>;
};

const SelectContent = ({ children }: any) => {
  return <>{children}</>;
};

const SelectItem = ({ value, children }: any) => {
  return <option value={value}>{children}</option>;
};