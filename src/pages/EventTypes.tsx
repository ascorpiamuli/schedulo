import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  useEventTypes, 
  useCreateEventType, 
  useUpdateEventType, 
  useDeleteEventType,
  usePersonalEvents,
  useOrganizationEvents,
  useDepartmentEvents,
  EventType,
  EventScope,
  defaultForm,
  FormData,
  TeamMemberForm,
  CustomField
} from "@/hooks/use-event-types";
import { 
  useOrganization,
  useDepartments
} from "@/hooks/use-team-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Calendar, Sparkles, X, RefreshCw, Grid, Table as TableIcon,
  Users, DollarSign, CalendarCheck2, Clock, Award, TrendingUp, Target,
  Pencil
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEventTypesBookingCounts } from "@/hooks/use-bookings";
import { supabase } from "@/integrations/supabase/client";

// Import sub-components
import { StatsCard } from "@/components/events/StatsCard";
import { FilterBar } from "@/components/events/FilterBar";
import { EventCard } from "@/components/events/EventCard";
import { TableView } from "@/components/events/TableView";
import { CalendarConnection } from "@/components/events/CalendarConnection";
import { MobileBottomNav } from "@/components/events/MobileBottomNav";
import { GuideCard } from "@/components/events/GuideCard";
import { EventForm } from "@/components/events/EventForm";

// Import constants and utilities
import { containerVariants,itemVariants } from "@/components/events/constants/animations";
import { EVENT_SCOPE_OPTIONS } from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";

// ============================================
// DEFAULT FORM VALUES
// ============================================

export const defaultForm: FormData = {
  // Basic Info
  title: "",
  slug: "",
  description: "",
  
  // Scope & Organization
  scope: "personal",
  organization_id: null,
  department_id: null,
  
  // Schedule
  schedule_type: "flexible",
  one_time_event: null,
  duration: 30,
  
  // Location
  location_type: "video",
  location_details: "",
  
  // Appearance
  color: "#0F172A",
  
  // Buffer Times
  buffer_before: 0,
  buffer_after: 0,
  
  // Status
  is_active: true,
  
  // Pricing
  price_cents: 0,
  currency: "usd",
  
  // Multi-attendee defaults
  max_attendees: 1,
  min_attendees: 1,
  allow_additional_guests: false,
  guests_can_invite_others: false,
  require_approval: false,
  team_event: false,
  waiting_list_enabled: false,
  reminder_settings: {
    '24h': true,
    '1h': false,
    '15min': false
  },
  custom_fields: [],
  payment_required_per_attendee: false,
  booking_confirmation_message: "",
  cancellation_policy: "",
  show_attendees_to_guests: true,
  
  // Meeting link defaults
  permanent_meeting_link: "",
  generate_meeting_link: true,
  meeting_provider: 'google_meet',
  host_join_first: true,
  conference_data: null,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EventTypes() {
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const { data: departments } = useDepartments();
  
  // Fetch events
  const { data: events, isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Get booking counts
  const eventTypeIds = events?.map(e => e.id) || [];
  const { data: bookingCounts, isLoading: countsLoading } = useEventTypesBookingCounts(eventTypeIds);

  // UI State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("0");
  const [showGuide, setShowGuide] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | EventScope>("all");
  const [activeTab, setActiveTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Multi-attendee state
  const [teamMembersList, setTeamMembersList] = useState<TeamMemberForm[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const userId = user?.id;

  // Update organization/department fields when scope changes
  useEffect(() => {
    setForm(f => ({ 
      ...f, 
      organization_id: f.scope === 'personal' ? null : organization?.id,
      department_id: f.scope === 'department' ? selectedDepartmentId : null
    }));
  }, [form.scope, selectedDepartmentId, organization]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    let filtered = [...events];
    
    if (filterStatus === "active") {
      filtered = filtered.filter(e => e.is_active);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(e => !e.is_active);
    }
    
    if (scopeFilter !== 'all') {
      filtered = filtered.filter(e => e.scope === scopeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.slug.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return filtered;
  }, [events, filterStatus, scopeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!events) return { 
      total: 0, 
      active: 0, 
      totalBookings: 0,
      totalRevenue: 0,
      avgDuration: 0,
      mostBooked: 'None',
      conversionRate: 0,
      popularTime: '9-11 AM',
      personalEvents: 0,
      organizationEvents: 0,
      departmentEvents: 0,
      autoMeetingEvents: 0,
      groupEvents: 0,
      oneOnOneEvents: 0,
      oneTimeEvents: 0
    };

    const total = events.length;
    const active = events.filter(e => e.is_active).length;
    const totalBookings = Object.values(bookingCounts || {}).reduce((sum, count) => sum + count, 0);
    const totalRevenue = events.reduce((sum, event) => {
      const count = bookingCounts?.[event.id] || 0;
      const price = (event.price_cents || 0) / 100;
      return sum + (count * price);
    }, 0);
    const avgDuration = Math.round(events.reduce((sum, e) => sum + e.duration, 0) / events.length);
    const personalEvents = events.filter(e => e.scope === 'personal').length;
    const organizationEvents = events.filter(e => e.scope === 'organization').length;
    const departmentEvents = events.filter(e => e.scope === 'department').length;
    const autoMeetingEvents = events.filter(e => e.generate_meeting_link).length;
    const groupEvents = events.filter(e => e.max_attendees > 1).length;
    const oneOnOneEvents = events.filter(e => e.max_attendees === 1 && e.scope === 'personal').length;
    const oneTimeEvents = events.filter(e => e.schedule_type === 'one_time').length;
    
    let maxBookings = 0;
    let mostBooked = 'None';
    events.forEach(event => {
      const count = bookingCounts?.[event.id] || 0;
      if (count > maxBookings) {
        maxBookings = count;
        mostBooked = event.title;
      }
    });

    const conversionRate = total > 0 ? Math.round((totalBookings / total) * 10) / 10 : 0;

    return {
      total,
      active,
      totalBookings,
      totalRevenue,
      avgDuration,
      mostBooked,
      conversionRate,
      popularTime: '9-11 AM',
      personalEvents,
      organizationEvents,
      departmentEvents,
      autoMeetingEvents,
      groupEvents,
      oneOnOneEvents,
      oneTimeEvents
    };
  }, [events, bookingCounts]);

  // Event Handlers
  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setSelectedDepartmentId(null);
    setPriceInput("0");
    setShowAdvanced(false);
    setTeamMembersList([]);
    setCustomFields([]);
    setDialogOpen(true);
  };

  const openEdit = (e: EventType) => {
    setEditingId(e.id);
    const price = (e.price_cents || 0) / 100;
    setForm({
      title: e.title,
      slug: e.slug,
      description: e.description || "",
      duration: e.duration,
      location_type: e.location_type,
      location_details: e.location_details || "",
      color: e.color,
      buffer_before: e.buffer_before,
      buffer_after: e.buffer_after,
      is_active: e.is_active,
      price_cents: e.price_cents || 0,
      currency: e.currency,
      
      scope: e.scope,
      organization_id: e.organization_id,
      department_id: e.department_id,
      
      max_attendees: e.max_attendees,
      min_attendees: e.min_attendees,
      allow_additional_guests: e.allow_additional_guests || false,
      guests_can_invite_others: e.guests_can_invite_others || false,
      require_approval: e.require_approval || false,
      team_event: e.team_event || false,
      waiting_list_enabled: e.waiting_list_enabled || false,
      reminder_settings: e.reminder_settings || defaultForm.reminder_settings,
      custom_fields: e.custom_fields || [],
      payment_required_per_attendee: e.payment_required_per_attendee || false,
      booking_confirmation_message: e.booking_confirmation_message || "",
      cancellation_policy: e.cancellation_policy || "",
      show_attendees_to_guests: e.show_attendees_to_guests || true,
      
      schedule_type: e.schedule_type || 'flexible',
      one_time_event: e.one_time_event || null,
      
      permanent_meeting_link: e.permanent_meeting_link || "",
      generate_meeting_link: e.generate_meeting_link ?? true,
      meeting_provider: e.meeting_provider || 'google_meet',
      host_join_first: e.host_join_first ?? true,
      conference_data: e.conference_data || null,
    });
    setSelectedDepartmentId(e.department_id);
    setPriceInput(price.toFixed(2));
    setCustomFields(e.custom_fields || []);
    setTeamMembersList(e.team_members?.map(m => ({
      user_id: m.user_id,
      role: m.role,
      is_required: m.is_required
    })) || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ 
        title: "Missing fields", 
        description: "Title and URL slug are required",
        variant: "destructive" 
      });
      return;
    }

    if (form.min_attendees > form.max_attendees) {
      toast({
        title: "Invalid attendee limits",
        description: "Minimum attendees cannot exceed maximum attendees",
        variant: "destructive"
      });
      return;
    }

    if (form.schedule_type === 'one_time' && !form.one_time_event) {
      toast({
        title: "Missing event details",
        description: "Please set the date and time for your one-time event",
        variant: "destructive"
      });
      return;
    }

    if ((form.scope === 'organization' || form.scope === 'department') && !organization) {
      toast({
        title: "Cannot create organization event",
        description: "You need to be part of an organization to create organization events",
        variant: "destructive"
      });
      return;
    }

    if (form.scope === 'department' && !selectedDepartmentId) {
      toast({
        title: "Department required",
        description: "Please select a department for this event",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const eventData = {
        ...form,
        custom_fields: customFields,
        team_members: teamMembersList.length > 0 ? teamMembersList : undefined
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...eventData });
        toast({ 
          title: "✅ Event Updated", 
          description: "Your event type has been updated successfully." 
        });
      } else {
        await createMutation.mutateAsync({ ...eventData, user_id: user!.id });
        toast({ 
          title: "✅ Event Created", 
          description: "Your new event type is ready to accept bookings." 
        });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ 
        title: "Event Deleted", 
        description: "Event type has been removed." 
      });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const toggleActive = async (e: EventType) => {
    await updateMutation.mutateAsync({ id: e.id, is_active: !e.is_active });
    toast({
      title: !e.is_active ? "Event Activated" : "Event Deactivated",
    });
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/${userId}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ 
      title: "Link Copied", 
      description: "Booking link copied to clipboard." 
    });
  };

  const duplicateEvent = async (e: EventType) => {
    await createMutation.mutateAsync({
      ...e,
      title: `${e.title} (Copy)`,
      slug: `${e.slug}-copy`,
      user_id: user!.id,
      is_active: false
    });
    toast({ 
      title: "Event Duplicated", 
      description: "A copy has been created (inactive by default)." 
    });
  };

  if (isLoading || countsLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">Loading your events...</p>
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
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-4 sm:p-6 lg:p-8">
          <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-black/20 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
                <div className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-white/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Event Management
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-['Space_Grotesk']">
                  Create & manage your events
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-xl">
                  Set up different ways people can book time with you. From 1:1 calls to one-time events like "Feb 23, 7-10 AM Class".
                  Auto-generate meeting links for seamless video calls.
                </p>
                
                <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <div className="flex -space-x-1 sm:-space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/20 border-2 border-white/10 flex items-center justify-center text-white text-[10px] sm:text-xs">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/60">Trusted by 1,000+ teams</p>
                </div>
              </div>
              
              <Button 
                onClick={openCreate} 
                size={isMobile ? "default" : "lg"}
                className="bg-white text-slate-900 hover:bg-white/90 shadow-xl gap-1 sm:gap-2 px-4 sm:px-6 w-full sm:w-auto text-sm"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Create New Event
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="Total Events"
            value={stats.total}
            icon={Calendar}
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            description={`${stats.active} active · ${stats.total - stats.active} inactive`}
            color="blue"
            progress={Math.round((stats.active / (stats.total || 1)) * 100)}
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Users}
            trend={{ value: 8, direction: 'up', label: 'this month' }}
            description={`Avg ${stats.conversionRate} per event`}
            color="orange"
          />
          <StatsCard
            title="Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 23, direction: 'up', label: 'this quarter' }}
            description="From paid events"
            color="green"
          />
          <StatsCard
            title="One-Time Events"
            value={stats.oneTimeEvents}
            icon={CalendarCheck2}
            trend={{ value: 5, direction: 'up', label: 'new' }}
            description={`${stats.oneTimeEvents} fixed date events`}
            color="purple"
          />
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-amber-100 p-1.5 sm:p-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Duration</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.avgDuration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Most Booked</p>
                  <p className="text-sm sm:text-base font-semibold truncate max-w-[100px]">{stats.mostBooked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Peak Time</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.popularTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-purple-100 p-1.5 sm:p-2">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Conversion</p>
                  <p className="text-sm sm:text-base font-semibold">{stats.conversionRate}/event</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Guide Section */}
        {showGuide && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-slate-50 to-white border p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-900 p-1.5 sm:p-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">Quick Start Guide</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowGuide(false)} className="h-7 w-7 sm:h-8 sm:w-8">
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <GuideCard
                icon="Zap"
                title="1. Create an Event"
                color="blue"
                steps={[
                  "Click 'Create New Event' button",
                  "Choose event scope: Personal, Organization, or Department",
                  "Give it a clear title (e.g., 'Math Class Feb 23')",
                  "Choose schedule type: 1:1, One-Time, or Flexible"
                ]}
              />
              <GuideCard
                icon="Settings2"
                title="2. Configure Settings"
                color="amber"
                steps={[
                  "Set attendee limits",
                  "For one-time: pick date & time (e.g., Feb 23, 7-10 AM)",
                  "Configure meeting links (auto-generate or custom)",
                  "Set price if it's a paid event"
                ]}
              />
              <GuideCard
                icon="Share2"
                title="3. Share & Manage"
                color="green"
                steps={[
                  "Copy your booking link",
                  "Share via email, website, or social",
                  "Track bookings in dashboard",
                  "Edit or duplicate as needed"
                ]}
              />
            </div>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <CalendarCheck2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-800">Pro Tip: One-Time Events</p>
                  <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5 sm:mt-1">
                    <strong>Perfect for:</strong> Single classes, workshops, webinars at specific times. 
                    Just set the date (e.g., Feb 23, 2026) and time range (7-10 AM). Duration is auto-calculated.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-full sm:w-auto min-w-[300px] sm:min-w-0">
              <TabsTrigger value="events" className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                All Events
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                Calendar Sync
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="mt-4 sm:mt-6">
            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              scopeFilter={scopeFilter}
              onScopeFilterChange={setScopeFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              stats={stats}
              isMobile={isMobile}
            />

            {/* Events Display */}
            {filteredEvents.length === 0 ? (
              <Card className="text-center py-12 sm:py-16 border-2 border-dashed">
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute inset-0 bg-slate-200 rounded-full blur-3xl" />
                    <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 relative" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold">No events found</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                      {searchQuery 
                        ? "No events match your search. Try different keywords."
                        : filterStatus !== "all" 
                        ? `You don't have any ${filterStatus} events.` 
                        : "Create your first event to start accepting bookings."}
                    </p>
                  </div>
                  <Button onClick={openCreate} size={isMobile ? "default" : "lg"} className="gap-2 bg-slate-900 hover:bg-slate-800 text-sm">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {viewMode === "table" && !isMobile ? (
                  <TableView 
                    events={filteredEvents}
                    bookingCounts={bookingCounts}
                    onCopy={copyLink}
                    onEdit={openEdit}
                    onDuplicate={duplicateEvent}
                    onToggle={toggleActive}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        bookingCount={bookingCounts?.[event.id] || 0}
                        onCopy={copyLink}
                        onEdit={openEdit}
                        onDuplicate={duplicateEvent}
                        onToggle={toggleActive}
                        onDelete={handleDelete}
                      />
                    ))}

                    {/* Create Card */}
                    <Card 
                      onClick={openCreate} 
                      className="cursor-pointer border-2 border-dashed hover:border-slate-900 hover:bg-slate-50 transition-all"
                    >
                      <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center min-h-[250px] sm:min-h-[300px]">
                        <div className="rounded-full bg-slate-100 p-3 sm:p-4 mb-3 sm:mb-4">
                          <Plus className="h-5 w-5 sm:h-8 sm:w-8 text-slate-600" />
                        </div>
                        <h3 className="font-semibold text-sm sm:text-lg text-slate-900 mb-1 sm:mb-2">Create New Event</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground max-w-[150px] sm:max-w-[200px]">
                          Add another way for people to book time with you
                        </p>
                        <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
                          {stats.total} total · {stats.active} active
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              {userId && <CalendarConnection userId={userId} />}
              
              <Card className="bg-gradient-to-br from-slate-50 to-white border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="rounded-lg bg-slate-100 p-2 sm:p-3">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-lg mb-1">Why sync your calendar?</h3>
                      <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-sm text-muted-foreground">
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>Prevent double-booking - automatically blocks busy times</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>Generate Google Meet links for every video call</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>Send calendar invites to guests with all details</span>
                        </li>
                        <li className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-green-600 text-xs">✓</span>
                          <span>See all your meetings in one place</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-blue-600">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-orange-600">{stats.totalBookings}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-green-600">${stats.totalRevenue.toFixed(0)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold font-['Space_Grotesk'] text-purple-600">{stats.avgDuration}min</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Duration</p>
          </div>
        </motion.div>

        {/* Attribution */}
        <motion.div variants={itemVariants} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 sm:px-4 py-2 text-[10px] sm:text-xs text-muted-foreground">
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile ? "w-full h-full max-h-full rounded-none" : "max-w-4xl lg:max-w-5xl"
        )}>
          <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white sticky top-0 z-50">
            <DialogHeader className="p-0">
              <DialogTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-slate-100 p-1 sm:p-1.5">
                  {editingId ? <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />}
                </div>
                {editingId ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} className="h-7 w-7 sm:h-8 sm:w-8">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <EventForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            organization={organization}
            departments={departments}
            selectedDepartmentId={selectedDepartmentId}
            setSelectedDepartmentId={setSelectedDepartmentId}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            priceInput={priceInput}
            setPriceInput={setPriceInput}
            teamMembersList={teamMembersList}
            setTeamMembersList={setTeamMembersList}
            customFields={customFields}
            setCustomFields={setCustomFields}
            userId={userId}
            isMobile={isMobile}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}