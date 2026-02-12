import { useState } from "react";
import { sendBookingEmail } from "@/lib/emails";
import { motion } from "framer-motion";
import { useBookings, useCancelBooking, Booking } from "@/hooks/use-bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Mail, User, MapPin, Search, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";

function formatTime12(iso: string) {
  return format(new Date(iso), "h:mm a");
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (b: Booking) => void }) {
  const event = booking.event_types;
  return (
    <Card className="overflow-hidden">
      <div className="h-1" style={{ backgroundColor: event?.color || "#7C3AED" }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-semibold font-['Space_Grotesk'] truncate">{event?.title || "Meeting"}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(booking.start_time), "EEE, MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime12(booking.start_time)} – {formatTime12(booking.end_time)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event?.location_type === "video" ? "Video" : event?.location_type === "phone" ? "Phone" : "In person"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> {booking.guest_name}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {booking.guest_email}
              </span>
            </div>
            {booking.guest_notes && (
              <div className="flex items-start gap-1 text-sm text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{booking.guest_notes}</span>
              </div>
            )}
          </div>
          {booking.status === "confirmed" && (
            <Button variant="outline" size="sm" className="shrink-0 gap-1 text-destructive hover:text-destructive" onClick={() => onCancel(booking)}>
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          )}
          {booking.status === "cancelled" && (
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">Cancelled</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Bookings() {
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [search, setSearch] = useState("");
  const { data: bookings, isLoading } = useBookings(tab);
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);

  const filtered = bookings?.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.guest_name.toLowerCase().includes(q) ||
      b.guest_email.toLowerCase().includes(q) ||
      b.event_types?.title?.toLowerCase().includes(q)
    );
  });

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelMutation.mutateAsync(cancelDialog.id);
      toast({ title: "Booking cancelled" });

      // Send cancellation email (fire-and-forget)
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
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-['Space_Grotesk']">Bookings</h1>
        <p className="text-muted-foreground mt-1">View and manage all your bookings.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24" /></Card>
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                {tab === "upcoming" ? "No upcoming bookings" : tab === "past" ? "No past bookings" : "No cancelled bookings"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {tab === "upcoming" ? "Share your booking link to start receiving bookings." : "Bookings will appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <BookingCard booking={b} onCancel={setCancelDialog} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(o) => !o && setCancelDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-['Space_Grotesk']">Cancel booking?</DialogTitle>
            <DialogDescription>
              This will cancel the booking with <strong>{cancelDialog?.guest_name}</strong> on{" "}
              {cancelDialog && format(new Date(cancelDialog.start_time), "MMM d 'at' h:mm a")}.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending} className="flex-1">
              {cancelMutation.isPending ? "Cancelling…" : "Yes, cancel"}
            </Button>
            <Button variant="outline" onClick={() => setCancelDialog(null)} className="flex-1">Keep</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
