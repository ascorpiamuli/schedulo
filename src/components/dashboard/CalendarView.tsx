import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Booking } from "@/hooks/use-bookings";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarViewProps {
  bookings: Booking[];
}

export default function CalendarView({ bookings }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = getDay(days[0]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const key = format(new Date(b.start_time), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [bookings]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-['Space_Grotesk']">Calendar</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Empty offset cells */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-background min-h-[72px] p-1" />
          ))}

          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDay.get(key) || [];
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  "bg-background min-h-[72px] p-1 transition-colors",
                  today && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    today && "bg-primary text-primary-foreground font-bold"
                  )}
                >
                  {format(day, "d")}
                </span>

                <div className="mt-0.5 space-y-0.5">
                  {dayBookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className="text-[10px] leading-tight truncate rounded px-1 py-0.5"
                      style={{
                        backgroundColor: (b.event_types?.color || "#7C3AED") + "20",
                        color: b.event_types?.color || "#7C3AED",
                      }}
                      title={`${b.event_types?.title} – ${b.guest_name}`}
                    >
                      {format(new Date(b.start_time), "h:mma")}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <span className="text-[10px] text-muted-foreground px-1">+{dayBookings.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
