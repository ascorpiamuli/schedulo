// pages/dashboard/settings.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Settings2,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Clock,
  Calendar,
  CreditCard,
  Mail,
  Smartphone,
  Key,
  Users,
  Building2,
  Link2,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Monitor,
  Languages,
  Phone,
  MapPin,
  Briefcase,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Eye,
  EyeOff,
  Lock,
  Fingerprint,
  History,
  FileText,
  HelpCircle,
  ExternalLink,
  Loader2,
  Plus,
  Copy,
  RefreshCw
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
// SETTINGS CARD COMPONENT
// ============================================

function SettingsCard({ 
  icon: Icon, 
  title, 
  description, 
  children,
  soon = false 
}: { 
  icon: any; 
  title: string; 
  description?: string; 
  children?: React.ReactNode;
  soon?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-[#1E3A8A]/5 to-transparent rounded-bl-full" />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#1E3A8A]/10 p-2.5">
                <Icon className="h-5 w-5 text-[#1E3A8A]" />
              </div>
              <div>
                <CardTitle className="font-['Space_Grotesk'] text-base sm:text-lg text-[#1E3A8A]">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="text-xs sm:text-sm">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {soon && <UnderDevelopmentBadge />}
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {children ? (
            <div className={cn(soon && "opacity-50 pointer-events-none")}>
              {children}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-center bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Settings2 className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// PROFILE SECTION (READ-ONLY PREVIEW)
// ============================================

function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Profile editing will be available soon!",
    });
  };

  return (
    <SettingsCard icon={User} title="Profile Information" soon>
      <div className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-[#1E3A8A]/20">
            <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-lg">
              {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNotify}
              className="border-[#1E3A8A]/20"
            >
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, GIF or PNG. Max 2MB.
            </p>
          </div>
        </div>

        {/* Form Fields (Read-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#1E3A8A]">Full Name</Label>
            <Input 
              value={user?.user_metadata?.full_name || ''} 
              readOnly 
              className="bg-muted/50 cursor-not-allowed"
              onClick={handleNotify}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1E3A8A]">Email Address</Label>
            <Input 
              value={user?.email || ''} 
              readOnly 
              className="bg-muted/50 cursor-not-allowed"
              onClick={handleNotify}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1E3A8A]">Username</Label>
            <Input 
              value={user?.user_metadata?.username || ''} 
              readOnly 
              className="bg-muted/50 cursor-not-allowed"
              onClick={handleNotify}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1E3A8A]">Phone Number</Label>
            <Input 
              placeholder="Not set" 
              readOnly 
              className="bg-muted/50 cursor-not-allowed"
              onClick={handleNotify}
            />
          </div>
        </div>

        <Button 
          onClick={handleNotify} 
          className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
        >
          Save Changes
        </Button>
      </div>
    </SettingsCard>
  );
}

// ============================================
// NOTIFICATION SETTINGS (DEMO)
// ============================================

function NotificationSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Notification settings will be available soon!",
    });
  };

  return (
    <SettingsCard icon={Bell} title="Notifications" description="Manage your notification preferences" soon>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive booking confirmations via email</p>
            </div>
            <Switch checked disabled className="opacity-50" onClick={handleNotify} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SMS Reminders</p>
              <p className="text-xs text-muted-foreground">Get text reminders before meetings</p>
            </div>
            <Switch checked={false} disabled className="opacity-50" onClick={handleNotify} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Browser Push</p>
              <p className="text-xs text-muted-foreground">Desktop notifications for new bookings</p>
            </div>
            <Switch checked={false} disabled className="opacity-50" onClick={handleNotify} />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// SECURITY SETTINGS (DEMO)
// ============================================

function SecuritySection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Security settings will be available soon!",
    });
  };

  return (
    <SettingsCard icon={Shield} title="Security" description="Manage your account security" soon>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-[#1E3A8A]" />
              <div>
                <p className="text-sm font-medium">Change Password</p>
                <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleNotify} className="border-[#1E3A8A]/20">
              Update
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-4 w-4 text-[#1E3A8A]" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Switch checked={false} disabled className="opacity-50" onClick={handleNotify} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-[#1E3A8A]" />
              <div>
                <p className="text-sm font-medium">Login History</p>
                <p className="text-xs text-muted-foreground">View recent account activity</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleNotify}>
              View
            </Button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// APPEARANCE SETTINGS (DEMO)
// ============================================

function AppearanceSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Appearance settings will be available soon!",
    });
  };

  return (
    <SettingsCard icon={Palette} title="Appearance" description="Customize your interface" soon>
      <div className="space-y-4">
        <div>
          <Label className="text-[#1E3A8A] mb-2 block">Theme Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Sun, label: "Light" },
              { icon: Moon, label: "Dark" },
              { icon: Monitor, label: "System" },
            ].map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3 border-[#1E3A8A]/20"
                onClick={handleNotify}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-[#1E3A8A] mb-2 block">Primary Color</Label>
          <div className="flex gap-2">
            {["#1E3A8A", "#C2410C", "#2563EB", "#059669"].map((color) => (
              <button
                key={color}
                className="h-8 w-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={handleNotify}
              />
            ))}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// LOCALIZATION SETTINGS (DEMO)
// ============================================

function LocalizationSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Localization settings will be available soon!",
    });
  };

  return (
    <SettingsCard icon={Globe} title="Localization" description="Language and region preferences" soon>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[#1E3A8A]">Language</Label>
          <div className="flex items-center gap-2 p-2 border rounded-lg cursor-not-allowed opacity-50" onClick={handleNotify}>
            <Languages className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm">English (United States)</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-[#1E3A8A]">Time Zone</Label>
          <div className="flex items-center gap-2 p-2 border rounded-lg cursor-not-allowed opacity-50" onClick={handleNotify}>
            <Clock className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm">Africa/Nairobi (EAT)</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-[#1E3A8A]">Date Format</Label>
          <div className="flex items-center gap-2 p-2 border rounded-lg cursor-not-allowed opacity-50" onClick={handleNotify}>
            <Calendar className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm">MM/DD/YYYY</span>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// INTEGRATION SETTINGS (DEMO)
// ============================================

function IntegrationSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Integrations will be available soon!",
    });
  };

  return (
    <SettingsCard icon={Link2} title="Integrations" description="Connect with other services" soon>
      <div className="space-y-3">
        {[
          { name: "Google Calendar", icon: Calendar, connected: true },
          { name: "Zoom", icon: Video, connected: false },
          { name: "Stripe", icon: CreditCard, connected: false },
          { name: "M-Pesa", icon: Smartphone, connected: false },
          { name: "Slack", icon: MessageSquare, connected: false },
        ].map(({ name, icon: Icon, connected }) => (
          <div key={name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-[#1E3A8A]" />
              <div>
                <p className="text-sm font-medium">{name}</p>
                {connected && (
                  <p className="text-xs text-green-600">Connected</p>
                )}
              </div>
            </div>
            <Button 
              variant={connected ? "outline" : "default"}
              size="sm"
              onClick={handleNotify}
              className={cn(
                connected ? "border-[#1E3A8A]/20" : "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              )}
            >
              {connected ? "Manage" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

// ============================================
// BILLING SETTINGS (DEMO)
// ============================================

function BillingSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Billing settings will be available soon!",
    });
  };

  return (
    <SettingsCard icon={CreditCard} title="Billing" description="Manage your subscription and payments" soon>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-2xl font-bold text-[#1E3A8A]">Free</p>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              Active
            </Badge>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-3 border-[#1E3A8A]/20"
            onClick={handleNotify}
          >
            Upgrade Plan
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-[#1E3A8A]">Payment Method</Label>
          <div className="flex items-center justify-between p-3 border rounded-lg cursor-not-allowed opacity-50" onClick={handleNotify}>
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-sm">No payment method added</span>
            </div>
            <Plus className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[#1E3A8A]">Billing History</Label>
          <div className="flex items-center justify-center py-6 text-center bg-muted/30 rounded-lg cursor-not-allowed" onClick={handleNotify}>
            <div>
              <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No billing history</p>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// TEAM SETTINGS (DEMO)
// ============================================

function TeamSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Team settings will be available soon!",
    });
  };

  return (
    <SettingsCard icon={Users} title="Team" description="Manage your team members" soon>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#1E3A8A]" />
            </div>
            <div>
              <p className="text-sm font-medium">You (Owner)</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20">
            Admin
          </Badge>
        </div>

        <Separator />

        <div className="flex items-center justify-center py-6 text-center bg-muted/30 rounded-lg cursor-not-allowed" onClick={handleNotify}>
          <div>
            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No team members yet</p>
            <Button variant="link" className="mt-2 text-xs" onClick={handleNotify}>
              Invite team members
            </Button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// DATA SETTINGS (DEMO)
// ============================================

function DataSection() {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "🔧 Under Development",
      description: "Data settings will be available soon!",
    });
  };

  const handleDanger = () => {
    toast({
      title: "⚠️ This action is not available",
      description: "Data export and deletion will be available soon.",
      variant: "destructive",
    });
  };

  return (
    <SettingsCard icon={FileText} title="Data" description="Manage your data" soon>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-[#1E3A8A]/20"
            onClick={handleNotify}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-[#1E3A8A]/20"
            onClick={handleNotify}
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-600">Danger Zone</p>
              <p className="text-xs text-muted-foreground mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                className="mt-3"
                onClick={handleDanger}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// MAIN SETTINGS PAGE
// ============================================

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const handleUnderDevelopment = () => {
    toast({
      title: "🔧 Under Development",
      description: "This feature is coming soon!",
    });
  };

  return (
    <div className="space-y-6 pb-8 w-full px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UnderDevelopmentBadge />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-[#1E3A8A]/20"
            onClick={handleUnderDevelopment}
          >
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 max-w-3xl bg-[#1E3A8A]/10">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <ProfileSection />
          <LocalizationSection />
          <DataSection />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <NotificationSection />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <SecuritySection />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <AppearanceSection />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          <IntegrationSection />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <BillingSection />
          <TeamSection />
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#1E3A8A]/10 p-2">
                  <HelpCircle className="h-5 w-5 text-[#1E3A8A]" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-[#1E3A8A]">
                    Need Help?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    Most settings are under development. Check back soon for full functionality!
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                onClick={handleUnderDevelopment}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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

// Missing imports for icons used
import { Video, MessageSquare } from "lucide-react";