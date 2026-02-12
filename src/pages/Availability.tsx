import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Clock, Plus, Trash2, CalendarOff, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface DaySlot {
  enabled: boolean;
  ranges: { start: string; end: string }[];
}

type WeekSchedule = DaySlot[];

const DEFAULT_SCHEDULE: WeekSchedule = DAYS.map((_, i) => ({
  enabled: i >= 1 && i <= 5, // Mon-Fri
  ranges: i >= 1 && i <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
}));

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
      copy[day] = { ...copy[day], ranges: [...copy[day].ranges, { start: lastEnd, end: "17:00" }] };
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
      toast({ title: "Availability saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
      toast({ title: "Date blocked" });
      setOverrideDialogOpen(false);
      setSelectedDate(undefined);
      setOverrideReason("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">Availability</h1>
          <p className="text-muted-foreground mt-1">Set your weekly schedule and block specific dates.</p>
        </div>
        <Button onClick={handleSave} disabled={!dirty || saveMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Weekly schedule */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-['Space_Grotesk']">Weekly hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))
              : DAYS.map((day, i) => (
                  <div key={day} className="flex flex-col gap-2 sm:flex-row sm:items-center border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 w-32 shrink-0">
                      <Switch checked={schedule[i].enabled} onCheckedChange={() => toggleDay(i)} />
                      <span className="text-sm font-medium">{day}</span>
                    </div>
                    {schedule[i].enabled ? (
                      <div className="flex flex-col gap-2 flex-1">
                        {schedule[i].ranges.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-2">
                            <Select value={r.start} onValueChange={(v) => updateRange(i, rIdx, "start", v)}>
                              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((t) => (
                                  <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">–</span>
                            <Select value={r.end} onValueChange={(v) => updateRange(i, rIdx, "end", v)}>
                              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((t) => (
                                  <SelectItem key={t} value={t}>{formatTime(t)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRange(i, rIdx)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-fit gap-1 text-xs" onClick={() => addRange(i)}>
                          <Plus className="h-3 w-3" /> Add time range
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unavailable</span>
                    )}
                  </div>
                ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Date overrides */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-['Space_Grotesk']">Date overrides</CardTitle>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setOverrideDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Block date
            </Button>
          </CardHeader>
          <CardContent>
            {!overrides || overrides.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CalendarOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No date overrides set.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Block off holidays or specific dates when you're unavailable.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{format(new Date(o.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}</p>
                      {o.reason && <p className="text-xs text-muted-foreground">{o.reason}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive font-medium">Blocked</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteOverride.mutate(o.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Block date dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-['Space_Grotesk']">Block a date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className={cn("p-3 pointer-events-auto mx-auto")}
            />
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Holiday, vacation"
              />
            </div>
            <Button onClick={handleAddOverride} className="w-full" disabled={!selectedDate || createOverride.isPending}>
              {createOverride.isPending ? "Saving…" : "Block this date"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
