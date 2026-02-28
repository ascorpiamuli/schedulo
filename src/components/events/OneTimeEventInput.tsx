import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface OneTimeEventData {
  date: string;
  start_time: string;
  end_time: string;
}

interface OneTimeEventInputProps {
  value: OneTimeEventData | null;
  onChange: (data: OneTimeEventData | null) => void;
}

export function OneTimeEventInput({ value, onChange }: OneTimeEventInputProps) {
  const [date, setDate] = useState<string>(value?.date || format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState<string>(value?.start_time || "09:00");
  const [endTime, setEndTime] = useState<string>(value?.end_time || "10:00");
  const { toast } = useToast();

  const calculateDuration = () => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    return endTotal - startTotal;
  };

  const handleUpdate = () => {
    if (startTime >= endTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    const selectedDate = new Date(`${date}T${startTime}`);
    if (selectedDate < new Date()) {
      toast({
        title: "Invalid date",
        description: "Event date cannot be in the past",
        variant: "destructive"
      });
      return;
    }

    onChange({
      date,
      start_time: startTime,
      end_time: endTime
    });
  };

  useEffect(() => {
    if (date && startTime && endTime) {
      handleUpdate();
    }
  }, [date, startTime, endTime]);

  const duration = calculateDuration();

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <CalendarCheck2 className="h-4 w-4 text-purple-600" />
        <Label className="text-sm font-medium text-purple-900">One-Time Event Details</Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Start Time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">End Time</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Duration</Label>
          <div className="h-9 px-3 bg-white rounded-md border flex items-center text-sm">
            {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        </div>
      </div>

      {date && startTime && endTime && (
        <div className="mt-2 p-2 bg-purple-100/50 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700">
            <strong>📅 Event scheduled for:</strong>{" "}
            {new Date(`${date}T${startTime}`).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}{" "}
            from {startTime} to {endTime}
          </p>
          <p className="text-[10px] text-purple-600 mt-1">
            Guests can book this specific time slot. No other times will be available.
          </p>
        </div>
      )}
    </div>
  );
}