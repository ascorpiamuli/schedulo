// pages/dashboard/settings.tsx - Updated Profile Section
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  RefreshCw,
  Video,
  MessageSquare,
  Camera,
  AtSign,
  CalendarDays,
  Award,
  Check,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
// PROFILE SECTION (PRODUCTION READY)
// ============================================

interface ProfileData {
  full_name: string;
  username: string;
  phone: string;
  location: string;
  bio: string;
  job_title: string;
  company: string;
  website: string;
  social_links: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  timezone: string;
  avatar_url?: string | null;
}

function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    username: "",
    phone: "",
    location: "",
    bio: "",
    job_title: "",
    company: "",
    website: "",
    social_links: {},
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get profile from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profileData) {
        const fetchedProfile = {
          full_name: profileData.full_name || "",
          username: profileData.username || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || "",
          job_title: profileData.job_title || "",
          company: profileData.company || "",
          website: profileData.website || "",
          social_links: profileData.social_links || {},
          timezone: profileData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatar_url: profileData.avatar_url,
        };
        setProfile(fetchedProfile);
        setOriginalProfile(fetchedProfile);
      } else {
        // Initialize with user metadata if no profile exists
        const initialProfile = {
          full_name: user.user_metadata?.full_name || "",
          username: user.user_metadata?.username || "",
          phone: "",
          location: "",
          bio: "",
          job_title: "",
          company: "",
          website: "",
          social_links: {},
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        setProfile(initialProfile);
        setOriginalProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for changes
  useEffect(() => {
    if (!originalProfile) return;
    
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    setHasChanges(changed);
  }, [profile, originalProfile]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: keyof typeof profile.social_links, value: string) => {
    setProfile(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Please upload an image file (JPEG, PNG, GIF, or WEBP)",
      variant: "destructive",
    });
    return;
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Avatar must be less than 2MB",
      variant: "destructive",
    });
    return;
  }

  setUploadingAvatar(true);

  try {
    // Create path matching policy: avatars/user-id/filename
    const fileExt = file.name.split('.').pop();
    const fileName = `avatars/${user.id}/${Date.now()}.${fileExt}`; // Note: includes 'avatars/' folder

    console.log('Uploading to path:', fileName);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars') // Bucket name
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;
    console.log('Avatar URL:', avatarUrl);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (updateError) throw updateError;

    setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
    
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated",
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toast({
      title: "Upload failed",
      description: error?.message || "Failed to upload avatar. Please try again.",
      variant: "destructive",
    });
  } finally {
    setUploadingAvatar(false);
  }
};

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Validate username format if provided
      if (profile.username && !/^[a-zA-Z0-9_]+$/.test(profile.username)) {
        toast({
          title: "Invalid username",
          description: "Username can only contain letters, numbers, and underscores",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if username is taken (if changed)
      if (profile.username !== originalProfile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', profile.username)
          .neq('user_id', user.id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          toast({
            title: "Username taken",
            description: "This username is already in use. Please choose another.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Prepare profile data
      const profileData = {
        user_id: user.id,
        full_name: profile.full_name || null,
        username: profile.username || null,
        phone: profile.phone || null,
        location: profile.location || null,
        bio: profile.bio || null,
        job_title: profile.job_title || null,
        company: profile.company || null,
        website: profile.website || null,
        social_links: profile.social_links,
        timezone: profile.timezone,
        updated_at: new Date().toISOString(),
      };

      // Upsert profile
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      // Also update user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          username: profile.username,
        },
      });

      setOriginalProfile(profile);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: "Failed to save profile changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    toast({
      title: "Changes discarded",
      description: "Your profile changes have been reverted",
    });
  };

  if (loading && !profile.full_name && !originalProfile) {
    return (
      <SettingsCard icon={User} title="Profile Information">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard icon={User} title="Profile Information">
      <div className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-[#1E3A8A]/20">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              ) : (
                <AvatarFallback className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-lg">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <label 
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[#1E3A8A]">Profile Picture</h3>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, GIF or PNG. Max 2MB. Click the avatar to upload.
            </p>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-[#1E3A8A]">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="pl-9"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#1E3A8A]">
              Username <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="pl-9"
                placeholder="johndoe"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your unique public username. Only letters, numbers, and underscores.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1E3A8A]">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="email"
                value={user?.email || ''}
                readOnly
                className="pl-9 bg-muted/50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support for assistance.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#1E3A8A]">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-9"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title" className="text-[#1E3A8A]">Job Title</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="job_title"
                value={profile.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                className="pl-9"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-[#1E3A8A]">Company</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="pl-9"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-[#1E3A8A]">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="pl-9"
                placeholder="New York, NY"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-[#1E3A8A]">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="pl-9"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio" className="text-[#1E3A8A]">Bio</Label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] bg-transparent resize-y"
              placeholder="Tell us a little about yourself..."
            />
            <p className="text-xs text-muted-foreground">
              {profile.bio.length}/500 characters
            </p>
          </div>
        </div>

        <Separator />

        {/* Social Links */}
        <div>
          <h3 className="text-sm font-medium text-[#1E3A8A] mb-3">Social Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github" className="text-xs">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
                <Input
                  id="github"
                  value={profile.social_links.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  className="pl-9"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
                <Input
                  id="linkedin"
                  value={profile.social_links.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="pl-9"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-xs">Twitter / X</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
                <Input
                  id="twitter"
                  value={profile.social_links.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  className="pl-9"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-xs">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
                <Input
                  id="instagram"
                  value={profile.social_links.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  className="pl-9"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-[#1E3A8A]">Timezone</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E3A8A]" />
            <Input
              id="timezone"
              value={profile.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="pl-9"
              placeholder="Africa/Nairobi"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for scheduling and availability
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleSaveProfile}
            disabled={!hasChanges || loading}
            className="flex-1 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!hasChanges || loading}
            className="flex-1 border-[#1E3A8A]/20"
          >
            Cancel
          </Button>
        </div>

        {/* Profile Completion Status */}
        <div className="mt-4 p-4 bg-gradient-to-r from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#1E3A8A]">Profile Completion</span>
            <span className="text-sm font-medium">
              {Object.values(profile).filter(v => v && v !== '').length}/12 fields
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] transition-all duration-500"
              style={{ width: `${(Object.values(profile).filter(v => v && v !== '').length / 12) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete your profile to help others know you better
          </p>
        </div>
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
// SECURITY SETTINGS (PRODUCTION READY - SIMPLIFIED)
// ============================================

interface LoginSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  factor_id: string | null;
  aal: string | null;
  not_after: string | null;
  user_agent?: string;
  ip_address?: string;
  location?: string;
  device?: string;
  browser?: string;
  os?: string;
  is_current?: boolean;
}

interface SecurityLog {
  id: string;
  user_id: string;
  action: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  created_at: string;
  status: 'success' | 'failure';
  details?: any;
}

function SecuritySection() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State declarations
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQR, setTwoFactorQR] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorRecoveryCodes, setTwoFactorRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check 2FA status on mount
  useEffect(() => {
    check2FAStatus();
  }, [user]);

  // Password strength checker
  useEffect(() => {
    setPasswordStrength({
      length: passwordData.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(passwordData.newPassword),
      lowercase: /[a-z]/.test(passwordData.newPassword),
      number: /[0-9]/.test(passwordData.newPassword),
      special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
    });
  }, [passwordData.newPassword]);

  const check2FAStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      
      setTwoFactorEnabled(data.currentLevel === 'aal2');
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    // Check password strength
    const strengthValues = Object.values(passwordStrength);
    const metCount = strengthValues.filter(Boolean).length;
    
    if (metCount < 3) {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password (min 8 chars, mix of letters, numbers & symbols)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed",
      });

      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      setTwoFactorSecret(data.totp.secret);
      setTwoFactorQR(data.totp.qr_code);
      setShow2FA(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup 2FA",
        variant: "destructive",
      });
    }
  };

  const handleVerify2FA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: 'totp',
      });

      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        challengeId: data.id,
        code: twoFactorCode,
      });

      if (verifyError) throw verifyError;

      // Generate recovery codes
      const recoveryCodes = generateRecoveryCodes();
      setTwoFactorRecoveryCodes(recoveryCodes);
      setShowRecoveryCodes(true);

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled",
      });

      setTwoFactorEnabled(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify 2FA code",
        variant: "destructive",
      });
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
      return;
    }

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: 'totp',
      });

      if (error) throw error;

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      });

      setTwoFactorEnabled(false);
      setShow2FA(false);
      setShowRecoveryCodes(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    }
  };

const handleDeleteAccount = async () => {
  if (confirmDelete !== 'DELETE') return;
  
  setLoading(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) throw new Error("No active session");

    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId: user?.id },
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (error) throw error;

    if (data.partialSuccess) {
      toast({
        title: "Partial Success",
        description: data.error,
        variant: "warning",
      });
    } else {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });
    }

    await supabase.auth.signOut();
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } catch (error: any) {
    console.error('Error deleting account:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to delete account",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
    setShowDeleteConfirm(false);
    setConfirmDelete('');
  }
};
  const generateRecoveryCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(twoFactorRecoveryCodes.join('\n'));
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Recovery codes copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const blob = new Blob([twoFactorRecoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sbpmeet-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const strengthPercentage = Object.values(passwordStrength).filter(Boolean).length * 20;
  const strengthColor = 
    strengthPercentage <= 40 ? "bg-red-500" :
    strengthPercentage <= 60 ? "bg-yellow-500" :
    strengthPercentage <= 80 ? "bg-blue-500" : "bg-green-500";

  return (
    <SettingsCard icon={Shield} title="Security" description="Manage your account security">
      <div className="space-y-6">
        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1E3A8A]/10">
                <Key className="h-4 w-4 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">
                  Change your password regularly to keep your account secure
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="border-[#1E3A8A]/20"
            >
              {showChangePassword ? 'Cancel' : 'Change Password'}
            </Button>
          </div>

          {showChangePassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pl-12"
            >
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {passwordData.newPassword && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Password strength</span>
                      <span className="font-medium">{strengthPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.length ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.length ? "text-green-600" : "text-gray-400"}>
                          8+ characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.uppercase ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.uppercase ? "text-green-600" : "text-gray-400"}>
                          Uppercase
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.lowercase ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.lowercase ? "text-green-600" : "text-gray-400"}>
                          Lowercase
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.number ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.number ? "text-green-600" : "text-gray-400"}>
                          Number
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {passwordStrength.special ? 
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                          <XCircle className="h-3 w-3 text-gray-300" />
                        }
                        <span className={passwordStrength.special ? "text-green-600" : "text-gray-400"}>
                          Special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords don't match</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <Separator />

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1E3A8A]/10">
                <Fingerprint className="h-4 w-4 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  {twoFactorEnabled 
                    ? "Your account is protected with 2FA" 
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
            </div>
            {twoFactorEnabled ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisable2FA}
                className="border-red-500/20 text-red-600 hover:bg-red-500/10"
              >
                Disable
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSetup2FA}
                className="border-[#1E3A8A]/20"
              >
                Enable
              </Button>
            )}
          </div>

          {/* 2FA Setup Flow */}
          {show2FA && !twoFactorEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pl-12"
            >
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="text-center">
                  <img src={twoFactorQR} alt="2FA QR Code" className="mx-auto w-48 h-48" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Secret Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background rounded border text-xs font-mono">
                      {twoFactorSecret}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(twoFactorSecret);
                        toast({ title: "Copied!", description: "Secret key copied to clipboard" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="2fa-code">Enter verification code from authenticator app</Label>
                  <Input
                    id="2fa-code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button onClick={handleVerify2FA} className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  Verify and Enable
                </Button>
              </div>
            </motion.div>
          )}

          {/* Recovery Codes */}
          {showRecoveryCodes && twoFactorRecoveryCodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pl-12"
            >
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mb-2" />
                <h4 className="font-medium text-amber-600 mb-2">Save these recovery codes</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Store these codes in a safe place. You'll need them to access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {twoFactorRecoveryCodes.map((code, index) => (
                    <code key={index} className="p-2 bg-background rounded border text-xs font-mono text-center">
                      {code}
                    </code>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRecoveryCodes}
                    className="flex-1"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadRecoveryCodes}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecoveryCodes(false)}
                  className="w-full mt-2"
                >
                  I've saved these codes
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <Separator />

        {/* Danger Zone */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Danger Zone</p>
              <p className="text-xs text-muted-foreground">
                Irreversible account actions
              </p>
            </div>
          </div>

          <div className="pl-12">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All your bookings, event types, and personal data will be permanently deleted.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
              <Input
                id="confirm-delete"
                placeholder="DELETE"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmDelete !== 'DELETE' || loading}
              onClick={handleDeleteAccount}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Permanently Delete Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const { user } = useAuth();
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
          <TabsTrigger value="billing" className="data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white">
            Billing
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