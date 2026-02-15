import { useState, useMemo, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, MapPin, DollarSign, 
  ArrowLeft, ArrowRight, Check, 
  User, Mail, FileText, Video, Phone, Building2,
  Loader2, CheckCircle2, XCircle, CalendarOff,
  Sparkles, Users, ChevronLeft, Award, Shield,
  Zap, Globe, Coffee, Sun, Moon, Copy, ExternalLink, Settings, ChevronDown, ChevronUp,
  Star, TrendingUp, MessageSquare, HeartHandshake, Clock3, CreditCard, Briefcase,
  Link2, Eye, EyeOff, Lock, Unlock, Smartphone, Monitor, Tablet, Laptop,
  Grid3x3, List, Filter, Download, Upload, RefreshCw, AlertCircle, Info,
  HelpCircle, BookOpen, Gift, Rocket, Target, ThumbsUp, Bell, BellRing,
  Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Wifi, WifiOff,
  Battery, BatteryCharging, BatteryWarning, Signal, SignalHigh, SignalLow,
  SignalMedium, WifiHigh, WifiLow, WifiZero, WifiWarning
} from "lucide-react";
import { format, addMinutes, startOfDay, addDays, isSameDay, isToday, isTomorrow, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Step = "datetime" | "form" | "confirmed";

// ============================================
// BRANDING CONSTANTS
// ============================================
const BRAND = {
  name: "SBPMeet",
  primary: "#1E3A8A",
  secondary: "#C2410C",
  gradient: "from-[#1E3A8A] to-[#C2410C]",
  lightGradient: "from-[#1E3A8A]/10 to-[#C2410C]/5",
  company: "Pasbest Ventures",
  website: "https://pasbestventures.com",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getLocationIcon = (type: string) => {
  switch(type) {
    case 'video': return <Video className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />;
    case 'phone': return <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#C2410C]" />;
    case 'in_person': return <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />;
    default: return <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />;
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

const getLocationColor = (type: string) => {
  switch(type) {
    case 'video': return "#1E3A8A";
    case 'phone': return "#C2410C";
    case 'in_person': return "#1E3A8A";
    default: return "#1E3A8A";
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

const getTimeOfDay = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const getTimeIcon = (time: string) => {
  const period = getTimeOfDay(time);
  switch(period) {
    case 'morning': return <Sun className="h-3 w-3 text-amber-500" />;
    case 'afternoon': return <Sun className="h-3 w-3 text-[#C2410C]" />;
    case 'evening': return <Moon className="h-3 w-3 text-[#1E3A8A]" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

// Google Calendar link generator for guest's personal calendar
function generateGoogleCalendarLink(event: any, startTime: Date, endTime: Date, guestName: string, hostName: string, meetLink?: string, guestEmail?: string) {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `Meeting with ${hostName}\n\n${event.description || ''}\n\n${meetLink ? `Join via Google Meet: ${meetLink}` : ''}\n\nGuest: ${guestName}\nGuest Email: ${guestEmail || 'Not provided'}`
  );
  const location = encodeURIComponent(meetLink || event.location_details || '');
  const dates = `${startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
  
  return `${baseUrl}&text=${text}&details=${details}&location=${location}&dates=${dates}`;
}

// ============================================
// UI COMPONENTS
// ============================================

function TimeSlot({ time, selected, onClick, disabled = false }: { time: string; selected: boolean; onClick: () => void; disabled?: boolean }) {
  const period = getTimeOfDay(time);
  
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="w-full"
    >
      <Button
        variant={selected ? "default" : "outline"}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-full h-10 sm:h-12 text-xs sm:text-sm font-medium transition-all relative overflow-hidden group",
          selected 
            ? "bg-[#1E3A8A] text-white shadow-md hover:bg-[#1E3A8A]/90" 
            : "hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/5 hover:text-[#1E3A8A]",
          disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:scale-100"
        )}
      >
        <div className="flex items-center gap-2">
          {getTimeIcon(time)}
          <span>{formatTimeDisplay(time)}</span>
        </div>
        {selected && (
          <motion.div
            layoutId="selectedIndicator"
            className="absolute inset-0 bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Button>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description, color = "primary" }: { icon: any; title: string; description: string; color?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -2, x: 2 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-[#1E3A8A]/10 hover:border-[#1E3A8A]/30 transition-all shadow-sm hover:shadow"
    >
      <div className={cn(
        "p-2 rounded-lg shrink-0",
        color === "primary" ? "bg-[#1E3A8A]/10 text-[#1E3A8A]" : "bg-[#C2410C]/10 text-[#C2410C]"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-[#1E3A8A]">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

function StatBadge({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-[#1E3A8A]/10">
            <Icon className="h-3 w-3 text-[#1E3A8A]" />
            <span className="text-xs font-medium">{value}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] rounded-full p-4 shadow-2xl">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground animate-pulse">Preparing your booking experience...</p>
          <p className="text-xs text-muted-foreground/60">with SBPMeet</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#C2410C] to-[#C2410C]/60" />
        <CardContent className="py-12 sm:py-16 text-center px-4 sm:px-6">
          <div className="relative mx-auto w-fit mb-6">
            <div className="absolute inset-0 bg-[#C2410C]/20 rounded-full blur-3xl" />
            <div className="relative bg-[#C2410C]/10 rounded-full p-4">
              <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[#C2410C]" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] mb-3 text-[#1E3A8A]">Event Not Found</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-sm mx-auto">
            {message}
          </p>
          <Button asChild size="lg" className="px-8 w-full sm:w-auto bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
            <Link to="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN BOOKING PAGE COMPONENT
// ============================================

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
  const [bookingData, setBookingData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

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

  const handleCopyLink = () => {
    if (bookingData?.meeting_link) {
      navigator.clipboard.writeText(bookingData.meeting_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Meeting link copied to clipboard",
      });
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !event || !guestName || !guestEmail || !profile) {
      console.error('❌ Missing required booking data:', {
        hasDate: !!selectedDate,
        hasTime: !!selectedTime,
        hasEvent: !!event,
        hasGuestName: !!guestName,
        hasGuestEmail: !!guestEmail,
        hasProfile: !!profile
      });
      return;
    }

    setSubmitting(true);
    const [h, m] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);
    const endTime = addMinutes(startTime, event.duration);

    try {
      // Step 1: Insert the booking first to get an ID
      const insertStartTime = Date.now();
      
      const { data: booking, error: bookingError } = await supabase
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
          meeting_link: null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Step 2: Create calendar event (only if guest wants to sync)
      let meetingLink = null;
      let calendarEventId = null;
      let calendarHtmlLink = null;

      if (syncToCalendar) {
        try {
          const { data: calendarData, error: calendarError } = await supabase.functions.invoke(
            'create-calendar-event',
            {
              body: {
                bookingId: booking.id,
                hostUserId: username,
                eventDetails: {
                  title: event.title,
                  description: event.description || '',
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString(),
                  guestName: guestName,
                  guestEmail: guestEmail,
                  locationType: event.location_type,
                  locationDetails: event.location_details,
                }
              }
            }
          );

          if (calendarError) throw calendarError;

          if (calendarData) {
            meetingLink = calendarData.meetLink;
            calendarEventId = calendarData.calendarEventId;
            calendarHtmlLink = calendarData.calendarHtmlLink;

            // Update booking with calendar data
            const updateData: any = {
              updated_at: new Date().toISOString()
            };
            if (meetingLink) updateData.meeting_link = meetingLink;
            if (calendarEventId) updateData.calendar_event_id = calendarEventId;
            if (calendarHtmlLink) updateData.calendar_html_link = calendarHtmlLink;

            await supabase
              .from("bookings")
              .update(updateData)
              .eq('id', booking.id);
          }
        } catch (calendarErr: any) {
          toast({
            title: "Calendar event creation failed",
            description: "Your booking is confirmed but we couldn't create the calendar event. You'll receive an email confirmation instead.",
            variant: "destructive",
          });
        }
      }

      // Fetch the updated booking
      const { data: updatedBooking, error: fetchError } = await supabase
        .from("bookings")
        .select()
        .eq('id', booking.id)
        .single();

      if (fetchError) throw fetchError;

      setBookingData(updatedBooking);

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            type: "confirmation",
            booking: {
              id: updatedBooking.id,
              guest_name: guestName,
              guest_email: guestEmail,
              host_user_id: username,
              host_email: profile.email,
              event_title: event.title,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              duration: event.duration,
              location_type: event.location_type,
              location_details: meetingLink || event.location_details,
              guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              meet_link: meetingLink,
              calendar_event_id: calendarEventId,
            }
          }
        });
      } catch (emailError) {
        // Non-critical, continue
      }

      setStep("confirmed");
      
      toast({
        title: "Booking confirmed!",
        description: event.location_type === 'video' 
          ? "Calendar invite and meeting link have been sent to your email."
          : "Calendar invite has been sent to your email.",
      });

    } catch (err: any) {
      toast({ 
        title: "Booking failed", 
        description: err.message || "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = eventLoading || profileLoading || availabilityLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  if (eventError || !event || !profile) {
    return <ErrorState message="This booking link doesn't exist or is no longer available." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] p-1.5 sm:p-2 rounded-lg shadow-lg"
            >
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </motion.div>
            <span className="font-bold text-sm sm:text-lg bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
              SBPMeet
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full border shadow-sm">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C2410C]" />
            <span>Powered by <span className="font-semibold text-[#1E3A8A]">Pasbest Ventures</span></span>
          </div>
        </motion.div>

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
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:w-96 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#1E3A8A]/5 via-[#1E3A8A]/5 to-transparent border-b lg:border-b-0 lg:border-r relative overflow-hidden"
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2410C]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#1E3A8A]/5 rounded-full blur-3xl" />
                    
                    <div className="relative space-y-4 sm:space-y-6">
                      {/* Host info */}
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 sm:gap-4"
                      >
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 sm:border-4 border-white dark:border-slate-800 shadow-xl">
                          <AvatarFallback className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] text-white text-base sm:text-xl">
                            {profile.full_name?.[0] || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Hosted by</p>
                          <p className="font-bold text-sm sm:text-lg text-[#1E3A8A]">{profile.full_name || 'Host'}</p>
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="truncate max-w-[150px] sm:max-w-none">{profile.email}</span>
                          </div>
                        </div>
                      </motion.div>

                      <Separator className="bg-gradient-to-r from-[#1E3A8A]/20 via-[#C2410C]/20 to-transparent" />

                      {/* Event title */}
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                          {event.title}
                        </h1>
                        {event.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </motion.div>

                      {/* Event details */}
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-[#1E3A8A]/10">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-[#1E3A8A]/10">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Duration</p>
                            <p className="text-xs sm:text-sm font-medium text-[#1E3A8A]">{event.duration} minutes</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-[#1E3A8A]/10">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-[#1E3A8A]/10">
                            {getLocationIcon(event.location_type)}
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Location</p>
                            <p className="text-xs sm:text-sm font-medium" style={{ color: getLocationColor(event.location_type) }}>
                              {getLocationLabel(event.location_type)}
                            </p>
                          </div>
                        </div>

                        {(event.price_cents || 0) > 0 && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-[#C2410C]/10 border border-[#C2410C]/20">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-[#C2410C]/20">
                              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C2410C]" />
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-[#C2410C]/80">Price</p>
                              <p className="text-xs sm:text-sm font-medium text-[#C2410C]">
                                ${(event.price_cents / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Location Details from Event */}
                      {event.location_details && event.location_type !== 'video' && (
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="bg-[#1E3A8A]/5 rounded-lg p-3 sm:p-4 border border-[#1E3A8A]/10"
                        >
                          <p className="text-[10px] sm:text-xs font-medium text-[#1E3A8A] mb-1 sm:mb-2">📍 Location Details</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{event.location_details}</p>
                        </motion.div>
                      )}

                      {/* Features */}
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-[#1E3A8A]">Features</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs gap-1"
                            onClick={() => setShowAllFeatures(!showAllFeatures)}
                          >
                            {showAllFeatures ? 'Show less' : 'Show all'}
                            {showAllFeatures ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                        
                        <AnimatePresence>
                          {(showAllFeatures ? [
                            { icon: Shield, title: "Secure Booking", description: "Your information is protected", color: "primary" },
                            { icon: Zap, title: "Instant Confirmation", description: "Get confirmation immediately", color: "primary" },
                            { icon: Video, title: "Google Meet Ready", description: "Automatic video link generation", color: "primary" },
                            { icon: CalendarIcon, title: "Calendar Integration", description: "Event saved to your calendar", color: "primary" },
                            { icon: Globe, title: "Timezone Smart", description: "Automatic timezone detection", color: "primary" },
                            { icon: CreditCard, title: "Secure Payments", description: "Pay with M-Pesa or card", color: "secondary" },
                          ] : [
                            { icon: Shield, title: "Secure Booking", description: "Your information is protected", color: "primary" },
                            { icon: Zap, title: "Instant Confirmation", description: "Get confirmation immediately", color: "primary" },
                            { icon: Video, title: "Google Meet Ready", description: "Automatic video link", color: "primary" },
                          ]).map((feature, idx) => (
                            <motion.div
                              key={feature.title}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <FeatureCard
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                color={feature.color}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>

                      {/* Stats badges */}
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap gap-2 pt-2"
                      >
                        <StatBadge icon={Star} value="98%" label="Satisfaction rate" />
                        <StatBadge icon={Users} value="800+" label="Active users" />
                        <StatBadge icon={Clock3} value="<2min" label="Avg response" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Right column - Date & Time selection */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 p-4 sm:p-6 lg:p-8"
                  >
                    {availableDates.length === 0 ? (
                      <div className="text-center py-12 sm:py-16">
                        <div className="relative mx-auto w-fit mb-4 sm:mb-6">
                          <div className="absolute inset-0 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
                          <div className="relative bg-[#1E3A8A]/10 rounded-full p-3 sm:p-4">
                            <CalendarOff className="h-8 w-8 sm:h-12 sm:w-12 text-[#1E3A8A]/60" />
                          </div>
                        </div>
                        <h3 className="text-base sm:text-xl font-semibold mb-2 text-[#1E3A8A]">No available dates</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto px-4">
                          This host hasn't set their availability yet. Check back later!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 sm:space-y-8">
                        {/* Calendar */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#1E3A8A]/10">
                              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />
                            </div>
                            Select a Date
                          </h3>
                          <div className="flex justify-center bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#1E3A8A]/10">
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
                                caption_label: "text-xs sm:text-sm font-semibold text-[#1E3A8A]",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#1E3A8A]/10 rounded-full transition-all",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-8 sm:w-10 font-medium text-[10px] sm:text-xs",
                                row: "flex w-full mt-1 sm:mt-2",
                                cell: "text-center text-xs sm:text-sm p-0 relative",
                                day: cn(
                                  "h-7 w-7 sm:h-9 sm:w-9 p-0 font-normal rounded-full transition-all text-xs sm:text-sm",
                                  "hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]"
                                ),
                                day_selected: "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] hover:text-white focus:bg-[#1E3A8A] focus:text-white font-semibold shadow-lg",
                                day_today: "bg-[#C2410C] text-white font-bold ring-2 ring-[#C2410C]/30 hover:bg-[#C2410C]/90", // Orange today
                                day_disabled: "text-muted-foreground/30 hover:bg-transparent cursor-not-allowed",
                                day_outside: "text-muted-foreground/30",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#1E3A8A] shadow-lg shadow-[#1E3A8A]/30" />
                              <span className="text-muted-foreground">Available</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-muted-foreground/30" />
                              <span className="text-muted-foreground">Unavailable</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-[#C2410C] ring-2 ring-[#C2410C]/30" />
                              <span className="text-muted-foreground">Today</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Time slots */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#1E3A8A]/10">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#1E3A8A]" />
                            </div>
                            {selectedDate ? (
                              <span className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span>Available Times for</span>
                                <span className="text-[#C2410C] font-bold">{formatDateDisplay(selectedDate)}</span>
                              </span>
                            ) : (
                              "Select a Date First"
                            )}
                          </h3>
                          
                          {selectedDate ? (
                            <div className="border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 border-[#1E3A8A]/10">
                              {timeSlots.length === 0 ? (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="text-center py-8 sm:py-12"
                                >
                                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-full p-2 sm:p-3 w-fit mx-auto mb-3 sm:mb-4 border border-[#1E3A8A]/10">
                                    <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-[#1E3A8A]/50" />
                                  </div>
                                  <p className="font-medium text-sm sm:text-base mb-1 text-[#1E3A8A]">No available times</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    This day is fully booked. Please select another date.
                                  </p>
                                </motion.div>
                              ) : (
                                <>
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                                    <Badge variant="outline" className="bg-white/50 dark:bg-slate-800/50 text-xs border-[#1E3A8A]/20">
                                      {timeSlots.length} slot{timeSlots.length > 1 ? 's' : ''} available
                                    </Badge>
                                    <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20 text-xs">
                                      {event.duration} min meeting
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-[#1E3A8A]/20 scrollbar-track-transparent">
                                    {timeSlots.map((time) => (
                                      <div
                                        key={time}
                                        onMouseEnter={() => setHoveredSlot(time)}
                                        onMouseLeave={() => setHoveredSlot(null)}
                                      >
                                        <TimeSlot
                                          time={time}
                                          selected={selectedTime === time}
                                          onClick={() => setSelectedTime(time)}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  {hoveredSlot && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-3 text-xs text-center text-muted-foreground bg-white/50 dark:bg-slate-800/50 py-1 px-2 rounded-full"
                                    >
                                      {getTimeOfDay(hoveredSlot)} slot · {event.duration} minutes
                                    </motion.div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="border rounded-lg sm:rounded-xl p-8 sm:p-12 text-center bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 border-[#1E3A8A]/10">
                              <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-[#1E3A8A]/30 mx-auto mb-3 sm:mb-4" />
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Pick a date from the calendar to see available time slots
                              </p>
                            </div>
                          )}
                        </motion.div>

                        {/* Next button */}
                        {selectedDate && selectedTime && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end pt-2 sm:pt-4"
                          >
                            <Button 
                              onClick={() => setStep("form")}
                              size="lg"
                              className="gap-2 sm:gap-3 px-6 sm:px-10 h-10 sm:h-12 text-sm sm:text-base w-full sm:w-auto bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90 text-white shadow-lg hover:shadow-xl transition-all group"
                            >
                              Next
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
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
                <div className="h-2 bg-gradient-to-r from-[#1E3A8A] to-[#C2410C]" />
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-[#1E3A8A]/5 to-transparent">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white dark:border-slate-800 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] text-white text-sm sm:text-base">
                          {profile.full_name?.[0] || 'H'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Booking with</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#1E3A8A]">{profile.full_name || 'Host'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep("datetime")}
                      className="gap-1 sm:gap-2 hover:bg-[#1E3A8A]/10 text-xs sm:text-sm w-full sm:w-auto text-[#1E3A8A]"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      Back
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* Booking summary */}
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-[#1E3A8A]/10"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Date</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#1E3A8A]">{format(selectedDate!, "EEE, MMM d")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#C2410C]">{formatTimeDisplay(selectedTime!)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold text-sm sm:text-lg text-[#1E3A8A]">{event.duration} min</p>
                      </div>
                    </div>
                    
                    {/* Simple toggle for calendar sync */}
                    <div className="mt-4 pt-4 border-t border-[#1E3A8A]/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-[#1E3A8A]" />
                          <span className="text-sm font-medium text-[#1E3A8A]">Add to my calendar</span>
                        </div>
                        <Switch
                          checked={syncToCalendar}
                          onCheckedChange={setSyncToCalendar}
                          className="data-[state=checked]:bg-[#1E3A8A]"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {syncToCalendar 
                          ? "Event will be saved to your calendar automatically" 
                          : "You'll receive an email confirmation instead"}
                      </p>
                    </div>

                    {event.location_type === 'video' && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                          <span className="text-muted-foreground">Google Meet link will be generated automatically</span>
                        </div>
                      </div>
                    )}
                    
                    {event.location_type !== 'video' && event.location_details && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#C2410C] shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{event.location_details}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Form fields */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 text-[#1E3A8A]">
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        Your name <span className="text-[#C2410C]">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-[#1E3A8A]/50 focus:ring-[#1E3A8A]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 text-[#1E3A8A]">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                        Email address <span className="text-[#C2410C]">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="h-10 sm:h-12 text-sm sm:text-base border-2 focus:border-[#1E3A8A]/50 focus:ring-[#1E3A8A]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="notes" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 text-[#1E3A8A]">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        Additional notes (optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="Anything you'd like to share before the meeting"
                        rows={3}
                        className="resize-none text-sm sm:text-base border-2 focus:border-[#1E3A8A]/50 focus:ring-[#1E3A8A]/20 transition-all"
                      />
                    </div>
                  </motion.div>

                  {/* Confirm button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={handleBook}
                      size="lg"
                      className="w-full h-10 sm:h-12 text-sm sm:text-base gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90 text-white shadow-lg hover:shadow-xl transition-all group"
                      disabled={!guestName || !guestEmail || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          Confirming booking...
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                    By booking, you agree to our{' '}
                    <Link to="/terms" className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors">Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors">Privacy Policy</Link>
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
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.1 }}
                    className="relative mx-auto w-fit mb-6 sm:mb-8"
                  >
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3 sm:p-4 shadow-xl">
                      <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] mb-2 sm:mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                  >
                    Booking Confirmed!
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8"
                  >
                    A confirmation has been sent to <strong className="text-[#1E3A8A] break-all">{guestEmail}</strong>
                  </motion.p>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#C2410C]/5 rounded-lg sm:rounded-xl p-4 sm:p-6 text-left space-y-3 sm:space-y-4 mb-6 sm:mb-8 border border-[#1E3A8A]/10"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm pb-2 sm:pb-3 border-b border-[#1E3A8A]/10">
                      <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <span className="font-semibold text-[#1E3A8A]">{event.title}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                        <span className="text-xs sm:text-sm">{format(selectedDate!, "EEE, MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-[#C2410C] shrink-0" />
                        <span className="text-xs sm:text-sm">{formatTimeDisplay(selectedTime!)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLocationIcon(event.location_type)}
                        <span className="text-xs sm:text-sm">{getLocationLabel(event.location_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A] shrink-0" />
                        <span className="text-xs sm:text-sm">{profile.full_name || 'Host'}</span>
                      </div>
                    </div>

                    {/* Location Details from Event */}
                    {event.location_type !== 'video' && event.location_details && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">📍 Location</p>
                        <p className="text-xs sm:text-sm bg-white dark:bg-slate-800 rounded-lg p-3 border border-[#1E3A8A]/10">
                          {event.location_details}
                        </p>
                      </div>
                    )}

                    {/* Google Meet Link (if video call) */}
                    {event.location_type === 'video' && bookingData?.meeting_link && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A8A]/10">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Google Meet Link</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-[#1E3A8A]/10 text-xs sm:text-sm font-mono truncate">
                            {bookingData.meeting_link}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="shrink-0 gap-1 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                                  onClick={handleCopyLink}
                                >
                                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                  {copied ? 'Copied!' : 'Copy'}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy meeting link</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="shrink-0 gap-1 border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                                  onClick={() => window.open(bookingData.meeting_link, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Join
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open meeting link</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}

                    {/* Calendar sync status */}
                    {bookingData?.calendar_event_id && (
                      <div className="mt-2 text-xs text-center text-green-600 bg-green-50 dark:bg-green-950/30 py-2 px-3 rounded-lg border border-green-200 dark:border-green-900">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />
                        Event added to your calendar
                      </div>
                    )}
                  </motion.div>

                  {/* Manual Google Calendar Add Button (backup option) */}
                  {selectedDate && selectedTime && syncToCalendar && !bookingData?.calendar_event_id && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mb-4 sm:mb-6"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-xs sm:text-sm border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5"
                        onClick={() => {
                          const [h, m] = selectedTime.split(":").map(Number);
                          const startTime = new Date(selectedDate!);
                          startTime.setHours(h, m, 0, 0);
                          const endTime = addMinutes(startTime, event.duration);
                          
                          const calendarUrl = generateGoogleCalendarLink(
                            event,
                            startTime,
                            endTime,
                            guestName,
                            profile.full_name || 'Host',
                            bookingData?.meeting_link,
                            guestEmail
                          );
                          
                          window.open(calendarUrl, '_blank');
                        }}
                      >
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#1E3A8A]" />
                        Add to Google Calendar
                      </Button>
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                  >
                    <Button variant="outline" asChild className="flex-1 h-10 sm:h-11 text-xs sm:text-base border-[#1E3A8A]/20 hover:bg-[#1E3A8A]/5">
                      <Link to={`/${username}`}>
                        New Booking
                      </Link>
                    </Button>
                    <Button asChild className="flex-1 h-10 sm:h-11 text-xs sm:text-base bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] hover:from-[#1E3A8A]/90 hover:to-[#C2410C]/90">
                      <Link to="/">
                        Done
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground">
            A product of{" "}
            <a 
              href={BRAND.website}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors font-medium"
            >
              {BRAND.company}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}