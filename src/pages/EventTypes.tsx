import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useEventTypes, useCreateEventType, useUpdateEventType, useDeleteEventType, EventType } from "@/hooks/use-event-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Clock, MapPin, DollarSign, Pencil, Trash2, Copy, MoreVertical,
  Video, Phone, Building2, Calendar, Sparkles, AlertCircle, CheckCircle2, Palette,
  Shield, Zap, Eye, EyeOff, Hash, Settings2, X, ChevronDown, Globe, Info,
  Fingerprint, LayoutGrid, List, ArrowUpDown, Filter, TrendingUp, Users,
  CalendarRange, BarChart3
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventTypesBookingCounts, useEventTypeBookingStats } from "@/hooks/use-bookings";
import { Progress } from "@/components/ui/progress";

// Helper to truncate user ID
const truncateUserId = (id: string) => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.slice(0, 4)}...${id.slice(-3)}`;
};

// Location options
const LOCATION_OPTIONS = [
  { value: "video", label: "Video", icon: Video, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { value: "phone", label: "Phone", icon: Phone, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { value: "in_person", label: "In person", icon: Building2, color: "text-amber-500", bgColor: "bg-amber-500/10" },
];

const COLOR_OPTIONS = [
  { value: "#7C3AED", name: "Violet" },
  { value: "#2563EB", name: "Blue" },
  { value: "#059669", name: "Emerald" },
  { value: "#D97706", name: "Amber" },
  { value: "#DC2626", name: "Red" },
  { value: "#EC4899", name: "Pink" },
  { value: "#0891B2", name: "Cyan" },
  { value: "#4F46E5", name: "Indigo" },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD ($)", symbol: "$", flag: "🇺🇸" },
  { value: "eur", label: "EUR (€)", symbol: "€", flag: "🇪🇺" },
  { value: "gbp", label: "GBP (£)", symbol: "£", flag: "🇬🇧" },
  { value: "kes", label: "KES (KSh)", symbol: "KSh", flag: "🇰🇪" },
  { value: "ngn", label: "NGN (₦)", symbol: "₦", flag: "🇳🇬" },
];

interface FormData {
  title: string;
  slug: string;
  description: string;
  duration: number;
  location_type: string;
  location_details: string;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents: number;
  currency: string;
}

const defaultForm: FormData = {
  title: "",
  slug: "",
  description: "",
  duration: 30,
  location_type: "video",
  location_details: "",
  color: "#7C3AED",
  buffer_before: 0,
  buffer_after: 0,
  is_active: true,
  price_cents: 0,
  currency: "usd",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Simple instruction card for mobile
function InstructionCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, trend, color = "primary" }: any) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-bold font-['Space_Grotesk']">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={cn("rounded-xl p-2.5", `bg-${color}/10`)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", `text-${color}`)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventTypes() {
  const { user } = useAuth();
  const { data: events, isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Get booking counts for all event types
  const eventTypeIds = events?.map(e => e.id) || [];
  const { data: bookingCounts, isLoading: countsLoading } = useEventTypesBookingCounts(eventTypeIds);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("0");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"title" | "duration" | "created" | "bookings">("title");

  // Use user.id as the identifier
  const userId = user?.id;

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    let filtered = [...events];
    
    // Filter by status
    if (filterStatus === "active") {
      filtered = filtered.filter(e => e.is_active);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(e => !e.is_active);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "duration") {
        return a.duration - b.duration;
      } else if (sortBy === "bookings") {
        const aCount = bookingCounts?.[a.id] || 0;
        const bCount = bookingCounts?.[b.id] || 0;
        return bCount - aCount; // Descending by bookings
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    return filtered;
  }, [events, filterStatus, sortBy, bookingCounts]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (!events) return { 
      total: 0, 
      active: 0, 
      totalBookings: 0,
      avgBookingsPerEvent: 0,
      mostBooked: null,
      conversionRate: 0,
      totalRevenue: 0
    };

    const total = events.length;
    const active = events.filter(e => e.is_active).length;
    const totalBookings = Object.values(bookingCounts || {}).reduce((sum, count) => sum + count, 0);
    const avgBookingsPerEvent = total > 0 ? (totalBookings / total).toFixed(1) : 0;
    
    // Find most booked event
    let mostBooked = null;
    let maxBookings = 0;
    events.forEach(event => {
      const count = bookingCounts?.[event.id] || 0;
      if (count > maxBookings) {
        maxBookings = count;
        mostBooked = event.title;
      }
    });

    // Calculate total revenue from paid bookings
    const totalRevenue = events.reduce((sum, event) => {
      const count = bookingCounts?.[event.id] || 0;
      const price = (event.price_cents || 0) / 100;
      return sum + (count * price);
    }, 0);

    return {
      total,
      active,
      totalBookings,
      avgBookingsPerEvent,
      mostBooked: mostBooked || 'None yet',
      conversionRate: active > 0 ? Math.round((totalBookings / active) * 10) / 10 : 0,
      totalRevenue
    };
  }, [events, bookingCounts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setPriceInput("0");
    setShowAdvanced(false);
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
    });
    setPriceInput(price.toFixed(2));
    setShowAdvanced(false);
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
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
        toast({ title: "Event type updated" });
      } else {
        await createMutation.mutateAsync({ ...form, user_id: user!.id });
        toast({ title: "Event type created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Event type deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (e: EventType) => {
    await updateMutation.mutateAsync({ id: e.id, is_active: !e.is_active });
  };

  const copyLink = (slug: string) => {
    if (!userId) {
      toast({ title: "Error", description: "User ID not found", variant: "destructive" });
      return;
    }
    const url = `${window.location.origin}/${userId}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  };

  const duplicateEvent = async (e: EventType) => {
    await createMutation.mutateAsync({
      title: `${e.title} (Copy)`,
      slug: `${e.slug}-copy`,
      description: e.description,
      duration: e.duration,
      location_type: e.location_type,
      location_details: e.location_details,
      color: e.color,
      buffer_before: e.buffer_before,
      buffer_after: e.buffer_after,
      price_cents: e.price_cents,
      currency: e.currency,
      user_id: user!.id,
      is_active: false,
    });
    toast({ title: "Event duplicated" });
  };

  const handlePriceChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPriceInput(value);
      if (value === "") {
        setForm(f => ({ ...f, price_cents: 0 }));
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setForm(f => ({ ...f, price_cents: Math.round(numValue * 100) }));
        }
      }
    }
  };

  const handlePriceBlur = () => {
    if (priceInput === "" || priceInput === ".") {
      setPriceInput("0");
      setForm(f => ({ ...f, price_cents: 0 }));
    } else {
      const numValue = parseFloat(priceInput);
      if (!isNaN(numValue)) {
        setPriceInput(numValue.toFixed(2));
      }
    }
  };

  // Table View Component
  const TableView = () => (
    <div className="rounded-lg border bg-card overflow-hidden w-full">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[250px]">
              <button 
                onClick={() => setSortBy("title")}
                className="flex items-center gap-1 text-xs font-medium hover:text-primary transition-colors"
              >
                Event
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="w-[100px]">
              <button 
                onClick={() => setSortBy("duration")}
                className="flex items-center gap-1 text-xs font-medium hover:text-primary transition-colors"
              >
                Duration
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="w-[120px]">Location</TableHead>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px]">
              <button 
                onClick={() => setSortBy("bookings")}
                className="flex items-center gap-1 text-xs font-medium hover:text-primary transition-colors"
              >
                Bookings
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => {
            const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
            const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
            const bookingCount = bookingCounts?.[event.id] || 0;
            
            return (
              <TableRow key={event.id} className={cn(!event.is_active && "opacity-60")}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: event.color }} />
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">/{event.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.duration}min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <LocationIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs capitalize">
                      {event.location_type === "in_person" ? "In person" : event.location_type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {(event.price_cents ?? 0) > 0 ? (
                    <span className="text-xs font-medium">
                      {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Free</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      event.is_active ? "bg-green-500" : "bg-gray-300"
                    )} />
                    <span className="text-xs">
                      {event.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={bookingCount > 0 ? "default" : "secondary"} className="text-xs">
                    {bookingCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(event.slug)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Copy link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => openEdit(event)} className="text-xs">
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateEvent(event)} className="text-xs">
                          <Sparkles className="h-3.5 w-3.5 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => toggleActive(event)} 
                          className="text-xs"
                        >
                          {event.is_active ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 mr-2" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 mr-2" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(event.id)} 
                          className="text-xs text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="rounded-md border overflow-hidden w-full">
      {/* Header Section */}
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  <span>Event Types</span>
                </div>
                <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Manage your events
                </h1>
                <p className="text-sm text-white/80 max-w-xl">
                  Create and customize how people can book time with you
                </p>
                {userId && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-white/60 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Fingerprint className="h-3 w-3" />
                    <span>ID: {truncateUserId(userId)}</span>
                  </div>
                )}
              </div>
              <Button 
                onClick={openCreate} 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create event</span>
              </Button>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <StatsCard 
                icon={Calendar}
                label="Total Events"
                value={stats.total}
                color="primary"
              />
              <StatsCard 
                icon={CheckCircle2}
                label="Active"
                value={stats.active}
                color="green"
              />
              <StatsCard 
                icon={Users}
                label="Total Bookings"
                value={stats.totalBookings}
                trend={stats.totalBookings > 0 ? `${stats.avgBookingsPerEvent} per event` : undefined}
                color="blue"
              />
              <StatsCard 
                icon={DollarSign}
                label="Est. Revenue"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(stats.totalRevenue)}
                color="amber"
              />
            </div>

            {/* Performance Insights */}
            {stats.totalBookings > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-white/60" />
                      <p className="text-xs text-white/60">Most popular event</p>
                    </div>
                    <p className="text-base font-semibold text-white">{stats.mostBooked}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={75} className="h-1.5 bg-white/20" indicatorClassName="bg-white" />
                      <span className="text-xs text-white/60">75% of bookings</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-white/60" />
                      <p className="text-xs text-white/60">Conversion rate</p>
                    </div>
                    <p className="text-base font-semibold text-white">{stats.conversionRate} bookings/active event</p>
                    <p className="text-xs text-white/60 mt-2">
                      {stats.active} active events · {stats.totalBookings} total bookings
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(v) => setFilterStatus(v as any)}>
              <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
                <TabsTrigger value="all" className="text-xs">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs">Inactive ({stats.total - stats.active})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("table")}
                disabled={isMobile}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        {/* Quick Tips */}
        {showTips && events && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Quick tips for great event types</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowTips(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <InstructionCard 
                icon={Pencil}
                title="Clear titles work best"
                desc="Make it obvious what the meeting is for"
              />
              <InstructionCard 
                icon={Clock}
                title="Choose the right duration"
                desc="30min for quick calls, 60min for deep talks"
              />
              <InstructionCard 
                icon={MapPin}
                title="Add location details"
                desc="Include links, addresses, or phone numbers"
              />
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {isLoading || countsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-muted rounded w-16" />
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="text-center py-12 sm:py-16">
            <CardContent className="space-y-4">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <Calendar className="h-12 w-12 text-primary/60 relative" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">No event types found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {filterStatus !== "all" 
                    ? `You don't have any ${filterStatus} event types.` 
                    : "Create your first event type to start accepting bookings."}
                </p>
              </div>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create your first event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "table" && !isMobile ? (
              <TableView />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => {
                  const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
                  const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
                  const bookingCount = bookingCounts?.[event.id] || 0;
                  
                  return (
                    <Card key={event.id} className={cn(
                      "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
                      !event.is_active && "opacity-70"
                    )}>
                      {/* Color strip */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1" 
                        style={{ backgroundColor: event.color }} 
                      />
                      
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="h-2 w-2 rounded-full shrink-0" 
                                style={{ backgroundColor: event.color }} 
                              />
                              <h3 className="font-semibold text-base truncate">{event.title}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              /{event.slug}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => copyLink(event.slug)} className="text-xs">
                                <Copy className="h-3.5 w-3.5 mr-2" /> Copy link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(event)} className="text-xs">
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateEvent(event)} className="text-xs">
                                <Sparkles className="h-3.5 w-3.5 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => toggleActive(event)} 
                                className="text-xs"
                              >
                                {event.is_active ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5 mr-2" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5 mr-2" /> Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(event.id)} 
                                className="text-xs text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                            <Clock className="h-3 w-3" /> {event.duration}min
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                            <LocationIcon className="h-3 w-3" /> 
                            {event.location_type === "in_person" ? "In person" : event.location_type}
                          </Badge>
                          {(event.price_cents ?? 0) > 0 && (
                            <Badge variant="secondary" className="gap-1 text-xs py-0.5 bg-amber-500/10">
                              <DollarSign className="h-3 w-3" /> 
                              {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                            </Badge>
                          )}
                        </div>

                        {/* Footer with Booking Count */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              event.is_active ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span className="text-xs text-muted-foreground">
                              {event.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant={bookingCount > 0 ? "default" : "outline"} 
                                  className={cn(
                                    "text-xs cursor-help",
                                    bookingCount > 0 && "bg-primary/10 text-primary border-primary/20"
                                  )}
                                >
                                  <Users className="h-3 w-3 mr-1" />
                                  {bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Total bookings for this event</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Popularity indicator */}
                        {bookingCount > 0 && stats.totalBookings > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ 
                                    width: `${(bookingCount / stats.totalBookings) * 100}%` 
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round((bookingCount / stats.totalBookings) * 100)}% of total
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Create Card */}
                <Card 
                  onClick={openCreate} 
                  className="cursor-pointer border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <CardContent className="p-5 h-full flex flex-col items-center justify-center text-center min-h-[240px]">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Create new event</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">
                      Add another way for people to book with you
                    </p>
                    <Badge variant="outline" className="mt-3 text-[10px]">
                      {stats.total} total · {stats.active} active
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile ? "w-full max-w-full h-full max-h-full rounded-none" : "max-w-2xl"
        )}>
          {/* Fixed Header */}
          <div className="border-b px-6 py-4 flex items-center justify-between bg-background sticky top-0 z-50">
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-sm">{editingId ? "Edit event" : "Create new event"}</span>
              </DialogTitle>
            </DialogHeader>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: isMobile ? "calc(100vh - 140px)" : "calc(90vh - 140px)" }}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</span>
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
                      }}
                      placeholder="e.g., 30-minute Discovery Call"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose a clear, descriptive title that guests will understand
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">
                      URL Slug <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">
                        /
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                        placeholder="30-min-call"
                        className="h-10 rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground break-all bg-muted/30 p-2 rounded">
                      {window.location.origin}/{userId ? truncateUserId(userId) : 'user'}/{form.slug || 'event'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of what this meeting is about..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Meeting Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</span>
                  Meeting Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Duration</Label>
                      <Select value={String(form.duration)} onValueChange={(v) => setForm(f => ({ ...f, duration: Number(v) }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map(d => (
                            <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Location Type</Label>
                      <Select value={form.location_type} onValueChange={(v) => setForm(f => ({ ...f, location_type: v }))}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_OPTIONS.map(l => (
                            <SelectItem key={l.value} value={l.value}>
                              <div className="flex items-center gap-2">
                                <l.icon className={cn("h-4 w-4", l.color)} />
                                <span>{l.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Location Details</Label>
                    <Input
                      value={form.location_details}
                      onChange={(e) => setForm(f => ({ ...f, location_details: e.target.value }))}
                      placeholder="Add meeting link, address, or phone number"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-primary w-full justify-center py-2.5 border rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <Settings2 className="h-4 w-4" />
                  {showAdvanced ? "Hide" : "Show"} advanced options
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Buffer before (minutes)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={form.buffer_before}
                          onChange={(e) => setForm(f => ({ ...f, buffer_before: Number(e.target.value) }))}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Buffer after (minutes)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={form.buffer_after}
                          onChange={(e) => setForm(f => ({ ...f, buffer_after: Number(e.target.value) }))}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            value={priceInput}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            onBlur={handlePriceBlur}
                            className="pl-9 h-10"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Currency</Label>
                        <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <span className="mr-2">{c.flag}</span>
                                <span>{c.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Appearance */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">3</span>
                  Appearance & Status
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Color theme</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c.value}
                          className={cn(
                            "h-8 w-8 rounded-full transition-all hover:scale-110",
                            form.color === c.value && "ring-2 ring-primary ring-offset-2"
                          )}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setForm(f => ({ ...f, color: c.value }))}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Event status</Label>
                    <div className="flex items-center gap-3 h-10 px-3 rounded-lg border">
                      <Switch 
                        checked={form.is_active} 
                        onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                        className="data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {form.is_active ? "Active" : "Inactive"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {form.is_active 
                            ? "Guests can book this event" 
                            : "This event is hidden from booking"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t px-6 py-4 bg-background flex gap-3 sticky bottom-0">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-10"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  Saving...
                </>
              ) : (
                editingId ? "Update Event" : "Create Event"
              )}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-10 px-6">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}