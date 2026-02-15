import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sendBookingEmail } from "@/lib/emails";
import { motion, AnimatePresence } from "framer-motion";
import { useBookings, useCancelBooking, useBooking, Booking } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Clock, Mail, User, MapPin, Search, XCircle, MessageSquare, 
  ArrowLeft, Phone, Video, Building2, Copy, CheckCircle, AlertCircle,
  Share2, MoreVertical, ChevronRight, CalendarDays, ExternalLink, Loader2,
  Filter, Download, Eye, Trash2, RefreshCw, Grid3x3, List, Table2,
  X, ChevronLeft, Link2, Clipboard, Check, ExternalLink as LinkIcon
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTime12(iso: string) {
  return format(new Date(iso), "h:mm a");
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d, yyyy");
}

function formatFullDate(iso: string) {
  return format(new Date(iso), "EEEE, MMMM d, yyyy");
}

function getLocationIcon(type: string) {
  switch(type) {
    case 'video': return <Video className="h-3.5 w-3.5" />;
    case 'phone': return <Phone className="h-3.5 w-3.5" />;
    case 'in_person': return <Building2 className="h-3.5 w-3.5" />;
    default: return <MapPin className="h-3.5 w-3.5" />;
  }
}

function getLocationLabel(type: string) {
  switch(type) {
    case 'video': return 'Video';
    case 'phone': return 'Phone';
    case 'in_person': return 'In person';
    default: return type;
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// MEETING LINK COMPONENT
// ============================================

function MeetingLinkDisplay({ link, label = "Meeting Link" }: { link?: string | null; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!link) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Meeting link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted/30 rounded-lg p-2 sm:p-3 border text-xs sm:text-sm font-mono truncate">
          {link}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 h-8 sm:h-9"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Clipboard className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
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
                className="shrink-0 gap-1 h-8 sm:h-9"
                onClick={() => window.open(link, '_blank')}
              >
                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Join</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open meeting link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ============================================
// CALENDAR EVENT LINK COMPONENT
// ============================================

function CalendarEventLink({ calendarHtmlLink }: { calendarHtmlLink?: string | null }) {
  if (!calendarHtmlLink) return null;

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs font-medium text-muted-foreground mb-2">Calendar Event</p>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs"
        onClick={() => window.open(calendarHtmlLink, '_blank')}
      >
        <ExternalLink className="h-3 w-3" />
        View in Google Calendar
      </Button>
    </div>
  );
}

// ============================================
// BOOKING DETAILS MODAL - FULLY RESPONSIVE
// ============================================

function BookingDetailsModal({ 
  bookingId, 
  open, 
  onOpenChange 
}: { 
  bookingId: string | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { data: booking, isLoading, error } = useBooking(bookingId || undefined);
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCancel = async () => {
    if (!booking) return;
    try {
      await cancelMutation.mutateAsync(booking.id);
      toast({ 
        title: "✅ Booking cancelled", 
        description: "The booking has been successfully cancelled."
      });

      sendBookingEmail("cancellation", {
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        host_name: "",
        event_title: booking.event_types?.title || "Meeting",
        start_time: booking.start_time,
        end_time: booking.end_time,
        duration: booking.event_types?.duration || 30,
        location_type: booking.event_types?.location_type || "video",
        guest_timezone: booking.guest_timezone,
      });

      onOpenChange(false);
      setShowCancelConfirm(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden",
          "w-full",
          isMobile ? "h-[100dvh] max-w-[100vw] rounded-none" : "max-w-4xl max-h-[90vh] rounded-2xl"
        )}
      >
        {isLoading ? (
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-72" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
              <Skeleton className="h-32 sm:h-40" />
              <Skeleton className="h-32 sm:h-40" />
            </div>
          </div>
        ) : error || !booking ? (
          <div className="py-12 sm:py-16 text-center px-4">
            <AlertCircle className="h-12 sm:h-16 w-12 sm:w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Booking not found</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
            <Button size={isMobile ? "default" : "lg"} onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            {/* Colored header strip */}
            <div 
              className="h-1.5 sm:h-2 w-full shrink-0" 
              style={{ 
                background: `linear-gradient(90deg, ${booking.event_types?.color || '#7C3AED'}, ${booking.event_types?.color || '#7C3AED'}80, ${booking.event_types?.color || '#7C3AED'}20)` 
              }} 
            />

            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full hover:bg-muted" 
                  onClick={() => onOpenChange(false)}
                >
                  <ChevronLeft className="h-4 w-4 sm:hidden" />
                  <X className="hidden sm:block h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold font-['Space_Grotesk'] truncate pr-2">
                    {booking.event_types?.title || "Meeting"}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    with {booking.guest_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Badge 
                  variant={booking.status === 'confirmed' ? 'default' : 'destructive'}
                  className={cn(
                    "capitalize px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm whitespace-nowrap",
                    booking.status === 'confirmed' && "bg-green-500/10 text-green-600 border-green-500/20"
                  )}
                >
                  {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 hidden sm:inline" />}
                  {booking.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted">
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 sm:w-40">
                    <DropdownMenuItem onClick={() => copyToClipboard(booking.id)} className="cursor-pointer text-sm">
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer text-sm">
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Print
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-sm">
                      <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Scrollable content */}
            <div 
              className={cn(
                "overflow-y-auto overscroll-contain",
                "p-3 sm:p-4 md:p-6 lg:p-8",
                "space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8"
              )} 
              style={{ 
                maxHeight: isMobile ? "calc(100dvh - 120px)" : "calc(90vh - 140px)"
              }}
            >
              {/* Meeting Link Section - Prominently displayed for video calls */}
              {booking.event_types?.location_type === 'video' && booking.meeting_link && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600">
                      <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold">Meeting Link</p>
                  </div>
                  <MeetingLinkDisplay link={booking.meeting_link} label="Google Meet Link" />
                  
                  {/* Quick join button */}
                  <Button
                    className="w-full mt-3 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size={isMobile ? "default" : "lg"}
                    onClick={() => window.open(booking.meeting_link!, '_blank')}
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting Now
                  </Button>
                </div>
              )}

              {/* Date & Time Card */}
              <div className="bg-gradient-to-br from-primary/5 via-primary/5 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Date & Time</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold">{formatFullDate(booking.start_time)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-background/50">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium">Starts</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{formatTime12(booking.start_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-background/50">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium">Ends</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{formatTime12(booking.end_time)}</p>
                    </div>
                  </div>
                </div>
                
                {booking.event_types?.duration && (
                  <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    Duration: {booking.event_types.duration} minutes
                  </div>
                )}
              </div>

              {/* Guest Information Card */}
              <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold">Guest Information</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg">
                      {getInitials(booking.guest_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 sm:space-y-3 flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
                        <p className="text-sm sm:text-base font-medium break-words">{booking.guest_name}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                        <a 
                          href={`mailto:${booking.guest_email}`} 
                          className="text-sm sm:text-base text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {booking.guest_email}
                          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        </a>
                      </div>
                    </div>
                    {booking.guest_timezone && (
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Timezone</p>
                        <p className="text-sm sm:text-base break-words">{booking.guest_timezone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold">Location</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-background text-primary shrink-0">
                    {getLocationIcon(booking.event_types?.location_type || 'video')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium capitalize">
                      {getLocationLabel(booking.event_types?.location_type || 'video')}
                    </p>
                    {booking.event_types?.location_type !== 'video' && booking.event_types?.location_details && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{booking.event_types.location_details}</p>
                    )}
                    {/* Show meeting link in location section as fallback */}
                    {booking.event_types?.location_type === 'video' && booking.meeting_link && (
                      <div className="mt-2">
                        <MeetingLinkDisplay link={booking.meeting_link} label="Meeting Link" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendar Event Link */}
                {booking.calendar_html_link && (
                  <CalendarEventLink calendarHtmlLink={booking.calendar_html_link} />
                )}
              </div>

              {/* Guest Notes */}
              {booking.guest_notes && (
                <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold">Guest Notes</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30">
                    <p className="text-xs sm:text-sm leading-relaxed break-words">"{booking.guest_notes}"</p>
                  </div>
                </div>
              )}

              {/* Calendar Event Info */}
              {booking.calendar_event_id && (
                <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 bg-green-50/50 dark:bg-green-950/10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-green-500/10 text-green-600">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium">Calendar Synced</p>
                      <p className="text-xs text-muted-foreground">Event ID: {booking.calendar_event_id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold">Booking Timeline</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 mt-1.5" />
                      <div className="absolute top-4 bottom-0 w-0.5 bg-border h-full" />
                    </div>
                    <div className="flex-1 pb-3 sm:pb-4">
                      <p className="text-sm sm:text-base font-medium">Booking Created</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  {booking.status === 'cancelled' && booking.cancelled_at && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive mt-1.5" />
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium">Booking Cancelled</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(booking.cancelled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional spacing at bottom */}
              <div className="h-2 sm:h-4" />
            </div>

            {/* Footer with cancel button */}
            {new Date(booking.start_time) > new Date() && booking.status === 'confirmed' && (
              <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 sm:p-4 md:p-6 shrink-0">
                <div className="max-w-3xl mx-auto">
                  {showCancelConfirm ? (
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm text-center text-destructive font-medium">
                        Are you sure you want to cancel this booking?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="destructive" 
                          size={isMobile ? "default" : "lg"}
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="flex-1 gap-2"
                        >
                          {cancelMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Yes, cancel
                        </Button>
                        <Button 
                          variant="outline" 
                          size={isMobile ? "default" : "lg"}
                          onClick={() => setShowCancelConfirm(false)}
                          className="flex-1"
                        >
                          No, go back
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button 
                        variant="destructive" 
                        size={isMobile ? "default" : "lg"}
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={cancelMutation.isPending}
                        className="w-full gap-2 h-10 sm:h-12 text-sm sm:text-base"
                      >
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        Cancel this booking
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2 hidden sm:block">
                        This action cannot be undone. The guest will be notified via email.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// BOOKING CARD FOR MOBILE/GRID VIEW
// ============================================

function BookingCard({ booking, onCancel, onClick }: { booking: Booking; onCancel: (b: Booking) => void; onClick: () => void }) {
  const event = booking.event_types;
  const startDate = new Date(booking.start_time);
  const isUpcoming = startDate > new Date() && booking.status === 'confirmed';
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyMeetingLink = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "Meeting link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
        onClick={onClick}
      >
        <div className="h-1" style={{ backgroundColor: event?.color || "#7C3AED" }} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge 
              variant={booking.status === 'confirmed' ? 'outline' : 'destructive'}
              className={cn(
                "text-[10px] px-2 py-0",
                booking.status === 'confirmed' && "bg-green-500/10 text-green-600 border-green-500/20"
              )}
            >
              {booking.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(booking.start_time)}
            </span>
          </div>

          <h3 className="font-semibold text-base mb-2 truncate font-['Space_Grotesk']">
            {event?.title || "Meeting"}
          </h3>

          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{formatTime12(booking.start_time)}</span>
              {event?.duration && (
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {event.duration}min
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{booking.guest_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getLocationIcon(event?.location_type || 'video')}
              <span className="capitalize">{getLocationLabel(event?.location_type || 'video')}</span>
            </div>
          </div>

          {/* Meeting Link Preview (if video call) */}
          {event?.location_type === 'video' && booking.meeting_link && (
            <div className="mt-2 mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <Video className="h-3 w-3 text-blue-600 shrink-0" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                    Meet Link
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => copyMeetingLink(e, booking.meeting_link!)}
                        >
                          {copied ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Clipboard className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(booking.meeting_link!, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Join meeting</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}

          {isUpcoming && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-destructive hover:text-destructive gap-1 text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(booking);
              }}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// BOOKINGS TABLE (DESKTOP)
// ============================================

function BookingsTable({ bookings, onCancel, onRowClick }: { 
  bookings: Booking[]; 
  onCancel: (b: Booking) => void;
  onRowClick: (id: string) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const copyMeetingLink = (e: React.MouseEvent, id: string, link: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast({ title: "✅ Copied!", description: "Meeting link copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-md border overflow-hidden w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px]">Date & Time</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead className="w-[100px]">Duration</TableHead>
            <TableHead className="w-[100px]">Location</TableHead>
            <TableHead className="w-[200px]">Meeting Link</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const startDate = new Date(booking.start_time);
            const isUpcoming = startDate > new Date() && booking.status === 'confirmed';
            
            return (
              <TableRow 
                key={booking.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onRowClick(booking.id)}
              >
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="text-sm">{formatDate(booking.start_time)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime12(booking.start_time)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium font-['Space_Grotesk']">
                      {booking.event_types?.title || "Meeting"}
                    </div>
                    {booking.event_types?.color && (
                      <div className="flex items-center gap-1">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: booking.event_types.color }}
                        />
                        <span className="text-xs text-muted-foreground">Event</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{booking.guest_name}</div>
                    <div className="text-xs text-muted-foreground">{booking.guest_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {booking.event_types?.duration || 30} min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getLocationIcon(booking.event_types?.location_type || 'video')}
                    <span className="text-xs capitalize">
                      {getLocationLabel(booking.event_types?.location_type || 'video')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.event_types?.location_type === 'video' && booking.meeting_link ? (
                    <div className="flex items-center gap-1 max-w-[140px]">
                      <div className="flex-1 truncate">
                        <span className="text-xs text-muted-foreground truncate block">
                          {booking.meeting_link.replace(/^https?:\/\//, '').substring(0, 20)}...
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => copyMeetingLink(e, booking.id, booking.meeting_link!)}
                            >
                              {copiedId === booking.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Clipboard className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy link</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(booking.meeting_link!, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Join</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={booking.status === 'confirmed' ? 'default' : 'destructive'}
                    className={cn(
                      "text-xs",
                      booking.status === 'confirmed' && "bg-green-500/10 text-green-600 border-green-500/20"
                    )}
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isUpcoming && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel(booking);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// MAIN BOOKINGS PAGE
// ============================================

export default function Bookings() {
  const { bookingId } = useParams();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: bookings, isLoading, refetch } = useBookings(tab, search);
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // If there's a bookingId in the URL, show the modal
  useEffect(() => {
    if (bookingId) {
      setSelectedBookingId(bookingId);
      setModalOpen(true);
    }
  }, [bookingId]);

  const filtered = bookings || [];

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelMutation.mutateAsync(cancelDialog.id);
      toast({ 
        title: "✅ Booking cancelled", 
        description: "The booking has been successfully cancelled."
      });

      sendBookingEmail("cancellation", {
        id: cancelDialog.id,
        guest_name: cancelDialog.guest_name,
        guest_email: cancelDialog.guest_email,
        host_name: "",
        event_title: cancelDialog.event_types?.title || "Meeting",
        start_time: cancelDialog.start_time,
        end_time: cancelDialog.end_time,
        duration: cancelDialog.event_types?.duration || 30,
        location_type: cancelDialog.event_types?.location_type || "video",
        guest_timezone: cancelDialog.guest_timezone,
      });

      setCancelDialog(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedBookingId(id);
    setModalOpen(true);
    window.history.pushState({}, '', `/dashboard/bookings/${id}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBookingId(null);
    window.history.pushState({}, '', '/dashboard/bookings');
  };

  return (
    <div className="space-y-6 pb-8 w-full px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your scheduled meetings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
              <TabsTrigger value="past" className="text-xs sm:text-sm">Past</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("table")}
                disabled={isMobile}
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> bookings
        </p>
      </div>

      {/* Bookings display - full width */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {isLoading ? (
          <div className={cn(
            "grid gap-4 w-full",
            viewMode === "grid" && !isMobile ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed w-full">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-4">
                  <Calendar className="h-12 w-12 text-primary/60" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {tab === "upcoming" ? "No upcoming bookings" : 
                 tab === "past" ? "No past bookings" : "No cancelled bookings"}
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {tab === "upcoming" 
                  ? "Share your booking link to start receiving appointments." 
                  : "Bookings will appear here once you have them."}
              </p>
              <Button asChild>
                <Link to="/dashboard/events">Create Event Type</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "table" && !isMobile ? (
              <div className="w-full overflow-x-auto">
                <BookingsTable 
                  bookings={filtered} 
                  onCancel={setCancelDialog}
                  onRowClick={handleRowClick}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {filtered.map((booking) => (
                  <BookingCard 
                    key={booking.id}
                    booking={booking}
                    onCancel={setCancelDialog}
                    onClick={() => handleRowClick(booking.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Booking Details Modal */}
      <BookingDetailsModal 
        bookingId={selectedBookingId}
        open={modalOpen}
        onOpenChange={handleModalClose}
      />

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(o) => !o && setCancelDialog(null)}>
        <DialogContent className="max-w-sm mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="font-['Space_Grotesk'] text-xl">Cancel booking?</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                This will cancel the booking with <strong>{cancelDialog?.guest_name}</strong>.
              </p>
              {cancelDialog && (
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  {formatFullDate(cancelDialog.start_time)} at {formatTime12(cancelDialog.start_time)}
                </p>
              )}
              <p className="text-destructive font-medium text-sm">
                This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending} className="flex-1">
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                "Yes, cancel booking"
              )}
            </Button>
            <Button variant="outline" onClick={() => setCancelDialog(null)} className="flex-1">
              Keep booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}