import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { sendBookingEmail } from "@/lib/emails";
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
  ArrowLeft, ArrowRight, Check, Globe, ChevronLeft, ChevronRight,
  User, Mail, FileText, CreditCard, Video, Phone, Building2,
  AlertCircle, Loader2, CheckCircle2, XCircle, CalendarOff,
  Clock3, Sparkles, Shield, Zap, Info, Coffee, Sun, Moon
} from "lucide-react";
import { format, addMinutes, startOfDay, addDays, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import PaymentStep from "@/components/booking/PaymentStep";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type Step = "events" | "datetime" | "form" | "payment" | "confirmed";

// Helper to truncate user ID for display
const truncateUserId = (id: string) => {
  if (!id) return '';
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

// Custom hook to fetch profile
const useProfile = (userId: string | undefined) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        setError(new Error("No user ID provided"));
        return;
      }

      try {
        setIsLoading(true);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError) throw profileError;

        setData(profile);
        setError(null);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { data, isLoading, error };
};

// Get event types for this user
const usePublicEventTypes = (userId: string | undefined) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventTypes = async () => {
      if (!userId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('event_types')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at');

        if (error) throw error;
        setData(data || []);
      } catch (err) {
        console.error("Event types fetch error:", err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventTypes();
  }, [userId]);

  return { data, isLoading };
};

// Get availability for this user
const usePublicAvailability = (userId: string | undefined) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('availability')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        setData(data || []);
      } catch (err) {
        console.error("Availability fetch error:", err);
        setData([]);
      }
    };

    fetchAvailability();
  }, [userId]);

  return { data };
};

// Get date overrides for this user
const usePublicOverrides = (userId: string | undefined) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchOverrides = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('availability_overrides')
          .select('*')
          .eq('user_id', userId)
          .gte('date', format(new Date(), 'yyyy-MM-dd'));

        if (error) throw error;
        setData(data || []);
      } catch (err) {
        console.error("Overrides fetch error:", err);
        setData([]);
      }
    };

    fetchOverrides();
  }, [userId]);

  return { data };
};

// Get existing bookings for a specific date
const useExistingBookings = (userId: string | undefined, dateStr: string | undefined) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId || !dateStr) return;

      try {
        const startOfDay = `${dateStr}T00:00:00`;
        const endOfDay = `${dateStr}T23:59:59`;

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('host_user_id', userId)
          .gte('start_time', startOfDay)
          .lte('start_time', endOfDay)
          .in('status', ['confirmed', 'pending']);

        if (error) throw error;
        setData(data || []);
      } catch (err) {
        console.error("Bookings fetch error:", err);
        setData([]);
      }
    };

    fetchBookings();
  }, [userId, dateStr]);

  return { data };
};

// Time slot component
function TimeSlot({ time, selected, onClick, disabled = false }: { time: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const display = `${h12}:${m} ${ampm}`;

  return (
    <Button
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-12 text-sm font-normal transition-all",
        selected ? "bg-primary text-primary-foreground shadow-md" : "hover:border-primary/50 hover:bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {display}
    </Button>
  );
}

// Event type card
function EventTypeCard({ event, onClick }: { event: any; onClick: () => void }) {
  const getLocationIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="h-3.5 w-3.5" />;
      case 'phone': return <Phone className="h-3.5 w-3.5" />;
      case 'in_person': return <Building2 className="h-3.5 w-3.5" />;
      default: return <MapPin className="h-3.5 w-3.5" />;
    }
  };

  const getLocationLabel = (type: string) => {
    switch(type) {
      case 'video': return 'Video call';
      case 'phone': return 'Phone call';
      case 'in_person': return 'In person';
      default: return type;
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/30 bg-gradient-to-br from-background to-muted/20"
      onClick={onClick}
    >
      <div className="h-2 w-full bg-gradient-to-r" style={{ 
        background: `linear-gradient(to right, ${event.color}, ${event.color}dd, ${event.color}aa)` 
      }} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {(event.price_cents || 0) > 0 && (
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 font-medium border-amber-500/20">
              ${(event.price_cents / 100).toFixed(2)}
            </Badge>
          )}
        </div>
        
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1 py-1 bg-background/50">
            <Clock className="h-3.5 w-3.5" />
            {event.duration} min
          </Badge>
          <Badge variant="outline" className="gap-1 py-1 bg-background/50">
            {getLocationIcon(event.location_type)}
            {getLocationLabel(event.location_type)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-4 inline-block">
          <Icon className="h-12 w-12 text-primary/60" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

export default function BookingPage() {
  const { username } = useParams<{ username: string }>(); // This is actually the user_id
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(username);
  const { data: eventTypes, isLoading: eventsLoading } = usePublicEventTypes(username);
  const { data: availability } = usePublicAvailability(username);
  const { data: overrides } = usePublicOverrides(username);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [step, setStep] = useState<Step>("events");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string>();
  const [month, setMonth] = useState<Date>(new Date());

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: existingBookings } = useExistingBookings(username, dateStr);

  // Get available dates for the calendar
  const availableDates = useMemo(() => {
    if (!availability) return [];
    
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
  }, [availability, overrides]);

  // Compute available time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !availability || !selectedEvent) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const daySlots = availability.filter((a: any) => a.day_of_week === dayOfWeek);
    if (daySlots.length === 0) return [];

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const override = overrides?.find((o: any) => o.date === dateString);
    if (override?.is_blocked) return [];

    const slots: string[] = [];
    const duration = selectedEvent.duration;
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
  }, [selectedDate, availability, overrides, selectedEvent, existingBookings]);

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setStep("datetime");
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep("form");
  };

const handleBook = async (paymentMethod?: string, transactionId?: string) => {
  if (!selectedDate || !selectedTime || !selectedEvent || !guestName || !guestEmail || !profile) return;

  setSubmitting(true);
  const [h, m] = selectedTime.split(":").map(Number);
  const startTime = new Date(selectedDate);
  startTime.setHours(h, m, 0, 0);
  const endTime = addMinutes(startTime, selectedEvent.duration);

  const isPaid = (selectedEvent.price_cents || 0) > 0;

  try {
    console.log('🔵 Starting booking creation process...');
    console.log('👤 Profile details:', {
      userId: profile.user_id,
      userEmail: profile.email,
      userName: profile.full_name
    });

    // Insert booking into database
    const insertData = {
      event_type_id: selectedEvent.id,
      host_user_id: profile.user_id,  // This is correct
      guest_name: guestName,
      guest_email: guestEmail,
      guest_notes: guestNotes || null,
      guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "confirmed",
      payment_status: isPaid ? "pending" : "none",
      payment_amount_cents: selectedEvent.price_cents || 0,
    };

    console.log('📦 Insert payload:', insertData);

    const { data, error } = await supabase
      .from("bookings")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Booking created:', data.id);
    setBookingId(data.id);
    setStep("confirmed");

    // Send confirmation email - FIXED PAYLOAD
    try {
      const emailPayload = {
        type: "confirmation",
        booking: {
          id: data.id,
          guest_name: guestName,
          guest_email: guestEmail,
          host_user_id: profile.user_id,  // ADD THIS - it's critical!
          host_email: profile.email,       // ADD THIS
          event_title: selectedEvent.title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: selectedEvent.duration,
          location_type: selectedEvent.location_type,
          guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };

      console.log('📨 Sending email with payload:', JSON.stringify(emailPayload, null, 2));

      const { error: emailError } = await supabase.functions.invoke(
        'send-booking-email',
        {
          body: emailPayload
        }
      );

      if (emailError) {
        console.error('❌ Edge function error:', emailError);
      } else {
        console.log('✅ Email sent successfully');
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

  } catch (err: any) {
    console.error('💥 Booking failed:', err);
    toast({ 
      title: "Booking failed", 
      description: err.message || "Something went wrong. Please try again.", 
      variant: "destructive" 
    });
  } finally {
    setSubmitting(false);
  }
};
  const handleProceedToPaymentOrBook = () => {
    if ((selectedEvent?.price_cents || 0) > 0) {
      setStep("payment");
    } else {
      handleBook();
    }
  };

  const formatTimeDisplay = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto relative" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full border-destructive/20 shadow-xl">
          <CardContent className="py-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-3xl" />
              <div className="relative bg-destructive/10 rounded-full p-4 inline-block">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The booking page you're looking for doesn't exist.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg shadow-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Pasbest Talks</span>
          </div>
          
          {step !== "events" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setStep("events");
                setSelectedDate(undefined);
                setSelectedTime(undefined);
                setSelectedEvent(null);
              }}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Event Types */}
          {step === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-3">Choose your meeting</h2>
                <p className="text-muted-foreground">
                  Select the type of meeting that works best for you
                </p>
              </div>

              {eventsLoading ? (
                <div className="flex justify-center py-20">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading available events...</p>
                  </div>
                </div>
              ) : eventTypes?.length === 0 ? (
                <EmptyState
                  icon={CalendarOff}
                  title="No Events Available"
                  description="This user hasn't set up any event types yet. Check back later!"
                  action={
                    <Button variant="outline" asChild className="gap-2">
                      <Link to="/">
                        Go Home
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {eventTypes?.map((event) => (
                    <EventTypeCard
                      key={event.id}
                      event={event}
                      onClick={() => handleSelectEvent(event)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === "datetime" && selectedEvent && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                {/* Event Summary */}
                <div className="bg-gradient-to-r p-6 border-b" style={{ 
                  background: `linear-gradient(to right, ${selectedEvent.color}15, ${selectedEvent.color}05)` 
                }}>
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: selectedEvent.color, boxShadow: `0 10px 25px -5px ${selectedEvent.color}40` }}
                    >
                      <CalendarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="gap-1 bg-background/80">
                          <Clock className="h-3.5 w-3.5" />
                          {selectedEvent.duration} minutes
                        </Badge>
                        {selectedEvent.description && (
                          <span className="text-sm text-muted-foreground">• {selectedEvent.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {availableDates.length === 0 ? (
                    <EmptyState
                      icon={CalendarOff}
                      title="No Available Dates"
                      description="This user hasn't set their availability yet. Check back later!"
                      action={
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setStep("events");
                            setSelectedEvent(null);
                          }}
                          className="gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Choose Another Event
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Calendar */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                          Select a date
                        </h3>
                        <div className="bg-muted/30 rounded-xl p-4 border">
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
                            className="rounded-md"
                            classNames={{
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                              day_today: "bg-accent text-accent-foreground rounded-full font-bold",
                              day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-full transition-all",
                              day_disabled: "text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                              caption: "flex justify-center pt-1 relative items-center text-sm font-medium mb-4",
                              caption_label: "text-base font-semibold",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-full transition-all",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse",
                              head_row: "flex w-full mb-2",
                              head_cell: "text-muted-foreground rounded-md w-10 font-medium text-sm",
                              row: "flex w-full mt-2",
                            }}
                            components={{
                              DayContent: (props) => {
                                const date = props.date;
                                const isAvailable = isDateAvailable(date);
                                const isSelected = selectedDate && isSameDay(date, selectedDate);
                                const isToday = isSameDay(date, new Date());
                                
                                return (
                                  <div className={cn(
                                    "relative w-full h-full flex items-center justify-center text-sm",
                                    isAvailable && !isSelected && "font-medium",
                                    isToday && !isSelected && "text-primary font-bold"
                                  )}>
                                    {format(date, "d")}
                                    {isAvailable && !isSelected && (
                                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                    )}
                                  </div>
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-primary rounded-full" />
                            <span className="text-muted-foreground">Available</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
                            <span className="text-muted-foreground">Unavailable</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-accent rounded-full font-bold flex items-center justify-center text-[8px]">•</span>
                            <span className="text-muted-foreground">Today</span>
                          </div>
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                          <Clock className="h-5 w-5 text-primary" />
                          {selectedDate ? (
                            <>Available times for {format(selectedDate, "EEEE, MMMM d")}</>
                          ) : (
                            "Select a date first"
                          )}
                        </h3>

                        {selectedDate ? (
                          <div className="bg-muted/30 rounded-xl p-4 border min-h-[300px]">
                            {timeSlots.length === 0 ? (
                              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                                <div className="bg-background rounded-full p-3 mb-3">
                                  <Clock className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium mb-1">No available times</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                  This day is fully booked or unavailable
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedDate(undefined)}
                                  className="gap-2"
                                >
                                  <CalendarIcon className="h-4 w-4" />
                                  Choose another date
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
                                  {timeSlots.map((time) => (
                                    <TimeSlot
                                      key={time}
                                      time={time}
                                      selected={selectedTime === time}
                                      onClick={() => handleSelectTime(time)}
                                    />
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {timeSlots.length} slot{timeSlots.length !== 1 ? 's' : ''} available
                                  </span>
                                  <Badge variant="outline" className="bg-background">
                                    All times in {profile.timezone?.split('/').pop() || 'your timezone'}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-xl p-8 text-center border-2 border-dashed min-h-[300px] flex flex-col items-center justify-center">
                            <div className="bg-background rounded-full p-4 mb-4">
                              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                              Please select a date to see available times
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Booking Form */}
          {step === "form" && selectedEvent && selectedDate && selectedTime && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8 space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-xl border">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: selectedEvent.color }}
                      >
                        <CalendarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          with {profile.full_name || "Host"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-background/80 rounded-lg p-3 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-sm font-medium">{format(selectedDate, "EEE, MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="bg-background/80 rounded-lg p-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="text-sm font-medium">{formatTimeDisplay(selectedTime)}</p>
                        </div>
                      </div>
                      <div className="bg-background/80 rounded-lg p-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium">{selectedEvent.duration} minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Your name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Jane Smith"
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Your email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Notes (optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="Anything you'd like to share before the meeting"
                        rows={4}
                        className="resize-none text-base"
                      />
                    </div>
                  </div>

                  {(selectedEvent.price_cents || 0) > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-lg">
                          <CreditCard className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">This is a paid meeting</p>
                          <p className="text-sm text-muted-foreground">
                            Cost: <strong className="text-amber-600">${(selectedEvent.price_cents / 100).toFixed(2)}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep("datetime")}
                      className="flex-1 h-12 text-base gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleProceedToPaymentOrBook}
                      className="flex-1 h-12 text-base gap-2"
                      disabled={!guestName || !guestEmail || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          {(selectedEvent.price_cents || 0) > 0 ? "Proceed to Payment" : "Confirm Booking"}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === "payment" && selectedEvent && selectedDate && selectedTime && (
            <PaymentStep
              eventTitle={selectedEvent.title}
              eventColor={selectedEvent.color}
              amountCents={selectedEvent.price_cents || 0}
              currency={selectedEvent.currency || "USD"}
              dateLabel={format(selectedDate, "EEEE, MMMM d, yyyy")}
              timeLabel={formatTimeDisplay(selectedTime)}
              duration={selectedEvent.duration}
              onSuccess={(method, txId) => handleBook(method, txId)}
              onBack={() => setStep("form")}
            />
          )}

          {/* Step 5: Confirmation */}
          {step === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <Card className="border-0 shadow-2xl">
                <CardContent className="py-12 px-6 text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl">
                      <Check className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Booking Confirmed!
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    A confirmation has been sent to <strong className="text-foreground">{guestEmail}</strong>
                  </p>

                  <div className="bg-muted/30 rounded-xl p-6 text-left space-y-4 mb-8">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                      <span className="font-semibold text-lg">{selectedEvent.title}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="font-medium">{format(selectedDate!, "EEEE, MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Time</p>
                        <p className="font-medium">{formatTimeDisplay(selectedTime!)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-medium">{selectedEvent.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Host</p>
                        <p className="font-medium">{profile.full_name || "Host"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" asChild className="flex-1 h-12 text-base">
                      <Link to={`/${username}`}>
                        Book Another
                      </Link>
                    </Button>
                    <Button asChild className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-primary/90">
                      <Link to="/">
                        Go Home
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}