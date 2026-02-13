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
  Fingerprint
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

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

export default function EventTypes() {
  const { user } = useAuth();
  const { data: events, isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceInput, setPriceInput] = useState<string>("0");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);

  // Use user.id as the identifier
  const userId = user?.id;

  const stats = useMemo(() => {
    if (!events) return { total: 0, active: 0, totalBookings: 0 };
    return {
      total: events.length,
      active: events.filter(e => e.is_active).length,
      totalBookings: events.reduce((acc, e) => acc + (e._count?.bookings || 0), 0),
    };
  }, [events]);

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
    // Use user ID in the URL
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

  return (
    <div className="min-w-0 w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8 px-3 sm:px-4">
      {/* Header - Compact on mobile */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 border border-primary/10">
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                <span>Event Types</span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl md:text-3xl font-bold">
                Your booking types
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Create ways for people to book time with you
              </p>
              {/* Show truncated user ID */}
              {userId && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full w-fit">
                  <Fingerprint className="h-3 w-3" />
                  <span>ID: {truncateUserId(userId)}</span>
                </div>
              )}
            </div>
            <Button 
              onClick={openCreate} 
              size={isMobile ? "default" : "lg"}
              className="gap-2 w-full sm:w-auto mt-2 sm:mt-0"
            >
              <Plus className="h-4 w-4" />
              <span>{isMobile ? "Create" : "Create event"}</span>
            </Button>
          </div>

          {/* Stats - Always visible without scroll */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg sm:text-xl font-bold font-['Space_Grotesk']">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg sm:text-xl font-bold font-['Space_Grotesk']">{stats.active}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-muted-foreground">Bookings</p>
                <p className="text-lg sm:text-xl font-bold font-['Space_Grotesk']">{stats.totalBookings}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Tips - Collapsible, mobile friendly */}
      {showTips && events && events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-primary/5 border p-3 sm:p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Quick tips</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowTips(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <InstructionCard 
              icon={Pencil}
              title="Clear title"
              desc="Make it obvious what the meeting is for"
            />
            <InstructionCard 
              icon={Clock}
              title="Right duration"
              desc="30min for quick calls, 60min for deep talks"
            />
            <InstructionCard 
              icon={MapPin}
              title="Location details"
              desc="Add specific joining instructions"
            />
          </div>
        </motion.div>
      )}

      {/* Main Content - No horizontal scroll */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent className="space-y-4">
            <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold">No event types yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Create your first event to start accepting bookings
              </p>
            </div>
            <Button onClick={openCreate} size="sm" className="gap-2">
              <Plus className="h-3 w-3" />
              Create your first event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {events?.map((event) => {
            const LocationIcon = LOCATION_OPTIONS.find(l => l.value === event.location_type)?.icon || MapPin;
            const currency = CURRENCY_OPTIONS.find(c => c.value === event.currency);
            
            return (
              <Card key={event.id} className={cn("relative", !event.is_active && "opacity-70")}>
                <div className="h-1 rounded-t-lg" style={{ backgroundColor: event.color }} />
                <CardContent className="p-3 sm:p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{event.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">/{event.slug}</p>
                    </div>
                    {isMobile ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === event.id ? null : event.id)}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => copyLink(event.slug)} className="text-xs">
                            <Copy className="h-3 w-3 mr-2" /> Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(event)} className="text-xs">
                            <Pencil className="h-3 w-3 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateEvent(event)} className="text-xs">
                            <Sparkles className="h-3 w-3 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-xs text-destructive">
                            <Trash2 className="h-3 w-3 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                  )}

                  {/* Details - Compact */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge variant="secondary" className="gap-1 text-[10px] py-0 px-1.5">
                      <Clock className="h-2.5 w-2.5" /> {event.duration}min
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-[10px] py-0 px-1.5">
                      <LocationIcon className="h-2.5 w-2.5" /> {event.location_type === "in_person" ? "In person" : event.location_type}
                    </Badge>
                    {(event.price_cents ?? 0) > 0 && (
                      <Badge variant="secondary" className="gap-1 text-[10px] py-0 px-1.5 bg-amber-500/10">
                        <DollarSign className="h-2.5 w-2.5" /> {currency?.symbol}{((event.price_cents ?? 0) / 100).toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {/* Mobile Menu */}
                  {isMobile && mobileMenuOpen === event.id && (
                    <div className="mt-2 pt-2 border-t space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => copyLink(event.slug)}>
                        <Copy className="h-3 w-3 mr-2" /> Copy link
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => openEdit(event)}>
                        <Pencil className="h-3 w-3 mr-2" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => duplicateEvent(event)}>
                        <Sparkles className="h-3 w-3 mr-2" /> Duplicate
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 text-destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                      </Button>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <div className="flex items-center gap-1.5">
                      <Switch 
                        checked={event.is_active} 
                        onCheckedChange={() => toggleActive(event)}
                        className="scale-75 data-[state=checked]:bg-primary"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {event.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {!isMobile && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyLink(event.slug)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Copy booking link</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Create Card */}
          <Card onClick={openCreate} className="cursor-pointer border-dashed hover:border-primary transition-colors">
            <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center min-h-[160px]">
              <Plus className="h-5 w-5 text-primary mb-2" />
              <h3 className="font-semibold text-sm">Create new event</h3>
              <p className="text-xs text-muted-foreground">Add another way to book</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Dialog - Mobile Optimized */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "p-0 gap-0 overflow-hidden",
          isMobile ? "w-full max-w-full h-full max-h-full rounded-none" : "max-w-2xl"
        )}>
          {/* Fixed Header */}
          <div className="border-b px-4 py-3 flex items-center justify-between bg-background sticky top-0 z-50">
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-sm">{editingId ? "Edit event" : "Create event"}</span>
              </DialogTitle>
            </DialogHeader>
            <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content - Mobile First */}
          <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: isMobile ? "calc(100vh - 120px)" : "calc(90vh - 120px)" }}>
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Step 1: Basic Info
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
                      }}
                      placeholder="e.g., 30-min call"
                      className="h-9 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Choose a clear, descriptive title</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">URL slug <span className="text-red-500">*</span></Label>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-2 rounded-l border border-r-0">/</span>
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                        placeholder="30-min-call"
                        className="h-9 rounded-l-none text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground break-all">
                      {window.location.origin}/{userId ? truncateUserId(userId) : 'user'}/{form.slug || 'event'}
                    </p>
                    <p className="text-[10px] text-muted-foreground text-primary">
                      Full URL will use your complete user ID
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Meeting Settings */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Step 2: Meeting Settings
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duration</Label>
                    <Select value={String(form.duration)} onValueChange={(v) => setForm(f => ({ ...f, duration: Number(v) }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map(d => (
                          <SelectItem key={d} value={String(d)} className="text-sm">{d} min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Location</Label>
                    <Select value={form.location_type} onValueChange={(v) => setForm(f => ({ ...f, location_type: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map(l => (
                          <SelectItem key={l.value} value={l.value}>
                            <div className="flex items-center gap-2">
                              <l.icon className={cn("h-3 w-3", l.color)} />
                              <span className="text-sm">{l.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Location details</Label>
                    <Input
                      value={form.location_details}
                      onChange={(e) => setForm(f => ({ ...f, location_details: e.target.value }))}
                      placeholder="Add link, address, or phone"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-primary w-full justify-center py-2 border rounded-lg"
                >
                  <Settings2 className="h-3 w-3" />
                  {showAdvanced ? "Hide" : "Show"} advanced options
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
                </button>

                {showAdvanced && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Buffer before</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.buffer_before}
                          onChange={(e) => setForm(f => ({ ...f, buffer_before: Number(e.target.value) }))}
                          className="h-9 text-sm"
                          placeholder="0 min"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Buffer after</Label>
                        <Input
                          type="number"
                          min={0}
                          value={form.buffer_after}
                          onChange={(e) => setForm(f => ({ ...f, buffer_after: Number(e.target.value) }))}
                          className="h-9 text-sm"
                          placeholder="0 min"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            value={priceInput}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            onBlur={handlePriceBlur}
                            className="pl-6 h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Currency</Label>
                        <Select value={form.currency} onValueChange={(v) => setForm(f => ({ ...f, currency: v }))}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <span className="mr-1">{c.flag}</span>
                                <span className="text-xs">{c.label}</span>
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
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Step 3: Appearance
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Color</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.slice(0, isMobile ? 4 : 8).map(c => (
                        <button
                          key={c.value}
                          className={cn(
                            "h-7 w-7 rounded-full transition-all",
                            form.color === c.value && "ring-2 ring-primary ring-offset-2"
                          )}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setForm(f => ({ ...f, color: c.value }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <div className="flex items-center gap-2 h-9 px-3 rounded-lg border">
                      <Switch 
                        checked={form.is_active} 
                        onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                        className="scale-75 data-[state=checked]:bg-primary"
                      />
                      <span className="text-xs">{form.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t px-4 py-3 bg-background flex gap-2 sticky bottom-0">
            <Button 
              onClick={handleSave} 
              className="flex-1 h-9 text-sm"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingId ? "Update" : "Create")}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9 text-sm px-4">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}