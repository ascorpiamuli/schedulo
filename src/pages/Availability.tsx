import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAvailability,
  useAvailabilityOverrides,
  useSaveAvailability,
  useCreateOverride,
  useDeleteOverride,
  DAYS,
} from "@/hooks/use-availability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Plus, 
  Trash2, 
  CalendarOff, 
  Save, 
  Check, 
  AlertCircle,
  Sparkles,
  Zap,
  Copy,
  Settings2,
  Coffee,
  Sun,
  Moon,
  Timer,
  RefreshCw,
  CalendarDays,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Generate time options in 30-min increments
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function getTimeIcon(time: string) {
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return <Sun className="h-3 w-3 text-amber-500" />;
  if (hour < 17) return <Sun className="h-3 w-3 text-orange-500" />;
  return <Moon className="h-3 w-3 text-blue-500" />;
}

interface DaySlot {
  enabled: boolean;
  ranges: { start: string; end: string }[];
}

type WeekSchedule = DaySlot[];

const DEFAULT_SCHEDULE: WeekSchedule = DAYS.map((_, i) => ({
  enabled: i >= 1 && i <= 5,
  ranges: i >= 1 && i <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
}));

const PRESETS = [
  { name: "Standard", icon: Clock, schedule: DAYS.map((_, i) => i >= 1 && i <= 5) },
  { name: "Full week", icon: CalendarDays, schedule: DAYS.map(() => true) },
  { name: "Weekends", icon: Coffee, schedule: DAYS.map((_, i) => i === 0 || i === 6) },
  { name: "Custom", icon: Settings2, schedule: DAYS.map(() => false) },
];

export default function Availability() {
  const { data: slots, isLoading } = useAvailability();
  const { data: overrides } = useAvailabilityOverrides();
  const saveMutation = useSaveAvailability();
  const createOverride = useCreateOverride();
  const deleteOverride = useDeleteOverride();
  const { toast } = useToast();

  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [dirty, setDirty] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [overrideReason, setOverrideReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Standard");
  const [showTimeTips, setShowTimeTips] = useState(true);

  // Load existing availability into state
  useEffect(() => {
    if (slots && slots.length > 0) {
      const newSchedule: WeekSchedule = DAYS.map(() => ({ enabled: false, ranges: [] }));
      slots.forEach((s) => {
        newSchedule[s.day_of_week].enabled = true;
        newSchedule[s.day_of_week].ranges.push({
          start: s.start_time.substring(0, 5),
          end: s.end_time.substring(0, 5),
        });
      });
      setSchedule(newSchedule);
      setDirty(false);
    }
  }, [slots]);

  const toggleDay = (day: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[day] = {
        enabled: !copy[day].enabled,
        ranges: !copy[day].enabled ? [{ start: "09:00", end: "17:00" }] : [],
      };
      return copy;
    });
    setDirty(true);
  };

  const updateRange = (day: number, idx: number, field: "start" | "end", value: string) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[day] = {
        ...copy[day],
        ranges: copy[day].ranges.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
      };
      return copy;
    });
    setDirty(true);
  };

  const addRange = (day: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      const lastEnd = copy[day].ranges.at(-1)?.end || "09:00";
      const nextStart = lastEnd;
      const nextEnd = TIME_OPTIONS.find(t => t > nextStart) || "17:00";
      copy[day] = { 
        ...copy[day], 
        ranges: [...copy[day].ranges, { start: nextStart, end: nextEnd }] 
      };
      return copy;
    });
    setDirty(true);
  };

  const removeRange = (day: number, idx: number) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[day] = { ...copy[day], ranges: copy[day].ranges.filter((_, i) => i !== idx) };
      if (copy[day].ranges.length === 0) copy[day].enabled = false;
      return copy;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    const flatSlots = schedule.flatMap((day, dayIdx) =>
      day.enabled
        ? day.ranges.map((r) => ({ day_of_week: dayIdx, start_time: r.start, end_time: r.end }))
        : []
    );
    try {
      await saveMutation.mutateAsync(flatSlots);
      setDirty(false);
      toast({ 
        title: "Availability saved!", 
        description: "Your schedule has been updated.",
        icon: <Check className="h-4 w-4" />
      });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const handleAddOverride = async () => {
    if (!selectedDate) return;
    try {
      await createOverride.mutateAsync({
        date: format(selectedDate, "yyyy-MM-dd"),
        is_blocked: true,
        start_time: null,
        end_time: null,
        reason: overrideReason || null,
      });
      toast({ 
        title: "Date blocked", 
        description: overrideReason || "This date is now unavailable.",
        icon: <CalendarOff className="h-4 w-4" />
      });
      setOverrideDialogOpen(false);
      setSelectedDate(undefined);
      setOverrideReason("");
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.name);
    const newSchedule: WeekSchedule = DAYS.map((_, i) => ({
      enabled: preset.schedule[i],
      ranges: preset.schedule[i] ? [{ start: "09:00", end: "17:00" }] : [],
    }));
    setSchedule(newSchedule);
    setDirty(true);
  };

  const copyScheduleLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/availability`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard" });
  };

  const getTotalWeeklyHours = () => {
    return schedule.reduce((total, day) => {
      if (!day.enabled) return total;
      return total + day.ranges.reduce((dayTotal, range) => {
        const start = parseInt(range.start.split(":")[0]) + parseInt(range.start.split(":")[1]) / 60;
        const end = parseInt(range.end.split(":")[0]) + parseInt(range.end.split(":")[1]) / 60;
        return dayTotal + (end - start);
      }, 0);
    }, 0).toFixed(1);
  };

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 pb-24 lg:pb-6">
      {/* Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 lg:p-6 border border-primary/10"
      >
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 h-40 w-40 animate-pulse-slow rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-56 w-56 animate-pulse-slower rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-primary backdrop-blur-sm border border-primary/20"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Availability Settings
              </motion.div>
              
              <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                When are you available?
              </h1>
              
              <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                Set your regular weekly hours and block specific dates for holidays or time off.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={copyScheduleLink}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
              </Button>
              
              <Button 
                onClick={handleSave} 
                disabled={!dirty || saveMutation.isPending}
                className="gap-1.5 bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg text-xs sm:text-sm h-9"
              >
                {saveMutation.isPending ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>{saveMutation.isPending ? "Saving..." : "Save changes"}</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Weekly hours</p>
                <p className="text-xs font-semibold">{getTotalWeeklyHours()}h</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2 backdrop-blur-sm">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Available days</p>
                <p className="text-xs font-semibold">{schedule.filter(d => d.enabled).length}/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2 backdrop-blur-sm">
              <CalendarOff className="h-3.5 w-3.5 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Overrides</p>
                <p className="text-xs font-semibold">{overrides?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">Status</p>
                <p className="text-xs font-semibold text-emerald-600">Active</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Presets */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold">Quick templates</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Timer className="h-3 w-3" />
                  Presets
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Apply pre-configured schedules</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => applyPreset(preset)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg p-2.5 transition-all",
                activePreset === preset.name
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              <preset.icon className={cn(
                "h-4 w-4",
                activePreset === preset.name && "text-white"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                activePreset === preset.name && "text-white"
              )}>
                {preset.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Weekly schedule */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
          
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold">
                Weekly hours
              </CardTitle>
              {dirty && (
                <Badge variant="outline" className="ml-2 text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">
                  Unsaved
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-5 pt-2">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {DAYS.map((day, i) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex flex-col gap-3 pb-4 border-b last:border-0 last:pb-0",
                      i === DAYS.length - 1 ? "border-0" : "border-border/50"
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3 w-full sm:w-32">
                        <Switch 
                          checked={schedule[i].enabled} 
                          onCheckedChange={() => toggleDay(i)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className={cn(
                          "text-xs sm:text-sm font-medium flex-1",
                          schedule[i].enabled ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {day}
                        </span>
                      </div>
                      
                      {schedule[i].enabled ? (
                        <div className="flex-1 flex flex-col gap-2">
                          <AnimatePresence mode="popLayout">
                            {schedule[i].ranges.map((r, rIdx) => (
                              <motion.div
                                key={rIdx}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col xs:flex-row items-start xs:items-center gap-2 bg-muted/30 p-2 rounded-lg"
                              >
                                <div className="flex items-center gap-2 w-full xs:w-auto">
                                  {getTimeIcon(r.start)}
                                  <Select 
                                    value={r.start} 
                                    onValueChange={(v) => updateRange(i, rIdx, "start", v)}
                                  >
                                    <SelectTrigger className="w-full xs:w-24 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIME_OPTIONS.map((t) => (
                                        <SelectItem key={t} value={t} className="text-xs">
                                          {formatTime(t)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <span className="text-xs text-muted-foreground hidden xs:inline">→</span>
                                
                                <div className="flex items-center gap-2 w-full xs:w-auto">
                                  {getTimeIcon(r.end)}
                                  <Select 
                                    value={r.end} 
                                    onValueChange={(v) => updateRange(i, rIdx, "end", v)}
                                  >
                                    <SelectTrigger className="w-full xs:w-24 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIME_OPTIONS.map((t) => (
                                        <SelectItem key={t} value={t} className="text-xs">
                                          {formatTime(t)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 shrink-0 ml-auto xs:ml-0"
                                  onClick={() => removeRange(i, rIdx)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-fit gap-1.5 text-xs h-7 mt-1"
                            onClick={() => addRange(i)}
                          >
                            <Plus className="h-3 w-3" /> 
                            <span>Add time</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarOff className="h-3.5 w-3.5" />
                          <span>Unavailable</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Time range summary - Mobile */}
                    {schedule[i].enabled && schedule[i].ranges.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-9 sm:hidden">
                        {schedule[i].ranges.map((r, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[8px] px-1.5 py-0">
                            {formatTime(r.start)} - {formatTime(r.end)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Date overrides - FIXED */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute left-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent rounded-br-full" />
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <CalendarOff className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold">
                Date overrides
              </CardTitle>
              {overrides && overrides.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {overrides.length}
                </Badge>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-8 text-xs"
              onClick={() => setOverrideDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> 
              <span className="hidden xs:inline">Block date</span>
              <span className="xs:hidden">Block</span>
            </Button>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-5 pt-2">
            {!overrides || overrides.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 sm:py-10 text-center"
              >
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                  <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-3 sm:p-4">
                    <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60" />
                  </div>
                </div>
                <h3 className="font-['Space_Grotesk'] text-xs sm:text-sm font-semibold">
                  No blocked dates
                </h3>
                <p className="mt-1 max-w-xs text-[10px] sm:text-xs text-muted-foreground px-4">
                  Block specific dates for holidays, time off, or special events.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 gap-1.5 text-xs h-8"
                  onClick={() => setOverrideDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Block a date
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {overrides.map((o, index) => (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 backdrop-blur-sm hover:bg-muted/30 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-rose-500/10 p-1.5 shrink-0">
                            <CalendarOff className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">
                              {format(new Date(o.date + "T00:00:00"), "EEE, MMM d, yyyy")}
                            </p>
                            {o.reason && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-[250px] mt-0.5">
                                {o.reason}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-rose-600">
                                <CalendarOff className="h-2.5 w-2.5" />
                                Blocked
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                          onClick={() => deleteOverride.mutate(o.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Block date dialog - FIXED calendar size */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl p-4 sm:p-6">
          <DialogHeader className="space-y-2 pb-2">
            <DialogTitle className="font-['Space_Grotesk'] text-lg sm:text-xl flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <CalendarOff className="h-4 w-4 text-primary" />
              </div>
              Block a date
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg border border-border/50 bg-background p-2"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-8 w-8 sm:h-9 sm:w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                  day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs sm:text-sm">Reason (optional)</Label>
              <div className="relative">
                <Input
                  id="reason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Holiday, vacation, conference"
                  className="pl-8 text-xs sm:text-sm h-9 sm:h-10"
                />
                <AlertCircle className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                This helps you remember why this date is blocked
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button 
                onClick={handleAddOverride} 
                className="flex-1 gap-1.5 text-xs sm:text-sm h-9 sm:h-10"
                disabled={!selectedDate || createOverride.isPending}
              >
                {createOverride.isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CalendarOff className="h-4 w-4" />
                    Block this date
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOverrideDialogOpen(false)}
                className="h-9 sm:h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tips & Insights */}
      {showTimeTips && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="hidden sm:block"
        >
          <Card className="border-0 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent shadow-lg">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-xs sm:text-sm font-semibold">
                      Availability tips
                    </h3>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground max-w-md">
                      {schedule.filter(d => d.enabled).length === 0 
                        ? "You haven't set any availability yet. Start by enabling some days above."
                        : getTotalWeeklyHours() > 40
                        ? "You're available for over 40 hours per week. Consider taking breaks between meetings."
                        : getTotalWeeklyHours() < 20
                        ? "Try adding more availability to get more bookings."
                        : "Your schedule looks balanced. Good job!"}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1 text-[10px] sm:text-xs"
                  onClick={() => setShowTimeTips(false)}
                >
                  Hide
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mobile Save Bar */}
      {dirty && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl p-4 shadow-lg lg:hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Unsaved changes</p>
              <p className="text-[10px] text-muted-foreground">Your availability hasn't been saved</p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              size="sm"
              className="gap-1.5"
            >
              {saveMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}