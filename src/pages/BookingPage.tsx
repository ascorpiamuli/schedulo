import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePublicEventTypeBySlug } from "@/hooks/use-event-types";
import { usePublicProfile } from "@/hooks/use-profiles";
import { usePublicAvailability } from "@/hooks/use-booking";
import { usePublicOverrides } from "@/hooks/use-booking";
import { useExistingBookings } from "@/hooks/use-booking";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, MapPin, DollarSign, 
  ArrowLeft, ArrowRight, Check, 
  User, Mail, FileText, Video, Phone, Building2,
  Loader2, CheckCircle2, XCircle, CalendarOff,
  Sparkles, Users, ChevronLeft, Award, Shield,
  Zap, Globe, Coffee, Sun, Moon
} from "lucide-react";
import { format, addMinutes, startOfDay, addDays, isSameDay, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Step = "datetime" | "form" | "confirmed";

// Helper functions
const getLocationIcon = (type: string) => {
  switch(type) {
    case 'video': return <Video className="h-4 w-4 sm:h-5 sm:w-5" />;
    case 'phone': return <Phone className="h-4 w-4 sm:h-5 sm:w-5" />;
    case 'in_person': return <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />;
    default: return <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />;
  }
};

const getLocationLabel = (type: string) => {
  switch(type) {
    case 'video': return 'Video Call';
    case 'phone': return 'Phone Call';
    case 'in_person': return 'In Person';
    default: return type;
  }
};

const formatTimeDisplay = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0);
  return format(date, 'h:mm a');
};

const formatDateDisplay = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMMM d");
};

// Time Slot Component
function TimeSlot({ time, selected, onClick, disabled = false }: { time: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-10 sm:h-11 text-xs sm:text-sm font-normal transition-all",
        selected 
          ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 scale-105" 
          : "hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:scale-105",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:scale-100"
      )}
    >
      {formatTimeDisplay(time)}
    </Button>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { username, eventSlug } = useParams<{ username: string; eventSlug: string }>();
  
  const { data: event, isLoading: eventLoading, error: eventError } = usePublicEventTypeBySlug(username, eventSlug);
  const { data: profile, isLoading: profileLoading } = usePublicProfile(username);
  const { data: availability, isLoading: availabilityLoading } = usePublicAvailability(username);
  const { data: overrides } = usePublicOverrides(username);
  
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("datetime");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: existingBookings } = useExistingBookings(username, dateStr);

  // Generate available dates
  const availableDates = useMemo(() => {
    if (!availability || !event) return [];
    
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    const sixtyDays = addDays(today, 60);
    
    let currentDate = today;
    while (currentDate <= sixtyDays) {
      const dayOfWeek = currentDate.getDay();
      const hasSlot = availability.some((a: any) => a.day_of_week === dayOfWeek);
      
      if (hasSlot) {
        const dateString = format(currentDate, "yyyy-MM-dd");
        const override = overrides?.find((o: any) => o.date === dateString);
        if (!override?.is_blocked) {
          dates.push(new Date(currentDate));
        }
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }, [availability, overrides, event]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    if (!selectedDate || !availability || !event) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const daySlots = availability.filter((a: any) => a.day_of_week === dayOfWeek);
    if (daySlots.length === 0) return [];

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const override = overrides?.find((o: any) => o.date === dateString);
    if (override?.is_blocked) return [];

    const slots: string[] = [];
    const duration = event.duration;
    const now = new Date();

    daySlots.forEach((slot: any) => {
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const [endH, endM] = slot.end_time.split(":").map(Number);
      
      let current = new Date(selectedDate);
      current.setHours(startH, startM, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(endH, endM, 0, 0);

      while (addMinutes(current, duration) <= end) {
        if (current > now) {
          const timeStr = format(current, "HH:mm");
          const slotEnd = addMinutes(current, duration);
          
          const conflict = existingBookings?.some((b: any) => {
            const bStart = new Date(b.start_time);
            const bEnd = new Date(b.end_time);
            return current < bEnd && slotEnd > bStart;
          });
          
          if (!conflict) {
            slots.push(timeStr);
          }
        }
        current = addMinutes(current, 30);
      }
    });

    return slots.sort();
  }, [selectedDate, availability, overrides, event, existingBookings]);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !event || !guestName || !guestEmail || !profile) return;

    setSubmitting(true);
    const [h, m] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);
    const endTime = addMinutes(startTime, event.duration);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          event_type_id: event.id,
          host_user_id: username,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_notes: guestNotes || null,
          guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: "confirmed",
          payment_status: (event.price_cents || 0) > 0 ? "pending" : "none",
          payment_amount_cents: event.price_cents || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            type: "confirmation",
            booking: {
              id: data.id,
              guest_name: guestName,
              guest_email: guestEmail,
              host_user_id: username,
              host_email: profile.email,
              event_title: event.title,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              duration: event.duration,
              location_type: event.location_type,
              guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          }
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }

      setStep("confirmed");
    } catch (err: any) {
      toast({ 
        title: "Booking failed", 
        description: err.message || "Something went wrong", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = eventLoading || profileLoading || availabilityLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-4">
              <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Preparing your booking experience...</p>
        </div>
      </div>
    );
  }

  if (eventError || !event || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="py-12 sm:py-16 text-center px-4 sm:px-6">
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-3xl" />
              <div className="relative bg-destructive/10 rounded-full p-4">
                <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] mb-3">Event Not Found</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-sm mx-auto">
              This booking link doesn't exist or is no longer available.
            </p>
            <Button asChild size="lg" className="px-8 w-full sm:w-auto">
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with powered by */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-1.5 sm:p-2 rounded-lg shadow-lg">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-semibold text-sm sm:text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PasbestTalks
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full border shadow-sm">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
            <span>Powered by <span className="font-semibold text-primary">Pasbest Ventures</span></span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-xl sm:rounded-2xl">
                <div className="flex flex-col lg:flex-row">
                  {/* Left column - Event details */}
                  <div className="lg:w-96 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent border-b lg:border-b-0 lg:border-r">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Host info */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-4 border-white dark:border-slate-800 shadow-xl">
                          <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-xl">
                            {profile.full_name?.[0] || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Hosted by</p>
                          <p className="font-semibold text-sm sm:text-lg">{profile.full_name || 'Host'}</p>
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="truncate max-w-[150px] sm:max-w-none">{profile.email}</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-primary/10" />

                      {/* Event title */}
                      <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {event.title}
                        </h1>
                        {event.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {/* Event details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Duration</p>
                            <p className="text-xs sm:text-sm font-medium">{event.duration} minutes</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
                            {getLocationIcon(event.location_type)}
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Location</p>
                            <p className="text-xs sm:text-sm font-medium">{getLocationLabel(event.location_type)}</p>
                          </div>
                        </div>

                        {(event.price_cents || 0) > 0 && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-amber-500/10">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/20 text-amber-600">
                              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-amber-600/80">Price</p>
                              <p className="text-xs sm:text-sm font-medium text-amber-600">
                                ${(event.price_cents / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {event.location_details && (
                        <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/10">
                          <p className="text-[10px] sm:text-xs text-primary font-medium mb-1 sm:mb-2">📍 Location Details</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{event.location_details}</p>
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-2">
                        <FeatureCard
                          icon={Shield}
                          title="Secure Booking"
                          description="Your information is protected"
                        />
                        <FeatureCard
                          icon={Zap}
                          title="Instant Confirmation"
                          description="Get confirmation immediately"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right column - Date & Time selection */}
                  <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {availableDates.length === 0 ? (
                      <div className="text-center py-12 sm:py-16">
                        <div className="relative mx-auto w-fit mb-4 sm:mb-6">
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                          <div className="relative bg-primary/10 rounded-full p-3 sm:p-4">
                            <CalendarOff className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-xl font-semibold mb-2">No available dates</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto px-4">
                          This host hasn't set their availability yet. Check back later!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 sm:space-y-8">
                        {/* Calendar */}
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Select a Date
                          </h3>
                          <div className="flex justify-center bg-gradient-to-br from-primary/5 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date);
                                setSelectedTime(undefined);
                              }}
                              month={month}
                              onMonthChange={setMonth}
                              disabled={(date) => !isDateAvailable(date)}
                              className="rounded-md scale-90 sm:scale-100"
                              classNames={{
                                months: "w-full",
                                month: "space-y-3 sm:space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-xs sm:text-sm font-semibold",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-primary/10 rounded-full transition-all",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-8 sm:w-10 font-medium text-[10px] sm:text-xs",
                                row: "flex w-full mt-1 sm:mt-2",
                                cell: "text-center text-xs sm:text-sm p-0 relative",
                                day: "h-7 w-7 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-full transition-all text-xs sm:text-sm",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold shadow-lg",
                                day_today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary/20",
                                day_disabled: "text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
                              <span className="text-muted-foreground">Available</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-muted-foreground/30" />
                              <span className="text-muted-foreground">Unavailable</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-accent ring-2 ring-primary/20" />
                              <span className="text-muted-foreground">Today</span>
                            </div>
                          </div>
                        </div>

                        {/* Time slots */}
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            {selectedDate ? (
                              <span className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span>Available Times for</span>
                                <span className="text-primary font-bold">{formatDateDisplay(selectedDate)}</span>
                              </span>
                            ) : (
                              "Select a Date First"
                            )}
                          </h3>
                          
                          {selectedDate ? (
                            <div className="border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-primary/5 to-transparent">
                              {timeSlots.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                  <div className="bg-background rounded-full p-2 sm:p-3 w-fit mx-auto mb-3 sm:mb-4">
                                    <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-muted-foreground" />
                                  </div>
                                  <p className="font-medium text-sm sm:text-base mb-1">No available times</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    This day is fully booked. Please select another date.
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                                    <Badge variant="outline" className="bg-background text-xs">
                                      {timeSlots.length} slot{timeSlots.length > 1 ? 's' : ''} available
                                    </Badge>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                      {event.duration} min meeting
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1 sm:pr-2">
                                    {timeSlots.map((time) => (
                                      <TimeSlot
                                        key={time}
                                        time={time}
                                        selected={selectedTime === time}
                                        onClick={() => setSelectedTime(time)}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="border rounded-lg sm:rounded-xl p-8 sm:p-12 text-center bg-gradient-to-br from-primary/5 to-transparent">
                              <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary/30 mx-auto mb-3 sm:mb-4" />
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Pick a date from the calendar to see available time slots
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Next button */}
                        {selectedDate && selectedTime && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end pt-2 sm:pt-4"
                          >
                            <Button 
                              onClick={() => setStep("form")}
                              size="lg"
                              className="gap-2 sm:gap-3 px-6 sm:px-10 h-10 sm:h-12 text-sm sm:text-base w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                            >
                              Next
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white dark:border-slate-800 shadow-lg">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-base">
                          {profile.full_name?.[0] || 'H'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Booking with</p>
                        <p className="font-semibold text-sm sm:text-lg">{profile.full_name || 'Host'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("datetime")}
                      className="gap-1 sm:gap-2 hover:bg-primary/10 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      Back
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* Booking summary */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-primary/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Date</p>
                        <p className="font-semibold text-sm sm:text-lg">{format(selectedDate!, "EEE, MMM d")}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Time</p>
                        <p className="font-semibold text-sm sm:text-lg">{formatTimeDisplay(selectedTime!)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-semibold text-sm sm:text-lg">{event.duration} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Your name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Email address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="notes" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        Additional notes (optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="Anything you'd like to share before the meeting"
                        rows={3}
                        className="resize-none text-sm sm:text-base border-2 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Confirm button */}
                  <Button
                    onClick={handleBook}
                    size="lg"
                    className="w-full h-10 sm:h-12 text-sm sm:text-base gap-2 shadow-lg hover:shadow-xl transition-all"
                    disabled={!guestName || !guestEmail || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Booking your meeting...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                    By booking, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="h-1.5 sm:h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                  <div className="relative mx-auto w-fit mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3 sm:p-4 shadow-xl">
                      <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] mb-2 sm:mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Booking Confirmed!
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
                    A confirmation has been sent to <strong className="text-foreground break-all">{guestEmail}</strong>
                  </p>

                  <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-lg sm:rounded-xl p-4 sm:p-6 text-left space-y-3 sm:space-y-4 mb-6 sm:mb-8 border">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm pb-2 sm:pb-3 border-b border-primary/10">
                      <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <span className="font-semibold">{event.title}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                        <span className="text-xs sm:text-sm">{format(selectedDate!, "EEE, MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                        <span className="text-xs sm:text-sm">{formatTimeDisplay(selectedTime!)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLocationIcon(event.location_type)}
                        <span className="text-xs sm:text-sm">{getLocationLabel(event.location_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                        <span className="text-xs sm:text-sm">{profile.full_name || 'Host'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button variant="outline" asChild className="flex-1 h-10 sm:h-11 text-xs sm:text-base">
                      <Link to={`/${username}`}>
                        New Booking
                      </Link>
                    </Button>
                    <Button asChild className="flex-1 h-10 sm:h-11 text-xs sm:text-base bg-gradient-to-r from-primary to-primary/90">
                      <Link to="/">
                        Done
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}