import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProfileByUsername, usePublicEventTypes, usePublicAvailability, usePublicOverrides, useExistingBookings } from "@/hooks/use-booking";
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
import { Calendar as CalIcon, Clock, MapPin, DollarSign, ArrowLeft, ArrowRight, Check, Globe } from "lucide-react";
import { format, addMinutes, isSameDay, startOfDay, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import PaymentStep from "@/components/booking/PaymentStep";

type Step = "events" | "datetime" | "form" | "payment" | "confirmed";

export default function BookingPage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfileByUsername(username);
  const { data: eventTypes } = usePublicEventTypes(profile?.user_id);
  const { data: availability } = usePublicAvailability(profile?.user_id);
  const { data: overrides } = usePublicOverrides(profile?.user_id);
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("events");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string>();

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;
  const { data: existingBookings } = useExistingBookings(profile?.user_id, dateStr);

  // Compute available time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !availability || !selectedEvent) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const daySlots = availability.filter((a: any) => a.day_of_week === dayOfWeek);
    if (daySlots.length === 0) return [];

    // Check if date is blocked
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
        // Skip past times
        if (current > now) {
          const timeStr = format(current, "HH:mm");
          const slotEnd = addMinutes(current, duration);
          
          // Check against existing bookings
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

    return slots;
  }, [selectedDate, availability, overrides, selectedEvent, existingBookings]);

  // Determine which dates are available
  const isDateAvailable = (date: Date) => {
    if (date < startOfDay(new Date())) return false;
    if (date > addDays(new Date(), 60)) return false;
    
    const dayOfWeek = date.getDay();
    const hasDaySlot = availability?.some((a: any) => a.day_of_week === dayOfWeek);
    if (!hasDaySlot) return false;

    const dateString = format(date, "yyyy-MM-dd");
    const override = overrides?.find((o: any) => o.date === dateString);
    if (override?.is_blocked) return false;

    return true;
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
    if (!selectedDate || !selectedTime || !selectedEvent || !guestName || !guestEmail) return;

    setSubmitting(true);
    const [h, m] = selectedTime.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);
    const endTime = addMinutes(startTime, selectedEvent.duration);

    const isPaid = (selectedEvent.price_cents || 0) > 0;

    try {
      const { data, error } = await supabase.from("bookings").insert({
        event_type_id: selectedEvent.id,
        host_user_id: profile!.user_id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_notes: guestNotes || null,
        guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
        payment_status: isPaid ? "paid_placeholder" : "none",
        payment_amount_cents: selectedEvent.price_cents || 0,
      }).select().single();

      if (error) throw error;
      setBookingId(data.id);
      setStep("confirmed");

      // Send confirmation email (fire-and-forget)
      sendBookingEmail("confirmation", {
        id: data.id,
        guest_name: guestName,
        guest_email: guestEmail,
        host_name: profile!.full_name || profile!.username || "",
        event_title: selectedEvent.title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: selectedEvent.duration,
        location_type: selectedEvent.location_type,
        guest_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-2">Page not found</h2>
            <p className="text-muted-foreground mb-6">This booking page doesn't exist.</p>
            <Button asChild><Link to="/">Go home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-14 items-center gap-2">
          <CalIcon className="h-5 w-5 text-primary" />
          <span className="font-bold font-['Space_Grotesk']">Schedulo</span>
        </div>
      </header>

      <main className="container max-w-4xl py-8 px-4">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mx-auto mb-3">
            {profile.full_name?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">{profile.full_name || profile.username}</h1>
          {profile.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Event types */}
          {step === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold font-['Space_Grotesk'] text-center">Select a meeting type</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {eventTypes?.map((e: any) => (
                  <Card
                    key={e.id}
                    className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                    onClick={() => handleSelectEvent(e)}
                  >
                    <div className="h-1.5" style={{ backgroundColor: e.color }} />
                    <CardContent className="p-5">
                      <h3 className="font-semibold font-['Space_Grotesk'] mb-1">{e.title}</h3>
                      {e.description && <p className="text-sm text-muted-foreground mb-3">{e.description}</p>}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.duration} min</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location_type === "video" ? "Video" : e.location_type === "phone" ? "Phone" : "In person"}</span>
                        {(e.price_cents || 0) > 0 && (
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ${(e.price_cents / 100).toFixed(2)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {eventTypes?.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">
                    No event types available.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & time */}
          {step === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => { setStep("events"); setSelectedDate(undefined); setSelectedTime(undefined); }}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              
              <Card className="p-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedEvent?.color }} />
                    <h3 className="font-semibold font-['Space_Grotesk']">{selectedEvent?.title}</h3>
                    <span className="text-sm text-muted-foreground">· {selectedEvent?.duration} min</span>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Calendar */}
                    <div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => { setSelectedDate(d); setSelectedTime(undefined); }}
                        disabled={(date) => !isDateAvailable(date)}
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 px-3">
                        <Globe className="h-3 w-3" />
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="flex-1 min-w-0">
                      {selectedDate ? (
                        <>
                          <h4 className="text-sm font-medium mb-3">{format(selectedDate, "EEEE, MMMM d")}</h4>
                          {timeSlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No available times on this day.</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto">
                              {timeSlots.map((t) => (
                                <Button
                                  key={t}
                                  variant={selectedTime === t ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleSelectTime(t)}
                                  className="text-sm"
                                >
                                  {formatTimeDisplay(t)}
                                </Button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Select a date to see available times.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Booking form */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-lg mx-auto"
            >
              <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => setStep("datetime")}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedEvent?.color }} />
                      <h3 className="font-semibold font-['Space_Grotesk']">{selectedEvent?.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} · {selectedTime && formatTimeDisplay(selectedTime)} · {selectedEvent?.duration} min
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your name *</Label>
                      <Input id="name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Jane Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Your email *</Label>
                      <Input id="email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="jane@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea id="notes" value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} placeholder="Anything you'd like to share ahead of the meeting" rows={3} />
                    </div>
                  </div>

                  {(selectedEvent?.price_cents || 0) > 0 && (
                    <div className="rounded-lg bg-muted p-3 flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span>This meeting costs <strong>${(selectedEvent.price_cents / 100).toFixed(2)}</strong>. Payment will be collected after confirmation.</span>
                    </div>
                  )}

                  <Button onClick={handleProceedToPaymentOrBook} className="w-full gap-2" size="lg" disabled={!guestName || !guestEmail || submitting}>
                    {submitting ? "Booking…" : (selectedEvent?.price_cents || 0) > 0 ? "Continue to payment" : "Confirm booking"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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
              className="max-w-md mx-auto text-center"
            >
              <Card>
                <CardContent className="py-12 px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground mx-auto mb-6">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-2">You're booked!</h2>
                  <p className="text-muted-foreground mb-6">
                    A confirmation has been sent to <strong>{guestEmail}</strong>.
                  </p>
                  <div className="rounded-lg border p-4 text-left space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedEvent?.color }} />
                      <span className="font-medium">{selectedEvent?.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTime && formatTimeDisplay(selectedTime)} · {selectedEvent?.duration} min
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with {profile?.full_name || profile?.username}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/${username}`}>Book another</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
