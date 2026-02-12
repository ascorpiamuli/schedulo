import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, Clock, Plus, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useBookings, Booking } from "@/hooks/use-bookings";
import CalendarView from "@/components/dashboard/CalendarView";
import { format, isThisWeek } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: upcoming } = useBookings("upcoming");
  const { data: past } = useBookings("past");

  const allConfirmed = useMemo(() => [...(upcoming || []), ...(past || [])], [upcoming, past]);

  const thisWeekCount = useMemo(
    () => upcoming?.filter((b) => isThisWeek(new Date(b.start_time))).length || 0,
    [upcoming]
  );

  const stats = [
    { label: "This week", value: String(thisWeekCount), icon: Calendar, color: "text-primary" },
    { label: "Upcoming", value: String(upcoming?.length || 0), icon: Clock, color: "text-accent" },
    { label: "Total bookings", value: String(allConfirmed.length), icon: CalendarDays, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-1">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your schedule.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-['Space_Grotesk']">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
        <Card>
          <CardHeader><CardTitle className="font-['Space_Grotesk']">Quick actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild className="gap-2"><Link to="/dashboard/events"><Plus className="h-4 w-4" />Create event type</Link></Button>
            <Button asChild variant="outline" className="gap-2"><Link to="/dashboard/availability"><Clock className="h-4 w-4" />Set availability</Link></Button>
            <Button asChild variant="outline" className="gap-2"><Link to="/dashboard/bookings"><ArrowUpRight className="h-4 w-4" />View bookings</Link></Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar view */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
        <CalendarView bookings={allConfirmed} />
      </motion.div>

      {/* Upcoming bookings list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.55 }}>
        <Card>
          <CardHeader><CardTitle className="font-['Space_Grotesk']">Upcoming bookings</CardTitle></CardHeader>
          <CardContent>
            {!upcoming || upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No upcoming bookings yet.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Create an event type and share your link to start receiving bookings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: b.event_types?.color || "#7C3AED" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.event_types?.title} — {b.guest_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(b.start_time), "EEE, MMM d · h:mm a")} · {b.event_types?.duration || 30} min
                      </p>
                    </div>
                  </div>
                ))}
                {upcoming.length > 5 && (
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link to="/dashboard/bookings">View all {upcoming.length} bookings</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
